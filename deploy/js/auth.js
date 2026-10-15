// =============================================================================
// LEVANTE 13: A VIRADA — Autenticação de Codinomes e Urna Eletrônica
// Arquivo: js/auth.js
// =============================================================================

class GerenciadorIdentidadeUrna {
    constructor() {
        this.codename = localStorage.getItem('l13_codename') || '';
        this.pin = localStorage.getItem('l13_pin') || '';
        this.protegido = localStorage.getItem('l13_protegido') === 'true';

        this.modoUrna = 'verificar'; // 'verificar' ou 'proteger'
        this.pinDigitado = '';
        this.codenamePendente = '';
        this.onSucessoCallback = null;

        this.inicializarElementos();
        this.vincularEventos();
    }

    inicializarElementos() {
        this.modal = document.getElementById('modalCredencial');
        this.etapaCodename = document.getElementById('etapaCodename');
        this.etapaEscolha = document.getElementById('etapaEscolhaProtecao');
        this.etapaUrna = document.getElementById('etapaTecladoUrna');

        this.inputCodename = document.getElementById('inputCodenameIdent');
        this.btnAvancarCodename = document.getElementById('btnAvancarCodename');
        this.statusMsg = document.getElementById('credencialStatusMsg');

        this.btnOptarSim = document.getElementById('btnOptarSim');
        this.btnOptarNao = document.getElementById('btnOptarNao');
        this.btnVoltarCodename = document.getElementById('btnVoltarCodename');

        this.urnaInstrucao = document.getElementById('urnaInstrucao');
        this.urnaErroMsg = document.getElementById('urnaMensagemErro');
        this.btnCancelarUrna = document.getElementById('btnCancelarUrna');
        this.btnUrnaCorrige = document.getElementById('btnUrnaCorrige');
        this.btnUrnaConfirma = document.getElementById('btnUrnaConfirma');

        this.slots = [
            document.getElementById('urnaSlot0'),
            document.getElementById('urnaSlot1'),
            document.getElementById('urnaSlot2'),
            document.getElementById('urnaSlot3')
        ];
    }

    vincularEventos() {
        if (this.btnAvancarCodename) {
            this.btnAvancarCodename.addEventListener('click', () => this.processarAvancoCodename());
        }

        if (this.inputCodename) {
            this.inputCodename.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.processarAvancoCodename();
                }
            });
        }

        if (this.btnOptarSim) {
            this.btnOptarSim.addEventListener('click', () => this.iniciarCriacaoSenhaUrna());
        }

        if (this.btnOptarNao) {
            this.btnOptarNao.addEventListener('click', () => this.concluirSemSenha());
        }

        if (this.btnVoltarCodename) {
            this.btnVoltarCodename.addEventListener('click', () => this.exibirEtapaCodename());
        }

        if (this.btnCancelarUrna) {
            this.btnCancelarUrna.addEventListener('click', () => this.exibirEtapaCodename());
        }

        // Teclas Numéricas da Urna (0 a 9)
        document.querySelectorAll('.tecla-num').forEach(botao => {
            botao.addEventListener('click', (e) => {
                e.stopPropagation();
                const num = botao.getAttribute('data-num');
                if (num !== null) this.digitarNumero(num);
            });
        });

        if (this.btnUrnaCorrige) {
            this.btnUrnaCorrige.addEventListener('click', (e) => {
                e.stopPropagation();
                this.corrigirNumero();
            });
        }

        if (this.btnUrnaConfirma) {
            this.btnUrnaConfirma.addEventListener('click', (e) => {
                e.stopPropagation();
                this.confirmarUrna();
            });
        }

        // Suporte ao teclado físico do computador quando a Urna estiver visível
        window.addEventListener('keydown', (e) => {
            if (!this.modal || this.modal.style.display === 'none') return;
            if (this.etapaUrna && this.etapaUrna.style.display !== 'none') {
                if (['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(e.key)) {
                    e.preventDefault();
                    this.digitarNumero(e.key);
                } else if (e.key === 'Backspace' || e.key === 'Delete') {
                    e.preventDefault();
                    this.corrigirNumero();
                } else if (e.key === 'Enter') {
                    e.preventDefault();
                    this.confirmarUrna();
                }
            }
        });
    }

    /**
     * Abre o modal de identificação antes de iniciar a missão
     */
    abrirModal(onSucesso) {
        this.onSucessoCallback = onSucesso;
        if (!this.modal) return;

        this.modal.style.display = 'flex';
        this.exibirEtapaCodename();

        if (this.inputCodename) {
            this.inputCodename.value = this.codename || '';
            setTimeout(() => this.inputCodename.focus(), 150);
        }
    }

    fecharModal() {
        if (this.modal) this.modal.style.display = 'none';
        this.pinDigitado = '';
        this.atualizarDisplaySlots();
    }

    exibirEtapaCodename() {
        if (this.etapaCodename) this.etapaCodename.style.display = 'block';
        if (this.etapaEscolha) this.etapaEscolha.style.display = 'none';
        if (this.etapaUrna) this.etapaUrna.style.display = 'none';
        if (this.statusMsg) this.statusMsg.textContent = '';
        this.pinDigitado = '';
    }

    async processarAvancoCodename() {
        if (!this.inputCodename) return;
        const tag = this.inputCodename.value.trim().toUpperCase();

        if (!tag || tag.length < 3) {
            if (window.audio) window.audio.tocarErro();
            this.statusMsg.style.color = '#ef4444';
            this.statusMsg.textContent = 'O Codinome deve ter entre 3 e 12 caracteres.';
            this.inputCodename.focus();
            return;
        }

        if (!/^[A-Z0-9_\-]+$/.test(tag)) {
            if (window.audio) window.audio.tocarErro();
            this.statusMsg.style.color = '#ef4444';
            this.statusMsg.textContent = 'Use apenas letras, números e traço.';
            this.inputCodename.focus();
            return;
        }

        this.codenamePendente = tag;
        this.statusMsg.style.color = '#38bdf8';
        this.statusMsg.textContent = 'Consultando arquivos da resistência...';
        this.btnAvancarCodename.disabled = true;

        try {
            const res = await fetch(`api/player.php?codename=${encodeURIComponent(tag)}`);
            const json = await res.json();
            this.btnAvancarCodename.disabled = false;

            if (json.sucesso) {
                if (json.protegido) {
                    // Codinome já possui senha: abre a Urna em modo 'verificar'
                    this.modoUrna = 'verificar';
                    this.exibirTecladoUrna(`CODINOME PROTEGIDO: DIGITE SEU PIN`);
                } else {
                    // Codinome livre: pergunta se deseja proteger
                    this.exibirEtapaEscolha();
                }
            } else {
                this.statusMsg.style.color = '#ef4444';
                this.statusMsg.textContent = json.erro || 'Erro ao consultar codinome.';
            }
        } catch (err) {
            this.btnAvancarCodename.disabled = false;
            this.statusMsg.style.color = '#ef4444';
            this.statusMsg.textContent = 'Erro de conexão com a base da resistência.';
        }
    }

    exibirEtapaEscolha() {
        if (this.etapaCodename) this.etapaCodename.style.display = 'none';
        if (this.etapaEscolha) this.etapaEscolha.style.display = 'block';
        if (this.etapaUrna) this.etapaUrna.style.display = 'none';
    }

    iniciarCriacaoSenhaUrna() {
        this.modoUrna = 'proteger';
        this.exibirTecladoUrna(`DEFINA SUA SENHA DE 4 NÚMEROS NA URNA:`);
    }

    concluirSemSenha() {
        this.codename = this.codenamePendente;
        this.pin = '';
        this.protegido = false;

        localStorage.setItem('l13_codename', this.codename);
        localStorage.setItem('l13_pin', '');
        localStorage.setItem('l13_protegido', 'false');

        if (window.audio) window.audio.tocarPowerup();
        this.fecharModal();

        if (typeof this.onSucessoCallback === 'function') {
            this.onSucessoCallback(this.obterPiloto());
        }
    }

    exibirTecladoUrna(instrucao) {
        if (this.etapaCodename) this.etapaCodename.style.display = 'none';
        if (this.etapaEscolha) this.etapaEscolha.style.display = 'none';
        if (this.etapaUrna) this.etapaUrna.style.display = 'block';

        if (this.urnaInstrucao) this.urnaInstrucao.textContent = instrucao;
        if (this.urnaErroMsg) this.urnaErroMsg.textContent = '';

        this.pinDigitado = '';
        this.atualizarDisplaySlots();
    }

    digitarNumero(num) {
        if (this.pinDigitado.length < 4) {
            this.pinDigitado += num;
            if (window.audio) window.audio.tocarUrnaTecla();
            this.atualizarDisplaySlots();
            if (this.urnaErroMsg) this.urnaErroMsg.textContent = '';
        }
    }

    corrigirNumero() {
        if (this.pinDigitado.length > 0) {
            this.pinDigitado = this.pinDigitado.slice(0, -1);
            if (window.audio) window.audio.tocarUrnaCorrige();
            this.atualizarDisplaySlots();
            if (this.urnaErroMsg) this.urnaErroMsg.textContent = '';
        }
    }

    atualizarDisplaySlots() {
        this.slots.forEach((slot, idx) => {
            if (!slot) return;
            if (idx < this.pinDigitado.length) {
                slot.textContent = '●';
                slot.classList.remove('ativo');
                slot.style.color = '#22c55e';
            } else if (idx === this.pinDigitado.length) {
                slot.textContent = '_';
                slot.classList.add('ativo');
                slot.style.color = '#38bdf8';
            } else {
                slot.textContent = '_';
                slot.classList.remove('ativo');
                slot.style.color = '#64748b';
            }
        });
    }

    async confirmarUrna() {
        if (this.pinDigitado.length < 4) {
            if (window.audio) window.audio.tocarErro();
            if (this.urnaErroMsg) {
                this.urnaErroMsg.textContent = 'DIGITE OS 4 NÚMEROS DA SENHA!';
            }
            return;
        }

        const payload = {
            action: this.modoUrna,
            codename: this.codenamePendente,
            pin: this.pinDigitado
        };

        if (this.btnUrnaConfirma) this.btnUrnaConfirma.disabled = true;

        try {
            const res = await fetch('api/player.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const json = await res.json();
            if (this.btnUrnaConfirma) this.btnUrnaConfirma.disabled = false;

            if (json.sucesso) {
                // Toca o clássico som de confirmação da Urna Eletrônica
                if (window.audio) window.audio.tocarUrnaConfirma();

                this.codename = this.codenamePendente;
                this.pin = this.pinDigitado;
                this.protegido = true;

                localStorage.setItem('l13_codename', this.codename);
                localStorage.setItem('l13_pin', this.pin);
                localStorage.setItem('l13_protegido', 'true');

                if (this.urnaErroMsg) {
                    this.urnaErroMsg.style.color = '#22c55e';
                    this.urnaErroMsg.textContent = json.mensagem || 'AUTENTICADO COM SUCESSO!';
                }

                setTimeout(() => {
                    this.fecharModal();
                    if (typeof this.onSucessoCallback === 'function') {
                        this.onSucessoCallback(this.obterPiloto());
                    }
                }, 600);

            } else {
                if (window.audio) window.audio.tocarErro();
                if (this.urnaErroMsg) {
                    this.urnaErroMsg.style.color = '#ef4444';
                    this.urnaErroMsg.textContent = json.erro || 'Senha incorreta na Urna.';
                }
                this.pinDigitado = '';
                this.atualizarDisplaySlots();
            }
        } catch (err) {
            if (this.btnUrnaConfirma) this.btnUrnaConfirma.disabled = false;
            if (window.audio) window.audio.tocarErro();
            if (this.urnaErroMsg) {
                this.urnaErroMsg.style.color = '#ef4444';
                this.urnaErroMsg.textContent = 'Erro de conexão com a Urna.';
            }
        }
    }

    obterPiloto() {
        return {
            codename: this.codename || 'PILOTO 13',
            pin: this.pin || '',
            protegido: this.protegido
        };
    }
}

// Instância global disponível para o jogo
window.authUrna = new GerenciadorIdentidadeUrna();
