<?php
declare(strict_types=1);

/**
 * Levante 13: A Virada
 * Configurações compartilhadas pela API.
 */

// Endereço público do jogo. Em produção, preencha com o domínio (sem barra no final),
// por exemplo 'https://levante13.online'. Vazio = detecta automaticamente (funciona em localhost).
const URL_PUBLICA = '';

// Avisos do PHP nunca vão para a resposta: corromperiam o JSON e as imagens. Vão para o log.
ini_set('display_errors', '0');
ini_set('log_errors', '1');

/**
 * Endereço base do jogo, com protocolo e domínio, sem barra no final.
 */
function urlBase(): string
{
    if (URL_PUBLICA !== '') {
        return rtrim(URL_PUBLICA, '/');
    }
    $https = ($_SERVER['HTTPS'] ?? '') === 'on' || ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https';
    $host = preg_replace('/[^A-Za-z0-9.\-:\[\]]/', '', $_SERVER['HTTP_HOST'] ?? 'localhost');
    $caminho = rtrim(str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? '/')), '/');
    if (str_ends_with($caminho, '/api')) {
        $caminho = substr($caminho, 0, -4);
    }
    return ($https ? 'https' : 'http') . '://' . $host . $caminho;
}

/**
 * Segredo do servidor, gerado na primeira execução e guardado em database/.segredo
 * (pasta bloqueada para acesso web e ignorada pelo Git). Nunca coloque o segredo no código.
 */
function segredoServidor(): string
{
    $arquivo = __DIR__ . '/../database/.segredo';
    if (!is_file($arquivo)) {
        if (!is_dir(dirname($arquivo))) {
            mkdir(dirname($arquivo), 0755, true);
        }
        file_put_contents($arquivo, bin2hex(random_bytes(32)), LOCK_EX);
        @chmod($arquivo, 0600);
    }
    return trim((string) file_get_contents($arquivo));
}

/**
 * Hash do IP com sal secreto que muda todo dia: serve só para limitar abuso,
 * não permite identificar ninguém (LGPD: minimização de dados).
 */
function hashIp(): string
{
    $ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
    return hash('sha256', $ip . '|' . date('Ymd') . '|' . segredoServidor());
}
