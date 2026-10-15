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
    }

    /**
     * Inicializa o contexto de áudio na primeira interação do usuário
     * (necessário para obedecer às políticas de reprodução dos navegadores).
     */
    iniciar() {
        if (!this.inicializado) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass) {
                this.ctx = new AudioContextClass();
                this.inicializado = true;
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    /**
     * Alterna o estado de mudo.
     */
    alternarMudo() {
        this.mutado = !this.mutado;
        return this.mutado;
    }

    /**
     * Disparo laser padrão da Vanguarda 13.
     */
    tocarTiro() {
        if (this.mutado || !this.ctx) return;
        this.iniciar();

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
        if (this.mutado || !this.ctx) return;
        this.iniciar();

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
        if (this.mutado || !this.ctx) return;
        this.iniciar();

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
        if (this.mutado || !this.ctx) return;
        this.iniciar();

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
     * O som lendário da Urna Eletrônica brasileira ("Pilili... Confirma").
     * Ativado ao coletar o item de Voto Popular (Screen Nuke).
     */
    tocarUrnaConfirma() {
        if (this.mutado || !this.ctx) return;
        this.iniciar();

        const agora = this.ctx.currentTime;

        // Primeiro bip clássico (1050 Hz)
        const osc1 = this.ctx.createOscillator();
        const gain1 = this.ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(1050, agora);
        gain1.gain.setValueAtTime(0.35, agora);
        gain1.gain.setValueAtTime(0.35, agora + 0.12);
        gain1.gain.linearRampToValueAtTime(0.01, agora + 0.13);

        osc1.connect(gain1);
        gain1.connect(this.ctx.destination);
        osc1.start(agora);
        osc1.stop(agora + 0.13);

        // Segundo bip mais agudo ("Confirma" - 1400 Hz)
        const osc2 = this.ctx.createOscillator();
        const gain2 = this.ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1400, agora + 0.16);
        gain2.gain.setValueAtTime(0.4, agora + 0.16);
        gain2.gain.setValueAtTime(0.4, agora + 0.35);
        gain2.gain.linearRampToValueAtTime(0.01, agora + 0.38);

        osc2.connect(gain2);
        gain2.connect(this.ctx.destination);
        osc2.start(agora + 0.16);
        osc2.stop(agora + 0.38);
    }

    /**
     * Bipe curto de teletipo para a Holotransmissão dos mentores.
     */
    tocarTeletipo() {
        if (this.mutado || !this.ctx) return;
        this.iniciar();

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
        if (this.mutado || !this.ctx) return;
        this.iniciar();

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
}

// Instância global de áudio
const audio = new GerenciadorAudio();
