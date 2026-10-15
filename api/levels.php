<?php
declare(strict_types=1);

/**
 * Levante 13: A Virada
 * Endpoint: Descoberta Automática de Fases
 * Rota: GET /api/levels.php
 *
 * Funcionalidades:
 * - Vasculha dinamicamente as pastas no padrão `levels/level_*` (ordem natural: level_10 vem após level_9).
 * - Valida o `config.json` e ignora pastas com erro (o motivo vai para o log do PHP).
 * - Entrega manifesto em JSON para o frontend.
 * A leitura em si fica em api/fases.php, compartilhada com a validação de pontos.
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/fases.php';

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: public, max-age=60'); // Cache leve de 1 minuto no cliente

$metodoRequisicao = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if ($metodoRequisicao !== 'GET') {
    http_response_code(405);
    echo json_encode([
        'sucesso' => false,
        'erro'    => 'Método não permitido. Utilize GET.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$fasesValidas = carregarFases();

echo json_encode([
    'sucesso' => true,
    'total'   => count($fasesValidas),
    'fases'   => $fasesValidas
], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
