// =============================================================================
// LEVANTE 13: A VIRADA — Lógica Limpa da Homepage de Campanha
// Arquivo: js/home.js
// =============================================================================

document.addEventListener('DOMContentLoaded', () => {
    inicializarModoSite();
    inicializarRanking();
    inicializarCompartilhamento();
});

/* =============================================================================
   1. GERENCIAMENTO DE MODO: ESPERA / EM BREVE (PADRÃO) vs OFICIAL (NO AR)
   ============================================================================= */
function inicializarModoSite() {
    const boxEspera = document.getElementById('boxModoEspera');
    const heroBadge = document.getElementById('heroBadgeStatus');
    const toggleModo = document.getElementById('toggleModoSite');

    // Verifica parâmetro de URL (ex: ?publicado=1 para forçar jogo no ar, ou ?modo=espera)
    const params = new URLSearchParams(window.location.search);
    const forcarPublicado = params.get('publicado') === '1' || params.get('modo') === 'jogar';
    const forcarEspera = params.get('espera') === '1' || params.get('modo') === 'espera';

    // Padrão do site solicitado pelo usuário: Modo de Espera / Em Breve ATIVADO por padrão!
    let modoEsperaAtivo = true;
    if (forcarPublicado) {
        modoEsperaAtivo = false;
    } else if (forcarEspera) {
        modoEsperaAtivo = true;
    } else if (localStorage.getItem('levante13_modo_espera') !== null) {
        modoEsperaAtivo = localStorage.getItem('levante13_modo_espera') === 'true';
    }

    function renderizarModo(espera) {
        const btnHeroPrincipal = document.getElementById('btnHeroPrincipal');
        const btnHeroSecundario = document.getElementById('btnHeroSecundario');
        const btnHeaderAcao = document.getElementById('btnHeaderAcao');
        const btnPlacarAcao = document.getElementById('btnPlacarAcao');
        const btnManifestoAcao = document.getElementById('btnManifestoAcao');

        if (espera) {
            // --- MODO DE ESPERA / PRÉ-LANÇAMENTO (BOTÕES JOGAR DESATIVADOS) ---
            if (boxEspera) boxEspera.classList.remove('escondido');
            if (heroBadge) heroBadge.textContent = '★ HANGAR DA RESISTÊNCIA • DECOLAGEM EM BREVE';

            const boxContadorHero = document.getElementById('boxContadorPilotosHero');
            if (boxContadorHero) boxContadorHero.style.display = 'none';

            // Botão Principal do Hero: DESATIVADO
            if (btnHeroPrincipal) {
                btnHeroPrincipal.outerHTML = `
                    <button type="button" class="btn-cta btn-desativado" id="btnHeroPrincipal" disabled title="Motores em calibração! Lançamento oficial nos próximos dias.">
                        <svg class="px-icon"><use href="#px-timer"></use></svg> JOGAR AGORA (EM BREVE)
                    </button>
                `;
            }

            // Botão Secundário do Hero: Convocação no WhatsApp Ativa
            if (btnHeroSecundario) {
                btnHeroSecundario.outerHTML = `
                    <a href="https://api.whatsapp.com/send?text=Prepare-se!%20O%20jogo%20arcade%20da%20democracia%20brasileira%20est%C3%A1%20chegando%3A%20Levante%2013%3A%20A%20Virada!%20Acompanhe%20em%20https%3A%2F%2Flevante13.online" 
                       target="_blank" 
                       rel="noopener noreferrer" 
                       class="btn-sec btn-zap" id="btnHeroSecundario">
                        <svg class="px-icon"><use href="#px-zap"></use></svg> Convoque no WhatsApp
                    </a>
                `;
            }

            // Botão do Topo (Header): DESATIVADO
            if (btnHeaderAcao) {
                btnHeaderAcao.outerHTML = `
                    <span class="btn-header btn-desativado" id="btnHeaderAcao" title="Lançamento oficial em breve!">
                        EM BREVE <svg class="px-icon"><use href="#px-timer"></use></svg>
                    </span>
                `;
            }

            // Botão da Seção Placar: DESATIVADO
            if (btnPlacarAcao) {
                btnPlacarAcao.outerHTML = `
                    <button type="button" class="btn-cta btn-desativado" id="btnPlacarAcao" disabled style="font-size: 0.88rem; padding: 10px 22px;">
                        <svg class="px-icon"><use href="#px-timer"></use></svg> Placar Aberto no Lançamento
                    </button>
                `;
            }

            // Botão do Box Manifesto: DESATIVADO
            if (btnManifestoAcao) {
                btnManifestoAcao.outerHTML = `
                    <button type="button" class="btn-cta btn-desativado" id="btnManifestoAcao" disabled style="font-size: 0.88rem; padding: 12px 20px; white-space: nowrap;" title="Lançamento oficial em breve!">
                        <svg class="px-icon"><use href="#px-timer"></use></svg> Arcade Livre (Em Breve)
                    </button>
                `;
            }

            // Ocultar a seção de Leaderboard (Placar) e o link do menu no Modo de Espera
            const secaoPlacar = document.getElementById('placar');
            const linkNavPlacar = document.getElementById('linkNavPlacar');
            if (secaoPlacar) secaoPlacar.style.display = 'none';
            if (linkNavPlacar) linkNavPlacar.style.display = 'none';

            if (toggleModo) {
                toggleModo.textContent = 'Pré-visualizar Modo Publicado (Jogo no Ar)';
            }
        } else {
            // --- MODO PUBLICADO (JOGO NO AR) ---
            if (boxEspera) boxEspera.classList.add('escondido');
            if (heroBadge) heroBadge.textContent = '★ Mobilização Popular Permanente';

            // Exibir a seção de Leaderboard (Placar) e o link do menu no Modo Publicado
            const secaoPlacar = document.getElementById('placar');
            const linkNavPlacar = document.getElementById('linkNavPlacar');
            if (secaoPlacar) secaoPlacar.style.display = '';
            if (linkNavPlacar) linkNavPlacar.style.display = '';

            const boxContadorHero = document.getElementById('boxContadorPilotosHero');
            if (boxContadorHero) boxContadorHero.style.display = 'inline-flex';

            if (btnHeroPrincipal) {
                btnHeroPrincipal.outerHTML = `
                    <a href="game.html" class="btn-cta" id="btnHeroPrincipal">
                        <svg class="px-icon"><use href="#px-nave"></use></svg> JOGAR AGORA NO NAVEGADOR
                    </a>
                `;
            }

            if (btnHeroSecundario) {
                btnHeroSecundario.outerHTML = `
                    <a href="https://api.whatsapp.com/send?text=A%20esperan%C3%A7a%20vai%20virar%20o%20jogo!%20Conhe%C3%A7a%20e%20jogue%20Levante%2013%3A%20A%20Virada%20em%20https%3A%2F%2Flevante13.online" 
                       target="_blank" 
                       rel="noopener noreferrer" 
                       class="btn-sec btn-zap" id="btnHeroSecundario">
                        <svg class="px-icon"><use href="#px-zap"></use></svg> Convoque no WhatsApp
                    </a>
                `;
            }

            if (btnHeaderAcao) {
                btnHeaderAcao.outerHTML = `
                    <a href="game.html" class="btn-header" id="btnHeaderAcao">
                        JOGAR AGORA <svg class="px-icon"><use href="#px-joystick"></use></svg>
                    </a>
                `;
            }

            if (btnPlacarAcao) {
                btnPlacarAcao.outerHTML = `
                    <a href="game.html" class="btn-cta" id="btnPlacarAcao" style="font-size: 0.88rem; padding: 10px 22px;">
                        <svg class="px-icon"><use href="#px-nave"></use></svg> Jogar e Gravar Pontuação
                    </a>
                `;
            }

            if (btnManifestoAcao) {
                btnManifestoAcao.outerHTML = `
                    <a href="game.html" class="btn-cta" id="btnManifestoAcao" style="font-size: 0.88rem; padding: 12px 20px; white-space: nowrap;">
                        <svg class="px-icon"><use href="#px-joystick"></use></svg> Jogar o Arcade Livre
                    </a>
                `;
            }

            if (toggleModo) {
                toggleModo.textContent = 'Pré-visualizar Modo de Espera (Em Breve)';
            }
        }
    }

    if (toggleModo) {
        toggleModo.addEventListener('click', (e) => {
            e.preventDefault();
            modoEsperaAtivo = !modoEsperaAtivo;
            localStorage.setItem('levante13_modo_espera', modoEsperaAtivo ? 'true' : 'false');
            renderizarModo(modoEsperaAtivo);
            mostrarToast(modoEsperaAtivo ? 'Modo Em Breve ativado (Botões desativados)' : 'Modo Publicado ativado (Jogar liberado)');
        });
    }

    renderizarModo(modoEsperaAtivo);
}



/* =============================================================================
   3. LEADERBOARD EM TEMPO REAL (CONSUMO DA API SQLite)
   ============================================================================= */
async function carregarRanking() {
    const corpo = document.getElementById('corpoRanking');
    const boxContadorPlacar = document.getElementById('boxContadorPilotosPlacar');
    const numContadorPlacar = document.getElementById('numContadorPilotosPlacar');
    const boxContadorHero = document.getElementById('boxContadorPilotosHero');
    const numContadorHero = document.getElementById('numContadorPilotosHero');

    try {
        const res = await fetch('api/leaderboard.php?limit=10');
        const dados = await res.json();

        // Atualiza contador de codinomes / usuários cadastrados
        if (dados.sucesso && typeof dados.total_codinomes === 'number') {
            const totalFormatado = dados.total_codinomes.toLocaleString('pt-BR');
            if (numContadorPlacar) numContadorPlacar.textContent = totalFormatado;
            if (boxContadorPlacar) boxContadorPlacar.style.display = 'inline-flex';

            if (numContadorHero) numContadorHero.textContent = totalFormatado;

            // No Hero, se o site estiver no modo publicado, exibe o contador com destaque
            const modoEspera = localStorage.getItem('levante13_modo_espera') !== 'false';
            const params = new URLSearchParams(window.location.search);
            const forcarPublicado = params.get('publicado') === '1' || params.get('modo') === 'jogar';

            if (boxContadorHero && (!modoEspera || forcarPublicado)) {
                boxContadorHero.style.display = 'inline-flex';
            }
        }

        if (!corpo) return;

        if (dados.sucesso && Array.isArray(dados.ranking) && dados.ranking.length > 0) {
            corpo.innerHTML = dados.ranking.map((item, idx) => {
                const pos = idx + 1;
                let classePos = '';
                let textoPos = `${pos}º`;

                if (pos === 1) { 
                    classePos = 'pos-ouro'; 
                    textoPos = '<svg class="px-icon" style="color:var(--amarelo)"><use href="#px-trophy"></use></svg> 1º'; 
                } else if (pos === 2) { 
                    classePos = 'pos-prata'; 
                    textoPos = '<svg class="px-icon" style="color:#cbd5e1"><use href="#px-trophy"></use></svg> 2º'; 
                } else if (pos === 3) { 
                    classePos = 'pos-bronze'; 
                    textoPos = '<svg class="px-icon" style="color:#f97316"><use href="#px-trophy"></use></svg> 3º'; 
                }

                return `
                    <div class="tabela-linha">
                        <div class="col-pos ${classePos}">${textoPos}</div>
                        <div class="col-piloto">${item.piloto || 'PILOTO ANÔNIMO'}</div>
                        <div class="col-pontos">${Number(item.pontos).toLocaleString('pt-BR')} PTS</div>
                    </div>
                `;
            }).join('');
        } else {
            corpo.innerHTML = `
                <div style="padding: 24px; text-align: center; color: var(--texto-mutado); font-size: 0.9rem;">
                    Nenhum recorde registrado ainda. Participe do lançamento oficial!
                </div>
            `;
        }
    } catch (err) {
        if (corpo) {
            corpo.innerHTML = `
                <div style="padding: 24px; text-align: center; color: var(--texto-mutado); font-size: 0.9rem;">
                    ★ Placar aberto no lançamento oficial. Prepare seu codinome!
                </div>
            `;
        }
    }
}

function inicializarRanking() {
    const btnAtualizar = document.getElementById('btnAtualizarRanking');
    if (btnAtualizar) {
        btnAtualizar.addEventListener('click', () => {
            btnAtualizar.disabled = true;
            btnAtualizar.innerHTML = '<svg class="px-icon"><use href="#px-refresh"></use></svg> Carregando...';
            carregarRanking().finally(() => {
                btnAtualizar.disabled = false;
                btnAtualizar.innerHTML = '<svg class="px-icon"><use href="#px-refresh"></use></svg> Atualizar';
                mostrarToast('Placar atualizado!');
            });
        });
    }
    carregarRanking();
}

/* =============================================================================
   4. FEEDBACK TOAST FLUTUANTE
   ============================================================================= */
function mostrarToast(mensagem) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = mensagem;
    toast.classList.add('show');
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
        toast.classList.remove('show');
    }, 2500);
}

/* =============================================================================
   5. COMPARTILHAMENTO VIRAL: WHATSAPP (OPÇÃO 1) & INSTAGRAM (OPÇÃO 1)
   ============================================================================= */
function inicializarCompartilhamento() {
    const btnZap = document.getElementById('btnCompartilharZap');
    const btnInsta = document.getElementById('btnCompartilharInsta');

    // Mensagem de mobilização com link oficial para card rico no WhatsApp
    const urlCompartilhamento = 'https://levante13.online';
    const textoCampanha = '★ LEVANTE 13: A VIRADA — O jogo arcade da resistência popular!\n\nDefenda as conquistas do povo brasileiro, enfrente as fake news e dispute o placar da esperança.\n\nJogue e participe:';

    // 1. WhatsApp (Opção 1): Link com rich card preview (Open Graph) + mensagem pronta
    if (btnZap) {
        btnZap.addEventListener('click', () => {
            const mensagemCompleta = `${textoCampanha} ${urlCompartilhamento}`;
            const linkWhatsapp = `https://api.whatsapp.com/send?text=${encodeURIComponent(mensagemCompleta)}`;
            window.open(linkWhatsapp, '_blank', 'noopener,noreferrer');
            mostrarToast('Abrindo WhatsApp...');
        });
    }

    // Função unificada para acionar o compartilhamento nos Stories do Instagram
    async function acionarCompartilharInstagram(botaoOrigem) {
        const cardStoryUrl = 'assets/img/card_story.png';
        const textoInsta = 'Levante 13: A Virada — O arcade da democracia popular brasileira! Acesse levante13.online';

        if (botaoOrigem) botaoOrigem.disabled = true;
        const originalHTML = botaoOrigem ? botaoOrigem.innerHTML : '';
        if (botaoOrigem) {
            botaoOrigem.innerHTML = '<svg class="px-icon"><use href="#px-refresh"></use></svg> Preparando...';
        }

        try {
            // Tenta carregar o Blob da imagem de Stories
            const response = await fetch(cardStoryUrl);
            const blob = await response.blob();
            const arquivoStory = new File([blob], 'levante13_story.png', { type: 'image/png' });

            // Verifica suporte à Web Share API com arquivos (disponível em celulares)
            if (navigator.canShare && navigator.canShare({ files: [arquivoStory] })) {
                await navigator.share({
                    title: 'Levante 13: A Virada',
                    text: textoInsta,
                    files: [arquivoStory]
                });
                mostrarToast('Arte pronta para os Stories!');
            } else {
                // Fallback para Desktop ou navegadores sem compartilhamento direto de arquivos:
                // 1. Copia o link oficial para a área de transferência
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    await navigator.clipboard.writeText(urlCompartilhamento);
                }

                // 2. Dispara o download da imagem 9:16
                const linkDownload = document.createElement('a');
                linkDownload.href = cardStoryUrl;
                linkDownload.download = 'levante13_story.png';
                document.body.appendChild(linkDownload);
                linkDownload.click();
                document.body.removeChild(linkDownload);

                mostrarToast('Arte baixada & Link copiado para os Stories!');
            }
        } catch (err) {
            // Se o usuário cancelou o share nativo, não trata como erro crítico
            if (err.name !== 'AbortError') {
                const linkDownload = document.createElement('a');
                linkDownload.href = cardStoryUrl;
                linkDownload.download = 'levante13_story.png';
                document.body.appendChild(linkDownload);
                linkDownload.click();
                document.body.removeChild(linkDownload);

                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(urlCompartilhamento);
                }
                mostrarToast('Arte baixada! Poste nos Stories e cole o link.');
            }
        } finally {
            if (botaoOrigem) {
                botaoOrigem.disabled = false;
                botaoOrigem.innerHTML = originalHTML;
            }
        }
    }

    // 2. Instagram: Acionamento via Box de Compartilhar ou via Botão do Hero
    if (btnInsta) {
        btnInsta.addEventListener('click', () => acionarCompartilharInstagram(btnInsta));
    }

    const btnHeroInsta = document.getElementById('btnHeroInsta');
    if (btnHeroInsta) {
        btnHeroInsta.addEventListener('click', () => acionarCompartilharInstagram(btnHeroInsta));
    }
}

