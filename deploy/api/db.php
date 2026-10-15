<?php
declare(strict_types=1);

/**
 * Levante 13: A Virada
 * Módulo de Conexão com o Banco de Dados (SQLite + PDO)
 * 
 * Configurações implementadas:
 * - Modo WAL (Write-Ahead Logging) para alta concorrência de leitura e escrita.
 * - Criação automática da tabela de recordes e índices caso não existam.
 * - Tratamento de exceções sem vazamento de caminhos do servidor.
 */

// Diretório do banco de dados e caminho do arquivo SQLite
const DB_DIR = __DIR__ . '/../database';
const DB_FILE = DB_DIR . '/game.db';

/**
 * Retorna uma instância PDO configurada e segura para o SQLite.
 *
 * @throws RuntimeException Caso não seja possível inicializar a conexão.
 */
function getDbConnection(): PDO
{
    static $pdo = null;

    if ($pdo instanceof PDO) {
        return $pdo;
    }

    // Garante que o diretório do banco de dados exista com permissões adequadas
    if (!is_dir(DB_DIR)) {
        if (!mkdir(DB_DIR, 0755, true) && !is_dir(DB_DIR)) {
            error_log('Falha ao criar o diretório do banco de dados: ' . DB_DIR);
            throw new RuntimeException('Erro interno na infraestrutura de dados.');
        }
    }

    try {
        $dsn = 'sqlite:' . DB_FILE;
        $pdo = new PDO($dsn, null, null, [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
            PDO::ATTR_TIMEOUT            => 5, // Limite de 5 segundos para evitar bloqueios
        ]);

        // Ativação do modo WAL (Write-Ahead Logging) para permitir leituras concorrentes
        $pdo->exec('PRAGMA journal_mode = WAL;');
        
        // Habilita verificação de integridade e chaves estrangeiras
        $pdo->exec('PRAGMA foreign_keys = ON;');

        // Inicializa a estrutura de tabelas caso seja a primeira execução
        inicializarEstruturaBanco($pdo);

        return $pdo;
    } catch (PDOException $e) {
        error_log('Erro na conexão PDO com SQLite: ' . $e->getMessage());
        throw new RuntimeException('Falha ao conectar com a base de dados do Levante 13.');
    }
}

/**
 * Cria a tabela de recordes e os índices de alta performance se não existirem.
 */
function inicializarEstruturaBanco(PDO $pdo): void
{
    // Tabela do Placar Global do Levante
    $sqlTabela = <<<SQL
    CREATE TABLE IF NOT EXISTS leaderboard (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        player_name TEXT NOT NULL,
        score INTEGER NOT NULL,
        level_reached INTEGER NOT NULL,
        share_token TEXT UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    SQL;

    // Índice decrescente no score para consultas imediatas do TOP 10
    $sqlIndice = <<<SQL
    CREATE INDEX IF NOT EXISTS idx_leaderboard_score 
    ON leaderboard (score DESC, created_at ASC);
    SQL;

    // Tabela efêmera para controle de taxa (Rate Limit) em conformidade com a LGPD
    // Armazena apenas o hash com sal do IP por tempo determinado, sem dados pessoais
    $sqlRateLimit = <<<SQL
    CREATE TABLE IF NOT EXISTS rate_limits (
        ip_hash TEXT PRIMARY KEY,
        last_submission INTEGER NOT NULL
    );
    SQL;

    // Tabela de Codinomes Protegidos com PIN numérico de 4 dígitos (Urna)
    $sqlPlayers = <<<SQL
    CREATE TABLE IF NOT EXISTS players (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        codename TEXT UNIQUE COLLATE NOCASE NOT NULL,
        pin_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_played DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_players_codename 
    ON players (codename COLLATE NOCASE);
    SQL;

    $pdo->exec($sqlTabela);
    $pdo->exec($sqlIndice);
    $pdo->exec($sqlRateLimit);
    $pdo->exec($sqlPlayers);
}
