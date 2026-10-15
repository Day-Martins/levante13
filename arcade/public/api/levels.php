<?php
declare(strict_types=1);
require __DIR__ . '/lib.php';

require_method('GET');
$levels = array_map(function ($l) {
    unset($l['num'], $l['v']);
    return $l;
}, load_levels());

header('Cache-Control: public, max-age=60');
header('Content-Type: application/json; charset=utf-8');
echo json_encode($levels, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
