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
        this.y = canvasHeight - 54;
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

    atualizar(teclas, touchX) {
        // Movimentação via Teclado
        if (teclas['ArrowLeft'] || teclas['KeyA']) {
            this.x -= this.velocidade;
        }
        if (teclas['ArrowRight'] || teclas['KeyD']) {
            this.x += this.velocidade;
        }

        // Movimentação via Touch suave
        if (touchX !== null) {
            const destinoX = touchX - this.largura / 2;
            const diff = destinoX - this.x;
            this.x += diff * 0.25; // Interpolação suave
        }

        // Limites de tela
        this.x = Math.max(6, Math.min(this.cw - this.largura - 6, this.x));

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
        this.temporizadorTiro = this.intervaloTiro;
        const tiros = [];
        const centroX = this.x + this.largura / 2;

        if (this.tempoLaserPerfurante > 0) {
            // Raio Laser Perfurante (Paulo Freire)
            tiros.push(new Projetil(centroX - 3, this.y - 12, 0, -9, 'laser', '#38bdf8', true));
            audio.tocarLaserPerfurante();
        } else if (this.tempoTiroTriplo > 0) {
            // Disparo Triplo em Leque (Megafone)
            tiros.push(new Projetil(centroX - 2, this.y - 4, 0, -7, 'normal', '#facc15'));
            tiros.push(new Projetil(centroX - 6, this.y - 2, -1.8, -6.5, 'normal', '#facc15'));
            tiros.push(new Projetil(centroX + 2, this.y - 2, 1.8, -6.5, 'normal', '#facc15'));
            audio.tocarTiro();
        } else {
            // Disparo duplo padrão de energia
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
 * Naves Capitânias: Chefes de Setor
 */
class ChefeSetor {
    constructor(canvasWidth, configChefe) {
        this.cw = canvasWidth;
        this.largura = 72;
        this.altura = 48;
        this.x = canvasWidth / 2 - this.largura / 2;
        this.y = -60; // Desce majestosamente
        this.yDestino = 50;
        this.nome = configChefe.name || 'Nave Capitânia';
        this.titulo = configChefe.title || 'Força de Ocupação';
        this.hp = configChefe.hp || 30;
        this.hpMax = this.hp;
        this.pontos = configChefe.points || 2000;
        this.padrao = configChefe.attackPattern || 'circular';
        this.velocidadeX = 2;
        this.temporizadorDisparo = 0;
        this.derrotado = false;
    }

    atualizar() {
        // Entrada em cena
        if (this.y < this.yDestino) {
            this.y += 1.2;
            return;
        }

        // Movimentação lateral oscilatória
        this.x += this.velocidadeX;
        if (this.x < 15 || this.x > this.cw - this.largura - 15) {
            this.velocidadeX *= -1;
        }

        if (this.temporizadorDisparo > 0) this.temporizadorDisparo--;
    }

    podeDisparar() {
        return this.y >= this.yDestino && this.temporizadorDisparo <= 0;
    }

    disparar() {
        this.temporizadorDisparo = 45; // Intervalo entre rajadas
        const tiros = [];
        const centroX = this.x + this.largura / 2;
        const base = this.y + this.altura;

        // Disparo em leque espiral
        tiros.push(new Projetil(centroX - 2, base, 0, 3.5, 'chefe', '#ef4444', false, true));
        tiros.push(new Projetil(centroX - 12, base - 6, -1.5, 3.2, 'chefe', '#f97316', false, true));
        tiros.push(new Projetil(centroX + 8, base - 6, 1.5, 3.2, 'chefe', '#f97316', false, true));

        return tiros;
    }

    desenhar(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);

        // Casco blindado da Capitânia
        ctx.fillStyle = '#1e1b4b';
        ctx.fillRect(0, 8, this.largura, this.altura - 16);

        ctx.fillStyle = '#dc2626';
        ctx.fillRect(12, 0, this.largura - 24, this.altura);

        ctx.fillStyle = '#facc15';
        ctx.fillRect(24, 16, this.largura - 48, 14);

        // Canhões frontais
        ctx.fillStyle = '#64748b';
        ctx.fillRect(6, this.altura - 6, 8, 8);
        ctx.fillRect(this.largura - 14, this.altura - 6, 8, 8);

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

        // Ícone emoji centralizado
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.info.letra, 0, 1);

        ctx.restore();
    }
}
