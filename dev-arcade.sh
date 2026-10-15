#!/usr/bin/env bash
# =============================================================================
# ASTRO ARCADE — Servidor Isolado de Desenvolvimento (Porta 8081)
# Script: dev-arcade.sh
# 
# Inicia o projeto da pasta 'arcade' utilizando 'arcade/public' como document root.
# =============================================================================

PORTA=8081
HOST="127.0.0.1"

echo "================================================================="
echo "       🚀 INICIANDO ASTRO ARCADE (ISOLADO) NA PORTA ${PORTA}     "
echo "================================================================="
echo ""
echo " Document Root: arcade/public"
echo " Servidor PHP ativo em: http://${HOST}:${PORTA}"
echo " Acesse no navegador:   http://localhost:${PORTA}"
echo ""
echo " Pressione Ctrl+C para encerrar o servidor a qualquer momento."
echo "================================================================="
echo ""

# Abre o navegador automaticamente no macOS após 1 segundo
if command -v open >/dev/null 2>&1; then
    (sleep 1 && open "http://localhost:${PORTA}") &
fi

# Inicia o servidor embutido do PHP apontando para arcade/public
exec php -S "${HOST}:${PORTA}" -t arcade/public
