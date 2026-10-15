<?php
declare(strict_types=1);
require __DIR__ . '/lib.php';

/*
 * Gera o card 1200x630 (formato de prévia do WhatsApp/X/Discord) com PHP GD.
 * O texto usa a fonte embutida do GD ampliada pixel a pixel: visual de fliperama sem depender de .ttf.
 * O PNG é gerado uma vez e fica em cache em data/cards/ (a pontuação de uma partida nunca muda).
 */

const PNG_SIGNATURE = "\x89PNG\r\n\x1a\n";

$id = (string) ($_GET['run'] ?? '');
if (!valid_run_id($id)) { http_response_code(404); exit; }

$cacheDir = DATA_DIR . '/cards';
$file = "$cacheDir/$id.png";

// Regera se o cache não existir ou estiver corrompido (ex.: PNG salvo com aviso do PHP misturado)
if (!is_file($file) || file_get_contents($file, false, null, 0, 8) !== PNG_SIGNATURE) {
    $q = db()->prepare('SELECT nick, score, stage FROM runs WHERE id = ? AND score IS NOT NULL');
    $q->execute([$id]);
    $run = $q->fetch();
    if (!$run) { http_response_code(404); exit; }
    if (!is_dir($cacheDir)) mkdir($cacheDir, 0775, true);
    $png = render_card($run['nick'], (int) $run['score'], (int) $run['stage']);
    if (!str_starts_with($png, PNG_SIGNATURE)) { error_log('[arcade] card inválido para ' . $id); http_response_code(500); exit; }
    file_put_contents($file, $png, LOCK_EX);
}

while (ob_get_level()) ob_end_clean(); // garante que nada saia antes dos bytes do PNG
header('Content-Type: image/png');
header('Cache-Control: public, max-age=31536000, immutable');
header('Content-Length: ' . filesize($file));
readfile($file);

/* ------------------------------------------------------------------ */

function render_card(string $nick, int $score, int $stage): string
{
    $W = 1200; $H = 630;
    $im = imagecreatetruecolor($W, $H);
    $c = fn(int $r, int $g, int $b) => imagecolorallocate($im, $r, $g, $b);

    // Fundo: degradê vertical + estrelas + grade "synthwave"
    for ($y = 0; $y < $H; $y++) {
        $t = $y / $H;
        imageline($im, 0, $y, $W, $y, $c((int) (7 + 30 * $t), (int) (7 + 4 * $t), (int) (26 + 40 * $t)));
    }
    mt_srand(crc32($nick . $score));
    for ($i = 0; $i < 160; $i++) {
        $s = mt_rand(1, 3); $x = mt_rand(0, $W); $y = mt_rand(0, (int) ($H * 0.62));
        $v = mt_rand(120, 255);
        imagefilledrectangle($im, $x, $y, $x + $s, $y + $s, $c($v, $v, $v));
    }
    $grid = $c(255, 79, 154);
    $horizon = (int) ($H * 0.66);
    for ($i = 0; $i < 9; $i++) {
        $y = $horizon + (int) (pow($i / 8, 1.8) * ($H - $horizon));
        imageline($im, 0, $y, $W, $y, $grid);
    }
    for ($i = -12; $i <= 12; $i++) {
        imageline($im, (int) ($W / 2 + $i * 40), $horizon, (int) ($W / 2 + $i * 160), $H, $grid);
    }

    // Moldura neon dupla
    imagesetthickness($im, 6);
    imagerectangle($im, 18, 18, $W - 19, $H - 19, $c(94, 242, 255));
    imagesetthickness($im, 2);
    imagerectangle($im, 32, 32, $W - 33, $H - 33, $c(255, 79, 154));
    imagesetthickness($im, 1);

    // Inimigo da fase 1 como decoração (se existir)
    $levels = load_levels();
    if ($levels) {
        $src = @imagecreatefrompng(LEVELS_DIR . '/' . $levels[0]['id'] . '/enemy.png');
        if ($src) {
            $sw = imagesx($src); $sh = imagesy($src);
            $scale = (int) floor(150 / max($sw, $sh));
            foreach ([[90, 70], [$W - 90 - $sw * $scale, 70]] as [$dx, $dy]) {
                imagecopyresized($im, $src, $dx, $dy, 0, 0, $sw * $scale, $sh * $scale, $sw, $sh);
            }
        }
    }

    $gold = [255, 216, 79]; $cyan = [94, 242, 255]; $white = [232, 246, 255]; $pink = [255, 79, 154];
    pixel_text($im, GAME_NAME, $W / 2, 70, 6, $gold, true);
    pixel_text($im, $nick, $W / 2, 190, 7, $cyan, true);
    pixel_text($im, fmt_score($score) . ' PTS', $W / 2, 310, 8, $white, true);
    pixel_text($im, 'FASE ' . $stage, $W / 2, 440, 4, $pink, true);
    pixel_text($im, 'VOCE CONSEGUE BATER?', $W / 2, 530, 4, $gold, true);

    ob_start();
    imagepng($im, null, 6);
    return (string) ob_get_clean();
}

/** Desenha texto com a fonte 5 do GD ampliada $scale vezes, com sombra. */
function pixel_text($im, string $text, float $x, int $y, int $scale, array $rgb, bool $center = false): void
{
    $font = 5;
    $cw = imagefontwidth($font); $ch = imagefontheight($font);
    $tw = $cw * strlen($text);
    $tmp = imagecreate($tw, $ch);
    imagecolorallocate($tmp, 0, 0, 0);
    $fg = imagecolorallocate($tmp, 255, 255, 255);
    imagestring($tmp, $font, 0, 0, $text, $fg);

    $x0 = (int) ($center ? $x - ($tw * $scale) / 2 : $x);
    $shadow = imagecolorallocate($im, 0, 0, 0);
    $color = imagecolorallocate($im, $rgb[0], $rgb[1], $rgb[2]);
    $off = max(2, intdiv($scale, 2));
    foreach ([[$off, $shadow], [0, $color]] as [$o, $col]) {
        for ($py = 0; $py < $ch; $py++) {
            for ($px = 0; $px < $tw; $px++) {
                if (imagecolorat($tmp, $px, $py) === $fg) {
                    $X = $x0 + $px * $scale + $o; $Y = $y + $py * $scale + $o;
                    imagefilledrectangle($im, $X, $Y, $X + $scale - 1, $Y + $scale - 1, $col);
                }
            }
        }
    }
}
