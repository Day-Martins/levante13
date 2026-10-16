<?php
declare(strict_types=1);

/**
 * =============================================================================
 * LEVANTE 13: A VIRADA — Portal Oficial de Campanha e Arcade Espacial
 * Arquivo: index.php
 * =============================================================================
 * 
 * Atua como ponto de entrada principal do domínio (https://levante13.online/),
 * entregando a Homepage Oficial com suporte nativo aos dois modos:
 * - Modo de Espera (Pré-Lançamento / Teaser / Contagem Regressiva)
 * - Modo Oficial (Pós-Lançamento com Leaderboard ao Vivo e Acesso ao Jogo)
 */

// Entrega a Homepage Oficial de Campanha
require_once __DIR__ . '/home.html';
