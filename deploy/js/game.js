// =============================================================================
// LEVANTE 13: A VIRADA — Motor Principal do Jogo (Game Loop e Máquina de Estados)
// Arquivo: js/game.js
// =============================================================================

// =============================================================================
// REPOSITÓRIO DE MENSAGENS MOTIVACIONAIS E SOBERANIA POPULAR (TRANSIÇÃO DE FASES)
// =============================================================================
const MENSAGENS_MOTIVACIONAIS_FASE = [
    {
        fase: 1,
        titulo: "SETOR DAS REDES LIBERTADO!",
        sub: "A verdade prevaleceu sobre as mentiras",
        frase: "A verdade prevaleceu sobre as fazendas de mentiras! O povo agora tem acesso aos fatos.",
        autor: "ANA ELISA • GUERRA DIGITAL"
    },
    {
        fase: 2,
        titulo: "SETOR FABRIL LIBERTADO!",
        sub: "Resistência Operária e Defesa da CLT",
        frase: "Direitos não se negociam! Os trabalhadores reconquistaram sua dignidade contra o capital especulativo.",
        autor: "JONES MANOEL • FRENTE OPERÁRIA"
    },
    {
        fase: 3,
        titulo: "RESERVA PLANETÁRIA PROTEGIDA!",
        sub: "A Amazônia e os Povos Originários Resistiram",
        frase: "A floresta vive e respira! Os guardiões da terra expulsaram os invasores das áreas demarcadas.",
        autor: "SÔNIA GUAJAJARA • MINISTRA DOS POVOS ORIGINÁRIOS"
    },
    {
        fase: 4,
        titulo: "COMPLEXO DA VIDA DEFENDIDO!",
        sub: "A Ciência e o SUS Venceram o Negacionismo",
        frase: "A ciência e a vida venceram o obscurantismo! O SUS permanece firme como escudo do povo.",
        autor: "DR. DRAUZIO VARELLA • SAÚDE E CIÊNCIA POPULAR"
    },
    {
        fase: 5,
        titulo: "SANTUÁRIO DA FÉ RESTAURADO!",
        sub: "O Estado Laico e a Liberdade Espiritual Triunfaram",
        frase: "O amor venceu a intolerância! O Estado Laico e o respeito a todas as crenças foram restaurados.",
        autor: "PASTOR HENRIQUE VIEIRA • LIBERDADE ESPIRITUAL"
    },
    {
        fase: 6,
        titulo: "GRANDE VIRADA CONQUISTADA!",
        sub: "A Soberania Popular e a Democracia Triunfaram",
        frase: "Nós vencemos o ódio, e a soberania popular é soberana. O Brasil voltou a sorrir com dignidade e justiça social!",
        autor: "LULA • COMANDO SUPREMO DA DEMOCRACIA"
    }
];

// =============================================================================
// REPOSITÓRIO DE CITAÇÕES MOTIVACIONAIS E REVOLUCIONÁRIAS (TELA DE PRELOADER)
// =============================================================================
const CITACOES_REVOLUCIONARIAS = [
    {
        frase: "Se o homem é formado pelas circunstâncias, é preciso formar as circunstâncias humanamente.",
        autor: "KARL MARX • FILÓSOFO DA EMANCIPAÇÃO HUMANA"
    },
    {
        frase: "Quando a educação não é libertadora, o sonho do oprimido é ser o opressor. Mas nós escolhemos transformar o mundo!",
        autor: "PAULO FREIRE • PATRONO DA EDUCAÇÃO BRASILEIRA"
    },
    {
        frase: "Eles podem tentar cortar todas as flores, mas não conseguirão deter a primavera que brota do povo.",
        autor: "LULA • COMANDO SUPREMO DA DEMOCRACIA"
    },
    {
        frase: "Só os que são capazes de amar a humanidade são capazes de transformar a história com bravura e ternura.",
        autor: "CHE GUEVARA • REVOLUCIONÁRIO LATINO-AMERICANO"
    },
    {
        frase: "Não serei livre enquanto alguma mulher for prisioneira, mesmo que as correntes dela sejam diferentes das minhas.",
        autor: "AUDRE LORDE • ESCRITORA E ATIVISTA POPULAR"
    },
    {
        frase: "Não me pergunte se as forças são suficientes, mas se a causa é justa. A nossa causa é o povo soberano!",
        autor: "CARLOS MARIGHELLA • GUERRILHEIRO DA LIBERDADE"
    },
    {
        frase: "Eu sou porque nós somos. Quantos mais de nós terão que resistir para que essa guerra acabe?",
        autor: "MARIELLE FRANCO • VEREADORA E SEMENTE DA RESISTÊNCIA"
    },
    {
        frase: "No começo pensei que estivesse lutando para salvar seringueiras; depois pensei que lutava pela Amazônia; hoje percebo que luto pela humanidade.",
        autor: "CHICO MENDES • LÍDER AMBIENTALISTA E SERINGUEIRO"
    },
    {
        frase: "A força da alienação vem dessa fragilidade dos indivíduos, que apenas conseguem identificar o que os separa, e não o que os une.",
        autor: "MILTON SANTOS • GEÓGRAFO E INTELECTUAL POPULAR"
    },
    {
        frase: "O Brasil é o único país do mundo onde a esperança não é uma virtude teologal: é um dever cívico e revolucionário.",
        autor: "DARCY RIBEIRO • ANTROPÓLOGO E EDUCADOR DA NAÇÃO"
    },
    {
        frase: "O amor ao povo trabalhador não se proclama com discursos, prova-se na trincheira da luta e da solidariedade.",
        autor: "FLORESTAN FERNANDES • SOCIÓLOGO E MILITANTE SOCIALISTA"
    },
    {
        frase: "Democracia de verdade é barriga cheia, salário digno, saúde pública e a juventude na universidade!",
        autor: "VANGUARDA 13 • VOZ DA RESISTÊNCIA POPULAR"
    }
];

class MotorLevante13 {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.cw = 360;
        this.ch = 640;
        this.canvas.width = this.cw;
        this.canvas.height = this.ch;

        // Estados do Jogo: 'INICIO', 'HOLOTRANSMISSAO', 'JOGANDO', 'CHEFE', 'TRANSICAO_FASE', 'FIM_DE_JOGO'
        this.estado = 'INICIO';

        // Sistema de Transição de Fases com Mensagem Motivacional
        this.intervaloContagemTransicao = null;
        this.segundosRestantesTransicao = 5;
        this.proximaFaseIndice = 0;

        // Entidades e Listas
        this.jogador = new Jogador(this.cw, this.ch);
        this.tirosAmigos = [];
        this.tirosInimigos = [];
        this.inimigos = [];
        this.itens = [];
        this.particulas = [];
        this.chefe = null;
        this.spriteChefe = null;
        this.temporizadorSuprimentoChefe = 0;
        this.textoAlertaChefe = '';
        this.subtextoAlertaChefe = '';
        this.tipoAlertaChefe = 'info';
        this.tempoAlertaChefe = 0;

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

        // Sequência Cinematográfica de Destruição do Chefe (Boss Death)
        this.animacaoDestruicaoChefe = null;

        // Controles de Entrada
        this.teclas = {};
        this.touchX = null;
        this.touchY = null;
        this.disparoAutomaticoMobile = true;

        // Sistema de Diálogos / Holotransmissão
        this.dialogoIndice = 0;
        this.textoAtualExibido = '';
        this.caractereIndice = 0;
        this.temporizadorTeletipo = 0;
        // Sistema de Pré-carregamento (Preloader) de Assets e Conexões
        this.carregamentoConcluido = false;
        this.indiceCitacaoAtual = 0;
        this.intervaloCitacoes = null;
        this.assetsCarregados = {};

        this.configurarEventos();
        this.iniciarPreloaderECarregarTudo();
    }

    /**
     * Configura listeners de teclado, mouse e toque mobile.
     */
    configurarEventos() {
        window.addEventListener('keydown', (e) => {
            // Se qualquer modal estiver aberto (credencial/Urna, ajuda/power-ups, placar), ignora atalhos de disparo/início
            const modalCredencial = document.getElementById('modalCredencial');
            const modalPowerups = document.getElementById('powerupsModal');
            const modalRanking = document.getElementById('leaderboardModal');
            if (
                (modalCredencial && modalCredencial.style.display === 'flex') ||
                (modalPowerups && modalPowerups.style.display === 'flex') ||
                (modalRanking && modalRanking.style.display === 'flex')
            ) {
                return;
            }

            // Previne a rolagem padrão da página ao pressionar a barra de espaço
            if (e.code === 'Space') {
                e.preventDefault();
            }

            this.teclas[e.code] = true;
            audio.iniciar();

            // 1. Iniciar partida a partir da tela inicial via teclado (solicita codinome/urna)
            if ((e.code === 'Space' || e.code === 'Enter') && this.estado === 'INICIO') {
                if (!this.carregamentoConcluido) return;
                if (audio.audioMenu && audio.audioMenu.paused) {
                    audio.tocarMusicaMenu();
                }
                this.solicitarInicioPartida();
                return;
            }

            // 2. Avanço de diálogos na Holotransmissão via teclado
            if ((e.code === 'Space' || e.code === 'Enter') && this.estado === 'HOLOTRANSMISSAO') {
                this.avancarHolotransmissao();
                return;
            }

            // Nota: Em TUTORIAL_POWERUPS e TRANSICAO_FASE não usamos mais a barra de espaço,
            // para evitar que o jogador feche a tela acidentalmente enquanto atirava ao final da partida.
            // O avanço nesses modais é feito exclusivamente pelo clique intencional no botão.

            // Atalho de desenvolvimento / teste da Transição de Fase (Tecla 'T')
            if (e.key === 't' || e.key === 'T') {
                this.exibirTransicaoFase(this.indiceFaseAtual, this.indiceFaseAtual + 1);
                return;
            }

            // Atalhos de desenvolvimento / teste para frentes 1 a 6 (Teclas '1' a '6')
            if (['1', '2', '3', '4', '5', '6'].includes(e.key)) {
                const faseNum = parseInt(e.key, 10) - 1;
                this.iniciarFase(faseNum);
                return;
            }

            // 4. Reiniciar partida se estiver em tela de fim de jogo
            if ((e.code === 'Space' || e.code === 'Enter') && this.estado === 'FIM_DE_JOGO') {
                const modalGameOver = document.getElementById('gameOverModal');
                if (modalGameOver && modalGameOver.style.display === 'flex') {
                    // Não reinicia via espaço se modal de fim de jogo estiver ativo
                    return;
                }
                this.iniciarPartida();
                return;
            }
        });

        window.addEventListener('keyup', (e) => {
            this.teclas[e.code] = false;
        });

        // Suporte a clique de mouse no Desktop
        this.canvas.addEventListener('click', () => {
            if (!this.carregamentoConcluido) return;
            audio.iniciar();
            if (this.estado === 'INICIO') {
                if (audio.audioMenu && audio.audioMenu.paused) {
                    audio.tocarMusicaMenu();
                }
                this.solicitarInicioPartida();
            } else if (this.estado === 'HOLOTRANSMISSAO') {
                this.avancarHolotransmissao();
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

        // Suporte a avanço da Transição de Fase exclusivamente via clique no botão (desktop e mobile)
        const btnAvancarFase = document.getElementById('btnAvancarFase');
        if (btnAvancarFase) {
            btnAvancarFase.addEventListener('click', (e) => {
                e.stopPropagation();
                audio.iniciar();
                if (this.estado === 'TRANSICAO_FASE') {
                    this.concluirTransicaoFase();
                }
            });
        }

        // Controles de Touch Mobile na área do Canvas
        const atualizarTouch = (e) => {
            if (e.touches && e.touches.length > 0) {
                const rect = this.canvas.getBoundingClientRect();
                const escalaX = this.cw / rect.width;
                const escalaY = this.ch / rect.height;
                this.touchX = (e.touches[0].clientX - rect.left) * escalaX;
                this.touchY = (e.touches[0].clientY - rect.top) * escalaY;
                audio.iniciar();
            }
        };

        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            atualizarTouch(e);
            if (this.estado === 'HOLOTRANSMISSAO') {
                this.avancarHolotransmissao();
            } else if (this.estado === 'INICIO') {
                if (!this.carregamentoConcluido) return;
                if (audio.audioMenu && audio.audioMenu.paused) {
                    audio.tocarMusicaMenu();
                }
                this.solicitarInicioPartida();
            }
        }, { passive: false });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            atualizarTouch(e);
        }, { passive: false });

        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.touchX = null;
            this.touchY = null;
        }, { passive: false });
    }

    /**
     * Cicla e exibe frases revolucionárias e motivacionais aleatórias durante o carregamento
     */
    iniciarRotacaoCitacoes() {
        const elFrase = document.getElementById('preloaderFraseTexto');
        const elAutor = document.getElementById('preloaderFraseAutor');
        if (!elFrase || !elAutor) return;

        const exibirAleatoria = () => {
            const index = Math.floor(Math.random() * CITACOES_REVOLUCIONARIAS.length);
            const citacao = CITACOES_REVOLUCIONARIAS[index];

            elFrase.style.opacity = '0';
            elAutor.style.opacity = '0';

            setTimeout(() => {
                elFrase.textContent = `“${citacao.frase}”`;
                elAutor.textContent = `— ${citacao.autor}`;
                elFrase.style.opacity = '1';
                elAutor.style.opacity = '1';
            }, 300);
        };

        exibirAleatoria();
        this.intervaloCitacoes = setInterval(exibirAleatoria, 2800);
    }

    /**
     * Atualiza os indicadores visuais de progresso (barra e porcentagem) na tela de carregamento
     */
    atualizarProgressoPreloader(concluidos, total, mensagemStatus) {
        const pct = Math.min(100, Math.floor((concluidos / Math.max(1, total)) * 100));
        const barFill = document.getElementById('preloaderBarraPreenchimento');
        const pctText = document.getElementById('preloaderPorcentagem');
        const statusText = document.getElementById('preloaderStatusTexto');

        if (barFill) barFill.style.width = `${pct}%`;
        if (pctText) pctText.textContent = `${pct}%`;
        if (statusText && mensagemStatus) statusText.textContent = mensagemStatus;
    }

    /**
     * Pré-carrega uma imagem de forma assíncrona, tolerante a falhas
     */
    carregarImagem(url) {
        return new Promise((resolve) => {
            if (!url) return resolve(null);
            if (this.assetsCarregados[url]) return resolve(this.assetsCarregados[url]);

            const img = new Image();
            img.onload = () => {
                this.assetsCarregados[url] = img;
                resolve(img);
            };
            img.onerror = () => {
                console.warn(`[Preloader] Não foi possível pré-carregar imagem: ${url}`);
                resolve(null);
            };
            img.src = url;
        });
    }

    /**
     * Executa o pré-carregamento abrangente de fases, imagens e áudios antes de liberar a tela inicial
     */
    async iniciarPreloaderECarregarTudo() {
        this.iniciarRotacaoCitacoes();
        this.atualizarProgressoPreloader(5, 100, 'Sintonizando frequências com a base da resistência...');

        // 1. Busca manifesto de fases do servidor
        await this.carregarFasesDoServidor();
        this.atualizarProgressoPreloader(20, 100, 'Fases e setores táticos identificados...');

        // 2. Monta lista completa de imagens para pré-carregamento
        const listaUrlsImagens = [
            'assets/fonts/vcr_osd_mono.ttf',
            'assets/images/mentor_padrao.png'
        ];

        if (this.fases && this.fases.length > 0) {
            this.fases.forEach(f => {
                if (f.assets) {
                    if (f.assets.fundo) listaUrlsImagens.push(f.assets.fundo);
                    if (f.assets.inimigo) listaUrlsImagens.push(f.assets.inimigo);
                    if (f.assets.chefe) listaUrlsImagens.push(f.assets.chefe);
                }
                if (f.holotransmissao && f.holotransmissao.avatar) {
                    listaUrlsImagens.push(f.holotransmissao.avatar);
                }
            });
        }

        // Sprites multifase do Chefe Final (Fase 6)
        listaUrlsImagens.push(
            'levels/level_6/boss_phase1.png',
            'levels/level_6/boss_phase2.png',
            'levels/level_6/boss_phase3.png',
            'levels/level_6/boss_phase4.png',
            'levels/level_6/boss_piece_wing_left.png',
            'levels/level_6/boss_piece_wing_right.png',
            'levels/level_6/boss_piece_core_plate.png'
        );

        // Remove duplicatas
        const urlsUnicas = [...new Set(listaUrlsImagens.filter(Boolean))];
        const totalPassos = urlsUnicas.length + 3; // +3 para fases, áudios e finalização
        let passosConcluidos = 1;

        // Pré-carrega cada imagem reportando progresso
        for (const url of urlsUnicas) {
            await this.carregarImagem(url);
            passosConcluidos++;
            const nomeCurto = url.split('/').pop() || 'asset';
            this.atualizarProgressoPreloader(
                passosConcluidos,
                totalPassos,
                `Carregando artefatos: ${nomeCurto}...`
            );
        }

        // 3. Pré-carrega referências de áudio (OGG)
        this.atualizarProgressoPreloader(totalPassos - 1, totalPassos, 'Calibrando sintetizadores e trilhas de áudio...');
        if (typeof audio !== 'undefined' && typeof audio.inicializarElementosMusica === 'function') {
            audio.inicializarElementosMusica();
        }

        // Pequena pausa para garantir visualização do 100%
        this.atualizarProgressoPreloader(totalPassos, totalPassos, 'Sistemas online! A resistência está pronta!');
        await new Promise(r => setTimeout(r, 450));

        // Finaliza o Preloader e revela a tela inicial
        this.finalizarPreloader();
    }

    /**
     * Oculta a tela de carregamento e autoriza a interação com a tela inicial
     */
    finalizarPreloader() {
        if (this.intervaloCitacoes) {
            clearInterval(this.intervaloCitacoes);
            this.intervaloCitacoes = null;
        }

        const modalPreloader = document.getElementById('preloaderModal');
        if (modalPreloader) {
            modalPreloader.classList.add('oculto');
            setTimeout(() => {
                modalPreloader.style.display = 'none';
            }, 500);
        }

        this.carregamentoConcluido = true;

        // Inicia trilha do menu
        if (typeof audio !== 'undefined') {
            audio.tocarMusicaMenu();
        }
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
        this.tempoAlertaChefe = 0;
        this.textoAlertaChefe = '';
        this.subtextoAlertaChefe = '';
        this.animacaoDestruicaoChefe = null;
        audio.pararMusica(0.5);

        // Limpa a tela imediatamente com o fundo escuro do espaço
        this.ctx.fillStyle = '#070b19';
        this.ctx.fillRect(0, 0, this.cw, this.ch);

        // Fecha modais de fim de jogo e ranking
        const modalGameOver = document.getElementById('gameOverModal');
        if (modalGameOver) modalGameOver.style.display = 'none';

        const modalRanking = document.getElementById('leaderboardModal');
        if (modalRanking) modalRanking.style.display = 'none';

        // Fecha modal de transição de fase e limpa intervalo ativo
        if (this.intervaloContagemTransicao) {
            clearInterval(this.intervaloContagemTransicao);
            this.intervaloContagemTransicao = null;
        }
        const modalTransicao = document.getElementById('transicaoFaseModal');
        if (modalTransicao) modalTransicao.style.display = 'none';

        // Reseta formulário de recorde e caixas de compartilhamento
        const formScore = document.getElementById('formSalvarScore');
        const btnSalvar = document.getElementById('btnSalvarScore');
        const boxCompartilhamento = document.getElementById('boxCompartilhamento');
        const boxCard = document.getElementById('boxCardGameOver');
        const btnWhatsApp = document.getElementById('btnWhatsAppShare');
        const btnInstagram = document.getElementById('btnInstagramShare');

        if (formScore) formScore.style.display = 'block';
        if (btnSalvar) {
            btnSalvar.disabled = false;
            btnSalvar.innerHTML = '<svg class="px-icon"><use href="#px-disk"/></svg> REGISTRAR RECORDE';
        }
        if (boxCompartilhamento) boxCompartilhamento.style.display = 'none';
        if (boxCard) boxCard.style.display = 'none';
        if (btnWhatsApp) btnWhatsApp.style.display = 'inline-flex';
        if (btnInstagram) btnInstagram.style.display = 'inline-flex';
    }

    /**
     * Solicita autenticação de codinome / urna antes de dar a partida.
     */
    solicitarInicioPartida() {
        audio.iniciar();
        if (window.authUrna) {
            window.authUrna.abrirModal(() => {
                this.iniciarPartida();
            });
        } else {
            this.iniciarPartida();
        }
    }

    iniciarPartida() {
        audio.iniciar();
        this.resetarJogo();
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

        // Limpa imediatamente todas as entidades e tiros do setor anterior
        this.inimigos = [];
        this.tirosAmigos = [];
        this.tirosInimigos = [];
        this.itens = [];
        this.particulas = [];
        this.chefe = null;
        this.tempoAlertaChefe = 0;
        this.textoAlertaChefe = '';
        this.subtextoAlertaChefe = '';
        this.animacaoDestruicaoChefe = null;

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

        if (this.dadosFaseAtual.assets && this.dadosFaseAtual.assets.chefe) {
            this.spriteChefe = new Image();
            this.spriteChefe.src = this.dadosFaseAtual.assets.chefe;
        } else {
            this.spriteChefe = null;
        }

        // Configura a Holotransmissão: para a música para dar foco aos diálogos do mentor
        this.estado = 'HOLOTRANSMISSAO';
        this.dialogoIndice = 0;
        if (typeof audio !== 'undefined') {
            audio.pararMusica(0.4);
        }
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
        this.temporizadorTeletipo = 0;
        this.renderizarTextoHolotransmissao();
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
            // Fim dos diálogos: verifica se deve exibir tutorial de power-ups na Fase 1
            this.fecharHolotransmissao();

            if (this.indiceFaseAtual === 0 && !this.manualPowerupsExibido) {
                this.exibirManualPowerups();
            } else {
                this.montarGradeInimigos();
                this.estado = 'JOGANDO';
                audio.tocarMusicaGameplay();
            }
        }
    }

    /**
     * Exibe o Manual de Power-ups da Vanguarda 13.
     * Se invocado durante o fluxo normal de início da Fase 1, atua como tutorial de partida.
     * Se invocado pelo botão de ajuda '?', atua como consulta e preserva o estado anterior.
     * @param {boolean} modoConsultaManual - true se foi acionado via botão de ajuda '?'
     */
    exibirManualPowerups(modoConsultaManual = false) {
        this.modoConsultaManual = modoConsultaManual;
        this.estadoAnteriorManual = this.estado;

        // Se for o tutorial obrigatório inicial da fase 1
        if (!modoConsultaManual && this.estado === 'HOLOTRANSMISSAO') {
            this.estado = 'TUTORIAL_POWERUPS';
            this.manualPowerupsExibido = true;
        }

        const modal = document.getElementById('powerupsModal');
        const btnEntendido = document.getElementById('btnEntendidoPowerups');
        const subtexto = document.getElementById('subtextoManualPowerups');

        if (btnEntendido && subtexto) {
            // Se está em tela de Game Over, placar ou se foi apenas uma consulta da barra superior
            const emGameOver = this.estado === 'FIM_DE_JOGO' || this.estadoAnteriorManual === 'FIM_DE_JOGO';
            const apenasConsulta = modoConsultaManual || emGameOver || this.estadoAnteriorManual === 'JOGANDO' || this.estadoAnteriorManual === 'CHEFE';

            if (apenasConsulta && !(!this.manualPowerupsExibido && this.indiceFaseAtual === 0 && !modoConsultaManual)) {
                btnEntendido.innerHTML = 'FECHAR MANUAL <svg class="px-icon"><use href="#px-close"/></svg>';
                btnEntendido.className = 'btn-acao btn-secundario';
                subtexto.textContent = 'Clique para fechar o manual e retornar à tela anterior';
            } else {
                btnEntendido.innerHTML = 'ENTENDIDO! ÀS ARMAS <svg class="px-icon"><use href="#px-play"/></svg>';
                btnEntendido.className = 'btn-acao btn-transicao';
                subtexto.textContent = 'Clique no botão acima para iniciar a batalha';
            }
        }

        if (modal) {
            modal.style.display = 'flex';
        }
    }

    /**
     * Fecha o Manual de Power-ups.
     * Se for o tutorial inicial da Fase 1, inicia o combate.
     * Se for consulta (ou se estava em Game Over / tela de score), apenas fecha e restaura o estado.
     */
    fecharManualPowerups() {
        const modal = document.getElementById('powerupsModal');
        if (modal) {
            modal.style.display = 'none';
        }

        // Se era o tutorial inicial que estava esperando para iniciar o jogo
        if (!this.modoConsultaManual && this.estado === 'TUTORIAL_POWERUPS') {
            this.montarGradeInimigos();
            this.estado = 'JOGANDO';
            audio.tocarMusicaGameplay();
            return;
        }

        // Se foi apenas uma consulta manual, restaura o estado anterior sem reiniciar ou disparar jogo
        if (this.estadoAnteriorManual) {
            this.estado = this.estadoAnteriorManual;
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

        // Armazena a contagem inicial da tropa para medir a quebra da formação de manada
        this.totalInimigosFase = this.inimigos.length;
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

        // Atualiza a nave do jogador (teclado e touch com offset vertical)
        this.jogador.atualizar(this.teclas, this.touchX, this.touchY);

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

            // Suprimentos periódicos da resistência popular durante a batalha com o chefe
            this.temporizadorSuprimentoChefe = (this.temporizadorSuprimentoChefe || 0) + 1;
            if (this.temporizadorSuprimentoChefe >= 720) { // a cada ~12 segundos
                this.temporizadorSuprimentoChefe = 0;
                this.soltarSuprimentoResistencia('📦 RESISTÊNCIA POPULAR: SUPRIMENTO ENTREGUE!');
            }

            // Colisão dos tiros amigos com o Chefe
            for (let i = this.tirosAmigos.length - 1; i >= 0; i--) {
                const t = this.tirosAmigos[i];
                if (this.verificarColisao(t, this.chefe)) {
                    // Se o tiro já impactou o chefe neste feixe, ignora repetições no mesmo chefe
                    if (t.atingiuChefe) {
                        continue;
                    }
                    t.atingiuChefe = true;

                    // O Laser perfurante atravessa a manada comum, mas ao atingir o casco blindado
                    // do Boss, ele causa dano concentrado (2 pts) e dissipa seu feixe na fuselagem
                    const danoAplicado = t.tipo === 'laser' ? 2 : 1;
                    this.tirosAmigos.splice(i, 1);

                    this.gerarParticulas(t.x, t.y, t.tipo === 'laser' ? '#38bdf8' : '#facc15', t.tipo === 'laser' ? 6 : 3);

                    const evDano = this.chefe.receberDano(danoAplicado);
                    if (evDano.mudouFase) {
                        this.shakeTela = 22;
                        audio.tocarExplosao();
                        this.gerarParticulas(this.chefe.x + this.chefe.largura / 2, this.chefe.y + this.chefe.altura / 2, '#ef4444', 35);
                        this.gerarParticulas(this.chefe.x + this.chefe.largura / 2, this.chefe.y + this.chefe.altura / 2, '#facc15', 25);

                        const titulosFase = [
                            '',
                            'BLINDAGEM TOTAL',
                            'ASA ESQUERDA ARRANCADA!',
                            'NÚCLEO EXPOSTO & SOBRECARGA!',
                            'SOBRECARGA CRÍTICA DESESPERADA!'
                        ];
                        this.textoAlertaChefe = `💥 DANO CRÍTICO: ${titulosFase[evDano.faseAtual] || 'RUPTURA DE CASCO!'}`;
                        this.subtextoAlertaChefe = 'A BLINDAGEM DO OPRESSOR ESTÁ COLAPSANDO!';
                        this.tipoAlertaChefe = 'critico';
                        this.tempoAlertaChefe = 150;
                    }

                    if (evDano.soltarPowerUp) {
                        this.soltarSuprimentoResistencia('📦 REFORÇO DA RESISTÊNCIA: POWER-UP ENTREGUE!');
                    }

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

        // Atualiza sequência cinematográfica de destruição da capitânia (se em andamento)
        if (this.animacaoDestruicaoChefe) {
            this.atualizarAnimacaoDestruicaoChefe();
        }

        // Atualiza painel HUD em tempo real
        this.atualizarHUD();

        // Decrementa temporizador do alerta tático do chefe
        if (this.tempoAlertaChefe > 0) this.tempoAlertaChefe--;
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
                // Onda serpenteante suave, rítmica e cadenciada
                const ox = Math.sin(tempo * 0.028 + inimigo.linha * 0.7) * 8;
                const oy = Math.cos(tempo * 0.028 + inimigo.coluna * 0.4) * 3;
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

        // Mede a quebra da formação da manada:
        // totalInicial completo = 0 (disciplina máxima em bloco)
        // Poucos sobreviventes restantes = até 1.0 (pânico, desordem e trajetórias caóticas erráticas)
        const totalInicial = this.totalInimigosFase || (totalCols * totalRows);
        const proporcaoVivos = this.inimigos.length / Math.max(1, totalInicial);
        const fatorErratica = Math.pow(1 - proporcaoVivos, 1.6); // Cresce exponencialmente quando restam poucos

        for (const inimigo of this.inimigos) {
            if (inimigo.emMergulho) {
                inimigo.atualizarMergulho();
            } else {
                const offset = this.calcularOffsetInimigo(inimigo, padrao, this.temporizadorAnimacao, totalCols, totalRows);

                // Componente caótico individual de quebra de manada:
                // Cada nave começa a oscilar descompassada de forma irregular e trêmula
                const t = this.temporizadorAnimacao * (inimigo.velocidadeErrata || 1.0);
                const faseX = (inimigo.faseErrataX || 0);
                const faseY = (inimigo.faseErrataY || 0);
                const freqJitter = (inimigo.frequenciaJitter || 1.4);

                // Vibração e desvio caótico que rompe a grade linear
                const erraticoX = (
                    Math.sin(t * 0.08 * freqJitter + faseX) * 16 +
                    Math.cos(t * 0.15 + faseY) * 9 +
                    (Math.sin(t * 0.3 + faseX * 2) * 4)
                ) * fatorErratica;

                const erraticoY = (
                    Math.cos(t * 0.07 * freqJitter + faseY) * 10 +
                    Math.sin(t * 0.18 + faseX) * 6
                ) * fatorErratica;

                inimigo.offsetX = offset.x + erraticoX;
                inimigo.offsetY = offset.y + erraticoY;

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

            // Invasores aleatórios disparam contra o jogador (cadência aumenta no desespero)
            const chanceTiroBase = 0.0016;
            const chanceTiro = (chanceTiroBase + fatorErratica * 0.004) * fatorVelocidade;
            if (Math.random() < chanceTiro) {
                this.tirosInimigos.push(new Projetil(
                    inimigo.x + inimigo.largura / 2 - 2,
                    inimigo.y + inimigo.altura,
                    (Math.random() - 0.5) * (0.8 + fatorErratica * 1.6),
                    3.2 + fatorErratica * 0.8,
                    'inimigo',
                    '#ef4444',
                    false,
                    true
                ));
            }

            // Chance de mergulho rasante tático:
            // Aumenta drasticamente conforme a manada se desfaz, simulando ataques suicidas de naves isoladas
            const diveChanceBase = (this.dadosFaseAtual.grade && this.dadosFaseAtual.grade.diveChance) ? this.dadosFaseAtual.grade.diveChance : 0.05;
            const diveChanceFinal = (diveChanceBase + fatorErratica * 0.35) * 0.0006 * fatorVelocidade;
            if (!inimigo.emMergulho && Math.random() < diveChanceFinal) {
                inimigo.iniciarMergulho(this.jogador.x);
            }
        }

        // Se a grade bater na borda da tela na direção do movimento, desce um passo suave e inverte
        if (tocarParede) {
            this.gradeDirecao *= -1;
            this.gradePassoY = (this.dadosFaseAtual.grade && this.dadosFaseAtual.grade.stepY) ? this.dadosFaseAtual.grade.stepY : 4.0;
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
                    this.gerarParticulas(inimigo.x + 14, inimigo.y + 12, '#22c55e', 10);
                }
                this.inimigos = [];
                if (this.chefe) {
                    const ev = this.chefe.receberDano(15);
                    if (ev.mudouFase) {
                        this.shakeTela = 22;
                        audio.tocarExplosao();
                    }
                    if (ev.soltarPowerUp) {
                        this.soltarSuprimentoResistencia('📦 REFORÇO DA RESISTÊNCIA: POWER-UP ENTREGUE!');
                    }
                    if (this.chefe.hp <= 0) {
                        this.derrotarChefe();
                    }
                }
                break;
            case 'sus': // Cápsula do SUS: +1 Vigor
                this.jogador.vidas = Math.min(this.jogador.vidas + 1, 4);
                audio.tocarPowerup();
                break;
        }
    }

    soltarSuprimentoResistencia(mensagem = '📦 SUPRIMENTO POPULAR A CAMINHO!') {
        const dropX = Math.max(30, Math.min(this.cw - 50, this.cw / 2 + (Math.random() - 0.5) * 160));
        this.droparItemEspecial(dropX, 40);
        this.textoAlertaChefe = mensagem;
        this.subtextoAlertaChefe = 'COLETE A CÁPSULA PARA FORTALECER A NAVE';
        this.tipoAlertaChefe = 'suprimento';
        this.tempoAlertaChefe = 140;
    }

    invocarChefe() {
        if (!this.dadosFaseAtual.chefe) {
            this.avancarParaProximaFase();
            return;
        }

        this.estado = 'CHEFE';
        this.chefe = new ChefeSetor(this.cw, this.dadosFaseAtual.chefe, this.spriteChefe, this.indiceFaseAtual + 1);
        this.shakeTela = 22;
        this.temporizadorSuprimentoChefe = 0;

        // Dispara som de sirene tática retrô Sci-Fi e faz crossfade para a música do chefe
        audio.tocarAlertaChefe();
        audio.tocarMusicaBoss();

        // Configura banner de alerta de grande impacto (duração de ~2 segundos antes do combate iniciar)
        this.textoAlertaChefe = `⚠️ ALERTA DE CHEFE: ${this.chefe.nome.toUpperCase()}`;
        this.subtextoAlertaChefe = this.chefe.titulo ? `[ ${this.chefe.titulo.toUpperCase()} ]` : '[ NAVE CAPITÂNIA AUTORITÁRIA ]';
        this.tipoAlertaChefe = 'chefe';
        this.tempoAlertaChefe = 130;
    }

    derrotarChefe() {
        if (!this.chefe) return;

        // Limpa projéteis inimigos remanescentes para segurança do jogador durante o espetáculo da vitória
        this.tirosInimigos = [];
        this.pontos += this.chefe.pontos;
        this.atualizarHUD();

        // Para imediatamente a música do boss para destacar as explosões massivas
        audio.pararMusica(0.5);

        // Clona dados visuais e físicos do Chefe para animação cinematográfica desacoplada
        this.animacaoDestruicaoChefe = {
            x: this.chefe.x,
            y: this.chefe.y,
            largura: this.chefe.largura,
            altura: this.chefe.altura,
            sprite: this.chefe.sprite,
            idFase: this.chefe.idFase,
            faseDano: this.chefe.faseDano || 1,
            spritesFases: this.chefe.spritesFases || [],
            pedacosAtivos: this.chefe.pedacosAtivos || [],
            quadro: 0,
            duracaoTotal: 160, // ~2.6 segundos a 60 FPS
            flashBranco: 0,
            particulasLocais: []
        };

        // Remove a entidade ativa de combate do Chefe (cessa disparos e colisões)
        this.chefe = null;

        // Configura banner triunfal de destruição da capitânia
        this.textoAlertaChefe = '⭐ NAVE CAPITÂNIA DESTRUÍDA!';
        this.subtextoAlertaChefe = 'O POVO AVANÇA! FRENTE LIBERTADA!';
        this.tipoAlertaChefe = 'vitoria';
        this.tempoAlertaChefe = 180;
    }

    /**
     * Atualiza a sequência cinematográfica de explosões em cadeia e colapso do Chefe
     */
    atualizarAnimacaoDestruicaoChefe() {
        const anim = this.animacaoDestruicaoChefe;
        if (!anim) return;

        anim.quadro++;

        // Tremor contínuo de tela durante toda a sequência
        this.shakeTela = Math.max(this.shakeTela, 8);

        // Desce lentamente com leve deriva
        anim.y += 0.35;
        anim.x += (Math.random() - 0.5) * 1.5;

        // Atualiza pedaços que já estavam se soltando
        for (let i = anim.pedacosAtivos.length - 1; i >= 0; i--) {
            const p = anim.pedacosAtivos[i];
            p.atualizar();
            if (p.removido) anim.pedacosAtivos.splice(i, 1);
        }

        // Explosões secundárias em cadeia distribuídas pela carcaça do chefe a cada ~6 a 10 quadros
        if (anim.quadro < 130 && anim.quadro % 7 === 0) {
            const ox = anim.x + Math.random() * anim.largura;
            const oy = anim.y + Math.random() * anim.altura;
            const corExplosao = ['#facc15', '#ef4444', '#f97316', '#ffffff'][Math.floor(Math.random() * 4)];

            this.gerarParticulas(ox, oy, corExplosao, 14);
            audio.tocarExplosao();

            // Adiciona clarão de impacto
            anim.flashBranco = 4;
        }

        // Grande detonação final por volta do quadro 130
        if (anim.quadro === 130) {
            this.shakeTela = 28;
            anim.flashBranco = 12;

            const centroX = anim.x + anim.largura / 2;
            const centroY = anim.y + anim.altura / 2;

            // Onda maciça de faíscas incandescentes e destroços
            this.gerarParticulas(centroX, centroY, '#ffffff', 40);
            this.gerarParticulas(centroX, centroY, '#facc15', 50);
            this.gerarParticulas(centroX, centroY, '#ef4444', 45);
            this.gerarParticulas(centroX, centroY, '#38bdf8', 25);

            if (typeof audio.tocarDestruicaoBoss === 'function') {
                audio.tocarDestruicaoBoss();
            } else {
                audio.tocarExplosao();
            }
        }

        // Decrementa clarão branco
        if (anim.flashBranco > 0) anim.flashBranco--;

        // Conclusão da animação: somente após todos os quadros, prossegue para a transição de fase
        if (anim.quadro >= anim.duracaoTotal) {
            this.animacaoDestruicaoChefe = null;
            this.avancarParaProximaFase();
        }
    }

    avancarParaProximaFase() {
        const faseConcluida = this.indiceFaseAtual;
        const proximaFase = this.indiceFaseAtual + 1;

        if (proximaFase < this.fases.length) {
            this.exibirTransicaoFase(faseConcluida, proximaFase);
        } else {
            this.exibirFimDeJogo(true);
        }
    }

    /**
     * Exibe a tela de transição entre fases com mensagem motivacional e bônus de resistência.
     */
    exibirTransicaoFase(faseConcluida, proximaFase) {
        this.estado = 'TRANSICAO_FASE';
        this.proximaFaseIndice = proximaFase;

        // Bônus comemorativo de pontuação por setor conquistado (+5.000 PTS)
        const bonusPontos = 5000;
        this.pontos += bonusPontos;
        this.atualizarHUD();

        // Para a música de combate para destacar a fanfarra triunfal retrô sintetizada
        audio.pararMusica(1.0);
        audio.tocarVitoriaFase();

        // Identifica mensagem motivacional correspondente
        const numFase = faseConcluida + 1;
        const msgConfig = MENSAGENS_MOTIVACIONAIS_FASE.find(m => m.fase === numFase) || {
            titulo: `FRENTE ${numFase} CONCLUÍDA!`,
            sub: this.dadosFaseAtual?.nome || 'Setor da Resistência Libertado',
            frase: "A democracia é a força viva do povo brasileiro! Nenhum passo atrás: a virada se constrói em cada trincheira!",
            autor: "VANGUARDA POPULAR 13"
        };

        const modal = document.getElementById('transicaoFaseModal');
        const tituloEl = document.getElementById('transicaoTituloFase');
        const nomeFaseEl = document.getElementById('transicaoNomeFase');
        const fraseEl = document.getElementById('transicaoFraseMotivacional');
        const autorEl = document.getElementById('transicaoAutorFrase');
        const bonusEl = document.getElementById('transicaoBonusPontos');
        const segundosEl = document.getElementById('transicaoSegundos');

        if (tituloEl) tituloEl.textContent = msgConfig.titulo;
        if (nomeFaseEl) nomeFaseEl.textContent = msgConfig.sub;
        if (fraseEl) fraseEl.textContent = `"${msgConfig.frase}"`;
        if (autorEl) autorEl.textContent = `— ${msgConfig.autor}`;
        if (bonusEl) bonusEl.textContent = `+${bonusPontos.toLocaleString('pt-BR')} PTS`;

        const holoOverlay = document.getElementById('holoOverlay');
        if (holoOverlay) {
            holoOverlay.style.display = 'none';
        }

        const gameOverModal = document.getElementById('gameOverModal');
        if (gameOverModal) {
            gameOverModal.style.display = 'none';
        }

        if (modal) {
            modal.style.display = 'flex';
        }

        // Contador regressivo de avanço automático (5 segundos)
        this.segundosRestantesTransicao = 5;
        if (segundosEl) segundosEl.textContent = this.segundosRestantesTransicao;

        if (this.intervaloContagemTransicao) clearInterval(this.intervaloContagemTransicao);
        this.intervaloContagemTransicao = setInterval(() => {
            this.segundosRestantesTransicao--;
            if (segundosEl) segundosEl.textContent = Math.max(0, this.segundosRestantesTransicao);

            if (this.segundosRestantesTransicao <= 0) {
                this.concluirTransicaoFase();
            }
        }, 1000);
    }

    /**
     * Finaliza a transição e inicia a Holotransmissão da próxima fase.
     */
    concluirTransicaoFase() {
        if (this.intervaloContagemTransicao) {
            clearInterval(this.intervaloContagemTransicao);
            this.intervaloContagemTransicao = null;
        }

        const modal = document.getElementById('transicaoFaseModal');
        if (modal) {
            modal.style.display = 'none';
        }

        // Avança de fato para o próximo setor e inicia Holotransmissão
        const prox = this.proximaFaseIndice !== undefined ? this.proximaFaseIndice : this.indiceFaseAtual + 1;
        this.indiceFaseAtual = prox;
        this.iniciarFase(this.indiceFaseAtual);
    }

    exibirFimDeJogo(vitoria, motivo = '') {
        this.estado = 'FIM_DE_JOGO';
        audio.tocarMusicaMenu(1.5);

        // Fecha modal de transição se estivesse aberto e cancela contagem
        if (this.intervaloContagemTransicao) {
            clearInterval(this.intervaloContagemTransicao);
            this.intervaloContagemTransicao = null;
        }
        const modalTransicao = document.getElementById('transicaoFaseModal');
        if (modalTransicao) modalTransicao.style.display = 'none';

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

        // Atualiza a exibição da identidade do piloto
        if (window.authUrna) {
            const piloto = window.authUrna.obterPiloto();
            const elNome = document.getElementById('identGameOverNome');
            const elStatus = document.getElementById('identGameOverStatus');
            if (elNome) elNome.textContent = piloto.codename || 'PILOTO 13';
            if (elStatus) {
                if (piloto.protegido) {
                    elStatus.className = 'ident-badge ident-badge-protegido';
                    elStatus.textContent = '🛡️ PROTEGIDO';
                } else {
                    elStatus.className = 'ident-badge ident-badge-publico';
                    elStatus.textContent = '🌐 PÚBLICO';
                }
            }
        }
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
            let coracoesHtml = '';
            for (let v = 0; v < this.jogador.vidas; v++) {
                coracoesHtml += '<svg class="px-icon px-icon-heart"><use href="#px-heart"/></svg>';
            }
            for (let e = 0; e < this.jogador.escudos; e++) {
                coracoesHtml += '<svg class="px-icon px-icon-shield"><use href="#px-shield"/></svg>';
            }
            elVidas.innerHTML = coracoesHtml || '<svg class="px-icon px-icon-heart" style="opacity:0.35;"><use href="#px-heart-broken"/></svg>';
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

        // Tela Inicial / Espera (só renderiza após carregamento concluído dos assets)
        if (this.estado === 'INICIO') {
            if (this.carregamentoConcluido) {
                this.desenharTelaInicial();
            }
            this.ctx.restore();
            return;
        }

        // Desenha Inimigos
        for (const inimigo of this.inimigos) {
            inimigo.desenhar(this.ctx);
        }

        // Desenha Chefe e Barra de Vida Épica
        if (this.chefe) {
            this.chefe.desenhar(this.ctx);

            // Barra de vida do Chefe no topo com visual arcade
            const pctHp = Math.max(0, this.chefe.hp / this.chefe.hpMax);
            const barW = this.cw - 60;
            const barX = 30;
            const barY = 22;

            // Fundo da barra
            this.ctx.fillStyle = 'rgba(7, 10, 19, 0.88)';
            this.ctx.fillRect(barX - 2, barY - 14, barW + 4, 25);

            // Título e Fase do Chefe
            this.ctx.font = '8px "Press Start 2P", "Courier New", monospace';
            this.ctx.fillStyle = '#facc15';
            this.ctx.textAlign = 'left';
            let labelChefe = this.chefe.nome.toUpperCase();
            if (this.chefe.idFase === 6) {
                const nomesFasesFinal = ['[FASE 1/4: BLINDAGEM]', '[FASE 2/4: ASA CORTADA]', '[FASE 3/4: NÚCLEO EXPOSTO]', '[FASE 4/4: CRÍTICO!]'];
                labelChefe = `A HIDRA ${nomesFasesFinal[this.chefe.faseDano - 1] || ''}`;
            }
            this.ctx.fillText(labelChefe, barX, barY - 4);

            // Indicador numérico de HP
            this.ctx.textAlign = 'right';
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillText(`${this.chefe.hp}/${this.chefe.hpMax}`, barX + barW, barY - 4);
            this.ctx.textAlign = 'left';

            // Fundo da barra de vida
            this.ctx.fillStyle = '#1e293b';
            this.ctx.fillRect(barX, barY, barW, 6);

            // Cor da barra de vida varia com a fase/perigo
            let corHp = '#ef4444';
            if (this.chefe.idFase === 6) {
                if (this.chefe.faseDano === 2) corHp = '#f97316';
                else if (this.chefe.faseDano === 3) corHp = '#facc15';
                else if (this.chefe.faseDano === 4) {
                    corHp = (Math.floor(Date.now() / 150) % 2 === 0) ? '#ffffff' : '#ef4444';
                }
            }
            this.ctx.fillStyle = corHp;
            this.ctx.fillRect(barX, barY, barW * pctHp, 6);

            // Borda dourada
            this.ctx.strokeStyle = '#facc15';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(barX, barY, barW, 6);
        }

        // Desenha Sequência Cinematográfica de Destruição do Chefe (Boss Death)
        if (this.animacaoDestruicaoChefe) {
            const anim = this.animacaoDestruicaoChefe;

            // Desenha pedaços que se soltaram e caem
            for (const pedaco of anim.pedacosAtivos) {
                pedaco.desenhar(this.ctx);
            }

            // Desenha a carcaça do chefe com tremores e piscamento dramático
            this.ctx.save();
            const sx = (Math.random() - 0.5) * 4;
            const sy = (Math.random() - 0.5) * 4;
            this.ctx.translate(anim.x + sx, anim.y + sy);

            // Sprite do chefe no momento da queda
            let spriteDesenho = anim.sprite;
            if (anim.idFase === 6 && anim.spritesFases.length >= anim.faseDano) {
                const sf = anim.spritesFases[anim.faseDano - 1];
                if (sf && sf.complete && sf.naturalWidth > 0) spriteDesenho = sf;
            }

            // Se ainda não houve a detonação final completa (quadro 130), desenha a carcaça
            if (anim.quadro < 130) {
                if (spriteDesenho && spriteDesenho.complete && spriteDesenho.naturalWidth > 0) {
                    this.ctx.drawImage(spriteDesenho, 0, 0, anim.largura, anim.altura);
                } else {
                    this.ctx.fillStyle = '#dc2626';
                    this.ctx.fillRect(0, 0, anim.largura, anim.altura);
                }

                // Clarão de impacto sobre a carcaça durante explosões
                if (anim.flashBranco > 0) {
                    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
                    this.ctx.fillRect(0, 0, anim.largura, anim.altura);
                }
            }

            this.ctx.restore();
        }

        // Alerta Tático da Batalha (Entrada do Chefe, Dano Crítico ou Power-ups)
        if (this.tempoAlertaChefe > 0 && this.textoAlertaChefe) {
            const alphaAlerta = Math.min(1, this.tempoAlertaChefe / 20);
            this.ctx.save();
            this.ctx.globalAlpha = alphaAlerta;

            const ehChefe = this.tipoAlertaChefe === 'chefe';
            const ehCritico = this.tipoAlertaChefe === 'critico';
            const ehVitoria = this.tipoAlertaChefe === 'vitoria';

            // Cores dinâmicas de acordo com o evento tático
            let corBorda = '#38bdf8';
            let corFundo = 'rgba(15, 23, 42, 0.95)';
            let corTitulo = '#fef08a';
            let corSub = '#94a3b8';

            if (ehChefe) {
                // Alerta Vermelho de Emergência com pulsação neon
                const pulso = Math.floor(Date.now() / 120) % 2 === 0;
                corBorda = pulso ? '#ef4444' : '#facc15';
                corFundo = 'rgba(24, 8, 14, 0.96)';
                corTitulo = pulso ? '#ffffff' : '#facc15';
                corSub = '#fca5a5';
            } else if (ehCritico) {
                corBorda = '#f97316';
                corFundo = 'rgba(30, 15, 10, 0.95)';
                corTitulo = '#fdba74';
                corSub = '#fef08a';
            } else if (ehVitoria) {
                corBorda = '#22c55e';
                corFundo = 'rgba(10, 26, 18, 0.95)';
                corTitulo = '#4ade80';
                corSub = '#bbf7d0';
            }

            const boxW = this.cw - 24;
            const boxX = 12;
            const boxH = this.subtextoAlertaChefe ? 48 : 32;
            // Quando estiver em combate contra o chefe (this.chefe ativo) ou for alerta de chefe/suprimento de chefe,
            // posiciona o banner no centro vertical da tela para desobstruir a visão do topo e da nave do jogador
            const noMeio = ehChefe || (this.chefe !== null);
            const boxY = noMeio ? Math.floor(this.ch / 2 - boxH / 2) : 50;

            // Fundo escurecido de alta opacidade
            this.ctx.fillStyle = corFundo;
            this.ctx.fillRect(boxX, boxY, boxW, boxH);

            // Borda neon dupla estilo HUD militar Sci-Fi
            this.ctx.strokeStyle = corBorda;
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(boxX, boxY, boxW, boxH);

            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(boxX + 2, boxY + 2, boxW - 4, boxH - 4);

            // Texto Principal do Alerta: Fonte VCR OSD Mono ampliada para leitura nítida (13px)
            this.ctx.font = 'bold 13px "VCR OSD Mono", "Press Start 2P", monospace';
            this.ctx.fillStyle = corTitulo;
            this.ctx.textAlign = 'center';

            if (this.subtextoAlertaChefe) {
                this.ctx.fillText(this.textoAlertaChefe, this.cw / 2, boxY + 18);

                // Subtexto descritivo explicativo (10px)
                this.ctx.font = '10px "VCR OSD Mono", monospace';
                this.ctx.fillStyle = corSub;
                this.ctx.fillText(this.subtextoAlertaChefe, this.cw / 2, boxY + 35);
            } else {
                this.ctx.fillText(this.textoAlertaChefe, this.cw / 2, boxY + 18);
            }

            this.ctx.restore();
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
        if (!this.carregamentoConcluido) return;
        this.ctx.fillStyle = '#facc15';
        this.ctx.font = '700 24px "VCR OSD Mono", monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('LEVANTE 13: A VIRADA', this.cw / 2, 220);

        this.ctx.fillStyle = '#38bdf8';
        this.ctx.font = '13px "VCR OSD Mono", monospace';
        this.ctx.fillText('A RESISTÊNCIA POPULAR CONTRA O FASCISMO', this.cw / 2, 248);

        // Estrela central brilhante
        this.ctx.fillStyle = '#ef4444';
        this.ctx.beginPath();
        this.ctx.arc(this.cw / 2, 330, 28, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '24px "VCR OSD Mono", monospace';
        this.ctx.fillText('★', this.cw / 2, 338);

        // Instrução para iniciar
        const piscar = Math.floor(Date.now() / 400) % 2 === 0;
        if (piscar) {
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '700 15px "VCR OSD Mono", monospace';
            this.ctx.fillText('TOQUE OU ESPAÇO PARA JOGAR', this.cw / 2, 450);
        }

        this.ctx.fillStyle = '#94a3b8';
        this.ctx.font = '12px "VCR OSD Mono", monospace';
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

// Inicia o motor após o carregamento da janela com Time Step Fixo (60 FPS)
// Isso impede que telas móveis com taxa dinâmica (120Hz ao tocar na tela / 60Hz ocioso)
// acelerem a velocidade dos inimigos e da física do jogo.
window.addEventListener('DOMContentLoaded', () => {
    window.jogo = new MotorLevante13();

    const PASSO_FIXO_MS = 1000 / 60; // 60 atualizações lógicas por segundo (~16.66ms)
    let tempoAnterior = 0;
    let acumulador = 0;

    function loop(timestamp) {
        if (!tempoAnterior) tempoAnterior = timestamp;
        let delta = timestamp - tempoAnterior;
        tempoAnterior = timestamp;

        // Limita o delta máximo (250ms) para evitar congelamentos ao alternar abas
        if (delta > 250) delta = 250;

        acumulador += delta;

        // Consome o tempo acumulado em passos exatos de 60Hz
        let atualizacoes = 0;
        while (acumulador >= PASSO_FIXO_MS && atualizacoes < 5) {
            window.jogo.atualizar();
            acumulador -= PASSO_FIXO_MS;
            atualizacoes++;
        }

        // Renderização fluida a cada quadro do navegador
        window.jogo.desenhar();
        requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);
});
