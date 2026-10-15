# 🚀 LEVANTE 13: A VIRADA — DEPLOY DA PÁGINA DE ESPERA

Esta pasta contém **exclusivamente os arquivos da Página de Espera Oficial** do projeto (sem arquivos do jogo). É 100% estática, leve e pode ser hospedada em qualquer servidor web ou CDN.

---

## 📂 Arquivos Incluídos

```text
deploy/
├── index.html                  # Página principal de espera (abre direto na raiz)
├── home.html                   # Cópia compatível caso acesse /home.html
├── .htaccess                   # Configurações de gzip, cache e MIME types
├── css/
│   └── home.css                # Estilo retrô arcade pixel perfect
├── js/
│   └── home.js                 # Lógica da página com modo de espera ativo
└── assets/
    ├── fonts/
    │   └── vcr_osd_mono.ttf    # Fonte oficial VCR OSD Mono
    └── img/
        ├── og-preview.png      # Thumbnail Open Graph para redes sociais (WhatsApp 1200x630)
        └── card_story.png      # Arte vertical para Stories do Instagram (1080x1920)
```

---

## 🛠️ Como Subir no Servidor

### Hospedagem Compartilhada (cPanel / Apache / Nginx / Hostinger / etc.)
1. Conecte via FTP ou acesse o Gerenciador de Arquivos do cPanel.
2. Abra a pasta pública do seu domínio (geralmente `public_html/` ou `www/`).
3. Envie todos os arquivos e pastas de `deploy/` diretamente para lá.

### Hospedagem Estática (Vercel, Netlify, GitHub Pages, Cloudflare Pages)
- Basta selecionar ou arrastar esta pasta `deploy/` para o serviço de deploy. Não precisa de build nem de comandos adicionais.

---

## ✨ Características desta Versão
- **Sem arquivos do jogo:** Não depende de PHP, SQLite, áudio ou fases.
- **Botões "JOGAR AGORA" desativados:** Indicando claramente que os motores estão em calibração e a decolagem está próxima.
- **Links de Mobilização Ativos:** Acesso direto ao **Comitê de Tecnologia**, **Virômetro** e **Bora Lula**.
- **Compartilhamento Viral WhatsApp & Instagram:** Box especial com preview da arte de Stories (9:16), botão direto de WhatsApp com link de rich card e suporte a Web Share API / download inteligente para o Instagram.
- **Pixel Perfect:** Tipografia oficial VCR OSD Mono e ícones SVG integrados.
