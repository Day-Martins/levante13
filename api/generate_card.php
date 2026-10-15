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
        imagettftext($imagem, 18, 0, 60, 560, $corCiano, FONTE_PADRAO, 'DESAFIE ESTE RECORDE EM: ' . dominioDoJogo());
        imagettftext($imagem, 14, 0, 850, 560, $corBranca, FONTE_PADRAO, $dataHoje);
    } else {
        // Sem fonte TrueType: usa a fonte de bitmap do GD ampliada pixel a pixel (visual de fliperama)
        textoPixelado($imagem, $tituloPrincipal, 60, 47, 4, $corAmarela);
        textoPixelado($imagem, $subtitulo, 60, 140, 3, $corCiano);
        textoPixelado($imagem, $pilotoTexto, 60, 205, 5, $corBranca);
        textoPixelado($imagem, $scoreFormatado, 60, 300, 7, $corAmarela);
        textoPixelado($imagem, $setorTexto, 60, 440, 3, $corBranca);
        textoPixelado($imagem, $dataHoje, 60, 494, 2, $corBranca);
        textoPixelado($imagem, 'DESAFIE ESTE RECORDE EM: ' . dominioDoJogo(), 60, 540, 2, $corCiano);
    }

    // Salva a imagem final no diretório de cards
    $caminhoDestino = CARDS_DIR . "/card_{$shareToken}.png";
    return imagepng($imagem, $caminhoDestino, 8); // Compressão equilibrada
}

/**
 * Domínio do jogo em maiúsculas, sem protocolo (ex.: LEVANTE13.ONLINE), para imprimir no card.
 */
function dominioDoJogo(): string
{
    $base = function_exists('urlBase') ? urlBase() : 'https://levante13.online';
    return strtoupper((string) preg_replace('#^https?://#i', '', $base));
}

/**
 * Escreve texto com a fonte 5 do GD ampliada $escala vezes, com sombra preta.
 * Só funciona com ASCII (a fonte de bitmap não tem acentos), por isso os textos do card não usam acento.
 */
function textoPixelado(\GdImage $imagem, string $texto, int $x, int $y, int $escala, int $cor, bool $alinharDireita = false): void
{
    $fonte = 5;
    $larguraChar = imagefontwidth($fonte);
    $alturaChar = imagefontheight($fonte);
    $larguraTexto = $larguraChar * strlen($texto);
    if ($larguraTexto === 0) {
        return;
    }

    // Desenha o texto em tamanho original numa imagem temporária e copia cada pixel ampliado
    $temp = imagecreate($larguraTexto, $alturaChar);
    imagecolorallocate($temp, 0, 0, 0);
    $tinta = imagecolorallocate($temp, 255, 255, 255);
    imagestring($temp, $fonte, 0, 0, $texto, $tinta);

    $x0 = $alinharDireita ? $x - $larguraTexto * $escala : $x;
    $sombra = imagecolorallocate($imagem, 0, 0, 0);
    $deslocamento = max(2, intdiv($escala, 2));

    foreach ([[$deslocamento, $sombra], [0, $cor]] as [$d, $c]) {
        for ($py = 0; $py < $alturaChar; $py++) {
            for ($px = 0; $px < $larguraTexto; $px++) {
                if (imagecolorat($temp, $px, $py) === $tinta) {
                    $X = $x0 + $px * $escala + $d;
                    $Y = $y + $py * $escala + $d;
                    imagefilledrectangle($imagem, $X, $Y, $X + $escala - 1, $Y + $escala - 1, $c);
                }
            }
        }
    }
}
