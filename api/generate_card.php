<?php
declare(strict_types=1);

/**
 * Levante 13: A Virada
 * Módulo Gerador de Card Comemorativo via PHP GD
 * Arquivo: api/generate_card.php
 * 
 * Funcionalidades:
 * - Gera imagem de 1200x630px para compartilhamento em redes sociais (Open Graph / WhatsApp).
 * - Carimba codinome do piloto, pontuação e setor defendido.
 * - Utiliza template base pré-definido se existir ou sintetiza visual retrô espacial de forma nativa.
 * - Grava arquivo em `cards/card_[token].png`.
 */

const CARDS_DIR = __DIR__ . '/../cards';
const ASSETS_DIR = __DIR__ . '/../assets';
const FONTE_PADRAO = ASSETS_DIR . '/fonts/arcade.ttf';
const TEMPLATE_PADRAO = ASSETS_DIR . '/card_template.png';

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
    // Verifica se a extensão GD do PHP está disponível
    if (!extension_loaded('gd')) {
        error_log('Aviso: Extensão PHP GD não está instalada no servidor.');
        return false;
    }

    // Garante que o diretório de destino exista
    if (!is_dir(CARDS_DIR)) {
        if (!mkdir(CARDS_DIR, 0755, true) && !is_dir(CARDS_DIR)) {
            error_log('Falha ao criar diretório de cards: ' . CARDS_DIR);
            return false;
        }
    }

    $largura = 1200;
    $altura  = 630;
    $imagem  = null;

    // Tenta carregar o template base pré-definido caso exista
    if (file_exists(TEMPLATE_PADRAO)) {
        $info = getimagesize(TEMPLATE_PADRAO);
        if ($info !== false && $info[2] === IMAGETYPE_PNG) {
            $imagem = imagecreatefrompng(TEMPLATE_PADRAO);
        }
    }

    // Se não houver template em PNG, gera a arte base proceduralmente com estética Space Opera
    if (!$imagem) {
        $imagem = imagecreatetruecolor($largura, $altura);
        if (!$imagem) {
            return false;
        }

        // Habilita canal alfa e suavização
        imagealphablending($imagem, true);
        imagesavealpha($imagem, true);

        // Cores da paleta da Resistência
        $corFundoEscuro = imagecolorallocate($imagem, 10, 12, 24);    // Azul cósmico profundo
        $corGrade       = imagecolorallocate($imagem, 24, 30, 50);    // Grade orbital
        $corVermelho    = imagecolorallocate($imagem, 220, 38, 38);   // Vermelho Levante
        $corDourado     = imagecolorallocate($imagem, 250, 204, 21);  // Dourado Soberania
        $corBorda       = imagecolorallocate($imagem, 40, 50, 80);    // Borda metálica

        // Preenche fundo cósmico
        imagefilledrectangle($imagem, 0, 0, $largura, $altura, $corFundoEscuro);

        // Desenha grade de radar retrô
        for ($x = 0; $x < $largura; $x += 60) {
            imageline($imagem, $x, 0, $x, $altura, $corGrade);
        }
        for ($y = 0; $y < $altura; $y += 60) {
            imageline($imagem, 0, $y, $largura, $y, $corGrade);
        }

        // Moldura externa tecnológica
        imagesetthickness($imagem, 6);
        imagerectangle($imagem, 20, 20, $largura - 20, $altura - 20, $corVermelho);
        imagesetthickness($imagem, 2);
        imagerectangle($imagem, 30, 30, $largura - 30, $altura - 30, $corDourado);

        // Faixa de cabeçalho
        imagefilledrectangle($imagem, 40, 40, $largura - 40, 110, $corVermelho);
    }

    // Definição de cores para os textos
    $corBranca   = imagecolorallocate($imagem, 255, 255, 255);
    $corAmarela  = imagecolorallocate($imagem, 250, 204, 21);
    $corCiano    = imagecolorallocate($imagem, 56, 189, 248);
    $corSombra   = imagecolorallocate($imagem, 0, 0, 0);

    $scoreFormatado = number_format($score, 0, ',', '.') . ' PONTOS';
    $pilotoTexto    = 'PILOTO: ' . strtoupper($playerName);
    $setorTexto     = "SETOR DEFENDIDO: FRENTE {$levelReached}";
    $tituloPrincipal = 'LEVANTE 13: A VIRADA';
    $subtitulo      = 'CERTIFICADO DE RESISTENCIA POPULAR';
    $dataHoje       = 'REGISTRADO EM: ' . date('d/m/Y');

    // Se houver uma fonte TrueType instalada, utiliza imagettftext para tipografia rica
    if (file_exists(FONTE_PADRAO)) {
        // Título Principal no Cabeçalho
        imagettftext($imagem, 28, 0, 60, 90, $corSombra, FONTE_PADRAO, $tituloPrincipal);
        imagettftext($imagem, 28, 0, 58, 88, $corAmarela, FONTE_PADRAO, $tituloPrincipal);

        // Subtítulo
        imagettftext($imagem, 18, 0, 60, 180, $corCiano, FONTE_PADRAO, $subtitulo);

        // Nome do Piloto
        imagettftext($imagem, 34, 0, 60, 270, $corSombra, FONTE_PADRAO, $pilotoTexto);
        imagettftext($imagem, 34, 0, 58, 268, $corBranca, FONTE_PADRAO, $pilotoTexto);

        // Pontuação de Resistência em destaque dourado
        imagettftext($imagem, 46, 0, 60, 380, $corSombra, FONTE_PADRAO, $scoreFormatado);
        imagettftext($imagem, 46, 0, 58, 378, $corAmarela, FONTE_PADRAO, $scoreFormatado);

        // Setor defendido
        imagettftext($imagem, 22, 0, 60, 470, $corBranca, FONTE_PADRAO, $setorTexto);

        // Rodapé de Chamada
        imagettftext($imagem, 18, 0, 60, 560, $corCiano, FONTE_PADRAO, 'DESAFIE ESTE RECORDE EM: HTTPS://LEVANTE13.ONLINE');
        imagettftext($imagem, 14, 0, 850, 560, $corBranca, FONTE_PADRAO, $dataHoje);
    } else {
        // Fallback robusto usando fontes padrão de bitmap do GD
        imagestring($imagem, 5, 60, 60,  $tituloPrincipal, $corBranca);
        imagestring($imagem, 4, 60, 140, $subtitulo, $corAmarela);
        imagestring($imagem, 5, 60, 220, $pilotoTexto, $corBranca);
        imagestring($imagem, 5, 60, 300, 'PONTOS: ' . $scoreFormatado, $corAmarela);
        imagestring($imagem, 4, 60, 380, $setorTexto, $corCiano);
        imagestring($imagem, 4, 60, 480, 'DESAFIE ESTE RECORDE EM: HTTPS://LEVANTE13.ONLINE', $corBranca);
    }

    // Salva a imagem final no diretório de cards
    $caminhoDestino = CARDS_DIR . "/card_{$shareToken}.png";
    return imagepng($imagem, $caminhoDestino, 8); // Compressão equilibrada
}
