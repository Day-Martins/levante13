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
