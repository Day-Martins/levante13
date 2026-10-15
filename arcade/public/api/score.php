<?php
declare(strict_types=1);
require __DIR__ . '/lib.php';

require_method('POST');
$in = json_in();
$token = (string) ($in['token'] ?? '');
$score = $in['score'] ?? null;
$log = $in['log'] ?? null;

if (!valid_run_id($token) || !is_int($score) || !is_array($log)) fail('Dados inválidos', 400);

$pdo = db();
$now = time();

$q = $pdo->prepare('SELECT * FROM runs WHERE id = ?');
$q->execute([$token]);
$run = $q->fetch();
if (!$run) fail('Partida não encontrada', 404);
if ($run['finished_at'] !== null) fail('Partida já registrada', 409);
if ($now - (int) $run['started_at'] > 3 * 3600) fail('Partida expirada', 410);

// 1) A pontuação enviada precisa ser exatamente a recalculada a partir do log
$expected = expected_score($log, load_levels());
$valid = $expected !== null && $expected === $score;

// 2) Tempo mínimo plausível: ~0,25 s por abate + 3 s por fase
if ($valid) {
    $kills = array_sum(array_map(fn($e) => (int) $e['k'], $log));
    $minSeconds = (int) floor($kills * 0.25 + count($log) * 3);
    $valid = ($now - (int) $run['started_at']) >= $minSeconds;
}

if (!$valid) {
    // Fecha o token sem pontuação, para não poder ser reutilizado
    $pdo->prepare('UPDATE runs SET finished_at = ?, score = NULL WHERE id = ?')->execute([$now, $token]);
    fail('Pontuação inválida', 422);
}

$stage = count($log);
$upd = $pdo->prepare('UPDATE runs SET finished_at = ?, score = ?, stage = ? WHERE id = ? AND finished_at IS NULL');
$upd->execute([$now, $score, $stage, $token]);
if ($upd->rowCount() !== 1) fail('Partida já registrada', 409);

// Posição considerando o melhor resultado de cada apelido
$r = $pdo->prepare('SELECT COUNT(*) FROM (
        SELECT nick, MAX(score) AS best FROM runs WHERE score IS NOT NULL AND nick <> ? GROUP BY nick
    ) WHERE best > ?');
$r->bindValue(1, $run['nick']);
$r->bindValue(2, $score, PDO::PARAM_INT); // PARAM_INT: senão o SQLite compara número com texto
$r->execute();
$rank = (int) $r->fetchColumn() + 1;

$base = base_url();
json_out([
    'ok'       => true,
    'rank'     => $rank,
    'score'    => $score,
    'stage'    => $stage,
    'shareUrl' => "$base/share.php?run=$token",
    'cardUrl'  => "$base/api/card.php?run=$token&v=" . CARD_VERSION,
]);
