// =============================================================================
// LEVANTE 13: A VIRADA — Motor Principal do Jogo (Game Loop e Máquina de Estados)
// Arquivo: js/game.js
// =============================================================================

class MotorLevante13 {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.cw = 360;
        this.ch = 640;
        this.canvas.width = this.cw;
        this.canvas.height = this.ch;

        // Estados do Jogo: 'INICIO', 'HOLOTRANSMISSAO', 'JOGANDO', 'CHEFE', 'VITORIA_FASE', 'FIM_DE_JOGO'
        this.estado = 'INICIO';

        // Entidades e Listas
        this.jogador = new Jogador(this.cw, this.ch);
        this.tirosAmigos = [];
        this.tirosInimigos = [];
        this.inimigos = [];
        this.itens = [];
        this.particulas = [];
        this.chefe = null;

        // Fases e Níveis Dinâmicos
        this.fases = [];
        this.indiceFaseAtual = 0;
        this.dadosFaseAtual = null;
        this.imagemFundo = null;
        this.spriteInimigo = null;
        this.imagemMentor = null;

        // Sistema de Grade de Inimigos e Âncoras de Movimentação
        this.gradeX = 0;
        this.gradeY = 0;
        this.gradeDirecao = 1; // 1 = direita, -1 = esquerda
        this.gradeVelocidadeX = 0.65;
        this.gradePassoY = 4.0;
        this.temporizadorAnimacao = 0;

        // Temporizador de Fase (duração em torno de 3 minutos = 180s)
        this.tempoFaseRestante = 180;
        this.temporizadorSegundo = 0;

        // Pontuação e Progresso
        this.pontos = 0;
        this.combo = 1;
        this.tempoMantoLentidao = 0;
        this.shakeTela = 0;

        // Controles de Entrada
        this.teclas = {};
        this.touchX = null;
        this.disparoAutomaticoMobile = true;

        // Partida no servidor (antitrapaça): token de uso único e registro de abates por fase
        this.fasesCarregadas = false;
        this.tokenPartida = null;
        this.promessaToken = null;
        this.registro = [];

        // Sistema de Diálogos / Holotransmissão
        this.dialogoIndice = 0;
        this.textoAtualExibido = '';
        this.caractereIndice = 0;
        this.temporizadorTeletipo = 0;

        this.configurarEventos();
        this.carregarFasesDoServidor();
    }

    /**
     * Configura listeners de teclado, mouse e toque mobile.
     */
    configurarEventos() {
        window.addEventListener('keydown', (e) => {
            // Previne a rolagem padrão da página ao pressionar a barra de espaço
            if (e.code === 'Space') {
                e.preventDefault();
            }

            this.teclas[e.code] = true;
            audio.iniciar();

            // 1. Iniciar partida a partir da tela inicial via teclado
            if ((e.code === 'Space' || e.code === 'Enter') && this.estado === 'INICIO') {
                this.iniciarPartida();
                return;
            }

            // 2. Avanço de diálogos na Holotransmissão via teclado
            if ((e.code === 'Space' || e.code === 'Enter') && this.estado === 'HOLOTRANSMISSAO') {
                this.avancarHolotransmissao();
                return;
            }

            // 3. Reiniciar partida se estiver em tela de fim de jogo e não estiver digitando a tag
            if ((e.code === 'Space' || e.code === 'Enter') && this.estado === 'FIM_DE_JOGO') {
                const inputNome = document.getElementById('inputPlayerName');
                if (document.activeElement !== inputNome) {
                    this.iniciarPartida();
                    return;
                }
            }
        });

        window.addEventListener('keyup', (e) => {
            this.teclas[e.code] = false;
        });

        // Suporte a clique de mouse no Desktop
        this.canvas.addEventListener('click', () => {
            audio.iniciar();
            if (this.estado === 'INICIO') {
                this.iniciarPartida();
            }
        });

        const holoOverlay = document.getElementById('holoOverlay');
        if (holoOverlay) {
            holoOverlay.addEventListener('click', () => {
                audio.iniciar();
                if (this.estado === 'HOLOTRANSMISSAO') {
                    this.avancarHolotransmissao();
                }
            });
        }

        // Controles de Touch Mobile na área do Canvas
        const atualizarTouch = (e) => {
            if (e.touches && e.touches.length > 0) {
                const rect = this.canvas.getBoundingClientRect();
                const escalaX = this.cw / rect.width;
                this.touchX = (e.touches[0].clientX - rect.left) * escalaX;
                audio.iniciar();
            }
        };

        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            atualizarTouch(e);
            if (this.estado === 'HOLOTRANSMISSAO') {
                this.avancarHolotransmissao();
            } else if (this.estado === 'INICIO') {
                this.iniciarPartida();
            }
        }, { passive: false });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            atualizarTouch(e);
        }, { passive: false });

        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.touchX = null;
        }, { passive: false });
    }

    /**
     * Consome dinamicamente a API de fases do backend.
     */
    async carregarFasesDoServidor() {
        try {
            const resposta = await fetch('api/levels.php');
            const json = await resposta.json();

            if (json.sucesso && json.fases && json.fases.length > 0) {
                this.fases = json.fases;
            } else {
                console.warn('Nenhuma fase retornada pelo servidor. Usando dados locais.');
                this.fases = [this.obterFaseFallback()];
            }
        } catch (erro) {
            console.error('Falha ao conectar com api/levels.php:', erro);
            this.fases = [this.obterFaseFallback()];
        }
        this.fasesCarregadas = true;
    }

    /**
     * Abre a partida no servidor. O token é exigido para registrar o recorde.
     * Roda em paralelo: o jogo começa na hora, mesmo que a rede esteja lenta.
     */
    abrirPartidaNoServidor() {
        this.tokenPartida = null;
        this.promessaToken = fetch('api/start.php', { method: 'POST' })
            .then((r) => r.json())
            .then((json) => {
                if (json.sucesso && json.token) this.tokenPartida = json.token;
                return this.tokenPartida;
            })
            .catch(() => null);
    }

    /**
     * Conta um abate no registro da fase atual (o servidor recalcula a pontuação a partir disto).
     */
    registrarAbate(idTipo) {
        const atual = this.registro[this.registro.length - 1];
        if (!atual) return;
        atual.abates[idTipo] = (atual.abates[idTipo] || 0) + 1;
    }

    /**
     * Reseta completamente todas as entidades e a tela ao reiniciar a partida.
     * Evita que a tela fique congelada no último estado de derrota.
     */
    resetarJogo() {
        this.pontos = 0;
        this.combo = 1;
        this.shakeTela = 0;
        this.tempoMantoLentidao = 0;
        this.tirosAmigos = [];
        this.tirosInimigos = [];
        this.inimigos = [];
        this.itens = [];
        this.particulas = [];
        this.chefe = null;
        this.jogador = new Jogador(this.cw, this.ch);
        this.gradeX = 0;
        this.gradeY = 0;
        this.gradeDirecao = 1;
        this.temporizadorAnimacao = 0;
        this.temporizadorSegundo = 0;
        this.tempoFaseRestante = 180;
        this.indiceFaseAtual = 0;
        this.registro = [];

        // Limpa a tela imediatamente com o fundo escuro do espaço
        this.ctx.fillStyle = '#070b19';
        this.ctx.fillRect(0, 0, this.cw, this.ch);

        // Fecha modais de fim de jogo e ranking
        const modalGameOver = document.getElementById('gameOverModal');
        if (modalGameOver) modalGameOver.style.display = 'none';

        const modalRanking = document.getElementById('leaderboardModal');
        if (modalRanking) modalRanking.style.display = 'none';

        // Reseta formulário de recorde
        const formScore = document.getElementById('formSalvarScore');
        const btnSalvar = document.getElementById('btnSalvarScore');
        const btnWhatsApp = document.getElementById('btnWhatsAppShare');
        if (formScore) formScore.style.display = 'block';
        if (btnSalvar) {
            btnSalvar.disabled = false;
            btnSalvar.textContent = '💾 REGISTRAR RECORDE';
        }
        if (btnWhatsApp) btnWhatsApp.style.display = 'none';
    }

    iniciarPartida() {
        // Evita começar antes de as fases chegarem do servidor (senão a campanha "termina" na hora)
        if (!this.fasesCarregadas) return;
        audio.iniciar();
        this.resetarJogo();
        this.abrirPartidaNoServidor();
        this.iniciarFase(0);
    }

    /**
     * Prepara e inicia a fase atual com Holotransmissão do mentor e limpeza de entidades.
     */
    iniciarFase(indice) {
        if (indice >= this.fases.length) {
            // Vitória total da campanha
            this.exibirFimDeJogo(true);
            return;
        }

        this.dadosFaseAtual = this.fases[indice];
        this.registro.push({ pasta: this.dadosFaseAtual.pasta, abates: {}, chefe: false });

        // Limpa imediatamente todas as entidades e tiros do setor anterior
        this.inimigos = [];
        this.tirosAmigos = [];
        this.tirosInimigos = [];
        this.itens = [];
        this.particulas = [];
        this.chefe = null;

        // Reseta posição de âncora da grade e temporizadores
        this.gradeX = 0;
        this.gradeY = 0;
        this.gradeDirecao = 1;
        this.gradePassoY = (this.dadosFaseAtual.grade && this.dadosFaseAtual.grade.stepY) ? this.dadosFaseAtual.grade.stepY : 4.0;
        this.gradeVelocidadeX = (this.dadosFaseAtual.grade && this.dadosFaseAtual.grade.initialSpeed) ? this.dadosFaseAtual.grade.initialSpeed : 0.65;
        this.tempoFaseRestante = (this.dadosFaseAtual.grade && this.dadosFaseAtual.grade.duration) ? this.dadosFaseAtual.grade.duration : 180;
        this.temporizadorSegundo = 0;
        this.temporizadorAnimacao = 0;

        // Pré-carrega assets visuais da fase
        this.imagemFundo = new Image();
        this.imagemFundo.src = this.dadosFaseAtual.assets.fundo;

        this.spriteInimigo = new Image();
        this.spriteInimigo.src = this.dadosFaseAtual.assets.inimigo;

        // Configura a Holotransmissão
        this.estado = 'HOLOTRANSMISSAO';
        this.dialogoIndice = 0;
        this.prepararLinhaDialogo();

        // Atualiza interface do DOM
        this.atualizarInterfaceHolotransmissao();
        this.atualizarHUD();
    }

    prepararLinhaDialogo() {
        const dialogos = this.dadosFaseAtual.holotransmissao.dialogo;
        this.textoCompleto = dialogos[this.dialogoIndice] || '';
        this.textoAtualExibido = '';
        this.caractereIndice = 0;
    }

    avancarHolotransmissao() {
        const dialogos = this.dadosFaseAtual.holotransmissao.dialogo;

        // Se ainda estiver digitando, completa a frase imediatamente
        if (this.caractereIndice < this.textoCompleto.length) {
            this.textoAtualExibido = this.textoCompleto;
            this.caractereIndice = this.textoCompleto.length;
            this.renderizarTextoHolotransmissao();
            return;
        }

        this.dialogoIndice++;
        if (this.dialogoIndice < dialogos.length) {
            this.prepararLinhaDialogo();
        } else {
            // Fim dos diálogos: inicia combate espacial
            this.fecharHolotransmissao();
            this.montarGradeInimigos();
            this.estado = 'JOGANDO';
        }
    }

    atualizarInterfaceHolotransmissao() {
        const overlay = document.getElementById('holoOverlay');
        const nomeMentor = document.getElementById('holoMentorNome');
        const cargoMentor = document.getElementById('holoMentorCargo');
        const avatarMentor = document.getElementById('holoMentorAvatar');

        if (overlay) overlay.style.display = 'flex';
        if (nomeMentor) nomeMentor.textContent = this.dadosFaseAtual.holotransmissao.mentor;
        if (cargoMentor) cargoMentor.textContent = this.dadosFaseAtual.holotransmissao.cargo;
        if (avatarMentor) avatarMentor.src = this.dadosFaseAtual.holotransmissao.avatar;
    }

    renderizarTextoHolotransmissao() {
        const elementoTexto = document.getElementById('holoTexto');
        if (elementoTexto) {
            elementoTexto.textContent = this.textoAtualExibido;
        }
    }

    fecharHolotransmissao() {
        const overlay = document.getElementById('holoOverlay');
        if (overlay) overlay.style.display = 'none';
    }

    /**
     * Monta o esquadrão em bloco de acordo com a configuração da fase,
     * passando linha e coluna para controle dos padrões procedurais.
     */
    montarGradeInimigos() {
        this.inimigos = [];
        const grade = this.dadosFaseAtual.grade;
        const tipos = this.dadosFaseAtual.inimigos;
        const espacoX = grade.spacingX || 42;
        const espacoY = grade.spacingY || 36;
        const offsetTopo = 55;
        const offsetEsquerda = (this.cw - (grade.cols * espacoX)) / 2 + 6;

        this.gradeX = 0;
        this.gradeY = 0;
        this.gradeDirecao = 1;
        this.gradeVelocidadeX = grade.initialSpeed || 0.65;
        this.gradePassoY = grade.stepY || 4.0;
        this.temporizadorAnimacao = 0;

        for (let r = 0; r < grade.rows; r++) {
            // Seleciona o tipo de inimigo pela linha
            const configTipo = tipos[r % tipos.length];

            for (let c = 0; c < grade.cols; c++) {
                const posX = offsetEsquerda + c * espacoX;
                const posY = offsetTopo + r * espacoY;
                this.inimigos.push(new Inimigo(posX, posY, configTipo, this.spriteInimigo, r, c));
            }
        }
    }

    /**
     * Ciclo de Atualização da Lógica do Jogo (Update)
     */
    atualizar() {
        // Reduz efeito de tremor de tela
        if (this.shakeTela > 0) this.shakeTela--;

        // Atualização da digitação teletipo na Holotransmissão
        if (this.estado === 'HOLOTRANSMISSAO') {
            if (this.caractereIndice < this.textoCompleto.length) {
                this.temporizadorTeletipo++;
                if (this.temporizadorTeletipo >= 2) {
                    this.temporizadorTeletipo = 0;
                    this.textoAtualExibido += this.textoCompleto[this.caractereIndice];
                    this.caractereIndice++;
                    audio.tocarTeletipo();
                    this.renderizarTextoHolotransmissao();
                }
            }
            return;
        }

        if (this.estado !== 'JOGANDO' && this.estado !== 'CHEFE') return;

        // Gerenciamento do cronômetro de 3 minutos (~180s) por fase com derrota por time-out
        this.temporizadorSegundo++;
        if (this.temporizadorSegundo >= 60) {
            this.temporizadorSegundo = 0;
            if (this.tempoFaseRestante > 0) {
                this.tempoFaseRestante--;
                // A cada 30 segundos, leve aceleração de urgência
                if (this.tempoFaseRestante % 30 === 0 && this.tempoFaseRestante > 0) {
                    this.gradeVelocidadeX *= 1.05;
                }
                if (this.tempoFaseRestante <= 0) {
                    this.exibirFimDeJogo(false, 'TEMPO ESGOTADO!');
                    return;
                }
            }
        }

        // Atualiza a nave do jogador
        this.jogador.atualizar(this.teclas, this.touchX);

        // Disparo automático ou por barra de espaço
        const querAtirar = this.teclas['Space'] || (this.touchX !== null && this.disparoAutomaticoMobile);
        if (querAtirar && this.jogador.podeAtirar()) {
            const novosTiros = this.jogador.disparar();
            this.tirosAmigos.push(...novosTiros);
        }

        // Atualiza tiros amigos
        for (let i = this.tirosAmigos.length - 1; i >= 0; i--) {
            const t = this.tirosAmigos[i];
            t.atualizar();
            if (t.y < -30) this.tirosAmigos.splice(i, 1);
        }

        // Atualiza tiros inimigos
        for (let i = this.tirosInimigos.length - 1; i >= 0; i--) {
            const t = this.tirosInimigos[i];
            t.atualizar();

            // Colisão com o jogador
            if (this.verificarColisao(t, this.jogador)) {
                this.tirosInimigos.splice(i, 1);
                this.shakeTela = 12;
                if (this.jogador.receberDano()) {
                    if (this.jogador.vidas <= 0) {
                        this.exibirFimDeJogo(false, 'ABATIDO EM COMBATE');
                        return;
                    }
                }
            } else if (t.y > this.ch + 20) {
                this.tirosInimigos.splice(i, 1);
            }
        }

        // Atualiza itens especiais em queda
        for (let i = this.itens.length - 1; i >= 0; i--) {
            const item = this.itens[i];
            item.atualizar();

            if (this.verificarColisao(item, this.jogador)) {
                this.coletarItemEspecial(item);
                this.itens.splice(i, 1);
            } else if (item.y > this.ch + 30) {
                this.itens.splice(i, 1);
            }
        }

        // Efeito de lentidão temporária (Manto da Diversidade)
        const fatorVelocidade = (this.tempoMantoLentidao > 0) ? 0.5 : 1.0;
        if (this.tempoMantoLentidao > 0) this.tempoMantoLentidao--;

        // Atualiza movimentação da grade de inimigos com padrões da fase
        this.atualizarGradeInimigos(fatorVelocidade);

        // Atualiza Chefe se estiver em combate
        if (this.chefe) {
            this.chefe.atualizar();
            if (this.chefe.podeDisparar()) {
                const tirosChefe = this.chefe.disparar();
                this.tirosInimigos.push(...tirosChefe);
            }

            // Colisão dos tiros amigos com o Chefe
            for (let i = this.tirosAmigos.length - 1; i >= 0; i--) {
                const t = this.tirosAmigos[i];
                if (this.verificarColisao(t, this.chefe)) {
                    if (!t.perfurante) this.tirosAmigos.splice(i, 1);
                    this.chefe.hp--;
                    this.gerarParticulas(t.x, t.y, '#facc15', 3);

                    if (this.chefe.hp <= 0) {
                        this.derrotarChefe();
                        break;
                    }
                }
            }
        }

        // Colisão dos tiros amigos com os inimigos da grade
        this.processarColisoesInimigos();

        // Atualiza partículas de explosão
        for (let i = this.particulas.length - 1; i >= 0; i--) {
            const p = this.particulas[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vida--;
            if (p.vida <= 0) this.particulas.splice(i, 1);
        }

        // Atualiza painel HUD em tempo real
        this.atualizarHUD();
    }

    /**
     * Calcula o deslocamento procedural (x, y) de acordo com o padrão de movimento da fase:
     * - classic: avanço linear limpo e cadenciado
     * - zigzag: onda senoidal serpenteante horizontal e vertical
     * - orbit: trajetórias circulares e elípticas contínuas em esquadrilha
     * - advance_retreat: recuo tático lento e súbita investida veloz intimidadora
     * - pincer: pinça lateral expansiva ondulante
     * - chaos: combinação de todos os padrões por linha (Fase 6)
     */
    calcularOffsetInimigo(inimigo, padrao, tempo, totalCols, totalRows) {
        switch (padrao) {
            case 'zigzag': {
                const ox = Math.sin(tempo * 0.055 + inimigo.linha * 0.9) * 16;
                const oy = Math.cos(tempo * 0.055 + inimigo.coluna * 0.5) * 6;
                return { x: ox, y: oy };
            }
            case 'orbit': {
                const fase = inimigo.coluna * 0.75 + inimigo.linha * 1.25;
                const ox = Math.cos(tempo * 0.045 + fase) * 15;
                const oy = Math.sin(tempo * 0.045 + fase) * 10;
                return { x: ox, y: oy };
            }
            case 'advance_retreat': {
                const ciclo = tempo % 240;
                let oy = 0;
                if (ciclo < 90) {
                    oy = -16 * (ciclo / 90); // Recuo lento
                } else if (ciclo < 140) {
                    const tAvanco = (ciclo - 90) / 50;
                    oy = -16 + 54 * tAvanco; // Investida rápida
                } else {
                    const tRetorno = (ciclo - 140) / 100;
                    oy = 38 * (1 - tRetorno); // Retorno suave à formação
                }
                const ox = Math.sin(tempo * 0.07 + inimigo.coluna * 0.4) * 8;
                return { x: ox, y: oy };
            }
            case 'pincer': {
                const centroCol = (totalCols - 1) / 2;
                const distCentro = inimigo.coluna - centroCol;
                const ox = distCentro * (Math.sin(tempo * 0.05) * 3.5);
                const oy = Math.abs(distCentro) * (Math.cos(tempo * 0.05) * 5) + Math.sin(tempo * 0.07 + inimigo.linha * 0.8) * 8;
                return { x: ox, y: oy };
            }
            case 'chaos': {
                // Na batalha final da Esplanada: mistura de todos os padrões distribuídos por linha!
                const padroesLinhas = ['advance_retreat', 'orbit', 'zigzag', 'pincer', 'orbit', 'zigzag'];
                const padraoLinha = padroesLinhas[inimigo.linha % padroesLinhas.length] || 'classic';
                return this.calcularOffsetInimigo(inimigo, padraoLinha, tempo, totalCols, totalRows);
            }
            case 'classic':
            default:
                return { x: 0, y: 0 };
        }
    }

    /**
     * Atualização do movimento em bloco dos esquadrões invasores com velocidade balanceada,
     * descida suave e padrões procedurais dinâmicos.
     */
    atualizarGradeInimigos(fatorVelocidade) {
        this.temporizadorAnimacao++;
        const velAtual = this.gradeVelocidadeX * fatorVelocidade;
        this.gradeX += velAtual * this.gradeDirecao;

        let tocarParede = false;
        const padrao = (this.dadosFaseAtual.grade && this.dadosFaseAtual.grade.pattern) ? this.dadosFaseAtual.grade.pattern : 'classic';
        const totalCols = (this.dadosFaseAtual.grade && this.dadosFaseAtual.grade.cols) ? this.dadosFaseAtual.grade.cols : 8;
        const totalRows = (this.dadosFaseAtual.grade && this.dadosFaseAtual.grade.rows) ? this.dadosFaseAtual.grade.rows : 4;

        for (const inimigo of this.inimigos) {
            if (inimigo.emMergulho) {
                inimigo.atualizarMergulho();
            } else {
                const offset = this.calcularOffsetInimigo(inimigo, padrao, this.temporizadorAnimacao, totalCols, totalRows);
                inimigo.offsetX = offset.x;
                inimigo.offsetY = offset.y;

                inimigo.x = inimigo.baseX + this.gradeX + inimigo.offsetX;
                inimigo.y = inimigo.baseY + this.gradeY + inimigo.offsetY;

                // Checa limites de tela na direção do movimento atual
                if (this.gradeDirecao === 1 && (inimigo.x + inimigo.largura >= this.cw - 6)) {
                    tocarParede = true;
                } else if (this.gradeDirecao === -1 && (inimigo.x <= 6)) {
                    tocarParede = true;
                }

                // Condição de derrota caso os invasores alcancem o chão/jogador
                if (inimigo.y + inimigo.altura >= this.jogador.y) {
                    this.exibirFimDeJogo(false, 'LINHA DEFENSIVA ROMPIDA!');
                    return;
                }
            }

            // Invasores aleatórios disparam contra o jogador
            if (Math.random() < 0.0016 * fatorVelocidade) {
                this.tirosInimigos.push(new Projetil(
                    inimigo.x + inimigo.largura / 2 - 2,
                    inimigo.y + inimigo.altura,
                    (Math.random() - 0.5) * 0.8,
                    3.2,
                    'inimigo',
                    '#ef4444',
                    false,
                    true
                ));
            }

            // Chance de mergulho rasante tático
            const diveChance = (this.dadosFaseAtual.grade && this.dadosFaseAtual.grade.diveChance) ? this.dadosFaseAtual.grade.diveChance : 0.05;
            if (!inimigo.emMergulho && Math.random() < (diveChance * 0.0006 * fatorVelocidade)) {
                inimigo.iniciarMergulho(this.jogador.x);
            }
        }

        // Se a grade bater na borda da tela na direção do movimento, desce um passo suave e inverte
        if (tocarParede) {
            this.gradeDirecao *= -1;
            this.gradeY += this.gradePassoY;
        }

        // Se todos os soldados comuns forem derrotados, entra o Chefe
        if (this.inimigos.length === 0 && !this.chefe && this.estado === 'JOGANDO') {
            this.invocarChefe();
        }
    }

    /**
     * Processa colisão de tiros contra o esquadrão inimigo.
     */
    processarColisoesInimigos() {
        for (let ti = this.tirosAmigos.length - 1; ti >= 0; ti--) {
            const t = this.tirosAmigos[ti];

            for (let ei = this.inimigos.length - 1; ei >= 0; ei--) {
                const inimigo = this.inimigos[ei];

                if (this.verificarColisao(t, inimigo)) {
                    if (!t.perfurante) this.tirosAmigos.splice(ti, 1);
                    inimigo.hp--;
                    this.gerarParticulas(t.x, t.y, inimigo.cor, 4);

                    if (inimigo.hp <= 0) {
                        this.pontos += inimigo.pontos;
                        this.registrarAbate(inimigo.id);
                        audio.tocarExplosao();
                        this.gerarParticulas(inimigo.x + 14, inimigo.y + 12, inimigo.cor, 14);

                        // 8% de probabilidade de drop de artefato especial
                        if (Math.random() < 0.08) {
                            this.droparItemEspecial(inimigo.x, inimigo.y);
                        }

                        this.inimigos.splice(ei, 1);

                        // Aceleração progressiva conforme a grade diminui
                        const mult = this.dadosFaseAtual.grade.speedMultiplierPerKill || 1.015;
                        this.gradeVelocidadeX *= mult;
                    }
                    break;
                }
            }
        }
    }

    droparItemEspecial(x, y) {
        const tipos = ['livro', 'clt', 'megafone', 'manto', 'urna', 'sus'];
        // A Urna Eletrônica e Vacina são mais raras
        const rand = Math.random();
        let tipo = 'livro';
        if (rand < 0.25) tipo = 'livro';
        else if (rand < 0.50) tipo = 'clt';
        else if (rand < 0.72) tipo = 'megafone';
        else if (rand < 0.86) tipo = 'manto';
        else if (rand < 0.94) tipo = 'sus';
        else tipo = 'urna';

        this.itens.push(new ItemEspecial(x, y, tipo));
    }

    coletarItemEspecial(item) {
        switch (item.tipo) {
            case 'livro': // Tomo de Freire: Laser Perfurante contínuo
                this.jogador.tempoLaserPerfurante = 480; // 8 segundos
                audio.tocarPowerup();
                break;
            case 'clt': // Escudo Protetor da CLT
                this.jogador.escudos = Math.min(this.jogador.escudos + 2, 4);
                audio.tocarPowerup();
                break;
            case 'megafone': // Megafone Popular: Disparo Triplo em leque
                this.jogador.tempoTiroTriplo = 600; // 10 segundos
                audio.tocarPowerup();
                break;
            case 'manto': // Manto da Diversidade: Desacelera invasores
                this.tempoMantoLentidao = 480; // 8 segundos
                audio.tocarPowerup();
                break;
            case 'urna': // Urna Eletrônica Soberana: Screen Nuke com Pilili Confirma
                audio.tocarUrnaConfirma();
                this.shakeTela = 20;
                // Elimina todos os tiros inimigos e causa dano em massa
                this.tirosInimigos = [];
                for (const inimigo of this.inimigos) {
                    this.pontos += inimigo.pontos;
                    this.registrarAbate(inimigo.id);
                    this.gerarParticulas(inimigo.x + 14, inimigo.y + 12, '#22c55e', 10);
                }
                this.inimigos = [];
                if (this.chefe) this.chefe.hp -= 15;
                break;
            case 'sus': // Cápsula do SUS: +1 Vigor
                this.jogador.vidas = Math.min(this.jogador.vidas + 1, 4);
                audio.tocarPowerup();
                break;
        }
    }

    invocarChefe() {
        if (!this.dadosFaseAtual.chefe) {
            this.avancarParaProximaFase();
            return;
        }

        this.estado = 'CHEFE';
        this.chefe = new ChefeSetor(this.cw, this.dadosFaseAtual.chefe);
        this.shakeTela = 15;
    }

    derrotarChefe() {
        audio.tocarExplosao();
        this.pontos += this.chefe.pontos;
        if (this.registro.length) this.registro[this.registro.length - 1].chefe = true;
        this.gerarParticulas(this.chefe.x + 36, this.chefe.y + 24, '#facc15', 30);
        this.chefe = null;
        this.avancarParaProximaFase();
    }

    avancarParaProximaFase() {
        this.indiceFaseAtual++;
        if (this.indiceFaseAtual < this.fases.length) {
            this.iniciarFase(this.indiceFaseAtual);
        } else {
            this.exibirFimDeJogo(true);
        }
    }

    exibirFimDeJogo(vitoria, motivo = '') {
        this.estado = 'FIM_DE_JOGO';
        const modal = document.getElementById('gameOverModal');
        const titulo = document.getElementById('gameOverTitulo');
        const motivoEl = document.getElementById('gameOverMotivo');
        const pontosEl = document.getElementById('gameOverPontos');
        const inputNome = document.getElementById('inputPlayerName');

        if (modal) modal.style.display = 'flex';
        if (titulo) {
            if (vitoria) {
                titulo.textContent = 'VITÓRIA! O BRASIL RESISTIU!';
                titulo.style.color = '#22c55e';
            } else if (motivo === 'TEMPO ESGOTADO!') {
                titulo.textContent = 'TEMPO ESGOTADO!';
                titulo.style.color = '#f97316';
            } else if (motivo === 'LINHA DEFENSIVA ROMPIDA!') {
                titulo.textContent = 'DEFESA ROMPIDA!';
                titulo.style.color = '#ef4444';
            } else {
                titulo.textContent = 'MISSÃO INTERROMPIDA';
                titulo.style.color = '#ef4444';
            }
        }
        if (motivoEl) {
            if (vitoria) {
                motivoEl.textContent = 'A esperança venceu o medo e todas as frentes foram libertadas pela resistência!';
                motivoEl.style.color = '#22c55e';
            } else if (motivo === 'TEMPO ESGOTADO!') {
                motivoEl.textContent = 'O tempo limite de 3 minutos esgotou e as forças invasoras consolidaram o cerco.';
                motivoEl.style.color = '#f97316';
            } else if (motivo === 'LINHA DEFENSIVA ROMPIDA!') {
                motivoEl.textContent = 'Os invasores romperam as linhas da resistência e invadiram o perímetro.';
                motivoEl.style.color = '#ef4444';
            } else {
                motivoEl.textContent = 'A Vanguarda 13 foi abatida em combate contra o obscurantismo.';
                motivoEl.style.color = '#94a3b8';
            }
        }
        if (pontosEl) pontosEl.textContent = this.pontos.toLocaleString('pt-BR');
        if (inputNome) inputNome.focus();
    }

    gerarParticulas(x, y, cor, quantidade) {
        for (let i = 0; i < quantidade; i++) {
            this.particulas.push({
                x,
                y,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                vida: 24,
                maxVida: 24,
                cor
            });
        }
    }

    verificarColisao(a, b) {
        return (
            a.x < b.x + b.largura &&
            a.x + a.largura > b.x &&
            a.y < b.y + b.altura &&
            a.y + a.altura > b.y
        );
    }

    atualizarHUD() {
        const elPontos = document.getElementById('hudPontos');
        const elVidas = document.getElementById('hudVidas');
        const elFase = document.getElementById('hudFase');
        const elTempo = document.getElementById('hudTempo');

        if (elPontos) elPontos.textContent = this.pontos.toLocaleString('pt-BR');
        if (elVidas) {
            let coracoes = '';
            for (let v = 0; v < this.jogador.vidas; v++) coracoes += '❤️ ';
            for (let e = 0; e < this.jogador.escudos; e++) coracoes += '🛡️ ';
            elVidas.textContent = coracoes || '💔';
        }
        if (elFase && this.dadosFaseAtual) {
            elFase.textContent = `FRENTE ${this.dadosFaseAtual.id}`;
        }
        if (elTempo) {
            const min = Math.floor(this.tempoFaseRestante / 60);
            const seg = this.tempoFaseRestante % 60;
            elTempo.textContent = `${String(min).padStart(2, '0')}:${String(seg).padStart(2, '0')}`;
            if (this.tempoFaseRestante <= 30) {
                elTempo.classList.add('alerta-tempo');
            } else {
                elTempo.classList.remove('alerta-tempo');
            }
        }
    }

    /**
     * Renderização no Canvas HTML5 a 60 FPS
     */
    desenhar() {
        this.ctx.save();

        // Efeito de tremor de tela
        if (this.shakeTela > 0) {
            const sx = (Math.random() - 0.5) * 6;
            const sy = (Math.random() - 0.5) * 6;
            this.ctx.translate(sx, sy);
        }

        // Desenha Fundo Temático
        if (this.imagemFundo && this.imagemFundo.complete && this.imagemFundo.naturalWidth > 0) {
            this.ctx.drawImage(this.imagemFundo, 0, 0, this.cw, this.ch);
        } else {
            this.ctx.fillStyle = '#070b19';
            this.ctx.fillRect(0, 0, this.cw, this.ch);
        }

        // Tela Inicial / Espera
        if (this.estado === 'INICIO') {
            this.desenharTelaInicial();
            this.ctx.restore();
            return;
        }

        // Desenha Inimigos
        for (const inimigo of this.inimigos) {
            inimigo.desenhar(this.ctx);
        }

        // Desenha Chefe
        if (this.chefe) {
            this.chefe.desenhar(this.ctx);
            // Barra de vida do Chefe no topo
            const pctHp = Math.max(0, this.chefe.hp / this.chefe.hpMax);
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            this.ctx.fillRect(40, 24, this.cw - 80, 8);
            this.ctx.fillStyle = '#ef4444';
            this.ctx.fillRect(40, 24, (this.cw - 80) * pctHp, 8);
            this.ctx.strokeStyle = '#facc15';
            this.ctx.strokeRect(40, 24, this.cw - 80, 8);
        }

        // Desenha Itens Especiais
        for (const item of this.itens) {
            item.desenhar(this.ctx);
        }

        // Desenha Tiros Amigos e Inimigos
        for (const t of this.tirosAmigos) t.desenhar(this.ctx);
        for (const t of this.tirosInimigos) t.desenhar(this.ctx);

        // Desenha a Vanguarda 13
        this.jogador.desenhar(this.ctx);

        // Desenha Partículas
        for (const p of this.particulas) {
            this.ctx.fillStyle = p.cor;
            this.ctx.globalAlpha = p.vida / p.maxVida;
            this.ctx.fillRect(p.x, p.y, 2, 2);
        }
        this.ctx.globalAlpha = 1;

        this.ctx.restore();
    }

    desenharTelaInicial() {
        this.ctx.fillStyle = '#facc15';
        this.ctx.font = '900 24px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('LEVANTE 13: A VIRADA', this.cw / 2, 220);

        this.ctx.fillStyle = '#38bdf8';
        this.ctx.font = '12px sans-serif';
        this.ctx.fillText('A RESISTÊNCIA POPULAR CONTRA O FASCISMO', this.cw / 2, 248);

        // Estrela central brilhante
        this.ctx.fillStyle = '#ef4444';
        this.ctx.beginPath();
        this.ctx.arc(this.cw / 2, 330, 28, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '24px sans-serif';
        this.ctx.fillText('★', this.cw / 2, 338);

        // Instrução para iniciar
        const piscar = Math.floor(Date.now() / 400) % 2 === 0;
        if (!this.fasesCarregadas) {
            this.ctx.fillStyle = '#94a3b8';
            this.ctx.font = 'bold 14px sans-serif';
            this.ctx.fillText('CARREGANDO FRENTES...', this.cw / 2, 450);
        } else if (piscar) {
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = 'bold 14px sans-serif';
            this.ctx.fillText('TOQUE OU ESPAÇO PARA JOGAR', this.cw / 2, 450);
        }

        this.ctx.fillStyle = '#94a3b8';
        this.ctx.font = '11px sans-serif';
        this.ctx.fillText('← → ou Arraste para mover', this.cw / 2, 490);
        this.ctx.fillText('https://levante13.online', this.cw / 2, 600);
    }

    obterFaseFallback() {
        return {
            id: 1,
            nome: 'Setor das Redes',
            holotransmissao: {
                mentor: 'Ana Elisa',
                cargo: 'Oficial de Guerra Digital',
                dialogo: ['Atenção Vanguarda 13! Quebrem a desinformação!'],
                avatar: 'assets/images/mentor_padrao.png'
            },
            assets: { fundo: '', inimigo: '' },
            grade: { rows: 4, cols: 7, spacingX: 42, spacingY: 36, initialSpeed: 1 },
            inimigos: [{ id: 'drone', name: 'Drone', hp: 1, points: 50, color: '#ef4444' }],
            chefe: null
        };
    }
}

// Inicia o motor após o carregamento da janela
window.addEventListener('DOMContentLoaded', () => {
    window.jogo = new MotorLevante13();

    // Passo fixo de 60 atualizações por segundo, independente da taxa da tela.
    // Toda a física e o cronômetro foram calibrados em quadros de 60 Hz; sem isto,
    // telas de 120 Hz (MacBook Pro, iPhone Pro) rodam o jogo e o relógio duas vezes mais rápido.
    const PASSO_MS = 1000 / 60;
    let acumulado = 0;
    let ultimoInstante = performance.now();

    function loop(agora) {
        acumulado += Math.min(agora - ultimoInstante, 250); // limita o salto ao voltar de outra aba
        ultimoInstante = agora;

        let passos = 0;
        while (acumulado >= PASSO_MS && passos < 5) {
            window.jogo.atualizar();
            acumulado -= PASSO_MS;
            passos++;
        }
        if (passos === 5) acumulado = 0; // máquina lenta: descarta o atraso em vez de acelerar

        window.jogo.desenhar();
        requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);
});
