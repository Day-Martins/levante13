<?php
$im = imagecreatetruecolor(72, 48);
imagealphablending($im, false);
imagesavealpha($im, true);
$transparent = imagecolorallocatealpha($im, 0, 0, 0, 127);
imagefilledrectangle($im, 0, 0, 71, 47, $transparent);
$red = imagecolorallocate($im, 255, 0, 0);
imagefilledrectangle($im, 10, 10, 60, 30, $red);
imagepng($im, 'scratch/test_boss.png');
imagedestroy($im);
echo "OK: file size " . filesize('scratch/test_boss.png') . "\n";
