<?php
declare(strict_types=1);

/**
 * Levante 13: A Virada
 * Página de Compartilhamento Viral & Redirecionamento (Open Graph / WhatsApp)
 * Arquivo: share.php
 * 
 * Funcionalidades:
 * - Lê o parâmetro ?id=[token] e busca a missão no SQLite.
 * - Injeta Meta Tags Open Graph e Twitter Cards para pré-visualização rica.
 * - Exibe a imagem comemorativa gerada em PHP GD.
 * - Fornece botão de chamada para ação direta: [JOGAR AGORA E RESISTIR].
 */

require_once __DIR__ . '/api/db.php';

$token = trim((string)($_GET['id'] ?? ''));
$partida = null;

// Validação de formato do token (alfanumérico, entre 6 e 16 caracteres)
if (!empty($token) && preg_match('/^[a-fA-F0-9]{6,16}$/', $token)) {
    try {
        $pdo = getDbConnection();
        $stmt = $pdo->prepare('SELECT player_name, score, level_reached, created_at FROM leaderboard WHERE share_token = :token LIMIT 1');
        $stmt->bindValue(':token', $token, PDO::PARAM_STR);
        $stmt->execute();
        $partida = $stmt->fetch();
    } catch (Throwable $e) {
        error_log('Erro ao consultar token no share.php: ' . $e->getMessage());
    }
}

// Configuração dos textos e dados para as redes sociais
$dominioBase = 'https://levante13.online';

if ($partida) {
    $nomePiloto = htmlspecialchars((string)$partida['player_name'], ENT_QUOTES, 'UTF-8');
    $pontosFormatados = number_format((int)$partida['score'], 0, ',', '.');
    $frenteAlcancada = (int)$partida['level_reached'];

    $tituloOg = "O piloto {$nomePiloto} garantiu {$pontosFormatados} pts no Levante 13: A Virada!";
    $descricaoOg = "As forças do obscurantismo estão avançando sobre o Brasil! O piloto {$nomePiloto} defendeu a Frente {$frenteAlcancada}. Você consegue virar esse jogo? Jogue agora!";
    $imagemOg = "{$dominioBase}/cards/card_{$token}.png";
} else {
    $tituloOg = "Levante 13: A Virada — O Jogo da Resistência Popular";
    $descricaoOg = "Junte-se à aliança popular e pilote a Vanguarda 13 para defender o Brasil contra o fascismo! Jogue grátis direto no navegador.";
    $imagemOg = "{$dominioBase}/assets/card_template.png";
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title><?= htmlspecialchars($tituloOg, ENT_QUOTES, 'UTF-8') ?></title>

    <!-- Meta Tags Open Graph (WhatsApp, Facebook, Discord, Telegram) -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="<?= htmlspecialchars("{$dominioBase}/share.php?id={$token}", ENT_QUOTES, 'UTF-8') ?>">
    <meta property="og:title" content="<?= htmlspecialchars($tituloOg, ENT_QUOTES, 'UTF-8') ?>">
    <meta property="og:description" content="<?= htmlspecialchars($descricaoOg, ENT_QUOTES, 'UTF-8') ?>">
    <meta property="og:image" content="<?= htmlspecialchars($imagemOg, ENT_QUOTES, 'UTF-8') ?>">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:locale" content="pt_BR">
    <meta property="og:site_name" content="Levante 13: A Virada">

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="<?= htmlspecialchars($tituloOg, ENT_QUOTES, 'UTF-8') ?>">
    <meta name="twitter:description" content="<?= htmlspecialchars($descricaoOg, ENT_QUOTES, 'UTF-8') ?>">
    <meta name="twitter:image" content="<?= htmlspecialchars($imagemOg, ENT_QUOTES, 'UTF-8') ?>">

    <!-- FONTE RETRÔ VCR OSD MONO (https://www.dafont.com/vcr-osd-mono.font) -->
    <link rel="preload" href="assets/fonts/vcr_osd_mono.ttf" as="font" type="font/ttf" crossorigin>
    <link rel="stylesheet" href="https://fonts.cdnfonts.com/css/vcr-osd-mono">

    <style>
        @font-face {
            font-family: 'VCR OSD Mono';
            src: url('assets/fonts/vcr_osd_mono.ttf') format('truetype');
            font-weight: 400;
            font-style: normal;
            font-display: swap;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: 'VCR OSD Mono', monospace, sans-serif;
            border-radius: 0;
        }

        body {
            background-color: #0a0d1a;
            color: #ffffff;
            font-family: 'VCR OSD Mono', monospace, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 20px;
            text-align: center;
            line-height: 1.5;
            -webkit-font-smoothing: antialiased;
        }

        .container {
            max-width: 650px;
            width: 100%;
            background: #121829;
            border: 2px solid #dc2626;
            border-radius: 0;
            padding: 28px 20px;
            box-shadow: 0 10px 30px rgba(220, 38, 38, 0.25);
        }

        .logo-titulo {
            font-size: 1.8rem;
            font-weight: 900;
            color: #facc15;
            letter-spacing: 2px;
            text-transform: uppercase;
            margin-bottom: 6px;
            text-shadow: 0 2px 8px rgba(250, 204, 21, 0.4);
        }

        .subtitulo {
            font-size: 0.95rem;
            color: #38bdf8;
            margin-bottom: 24px;
            letter-spacing: 1px;
            text-transform: uppercase;
        }

        .card-preview {
            width: 100%;
            border-radius: 8px;
            border: 1px solid #38bdf8;
            margin-bottom: 24px;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.6);
            display: block;
        }

        .btn-jogar {
            display: block;
            width: 100%;
            background: linear-gradient(135deg, #dc2626, #b91c1c);
            color: #ffffff;
            text-decoration: none;
            font-size: 1.25rem;
            font-weight: 800;
            padding: 16px 20px;
            border-radius: 8px;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            transition: transform 0.15s ease, box-shadow 0.15s ease;
            box-shadow: 0 4px 15px rgba(220, 38, 38, 0.4);
            border: none;
            cursor: pointer;
        }

        .btn-jogar:hover, .btn-jogar:focus {
            transform: translateY(-2px);
            box-shadow: 0 6px 22px rgba(220, 38, 38, 0.6);
            background: linear-gradient(135deg, #ef4444, #dc2626);
        }

        .rodape {
            margin-top: 24px;
            font-size: 0.8rem;
            color: #94a3b8;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1 class="logo-titulo">LEVANTE 13: A VIRADA</h1>
        <p class="subtitulo">A RESISTÊNCIA POPULAR CONTRA O FASCISMO</p>

        <img src="<?= htmlspecialchars($imagemOg, ENT_QUOTES, 'UTF-8') ?>" 
             alt="Certificado de Resistência do Piloto" 
             class="card-preview">

        <a href="game.html" class="btn-jogar">
            🚀 ENTRAR NO LEVANTE E JOGAR AGORA
        </a>

        <p class="rodape">
            Jogo web 100% gratuito. Não exige instalação ou cadastro.<br>
            Dispute o placar global e defenda o Brasil direto no seu navegador.
        </p>
    </div>
</body>
</html>
