// =============================================================================
// LEVANTE 13: A VIRADA — Entidades do Jogo (Player, Inimigos, Tiros, Power-ups)
// Arquivo: js/entities.js
// =============================================================================

/**
 * A Fragata Rebelde: Vanguarda 13
 */
class Jogador {
    constructor(canvasWidth, canvasHeight) {
        this.cw = canvasWidth;
        this.ch = canvasHeight;
        this.largura = 32;
        this.altura = 26;
        this.x = canvasWidth / 2 - this.largura / 2;
        // Posição base mais elevada (84px da borda inferior) para evitar que o dedo fique sobre a nave no celular
        this.y = canvasHeight - 84;
        this.velocidade = 4.5;
        this.vidas = 3;
        this.escudos = 0; // Concedidos pelo power-up da CLT

        // Controles de disparo e melhorias ativas
        this.temporizadorTiro = 0;
        this.intervaloTiro = 14; // Quadros entre cada disparo contínuo
        this.tempoLaserPerfurante = 0; // Duração em quadros
        this.tempoTiroTriplo = 0;
        this.tempoInvulnerabilidade = 0;

        // Efeito de propulsor de partículas
        this.particulas = [];
    }

    atualizar(teclas, touchX, touchY = null) {
        // Movimentação via Teclado
        if (teclas['ArrowLeft'] || teclas['KeyA']) {
            this.x -= this.velocidade;
        }
        if (teclas['ArrowRight'] || teclas['KeyD']) {
            this.x += this.velocidade;
        }
        if (teclas['ArrowUp'] || teclas['KeyW']) {
            this.y -= this.velocidade;
        }
        if (teclas['ArrowDown'] || teclas['KeyS']) {
            this.y += this.velocidade;
        }

        // Movimentação via Touch suave com offset para o dedo ficar logo abaixo da nave (visibilidade perfeita)
        if (touchX !== null) {
            const destinoX = touchX - this.largura / 2;
            const diffX = destinoX - this.x;
            this.x += diffX * 0.28; // Interpolação suave

            if (touchY !== null) {
                // Offset de ~50px acima do ponto de toque do dedo
                const destinoY = touchY - this.altura - 45;
                const diffY = destinoY - this.y;
                this.y += diffY * 0.25;
            }
        }

        // Limites de tela (horizontal e vertical)
        this.x = Math.max(6, Math.min(this.cw - this.largura - 6, this.x));
        this.y = Math.max(140, Math.min(this.ch - this.altura - 20, this.y));

        // Atualização de timers de power-ups
        if (this.temporizadorTiro > 0) this.temporizadorTiro--;
        if (this.tempoLaserPerfurante > 0) this.tempoLaserPerfurante--;
        if (this.tempoTiroTriplo > 0) this.tempoTiroTriplo--;
        if (this.tempoInvulnerabilidade > 0) this.tempoInvulnerabilidade--;

        // Efeito do rastro do motor
        if (Math.random() < 0.6) {
            this.particulas.push({
                x: this.x + this.largura / 2 + (Math.random() * 6 - 3),
                y: this.y + this.altura,
                vx: (Math.random() - 0.5) * 0.8,
                vy: Math.random() * 2 + 1.5,
                vida: 16,
                maxVida: 16,
                cor: Math.random() > 0.4 ? '#ef4444' : '#facc15'
            });
        }

        // Atualiza partículas do propulsor
        for (let i = this.particulas.length - 1; i >= 0; i--) {
            const p = this.particulas[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vida--;
            if (p.vida <= 0) this.particulas.splice(i, 1);
        }
    }

    podeAtirar() {
        return this.temporizadorTiro <= 0;
    }

    disparar() {
        const tiros = [];
        const centroX = this.x + this.largura / 2;

        if (this.tempoLaserPerfurante > 0) {
            // Raio Laser Perfurante (Paulo Freire) - cadência ligeiramente mais pesada (18 quadros) para disparo equilibrado
            this.temporizadorTiro = 18;
            tiros.push(new Projetil(centroX - 3, this.y - 12, 0, -9, 'laser', '#38bdf8', true));
            audio.tocarLaserPerfurante();
        } else if (this.tempoTiroTriplo > 0) {
            // Disparo Triplo em Leque (Megafone)
            this.temporizadorTiro = this.intervaloTiro;
            tiros.push(new Projetil(centroX - 2, this.y - 4, 0, -7, 'normal', '#facc15'));
            tiros.push(new Projetil(centroX - 6, this.y - 2, -1.8, -6.5, 'normal', '#facc15'));
            tiros.push(new Projetil(centroX + 2, this.y - 2, 1.8, -6.5, 'normal', '#facc15'));
            audio.tocarTiro();
        } else {
            // Disparo duplo padrão de energia
            this.temporizadorTiro = this.intervaloTiro;
            tiros.push(new Projetil(this.x + 4, this.y - 2, 0, -7.5, 'normal', '#ef4444'));
            tiros.push(new Projetil(this.x + this.largura - 8, this.y - 2, 0, -7.5, 'normal', '#ef4444'));
            audio.tocarTiro();
        }

        return tiros;
    }

    receberDano() {
        if (this.tempoInvulnerabilidade > 0) return false;

        // Escudo da CLT absorve primeiro
        if (this.escudos > 0) {
            this.escudos--;
            this.tempoInvulnerabilidade = 45;
            audio.tocarDano();
            return false;
        }

        this.vidas--;
        this.tempoInvulnerabilidade = 75; // 1.25 segundos piscando
        audio.tocarDano();
        return true;
    }

    desenhar(ctx) {
        // Desenha rastro do propulsor
        for (const p of this.particulas) {
            ctx.fillStyle = p.cor;
            ctx.globalAlpha = p.vida / p.maxVida;
            ctx.fillRect(p.x, p.y, 2, 3);
        }
        ctx.globalAlpha = 1;

        // Efeito piscante de invulnerabilidade
        if (this.tempoInvulnerabilidade > 0 && Math.floor(this.tempoInvulnerabilidade / 6) % 2 === 0) {
            return;
        }

        ctx.save();
        ctx.translate(this.x, this.y);

        // Fuselagem central vermelha da Vanguarda 13
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.moveTo(16, 0);       // Bico afiado
        ctx.lineTo(26, 18);
        ctx.lineTo(32, 24);      // Asa direita
        ctx.lineTo(24, 24);
        ctx.lineTo(20, 18);
        ctx.lineTo(12, 18);
        ctx.lineTo(8, 24);
        ctx.lineTo(0, 24);       // Asa esquerda
        ctx.lineTo(6, 18);
        ctx.closePath();
        ctx.fill();

        // Detalhes em verde e amarelo patriótico popular
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(10, 12, 12, 4);

        ctx.fillStyle = '#facc15';
        ctx.fillRect(14, 6, 4, 6);

        // Estrela central da Esperança
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(16, 14, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Escudo luminoso da CLT em volta
        if (this.escudos > 0) {
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(16, 12, 22, 0, Math.PI * 2);
            ctx.stroke();
        }

        ctx.restore();
    }
}

/**
 * Projétil disparado por naves amigas ou inimigas
 */
class Projetil {
    constructor(x, y, vx, vy, tipo = 'normal', cor = '#ef4444', perfurante = false, inimigo = false) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.tipo = tipo;
        this.cor = cor;
        this.perfurante = perfurante;
        this.inimigo = inimigo;
        this.largura = perfurante ? 6 : 4;
        this.altura = perfurante ? 20 : 9;
        this.removido = false;
        this.atingiuChefe = false; // Garante que o laser não aplique múltiplos danos por frame ao mesmo chefe
    }

    atualizar() {
        this.x += this.vx;
        this.y += this.vy;
    }

    desenhar(ctx) {
        ctx.fillStyle = this.cor;
        ctx.shadowColor = this.cor;
        ctx.shadowBlur = 6;
        ctx.fillRect(this.x, this.y, this.largura, this.altura);
        ctx.shadowBlur = 0;
    }
}

/**
 * Inimigos Invasores (Drones, Robôs, Inquisidores e Blindados)
 */
class Inimigo {
    constructor(baseX, baseY, configTipo, imagemSprite = null, linha = 0, coluna = 0) {
        this.baseX = baseX;
        this.baseY = baseY;
        this.x = baseX;
        this.y = baseY;
        this.largura = 28;
        this.altura = 24;
        this.linha = linha;
        this.coluna = coluna;
        this.id = configTipo.id;
        this.nome = configTipo.name;
        this.hp = configTipo.hp || 1;
        this.hpMax = this.hp;
        this.pontos = configTipo.points || 50;
        this.cor = configTipo.color || '#ef4444';
        this.comportamento = configTipo.behavior || 'march';
        this.sprite = imagemSprite;

        // Deslocamentos procedurais do padrão da fase
        this.offsetX = 0;
        this.offsetY = 0;

        // Parâmetros de quebra de manada / comportamento errático individual
        this.faseErrataX = Math.random() * Math.PI * 2;
        this.faseErrataY = Math.random() * Math.PI * 2;
        this.velocidadeErrata = 0.8 + Math.random() * 0.9;
        this.frequenciaJitter = 1.2 + Math.random() * 1.6;

        // Parâmetros para mergulhos rasantes táticos (estilo Galaga)
        this.emMergulho = false;
        this.origemX = baseX;
        this.origemY = baseY;
        this.tempoMergulho = 0;
        this.mergulhoVx = 0;
        this.alvoX = 0;
    }

    iniciarMergulho(alvoX) {
        if (this.emMergulho) return;
        this.emMergulho = true;
        this.tempoMergulho = 0;
        this.alvoX = alvoX;
        this.mergulhoVx = (alvoX > this.x ? 1 : -1) * (1.2 + Math.random() * 1.5);
    }

    atualizarMergulho() {
        if (!this.emMergulho) return;

        this.tempoMergulho += 0.035;
        this.y += 3.3;
        this.x += Math.sin(this.tempoMergulho * 3.5) * 2.8 + this.mergulhoVx * 0.4;

        // Se passar do fim da tela, encerra mergulho e retorna suavemente à formação
        if (this.y > 650) {
            this.y = -30;
            this.emMergulho = false;
        }
    }

    desenhar(ctx) {
        if (this.sprite && this.sprite.complete && this.sprite.naturalWidth > 0) {
            ctx.drawImage(this.sprite, this.x, this.y, this.largura, this.altura);
        } else {
            // Renderização procedural retrô
            ctx.fillStyle = this.cor;
            ctx.fillRect(this.x + 4, this.y + 4, this.largura - 8, this.altura - 8);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(this.x + 8, this.y + 8, 3, 4);
            ctx.fillRect(this.x + this.largura - 11, this.y + 8, 3, 4);
        }
    }
}

/**
 * Pedaços e Destroços Ejetados pelo Chefe ao Sofrer Dano Crítico
 */
class PedacoChefe {
    constructor(x, y, vx, vy, vRot, sprite = null, largura = 30, altura = 34) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.vRot = vRot;
        this.rotacao = 0;
        this.sprite = sprite;
        this.largura = largura;
        this.altura = altura;
        this.vida = 220; // Quadros de vida na tela
        this.removido = false;
        this.rastroFumaca = [];
    }

    atualizar() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.08; // Gravidade acelerando a queda
        this.rotacao += this.vRot;
        this.vida--;

        // Rastro de fumaça e fagulhas incandescentes
        if (Math.random() < 0.65) {
            this.rastroFumaca.push({
                x: this.x + (Math.random() * 8 - 4),
                y: this.y + (Math.random() * 8 - 4),
                raio: 2 + Math.random() * 3.5,
                opacidade: 0.85,
                cor: Math.random() < 0.35 ? '#f97316' : '#64748b'
            });
        }

        for (let i = this.rastroFumaca.length - 1; i >= 0; i--) {
            const f = this.rastroFumaca[i];
            f.y += 0.4;
            f.raio += 0.12;
            f.opacidade -= 0.02;
            if (f.opacidade <= 0) this.rastroFumaca.splice(i, 1);
        }

        if (this.vida <= 0 || this.y > 660) {
            this.removido = true;
        }
    }

    desenhar(ctx) {
        // Desenha rastro de fumaça do destroço
        for (const f of this.rastroFumaca) {
            ctx.fillStyle = f.cor;
            ctx.globalAlpha = Math.max(0, f.opacidade);
            ctx.beginPath();
            ctx.arc(f.x, f.y, f.raio, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.globalAlpha = Math.max(0, Math.min(1, this.vida / 30));
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotacao);

        if (this.sprite && this.sprite.complete && this.sprite.naturalWidth > 0) {
            ctx.drawImage(this.sprite, -this.largura / 2, -this.altura / 2, this.largura, this.altura);
        } else {
            // Destroço metálico recortado com fogo
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(-this.largura / 2, -this.altura / 2, this.largura, this.altura);
            ctx.fillStyle = '#dc2626';
            ctx.fillRect(-this.largura / 4, -this.altura / 4, this.largura / 2, this.altura / 2);
            ctx.fillStyle = '#facc15';
            ctx.fillRect(-3, -3, 6, 6);
        }

        ctx.restore();
        ctx.globalAlpha = 1.0;
    }
}

/**
 * Naves Capitânias: Chefes de Setor
 * Cada fase possui uma máquina de guerra com estética e mecânicas próprias.
 * O Chefe Final (Fase 6 - A Hidra Golpista) perde pedaços progressivamente
 * à medida que leva dano, com armas escalando em fúria.
 */
class ChefeSetor {
    constructor(canvasWidth, configChefe, spritePrincipal = null, idFase = 1) {
        this.cw = canvasWidth;
        this.idFase = idFase;
        this.nome = configChefe.name || 'Nave Capitânia';
        this.titulo = configChefe.title || 'Força de Ocupação';
        this.hp = configChefe.hp || (idFase === 6 ? 70 : 30);
        this.hpMax = this.hp;
        this.pontos = configChefe.points || (idFase === 6 ? 5000 : 2000);
        this.padrao = configChefe.attackPattern || 'circular_spread';

        // Dimensões do casco
        if (this.idFase === 6) {
            this.largura = 96;
            this.altura = 64;
        } else {
            this.largura = 76;
            this.altura = 50;
        }

        this.x = canvasWidth / 2 - this.largura / 2;
        this.y = -70; // Entrada majestosa descendo
        this.yDestino = 45;
        this.velocidadeX = this.idFase === 6 ? 1.6 : 1.9;
        this.direcaoX = 1;
        this.temporizadorDisparo = 0;
        // Período de ~2 segundos (120 quadros) após descer para o banner sumir antes de iniciar a batalha
        this.temporizadorEsperaCombate = 120;
        this.derrotado = false;
        this.tempo = 0; // Oscilação e cálculo de rajadas

        // Sprites e Fases de Dano
        this.sprite = spritePrincipal;
        this.faseDano = 1; // 1: 100-75%, 2: 75-50%, 3: 50-25%, 4: <25%
        this.temporizadorInvulnerabilidade = 0; // Blindagem energética anti-derretimento rápido (micro-cooldown entre hits)
        this.droppouMeio = false;
        this.pedacosEjetados = {
            asaEsquerda: false,
            asaDireita: false,
            placaPeito: false
        };
        this.pedacosAtivos = [];
        this.particulasDano = [];

        // Pré-carrega fases visuais e destroços do Chefe Final
        this.spritesFases = [];
        this.spritesDestrocos = {};
        if (this.idFase === 6) {
            this.carregarAssetsChefeFinal();
        }
    }

    carregarAssetsChefeFinal() {
        const caminhos = [
            'levels/level_6/boss_phase1.png',
            'levels/level_6/boss_phase2.png',
            'levels/level_6/boss_phase3.png',
            'levels/level_6/boss_phase4.png'
        ];
        this.spritesFases = caminhos.map(src => {
            const img = new Image();
            img.src = src;
            return img;
        });

        const imgAsaEsq = new Image();
        imgAsaEsq.src = 'levels/level_6/boss_piece_wing_left.png';
        const imgAsaDir = new Image();
        imgAsaDir.src = 'levels/level_6/boss_piece_wing_right.png';
        const imgPlaca = new Image();
        imgPlaca.src = 'levels/level_6/boss_piece_core_plate.png';

        this.spritesDestrocos = {
            asaEsquerda: imgAsaEsq,
            asaDireita: imgAsaDir,
            placaPeito: imgPlaca
        };
    }

    receberDano(dano = 1, ignorarCooldown = false) {
        // Se a blindagem energética estiver ativa em micro-cooldown, absorve o dano contínuo excessivo
        if (!ignorarCooldown && this.temporizadorInvulnerabilidade > 0) {
            return {
                mudouFase: false,
                soltarPowerUp: false,
                faseAtual: this.faseDano,
                bloqueadoPelaBlindagem: true
            };
        }

        // Aplica janela de invulnerabilidade rápida (5 quadros ~80ms) para amortecer disparos contínuos automáticos
        this.temporizadorInvulnerabilidade = 5;

        this.hp -= dano;
        const pctHp = Math.max(0, this.hp / this.hpMax);

        const eventos = {
            mudouFase: false,
            soltarPowerUp: false,
            faseAtual: this.faseDano,
            bloqueadoPelaBlindagem: false
        };

        if (this.idFase === 6) {
            // Transição para Fase 2 (<= 75% HP) — Perde Asa Esquerda e Canhão
            if (pctHp <= 0.75 && !this.pedacosEjetados.asaEsquerda) {
                this.pedacosEjetados.asaEsquerda = true;
                this.faseDano = 2;
                eventos.mudouFase = true;
                eventos.soltarPowerUp = true;
                this.velocidadeX = 2.2; // Acelera movimentação
                this.pedacosAtivos.push(new PedacoChefe(
                    this.x + 10,
                    this.y + 24,
                    -2.4, -2.6, -0.09,
                    this.spritesDestrocos.asaEsquerda,
                    32, 36
                ));
            }

            // Transição para Fase 3 (<= 50% HP) — Perde Asa Direita e Placa Frontal do Núcleo
            if (pctHp <= 0.50 && !this.pedacosEjetados.asaDireita) {
                this.pedacosEjetados.asaDireita = true;
                this.pedacosEjetados.placaPeito = true;
                this.faseDano = 3;
                eventos.mudouFase = true;
                eventos.soltarPowerUp = true;
                this.velocidadeX = 2.8; // Acelera mais
                this.pedacosAtivos.push(
                    new PedacoChefe(
                        this.x + this.largura - 10,
                        this.y + 24,
                        2.4, -2.6, 0.09,
                        this.spritesDestrocos.asaDireita,
                        32, 36
                    ),
                    new PedacoChefe(
                        this.x + this.largura / 2,
                        this.y + 36,
                        (Math.random() - 0.5) * 1.6, -2.0, 0.05,
                        this.spritesDestrocos.placaPeito,
                        28, 24
                    )
                );
            }

            // Transição para Fase 4 (<= 25% HP) — Modo Desespero / Sobrecarga Térmica
            if (pctHp <= 0.25 && this.faseDano < 4) {
                this.faseDano = 4;
                eventos.mudouFase = true;
                eventos.soltarPowerUp = true;
                this.velocidadeX = 3.4; // Fúria frenética
            }
        } else {
            // Chefes dos níveis 1 a 5: apoio popular ao chegar em 50% de vida
            if (pctHp <= 0.50 && !this.droppouMeio) {
                this.droppouMeio = true;
                eventos.soltarPowerUp = true;
            }
        }

        eventos.faseAtual = this.faseDano;
        return eventos;
    }

    atualizar() {
        this.tempo += 0.05;

        // Entrada em cena descendo suavemente
        if (this.y < this.yDestino) {
            this.y += 1.8;
            return;
        }

        // Aguarda os ~2 segundos de introdução para o banner sumir antes de iniciar o combate
        if (this.temporizadorEsperaCombate > 0) {
            this.temporizadorEsperaCombate--;
            return;
        }

        // Movimentação lateral oscilatória
        this.x += this.velocidadeX * this.direcaoX;
        if (this.x < 10) {
            this.x = 10;
            this.direcaoX = 1;
        } else if (this.x > this.cw - this.largura - 10) {
            this.x = this.cw - this.largura - 10;
            this.direcaoX = -1;
        }

        // Se for o Chefe Final em modo desespero (Fase 4), oscilação e tremores
        if (this.idFase === 6 && this.faseDano === 4) {
            this.x += (Math.random() - 0.5) * 2;
        }

        if (this.temporizadorDisparo > 0) this.temporizadorDisparo--;
        if (this.temporizadorInvulnerabilidade > 0) this.temporizadorInvulnerabilidade--;

        // Geração contínua de fumaça, chamas e faíscas nos cotos danificados
        this.atualizarParticulasDano();

        // Atualização dos pedaços e destroços caindo
        for (let i = this.pedacosAtivos.length - 1; i >= 0; i--) {
            const p = this.pedacosAtivos[i];
            p.atualizar();
            if (p.removido) this.pedacosAtivos.splice(i, 1);
        }
    }

    atualizarParticulasDano() {
        if (this.idFase === 6) {
            // Fase 2: faíscas e fumaça no coto da asa esquerda
            if (this.faseDano >= 2 && Math.random() < 0.6) {
                this.particulasDano.push({
                    x: this.x + 14 + (Math.random() * 6 - 3),
                    y: this.y + 24 + (Math.random() * 6 - 3),
                    vx: -0.8 - Math.random() * 1.2,
                    vy: Math.random() * 1.5 - 0.5,
                    raio: 1.5 + Math.random() * 2,
                    cor: Math.random() < 0.4 ? '#38bdf8' : (Math.random() < 0.5 ? '#facc15' : '#64748b'),
                    vida: 25, maxVida: 25
                });
            }

            // Fase 3: faíscas na asa direita e vapor no núcleo central
            if (this.faseDano >= 3 && Math.random() < 0.6) {
                this.particulasDano.push({
                    x: this.x + this.largura - 14 + (Math.random() * 6 - 3),
                    y: this.y + 24 + (Math.random() * 6 - 3),
                    vx: 0.8 + Math.random() * 1.2,
                    vy: Math.random() * 1.5 - 0.5,
                    raio: 1.5 + Math.random() * 2,
                    cor: Math.random() < 0.5 ? '#facc15' : '#64748b',
                    vida: 25, maxVida: 25
                });
                // Chamas do núcleo
                this.particulasDano.push({
                    x: this.x + this.largura / 2 + (Math.random() * 8 - 4),
                    y: this.y + 38 + (Math.random() * 8 - 4),
                    vx: (Math.random() - 0.5) * 1.2,
                    vy: 1.2 + Math.random() * 1.5,
                    raio: 2 + Math.random() * 2.5,
                    cor: Math.random() < 0.5 ? '#f97316' : '#ef4444',
                    vida: 20, maxVida: 20
                });
            }

            // Fase 4: Chamas completas engolfando o casco
            if (this.faseDano >= 4) {
                for (let k = 0; k < 2; k++) {
                    this.particulasDano.push({
                        x: this.x + Math.random() * this.largura,
                        y: this.y + Math.random() * this.altura,
                        vx: (Math.random() - 0.5) * 2,
                        vy: -1.0 - Math.random() * 2,
                        raio: 2 + Math.random() * 3,
                        cor: Math.random() < 0.35 ? '#ffffff' : (Math.random() < 0.6 ? '#facc15' : '#ef4444'),
                        vida: 22, maxVida: 22
                    });
                }
            }
        }

        // Atualiza partículas de dano
        for (let i = this.particulasDano.length - 1; i >= 0; i--) {
            const p = this.particulasDano[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vida--;
            if (p.vida <= 0) this.particulasDano.splice(i, 1);
        }
    }

    podeDisparar() {
        return this.y >= this.yDestino && this.temporizadorEsperaCombate <= 0 && this.temporizadorDisparo <= 0;
    }

    disparar() {
        const tiros = [];
        const centroX = this.x + this.largura / 2;
        const base = this.y + this.altura;

        switch (this.idFase) {
            case 1: {
                // O Super-Robô da Mentira (Gabinete do Ódio):
                // Leque de desinformação com 5 projéteis vermelhos e cianos
                this.temporizadorDisparo = 46;
                tiros.push(new Projetil(centroX, base, 0, 3.8, 'chefe', '#ef4444', false, true));
                tiros.push(new Projetil(centroX - 16, base - 4, -1.2, 3.3, 'chefe', '#38bdf8', false, true));
                tiros.push(new Projetil(centroX + 16, base - 4, 1.2, 3.3, 'chefe', '#38bdf8', false, true));
                tiros.push(new Projetil(centroX - 28, base - 10, -2.2, 3.0, 'chefe', '#ef4444', false, true));
                tiros.push(new Projetil(centroX + 28, base - 10, 2.2, 3.0, 'chefe', '#ef4444', false, true));
                break;
            }

            case 2: {
                // O Algoritmo da Precarização (Setor Fabril):
                // Prensa industrial: salvas duplas verticais rápidas dos flancos de engrenagem
                this.temporizadorDisparo = 36;
                tiros.push(new Projetil(this.x + 8, base, 0, 4.2, 'chefe', '#ea580c', false, true));
                tiros.push(new Projetil(this.x + 14, base, 0, 4.2, 'chefe', '#facc15', false, true));
                tiros.push(new Projetil(this.x + this.largura - 14, base, 0, 4.2, 'chefe', '#facc15', false, true));
                tiros.push(new Projetil(this.x + this.largura - 8, base, 0, 4.2, 'chefe', '#ea580c', false, true));
                break;
            }

            case 3: {
                // O Correntão da Devastação (Reserva Planetária):
                // Disparo espiral circular cortante de lâminas / motosserras
                this.temporizadorDisparo = 40;
                const anguloBase = this.tempo * 1.5;
                for (let k = -1; k <= 1; k++) {
                    const vx = Math.sin(anguloBase + k * 0.7) * 2.8;
                    const vy = Math.cos(anguloBase + k * 0.7) * 1.8 + 2.5;
                    tiros.push(new Projetil(centroX + k * 18, base, vx, vy, 'chefe', '#f97316', false, true));
                }
                break;
            }

            case 4: {
                // A Quimera do Obscurantismo (Complexo da Vida):
                // Rajada de 4 agulhas com toxina verde ácida
                this.temporizadorDisparo = 38;
                tiros.push(new Projetil(this.x + 12, base, -0.9, 3.6, 'chefe', '#84cc16', false, true));
                tiros.push(new Projetil(this.x + 24, base, -0.3, 4.0, 'chefe', '#bef264', false, true));
                tiros.push(new Projetil(this.x + this.largura - 24, base, 0.3, 4.0, 'chefe', '#bef264', false, true));
                tiros.push(new Projetil(this.x + this.largura - 12, base, 0.9, 3.6, 'chefe', '#84cc16', false, true));
                break;
            }

            case 5: {
                // O Falso Profeta do Ódio (Santuário da Fé):
                // Cruzada inquisitorial sagrada: rajada cruciforme expansiva
                this.temporizadorDisparo = 34;
                tiros.push(new Projetil(centroX, base, 0, 4.0, 'chefe', '#facc15', false, true));
                tiros.push(new Projetil(centroX, base - 10, -1.8, 3.2, 'chefe', '#dc2626', false, true));
                tiros.push(new Projetil(centroX, base - 10, 1.8, 3.2, 'chefe', '#dc2626', false, true));
                tiros.push(new Projetil(centroX - 20, base, -1.0, 3.6, 'chefe', '#facc15', false, true));
                tiros.push(new Projetil(centroX + 20, base, 1.0, 3.6, 'chefe', '#facc15', false, true));
                break;
            }

            case 6: {
                // A Hidra Golpista (Fortaleza Imperial da Tirania) - ESCALADA POR FASES
                if (this.faseDano === 1) {
                    // FASE 1: Blindagem total intacta — Canhões pesados duplos
                    this.temporizadorDisparo = 42;
                    tiros.push(new Projetil(this.x + 10, base - 4, -0.4, 3.8, 'chefe', '#dc2626', false, true));
                    tiros.push(new Projetil(this.x + 14, base - 4, -0.1, 3.8, 'chefe', '#ef4444', false, true));
                    tiros.push(new Projetil(this.x + this.largura - 14, base - 4, 0.1, 3.8, 'chefe', '#ef4444', false, true));
                    tiros.push(new Projetil(this.x + this.largura - 10, base - 4, 0.4, 3.8, 'chefe', '#dc2626', false, true));
                    tiros.push(new Projetil(centroX, base, 0, 4.2, 'chefe', '#facc15', false, true));
                } else if (this.faseDano === 2) {
                    // FASE 2: Asa esquerda arrancada! Canhão direito sobrecarregado + faíscas erráticas
                    this.temporizadorDisparo = 30; // Mais rápido
                    tiros.push(new Projetil(this.x + this.largura - 12, base, -0.6, 4.0, 'chefe', '#ef4444', false, true));
                    tiros.push(new Projetil(this.x + this.largura - 8, base, 0.4, 4.2, 'chefe', '#dc2626', false, true));
                    tiros.push(new Projetil(this.x + this.largura - 4, base, 1.4, 3.8, 'chefe', '#facc15', false, true));
                    // Descarga caótica do coto arrebentado
                    const erraticoVx = (Math.random() - 0.7) * 2.5;
                    tiros.push(new Projetil(this.x + 12, base - 10, erraticoVx, 3.5, 'chefe', '#38bdf8', false, true));
                } else if (this.faseDano === 3) {
                    // FASE 3: Ambas as asas destruídas! Núcleo exposto giratório
                    this.temporizadorDisparo = 22; // Muito veloz
                    const anguloGiro = this.tempo * 2.2;
                    for (let a = -2; a <= 2; a++) {
                        const vx = Math.sin(anguloGiro + a * 0.5) * 2.4;
                        const vy = 3.6 + Math.cos(anguloGiro + a * 0.5) * 0.6;
                        tiros.push(new Projetil(centroX, base - 6, vx, vy, 'chefe', a % 2 === 0 ? '#ef4444' : '#facc15', false, true));
                    }
                } else {
                    // FASE 4: SOBRECARGA CRÍTICA (BULLET HELL MÁXIMO)
                    this.temporizadorDisparo = 15; // Ritmo furioso
                    // Cortina de 7 tiros em arco cobrindo a tela
                    for (let k = -3; k <= 3; k++) {
                        const vx = k * 1.1;
                        const vy = 4.0 - Math.abs(k) * 0.2;
                        tiros.push(new Projetil(centroX, base, vx, vy, 'chefe', '#ef4444', false, true));
                    }
                    // Tiro direto perfurante focal de alta velocidade no centro
                    tiros.push(new Projetil(centroX, base, 0, 5.2, 'chefe', '#ffffff', false, true));
                }
                break;
            }

            default: {
                this.temporizadorDisparo = 45;
                tiros.push(new Projetil(centroX - 2, base, 0, 3.5, 'chefe', '#ef4444', false, true));
                tiros.push(new Projetil(centroX - 14, base - 6, -1.5, 3.2, 'chefe', '#f97316', false, true));
                tiros.push(new Projetil(centroX + 14, base - 6, 1.5, 3.2, 'chefe', '#f97316', false, true));
                break;
            }
        }

        return tiros;
    }

    desenhar(ctx) {
        // Primeiro desenha pedaços que se soltaram e estão caindo
        for (const pedaco of this.pedacosAtivos) {
            pedaco.desenhar(ctx);
        }

        // Desenha partículas de chamas e fumaça dos cotos
        for (const p of this.particulasDano) {
            ctx.fillStyle = p.cor;
            ctx.globalAlpha = Math.max(0, p.vida / p.maxVida);
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.raio, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1.0;

        ctx.save();
        ctx.translate(this.x, this.y);

        // Seleção de sprite conforme fase de dano (para o Chefe 6) ou sprite principal
        let spriteAtual = this.sprite;
        if (this.idFase === 6 && this.spritesFases.length >= this.faseDano) {
            const spriteFase = this.spritesFases[this.faseDano - 1];
            if (spriteFase && spriteFase.complete && spriteFase.naturalWidth > 0) {
                spriteAtual = spriteFase;
            }
        }

        if (spriteAtual && spriteAtual.complete && spriteAtual.naturalWidth > 0) {
            // Efeito visual de tremor / sobrecarga se for Fase 4 do Chefe Final
            if (this.idFase === 6 && this.faseDano === 4 && Math.random() < 0.3) {
                ctx.translate((Math.random() - 0.5) * 3, (Math.random() - 0.5) * 3);
            }
            ctx.drawImage(spriteAtual, 0, 0, this.largura, this.altura);
        } else {
            // Renderização procedural retrô militarista de contingência
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(0, 8, this.largura, this.altura - 16);
            ctx.fillStyle = '#dc2626';
            ctx.fillRect(10, 0, this.largura - 20, this.altura);
            ctx.fillStyle = '#facc15';
            ctx.fillRect(20, 16, this.largura - 40, 14);
            ctx.fillStyle = '#64748b';
            ctx.fillRect(4, this.altura - 8, 8, 10);
            ctx.fillRect(this.largura - 12, this.altura - 8, 8, 10);
        }

        ctx.restore();
    }
}

/**
 * Itens Especiais da Fundação Popular (Power-Ups)
 */
class ItemEspecial {
    constructor(x, y, tipo = 'livro') {
        this.x = x;
        this.y = y;
        this.largura = 22;
        this.altura = 22;
        this.tipo = tipo;
        this.vy = 1.4;
        this.removido = false;
        this.angulo = 0;

        // Configuração visual por tipo de artefato
        this.info = {
            livro:    { letra: '📘', cor: '#38bdf8', nome: 'Tomo de Freire (Laser)' },
            clt:      { letra: '🛡️', cor: '#2563eb', nome: 'Escudo da CLT' },
            megafone: { letra: '📢', cor: '#facc15', nome: 'Megafone Popular (Tiro Triplo)' },
            manto:    { letra: '🕊️', cor: '#ffffff', nome: 'Manto da Diversidade (Lentidão)' },
            urna:     { letra: '🗳️', cor: '#22c55e', nome: 'Urna Soberana (Limpeza Total)' },
            sus:      { letra: '💉', cor: '#ec4899', nome: 'Cápsula do SUS (+1 Vida)' }
        }[tipo] || { letra: '⭐', cor: '#facc15', nome: 'Artefato Rebelde' };
    }

    atualizar() {
        this.y += this.vy;
        this.angulo += 0.05;
    }

    desenhar(ctx) {
        ctx.save();
        ctx.translate(this.x + this.largura / 2, this.y + this.altura / 2);

        // Aura pulsante
        const pulso = 1 + Math.sin(this.angulo) * 0.12;
        ctx.scale(pulso, pulso);

        ctx.fillStyle = this.info.cor;
        ctx.beginPath();
        ctx.arc(0, 0, 11, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#0a0d1a';
        ctx.beginPath();
        ctx.arc(0, 0, 9, 0, Math.PI * 2);
        ctx.fill();

        // Ícone em Pixel Art puro e nítido (substitui emojis)
        this.desenharIconePixel(ctx, this.tipo);

        ctx.restore();
    }

    desenharIconePixel(ctx, tipo) {
        ctx.save();
        switch (tipo) {
            case 'livro': // Tomo de Freire / Laser
                ctx.fillStyle = '#0284c7';
                ctx.fillRect(-5, -6, 10, 12);
                ctx.fillStyle = '#38bdf8';
                ctx.fillRect(-3, -5, 7, 10);
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(-1, -3, 4, 1);
                ctx.fillRect(-1, -1, 4, 1);
                ctx.fillRect(-1, 1, 3, 1);
                break;
            case 'clt': // Escudo CLT
                ctx.fillStyle = '#60a5fa';
                ctx.fillRect(-5, -6, 10, 4);
                ctx.fillRect(-4, -2, 8, 4);
                ctx.fillRect(-3, 2, 6, 3);
                ctx.fillRect(-1, 5, 2, 2);
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(-3, -4, 6, 2);
                ctx.fillRect(-1, -2, 2, 4);
                break;
            case 'megafone': // Megafone Popular
                ctx.fillStyle = '#ca8a04';
                ctx.fillRect(-5, -2, 3, 4);
                ctx.fillStyle = '#facc15';
                ctx.fillRect(-2, -3, 2, 6);
                ctx.fillRect(0, -4, 2, 8);
                ctx.fillRect(2, -5, 2, 10);
                ctx.fillStyle = '#ca8a04';
                ctx.fillRect(-3, 2, 2, 3);
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(4, -3, 1, 2);
                ctx.fillRect(5, -1, 1, 2);
                ctx.fillRect(4, 1, 1, 2);
                break;
            case 'manto': // Manto da Diversidade (Arco-íris)
                const cores = ['#ef4444', '#f97316', '#facc15', '#22c55e', '#38bdf8', '#a855f7'];
                cores.forEach((cor, i) => {
                    ctx.fillStyle = cor;
                    ctx.fillRect(-5, -5 + i * 1.7, 10, 2);
                });
                break;
            case 'urna': // Urna Soberana
                ctx.fillStyle = '#334155';
                ctx.fillRect(-6, -4, 12, 9);
                ctx.fillStyle = '#64748b';
                ctx.fillRect(-5, -5, 10, 1);
                ctx.fillStyle = '#0f172a';
                ctx.fillRect(-4, -3, 4, 4);
                ctx.fillStyle = '#ef4444';
                ctx.fillRect(-3, -2, 2, 2);
                ctx.fillStyle = '#22c55e';
                ctx.fillRect(1, 2, 3, 2);
                break;
            case 'sus': // Cápsula do SUS (Cruz da Saúde)
                ctx.fillStyle = '#ec4899';
                ctx.fillRect(-2, -5, 4, 10);
                ctx.fillRect(-5, -2, 10, 4);
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(-1, -4, 2, 8);
                ctx.fillRect(-4, -1, 8, 2);
                break;
            default:
                ctx.fillStyle = '#facc15';
                ctx.fillRect(-2, -5, 4, 10);
                ctx.fillRect(-5, -2, 10, 4);
        }
        ctx.restore();
    }
}
