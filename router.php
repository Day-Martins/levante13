<?php
/**
 * Levante 13: A Virada
 * Roteador do servidor de desenvolvimento (php -S), usado pelo dev-p.sh.
 *
 * O servidor embutido do PHP ignora os arquivos .htaccess. Sem este roteador,
 * o banco (database/game.db) e o segredo do servidor poderiam ser baixados pelo navegador.
 * Em produção com Apache, as regras equivalentes estão nos .htaccess de cada pasta.
 */

$caminho = rawurldecode(parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/');

$bloqueado =
    preg_match('#^/database(/|$)#i', $caminho) ||                    // banco de dados e segredo
    preg_match('#/\.#', $caminho) ||                                 // arquivos ocultos (.git, .htaccess, .segredo)
    preg_match('#^/(cards|levels)/.*\.(php|phtml|phar)$#i', $caminho) || // scripts em pastas de mídia
    preg_match('#\.(sh|md|sqlite3?|db|wal|shm)$#i', $caminho) ||     // scripts e bancos em qualquer lugar
    preg_match('#^/router\.php$#i', $caminho);

if ($bloqueado) {
    http_response_code(403);
    header('Content-Type: text/plain; charset=utf-8');
    echo 'Acesso negado.';
    return true;
}

return false; // segue o fluxo normal do php -S (arquivos estáticos e scripts .php)
