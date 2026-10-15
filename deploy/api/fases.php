<?php
declare(strict_types=1);

/**
 * Levante 13: A Virada
 * Leitura das fases (pastas levels/level_*), usada pela lista de fases e pela validação de pontos.
 */

/**
 * Retorna as fases válidas, na ordem natural das pastas (level_1, level_2, ..., level_10).
 */
function carregarFases(): array
{
    $caminhoLevels = __DIR__ . '/../levels';
    if (!is_dir($caminhoLevels)) {
        return [];
    }

    $pastasEncontradas = glob($caminhoLevels . '/level_*', GLOB_ONLYDIR);
    if ($pastasEncontradas === false || empty($pastasEncontradas)) {
        return [];
    }
    natsort($pastasEncontradas);

    $fasesValidas = [];

    foreach ($pastasEncontradas as $pasta) {
        $nomePasta = basename($pasta);
        $arquivoConfig = $pasta . '/config.json';

        if (!file_exists($arquivoConfig)) {
            continue;
        }

        $conteudoJson = file_get_contents($arquivoConfig);
        if ($conteudoJson === false) {
            continue;
        }

        if (!json_validate($conteudoJson)) {
            error_log("Aviso: O arquivo config.json da pasta {$nomePasta} contém JSON inválido.");
            continue;
        }

        $dadosConfig = json_decode($conteudoJson, true);

        if (!is_array($dadosConfig) || !isset($dadosConfig['name'], $dadosConfig['grid'], $dadosConfig['enemyTypes'])) {
            continue;
        }

        $erro = validarConfigFase($dadosConfig);
        if ($erro !== null) {
            error_log("Aviso: fase {$nomePasta} ignorada: {$erro}");
            continue;
        }

        $temFundo = file_exists($pasta . '/bg.png');
        $temInimigo = file_exists($pasta . '/enemy.png');
        $temMentor = file_exists($pasta . '/mentor.png');
        $temMusica = file_exists($pasta . '/music.ogg') || file_exists($pasta . '/music.mp3');

        if (preg_match('/^level_(\d+)$/', $nomePasta, $matches)) {
            $idFase = (int) $matches[1];
        } else {
            $idFase = count($fasesValidas) + 1;
        }

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
                'musica'   => $temMusica ? (file_exists($pasta . '/music.ogg') ? "levels/{$nomePasta}/music.ogg" : "levels/{$nomePasta}/music.mp3") : null
            ],
            'grade'       => $dadosConfig['grid'],
            'inimigos'    => $dadosConfig['enemyTypes'],
            'chefe'       => $dadosConfig['boss'] ?? null
        ];
    }

    return array_values($fasesValidas);
}

/**
 * Confere os campos de que o jogo e a validação de pontos dependem.
 * Retorna a descrição do erro ou null se estiver tudo certo.
 */
function validarConfigFase(array $c): ?string
{
    $g = $c['grid'];
    if (!is_array($g)) return 'grid deve ser um objeto';
    foreach (['rows' => [1, 8], 'cols' => [1, 10]] as $campo => [$min, $max]) {
        if (!is_int($g[$campo] ?? null) || $g[$campo] < $min || $g[$campo] > $max) {
            return "grid.{$campo} deve ser inteiro entre {$min} e {$max}";
        }
    }

    $tipos = $c['enemyTypes'];
    if (!is_array($tipos) || !array_is_list($tipos) || count($tipos) === 0) {
        return 'enemyTypes deve ser uma lista com pelo menos um tipo';
    }
    $ids = [];
    foreach ($tipos as $i => $t) {
        if (!is_array($t) || !is_string($t['id'] ?? null) || $t['id'] === '') return "enemyTypes[{$i}].id ausente";
        if (isset($ids[$t['id']])) return "enemyTypes[{$i}].id repetido";
        $ids[$t['id']] = true;
        if (!is_int($t['points'] ?? null) || $t['points'] < 0 || $t['points'] > 100000) return "enemyTypes[{$i}].points inválido";
        if (isset($t['hp']) && (!is_int($t['hp']) || $t['hp'] < 1 || $t['hp'] > 50)) return "enemyTypes[{$i}].hp inválido";
    }

    if (isset($c['boss'])) {
        $b = $c['boss'];
        if (!is_array($b)) return 'boss deve ser um objeto';
        if (!is_int($b['points'] ?? null) || $b['points'] < 0 || $b['points'] > 1000000) return 'boss.points inválido';
        if (isset($b['hp']) && (!is_int($b['hp']) || $b['hp'] < 1 || $b['hp'] > 1000)) return 'boss.hp inválido';
    }
    return null;
}

/**
 * Quantos inimigos de cada tipo existem na grade da fase.
 * Mesma regra do game.js (montarGradeInimigos): a linha r usa o tipo enemyTypes[r % total].
 */
function contarInimigosPorTipo(array $fase): array
{
    $tipos = $fase['inimigos'];
    $contagem = [];
    for ($r = 0; $r < $fase['grade']['rows']; $r++) {
        $id = $tipos[$r % count($tipos)]['id'];
        $contagem[$id] = ($contagem[$id] ?? 0) + $fase['grade']['cols'];
    }
    return $contagem;
}

/**
 * Recalcula a pontuação a partir do registro de abates enviado pelo jogo.
 * Cada item: { "pasta": "level_1", "abates": { "<id do tipo>": n, ... }, "chefe": true|false }.
 *
 * Regras: a ordem das fases precisa bater; nenhum tipo pode ter mais abates do que existem;
 * toda fase antes da última precisa estar completa (todos os inimigos e o chefe).
 * Retorna ['pontos' => int, 'completas' => int] ou null se o registro for impossível.
 */
function recalcularPontuacao(array $registro, array $fases): ?array
{
    if (!array_is_list($registro) || count($registro) === 0 || count($registro) > count($fases)) {
        return null;
    }

    $pontos = 0;
    $completas = 0;
    $ultimo = count($registro) - 1;

    foreach ($registro as $i => $item) {
        $fase = $fases[$i];
        if (!is_array($item) || ($item['pasta'] ?? null) !== $fase['pasta']) return null;

        $abates = $item['abates'] ?? null;
        if (!is_array($abates) || array_is_list($abates) && count($abates) > 0) return null;
        $chefe = $item['chefe'] ?? null;
        if (!is_bool($chefe)) return null;

        $disponiveis = contarInimigosPorTipo($fase);
        $pontosPorTipo = array_column($fase['inimigos'], 'points', 'id');
        $limpou = true;

        foreach ($abates as $id => $n) {
            if (!isset($disponiveis[$id]) || !is_int($n) || $n < 0 || $n > $disponiveis[$id]) return null;
        }
        foreach ($disponiveis as $id => $total) {
            $n = $abates[$id] ?? 0;
            $pontos += $n * (int) $pontosPorTipo[$id];
            if ($n !== $total) $limpou = false;
        }

        if ($chefe) {
            if (!$fase['chefe'] || !$limpou) return null;   // o chefe só aparece depois da grade limpa
            $pontos += (int) $fase['chefe']['points'];
        }

        $completa = $limpou && ($chefe || !$fase['chefe']);
        // Só a última fase registrada pode estar incompleta; e só pode estar completa se for a fase final (vitória)
        if ($i < $ultimo && !$completa) return null;
        if ($i === $ultimo && $completa && $i !== count($fases) - 1) return null;
        if ($completa) $completas++;
    }

    return ['pontos' => $pontos, 'completas' => $completas];
}
