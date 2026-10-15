<?php
// Script de geração das artes de compartilhamento
$baseDir = dirname(__DIR__);
$fonte = $baseDir . '/assets/fonts/vcr_osd_mono.ttf';

if (!file_exists($fonte)) {
    die("Fonte não encontrada: $fonte\n");
}

// 1. Gerar og-preview.png (1200x630 para WhatsApp / Facebook / Twitter / Open Graph)
$largura = 1200;
$altura = 630;
$img = imagecreatetruecolor($largura, $altura);
imagealphablending($img, true);
imagesavealpha($img, true);

$corFundo = imagecolorallocate($img, 11, 15, 25);
$corGrade = imagecolorallocate($img, 24, 30, 48);
$corVermelho = imagecolorallocate($img, 220, 38, 38);
$corVermelhoEscuro = imagecolorallocate($img, 153, 27, 27);
$corDourado = imagecolorallocate($img, 250, 204, 21);
$corAmareloClaro = imagecolorallocate($img, 254, 240, 138);
$corCiano = imagecolorallocate($img, 56, 189, 248);
$corBranca = imagecolorallocate($img, 248, 250, 252);
$corCinza = imagecolorallocate($img, 148, 163, 184);
$corPreto = imagecolorallocate($img, 0, 0, 0);

// Fundo
imagefilledrectangle($img, 0, 0, $largura, $altura, $corFundo);

// Grade retro
for ($x = 0; $x < $largura; $x += 40) {
    imageline($img, $x, 0, $x, $altura, $corGrade);
}
for ($y = 0; $y < $altura; $y += 40) {
    imageline($img, 0, $y, $largura, $y, $corGrade);
}

// Borda CRT neon
imagesetthickness($img, 6);
imagerectangle($img, 16, 16, $largura - 16, $altura - 16, $corVermelho);
imagesetthickness($img, 2);
imagerectangle($img, 24, 24, $largura - 24, $altura - 24, $corDourado);

// Titulo Principal
imagettftext($img, 50, 0, 60, 140, $corPreto, $fonte, 'LEVANTE 13: A VIRADA');
imagettftext($img, 50, 0, 56, 136, $corVermelho, $fonte, 'LEVANTE 13: A VIRADA');
imagettftext($img, 50, 0, 54, 134, $corBranca, $fonte, 'LEVANTE 13: A VIRADA');

// Subtitulo
imagettftext($img, 24, 0, 60, 210, $corDourado, $fonte, 'A ESPERANCA VAI VIRAR O JOGO');

// Mensagem de chamada
imagettftext($img, 17, 0, 60, 340, $corCinza, $fonte, 'DEFENDA AS CONQUISTAS DO POVO E A SOBERANIA DO BRASIL.');
imagettftext($img, 17, 0, 60, 375, $corCinza, $fonte, 'ENFRENTE OS INVASORES, SOME PONTOS E DISPUTE O PLACAR!');

// Caixa de Destaque / Estatistica
imagefilledrectangle($img, 60, 420, 620, 510, $corGrade);
imagesetthickness($img, 2);
imagerectangle($img, 60, 420, 620, 510, $corCiano);
imagettftext($img, 18, 0, 85, 460, $corCiano, $fonte, '> MISSAO: MOBILIZACAO POPULAR');
imagettftext($img, 15, 0, 85, 490, $corBranca, $fonte, '100% GRATUITO - NO NAVEGADOR - SEM INSTALACAO');

// Piloto / Slogan lateral
imagefilledrectangle($img, 660, 420, $largura - 60, 510, $corVermelhoEscuro);
imagerectangle($img, 660, 420, $largura - 60, 510, $corDourado);
imagettftext($img, 22, 0, 700, 465, $corAmareloClaro, $fonte, '[*] JOGUE & COMPARTILHE [*]');
imagettftext($img, 16, 0, 700, 495, $corBranca, $fonte, 'VIRA VOTO - RESISTENCIA 2026');

// Rodape
imageline($img, 40, 550, $largura - 40, 550, $corGrade);
imagettftext($img, 15, 0, 60, 585, $corCinza, $fonte, 'COMITE POPULAR DE TECNOLOGIA - SOBERANIA DIGITAL');
imagettftext($img, 16, 0, 920, 585, $corDourado, $fonte, '>> ACESSE AGORA <<');

if (!is_dir($baseDir . '/assets/img')) {
    mkdir($baseDir . '/assets/img', 0755, true);
}
if (!is_dir($baseDir . '/deploy/assets/img')) {
    mkdir($baseDir . '/deploy/assets/img', 0755, true);
}

imagepng($img, $baseDir . '/assets/img/og-preview.png', 9);
imagepng($img, $baseDir . '/deploy/assets/img/og-preview.png', 9);
imagedestroy($img);
echo "og-preview.png gerado com sucesso!\n";

// ==========================================
// 2. Gerar card_story.png (1080x1920 vertical para Instagram Stories)
// ==========================================
$storyW = 1080;
$storyH = 1920;
$storyImg = imagecreatetruecolor($storyW, $storyH);
imagealphablending($storyImg, true);
imagesavealpha($storyImg, true);

$corFundoS = imagecolorallocate($storyImg, 11, 15, 25);
$corGradeS = imagecolorallocate($storyImg, 22, 28, 46);
$corVermelhoS = imagecolorallocate($storyImg, 220, 38, 38);
$corVermelhoEscS = imagecolorallocate($storyImg, 153, 27, 27);
$corDouradoS = imagecolorallocate($storyImg, 250, 204, 21);
$corAmareloClaroS = imagecolorallocate($storyImg, 254, 240, 138);
$corCianoS = imagecolorallocate($storyImg, 56, 189, 248);
$corBrancaS = imagecolorallocate($storyImg, 248, 250, 252);
$corCinzaS = imagecolorallocate($storyImg, 148, 163, 184);
$corPretoS = imagecolorallocate($storyImg, 0, 0, 0);

// Fundo
imagefilledrectangle($storyImg, 0, 0, $storyW, $storyH, $corFundoS);

// Grade retro vertical
for ($x = 0; $x < $storyW; $x += 48) {
    imageline($storyImg, $x, 0, $x, $storyH, $corGradeS);
}
for ($y = 0; $y < $storyH; $y += 48) {
    imageline($storyImg, 0, $y, $storyW, $y, $corGradeS);
}

// Borda externa dupla estilo fliperama
imagesetthickness($storyImg, 10);
imagerectangle($storyImg, 30, 30, $storyW - 30, $storyH - 30, $corVermelhoS);
imagesetthickness($storyImg, 4);
imagerectangle($storyImg, 44, 44, $storyW - 44, $storyH - 44, $corDouradoS);

// Titulo Principal (Story)
imagettftext($storyImg, 62, 0, 100, 240, $corPretoS, $fonte, 'LEVANTE 13');
imagettftext($storyImg, 62, 0, 96, 236, $corVermelhoS, $fonte, 'LEVANTE 13');
imagettftext($storyImg, 62, 0, 94, 234, $corBrancaS, $fonte, 'LEVANTE 13');

imagettftext($storyImg, 42, 0, 100, 340, $corDouradoS, $fonte, 'A VIRADA VAI COMECAR!');

// Mensagem
imagettftext($storyImg, 26, 0, 100, 440, $corCianoS, $fonte, '> O JOGO DA RESISTENCIA BRASILEIRA');

// Card Central - Arte Pixel
imagefilledrectangle($storyImg, 80, 520, $storyW - 80, 1180, $corGradeS);
imagesetthickness($storyImg, 4);
imagerectangle($storyImg, 80, 520, $storyW - 80, 1180, $corCianoS);

imagettftext($storyImg, 28, 0, 120, 620, $corDouradoS, $fonte, 'PILOTOS DA DEMOCRACIA:');
imagettftext($storyImg, 22, 0, 120, 710, $corBrancaS, $fonte, '- DEFENDA A SOBERANIA NACIONAL');
imagettftext($storyImg, 22, 0, 120, 780, $corBrancaS, $fonte, '- COMBATA AS FAKE NEWS');
imagettftext($storyImg, 22, 0, 120, 850, $corBrancaS, $fonte, '- VIRE VOTOS NA SUA REDE');
imagettftext($storyImg, 22, 0, 120, 920, $corBrancaS, $fonte, '- DISPUTE O PLACAR POPULAR');

// Box 13 Vermelho
imagefilledrectangle($storyImg, 120, 1000, $storyW - 120, 1130, $corVermelhoEscS);
imagerectangle($storyImg, 120, 1000, $storyW - 120, 1130, $corDouradoS);
imagettftext($storyImg, 38, 0, 200, 1080, $corAmareloClaroS, $fonte, 'VOTE 13 - RESISTA!');

// Link Box
imagefilledrectangle($storyImg, 80, 1260, $storyW - 80, 1480, $corVermelhoS);
imagerectangle($storyImg, 80, 1260, $storyW - 80, 1480, $corDouradoS);
imagettftext($storyImg, 30, 0, 150, 1345, $corBrancaS, $fonte, 'ACESSE PELO LINK OU DIGITE:');
imagettftext($storyImg, 38, 0, 210, 1425, $corDouradoS, $fonte, 'LEVANTE13.ONLINE');

// Rodape Story
imagettftext($storyImg, 24, 0, 160, 1620, $corCinzaS, $fonte, 'COMPARTILHE NOS SEUS STORIES');
imagettftext($storyImg, 26, 0, 250, 1695, $corCianoS, $fonte, 'MARQUE @LULAOFICIAL');
imagettftext($storyImg, 22, 0, 190, 1800, $corCinzaS, $fonte, 'COMITE POPULAR DE TECNOLOGIA');

imagepng($storyImg, $baseDir . '/assets/img/card_story.png', 9);
imagepng($storyImg, $baseDir . '/deploy/assets/img/card_story.png', 9);
imagedestroy($storyImg);
echo "card_story.png gerado com sucesso!\n";
