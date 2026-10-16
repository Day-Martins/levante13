<?php
declare(strict_types=1);

/**
 * Levante 13: A Virada
 * Módulo Gerador de Card Comemorativo via PHP GD
 * Arquivo: api/generate_card.php
 * 
 * Funcionalidades:
 * - Gera imagem de alta resolução (1200x630px) para compartilhamento no WhatsApp, Instagram e Open Graph.
 * - Carimba codinome do piloto, pontuação destacada em dourado, setor defendido e mentor.
 * - Banner oficial de convocação para atrair novos jogadores: https://levante13.online.
 * - Grava arquivo em `cards/card_[token].png`.
 */

const CARDS_DIR = __DIR__ . '/../cards';
const ASSETS_DIR = __DIR__ . '/../assets';
const LEVELS_DIR = __DIR__ . '/../levels';
const FONTE_PADRAO = ASSETS_DIR . '/fonts/vcr_osd_mono.ttf';

/**
 * Retorna o nome amigável da Frente
 */
function obterNomeFrente(int $levelReached): string
{
    $nomes = [
        1 => 'FRENTE 1 (DEMOCRACIA)',
        2 => 'FRENTE 2 (TRABALHO)',
        3 => 'FRENTE 3 (AMAZONIA)',
        4 => 'FRENTE 4 (SUS / SAUDE)',
        5 => 'FRENTE 5 (ESTADO LAICO)',
        6 => 'FRENTE 6 (SOBERANIA)'
    ];
    return $nomes[$levelReached] ?? "FRENTE {$levelReached}";
}

/**
 * Gera a imagem comemorativa da partida.
 *
 * @param string $playerName   Apelido do piloto (Arcade Tag).
 * @param int    $score        Pontos de Resistência acumulados.
 * @param int    $levelReached Número da última fase defendida.
 * @param string $shareToken   Hash único da partida.
 * @return bool True em caso de sucesso, False em caso de falha.
 */
function gerarCardResistencia(
    string $playerName,
    int $score,
    int $levelReached,
    string $shareToken
): bool {
    if (!extension_loaded('gd')) {
        error_log('Aviso: Extensão PHP GD não está instalada no servidor.');
        return false;
    }

    if (!is_dir(CARDS_DIR)) {
        if (!mkdir(CARDS_DIR, 0755, true) && !is_dir(CARDS_DIR)) {
            error_log('Falha ao criar diretório de cards: ' . CARDS_DIR);
            return false;
        }
    }

    $largura = 1200;
    $altura  = 630;

    $img = imagecreatetruecolor($largura, $altura);
    if (!$img) {
        return false;
    }

    imagealphablending($img, true);
    imagesavealpha($img, true);

    // Paleta de Cores da Resistência
    $bgCor       = imagecolorallocate($img, 8, 12, 24);      // Azul cósmico profundo
    $corGrade    = imagecolorallocate($img, 18, 26, 46);     // Grade orbital
    $corVermelho = imagecolorallocate($img, 220, 38, 38);    // Vermelho Levante
    $corDourado  = imagecolorallocate($img, 250, 204, 21);   // Dourado Soberania
    $corCiano    = imagecolorallocate($img, 56, 189, 248);   // Ciano Tecnologia
    $corBranco   = imagecolorallocate($img, 255, 255, 255);  // Branco puro
    $corCinza    = imagecolorallocate($img, 148, 163, 184);  // Cinza metálico
    $corSombra   = imagecolorallocate($img, 0, 0, 0);        // Preto sombra

    // 1. Fundo cósmico com grade de radar
    imagefilledrectangle($img, 0, 0, $largura, $altura, $bgCor);
    for ($x = 0; $x < $largura; $x += 40) {
        imageline($img, $x, 0, $x, $altura, $corGrade);
    }
    for ($y = 0; $y < $altura; $y += 40) {
        imageline($img, 0, $y, $largura, $y, $corGrade);
    }

    // 2. Moldura externa neon dupla
    imagesetthickness($img, 4);
    imagerectangle($img, 16, 16, $largura - 16, $altura - 16, $corVermelho);
    imagesetthickness($img, 2);
    imagerectangle($img, 24, 24, $largura - 24, $altura - 24, $corDourado);

    // 3. Cantos angulados de HUD militar
    imagefilledrectangle($img, 10, 10, 30, 30, $corVermelho);
    imagefilledrectangle($img, $largura - 30, 10, $largura - 10, 30, $corVermelho);
    imagefilledrectangle($img, 10, $altura - 30, 30, $altura - 10, $corVermelho);
    imagefilledrectangle($img, $largura - 30, $altura - 30, $largura - 10, $altura - 10, $corVermelho);

    // 4. Faixa de Cabeçalho Superior
    $faixaHeader = imagecolorallocate($img, 180, 24, 24);
    imagefilledrectangle($img, 36, 36, $largura - 36, 114, $faixaHeader);
    imagerectangle($img, 36, 36, $largura - 36, 114, $corDourado);

    $temFonte = file_exists(FONTE_PADRAO);
    $tagPiloto = strtoupper($playerName !== '' ? $playerName : 'PILOTO 13');
    $scoreFormatado = number_format($score, 0, ',', '.') . ' PTS';
    $frenteTexto = obterNomeFrente($levelReached);

    if ($temFonte) {
        // Título Principal com Sombra
        imagettftext($img, 32, 0, 60, 92, $corSombra, FONTE_PADRAO, 'LEVANTE 13: A VIRADA');
        imagettftext($img, 32, 0, 58, 90, $corDourado, FONTE_PADRAO, 'LEVANTE 13: A VIRADA');
        imagettftext($img, 15, 0, 780, 90, $corBranco, FONTE_PADRAO, 'O JOGO DA RESISTÊNCIA POPULAR');

        // Subtítulo
        imagettftext($img, 18, 0, 60, 160, $corCiano, FONTE_PADRAO, '> BOLETIM OFICIAL DE COMBATE DA VANGUARDA POPULAR');

        // Painel do Piloto e Pontuação
        $boxBg = imagecolorallocate($img, 14, 20, 38);
        imagefilledrectangle($img, 60, 190, $largura - 60, 440, $boxBg);
        imagerectangle($img, 60, 190, $largura - 60, 440, $corCiano);

        // Coluna 1: Piloto e Frente Defendida
        imagettftext($img, 18, 0, 90, 235, $corCinza, FONTE_PADRAO, 'PILOTO DA RESISTÊNCIA:');
        imagettftext($img, 32, 0, 90, 275, $corBranco, FONTE_PADRAO, $tagPiloto);

        imagettftext($img, 18, 0, 90, 345, $corCinza, FONTE_PADRAO, 'FRENTE DEFENDIDA:');
        imagettftext($img, 24, 0, 90, 385, $corCiano, FONTE_PADRAO, $frenteTexto);

        // Coluna 2: Pontuação em Dourado Gigante e Detalhes
        imagettftext($img, 18, 0, 520, 235, $corCinza, FONTE_PADRAO, 'PONTOS ACUMULADOS:');
        imagettftext($img, 46, 0, 520, 290, $corDourado, FONTE_PADRAO, $scoreFormatado);

        imagettftext($img, 16, 0, 520, 355, $corBranco, FONTE_PADRAO, 'DATA: ' . date('d/m/Y'));
        imagettftext($img, 14, 0, 520, 395, $corCinza, FONTE_PADRAO, 'STATUS: RESISTÊNCIA ATIVA');

        // Estampa do Mentor da Frente (se existir)
        $mentorPath = LEVELS_DIR . "/level_{$levelReached}/mentor.png";
        if (file_exists($mentorPath)) {
            $mentorImg = @imagecreatefrompng($mentorPath);
            if ($mentorImg) {
                imagecopyresampled($img, $mentorImg, 930, 215, 0, 0, 200, 200, 128, 128);
                imagerectangle($img, 928, 213, 1132, 417, $corDourado);
                imagettftext($img, 13, 0, 955, 432, $corCinza, FONTE_PADRAO, 'MENTOR DO SETOR');
            }
        }

        // 5. Banner de Chamada para Ação Viral (Atrair mais jogadores)
        $ctaBg = imagecolorallocate($img, 185, 28, 28);
        imagefilledrectangle($img, 60, 460, $largura - 60, 560, $ctaBg);
        imagerectangle($img, 60, 460, $largura - 60, 560, $corDourado);

        imagettftext($img, 24, 0, 90, 508, $corDourado, FONTE_PADRAO, '[*] VOCÊ CONSEGUE SUPERAR ESSA MARCA? JOGUE AGORA! [*]');
        imagettftext($img, 20, 0, 90, 542, $corBranco, FONTE_PADRAO, 'ACESSE GRÁTIS NO NAVEGADOR: HTTPS://LEVANTE13.ONLINE');

        // 6. Rodapé
        imagettftext($img, 13, 0, 60, 595, $corCinza, FONTE_PADRAO, 'COMPARTILHE NO WHATSAPP E INSTAGRAM @LULAOFICIAL | DEFENDENDO A DEMOCRACIA');

    } else {
        // Fallback nativo
        imagestring($img, 5, 60, 60,  'LEVANTE 13: A VIRADA', $corBranco);
        imagestring($img, 5, 60, 240, "PILOTO: {$tagPiloto}", $corBranco);
        imagestring($img, 5, 60, 320, "PONTOS: {$scoreFormatado}", $corDourado);
        imagestring($img, 4, 60, 400, "SETOR: {$frenteTexto}", $corCiano);
        imagestring($img, 5, 60, 490, '[*] DESAFIE ESTE RECORDE EM: HTTPS://LEVANTE13.ONLINE [*]', $corDourado);
    }

    $caminhoDestino = CARDS_DIR . "/card_{$shareToken}.png";
    return imagepng($img, $caminhoDestino, 8);
}
