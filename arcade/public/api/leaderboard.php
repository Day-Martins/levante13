<?php
declare(strict_types=1);
require __DIR__ . '/lib.php';

require_method('GET');
$limit = max(1, min(50, (int) ($_GET['limit'] ?? 20)));

// Melhor pontuação de cada apelido (no SQLite, "stage" vem da mesma linha do MAX)
$q = db()->prepare('SELECT nick, MAX(score) AS score, stage FROM runs
                    WHERE score IS NOT NULL GROUP BY nick ORDER BY score DESC LIMIT ?');
$q->bindValue(1, $limit, PDO::PARAM_INT);
$q->execute();
$rows = array_map(fn($r) => ['nick' => $r['nick'], 'score' => (int) $r['score'], 'stage' => (int) $r['stage']], $q->fetchAll());

header('Cache-Control: public, max-age=5');
header('Content-Type: application/json; charset=utf-8');
echo json_encode($rows, JSON_UNESCAPED_UNICODE);
