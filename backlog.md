# 📋 Backlog Oficial de Desenvolvimento
**Projeto:** **Levante 13: A Virada**  
**Gênero:** Arcade Shoot 'em Up Vertical / *Space Opera* Popular Brasileira  
**Foco Estratégico:** **Prioridade Total no Backend** (PHP, SQLite, Leitura Dinâmica de Fases, Geração de Imagem com GD e Compartilhamento Viral)  
**Idioma e Padrão:** Português do Brasil (PT-BR) em todos os códigos, comentários e documentações  

---

## 🗺️ Mapa de Execução por Fases

```
[FASE 1: BACKEND CORE] ➡️ [FASE 2: FRENTES & DADOS] ➡️ [FASE 3: FRONTEND CANVAS] ➡️ [FASE 4: INTEGRAÇÃO & UI] ➡️ [FASE 5: AUDITORIA]
  (Prioridade Imediata)
```

---

## 🔴 FASE 1: BACKEND CORE & PERSISTÊNCIA (CONCLUÍDA)

### Épico 1: Infraestrutura de Banco de Dados e Segurança (SQLite + PDO)

#### [BE-01] Configuração Segura do Banco SQLite e Conector PDO — ✅ CONCLUÍDO
* **Arquivo:** `api/db.php` e `database/.htaccess`
* **Entrega:** Conexão PDO segura, auto-criação de tabelas, modo WAL ativado e blindagem total contra downloads via HTTP.

#### [BE-02] Modelagem da Tabela de Recordes do Levante — ✅ CONCLUÍDO
* **Arquivo:** `database/game.db`
* **Entrega:** Tabela `leaderboard` com campos auditáveis, `share_token` único e índice de alta velocidade `(score DESC, created_at ASC)`.

---

### Épico 2: Endpoints da API em PHP Puro

#### [BE-03] Descoberta Automática de Fases (`GET /api/levels.php`) — ✅ CONCLUÍDO
* **Arquivo:** `api/levels.php`
* **Entrega:** Varredura dinâmica de `levels/level_*`, ordenação natural (`natsort`), validação nativa com `json_validate()` do PHP 8.4 e verificação de assets.

#### [BE-04] Consulta ao Placar do Levante (`GET /api/leaderboard.php`) — ✅ CONCLUÍDO
* **Arquivo:** `api/leaderboard.php`
* **Entrega:** Ranking decrescente com posições calculadas, limite parametrizável e conformidade estrita com a LGPD (zero exposição de dados sensíveis/IP).

#### [BE-05] Gravação de Pontuações com Validação e Hash Único (`POST /api/leaderboard.php`) — ✅ CONCLUÍDO
* **Arquivo:** `api/leaderboard.php`
* **Entrega:** Sanitização rigorosa de codinomes (Anti-XSS), consultas preparadas, plausibilidade de score e geração de token único com link para WhatsApp.

#### [BE-06] Proteção Anti-Spam com Minimização de Dados (LGPD) — ✅ CONCLUÍDO
* **Arquivo:** `api/leaderboard.php`
* **Entrega:** Rate limiting de 15s por origem usando hash com sal temporário (sem armazenar IPs permanentes).

---

### Épico 3: Motor de Geração de Imagens & Compartilhamento Viral (PHP GD)

#### [BE-07] Gerador do Certificado de Resistência via PHP GD (`api/generate_card.php`) — ✅ CONCLUÍDO
* **Arquivo:** `api/generate_card.php` e `cards/.htaccess`
* **Entrega:** Geração em milissegundos de card 1200x630px para redes sociais com dados da missão e proteção de diretório contra RCE.

#### [BE-08] Página de Compartilhamento e Conversão de Jogadores (`share.php`) — ✅ CONCLUÍDO
* **Arquivo:** `share.php`
* **Entrega:** Injeção dinâmica de Meta Tags Open Graph e Twitter Cards com pré-visualização no WhatsApp e botão de conversão `[ENTRAR NO LEVANTE E JOGAR AGORA]`.

---

## 🟡 FASE 2: FRENTES DE BATALHA & ESTRUTURAÇÃO DE DADOS (CONCLUÍDA)

#### [LV-01] Criação das 6 Frentes Iniciais do Levante (`level_1` a `level_6`) — ✅ CONCLUÍDO
* **Pastas:** `levels/level_1/` a `levels/level_6/`
* **Entrega:** Pastas estruturadas contendo `config.json` completo com as holotransmissões temáticas (Ana Elisa, Jones Manoel, Guardiã Indígena, Saúde Pública, Pastor Henrique Vieira e Lula), formação de grade, tipos de inimigos, chefes e assets procedurais (`bg.png`, `enemy.png`, `mentor.png`).

#### [LV-02] Proteção de Diretório contra Execução de Scripts Maliciosos — ✅ CONCLUÍDO
* **Arquivo:** `levels/.htaccess`
* **Entrega:** Desativação da engine do interpretador PHP e revogação de permissões CGI dentro da pasta de níveis para uploads seguros via FTP.

---

## 🟢 FASE 3: FRONTEND CORE (CANVAS HTML5 + JAVASCRIPT PURO) — ✅ CONCLUÍDA

* [FE-01] Canvas Vertical 9:16 Responsivo e Game Loop (60 FPS, letterboxing e canvas nativo) — ✅ CONCLUÍDO
* [FE-02] Sistema de Controles Adaptável (Teclado PC + Toque Mobile suave com auto-fire) — ✅ CONCLUÍDO
* [FE-03] Módulo de Holotransmissões Sci-Fi (Efeito teletipo sonoro, retrato do mentor e avanço por toque/espaço) — ✅ CONCLUÍDO
* [FE-04] Formação e Inteligência Tática dos Inimigos (Grade sincronizada que acelera + mergulho rasante estilo Galaga) — ✅ CONCLUÍDO
* [FE-05] Sistema de Artefatos da Fundação (Power-ups: Tomo de Freire, Escudo CLT, Megafone, Manto da Diversidade, Urna Soberana com Screen Nuke e Vacina SUS) — ✅ CONCLUÍDO
* [FE-06] Batalha contra Naves Capitânias (Chefes de setor com barra de vida no topo e padrões de disparo) — ✅ CONCLUÍDO
* [FE-07] Balanceamento de Ritmo e Padrões de Movimento Procedural (Classic, Zig-Zag, Orbit, Advance/Retreat, Pincer e Chaos no final) — ✅ CONCLUÍDO
* [FE-08] Temporizador de Fase (180s / ~3 min) e Derrota por Time-out com alerta visual no HUD — ✅ CONCLUÍDO
* [FE-09] Limpeza Completa de Entidades e Reset da Tela no Reinício de Partida — ✅ CONCLUÍDO

---

## 🔵 FASE 4: INTEGRAÇÃO FRONT-BACK & INTERFACE FINAL — ✅ CONCLUÍDA

* [INT-01] Consumo Dinâmico do Manifesto de Níveis (`/api/levels.php` via fetch assíncrono) — ✅ CONCLUÍDO
* [INT-02] Painel Durante o Jogo (HUD Espacial com Vigor, Frente Ativa e Pontos de Resistência) — ✅ CONCLUÍDO
* [INT-03] Tela de Fim de Missão e Envio de Recordes (Modal com Arcade Tag e persistência no SQLite) — ✅ CONCLUÍDO
* [INT-04] Acelerador Viral de Compartilhamento no WhatsApp (Botão 1-toque com link do card e preview rico) — ✅ CONCLUÍDO
* [INT-05] Homepage Oficial de Campanha com Alternância Dinâmica de Modo (Espera / Oficial), Placar Global ao Vivo, Mural da Virada (Frases de Reeleição) e Integração com Redes Oficiais e Comitê Popular de Tecnologia — ✅ CONCLUÍDO

---

## 🛡️ FASE 5: AUDITORIA DE SEGURANÇA E LGPD

#### [SEC-01] Homologação de Privacidade por Design (LGPD)
* **Descrição:** Verificar minuciosamente a ausência de cookies de rastreamento de terceiros, ausência de coleta de e-mails ou dados pessoais identificáveis.
* **Prioridade:** P1

#### [SEC-02] Testes de Penetração e Blindagem de Banco
* **Descrição:** Testar exaustivamente tentativas de SQL Injection, Cross-Site Scripting (XSS), Path Traversal e confirmar a impossibilidade de download do arquivo `.db`.
* **Prioridade:** P1
