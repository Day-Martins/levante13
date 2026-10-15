<?php
declare(strict_types=1);

/**
 * Levante 13: A Virada
 * Endpoint: Placar Global do Levante (Leaderboard)
 * Rotas:
 * - GET  /api/leaderboard.php : Retorna o ranking das maiores pontuações.
 * - POST /api/leaderboard.php : Registra uma nova pontuação e gera o card comemorativo.
 * 
 * Diretrizes:
 * - Sanitização contra XSS e SQL Injection via Prepared Statements.
 * - Rate limiting ético com minimização de dados (LGPD).
 * - Geração de share_token único para link viral.
 */

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/fases.php';
require_once __DIR__ . '/generate_card.php';

$metodo = $_SERVER['REQUEST_METHOD'] ?? 'GET';

try {
    $pdo = getDbConnection();

    match ($metodo) {
        'GET'  => processarConsultaLeaderboard($pdo),
        'POST' => processarSubmissaoScore($pdo),
        default => responderErroMetodoNaoPermitido(),
    };
} catch (Throwable $e) {
    error_log('Erro no endpoint de Leaderboard: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'sucesso' => false,
        'erro'    => 'Erro interno ao processar a requisição do placar.'
    ], JSON_UNESCAPED_UNICODE);
}

/**
 * Processa a consulta ao ranking das maiores pontuações (GET).
 */
function processarConsultaLeaderboard(PDO $pdo): void
{
    // Limite parametrizável entre 1 e 50 (padrão: 10)
    $limite = min(max((int)($_GET['limit'] ?? 10), 1), 50);

    $sql = <<<SQL
    SELECT 
        player_name,
        score,
        level_reached,
        share_token,
        created_at
    FROM leaderboard
    ORDER BY score DESC, created_at ASC
    LIMIT :limite
    SQL;

    $stmt = $pdo->prepare($sql);
    $stmt->bindValue(':limite', $limite, PDO::PARAM_INT);
    $stmt->execute();

    $registros = $stmt->fetchAll();

    // Adiciona a posição relativa de classificação (rank 1, 2, 3...)
    $ranking = [];
    $posicao = 1;

    foreach ($registros as $item) {
        $ranking[] = [
            'posicao'       => $posicao++,
            'piloto'        => htmlspecialchars((string)$item['player_name'], ENT_QUOTES, 'UTF-8'),
            'pontos'        => (int)$item['score'],
            'frente'        => (int)$item['level_reached'],
            'token'         => (string)$item['share_token'],
            'link_share'    => urlBase() . '/share.php?id=' . urlencode((string)$item['share_token']),
            'data_registro' => (string)$item['created_at']
        ];
    }

    echo json_encode([
        'sucesso' => true,
        'total'   => count($ranking),
        'ranking' => $ranking
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
}

/**
 * Processa o registro de uma nova pontuação (POST).
 */
function processarSubmissaoScore(PDO $pdo): void
{
    // Leitura do corpo bruto da requisição
    $rawInput = file_get_contents('php://input');

    if ($rawInput === false || empty(trim($rawInput))) {
        http_response_code(400);
        echo json_encode(['sucesso' => false, 'erro' => 'Corpo da requisição vazio.'], JSON_UNESCAPED_UNICODE);
        return;
    }

    // Validação nativa com json_validate do PHP 8.4
    if (!json_validate($rawInput)) {
        http_response_code(400);
        echo json_encode(['sucesso' => false, 'erro' => 'JSON inválido fornecido.'], JSON_UNESCAPED_UNICODE);
        return;
    }

    $dados = json_decode($rawInput, true);

    $playerName   = trim((string)($dados['player_name'] ?? ''));
    $score        = $dados['score'] ?? null;
    $tokenPartida = (string)($dados['token'] ?? '');
    $registro     = $dados['registro'] ?? null;

    // 1. Validação estrita do codinome (Anti-XSS e Anti-Abuse)
    // Apenas caracteres alfanuméricos, traço e sublinhado (3 a 12 caracteres)
    if (!preg_match('/^[a-zA-Z0-9_\-]{3,12}$/', $playerName)) {
        http_response_code(422);
        echo json_encode([
            'sucesso' => false,
            'erro'    => 'Codinome inválido. Utilize entre 3 e 12 caracteres (apenas letras, números e traços).'
        ], JSON_UNESCAPED_UNICODE);
        return;
    }

    // 2. Controle de taxa (Rate Limit) em conformidade com a LGPD (antes de consumir o token da partida)
    if (verificarRateLimitExcedido($pdo)) {
        http_response_code(429);
        echo json_encode([
            'sucesso' => false,
            'erro'    => 'Muitas tentativas em curto período. Aguarde alguns segundos para registrar novamente.'
        ], JSON_UNESCAPED_UNICODE);
        return;
    }

    // 3. A partida precisa ter sido aberta por api/start.php e ainda não registrada
    if (!preg_match('/^[a-f0-9]{32}$/', $tokenPartida) || !is_int($score) || !is_array($registro)) {
        http_response_code(400);
        echo json_encode(['sucesso' => false, 'erro' => 'Dados da partida ausentes ou inválidos.'], JSON_UNESCAPED_UNICODE);
        return;
    }

    $stmt = $pdo->prepare('SELECT iniciada_em, finalizada_em FROM partidas WHERE token = :t');
    $stmt->execute([':t' => $tokenPartida]);
    $partida = $stmt->fetch();
    $agora = time();

    if (!$partida) {
        http_response_code(404);
        echo json_encode(['sucesso' => false, 'erro' => 'Partida não encontrada ou expirada. Jogue novamente para registrar.'], JSON_UNESCAPED_UNICODE);
        return;
    }
    if ($partida['finalizada_em'] !== null) {
        http_response_code(409);
        echo json_encode(['sucesso' => false, 'erro' => 'Este recorde já foi registrado.'], JSON_UNESCAPED_UNICODE);
        return;
    }

    // 4. Validação da pontuação: o servidor recalcula a partir dos abates e das configs das fases
    $resultado = recalcularPontuacao($registro, carregarFases());
    $valido = $resultado !== null && $resultado['pontos'] === $score;

    // Tempo mínimo plausível: 8 segundos por fase concluída
    if ($valido && ($agora - (int)$partida['iniciada_em']) < $resultado['completas'] * 8) {
        $valido = false;
    }

    // Fecha o token mesmo quando inválido, para não ser reaproveitado
    $fechar = $pdo->prepare('UPDATE partidas SET finalizada_em = :agora WHERE token = :t AND finalizada_em IS NULL');
    $fechar->execute([':agora' => $agora, ':t' => $tokenPartida]);
    if ($fechar->rowCount() !== 1) {
        http_response_code(409);
        echo json_encode(['sucesso' => false, 'erro' => 'Este recorde já foi registrado.'], JSON_UNESCAPED_UNICODE);
        return;
    }

    if (!$valido) {
        error_log('Pontuação recusada (registro inconsistente) para a partida ' . $tokenPartida);
        http_response_code(422);
        echo json_encode([
            'sucesso' => false,
            'erro'    => 'Pontuação recusada: os dados da partida não conferem.'
        ], JSON_UNESCAPED_UNICODE);
        return;
    }

    $levelReached = count($registro);

    // 5. Geração do token de compartilhamento (10 caracteres hex)
    $shareToken = bin2hex(random_bytes(5));

    // 6. Inserção segura via Prepared Statements
    $sqlInsert = <<<SQL
    INSERT INTO leaderboard (player_name, score, level_reached, share_token)
    VALUES (:player_name, :score, :level_reached, :share_token);
    SQL;

    $stmt = $pdo->prepare($sqlInsert);
    $stmt->bindValue(':player_name', $playerName, PDO::PARAM_STR);
    $stmt->bindValue(':score', $score, PDO::PARAM_INT);
    $stmt->bindValue(':level_reached', $levelReached, PDO::PARAM_INT);
    $stmt->bindValue(':share_token', $shareToken, PDO::PARAM_STR);
    $stmt->execute();

    $idGerado = (int)$pdo->lastInsertId();

    // 7. Geração do card comemorativo em PHP GD para redes sociais
    $cardGerado = gerarCardResistencia($playerName, $score, $levelReached, $shareToken);

    $linkShare = urlBase() . '/share.php?id=' . $shareToken;
    $urlCard   = urlBase() . '/cards/card_' . $shareToken . '.png';

    http_response_code(201);
    echo json_encode([
        'sucesso'     => true,
        'mensagem'    => 'Recorde registrado com sucesso no Comando do Levante 13!',
        'id'          => $idGerado,
        'token'       => $shareToken,
        'link_share'  => $linkShare,
        'card_imagem' => $cardGerado ? $urlCard : null,
        'whatsapp_url' => 'https://api.whatsapp.com/send?text=' . urlencode(
            "🚀 Pilotei a Vanguarda 13 e garanti " . number_format($score, 0, ',', '.') . 
            " pts na Frente {$levelReached}! Você consegue virar esse jogo? " . $linkShare
        )
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
}

/**
 * Verifica se a origem ultrapassou o limite de 1 submissão a cada 15 segundos.
 * Armazena apenas o hash seguro do IP, sem manter dados pessoais persistentes (LGPD).
 */
function verificarRateLimitExcedido(PDO $pdo): bool
{
    // Hash com sal secreto diário (api/config.php): o sal não fica no código nem no Git
    $ipHash = hashIp();
    $agora = time();
    $janelaSegundos = 15;

    // Busca última tentativa
    $stmt = $pdo->prepare('SELECT last_submission FROM rate_limits WHERE ip_hash = :hash');
    $stmt->bindValue(':hash', $ipHash, PDO::PARAM_STR);
    $stmt->execute();
    $registro = $stmt->fetch();

    if ($registro && isset($registro['last_submission'])) {
        $tempoDecorrido = $agora - (int)$registro['last_submission'];
        if ($tempoDecorrido < $janelaSegundos) {
            return true; // Limite excedido
        }
    }

    // Atualiza ou insere o registro do hash
    $stmtUpsert = $pdo->prepare(<<<SQL
    INSERT INTO rate_limits (ip_hash, last_submission)
    VALUES (:hash, :agora)
    ON CONFLICT(ip_hash) DO UPDATE SET last_submission = :agora;
    SQL);

    $stmtUpsert->bindValue(':hash', $ipHash, PDO::PARAM_STR);
    $stmtUpsert->bindValue(':agora', $agora, PDO::PARAM_INT);
    $stmtUpsert->execute();

    return false;
}

/**
 * Responde com erro quando o método HTTP for incompatível.
 */
function responderErroMetodoNaoPermitido(): never
{
    http_response_code(405);
    echo json_encode([
        'sucesso' => false,
        'erro'    => 'Método não permitido. Utilize GET para consultar ou POST para enviar pontuação.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}
