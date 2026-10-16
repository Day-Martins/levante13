# Construtor de Fases — Levante 13

Ferramenta offline para criar fases sem programar. Não faz parte do site publicado
(a pasta `ferramentas/` fica fora do `deploy/`).

## Como usar

1. Abra `CONSTRUTOR_LEVEL.html` no navegador (dois cliques; funciona sem internet).
2. Preencha os campos, envie as imagens (fundo, robô, chefe e mentor) e confira a prévia.
3. Exporte o pacote `.zip`. Ele traz a pasta `level_N/` com `config.json` e as imagens.
4. Copie a pasta `level_N/` para `levels/` (e para `deploy/levels/`, para publicar).
   O jogo lê as fases em ordem natural: `level_7` entra depois de `level_6`.

## Campo novo: efeito de destruição

O manual em PDF foi escrito antes deste campo. No `config.json`, `destructionEffect`
define como os robôs se desfazem ao serem abatidos:

| Valor | Efeito | Usado na |
|---|---|---|
| `glitch` | Faixas de sinal digital caindo | Frente 1 (fake news) |
| `papel` | Tiras de contrato rasgado | Frente 2 (trabalho) |
| `brasa` | Brasas que viram cinza e fumaça | Frente 3 (floresta) |
| `nevoa` | Névoa tóxica que se dissipa | Frente 4 (saúde) |
| `fumaca` | Chama curta que vira fumaça escura | Frente 5 (intolerância) |
| `sucata` | Placas de metal e faíscas | Frente 6 (golpismo) |

Sem o campo (ou com valor desconhecido), o jogo usa a explosão padrão.
Os efeitos ficam em `js/efeitos-destruicao.js`.

## Observações

- O campo "Tema Estético" (`theme`) é só descritivo: o jogo não o usa hoje.
- O caminho do avatar no `config.json` não importa: o jogo usa o `mentor.png` da pasta da fase.
- A pasta `exemplo_level/` é só referência. Não a coloque em `levels/`, ou ela vira uma fase jogável.
