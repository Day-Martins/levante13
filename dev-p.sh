#!/usr/bin/env bash
# =============================================================================
# LEVANTE 13: A VIRADA — Servidor Local de Desenvolvimento
# Script: dev-p.sh
# 
# Inicia o servidor embutido do PHP e abre o navegador para testes locais.
# =============================================================================

PORTA=8080
HOST="127.0.0.1"

echo "================================================================="
echo "       🚀 INICIANDO SERVIDOR LOCAL — LEVANTE 13: A VIRADA        "
echo "================================================================="
echo ""
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

# Inicia o servidor web embutido do PHP com o roteador que bloqueia database/ e arquivos ocultos
exec php -S "${HOST}:${PORTA}" router.php
