<?php
declare(strict_types=1);
require __DIR__ . '/api/lib.php';

/*
 * Página que vai no link compartilhado. As meta tags Open Graph fazem o WhatsApp,
 * Telegram, X e Discord mostrarem o card como prévia.
 */

$id = (string) ($_GET['run'] ?? '');
$run = null;
if (valid_run_id($id)) {
    $q = db()->prepare('SELECT nick, score, stage FROM runs WHERE id = ? AND score IS NOT NULL');
    $q->execute([$id]);
    $run = $q->fetch() ?: null;
}
if (!$run) { header('Location: index.html', true, 302); exit; }

$base  = base_url();
$e     = fn($s) => htmlspecialchars((string) $s, ENT_QUOTES, 'UTF-8');
$score = (int) $run['score'];
$title = "{$run['nick']} fez " . fmt_score($score) . " pts na Fase {$run['stage']}!";
$desc  = 'Você consegue bater esse recorde? Jogue agora no navegador, sem cadastro.';
$img   = "$base/api/card.php?run=$id&v=" . CARD_VERSION;
$play  = 'index.html?' . http_build_query(['alvo' => $score, 'de' => $run['nick']]);
header('Cache-Control: public, max-age=300');
?><!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title><?= $e($title) ?> · <?= $e(GAME_NAME) ?></title>
<meta name="description" content="<?= $e($desc) ?>">
<meta property="og:type" content="website">
<meta property="og:site_name" content="<?= $e(GAME_NAME) ?>">
<meta property="og:title" content="<?= $e($title) ?>">
<meta property="og:description" content="<?= $e($desc) ?>">
<meta property="og:url" content="<?= $e("$base/share.php?run=$id") ?>">
<meta property="og:image" content="<?= $e($img) ?>">
<meta property="og:image:type" content="image/png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="<?= $e($title) ?>">
<meta name="twitter:image" content="<?= $e($img) ?>">
<link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet">
<style>
  body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #07071a; color: #e8f6ff;
         font-family: "Press Start 2P", monospace; text-align: center; padding: 24px; box-sizing: border-box; }
  main { max-width: 640px; display: grid; gap: 24px; justify-items: center; }
  img { width: 100%; border: 3px solid #5ef2ff; }
  h1 { font-size: 14px; line-height: 1.8; margin: 0; }
  a.btn { display: inline-block; padding: 18px 22px; background: #5ef2ff; color: #07071a; text-decoration: none;
          font-size: 13px; box-shadow: 5px 5px 0 #ff4f9a; }
  p { color: #8a93b8; font-size: 10px; line-height: 1.8; margin: 0; }
</style>
</head>
<body>
<main>
  <img src="<?= $e($img) ?>" alt="<?= $e($title) ?>" width="1200" height="630">
  <h1><?= $e($title) ?><br>Você consegue bater esse recorde?</h1>
  <a class="btn" href="<?= $e($play) ?>">JOGAR AGORA E DESAFIAR</a>
  <p>Sem download, sem cadastro. Só um apelido.</p>
</main>
</body>
</html>
