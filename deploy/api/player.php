<?php
declare(strict_types=1);

/**
 * =============================================================================
 * LEVANTE 13: A VIRADA — Gerenciamento de Codinomes e Autenticação por PIN
 * Arquivo: api/player.php
 * =============================================================================
 * 
 * Rotas:
 * - GET  /api/player.php?codename=XYZ : Verifica se o codinome é protegido ou livre.
 * - POST /api/player.php              : Autentica com PIN de 4 dígitos ou registra proteção.
 */

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

require_once __DIR__ . '/db.php';

try {
    $pdo = getDbConnection();
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['sucesso' => false, 'erro' => 'Falha na conexão com o banco.'], JSON_UNESCAPED_UNICODE);
    exit;
}

$metodo = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($metodo === 'GET') {
    processarConsultaCodinome($pdo);
} elseif ($metodo === 'POST') {
    processarAcaoPlayer($pdo);
} else {
    http_response_code(405);
    echo json_encode(['sucesso' => false, 'erro' => 'Método não permitido.'], JSON_UNESCAPED_UNICODE);
}

/**
 * Consulta se um codinome já está protegido por PIN.
 */
function processarConsultaCodinome(PDO $pdo): void
{
    $codename = trim((string)($_GET['codename'] ?? ''));

    if (!validarFormatoCodename($codename)) {
        http_response_code(422);
        echo json_encode([
            'sucesso' => false,
            'erro'    => 'Codinome inválido. Use entre 3 e 12 caracteres alfanuméricos.'
        ], JSON_UNESCAPED_UNICODE);
        return;
    }

    $stmt = $pdo->prepare('SELECT id, codename FROM players WHERE codename = :c LIMIT 1');
    $stmt->bindValue(':c', $codename, PDO::PARAM_STR);
    $stmt->execute();
    $player = $stmt->fetch();

    if ($player) {
        echo json_encode([
            'sucesso'   => true,
            'codename'  => $player['codename'],
            'status'    => 'protegido',
            'protegido' => true,
            'mensagem'  => 'Codinome protegido por senha.'
        ], JSON_UNESCAPED_UNICODE);
    } else {
        echo json_encode([
            'sucesso'   => true,
            'codename'  => $codename,
            'status'    => 'livre',
            'protegido' => false,
            'mensagem'  => 'Codinome livre para uso.'
        ], JSON_UNESCAPED_UNICODE);
    }
}

/**
 * Validação de PIN e registro de proteção para o codinome.
 */
function processarAcaoPlayer(PDO $pdo): void
{
    $raw = file_get_contents('php://input');
    if (!$raw || !json_validate($raw)) {
        http_response_code(400);
        echo json_encode(['sucesso' => false, 'erro' => 'JSON inválido.'], JSON_UNESCAPED_UNICODE);
        return;
    }

    $dados    = json_decode($raw, true);
    $action   = trim((string)($dados['action'] ?? 'verificar'));
    $codename = trim((string)($dados['codename'] ?? ''));
    $pin      = trim((string)($dados['pin'] ?? ''));

    if (!validarFormatoCodename($codename)) {
        http_response_code(422);
        echo json_encode(['sucesso' => false, 'erro' => 'Codinome inválido (3 a 12 caracteres).'], JSON_UNESCAPED_UNICODE);
        return;
    }

    if (!preg_match('/^\d{4}$/', $pin)) {
        http_response_code(422);
        echo json_encode(['sucesso' => false, 'erro' => 'A senha deve conter exatamente 4 números.'], JSON_UNESCAPED_UNICODE);
        return;
    }

    if ($action === 'verificar') {
        // Autentica codinome existente
        $stmt = $pdo->prepare('SELECT id, pin_hash FROM players WHERE codename = :c LIMIT 1');
        $stmt->bindValue(':c', $codename, PDO::PARAM_STR);
        $stmt->execute();
        $player = $stmt->fetch();

        if (!$player) {
            http_response_code(404);
            echo json_encode(['sucesso' => false, 'erro' => 'Codinome não encontrado.'], JSON_UNESCAPED_UNICODE);
            return;
        }

        if (!password_verify($pin, $player['pin_hash'])) {
            http_response_code(401);
            echo json_encode([
                'sucesso'     => false,
                'erro'        => 'Senha incorreta para este Codinome.',
                'autenticado' => false
            ], JSON_UNESCAPED_UNICODE);
            return;
        }

        // Atualiza timestamp de último login
        $stmtUp = $pdo->prepare('UPDATE players SET last_played = CURRENT_TIMESTAMP WHERE id = :id');
        $stmtUp->bindValue(':id', $player['id'], PDO::PARAM_INT);
        $stmtUp->execute();

        echo json_encode([
            'sucesso'     => true,
            'autenticado' => true,
            'codename'    => $codename,
            'mensagem'    => 'Identidade da Vanguarda confirmada com sucesso!'
        ], JSON_UNESCAPED_UNICODE);
        return;
    }

    if ($action === 'proteger') {
        // Registra proteção de um codinome livre
        $stmtCheck = $pdo->prepare('SELECT id FROM players WHERE codename = :c LIMIT 1');
        $stmtCheck->bindValue(':c', $codename, PDO::PARAM_STR);
        $stmtCheck->execute();
        if ($stmtCheck->fetch()) {
            http_response_code(409);
            echo json_encode(['sucesso' => false, 'erro' => 'Este codinome já possui proteção ativa.'], JSON_UNESCAPED_UNICODE);
            return;
        }

        $pinHash = password_hash($pin, PASSWORD_BCRYPT);
        $stmtIns = $pdo->prepare('INSERT INTO players (codename, pin_hash) VALUES (:c, :h)');
        $stmtIns->bindValue(':c', $codename, PDO::PARAM_STR);
        $stmtIns->bindValue(':h', $pinHash, PDO::PARAM_STR);
        $stmtIns->execute();

        echo json_encode([
            'sucesso'   => true,
            'protegido' => true,
            'codename'  => $codename,
            'mensagem'  => 'Codinome protegido com sucesso na Urna da Democracia!'
        ], JSON_UNESCAPED_UNICODE);
        return;
    }

    http_response_code(400);
    echo json_encode(['sucesso' => false, 'erro' => 'Ação desconhecida.'], JSON_UNESCAPED_UNICODE);
}

function validarFormatoCodename(string $name): bool
{
    return (bool)preg_match('/^[a-zA-Z0-9_\-]{3,12}$/', $name);
}
