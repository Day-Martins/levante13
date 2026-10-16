// =============================================================================
// LEVANTE 13: A VIRADA — Sintetizador de Áudio Nativo (Web Audio API)
// Arquivo: js/audio.js
// 
// Todos os efeitos sonoros do jogo são sintetizados diretamente pelo navegador,
// eliminando dependências de arquivos externos e garantindo resposta instantânea.
// =============================================================================

class GerenciadorAudio {
    constructor() {
        this.ctx = null;
        this.mutado = false;
        this.inicializado = false;

        // Gerenciamento de Trilha Sonora / BGM
        this.musicaAtual = null; // 'menu' | 'gameplay' | 'boss' | null
        this.audioMenu = null;
        this.audioGameplay = null;
        this.audioBoss = null;
        this.sourceMenu = null;
        this.sourceGameplay = null;
        this.sourceBoss = null;
        this.gainMenu = null;
        this.gainGameplay = null;
        this.gainBoss = null;
        this.volumeBaseMusica = 0.18; // Volume mais baixo que os FX para equilibrar gameplay
        this.timeoutsFade = {};

        // Auto-vincula eventos globais de primeira interação para desbloquear o AudioContext instantaneamente
        this.vincularDesbloqueioAutomatico();
    }

    /**
     * Registra listeners nas primeiras interações com a página (toque, clique, teclado)
     * para inicializar ou resumir o AudioContext conforme exigido pelos navegadores (Chrome/Safari/Mobile).
     */
    vincularDesbloqueioAutomatico() {
        const desbloquear = () => {
            this.iniciar();
            // Se estiver na tela de menu/início, toca a música do menu imediatamente na primeira interação
            if (window.jogo && window.jogo.estado === 'INICIO' && !this.musicaAtual) {
                this.tocarMusicaMenu();
            }
            window.removeEventListener('click', desbloquear);
            window.removeEventListener('touchstart', desbloquear);
            window.removeEventListener('touchend', desbloquear);
            window.removeEventListener('keydown', desbloquear);
        };

        window.addEventListener('click', desbloquear, { once: true, passive: true });
        window.addEventListener('touchstart', desbloquear, { once: true, passive: true });
        window.addEventListener('touchend', desbloquear, { once: true, passive: true });
        window.addEventListener('keydown', desbloquear, { once: true, passive: true });
    }

    /**
     * Inicializa o contexto de áudio na primeira interação do usuário
     * (necessário para obedecer às políticas de reprodução dos navegadores).
     */
    iniciar() {
        if (!this.ctx) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass) {
                try {
                    this.ctx = new AudioContextClass();
                    this.inicializado = true;
                    this.inicializarElementosMusica();
                } catch (e) {
                    console.warn('Erro ao instanciar AudioContext:', e);
                }
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume().catch(() => {});
        }
    }

    /**
     * Prepara os elementos de áudio HTML5 e conecta-os ao grafo da Web Audio API
     */
    inicializarElementosMusica() {
        if (!this.ctx) return;
        if (this.gainMenu && this.gainGameplay && this.gainBoss) return;

        try {
            // Cria elementos de áudio em formato OGG otimizado sem espaços
            this.audioMenu = new Audio('sounds/arcade_menu.ogg');
            this.audioMenu.loop = true;
            this.audioMenu.preload = 'auto';

            this.audioGameplay = new Audio('sounds/game_play.ogg');
            this.audioGameplay.loop = true;
            this.audioGameplay.preload = 'auto';

            this.audioBoss = new Audio('sounds/boss.ogg');
            this.audioBoss.loop = true;
            this.audioBoss.preload = 'auto';

            // Nós de ganho para crossfade suave
            this.gainMenu = this.ctx.createGain();
            this.gainMenu.gain.setValueAtTime(0, this.ctx.currentTime);

            this.gainGameplay = this.ctx.createGain();
            this.gainGameplay.gain.setValueAtTime(0, this.ctx.currentTime);

            this.gainBoss = this.ctx.createGain();
            this.gainBoss.gain.setValueAtTime(0, this.ctx.currentTime);

            // Conecta os nós ao destino de áudio
            this.sourceMenu = this.ctx.createMediaElementSource(this.audioMenu);
            this.sourceMenu.connect(this.gainMenu);
            this.gainMenu.connect(this.ctx.destination);

            this.sourceGameplay = this.ctx.createMediaElementSource(this.audioGameplay);
            this.sourceGameplay.connect(this.gainGameplay);
            this.gainGameplay.connect(this.ctx.destination);

            this.sourceBoss = this.ctx.createMediaElementSource(this.audioBoss);
            this.sourceBoss.connect(this.gainBoss);
            this.gainBoss.connect(this.ctx.destination);
        } catch (e) {
            console.warn('Aviso: Áudio via WebAudio MediaElementSource fallback para elemento direto:', e);
            if (this.audioMenu) this.audioMenu.volume = this.volumeBaseMusica;
            if (this.audioGameplay) this.audioGameplay.volume = this.volumeBaseMusica;
            if (this.audioBoss) this.audioBoss.volume = this.volumeBaseMusica;
        }
    }

    /**
     * Executa crossfade suave entre as faixas e para completamente a execução das faixas anteriores
     */
    executarTransicaoMusica(tipoDestino, duracaoFade = 1.5) {
        this.musicaAtual = tipoDestino;
        const volAlvo = this.mutado ? 0 : this.volumeBaseMusica;

        const mapeamento = {
            menu: { el: this.audioMenu, gain: this.gainMenu, vol: volAlvo },
            gameplay: { el: this.audioGameplay, gain: this.gainGameplay, vol: volAlvo },
            boss: { el: this.audioBoss, gain: this.gainBoss, vol: volAlvo * 1.15 }
        };

        const destino = mapeamento[tipoDestino];
        if (!destino || !destino.el) return;

        // Inicia reprodução da música de destino se ainda não estiver tocando
        if (destino.el.paused) {
            destino.el.play().catch(() => {});
        }

        if (this.ctx && this.gainMenu && this.gainGameplay && this.gainBoss) {
            const agora = this.ctx.currentTime;

            // Fade in na música de destino
            destino.gain.gain.cancelScheduledValues(agora);
            destino.gain.gain.setValueAtTime(destino.gain.gain.value, agora);
            destino.gain.gain.linearRampToValueAtTime(destino.vol, agora + duracaoFade);

            // Fade out e parada nas outras músicas
            Object.keys(mapeamento).forEach(chave => {
                if (chave !== tipoDestino) {
                    const outra = mapeamento[chave];
                    if (outra.gain) {
                        outra.gain.gain.cancelScheduledValues(agora);
                        outra.gain.gain.setValueAtTime(outra.gain.gain.value, agora);
                        outra.gain.gain.linearRampToValueAtTime(0, agora + duracaoFade);
                    }

                    // Limpa timeout anterior se houver
                    if (this.timeoutsFade[chave]) {
                        clearTimeout(this.timeoutsFade[chave]);
                    }

                    // Após o crossfade, para de vez a execução da música anterior e reseta o tempo
                    this.timeoutsFade[chave] = setTimeout(() => {
                        if (this.musicaAtual !== chave && outra.el && !outra.el.paused) {
                            outra.el.pause();
                            outra.el.currentTime = 0;
                        }
                    }, duracaoFade * 1000 + 80);
                }
            });
        } else {
            // Fallback sem Web Audio nodes
            Object.keys(mapeamento).forEach(chave => {
                const item = mapeamento[chave];
                if (item.el) {
                    if (chave === tipoDestino) {
                        item.el.volume = item.vol;
                    } else {
                        item.el.pause();
                        item.el.currentTime = 0;
                    }
                }
            });
        }
    }

    /**
     * Toca ou faz crossfade para a música padrão de menu Arcade Menu
     * @param {number} duracaoFade - duração do crossfade em segundos
     */
    tocarMusicaMenu(duracaoFade = 1.2) {
        if (!this.podeTocar()) return;
        this.inicializarElementosMusica();
        this.executarTransicaoMusica('menu', duracaoFade);
    }

    /**
     * Inicia ou realiza crossfade para a música de gameplay normal e para o menu anterior
     * @param {number} duracaoFade - duração do crossfade em segundos
     */
    tocarMusicaGameplay(duracaoFade = 1.8) {
        if (!this.podeTocar()) return;
        this.inicializarElementosMusica();
        this.executarTransicaoMusica('gameplay', duracaoFade);
    }

    /**
     * Realiza crossfade da música de gameplay para a música de confronto contra o Chefe e para a anterior
     * @param {number} duracaoFade - duração do crossfade em segundos
     */
    tocarMusicaBoss(duracaoFade = 2.0) {
        if (!this.podeTocar()) return;
        this.inicializarElementosMusica();
        this.executarTransicaoMusica('boss', duracaoFade);
    }

    /**
     * Para suavemente qualquer música de fundo ativa e pausa execução
     * @param {number} duracaoFade - duração do fade out em segundos
     */
    pararMusica(duracaoFade = 1.0) {
        this.musicaAtual = null;

        const lista = [
            { el: this.audioMenu, gain: this.gainMenu },
            { el: this.audioGameplay, gain: this.gainGameplay },
            { el: this.audioBoss, gain: this.gainBoss }
        ];

        if (this.ctx && this.gainMenu && this.gainGameplay && this.gainBoss) {
            const agora = this.ctx.currentTime;
            lista.forEach(item => {
                if (item.gain) {
                    item.gain.gain.cancelScheduledValues(agora);
                    item.gain.gain.setValueAtTime(item.gain.gain.value, agora);
                    item.gain.gain.linearRampToValueAtTime(0, agora + duracaoFade);
                }
            });

            setTimeout(() => {
                if (!this.musicaAtual) {
                    lista.forEach(item => {
                        if (item.el) {
                            item.el.pause();
                            item.el.currentTime = 0;
                        }
                    });
                }
            }, duracaoFade * 1000 + 80);
        } else {
            lista.forEach(item => {
                if (item.el) {
                    item.el.pause();
                    item.el.currentTime = 0;
                }
            });
        }
    }

    /**
     * Garante que o contexto existe e está pronto para sintetizar som.
     * Retorna true se puder tocar, ou false se mutado ou indisponível.
     */
    podeTocar() {
        if (this.mutado) return false;
        this.iniciar();
        return !!this.ctx;
    }

    /**
     * Alterna o estado de mudo.
     */
    alternarMudo() {
        this.iniciar();
        this.mutado = !this.mutado;

        if (this.ctx && this.gainMenu && this.gainGameplay && this.gainBoss) {
            const agora = this.ctx.currentTime;
            if (this.mutado) {
                this.gainMenu.gain.setValueAtTime(0, agora);
                this.gainGameplay.gain.setValueAtTime(0, agora);
                this.gainBoss.gain.setValueAtTime(0, agora);
            } else {
                if (this.musicaAtual === 'menu') {
                    this.gainMenu.gain.setValueAtTime(this.volumeBaseMusica, agora);
                } else if (this.musicaAtual === 'gameplay') {
                    this.gainGameplay.gain.setValueAtTime(this.volumeBaseMusica, agora);
                } else if (this.musicaAtual === 'boss') {
                    this.gainBoss.gain.setValueAtTime(this.volumeBaseMusica * 1.15, agora);
                }
            }
        } else {
            if (this.audioMenu) this.audioMenu.muted = this.mutado;
            if (this.audioGameplay) this.audioGameplay.muted = this.mutado;
            if (this.audioBoss) this.audioBoss.muted = this.mutado;
        }

        return this.mutado;
    }

    /**
     * Disparo laser padrão da Vanguarda 13.
     */
    tocarTiro() {
        if (!this.podeTocar()) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(110, this.ctx.currentTime + 0.12);

        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.12);
    }

    /**
     * Disparo de raio laser perfurante (Power-up Tomo de Freire).
     */
    tocarLaserPerfurante() {
        if (!this.podeTocar()) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(440, this.ctx.currentTime + 0.18);

        gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.18);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.18);
    }

    /**
     * Efeito sonoro de explosão para naves inimigas derrotadas.
     */
    tocarExplosao() {
        if (!this.podeTocar()) return;

        // Gera ruído branco para impacto explosivo
        const tamanhoBuffer = this.ctx.sampleRate * 0.25;
        const buffer = this.ctx.createBuffer(1, tamanhoBuffer, this.ctx.sampleRate);
        const dados = buffer.getChannelData(0);

        for (let i = 0; i < tamanhoBuffer; i++) {
            dados[i] = Math.random() * 2 - 1;
        }

        const ruido = this.ctx.createBufferSource();
        ruido.buffer = buffer;

        const filtro = this.ctx.createBiquadFilter();
        filtro.type = 'lowpass';
        filtro.frequency.setValueAtTime(800, this.ctx.currentTime);
        filtro.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.25);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);

        ruido.connect(filtro);
        filtro.connect(gain);
        gain.connect(this.ctx.destination);

        ruido.start();
        ruido.stop(this.ctx.currentTime + 0.25);
    }

    /**
     * Coleta de item especial (Power-up).
     */
    tocarPowerup() {
        if (!this.podeTocar()) return;

        const notas = [523.25, 659.25, 783.99, 1046.50]; // Acorde C Maior ascendente
        notas.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.05);

            gain.gain.setValueAtTime(0.2, this.ctx.currentTime + idx * 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + idx * 0.05 + 0.1);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(this.ctx.currentTime + idx * 0.05);
            osc.stop(this.ctx.currentTime + idx * 0.05 + 0.1);
        });
    }

    /**
     * Som de clique sutil e responsivo para botões da interface (UI).
     */
    tocarClique() {
        if (!this.podeTocar()) return;

        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const agora = this.ctx.currentTime;

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(820, agora);
            osc.frequency.exponentialRampToValueAtTime(380, agora + 0.04);

            gain.gain.setValueAtTime(0.2, agora);
            gain.gain.exponentialRampToValueAtTime(0.001, agora + 0.04);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(agora);
            osc.stop(agora + 0.04);
        } catch (e) {
            console.warn('Erro ao tocar som de clique:', e);
        }
    }

    /**
     * O lendário e característico som da Urna Eletrônica brasileira ("Pilili... Confirma" do TSE).
     * Reproduz com fidelidade a sequência de 3 bips (dois curtos preparatórios e o longo agudo sustentado)
     * com o timbre metálico/ressonante clássico do transdutor piezoelétrico da urna.
     */
    tocarUrnaConfirma() {
        if (!this.podeTocar()) return;

        try {
            const agora = this.ctx.currentTime;

            // Filtro passa-baixa para reproduzir a ressonância acústica do piezo da urna
            const filtro = this.ctx.createBiquadFilter();
            filtro.type = 'lowpass';
            filtro.frequency.setValueAtTime(3600, agora);
            filtro.connect(this.ctx.destination);

            // Sequência clássica de 3 tons do "Pilili" do TSE:
            // 1) ~1050 Hz (aprox 75ms)
            // 2) ~1400 Hz (aprox 75ms)
            // 3) ~2093 Hz (C7 - sustentado por aprox 680ms)
            const notas = [
                { freq: 1050, inicio: 0.00, duracao: 0.075 },
                { freq: 1400, inicio: 0.11, duracao: 0.075 },
                { freq: 2093, inicio: 0.22, duracao: 0.68 }
            ];

            notas.forEach(({ freq, inicio, duracao }) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();

                // Onda quadrada filtrada produz o timbre idêntico ao buzzer do TSE
                osc.type = 'square';
                osc.frequency.setValueAtTime(freq, agora + inicio);

                const tInicio = agora + inicio;
                const tFim = tInicio + duracao;

                if (duracao > 0.2) {
                    // Tom longo sustentado ("liiii")
                    gain.gain.setValueAtTime(0.001, tInicio);
                    gain.gain.linearRampToValueAtTime(0.32, tInicio + 0.015);
                    gain.gain.setValueAtTime(0.32, tFim - 0.06);
                    gain.gain.linearRampToValueAtTime(0.001, tFim);
                } else {
                    // Bips curtos de preparação ("pi", "li")
                    gain.gain.setValueAtTime(0.001, tInicio);
                    gain.gain.linearRampToValueAtTime(0.26, tInicio + 0.01);
                    gain.gain.setValueAtTime(0.26, tFim - 0.01);
                    gain.gain.linearRampToValueAtTime(0.001, tFim);
                }

                osc.connect(gain);
                gain.connect(filtro);

                osc.start(tInicio);
                osc.stop(tFim);
            });
        } catch (e) {
            console.warn('Erro ao tocar som da urna:', e);
        }
    }

    /**
     * Bipe padrão característico de tecla pressionada na Urna Eletrônica (aprox. 850 Hz com timbre piezo).
     */
    tocarUrnaTecla() {
        if (!this.podeTocar()) return;

        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const filtro = this.ctx.createBiquadFilter();
            const agora = this.ctx.currentTime;

            filtro.type = 'lowpass';
            filtro.frequency.setValueAtTime(3200, agora);

            osc.type = 'square';
            osc.frequency.setValueAtTime(850, agora);

            gain.gain.setValueAtTime(0.001, agora);
            gain.gain.linearRampToValueAtTime(0.24, agora + 0.008);
            gain.gain.exponentialRampToValueAtTime(0.001, agora + 0.065);

            osc.connect(gain);
            gain.connect(filtro);
            filtro.connect(this.ctx.destination);

            osc.start(agora);
            osc.stop(agora + 0.065);
        } catch (e) {
            console.warn('Erro ao tocar tecla da urna:', e);
        }
    }

    /**
     * Tom de correção / cancelamento da Urna Eletrônica (tom duplo/grave ~440 Hz).
     */
    tocarUrnaCorrige() {
        if (!this.podeTocar()) return;

        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const agora = this.ctx.currentTime;

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(440, agora);
            osc.frequency.linearRampToValueAtTime(330, agora + 0.1);

            gain.gain.setValueAtTime(0.26, agora);
            gain.gain.exponentialRampToValueAtTime(0.001, agora + 0.1);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(agora);
            osc.stop(agora + 0.1);
        } catch (e) {
            console.warn('Erro ao tocar corrige da urna:', e);
        }
    }

    /**
     * Sinal sonoro de erro ou recusa de acesso.
     */
    tocarErro() {
        if (!this.podeTocar()) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const agora = this.ctx.currentTime;

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(160, agora);
        osc.frequency.linearRampToValueAtTime(90, agora + 0.22);
        gain.gain.setValueAtTime(0.3, agora);
        gain.gain.exponentialRampToValueAtTime(0.01, agora + 0.22);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(agora);
        osc.stop(agora + 0.22);
    }

    /**
     * Bipe curto de teletipo para a Holotransmissão dos mentores.
     */
    tocarTeletipo() {
        if (!this.podeTocar()) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(750, this.ctx.currentTime);

        gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.04);
    }

    /**
     * Alarme de impacto/dano recebido pela Vanguarda 13.
     */
    tocarDano() {
        if (!this.podeTocar()) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(80, this.ctx.currentTime + 0.2);

        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.2);
    }

    /**
     * Fanfarra triunfal retrô de conclusão de setor / vitória de fase.
     */
    tocarVitoriaFase() {
        if (!this.podeTocar()) return;

        const agora = this.ctx.currentTime;
        // Acorde triunfal em arpeggio clássico arcade: C5, E5, G5, C6 com acorde sustentado
        const notas = [
            { freq: 523.25, tempo: 0.00, dur: 0.12, ganho: 0.25 }, // C5
            { freq: 659.25, tempo: 0.12, dur: 0.12, ganho: 0.25 }, // E5
            { freq: 783.99, tempo: 0.24, dur: 0.14, ganho: 0.30 }, // G5
            { freq: 1046.50, tempo: 0.38, dur: 0.65, ganho: 0.35 } // C6 (sustentado)
        ];

        notas.forEach(({ freq, tempo, dur, ganho }) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, agora + tempo);

            gain.gain.setValueAtTime(ganho, agora + tempo);
            gain.gain.exponentialRampToValueAtTime(0.001, agora + tempo + dur);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(agora + tempo);
            osc.stop(agora + tempo + dur);
        });
    }

    /**
     * Sirene / alarme tático retrô Sci-Fi para a entrada imponente do Chefe.
     * Pulsa duas vezes em tom estridente estilo sirene de alerta vermelho.
     */
    tocarAlertaChefe() {
        if (!this.podeTocar()) return;

        const agora = this.ctx.currentTime;
        const pulsos = [0.0, 0.28, 0.56];

        pulsos.forEach((inicio) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sawtooth';
            // Variação de pitch rápido descendente/ascendente de sirene de invasão
            osc.frequency.setValueAtTime(440, agora + inicio);
            osc.frequency.exponentialRampToValueAtTime(880, agora + inicio + 0.12);
            osc.frequency.exponentialRampToValueAtTime(220, agora + inicio + 0.24);

            gain.gain.setValueAtTime(0.001, agora + inicio);
            gain.gain.linearRampToValueAtTime(0.35, agora + inicio + 0.04);
            gain.gain.exponentialRampToValueAtTime(0.001, agora + inicio + 0.25);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(agora + inicio);
            osc.stop(agora + inicio + 0.25);
        });
    }
}

// Instância global de áudio acessível tanto no escopo léxico quanto em window
const audio = new GerenciadorAudio();
window.audio = audio;
