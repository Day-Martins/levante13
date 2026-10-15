<?php
declare(strict_types=1);

/**
 * Gerador de Assets Pixel-Art para os Chefes do Levante 13
 * Cria sprites PNG retro de alta fidelidade para todos os 6 chefes,
 * inspirados na estética autoritária/fascista criticada pelo jogo.
 */

$baseDir = dirname(__DIR__);

function criarCanvas(int $w, int $h) {
    $im = imagecreatetruecolor($w, $h);
    imagealphablending($im, false);
    imagesavealpha($im, true);
    $transp = imagecolorallocatealpha($im, 0, 0, 0, 127);
    imagefilledrectangle($im, 0, 0, $w - 1, $h - 1, $transp);
    imagealphablending($im, true);
    return $im;
}

function hexCol($im, string $hex, int $alpha = 0) {
    $hex = ltrim($hex, '#');
    if (strlen($hex) === 3) {
        $r = hexdec(str_repeat(substr($hex, 0, 1), 2));
        $g = hexdec(str_repeat(substr($hex, 1, 1), 2));
        $b = hexdec(str_repeat(substr($hex, 2, 1), 2));
    } else {
        $r = hexdec(substr($hex, 0, 2));
        $g = hexdec(substr($hex, 2, 2));
        $b = hexdec(substr($hex, 4, 2));
    }
    if ($alpha > 0) {
        return imagecolorallocatealpha($im, $r, $g, $b, $alpha);
    }
    return imagecolorallocate($im, $r, $g, $b);
}

function pSym($im, int $cx, int $y, int $dx, $col) {
    imagesetpixel($im, $cx + $dx, $y, $col);
    imagesetpixel($im, $cx - $dx, $y, $col);
}

function rectSym($im, int $cx, int $y, int $w, int $h, $col) {
    // Desenha simetricamente em torno do centro cx
    imagefilledrectangle($im, $cx - $w, $y, $cx + $w, $y + $h - 1, $col);
}

function wingRectSym($im, int $cx, int $xOffset, int $y, int $w, int $h, $col) {
    // Desenha nas duas asas (esquerda e direita)
    imagefilledrectangle($im, $cx + $xOffset, $y, $cx + $xOffset + $w - 1, $y + $h - 1, $col);
    imagefilledrectangle($im, $cx - $xOffset - $w + 1, $y, $cx - $xOffset, $y + $h - 1, $col);
}

// =========================================================================
// CHEFE 1: O Super-Robô da Mentira (Gabinete do Ódio) - 72x48
// =========================================================================
function gerarChefe1(string $outputPath) {
    $w = 72; $h = 48;
    $im = criarCanvas($w, $h);
    $cx = (int)($w / 2);

    $cDark   = hexCol($im, '#090d16');
    $cSteel1 = hexCol($im, '#1e293b');
    $cSteel2 = hexCol($im, '#334155');
    $cSteel3 = hexCol($im, '#475569');
    $cRed1   = hexCol($im, '#ef4444');
    $cRed2   = hexCol($im, '#b91c1c');
    $cRedDark= hexCol($im, '#450a0a');
    $cCyan   = hexCol($im, '#38bdf8');
    $cCyanLo = hexCol($im, '#0284c7');
    $cGold   = hexCol($im, '#facc15');
    $cWhite  = hexCol($im, '#ffffff');

    // Antenas superiores de transmissão de fake news
    wingRectSym($im, $cx, 16, 2, 2, 8, $cSteel3);
    wingRectSym($im, $cx, 15, 0, 4, 2, $cRed1); // Ponta da antena piscando
    wingRectSym($im, $cx, 26, 6, 2, 7, $cSteel2);
    wingRectSym($im, $cx, 25, 4, 4, 2, $cCyan);

    // Asas angulares de águia cibernética (camadas de armadura)
    for ($i = 0; $i < 14; $i++) {
        $span = 14 + $i * 1.5;
        $y = 10 + $i;
        rectSym($im, $cx, $y, (int)$span, 1, $cSteel1);
    }
    // Placas de armadura intermediárias
    for ($i = 0; $i < 10; $i++) {
        $span = 12 + $i * 1.3;
        $y = 12 + $i;
        rectSym($im, $cx, $y, (int)$span, 1, $cSteel2);
    }
    // Vínculos e aletas angulares externas
    wingRectSym($im, $cx, 22, 14, 12, 14, $cSteel1);
    wingRectSym($im, $cx, 24, 16, 8, 10, $cSteel3);
    wingRectSym($im, $cx, 28, 18, 4, 6, $cRed2);
    // Pontas de asa estilizadas (garras autoritárias)
    wingRectSym($im, $cx, 32, 22, 3, 10, $cSteel2);
    wingRectSym($im, $cx, 33, 26, 2, 8, $cDark);

    // Corpo central blindado (torre panóptica)
    rectSym($im, $cx, 8, 10, 32, $cDark);
    rectSym($im, $cx, 10, 8, 28, $cSteel1);
    rectSym($im, $cx, 12, 6, 24, $cSteel2);

    // Brasão de águia militarizada no topo
    imagefilledrectangle($im, $cx - 4, 10, $cx + 4, 13, $cGold);
    imagefilledrectangle($im, $cx - 2, 14, $cx + 2, 17, $cGold);
    imagesetpixel($im, $cx, 18, $cGold);

    // O Grande Olho Panóptico da Desinformação (Centro)
    // Bezel
    rectSym($im, $cx, 22, 9, 11, $cDark);
    rectSym($im, $cx, 23, 7, 9, $cRedDark);
    rectSym($im, $cx, 24, 5, 7, $cRed2);
    // Pupila laser vermelha e scanner de fake news
    rectSym($im, $cx, 26, 3, 3, $cRed1);
    imagesetpixel($im, $cx, 26, $cWhite);
    imagesetpixel($im, $cx + 1, 26, $cWhite);

    // Linhas de dados holográficos (feixe de bots cibernéticos)
    for ($lx = -8; $lx <= 8; $lx += 2) {
        imagesetpixel($im, $cx + $lx, 35, $cCyan);
        imagesetpixel($im, $cx + $lx, 37, $cCyanLo);
    }

    // Canhões inferiores frontais de disparo em massa
    wingRectSym($im, $cx, 6, 38, 5, 8, $cSteel1);
    wingRectSym($im, $cx, 7, 40, 3, 7, $cSteel3);
    wingRectSym($im, $cx, 7, 46, 3, 2, $cRed1); // Muzzle emissor

    // Detalhes e rebites
    pSym($im, $cx, 12, 8, $cSteel3);
    pSym($im, $cx, 16, 8, $cSteel3);
    pSym($im, $cx, 20, 8, $cSteel3);
    pSym($im, $cx, 38, 12, $cGold);

    imagepng($im, $outputPath);
}

// =========================================================================
// CHEFE 2: O Algoritmo da Precarização (Setor Fabril) - 72x48
// =========================================================================
function gerarChefe2(string $outputPath) {
    $w = 72; $h = 48;
    $im = criarCanvas($w, $h);
    $cx = (int)($w / 2);

    $cIronDark = hexCol($im, '#0f172a');
    $cIron1    = hexCol($im, '#1e293b');
    $cIron2    = hexCol($im, '#334155');
    $cIron3    = hexCol($im, '#475569');
    $cBrass1   = hexCol($im, '#ca8a04');
    $cBrass2   = hexCol($im, '#eab308');
    $cFire1    = hexCol($im, '#ea580c');
    $cFire2    = hexCol($im, '#f97316');
    $cYellow   = hexCol($im, '#facc15');
    $cRed      = hexCol($im, '#dc2626');
    $cSmoke    = hexCol($im, '#64748b');

    // Chaminés industriais gêmeas no topo
    wingRectSym($im, $cx, 12, 0, 5, 12, $cIron2);
    wingRectSym($im, $cx, 11, 0, 7, 3, $cIron3);
    // Fumaça e fuligem saindo das chaminés
    wingRectSym($im, $cx, 13, 0, 3, 1, $cFire1);
    wingRectSym($im, $cx, 14, 0, 1, 1, $cYellow);

    // Grandes Engrenagens Vorazes de Moer Vidas (Flancos)
    $gearRadius = 11;
    $gearCenterY = 22;
    foreach ([24, -24] as $gOffset) {
        $gx = $cx + $gOffset;
        // Dentes da engrenagem
        for ($angle = 0; $angle < 360; $angle += 30) {
            $rad = deg2rad($angle);
            $tx = (int)round($gx + cos($rad) * ($gearRadius + 2));
            $ty = (int)round($gearCenterY + sin($rad) * ($gearRadius + 2));
            imagefilledrectangle($im, $tx - 1, $ty - 1, $tx + 1, $ty + 1, $cBrass2);
        }
        // Corpo da engrenagem
        imagefilledellipse($im, $gx, $gearCenterY, $gearRadius * 2, $gearRadius * 2, $cBrass1);
        imagefilledellipse($im, $gx, $gearCenterY, ($gearRadius - 3) * 2, ($gearRadius - 3) * 2, $cIron1);
        // Eixo central com rebite de aço
        imagefilledellipse($im, $gx, $gearCenterY, 6, 6, $cIron3);
        imagefilledellipse($im, $gx, $gearCenterY, 2, 2, $cFire2);
    }

    // Casco blindado central da fábrica
    rectSym($im, $cx, 10, 15, 26, $cIronDark);
    rectSym($im, $cx, 12, 13, 22, $cIron1);
    rectSym($im, $cx, 14, 11, 18, $cIron2);

    // Listras de perigo industrial amarelo/preto na barra frontal
    for ($i = -12; $i <= 12; $i += 4) {
        imagefilledrectangle($im, $cx + $i, 32, $cx + $i + 1, 35, $cYellow);
        imagefilledrectangle($im, $cx + $i + 2, 32, $cx + $i + 3, 35, $cIronDark);
    }

    // Relógio de Ponto / Ticker de Exploração Digital
    rectSym($im, $cx, 18, 8, 8, $cIronDark);
    rectSym($im, $cx, 19, 7, 6, hexCol($im, '#1a0505'));
    // Dígitos vermelhos brilhando "24/7" estilizados
    imagefilledrectangle($im, $cx - 5, 21, $cx - 4, 24, $cRed);
    imagefilledrectangle($im, $cx - 2, 21, $cx - 1, 24, $cRed);
    imagesetpixel($im, $cx, 22, $cRed);
    imagefilledrectangle($im, $cx + 2, 21, $cx + 4, 24, $cRed);

    // Pistões hidráulicos inferiores e garras mecânicas
    wingRectSym($im, $cx, 5, 36, 4, 10, $cIron3);
    wingRectSym($im, $cx, 6, 40, 2, 7, hexCol($im, '#cbd5e1')); // Haste cromada
    wingRectSym($im, $cx, 4, 46, 6, 2, $cFire1); // Canos de solda / descarga

    // Rebites da caldeira
    pSym($im, $cx, 14, 9, hexCol($im, '#94a3b8'));
    pSym($im, $cx, 18, 9, hexCol($im, '#94a3b8'));
    pSym($im, $cx, 28, 9, hexCol($im, '#94a3b8'));

    imagepng($im, $outputPath);
}

// =========================================================================
// CHEFE 3: O Correntão da Devastação (Reserva Planetária) - 76x50
// =========================================================================
function gerarChefe3(string $outputPath) {
    $w = 76; $h = 50;
    $im = criarCanvas($w, $h);
    $cx = (int)($w / 2);

    $cDarkMilit = hexCol($im, '#142311');
    $cGreen1    = hexCol($im, '#283618');
    $cGreen2    = hexCol($im, '#384c24');
    $cGreen3    = hexCol($im, '#606c38');
    $cRust1     = hexCol($im, '#451a03');
    $cRust2     = hexCol($im, '#78350f');
    $cSteelDark = hexCol($im, '#292524');
    $cChrome    = hexCol($im, '#e2e8f0');
    $cSilver    = hexCol($im, '#94a3b8');
    $cFire      = hexCol($im, '#f97316');
    $cRed       = hexCol($im, '#ef4444');

    // Escapamentos a diesel angulados no topo
    wingRectSym($im, $cx, 14, 0, 4, 10, $cSteelDark);
    wingRectSym($im, $cx, 15, 0, 2, 3, $cRust2);
    wingRectSym($im, $cx, 15, 0, 2, 1, $cFire);

    // Disco de Motosserra Gigante (Buzzsaw Flanqueador - esquerda e direita)
    $sawRadius = 12;
    $sawCenterY = 24;
    foreach ([26, -26] as $sOffset) {
        $sx = $cx + $sOffset;
        // Dentes pontiagudos da lâmina
        for ($angle = 0; $angle < 360; $angle += 22.5) {
            $rad = deg2rad($angle);
            $tx = (int)round($sx + cos($rad) * ($sawRadius + 2));
            $ty = (int)round($sawCenterY + sin($rad) * ($sawRadius + 2));
            imagefilledrectangle($im, $tx - 1, $ty - 1, $tx + 1, $ty + 1, $cChrome);
        }
        // Disco de aço cromado
        imagefilledellipse($im, $sx, $sawCenterY, $sawRadius * 2, $sawRadius * 2, $cSilver);
        imagefilledellipse($im, $sx, $sawCenterY, ($sawRadius - 3) * 2, ($sawRadius - 3) * 2, $cSteelDark);
        // Centro manchado de óleo e fuligem
        imagefilledellipse($im, $sx, $sawCenterY, 6, 6, $cRust1);
        imagesetpixel($im, $sx, $sawCenterY, $cChrome);
    }

    // Chassi blindado de trator de guerra
    rectSym($im, $cx, 8, 16, 28, $cDarkMilit);
    rectSym($im, $cx, 10, 14, 24, $cGreen1);
    rectSym($im, $cx, 12, 12, 20, $cGreen2);
    rectSym($im, $cx, 14, 10, 16, $cGreen3);

    // Grade frontal agressiva / Cowcatcher com dentes de aço
    for ($i = 0; $i < 6; $i++) {
        $wDente = 16 - $i * 1.5;
        rectSym($im, $cx, 32 + $i * 2, (int)$wDente, 2, $cSteelDark);
    }
    // Dentes perfurantes da grade
    for ($gx = -14; $gx <= 14; $gx += 4) {
        imagefilledrectangle($im, $cx + $gx, 42, $cx + $gx + 1, 48, $cChrome);
    }

    // Cabine do grileiro / visor de mira térmica
    rectSym($im, $cx, 18, 8, 6, $cSteelDark);
    rectSym($im, $cx, 19, 7, 4, hexCol($im, '#1c1917'));
    rectSym($im, $cx, 20, 6, 2, $cRed); // Visor vermelho estreito predador

    // Faróis de busca de destruição florestal
    pSym($im, $cx, 28, 11, $cFire);
    pSym($im, $cx, 29, 11, hexCol($im, '#fef08a'));

    imagepng($im, $outputPath);
}

// =========================================================================
// CHEFE 4: A Quimera do Obscurantismo (Complexo da Vida) - 74x50
// =========================================================================
function gerarChefe4(string $outputPath) {
    $w = 74; $h = 50;
    $im = criarCanvas($w, $h);
    $cx = (int)($w / 2);

    $cBioDark = hexCol($im, '#0f172a');
    $cPurp1   = hexCol($im, '#2e1065');
    $cPurp2   = hexCol($im, '#581c87');
    $cPurp3   = hexCol($im, '#7e22ce');
    $cAcid1   = hexCol($im, '#84cc16');
    $cAcid2   = hexCol($im, '#bef264');
    $cAcid3   = hexCol($im, '#4d7c0f');
    $cGlass   = hexCol($im, '#38bdf8', 40);
    $cWhite   = hexCol($im, '#e2e8f0');
    $cAlert   = hexCol($im, '#facc15');

    // Tanques de Cloroquina e Veneno Tóxico (Flancos)
    foreach ([22, -22] as $tOffset) {
        $tx = $cx + $tOffset;
        // Suporte metálico do tanque
        imagefilledrectangle($im, $tx - 6, 4, $tx + 6, 32, $cBioDark);
        imagefilledrectangle($im, $tx - 5, 5, $tx + 5, 31, $cPurp1);
        // Cilindro de vidro com líquido tóxico verde borbulhante
        imagefilledrectangle($im, $tx - 4, 8, $tx + 4, 28, $cAcid3);
        imagefilledrectangle($im, $tx - 3, 12, $tx + 3, 27, $cAcid1);
        // Bolhas no veneno
        imagesetpixel($im, $tx - 1, 15, $cAcid2);
        imagesetpixel($im, $tx + 2, 20, $cAcid2);
        imagesetpixel($im, $tx - 2, 24, $cAcid2);
        // Brilho do vidro
        imagefilledrectangle($im, $tx - 4, 9, $tx - 3, 26, $cWhite);
    }

    // Estrutura central (Máscara de Médico da Peste / Respirador Militar Obscurantista)
    rectSym($im, $cx, 6, 12, 36, $cBioDark);
    rectSym($im, $cx, 8, 10, 32, $cPurp1);
    rectSym($im, $cx, 10, 8, 28, $cPurp2);

    // Lentes / Óculos escuros do respirador
    wingRectSym($im, $cx, 2, 16, 5, 5, $cBioDark);
    wingRectSym($im, $cx, 3, 17, 3, 3, $cPurp3);
    wingRectSym($im, $cx, 4, 18, 1, 1, $cAcid2); // Reflexo verde no visor

    // Filtro do respirador / Bico de contenção
    rectSym($im, $cx, 26, 6, 10, $cBioDark);
    rectSym($im, $cx, 27, 5, 8, hexCol($im, '#1e293b'));
    // Frestas do filtro de gás
    for ($fy = 29; $fy <= 34; $fy += 2) {
        imagefilledrectangle($im, $cx - 4, $fy, $cx + 4, $fy, $cAcid1);
    }

    // Símbolo de Perigo Biológico / Obscurantismo no topo
    imagefilledrectangle($im, $cx - 2, 10, $cx + 2, 12, $cAlert);
    imagesetpixel($im, $cx, 9, $cAlert);

    // Agulhas Hipodérmicas / Canhões Injetores de Toxina (Base)
    wingRectSym($im, $cx, 4, 38, 2, 10, $cWhite);
    wingRectSym($im, $cx, 10, 38, 2, 8, $cWhite);
    wingRectSym($im, $cx, 4, 46, 2, 3, $cAcid1); // Gota de veneno
    wingRectSym($im, $cx, 10, 44, 2, 3, $cAcid1);

    imagepng($im, $outputPath);
}

// =========================================================================
// CHEFE 5: O Falso Profeta do Ódio (Santuário da Fé) - 76x52
// =========================================================================
function gerarChefe5(string $outputPath) {
    $w = 76; $h = 52;
    $im = criarCanvas($w, $h);
    $cx = (int)($w / 2);

    $cIronDark = hexCol($im, '#09090b');
    $cIron1    = hexCol($im, '#18181b');
    $cIron2    = hexCol($im, '#27272a');
    $cGold1    = hexCol($im, '#78350f');
    $cGold2    = hexCol($im, '#d97706');
    $cGold3    = hexCol($im, '#facc15');
    $cGoldHi   = hexCol($im, '#fef08a');
    $cBlood    = hexCol($im, '#b91c1c');
    $cRedBright= hexCol($im, '#ef4444');
    $cWhite    = hexCol($im, '#ffffff');

    // Auréola Sagrada Armada Radiante (Halo de Crueldade)
    $haloRadius = 14;
    $haloCenterY = 14;
    // Raios espiculados do falso profeta
    for ($angle = 180; $angle <= 360; $angle += 20) {
        $rad = deg2rad($angle);
        $rx = (int)round($cx + cos($rad) * ($haloRadius + 4));
        $ry = (int)round($haloCenterY + sin($rad) * ($haloRadius + 4));
        imagefilledrectangle($im, $rx - 1, $ry - 1, $rx + 1, $ry + 1, $cGoldHi);
    }
    // Arco dourado da auréola
    imagearc($im, $cx, $haloCenterY, $haloRadius * 2, $haloRadius * 2, 180, 360, $cGold3);
    imagearc($im, $cx, $haloCenterY, ($haloRadius - 2) * 2, ($haloRadius - 2) * 2, 180, 360, $cGold2);

    // Pináculos góticos e arcos ogivais nas asas
    wingRectSym($im, $cx, 18, 8, 4, 30, $cIron1);
    wingRectSym($im, $cx, 19, 6, 2, 28, $cGold2);
    wingRectSym($im, $cx, 24, 14, 5, 24, $cIronDark);
    wingRectSym($im, $cx, 25, 16, 3, 20, $cGold3);
    // Estandartes vermelhos de sangue / cruzada autoritária
    wingRectSym($im, $cx, 20, 34, 8, 12, $cBlood);
    wingRectSym($im, $cx, 22, 36, 4, 8, $cRedBright);

    // Casco blindado central da catedral de ferro
    rectSym($im, $cx, 12, 14, 30, $cIronDark);
    rectSym($im, $cx, 14, 12, 26, $cIron2);
    rectSym($im, $cx, 16, 10, 22, $cGold1);

    // A Falsa Máscara Dourada do Ídolo (Face Hipócrita)
    rectSym($im, $cx, 18, 7, 14, $cGold2);
    rectSym($im, $cx, 19, 6, 12, $cGold3);
    rectSym($im, $cx, 20, 4, 10, $cGoldHi);

    // Olhos que choram sangue inquisitorial
    wingRectSym($im, $cx, 2, 22, 2, 2, $cBlood);
    wingRectSym($im, $cx, 2, 24, 1, 4, $cRedBright); // Lágrima de sangue

    // Cruz de Ferro Militarizada no Peito
    imagefilledrectangle($im, $cx - 1, 32, $cx + 1, 42, $cIronDark);
    imagefilledrectangle($im, $cx - 5, 35, $cx + 5, 37, $cIronDark);
    imagefilledrectangle($im, $cx - 1, 35, $cx + 1, 37, $cGold3); // Centro da cruz

    // Canhões de fogo sagrado / plasma fundamentalista
    wingRectSym($im, $cx, 8, 40, 4, 8, $cGold2);
    wingRectSym($im, $cx, 9, 44, 2, 6, $cRedBright);

    imagepng($im, $outputPath);
}

// =========================================================================
// CHEFE 6: A Hidra Golpista (Fortaleza Imperial da Tirania) - 96x64
// 4 Fases de Dano Progressivo + Pedaços Ejetáveis
// =========================================================================

function gerarChefe6Base(int $w, int $h) {
    return criarCanvas($w, $h);
}

// Fase 1: Íntegro, blindagem pesada total, asas de águia imperial e canhões duplos
function gerarChefe6Fase1(string $outputPath) {
    $w = 96; $h = 64;
    $im = gerarChefe6Base($w, $h);
    $cx = (int)($w / 2);

    $cDark    = hexCol($im, '#070a13');
    $cSteel1  = hexCol($im, '#1e293b');
    $cSteel2  = hexCol($im, '#334155');
    $cSteel3  = hexCol($im, '#475569');
    $cSteel4  = hexCol($im, '#64748b');
    $cRedDark = hexCol($im, '#7f1d1d');
    $cRed     = hexCol($im, '#dc2626');
    $cRedHot  = hexCol($im, '#ef4444');
    $cGold    = hexCol($im, '#facc15');
    $cGoldDark= hexCol($im, '#b45309');
    $cWhite   = hexCol($im, '#ffffff');

    // Asas imperiais brutalistas estendidas (Envergadura 96px)
    for ($i = 0; $i < 24; $i++) {
        $span = 18 + $i * 1.2;
        $y = 12 + $i;
        rectSym($im, $cx, $y, (int)$span, 1, $cDark);
    }
    for ($i = 0; $i < 20; $i++) {
        $span = 16 + $i * 1.1;
        $y = 14 + $i;
        rectSym($im, $cx, $y, (int)$span, 1, $cSteel1);
    }
    for ($i = 0; $i < 16; $i++) {
        $span = 14 + $i * 1.0;
        $y = 16 + $i;
        rectSym($im, $cx, $y, (int)$span, 1, $cSteel2);
    }

    // Placas de armadura chanfradas das asas
    wingRectSym($im, $cx, 28, 16, 16, 16, $cSteel1);
    wingRectSym($im, $cx, 30, 18, 12, 12, $cSteel3);
    wingRectSym($im, $cx, 34, 20, 6, 8, $cRedDark);

    // Canhões Flanqueadores de Cerco (Left & Right Cannon Batteries)
    // Esquerda e Direita simétricos na Fase 1
    wingRectSym($im, $cx, 38, 26, 7, 24, $cSteel2);
    wingRectSym($im, $cx, 39, 28, 5, 20, $cSteel4);
    wingRectSym($im, $cx, 40, 48, 3, 8, $cRed); // Bocas dos canhões pesados
    wingRectSym($im, $cx, 40, 54, 3, 2, $cRedHot);

    // Bunker Central da Tirania (Fortaleza de Comando)
    rectSym($im, $cx, 8, 16, 44, $cDark);
    rectSym($im, $cx, 10, 14, 40, $cSteel1);
    rectSym($im, $cx, 12, 12, 36, $cSteel2);

    // Fenda do Visor Blindado do Comando Golpista
    rectSym($im, $cx, 20, 10, 5, $cDark);
    rectSym($im, $cx, 21, 8, 3, $cRedDark);
    rectSym($im, $cx, 22, 6, 2, $cRedHot);
    imagesetpixel($im, $cx, 22, $cWhite);
    imagesetpixel($im, $cx + 1, 22, $cWhite);

    // Brasão Autoritário Imperial (Águia / Fasces dourada no peito)
    imagefilledrectangle($im, $cx - 6, 28, $cx + 6, 31, $cGold);
    imagefilledrectangle($im, $cx - 4, 32, $cx + 4, 35, $cGold);
    imagefilledrectangle($im, $cx - 2, 36, $cx + 2, 39, $cGoldDark);
    imagesetpixel($im, $cx, 40, $cGold);

    // Placas de blindagem do núcleo frontal
    rectSym($im, $cx, 42, 8, 8, $cSteel3);
    rectSym($im, $cx, 44, 6, 4, $cSteel4);
    pSym($im, $cx, 44, 4, $cGold);

    // Bateria de lançadores de mísseis central
    for ($mx = -4; $mx <= 4; $mx += 4) {
        imagefilledrectangle($im, $cx + $mx - 1, 52, $cx + $mx + 1, 56, $cSteel1);
        imagesetpixel($im, $cx + $mx, 55, $cRedHot);
    }

    // Rebites da fuselagem
    pSym($im, $cx, 14, 12, $cSteel4);
    pSym($im, $cx, 18, 12, $cSteel4);
    pSym($im, $cx, 26, 12, $cSteel4);
    pSym($im, $cx, 32, 12, $cSteel4);

    imagepng($im, $outputPath);
}

// Fase 2: Asa esquerda destruída! Canhão esquerdo arrancado, metal retorcido, fumaça e faíscas.
function gerarChefe6Fase2(string $outputPath) {
    $w = 96; $h = 64;
    $im = gerarChefe6Base($w, $h);
    $cx = (int)($w / 2);

    $cDark    = hexCol($im, '#070a13');
    $cSteel1  = hexCol($im, '#1e293b');
    $cSteel2  = hexCol($im, '#334155');
    $cSteel3  = hexCol($im, '#475569');
    $cSteel4  = hexCol($im, '#64748b');
    $cRedDark = hexCol($im, '#7f1d1d');
    $cRed     = hexCol($im, '#dc2626');
    $cRedHot  = hexCol($im, '#ef4444');
    $cGold    = hexCol($im, '#facc15');
    $cGoldDark= hexCol($im, '#b45309');
    $cWhite   = hexCol($im, '#ffffff');
    $cFire    = hexCol($im, '#f97316');
    $cSmoke   = hexCol($im, '#475569', 50);

    // Desenha corpo central
    rectSym($im, $cx, 8, 16, 44, $cDark);
    rectSym($im, $cx, 10, 14, 40, $cSteel1);
    rectSym($im, $cx, 12, 12, 36, $cSteel2);

    // ASA DIREITA ÍNTEGRA (Lado direito de cx)
    for ($i = 0; $i < 24; $i++) {
        $span = 18 + $i * 1.2;
        imagefilledrectangle($im, $cx, 12 + $i, $cx + (int)$span, 12 + $i, $cDark);
    }
    for ($i = 0; $i < 20; $i++) {
        $span = 16 + $i * 1.1;
        imagefilledrectangle($im, $cx, 14 + $i, $cx + (int)$span, 14 + $i, $cSteel1);
    }
    imagefilledrectangle($im, $cx + 28, 16, $cx + 44, 32, $cSteel1);
    imagefilledrectangle($im, $cx + 30, 18, $cx + 42, 30, $cSteel3);
    // Canhão direito intacto
    imagefilledrectangle($im, $cx + 38, 26, $cx + 45, 50, $cSteel2);
    imagefilledrectangle($im, $cx + 39, 28, $cx + 44, 48, $cSteel4);
    imagefilledrectangle($im, $cx + 40, 48, $cx + 43, 56, $cRed);
    imagefilledrectangle($im, $cx + 40, 54, $cx + 43, 56, $cRedHot);

    // ASA ESQUERDA ARRANCADA / DESTRUÍDA!
    // Metal retorcido e quebrado no coto da asa
    imagefilledrectangle($im, $cx - 24, 16, $cx - 16, 32, $cDark);
    imagefilledrectangle($im, $cx - 22, 18, $cx - 16, 28, $cSteel1);
    // Pontas de metal rasgado
    imagesetpixel($im, $cx - 26, 17, $cSteel3);
    imagesetpixel($im, $cx - 27, 21, $cSteel4);
    imagesetpixel($im, $cx - 25, 25, $cSteel3);
    imagesetpixel($im, $cx - 28, 29, $cSteel4);
    // Fiação arrebentada soltando faíscas azuis e amarelas
    imagesetpixel($im, $cx - 25, 20, $cGold);
    imagesetpixel($im, $cx - 27, 22, hexCol($im, '#38bdf8'));
    imagesetpixel($im, $cx - 24, 26, $cFire);
    imagesetpixel($im, $cx - 26, 27, $cWhite);
    // Fumaça escura saindo do rompimento
    imagefilledellipse($im, $cx - 25, 14, 10, 8, $cSmoke);
    imagefilledellipse($im, $cx - 30, 10, 8, 6, $cSmoke);

    // Rachaduras na blindagem do lado esquerdo da fuselagem
    for ($cy = 22; $cy <= 36; $cy += 2) {
        imagesetpixel($im, $cx - 8 - (($cy % 4) === 0 ? 1 : 0), $cy, $cDark);
    }

    // Visor bunker enfurecido
    rectSym($im, $cx, 20, 10, 5, $cDark);
    rectSym($im, $cx, 21, 8, 3, $cRedDark);
    rectSym($im, $cx, 22, 6, 2, $cRedHot);

    // Brasão
    imagefilledrectangle($im, $cx - 6, 28, $cx + 6, 31, $cGold);
    imagefilledrectangle($im, $cx - 4, 32, $cx + 4, 35, $cGold);

    // Núcleo frontal
    rectSym($im, $cx, 42, 8, 8, $cSteel3);
    imagesetpixel($im, $cx - 3, 45, $cFire); // Pequena fissura

    // Lançador central
    for ($mx = -4; $mx <= 4; $mx += 4) {
        imagefilledrectangle($im, $cx + $mx - 1, 52, $cx + $mx + 1, 56, $cSteel1);
        imagesetpixel($im, $cx + $mx, 55, $cRedHot);
    }

    imagepng($im, $outputPath);
}

// Fase 3: Ambas as asas destruídas! Blindagem frontal arrancada, revelando o núcleo de energia superaquecido
function gerarChefe6Fase3(string $outputPath) {
    $w = 96; $h = 64;
    $im = gerarChefe6Base($w, $h);
    $cx = (int)($w / 2);

    $cDark    = hexCol($im, '#070a13');
    $cSteel1  = hexCol($im, '#1e293b');
    $cSteel2  = hexCol($im, '#334155');
    $cSteel3  = hexCol($im, '#475569');
    $cSteel4  = hexCol($im, '#64748b');
    $cRedDark = hexCol($im, '#7f1d1d');
    $cRed     = hexCol($im, '#dc2626');
    $cRedHot  = hexCol($im, '#ef4444');
    $cFire    = hexCol($im, '#f97316');
    $cGold    = hexCol($im, '#facc15');
    $cWhite   = hexCol($im, '#ffffff');
    $cSmoke   = hexCol($im, '#475569', 50);

    // Corpo central reduzido a um bloco de bunker com cotos rompidos
    rectSym($im, $cx, 8, 16, 44, $cDark);
    rectSym($im, $cx, 10, 14, 40, $cSteel1);
    rectSym($im, $cx, 12, 12, 36, $cSteel2);

    // Ambos os lados agora com cotos de metal dilacerado e fumaça
    foreach ([-20, 20] as $side) {
        $sx = $cx + $side;
        imagefilledrectangle($im, $sx - 4, 16, $sx + 4, 30, $cDark);
        imagesetpixel($im, $sx + ($side > 0 ? 5 : -5), 18, $cSteel4);
        imagesetpixel($im, $sx + ($side > 0 ? 6 : -6), 22, $cGold);
        imagesetpixel($im, $sx + ($side > 0 ? 5 : -5), 26, hexCol($im, '#38bdf8'));
        imagefilledellipse($im, $sx, 12, 10, 8, $cSmoke);
    }

    // Visor em alerta crítico
    rectSym($im, $cx, 20, 10, 5, $cDark);
    rectSym($im, $cx, 22, 6, 2, $cRedHot);

    // NÚCLEO EXPOSTO DE ENERGIA GOLPISTA SUPERAQUECIDO!
    // A placa do brasão foi estraçalhada
    rectSym($im, $cx, 32, 10, 16, $cDark);
    imagefilledellipse($im, $cx, 40, 18, 18, $cRedDark);
    imagefilledellipse($im, $cx, 40, 14, 14, $cRed);
    imagefilledellipse($im, $cx, 40, 10, 10, $cFire);
    imagefilledellipse($im, $cx, 40, 6, 6, $cGold);
    imagefilledellipse($im, $cx, 40, 2, 2, $cWhite);

    // Tubulações de refrigeração rompidas expelindo vapor
    imagesetpixel($im, $cx - 8, 38, $cWhite);
    imagesetpixel($im, $cx - 10, 36, $cWhite);
    imagesetpixel($im, $cx + 8, 38, $cWhite);
    imagesetpixel($im, $cx + 10, 36, $cWhite);

    // Canos de descarga inferiores cuspindo chamas
    for ($mx = -4; $mx <= 4; $mx += 4) {
        imagefilledrectangle($im, $cx + $mx - 1, 52, $cx + $mx + 1, 58, $cFire);
        imagesetpixel($im, $cx + $mx, 57, $cWhite);
    }

    imagepng($im, $outputPath);
}

// Fase 4: Modo desespero / Sobrecarga total! Carcaça em chamas, faíscas contínuas, núcleo em fissura
function gerarChefe6Fase4(string $outputPath) {
    $w = 96; $h = 64;
    $im = gerarChefe6Base($w, $h);
    $cx = (int)($w / 2);

    $cDark    = hexCol($im, '#070a13');
    $cSteel1  = hexCol($im, '#1e293b');
    $cSteel2  = hexCol($im, '#334155');
    $cRedDark = hexCol($im, '#7f1d1d');
    $cRed     = hexCol($im, '#dc2626');
    $cRedHot  = hexCol($im, '#ef4444');
    $cFire    = hexCol($im, '#f97316');
    $cGold    = hexCol($im, '#facc15');
    $cWhite   = hexCol($im, '#ffffff');

    // Chassi em chamas e metal em brasa
    rectSym($im, $cx, 8, 14, 40, $cDark);
    rectSym($im, $cx, 10, 12, 36, $cSteel1);
    rectSym($im, $cx, 12, 10, 32, $cRedDark);

    // Chamas subindo de todos os lados
    for ($fx = -14; $fx <= 14; $fx += 4) {
        $flameH = rand(4, 10);
        imagefilledrectangle($im, $cx + $fx, 8 - $flameH, $cx + $fx + 2, 8, $cFire);
        imagesetpixel($im, $cx + $fx + 1, 8 - $flameH, $cGold);
    }

    // Núcleo em sobrecarga crítica total (Pulsando branco e vermelho extremo)
    imagefilledellipse($im, $cx, 34, 26, 26, $cRedHot);
    imagefilledellipse($im, $cx, 34, 20, 20, $cFire);
    imagefilledellipse($im, $cx, 34, 14, 14, $cGold);
    imagefilledellipse($im, $cx, 34, 8, 8, $cWhite);

    // Feixes de eletricidade e plasma saindo do núcleo
    imageline($im, $cx - 12, 34, $cx - 24, 28, hexCol($im, '#38bdf8'));
    imageline($im, $cx + 12, 34, $cx + 24, 28, hexCol($im, '#38bdf8'));
    imageline($im, $cx - 8, 44, $cx - 18, 54, $cGold);
    imageline($im, $cx + 8, 44, $cx + 18, 54, $cGold);

    // Canhões inferiores em fusão térmica contínua
    imagefilledrectangle($im, $cx - 8, 50, $cx + 8, 62, $cFire);
    imagefilledrectangle($im, $cx - 5, 52, $cx + 5, 60, $cGold);
    imagefilledrectangle($im, $cx - 2, 54, $cx + 2, 58, $cWhite);

    imagepng($im, $outputPath);
}

// Pedaços que se soltam (Debris ejetáveis)
function gerarPedacoAsaEsquerda(string $outputPath) {
    $w = 32; $h = 36;
    $im = criarCanvas($w, $h);
    $cDark    = hexCol($im, '#070a13');
    $cSteel1  = hexCol($im, '#1e293b');
    $cSteel2  = hexCol($im, '#334155');
    $cSteel3  = hexCol($im, '#475569');
    $cSteel4  = hexCol($im, '#64748b');
    $cRed     = hexCol($im, '#dc2626');
    $cFire    = hexCol($im, '#f97316');

    // A asa esquerda e canhão caindo
    imagefilledrectangle($im, 4, 4, 24, 20, $cSteel1);
    imagefilledrectangle($im, 6, 6, 22, 18, $cSteel3);
    imagefilledrectangle($im, 10, 16, 20, 32, $cSteel2);
    imagefilledrectangle($im, 12, 18, 18, 30, $cSteel4);
    imagefilledrectangle($im, 13, 30, 17, 34, $cRed);
    // Borda rasgada e faiscante
    imagesetpixel($im, 24, 8, $cFire);
    imagesetpixel($im, 25, 12, hexCol($im, '#facc15'));
    imagesetpixel($im, 24, 16, hexCol($im, '#38bdf8'));
    imagepng($im, $outputPath);
}

function gerarPedacoAsaDireita(string $outputPath) {
    $w = 32; $h = 36;
    $im = criarCanvas($w, $h);
    $cDark    = hexCol($im, '#070a13');
    $cSteel1  = hexCol($im, '#1e293b');
    $cSteel2  = hexCol($im, '#334155');
    $cSteel3  = hexCol($im, '#475569');
    $cSteel4  = hexCol($im, '#64748b');
    $cRed     = hexCol($im, '#dc2626');
    $cFire    = hexCol($im, '#f97316');

    // A asa direita e canhão caindo (espelhado)
    imagefilledrectangle($im, 8, 4, 28, 20, $cSteel1);
    imagefilledrectangle($im, 10, 6, 26, 18, $cSteel3);
    imagefilledrectangle($im, 12, 16, 22, 32, $cSteel2);
    imagefilledrectangle($im, 14, 18, 20, 30, $cSteel4);
    imagefilledrectangle($im, 15, 30, 19, 34, $cRed);
    imagesetpixel($im, 7, 8, $cFire);
    imagesetpixel($im, 6, 12, hexCol($im, '#facc15'));
    imagesetpixel($im, 7, 16, hexCol($im, '#38bdf8'));
    imagepng($im, $outputPath);
}

function gerarPedacoPlacaPeito(string $outputPath) {
    $w = 28; $h = 24;
    $im = criarCanvas($w, $h);
    $cSteel2  = hexCol($im, '#334155');
    $cSteel3  = hexCol($im, '#475569');
    $cGold    = hexCol($im, '#facc15');
    $cFire    = hexCol($im, '#f97316');

    // Placa de armadura do brasão rompida
    imagefilledrectangle($im, 2, 2, 25, 21, $cSteel2);
    imagefilledrectangle($im, 4, 4, 23, 19, $cSteel3);
    imagefilledrectangle($im, 8, 6, 19, 14, $cGold);
    imagesetpixel($im, 2, 2, $cFire);
    imagesetpixel($im, 25, 21, $cFire);
    imagepng($im, $outputPath);
}

// =========================================================================
// EXECUÇÃO GERAL DE GERAÇÃO
// =========================================================================

echo "Gerando assets dos Chefes...\n";

gerarChefe1($baseDir . '/levels/level_1/boss.png');
echo "✓ Nível 1: O Super-Robô da Mentira (levels/level_1/boss.png)\n";

gerarChefe2($baseDir . '/levels/level_2/boss.png');
echo "✓ Nível 2: O Algoritmo da Precarização (levels/level_2/boss.png)\n";

gerarChefe3($baseDir . '/levels/level_3/boss.png');
echo "✓ Nível 3: O Correntão da Devastação (levels/level_3/boss.png)\n";

gerarChefe4($baseDir . '/levels/level_4/boss.png');
echo "✓ Nível 4: A Quimera do Obscurantismo (levels/level_4/boss.png)\n";

gerarChefe5($baseDir . '/levels/level_5/boss.png');
echo "✓ Nível 5: O Falso Profeta do Ódio (levels/level_5/boss.png)\n";

// Nível 6: 4 fases e pedaços ejetáveis
gerarChefe6Fase1($baseDir . '/levels/level_6/boss.png');
gerarChefe6Fase1($baseDir . '/levels/level_6/boss_phase1.png');
gerarChefe6Fase2($baseDir . '/levels/level_6/boss_phase2.png');
gerarChefe6Fase3($baseDir . '/levels/level_6/boss_phase3.png');
gerarChefe6Fase4($baseDir . '/levels/level_6/boss_phase4.png');
gerarPedacoAsaEsquerda($baseDir . '/levels/level_6/boss_piece_wing_left.png');
gerarPedacoAsaDireita($baseDir . '/levels/level_6/boss_piece_wing_right.png');
gerarPedacoPlacaPeito($baseDir . '/levels/level_6/boss_piece_core_plate.png');
echo "✓ Nível 6: A Hidra Golpista (4 Fases + 3 Pedaços Ejetáveis)\n";

echo "Todos os assets dos chefes foram gerados com sucesso!\n";
