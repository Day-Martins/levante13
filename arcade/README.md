# Astro Arcade

Shoot 'em up vertical para navegador: HTML5 Canvas + JS puro no front, PHP puro + SQLite no back.
Sem cadastro, com fases "drop-in", card de compartilhamento e ranking validado no servidor.

## Rodar localmente

Requisitos: PHP 8.1+ com as extensões `pdo_sqlite` e `gd`.

```bash
php -S localhost:8000 -t public
```

Abra http://localhost:8000. O banco (`data/game.sqlite`) e a chave secreta são criados sozinhos na primeira requisição.

## Estrutura

```
public/                  ← raiz do site (document root)
  index.html, style.css, game.js
  share.php              página do link compartilhado (meta tags Open Graph)
  api/
    lib.php              funções comuns, validação de fases e fórmula de pontos
    levels.php           GET  lista de fases válidas
    start.php            POST {nick} → {token}
    score.php            POST {token, score, log} → {rank, shareUrl, cardUrl}
    leaderboard.php      GET  melhor pontuação de cada apelido
    card.php             GET  ?run=ID → PNG 1200x630 (gerado com GD, cacheado)
  levels/level_N/        bg.png, enemy.png, config.json
data/                    ← FORA do document root (banco, chave, cards em cache)
```

## Criar uma fase nova

Crie `public/levels/level_4/` com três arquivos:

- `bg.png`: fundo 360×640. Para rolar sem emenda, a borda de cima precisa casar com a de baixo.
- `enemy.png`: sprite do inimigo, desenhado em 24×18 (use múltiplos, ex. 22×16 em pixel art 2×).
- `config.json`:

```json
{
  "name": "Nome da fase",
  "order": 4,
  "color": "#7dff8a",
  "intro": "Texto curto que aparece antes da fase (até 120 caracteres).",
  "enemy": { "hp": 1, "speed": 40, "fireRate": 1.0, "points": 150 },
  "formation": { "rows": 4, "cols": 7, "pattern": "grid" }
}
```

| Campo | Faixa aceita | O que faz |
|---|---|---|
| `enemy.hp` | 1–10 | tiros para derrubar cada inimigo |
| `enemy.speed` | 10–200 | velocidade da marcha (px/s); acelera quando sobram poucos |
| `enemy.fireRate` | 0–5 | tiros por segundo da formação inteira |
| `enemy.points` | 10–5000 | pontos por abate |
| `formation.rows` / `cols` | 1–6 / 1–10 | tamanho da formação |
| `formation.pattern` | `grid`, `zigzag`, `dive` | marcha clássica, onda lateral ou mergulhos na nave |
| `order` | 0–9999 | posição na sequência (opcional; padrão = número da pasta) |
| `color` | `#RRGGBB` | cor das explosões (opcional) |

Se algum campo estiver errado ou faltar arquivo, a pasta é **ignorada** e o motivo vai para o log de erros do PHP (`[arcade] fase level_4 ignorada: ...`). O jogo continua funcionando com as outras fases.

Depois da última fase o jogo recomeça da primeira, com pontos ×1,5, ×2,0… e inimigos 20% mais rápidos a cada volta.

## Pontuação e antitrapaça

- Abate: `round(points × (1 + 0,5 × volta))`. Fase concluída: `500 × número da fase`.
- O cliente envia o log de abates por fase; o `score.php` recalcula a pontuação e só aceita se bater **exatamente**. Também exige que as fases anteriores tenham sido limpas por completo e um tempo mínimo de partida.
- Cada token de partida vale uma vez e expira em 3 h.
- Limite de 40 partidas por 10 minutos por IP.

**Se mudar a fórmula, mude nos dois lugares:** `game.js` e `expected_score()` em `api/lib.php`.

Isso barra a trapaça óbvia (editar a requisição). Alguém que reescreva o cliente para simular abates ainda consegue, mas dá trabalho; para um jogo casual é um nível razoável.

## Privacidade (LGPD)

O jogo guarda apenas: apelido, pontuação, fase e horários. Para limitar abuso, guarda um **hash** do IP com sal secreto que muda todo dia, e esse hash é apagado das partidas com mais de 24 h. Não há cookies, e-mail, telefone nem senha. O apelido fica no `localStorage` do próprio navegador do jogador só para preencher o campo.

O hash de IP ainda conta como dado pessoal enquanto existe, então vale uma política de privacidade curta explicando isso.

## Publicar (produção)

1. Suba a pasta inteira e aponte o **document root** para `public/`. A pasta `data/` precisa ficar fora dela e com permissão de escrita para o PHP.
2. Em `api/lib.php`, preencha `PUBLIC_URL` (ex.: `https://jogo.seudominio.com.br`) e troque `GAME_NAME` se for mudar o nome.
3. Use HTTPS: o WhatsApp só mostra prévia de imagem em links acessíveis publicamente.
4. Teste a prévia colando o link de um `share.php?run=...` no WhatsApp ou no [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/).

Hospedagem compartilhada com PHP funciona. Em VPS com Nginx, basta um bloco `location ~ \.php$` apontando para o PHP-FPM.

## Próximos passos sugeridos

- Painel simples de upload de fases (hoje é via SFTP/FTP).
- Mais padrões de formação (`spiral`, `wave`) em `game.js` → `slot()` / `updateFormation()`.
- Power-ups e chefe de fase.
- Ranking semanal (filtrar `runs.finished_at` pela semana).
