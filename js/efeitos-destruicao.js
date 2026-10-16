// =============================================================================
// LEVANTE 13: A VIRADA — Efeitos de Destruição Temáticos por Frente
// Arquivo: js/efeitos-destruicao.js
//
// Cada frente escolhe como seus robôs se desfazem pelo campo "destructionEffect"
// do config.json (glitch, papel, brasa, nevoa, fumaca, sucata). Sem o campo, usa a
// explosão padrão. Tudo é feito com partículas simples, leves para celular.
// =============================================================================

const EFEITOS_DESTRUICAO = {
    // Frente 1 — Fake news: o sinal digital cai e o robô se parte em faixas com glitch
    glitch: {
        tremor: 0,
        gerar(x, y, qtd) {
            const ps = [];
            for (let i = 0; i < qtd; i++) {
                const larga = Math.random() < 0.6;
                ps.push({
                    x: x + (Math.random() - 0.5) * 18, y: y + (Math.random() - 0.5) * 14,
                    vx: (Math.random() - 0.5) * 5, vy: (Math.random() - 0.5) * 1.2,
                    atrito: 0.88, vida: 22, maxVida: 22,
                    largura: larga ? 6 + Math.random() * 8 : 2, altura: larga ? 2 : 2,
                    cor: ['#ff2bd6', '#94a3b8', '#ff2bd6', '#e2e8f0', '#6d28d9'][i % 5],
                    piscar: true
                });
            }
            return ps;
        }
    },

    // Frente 2 — Precarização: o "contrato" rasga em tiras de papel que caem flutuando
    papel: {
        tremor: 0,
        gerar(x, y, qtd) {
            const ps = [];
            for (let i = 0; i < qtd; i++) {
                ps.push({
                    x, y,
                    vx: (Math.random() - 0.5) * 3.2, vy: -1.6 - Math.random() * 1.4,
                    gravidade: 0.07, atrito: 0.97, oscilar: Math.random() * Math.PI * 2,
                    vida: 46, maxVida: 46,
                    largura: 3, altura: 6, rot: Math.random() * Math.PI, vrot: (Math.random() - 0.5) * 0.35,
                    cor: i % 3 === 0 ? '#c2410c' : (i % 2 ? '#e7d7b1' : '#d6c29a')
                });
            }
            return ps;
        }
    },

    // Frente 3 — Garimpo e desmatamento: a brasa se apaga e vira cinza e fumaça
    brasa: {
        tremor: 0,
        gerar(x, y, qtd) {
            const ps = [];
            for (let i = 0; i < qtd; i++) {
                ps.push({
                    x: x + (Math.random() - 0.5) * 12, y,
                    vx: (Math.random() - 0.5) * 1.8, vy: -0.6 - Math.random() * 1.6,
                    atrito: 0.97, vida: 38, maxVida: 38,
                    largura: 2, altura: 2,
                    cor: '#fb923c', corFinal: '#57534e'
                });
            }
            for (let i = 0; i < Math.ceil(qtd / 3); i++) {
                ps.push({
                    x: x + (Math.random() - 0.5) * 10, y,
                    vx: (Math.random() - 0.5) * 0.6, vy: -0.5 - Math.random() * 0.5,
                    vida: 40, maxVida: 40, raio: 2, cresce: 0.18, alpha: 0.45,
                    cor: '#44403c'
                });
            }
            return ps;
        }
    },

    // Frente 4 — Negacionismo: a névoa tóxica se espalha e some
    nevoa: {
        tremor: 0,
        gerar(x, y, qtd) {
            const ps = [];
            for (let i = 0; i < qtd; i++) {
                const ang = Math.random() * Math.PI * 2, vel = 0.4 + Math.random() * 1.2;
                ps.push({
                    x, y, vx: Math.cos(ang) * vel, vy: Math.sin(ang) * vel,
                    atrito: 0.96, vida: 34, maxVida: 34,
                    raio: 2 + Math.random() * 2, cresce: 0.28, alpha: 0.5,
                    cor: i % 2 ? '#a855f7' : '#f472b6'
                });
            }
            return ps;
        }
    },

    // Frente 5 — Intolerância: a tocha se apaga numa chama curta que vira fumaça escura
    fumaca: {
        tremor: 0,
        gerar(x, y, qtd) {
            const ps = [];
            for (let i = 0; i < Math.ceil(qtd / 2); i++) {
                ps.push({
                    x: x + (Math.random() - 0.5) * 10, y,
                    vx: (Math.random() - 0.5) * 1.5, vy: -1.2 - Math.random() * 1.5,
                    vida: 12, maxVida: 12, largura: 3, altura: 3,
                    cor: i % 2 ? '#f97316' : '#cd7f32', corFinal: '#7f1d1d'
                });
            }
            for (let i = 0; i < qtd; i++) {
                ps.push({
                    x: x + (Math.random() - 0.5) * 12, y: y - 2,
                    vx: (Math.random() - 0.5) * 0.7, vy: -0.4 - Math.random() * 0.8,
                    vida: 42, maxVida: 42, raio: 2, cresce: 0.2, alpha: 0.55,
                    cor: '#3f3f46'
                });
            }
            return ps;
        }
    },

    // Frente 6 — Golpismo e milícia: o robô vira sucata, placas de metal e faíscas
    sucata: {
        tremor: 3,
        gerar(x, y, qtd) {
            const ps = [];
            for (let i = 0; i < Math.ceil(qtd / 2); i++) {
                ps.push({
                    x, y,
                    vx: (Math.random() - 0.5) * 4, vy: -2 - Math.random() * 2,
                    gravidade: 0.16, vida: 44, maxVida: 44,
                    largura: 4, altura: 3, rot: Math.random() * Math.PI, vrot: (Math.random() - 0.5) * 0.5,
                    cor: i % 2 ? '#a1a1aa' : '#71717a'
                });
            }
            for (let i = 0; i < qtd; i++) {
                const ang = Math.random() * Math.PI * 2, vel = 2.5 + Math.random() * 3;
                ps.push({
                    x, y, vx: Math.cos(ang) * vel, vy: Math.sin(ang) * vel,
                    atrito: 0.86, vida: 14, maxVida: 14, largura: 2, altura: 2,
                    cor: '#fdba74', corFinal: '#ea580c'
                });
            }
            return ps;
        }
    }
};

/** Converte '#rrggbb' em [r, g, b] (com cache). */
const _cacheCoresEfeito = {};
function corParaRgbEfeito(hex) {
    if (_cacheCoresEfeito[hex]) return _cacheCoresEfeito[hex];
    const n = parseInt(hex.slice(1), 16);
    return (_cacheCoresEfeito[hex] = [(n >> 16) & 255, (n >> 8) & 255, n & 255]);
}

/**
 * Cria as partículas de destruição do efeito pedido.
 * Retorna { particulas, tremor } ou null se o efeito não existir (o jogo usa a explosão padrão).
 */
function criarDestruicaoTematica(efeito, x, y, quantidade) {
    const def = EFEITOS_DESTRUICAO[efeito];
    if (!def) return null;
    return { particulas: def.gerar(x, y, quantidade), tremor: def.tremor };
}

/** Avança uma partícula um quadro (vale também para as partículas simples de antes). */
function atualizarParticulaEfeito(p) {
    if (p.atrito) { p.vx *= p.atrito; p.vy *= p.atrito; }
    if (p.gravidade) p.vy += p.gravidade;
    if (p.oscilar !== undefined) { p.oscilar += 0.18; p.x += Math.sin(p.oscilar) * 0.6; }
    p.x += p.vx;
    p.y += p.vy;
    if (p.vrot) p.rot += p.vrot;
    if (p.cresce) p.raio += p.cresce;
    p.vida--;
}

/** Desenha uma partícula. As simples (só cor) continuam como quadrados de 2x2. */
function desenharParticulaEfeito(ctx, p) {
    const t = Math.max(0, p.vida / p.maxVida);
    let alpha = t * (p.alpha || 1);
    if (p.piscar && Math.random() < 0.3) alpha *= 0.25;
    ctx.globalAlpha = alpha;

    let cor = p.cor;
    if (p.corFinal) {
        const a = corParaRgbEfeito(p.cor), b = corParaRgbEfeito(p.corFinal), k = 1 - t;
        cor = `rgb(${Math.round(a[0] + (b[0] - a[0]) * k)},${Math.round(a[1] + (b[1] - a[1]) * k)},${Math.round(a[2] + (b[2] - a[2]) * k)})`;
    }
    ctx.fillStyle = cor;

    if (p.raio) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.raio, 0, Math.PI * 2);
        ctx.fill();
    } else if (p.rot !== undefined) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillRect(-p.largura / 2, -p.altura / 2, p.largura, p.altura);
        ctx.restore();
    } else {
        ctx.fillRect(p.x, p.y, p.largura || 2, p.altura || 2);
    }
}
