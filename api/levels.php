<?php
declare(strict_types=1);

/**
 * Levante 13: A Virada
 * Endpoint: Descoberta Automática de Fases
 * Rota: GET /api/levels.php
 * 
 * Funcionalidades:
 * - Vasculha dinamicamente as pastas no padrão `levels/level_*`.
 * - Aplica ordenação natural (natsort) para que level_10 venha após level_9.
 * - Valida a integridade do arquivo `config.json` usando `json_validate()` nativo do PHP 8.4.
 * - Confirma a existência de assets mínimos (bg.png, enemy.png, mentor.png).
 * - Entrega manifesto em JSON para o frontend.
 */

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: public, max-age=60'); // Cache leve de 1 minuto no cliente

// Apenas aceita requisições do tipo GET (ou CLI para testes)
$metodoRequisicao = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if ($metodoRequisicao !== 'GET') {
    http_response_code(405);
    echo json_encode([
        'sucesso' => false,
        'erro'    => 'Método não permitido. Utilize GET.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$caminhoLevels = __DIR__ . '/../levels';

// Se a pasta levels ainda não existir, cria ou retorna lista vazia amigável
if (!is_dir($caminhoLevels)) {
    echo json_encode([
        'sucesso' => true,
        'total'   => 0,
        'fases'   => []
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// Busca todos os diretórios que iniciam com "level_"
$pastasEncontradas = glob($caminhoLevels . '/level_*', GLOB_ONLYDIR);

if ($pastasEncontradas === false || empty($pastasEncontradas)) {
    echo json_encode([
        'sucesso' => true,
        'total'   => 0,
        'fases'   => []
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// Aplica ordenação natural (ex.: level_1, level_2, ..., level_10)
natsort($pastasEncontradas);

$fasesValidas = [];

foreach ($pastasEncontradas as $pasta) {
    $nomePasta = basename($pasta);
    $arquivoConfig = $pasta . '/config.json';

    // Se não tiver o arquivo de configuração, pula a pasta silenciosamente
    if (!file_exists($arquivoConfig)) {
        continue;
    }

    $conteudoJson = file_get_contents($arquivoConfig);
    if ($conteudoJson === false) {
        continue;
    }

    // Validação nativa ultrarrápida do PHP 8.4 antes de decodificar
    if (!json_validate($conteudoJson)) {
        error_log("Aviso: O arquivo config.json da pasta {$nomePasta} contém JSON inválido.");
        continue;
    }

    $dadosConfig = json_decode($conteudoJson, true);

    // Validação dos campos mínimos obrigatórios
    if (!is_array($dadosConfig) || !isset($dadosConfig['name'], $dadosConfig['grid'], $dadosConfig['enemyTypes'])) {
        continue;
    }

    // Verifica a presença dos assets visuais da fase
    $temFundo = file_exists($pasta . '/bg.png');
    $temInimigo = file_exists($pasta . '/enemy.png');
    $temMentor = file_exists($pasta . '/mentor.png');
    $temChefe = file_exists($pasta . '/boss.png');
    $temMusica = file_exists($pasta . '/music.ogg') || file_exists($pasta . '/music.mp3');

    // Extrai o identificador numérico da pasta (ex.: level_3 -> 3)
    $idFase = 0;
    if (preg_match('/^level_(\d+)$/', $nomePasta, $matches)) {
        $idFase = (int) $matches[1];
    } else {
        $idFase = count($fasesValidas) + 1;
    }

    // Monta a estrutura da fase para consumo pelo frontend
    $fasesValidas[] = [
        'id'          => $idFase,
        'pasta'       => $nomePasta,
        'nome'        => (string) $dadosConfig['name'],
        'subtitulo'   => (string) ($dadosConfig['subtitle'] ?? ''),
        'holotransmissao' => [
            'mentor'   => (string) ($dadosConfig['holotransmission']['mentor'] ?? $dadosConfig['briefing']['mentor'] ?? 'Comando do Levante'),
            'cargo'    => (string) ($dadosConfig['holotransmission']['role'] ?? $dadosConfig['briefing']['role'] ?? 'Aliança Rebelde'),
            'dialogo'  => (array)  ($dadosConfig['holotransmission']['dialogue'] ?? $dadosConfig['briefing']['dialogue'] ?? ['Avancem com coragem!']),
            'avatar'   => $temMentor ? "levels/{$nomePasta}/mentor.png" : 'assets/images/mentor_padrao.png'
        ],
        'assets'      => [
            'fundo'    => $temFundo ? "levels/{$nomePasta}/bg.png" : 'assets/images/bg_padrao.png',
            'inimigo'  => $temInimigo ? "levels/{$nomePasta}/enemy.png" : 'assets/images/enemy_padrao.png',
            'chefe'    => $temChefe ? "levels/{$nomePasta}/boss.png" : null,
            'musica'   => $temMusica ? (file_exists($pasta . '/music.ogg') ? "levels/{$nomePasta}/music.ogg" : "levels/{$nomePasta}/music.mp3") : null
        ],
        'grade'       => $dadosConfig['grid'],
        'inimigos'    => $dadosConfig['enemyTypes'],
        'chefe'       => $dadosConfig['boss'] ?? null
    ];
}

// Reindexa numericamente a lista de fases
$fasesValidas = array_values($fasesValidas);

echo json_encode([
    'sucesso' => true,
    'total'   => count($fasesValidas),
    'fases'   => $fasesValidas
], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
