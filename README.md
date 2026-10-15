# Levante 13: A Virada

Arcade vertical para navegador: HTML5 Canvas + JavaScript puro no front, PHP 8.3+ com SQLite no back.

## Rodar localmente (macOS)

Requisitos: PHP 8.3 ou mais novo com `pdo_sqlite` e `gd` (`brew install php` já traz os dois).

```bash
./dev-p.sh
```

O script abre `http://localhost:8080` no navegador. Ele usa o `router.php`, que bloqueia o acesso à pasta `database/` e a arquivos ocultos. O servidor embutido do PHP ignora os `.htaccess`, então **não rode `php -S` sem o roteador**.

O banco (`database/game.db`) e o segredo do servidor (`database/.segredo`) são criados sozinhos na primeira requisição. Nenhum dos dois vai para o Git.

## Criar uma frente nova

Crie `levels/level_7/` com `bg.png` (360×640), `enemy.png`, `mentor.png` (128×128) e `config.json` no mesmo formato das fases existentes. As pastas são lidas em ordem natural (`level_10` vem depois de `level_9`).

A API ignora a pasta, e registra o motivo no log do PHP, se:

- `grid.rows` não for inteiro de 1 a 8, ou `grid.cols` de 1 a 10;
- `enemyTypes` estiver vazio, ou algum tipo estiver sem `id`, com `id` repetido ou com `points` inválido;
- `boss.points` for inválido.

A linha `r` da grade usa o tipo `enemyTypes[r % total]`. O servidor usa essa mesma regra para saber quantos inimigos de cada tipo existem.

## Pontuação e antitrapaça

1. Ao começar, o jogo chama `POST api/start.php` e recebe um token de uso único.
2. Durante a partida, o jogo registra os abates por tipo de inimigo e se o chefe caiu, em cada frente.
3. Ao salvar o recorde, `api/leaderboard.php` recalcula a pontuação a partir desse registro e das configs das fases. Ele só aceita se:
   - o total bater exatamente;
   - nenhum tipo tiver mais abates do que existem na grade;
   - todas as frentes antes da última estiverem completas (grade limpa e chefe derrotado);
   - houver pelo menos 8 segundos de partida por frente concluída.

Cada token vale uma vez e é apagado em 24 h.

**Se a regra de pontos mudar no `game.js`** (bônus de tempo, combo, pontos por item), a função `recalcularPontuacao()` em `api/fases.php` precisa mudar junto. Senão, partidas legítimas passam a ser recusadas.

Isso barra a trapaça óbvia (editar a requisição no DevTools). Quem reescrever o jogo para simular abates ainda consegue, mas dá trabalho.

## Publicar

1. Em `api/config.php`, preencha `URL_PUBLICA` com `https://levante13.online`.
2. **Apache:** os `.htaccess` de `database/`, `cards/` e `levels/` já fazem os bloqueios. **Nginx:** os `.htaccess` não valem; bloqueie `/database/` e a execução de PHP em `/cards/` e `/levels/` na configuração do servidor.
3. As pastas `database/` e `cards/` precisam ter permissão de escrita para o PHP.
4. Use HTTPS. O WhatsApp só mostra a prévia de links públicos.

## Funcionalidades em Destaque

### 🗳️ Autenticação de Codinome com Urna Eletrônica
- Ao iniciar a partida, o jogador insere seu **Codinome** de piloto (3 a 12 caracteres).
- **Proteção Opcional com Senha:** O jogador pode optar por registrar uma senha numérica de 4 dígitos na interface realista da **Urna Eletrônica** (display de dígitos, botões 0-9, CORRIGE e CONFIRMA com efeitos sonoros de bipes e o clássico *"Pililili... Confirma"*).
- **Codinomes Livres:** Se optar por não proteger, o codinome permanece aberto e pode ser reutilizado por qualquer jogador.
- **Validação Segura:** Armazenamento com hash criptográfico Bcrypt no SQLite (`players`). No envio do placar, pontuações de codinomes protegidos exigem a autenticação correspondente.

### 👾 Chefes Únicos das 6 Frentes e Desmembramento Progressivo
- Cada frente possui seu próprio Chefe de final de fase com design e paleta inspirados na temática do setor.
- **Chefe Final (Frente 6):** Apresenta 4 fases com mecânica de **desmembramento progressivo** — perde peças da blindagem conforme sofre dano (asas laterais, núcleo e placa frontal) enquanto suas armas ganham maior cadência e poder de fogo, com surgimento de cápsulas de power-up para apoiar a resistência.

### ✊ Mentores da Resistência em Pixel Art
- Transmissões holográficas no início de cada frente com retratos em pixel art de referências históricas e contemporâneas:
  - **Frente 1:** Ana Prestes (Historiadora e Socióloga)
  - **Frente 2:** Jones Manoel (Educador Popular e Historiador)
  - **Frente 3:** Pastor Henrique Vieira (Teólogo e Ativista)
  - **Frente 4:** Sonia Guajajara (Liderança Indígena e Ministra)
  - **Frente 5 & 6:** Presidente Lula (Liderança Popular e Soberania)

### 🌊 Movimentação Errática de Manada
- Conforme o número de invasores na grade diminui, a movimentação torna-se progressivamente mais errática e imprevisível, simulando a quebra do efeito de manada fascista.

## LGPD e Privacidade

O jogo segue estritamente as diretrizes da LGPD com minimização de dados: armazena apenas o codinome, a pontuação, o PIN em hash Bcrypt e a frente alcançada. Para limitar abusos, utiliza rate-limiting com hash temporário. Não há coleta de e-mail, rastreadores invasivos nem cookies de terceiros.
