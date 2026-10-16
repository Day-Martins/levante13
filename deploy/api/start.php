<?php
declare(strict_types=1);

/**
 * Levante 13: A Virada
 * Endpoint: Abertura de Partida
 * Rota: POST /api/start.php
 *
 * Gera um token de uso único que o jogo envia junto com o recorde.
 * Sem token válido, o placar não aceita a pontuação.
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    http_response_code(405);
    echo json_encode(['sucesso' => false, 'erro' => 'Método não permitido. Utilize POST.'], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $pdo = getDbConnection();
    $agora = time();
    $ip = hashIp();

    // Limite de abuso: no máximo 40 partidas a cada 10 minutos por origem
    $stmt = $pdo->prepare('SELECT COUNT(*) FROM partidas WHERE ip_hash = :ip AND iniciada_em > :desde');
    $stmt->execute([':ip' => $ip, ':desde' => $agora - 600]);
    if ((int) $stmt->fetchColumn() >= 40) {
        http_response_code(429);
        echo json_encode(['sucesso' => false, 'erro' => 'Muitas partidas seguidas. Aguarde alguns minutos.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // Faxina (LGPD e tamanho do banco): partidas com mais de 1 dia saem; hashes de IP antigos também
    $pdo->prepare('DELETE FROM partidas WHERE iniciada_em < :limite')->execute([':limite' => $agora - 86400]);
    $pdo->prepare('DELETE FROM rate_limits WHERE last_submission < :limite')->execute([':limite' => $agora - 86400]);

    $token = bin2hex(random_bytes(16));
    $pdo->prepare('INSERT INTO partidas (token, iniciada_em, ip_hash) VALUES (:t, :agora, :ip)')
        ->execute([':t' => $token, ':agora' => $agora, ':ip' => $ip]);

    echo json_encode(['sucesso' => true, 'token' => $token], JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
    error_log('Erro ao abrir partida: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['sucesso' => false, 'erro' => 'Erro interno ao iniciar a partida.'], JSON_UNESCAPED_UNICODE);
}
