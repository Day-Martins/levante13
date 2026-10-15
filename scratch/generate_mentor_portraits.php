<?php
// Gerador refinado de pixel art para os retratos holográficos dos mentores
$baseDir = dirname(__DIR__);
$fonte = $baseDir . '/assets/fonts/vcr_osd_mono.ttf';

$mentores = [
    [
        'id' => 'ana',
        'ref' => $baseDir . '/RefImg/Ana.png',
        'level' => 1,
        'nome' => 'ANA ELISA',
        'crop' => ['x' => 15, 'y' => 5, 'w' => 170, 'h' => 155],
        'corBorda' => [56, 189, 248], // ciano neon
        'corNome'  => [255, 255, 255],
        'paleta'   => 32,
        'gamma'    => 1.05
    ],
    [
        'id' => 'jones',
        'ref' => $baseDir . '/RefImg/Jones.png',
        'level' => 2,
        'nome' => 'JONES',
        'crop' => ['x' => 100, 'y' => 100, 'w' => 600, 'h' => 600],
        'corBorda' => [56, 189, 248],
        'corNome'  => [255, 255, 255],
        'paleta'   => 32,
        'gamma'    => 1.0
    ],
    [
        'id' => 'sonia',
        'ref' => $baseDir . '/RefImg/Sonia.png',
        'level' => 3,
        'nome' => 'SÔNIA',
        'crop' => ['x' => 15, 'y' => 0, 'w' => 460, 'h' => 460],
        'corBorda' => [56, 189, 248], // ciano neon
        'corNome'  => [255, 255, 255],
        'paleta'   => 48,
        'gamma'    => 1.0
    ],
    [
        'id' => 'henrique',
        'ref' => $baseDir . '/RefImg/Henrique.png',
        'level' => 5,
        'nome' => 'H.VIEIRA',
        'crop' => ['x' => 20, 'y' => 160, 'w' => 580, 'h' => 580],
        'corBorda' => [56, 189, 248],
        'corNome'  => [255, 255, 255],
        'paleta'   => 32,
        'gamma'    => 1.0
    ],
    [
        'id' => 'lula',
        'ref' => $baseDir . '/RefImg/Lula.png',
        'level' => 6,
        'nome' => 'LULA',
        'crop' => ['x' => 245, 'y' => 45, 'w' => 230, 'h' => 230],
        'corBorda' => [250, 204, 21], // dourado oficial do comandante supremo
        'corNome'  => [250, 204, 21],
        'paleta'   => 32,
        'gamma'    => 1.1
    ]
];

foreach ($mentores as $m) {
    echo "Gerando retrato pixel perfect de " . $m['nome'] . "...\n";
    $orig = imagecreatefrompng($m['ref']);
    if (!$orig) continue;

    $cw = $m['crop']['w'];
    $ch = $m['crop']['h'];
    $cropped = imagecreatetruecolor($cw, $ch);
    imagecopy($cropped, $orig, 0, 0, $m['crop']['x'], $m['crop']['y'], $cw, $ch);

    // Ajuste de nitidez / contraste
    imagefilter($cropped, IMG_FILTER_CONTRAST, -8);

    // Redução para grade pixel art retrô (50x50 pixels)
    $pixelGrid = 50;
    $small = imagecreatetruecolor($pixelGrid, $pixelGrid);
    imagecopyresampled($small, $cropped, 0, 0, 0, 0, $pixelGrid, $pixelGrid, $cw, $ch);

    // Posterização / paleta retrô
    imagetruecolortopalette($small, true, $m['paleta']);

    // Canvas do avatar 128x128
    $final = imagecreatetruecolor(128, 128);
    imagealphablending($final, true);

    $bgCor = imagecolorallocate($final, 6, 10, 22);
    imagefilledrectangle($final, 0, 0, 127, 127, $bgCor);

    // Scanlines de fundo
    $scanFundo = imagecolorallocate($final, 14, 24, 48);
    for ($y = 0; $y < 128; $y += 2) {
        imageline($final, 0, $y, 127, $y, $scanFundo);
    }

    // Desenha os pixels como blocos nítidos 2x2 centralizados
    $offsetX = 14;
    $offsetY = 10;
    for ($py = 0; $py < $pixelGrid; $py++) {
        for ($px = 0; $px < $pixelGrid; $px++) {
            $colorIndex = imagecolorat($small, $px, $py);
            $rgb = imagecolorsforindex($small, $colorIndex);

            // Ajuste sutil de tom holográfico
            $r = (int)($rgb['red'] * 0.96);
            $g = (int)($rgb['green'] * 1.0);
            $b = (int)min(255, $rgb['blue'] * 1.08 + 8);

            $c = imagecolorallocate($final, $r, $g, $b);

            $tx = $offsetX + $px * 2;
            $ty = $offsetY + $py * 2;
            imagefilledrectangle($final, $tx, $ty, $tx + 1, $ty + 1, $c);
        }
    }

    // Scanlines cibernéticas sobre o personagem
    $scanChar = imagecolorallocatealpha($final, 0, 0, 0, 95);
    for ($y = $offsetY; $y < $offsetY + 100; $y += 3) {
        imageline($final, $offsetX, $y, $offsetX + 99, $y, $scanChar);
    }

    // Moldura cibernética CRT
    $bordaCor = imagecolorallocate($final, $m['corBorda'][0], $m['corBorda'][1], $m['corBorda'][2]);
    $bordaEscura = imagecolorallocate($final, 12, 32, 64);

    imagesetthickness($final, 2);
    imagerectangle($final, 3, 3, 124, 124, $bordaCor);

    // Cantos angulados de HUD militar
    imagefilledrectangle($final, 1, 1, 6, 6, $bordaCor);
    imagefilledrectangle($final, 121, 1, 126, 6, $bordaCor);
    imagefilledrectangle($final, 1, 121, 6, 126, $bordaCor);
    imagefilledrectangle($final, 121, 121, 126, 126, $bordaCor);

    // Moldura interna do rosto
    imagesetthickness($final, 1);
    imagerectangle($final, $offsetX - 1, $offsetY - 1, $offsetX + 100, $offsetY + 100, $bordaEscura);

    // Tarja de identificação com o nome
    $faixaCor = imagecolorallocate($final, 8, 14, 28);
    imagefilledrectangle($final, 6, 112, 121, 123, $faixaCor);
    imagerectangle($final, 6, 112, 121, 123, $bordaEscura);

    $nomeCor = imagecolorallocate($final, $m['corNome'][0], $m['corNome'][1], $m['corNome'][2]);
    $sombraCor = imagecolorallocate($final, 0, 0, 0);

    if (file_exists($fonte)) {
        $bbox = imagettfbbox(9, 0, $fonte, $m['nome']);
        $textWidth = abs($bbox[2] - $bbox[0]);
        $textX = (int)((128 - $textWidth) / 2);

        imagettftext($final, 9, 0, $textX + 1, 122, $sombraCor, $fonte, $m['nome']);
        imagettftext($final, 9, 0, $textX, 121, $nomeCor, $fonte, $m['nome']);
    }

    $dest = $baseDir . "/levels/level_{$m['level']}/mentor.png";
    imagepng($final, $dest, 9);
    echo "Sucesso: $dest\n";
}
echo "Geração completa!\n";
