<?php
declare(strict_types=1);
require __DIR__ . '/lib.php';

require_method('POST');
$in = json_in();
$nick = strtoupper(trim((string) ($in['nick'] ?? '')));
if ($err = nick_error($nick)) fail($err, 400);

$pdo = db();
$now = time();
$ip = ip_hash();

// Limite de abuso: no máximo 40 partidas a cada 10 minutos por IP
$q = $pdo->prepare('SELECT COUNT(*) FROM runs WHERE ip_hash = ? AND started_at > ?');
$q->execute([$ip, $now - 600]);
if ((int) $q->fetchColumn() >= 40) fail('Muitas partidas seguidas. Respire e tente em alguns minutos.', 429);

// Minimização de dados: apaga o hash de IP de partidas com mais de 1 dia
$pdo->prepare('UPDATE runs SET ip_hash = NULL WHERE ip_hash IS NOT NULL AND started_at < ?')->execute([$now - 86400]);
// Remove partidas abandonadas (nunca finalizadas) com mais de 1 dia
$pdo->prepare('DELETE FROM runs WHERE finished_at IS NULL AND started_at < ?')->execute([$now - 86400]);

$token = bin2hex(random_bytes(16));
$pdo->prepare('INSERT INTO runs (id, nick, started_at, ip_hash) VALUES (?, ?, ?, ?)')
    ->execute([$token, $nick, $now, $ip]);

json_out(['token' => $token]);
