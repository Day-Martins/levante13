# 🚀 LEVANTE 13: A VIRADA — PACOTE DE DEPLOY (TESTE & PRODUÇÃO)

Este pacote contém o projeto completo **Levante 13: A Virada**, incluindo o arcade vertical, backend PHP, APIs, gerador de cards via GD, banco SQLite e a **Página Principal com os links desabilitados por padrão** (Modo de Espera / Hangar de Pré-Lançamento).

---

## 🎯 Objetivo Deste Pacote

Permitir que você publique o site em seu servidor web (Apache / Nginx + PHP 8.1+) e envie o link **diretamente para os testadores**, enquanto visitantes comuns que acessam a raiz do site verão a página de espera com os botões "JOGAR AGORA" desativados indicando *"EM BREVE"*.

---

## 🔗 Como Testar

| Cenário | URL de Acesso | O que acontece |
|---|---|---|
| **Público Geral (Página de Espera)** | `https://seusite.com/` | Entra no Hangar da Resistência. Todos os botões de jogar ficam desabilitados ("EM BREVE"). |
| **Acesso Direto ao Jogo (Para Testadores)** | `https://seusite.com/game.html` | Abre diretamente a tela do arcade espacial pronta para jogar. |
| **Desbloqueio Secreto da Home (Para Testadores)** | `https://seusite.com/?modo=jogar` | Abre a Home com os botões "JOGAR AGORA" habilitados exclusivamente para quem usou este link. |
| **Voltar a Bloquear a Home** | `https://seusite.com/?modo=espera` | Força a Home de volta ao modo bloqueado no navegador. |

---

## 📂 Estrutura de Arquivos

```text
deploy/
├── index.php                  # Entrada principal (carrega a Home com modo espera ativo)
├── home.html                  # Landing page de campanha e mobilização
├── game.html                  # O arcade clássico completo com áudio, chefes e mentores
├── share.php                  # Página de compartilhamento social (Open Graph / WhatsApp)
├── .htaccess                  # Configuração do Apache (gzip, cache, segurança)
├── api/                       # Endpoints PHP (leaderboard, fases, cards, jogador)
│   ├── config.php
│   ├── db.php
│   ├── fases.php
│   ├── generate_card.php
│   ├── leaderboard.php
│   └── player.php
├── css/
│   ├── home.css               # Estilos da landing page
│   └── style.css              # Estilos do arcade
├── js/
│   ├── audio.js               # Sintetizador procedural Web Audio API (música + SFX + sirene)
│   ├── auth.js                # Teclado Urna Eletrônica PIN + Codinome
│   ├── entities.js            # Naves inimigas, chefes, mentores e tiros
│   ├── game.js                # Loop principal do jogo, colisões e pontuação
│   └── home.js                # Lógica da landing page (modo espera ativo por padrão)
├── assets/
│   ├── fonts/                 # Fonte VCR OSD Mono
│   ├── images/                # Banner do hero
│   └── img/                   # Artes de compartilhamento (WhatsApp e Instagram Stories)
├── levels/                    # Fases 1 a 6 (fundos, sprites, chefes e diálogos)
│   ├── level_1 .. level_6
│   └── .htaccess              # Impede execução de scripts maliciosos na pasta de níveis
├── database/
│   ├── game.db                # Banco de dados SQLite com tabelas criadas
│   └── .htaccess              # Impede download direto do banco via navegador
└── cards/
    └── .htaccess              # Diretório onde os cards gerados pelo PHP GD são salvos
```

---

## 🛠️ Requisitos do Servidor

1. **PHP:** Versão 8.1 ou superior.
2. **Extensões PHP necessárias:**
   - `pdo_sqlite` (para o ranking e autenticação de pilotos)
   - `gd` com suporte a FreeType / PNG (para geração dos cards de vitória/compartilhamento)
3. **Servidor Web:** Apache (com `mod_rewrite` e suporte a `.htaccess`) ou Nginx equivalente.

---

## ⚙️ Permissões de Escrita (Importante!)

Para que o SQLite grave os recordes e o PHP gere os cards de compartilhamento, certifique-se de que o usuário do servidor web (`www-data`, `nobody` ou o seu usuário cPanel) tenha permissão de escrita nas seguintes pastas:

```bash
chmod 775 database database/game.db
chmod 775 cards
```
*(No cPanel / Gerenciador de Arquivos, certifique-se de que as permissões de `database` e `cards` estejam como `755` ou `775`).*

---

## 🔒 Segurança Integrada
- O arquivo `database/.htaccess` bloqueia qualquer tentativa de download de `game.db`, `game.db-wal` ou arquivos ocultos.
- As pastas `cards/` e `levels/` possuem regras que proíbem a execução de qualquer script PHP.
- Todas as APIs utilizam Prepared Statements PDO contra SQL Injection e sanitização contra XSS.
