<?php
declare(strict_types=1);

/*
 * Funções compartilhadas pela API.
 * Os dados (SQLite, cards gerados, chave secreta) ficam em ../../data, FORA da pasta pública.
 */

const GAME_NAME   = 'ASTRO ARCADE';
const PUBLIC_URL  = '';          // ex.: 'https://jogo.seudominio.com.br' — recomendado em produção
const PUBLIC_DIR  = __DIR__ . '/..';
const LEVELS_DIR  = PUBLIC_DIR . '/levels';
const DATA_DIR    = __DIR__ . '/../../data';
const CARD_VERSION = 2;          // mude ao alterar o visual do card (força navegadores a baixar de novo)
const STAGE_BONUS = 500;         // precisa bater com game.js

// Avisos do PHP nunca vão para a resposta (corromperiam o JSON e as imagens); vão para o log.
ini_set('display_errors', '0');
ini_set('log_errors', '1');

function db(): PDO
{
    static $pdo = null;
    if ($pdo) return $pdo;
    if (!is_dir(DATA_DIR)) mkdir(DATA_DIR, 0775, true);
    $pdo = new PDO('sqlite:' . DATA_DIR . '/game.sqlite');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    $pdo->exec('PRAGMA journal_mode = WAL');
    $pdo->exec('PRAGMA busy_timeout = 3000');
    $pdo->exec('CREATE TABLE IF NOT EXISTS runs (
        id          TEXT PRIMARY KEY,
        nick        TEXT NOT NULL,
        started_at  INTEGER NOT NULL,
        finished_at INTEGER,
        score       INTEGER,
        stage       INTEGER,
        ip_hash     TEXT
    )');
    $pdo->exec('CREATE INDEX IF NOT EXISTS idx_runs_score ON runs(score DESC)');
    $pdo->exec('CREATE INDEX IF NOT EXISTS idx_runs_ip ON runs(ip_hash, started_at)');
    return $pdo;
}

function json_out($data, int $code = 200): never
{
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function fail(string $msg, int $code = 400): never
{
    json_out(['error' => $msg], $code);
}

function require_method(string $method): void
{
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== $method) fail('Método não permitido', 405);
}

function json_in(): array
{
    $raw = file_get_contents('php://input', false, null, 0, 32768);
    $data = json_decode($raw ?: '', true);
    return is_array($data) ? $data : [];
}

function secret(): string
{
    $file = DATA_DIR . '/secret.key';
    if (!is_file($file)) {
        if (!is_dir(DATA_DIR)) mkdir(DATA_DIR, 0775, true);
        file_put_contents($file, bin2hex(random_bytes(32)), LOCK_EX);
        @chmod($file, 0600);
    }
    return trim((string) file_get_contents($file));
}

/** Hash do IP com sal secreto que muda por dia: serve só para limitar abuso, não identifica ninguém depois. */
function ip_hash(): string
{
    $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    return hash('sha256', $ip . '|' . gmdate('Y-m-d') . '|' . secret());
}

function base_url(): string
{
    if (PUBLIC_URL !== '') return rtrim(PUBLIC_URL, '/');
    $https = ($_SERVER['HTTPS'] ?? '') === 'on' || ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https';
    $host = preg_replace('/[^A-Za-z0-9.\-:\[\]]/', '', $_SERVER['HTTP_HOST'] ?? 'localhost');
    $path = rtrim(str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? '/')), '/');
    if (str_ends_with($path, '/api')) $path = substr($path, 0, -4);
    return ($https ? 'https' : 'http') . '://' . $host . $path;
}

function valid_run_id(string $id): bool
{
    return (bool) preg_match('/^[a-f0-9]{32}$/', $id);
}

function fmt_score(int $n): string
{
    return number_format($n, 0, ',', '.');
}

/* ---------------- Apelidos ---------------- */

function nick_error(string $nick): ?string
{
    if (!preg_match('/^[A-Z0-9_]{3,12}$/', $nick)) return 'Use de 3 a 12 caracteres (A-Z, 0-9, _)';
    // normaliza leetspeak simples antes de checar a lista
    $n = strtr(str_replace('_', '', $nick), ['0' => 'O', '1' => 'I', '3' => 'E', '4' => 'A', '5' => 'S', '7' => 'T', '@' => 'A']);
    $contains = ['PORRA', 'CARALH', 'BUCET', 'PUTA', 'MERDA', 'FODA', 'FODE', 'PIROC', 'XOTA', 'XERECA',
                 'VIAD', 'ARROMBAD', 'CUZAO', 'NAZI', 'HITLER', 'ESTUPR', 'PEDOF'];
    $exact = ['CU', 'FDP', 'PAU', 'PQP', 'VSF', 'TNC', 'KKK'];
    foreach ($contains as $w) if (str_contains($n, $w)) return 'Apelido não permitido';
    if (in_array($n, $exact, true)) return 'Apelido não permitido';
    return null;
}

/* ---------------- Fases (drop-in) ---------------- */

/**
 * Lê levels/level_N/config.json, valida e devolve as fases ordenadas.
 * Pastas com erro são ignoradas (e registradas no log do PHP), para não quebrar o jogo.
 */
function load_levels(): array
{
    $levels = [];
    foreach (glob(LEVELS_DIR . '/level_*', GLOB_ONLYDIR) ?: [] as $dir) {
        $id = basename($dir);
        if (!preg_match('/^level_(\d{1,4})$/', $id, $m)) continue;
        try {
            $levels[] = validate_level($dir, $id, (int) $m[1]);
        } catch (InvalidArgumentException $e) {
            error_log("[arcade] fase $id ignorada: " . $e->getMessage());
        }
    }
    usort($levels, fn($a, $b) => [$a['order'], $a['num']] <=> [$b['order'], $b['num']]);
    return $levels;
}

function validate_level(string $dir, string $id, int $num): array
{
    $cfgFile = "$dir/config.json";
    if (!is_file($cfgFile)) throw new InvalidArgumentException('config.json ausente');
    $c = json_decode((string) file_get_contents($cfgFile), true);
    if (!is_array($c)) throw new InvalidArgumentException('config.json inválido: ' . json_last_error_msg());
    foreach (['bg.png', 'enemy.png'] as $f) {
        if (!is_file("$dir/$f")) throw new InvalidArgumentException("$f ausente");
    }

    $num_in = function ($v, string $field, float $min, float $max, bool $int = false) {
        if (!is_int($v) && !is_float($v)) throw new InvalidArgumentException("$field deve ser número");
        if ($int && (float) $v != floor((float) $v)) throw new InvalidArgumentException("$field deve ser inteiro");
        if ($v < $min || $v > $max) throw new InvalidArgumentException("$field fora da faixa $min–$max");
        return $int ? (int) $v : (float) $v;
    };
    $str = function ($v, string $field, int $max, bool $required = true) {
        if ($v === null && !$required) return '';
        if (!is_string($v)) throw new InvalidArgumentException("$field deve ser texto");
        $v = trim($v);
        if ($required && $v === '') throw new InvalidArgumentException("$field vazio");
        if (mb_strlen($v) > $max) throw new InvalidArgumentException("$field passa de $max caracteres");
        return $v;
    };

    $e = $c['enemy'] ?? null;
    $f = $c['formation'] ?? null;
    if (!is_array($e) || !is_array($f)) throw new InvalidArgumentException('faltam os blocos enemy/formation');

    $pattern = $f['pattern'] ?? 'grid';
    if (!in_array($pattern, ['grid', 'zigzag', 'dive'], true)) {
        throw new InvalidArgumentException('formation.pattern deve ser grid, zigzag ou dive');
    }
    $color = $c['color'] ?? '#ffd84f';
    if (!is_string($color) || !preg_match('/^#[0-9a-fA-F]{6}$/', $color)) throw new InvalidArgumentException('color deve ser #RRGGBB');

    $v = filemtime($cfgFile);
    return [
        'id'        => $id,
        'num'       => $num,
        'order'     => isset($c['order']) ? $num_in($c['order'], 'order', 0, 9999, true) : $num,
        'name'      => $str($c['name'] ?? null, 'name', 40),
        'intro'     => $str($c['intro'] ?? null, 'intro', 120, false),
        'color'     => $color,
        'enemy'     => [
            'hp'       => $num_in($e['hp'] ?? null, 'enemy.hp', 1, 10, true),
            'speed'    => $num_in($e['speed'] ?? null, 'enemy.speed', 10, 200),
            'fireRate' => $num_in($e['fireRate'] ?? null, 'enemy.fireRate', 0, 5),
            'points'   => $num_in($e['points'] ?? null, 'enemy.points', 10, 5000, true),
        ],
        'formation' => [
            'rows'    => $num_in($f['rows'] ?? null, 'formation.rows', 1, 6, true),
            'cols'    => $num_in($f['cols'] ?? null, 'formation.cols', 1, 10, true),
            'pattern' => $pattern,
        ],
        'bg'        => "levels/$id/bg.png?v=" . filemtime("$dir/bg.png"),
        'enemyImg'  => "levels/$id/enemy.png?v=" . filemtime("$dir/enemy.png"),
        'v'         => $v,
    ];
}

/**
 * Recalcula a pontuação a partir do log de abates por fase.
 * Mesma fórmula do game.js: pontos × (1 + 0,5 × volta) por abate + 500 × nº da fase por fase concluída.
 * Retorna null se o log for impossível.
 */
function expected_score(array $log, array $levels): ?int
{
    $n = count($levels);
    if ($n === 0 || count($log) === 0 || count($log) > 1000) return null;
    $total = 0;
    $last = count($log) - 1;
    foreach (array_values($log) as $i => $entry) {
        if (!is_array($entry) || ($entry['lv'] ?? null) !== $i || !is_int($entry['k'] ?? null)) return null;
        $lvl = $levels[$i % $n];
        $max = $lvl['formation']['rows'] * $lvl['formation']['cols'];
        $k = $entry['k'];
        if ($k < 0 || $k > $max) return null;
        if ($i < $last && $k !== $max) return null;   // fases anteriores precisam ter sido limpas
        $mult = 1 + 0.5 * intdiv($i, $n);
        $total += $k * (int) round($lvl['enemy']['points'] * $mult);
        if ($i < $last) $total += STAGE_BONUS * ($i + 1);
    }
    return $total;
}
