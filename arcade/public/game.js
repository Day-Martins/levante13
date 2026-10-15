/* Astro Arcade — shoot 'em up vertical em Canvas 2D + JS puro.
 * Resolução lógica fixa 360x640 (9:16), escalada para qualquer tela.
 * A fórmula de pontuação aqui DEVE bater com api/score.php (validação no servidor).
 */
(() => {
  'use strict';

  // ---------- Configuração geral ----------
  const W = 360, H = 640;
  const START_LIVES = 3;
  const STAGE_BONUS = 500;          // bônus = 500 × número da fase concluída
  const FIRE_DELAY = 0.28;          // segundos entre tiros automáticos
  const PLAYER_SPEED = 230;         // px/s no teclado
  const DRAG_SENSITIVITY = 1.25;

  const $ = (s) => document.querySelector(s);
  const stageEl = $('#stage');
  const canvas = $('#game');
  const ctx = canvas.getContext('2d');
  let viewScale = 1;

  function fit() {
    const s = Math.min(innerWidth / W, innerHeight / H);
    viewScale = s;
    stageEl.style.width = Math.floor(W * s) + 'px';
    stageEl.style.height = Math.floor(H * s) + 'px';
    stageEl.style.fontSize = (12.5 * s).toFixed(2) + 'px';
    const k = Math.max(1, Math.ceil(s * (window.devicePixelRatio || 1)));
    canvas.width = W * k;
    canvas.height = H * k;
    ctx.setTransform(k, 0, 0, k, 0, 0);
    ctx.imageSmoothingEnabled = false;
  }
  addEventListener('resize', fit);
  fit();

  // ---------- API (pode ser substituída por window.GAME_API, ex.: modo demo) ----------
  async function http(method, url, body) {
    const r = await fetch(url, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : {},
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw Object.assign(new Error(data.error || 'Erro de comunicação'), { status: r.status });
    return data;
  }
  const API = window.GAME_API || {
    levels: () => http('GET', 'api/levels.php'),
    start: (nick) => http('POST', 'api/start.php', { nick }),
    submit: (payload) => http('POST', 'api/score.php', payload),
    leaderboard: () => http('GET', 'api/leaderboard.php'),
  };

  // ---------- Utilidades ----------
  const fmt = (n) => Math.round(n).toLocaleString('pt-BR');
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rand = (a, b) => a + Math.random() * (b - a);

  function loadImg(src) {
    return new Promise((res) => {
      if (!src) return res(null);
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = () => res(null);
      i.src = src;
    });
  }

  function sprite(rows, color, px = 2) {
    const c = document.createElement('canvas');
    c.width = rows[0].length * px; c.height = rows.length * px;
    const g = c.getContext('2d');
    g.fillStyle = color;
    rows.forEach((row, y) => [...row].forEach((ch, x) => { if (ch === 'X') g.fillRect(x * px, y * px, px, px); }));
    return c;
  }
  const SHIP = sprite([
    '.....X.....',
    '....XXX....',
    '....XXX....',
    '..X.XXX.X..',
    '.XXXXXXXXX.',
    'XXXXXXXXXXX',
    'XX.XXXXX.XX',
    'X...X.X...X',
  ], '#5ef2ff');
  const SHIP_MINI = sprite([
    '..X..', '.XXX.', 'XXXXX', 'X.X.X',
  ], '#5ef2ff', 2);

  // ---------- Som (WebAudio, sem arquivos) ----------
  let audio = null, muted = false;
  function initAudio() {
    if (audio) return;
    try { audio = new (window.AudioContext || window.webkitAudioContext)(); } catch (_) { audio = null; }
  }
  function sfx(kind) {
    if (!audio || muted) return;
    const t = audio.currentTime;
    const o = audio.createOscillator(), g = audio.createGain();
    o.connect(g); g.connect(audio.destination);
    const presets = {
      shot: ['square', 880, 440, 0.06, 0.03],
      hit:  ['square', 300, 200, 0.05, 0.04],
      boom: ['sawtooth', 160, 40, 0.18, 0.06],
      hurt: ['sawtooth', 220, 30, 0.45, 0.09],
      dive: ['triangle', 900, 300, 0.3, 0.04],
      clear:['square', 523, 1046, 0.35, 0.05],
    };
    const [type, f0, f1, dur, vol] = presets[kind] || presets.hit;
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.start(t); o.stop(t + dur);
  }

  // ---------- Estado ----------
  let state = 'loading'; // loading | menu | intro | play | over
  let levels = [];
  const params = new URLSearchParams(location.search);
  const challenge = (() => {
    const alvo = parseInt(params.get('alvo') || '', 10);
    const de = (params.get('de') || '').toUpperCase().replace(/[^A-Z0-9_]/g, '').slice(0, 12);
    return alvo > 0 && de ? { score: alvo, nick: de } : null;
  })();

  const G = {
    nick: '', token: null, stage: 0, score: 0, lives: START_LIVES, kills: 0,
    log: [], time: 0, introT: 0, shake: 0, bgY: 0,
    enemies: [], bullets: [], ebullets: [], particles: [], stars: [],
  };
  const P = { x: W / 2, y: H - 70, fireT: 0, inv: 0 };
  let F = null; // formação atual

  for (let i = 0; i < 60; i++) G.stars.push({ x: rand(0, W), y: rand(0, H), s: rand(0.5, 1.8), v: rand(10, 50) });

  const curLevel = () => levels[G.stage % levels.length];
  const loop = () => Math.floor(G.stage / levels.length);
  const mult = () => 1 + 0.5 * loop();       // multiplicador de pontos a cada volta completa
  const speedMul = () => 1 + 0.2 * loop();   // dificuldade a cada volta completa

  // ---------- Input ----------
  const keys = {};
  addEventListener('keydown', (e) => {
    keys[e.code] = true;
    if (e.code === 'KeyM') muted = !muted;
    if (e.code === 'KeyF' && document.activeElement !== nickInput) toggleFullscreen();
  });
  addEventListener('keyup', (e) => { keys[e.code] = false; });

  let drag = null;
  canvas.addEventListener('pointerdown', (e) => {
    drag = { x: e.clientX };
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const dx = (e.clientX - drag.x) / viewScale;
    drag.x = e.clientX;
    if (state === 'play' || state === 'intro') P.x = clamp(P.x + dx * DRAG_SENSITIVITY, 14, W - 14);
  });
  const endDrag = () => { drag = null; };
  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);

  // ---------- Tela cheia ----------
  const fsEl = document.documentElement;
  const canFullscreen = !!(fsEl.requestFullscreen || fsEl.webkitRequestFullscreen);
  function toggleFullscreen() {
    if (!canFullscreen) return;
    const isFs = document.fullscreenElement || document.webkitFullscreenElement;
    try {
      if (isFs) (document.exitFullscreen || document.webkitExitFullscreen).call(document);
      else (fsEl.requestFullscreen || fsEl.webkitRequestFullscreen).call(fsEl);
    } catch (_) { /* navegador recusou */ }
  }
  document.addEventListener('fullscreenchange', fit);
  document.addEventListener('webkitfullscreenchange', fit);

  // ---------- Fases ----------
  function spawnStage() {
    const lvl = curLevel();
    const { rows, cols, pattern } = lvl.formation;
    const sx = Math.min(34, (W - 50) / Math.max(1, cols - 1 || 1));
    const sy = 28;
    F = {
      ox: (W - (cols - 1) * sx) / 2, oy: 78, dir: 1, t: 0, sx, sy,
      pattern, total: rows * cols, diveT: 2.2,
    };
    G.enemies = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const e = { r, c, hp: lvl.enemy.hp, x: 0, y: 0, flash: 0, dive: null, alive: true };
        const s = slot(e); e.x = s.x; e.y = s.y;
        G.enemies.push(e);
      }
    }
    G.bullets = []; G.ebullets = []; G.kills = 0;
  }

  function slot(e) {
    let x = F.ox + e.c * F.sx;
    const y = F.oy + e.r * F.sy;
    if (F.pattern === 'zigzag') x += Math.sin(F.t * 2.2 + e.r * 0.9) * 16;
    return { x, y };
  }

  function startIntro() {
    spawnStage();
    G.introT = 2.4;
    state = 'intro';
  }

  // ---------- Atualização ----------
  function update(dt) {
    G.bgY = (G.bgY + 22 * dt) % H;
    for (const s of G.stars) { s.y += s.v * dt; if (s.y > H) { s.y = 0; s.x = rand(0, W); } }
    updateParticles(dt);
    G.shake = Math.max(0, G.shake - dt);

    if (state === 'intro') {
      updatePlayer(dt, false);
      G.introT -= dt;
      if (G.introT <= 0) state = 'play';
      return;
    }
    if (state !== 'play') return;

    G.time += dt;
    updatePlayer(dt, true);
    updateFormation(dt);
    if (state !== 'play') return;
    updateBullets(dt);
    collisions();
    if (state === 'play' && !G.enemies.some((e) => e.alive)) stageClear();
  }

  function updatePlayer(dt, canShoot) {
    let dir = 0;
    if (keys.ArrowLeft || keys.KeyA) dir -= 1;
    if (keys.ArrowRight || keys.KeyD) dir += 1;
    P.x = clamp(P.x + dir * PLAYER_SPEED * dt, 14, W - 14);
    P.inv = Math.max(0, P.inv - dt);
    P.fireT -= dt;
    if (canShoot && P.fireT <= 0) {
      G.bullets.push({ x: P.x, y: P.y - 12, vy: -440 });
      P.fireT = FIRE_DELAY;
      sfx('shot');
    }
  }

  function updateFormation(dt) {
    const lvl = curLevel(), sm = speedMul();
    const alive = G.enemies.filter((e) => e.alive);
    const frac = 1 - alive.length / F.total;
    const v = lvl.enemy.speed * sm * (1 + frac * 1.6); // acelera conforme a formação diminui
    F.t += dt;
    F.ox += F.dir * v * dt;

    let minX = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const e of alive) {
      if (e.dive) continue;
      const s = slot(e);
      minX = Math.min(minX, s.x); maxX = Math.max(maxX, s.x); maxY = Math.max(maxY, s.y);
    }
    const margin = 16, step = F.pattern === 'dive' ? 6 : 12;
    if (F.dir > 0 && maxX > W - margin) { F.dir = -1; F.oy += step; F.ox -= maxX - (W - margin); }
    else if (F.dir < 0 && minX < margin) { F.dir = 1; F.oy += step; F.ox += margin - minX; }

    if (maxY > P.y - 34) { gameOver('INVADIDO!'); return; }

    for (const e of alive) {
      e.flash = Math.max(0, e.flash - dt);
      if (e.dive) updateDive(e, dt, v);
      else { const s = slot(e); e.x = s.x; e.y = s.y; }
    }

    if (F.pattern === 'dive') {
      F.diveT -= dt;
      if (F.diveT <= 0) {
        const cands = alive.filter((e) => !e.dive);
        if (cands.length) { cands[Math.floor(Math.random() * cands.length)].dive = { ph: 'down' }; sfx('dive'); }
        F.diveT = rand(1.6, 3.0) / sm;
      }
    }

    // Tiro inimigo: fireRate = tiros por segundo da formação inteira
    if (alive.length && Math.random() < lvl.enemy.fireRate * sm * dt) {
      const bottom = {};
      for (const e of alive) if (!e.dive && (!bottom[e.c] || e.r > bottom[e.c].r)) bottom[e.c] = e;
      const shooters = Object.values(bottom).concat(alive.filter((e) => e.dive));
      const s = shooters[Math.floor(Math.random() * shooters.length)];
      if (s) G.ebullets.push({ x: s.x, y: s.y + 8, vy: 165 * sm + rand(0, 45) });
    }
  }

  function updateDive(e, dt, v) {
    const d = e.dive;
    if (d.ph === 'down') {
      e.y += (150 + v) * dt;
      e.x += clamp((P.x - e.x) * 1.5, -95, 95) * dt;
      if (e.y > H + 20) { d.ph = 'back'; e.y = -20; }
    } else {
      const s = slot(e);
      const dx = s.x - e.x, dy = s.y - e.y, dist = Math.hypot(dx, dy), sp = 210 * dt;
      if (dist <= sp) { e.dive = null; e.x = s.x; e.y = s.y; }
      else { e.x += (dx / dist) * sp; e.y += (dy / dist) * sp; }
    }
  }

  function updateBullets(dt) {
    for (const b of G.bullets) b.y += b.vy * dt;
    for (const b of G.ebullets) b.y += b.vy * dt;
    G.bullets = G.bullets.filter((b) => b.y > -10 && !b.dead);
    G.ebullets = G.ebullets.filter((b) => b.y < H + 10 && !b.dead);
  }

  function collisions() {
    for (const b of G.bullets) {
      for (const e of G.enemies) {
        if (!e.alive || Math.abs(b.x - e.x) > 12 || Math.abs(b.y - e.y) > 10) continue;
        b.dead = true;
        e.hp -= 1;
        e.flash = 0.08;
        if (e.hp <= 0) killEnemy(e); else sfx('hit');
        break;
      }
    }
    G.bullets = G.bullets.filter((b) => !b.dead);
    if (P.inv > 0) return;
    for (const b of G.ebullets) {
      if (Math.abs(b.x - P.x) < 10 && Math.abs(b.y - P.y) < 9) { b.dead = true; hitPlayer(); return; }
    }
    for (const e of G.enemies) {
      if (e.alive && e.dive && Math.abs(e.x - P.x) < 18 && Math.abs(e.y - P.y) < 14) {
        killEnemy(e); hitPlayer(); return;
      }
    }
  }

  function killEnemy(e) {
    e.alive = false;
    G.kills += 1;
    G.score += Math.round(curLevel().enemy.points * mult());
    burst(e.x, e.y, curLevel().color || '#ffd84f', 14);
    sfx('boom');
  }

  function hitPlayer() {
    G.lives -= 1;
    burst(P.x, P.y, '#5ef2ff', 26);
    G.ebullets = [];
    G.shake = 0.35;
    sfx('hurt');
    if (G.lives <= 0) gameOver('GAME OVER');
    else P.inv = 2;
  }

  function stageClear() {
    G.log.push({ lv: G.stage, k: G.kills });
    G.score += STAGE_BONUS * (G.stage + 1);
    G.stage += 1;
    sfx('clear');
    startIntro();
  }

  // ---------- Partículas ----------
  function burst(x, y, color, n) {
    for (let i = 0; i < n; i++) {
      const a = rand(0, Math.PI * 2), sp = rand(40, 170);
      G.particles.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: rand(0.3, 0.7), color });
    }
  }
  function updateParticles(dt) {
    for (const p of G.particles) { p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.96; p.vy *= 0.96; p.life -= dt; }
    G.particles = G.particles.filter((p) => p.life > 0);
  }

  // ---------- Desenho ----------
  function txt(s, x, y, size, color, align = 'center') {
    ctx.font = `${size}px "Press Start 2P", monospace`;
    ctx.textAlign = align;
    ctx.textBaseline = 'top';
    ctx.fillStyle = 'rgba(0,0,0,0.75)';
    ctx.fillText(s, x + 2, y + 2);
    ctx.fillStyle = color;
    ctx.fillText(s, x, y);
  }

  function wrap(s, maxW, size) {
    ctx.font = `${size}px "Press Start 2P", monospace`;
    const words = s.split(/\s+/), lines = [];
    let line = '';
    for (const w of words) {
      const test = line ? line + ' ' + w : w;
      if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = w; } else line = test;
    }
    if (line) lines.push(line);
    return lines;
  }

  function drawBg() {
    const lvl = levels.length ? (state === 'menu' || state === 'loading' ? levels[0] : curLevel()) : null;
    const img = lvl && lvl._bg;
    ctx.fillStyle = '#07071a';
    ctx.fillRect(0, 0, W, H);
    if (img) {
      ctx.drawImage(img, 0, G.bgY - H, W, H);
      ctx.drawImage(img, 0, G.bgY, W, H);
    }
    ctx.fillStyle = '#ffffff';
    for (const s of G.stars) { ctx.globalAlpha = s.s / 2; ctx.fillRect(s.x, s.y, s.s, s.s); }
    ctx.globalAlpha = 1;
  }

  function draw() {
    ctx.save();
    if (G.shake > 0) ctx.translate(rand(-3, 3), rand(-3, 3));
    drawBg();

    if (state === 'loading') {
      txt('CARREGANDO...', W / 2, H / 2 - 6, 12, '#5ef2ff');
    }
    if (state === 'nolevels') {
      txt('SEM FASES', W / 2, H / 2 - 20, 14, '#ff4f9a');
      txt('verifique a pasta /levels', W / 2, H / 2 + 6, 7, '#8a93b8');
    }

    if (state === 'play' || state === 'intro' || state === 'over') {
      const lvl = curLevel();
      for (const e of G.enemies) {
        if (!e.alive) continue;
        if (lvl._enemy) {
          ctx.drawImage(lvl._enemy, Math.round(e.x - 12), Math.round(e.y - 9), 24, 18);
          if (e.flash > 0) { ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.fillRect(e.x - 12, e.y - 9, 24, 18); }
        } else {
          ctx.fillStyle = e.flash > 0 ? '#fff' : (lvl.color || '#ffd84f');
          ctx.fillRect(e.x - 11, e.y - 8, 22, 16);
        }
      }
      if (state !== 'over' && (P.inv <= 0 || Math.floor(P.inv * 12) % 2 === 0)) {
        ctx.drawImage(SHIP, Math.round(P.x - 11), Math.round(P.y - 8));
      }
      ctx.fillStyle = '#ffffff';
      for (const b of G.bullets) ctx.fillRect(b.x - 1, b.y - 6, 2, 8);
      ctx.fillStyle = '#ff4f9a';
      for (const b of G.ebullets) ctx.fillRect(b.x - 2, b.y - 4, 4, 8);
      for (const p of G.particles) {
        ctx.globalAlpha = clamp(p.life * 2, 0, 1);
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x - 1.5, p.y - 1.5, 3, 3);
      }
      ctx.globalAlpha = 1;
      drawHud();
    }

    if (state === 'intro') {
      const lvl = curLevel();
      const lp = loop();
      txt('FASE ' + (G.stage + 1), W / 2, H / 2 - 96, 24, '#ffd84f');
      txt(lvl.name.toUpperCase(), W / 2, H / 2 - 56, 12, '#5ef2ff');
      if (lp > 0) txt('PONTOS x' + mult().toFixed(1).replace('.', ','), W / 2, H / 2 - 32, 10, '#ff4f9a');
      const lines = wrap(lvl.intro || '', W - 50, 10);
      lines.forEach((l, i) => txt(l, W / 2, H / 2 + 110 + i * 18, 10, '#e8f6ff'));
    }
    ctx.restore();
  }

  function drawHud() {
    txt(fmt(G.score), 10, 10, 15, '#e8f6ff', 'left');
    txt('FASE ' + (G.stage + 1), W - 10, 11, 12, '#ffd84f', 'right');
    for (let i = 0; i < G.lives; i++) ctx.drawImage(SHIP_MINI, 10 + i * 18, 34, 15, 12);
    if (challenge) {
      const beat = G.score > challenge.score;
      txt((beat ? 'SUPEROU ' : 'ALVO ') + fmt(challenge.score), W / 2, 36, 9, beat ? '#7dff8a' : '#ff4f9a');
    }
  }

  // ---------- Loop principal ----------
  let last = 0;
  function frame(t) {
    const dt = Math.min(0.033, (t - last) / 1000 || 0);
    last = t;
    update(dt);
    draw();
    requestAnimationFrame(frame);
  }

  // ---------- Telas (menu / game over) ----------
  const menuEl = $('#menu'), overEl = $('#over');
  const nickInput = $('#nick'), nickErr = $('#nickErr'), btnPlay = $('#btnPlay');

  function sanitizeNick(v) { return v.toUpperCase().replace(/[^A-Z0-9_]/g, '').slice(0, 12); }
  nickInput.addEventListener('input', () => {
    const v = sanitizeNick(nickInput.value);
    if (v !== nickInput.value) nickInput.value = v;
    nickErr.textContent = '';
  });
  try { nickInput.value = localStorage.getItem('arcade_nick') || ''; } catch (_) { /* sem storage */ }

  if (challenge) {
    const el = $('#challenge');
    el.textContent = `${challenge.nick} fez ${fmt(challenge.score)} pts. Você consegue bater esse recorde?`;
    el.hidden = false;
  }

  async function refreshBoard() {
    const ol = $('#board');
    try {
      const rows = await API.leaderboard();
      ol.innerHTML = '';
      if (!rows.length) { ol.innerHTML = '<li class="muted">seja o primeiro!</li>'; return; }
      rows.slice(0, 10).forEach((r, i) => {
        const li = document.createElement('li');
        const pos = document.createElement('span'); pos.className = 'pos'; pos.textContent = (i + 1) + '.';
        const nick = document.createElement('span'); nick.className = 'nick'; nick.textContent = r.nick;
        const sc = document.createElement('span'); sc.textContent = fmt(r.score);
        li.append(pos, nick, sc);
        ol.append(li);
      });
    } catch (_) {
      ol.innerHTML = '<li class="muted">ranking indisponível</li>';
    }
  }

  function showMenu() {
    state = 'menu';
    overEl.hidden = true;
    menuEl.hidden = false;
    refreshBoard();
  }

  async function startGame() {
    const nick = sanitizeNick(nickInput.value);
    if (nick.length < 3) { nickErr.textContent = 'Use de 3 a 12 caracteres (A-Z, 0-9, _)'; return; }
    initAudio();
    if (audio && audio.state === 'suspended') audio.resume();
    btnPlay.disabled = true; $('#btnAgain').disabled = true;
    G.token = null;
    try {
      const r = await API.start(nick);
      G.token = r.token;
    } catch (e) {
      btnPlay.disabled = false; $('#btnAgain').disabled = false;
      if (e.status) { nickErr.textContent = e.message; if (state === 'over') showMenu(); return; }
      // sem rede: deixa jogar, mas sem ranking
    }
    btnPlay.disabled = false; $('#btnAgain').disabled = false;
    try { localStorage.setItem('arcade_nick', nick); } catch (_) { /* ok */ }
    Object.assign(G, { nick, stage: 0, score: 0, lives: START_LIVES, kills: 0, log: [], time: 0, particles: [] });
    Object.assign(P, { x: W / 2, fireT: 0.5, inv: 0 });
    menuEl.hidden = true;
    overEl.hidden = true;
    startIntro();
  }
  $('#nickForm').addEventListener('submit', (e) => { e.preventDefault(); startGame(); });
  $('#btnAgain').addEventListener('click', startGame);
  $('#btnMenu').addEventListener('click', showMenu);
  const btnFs = $('#btnFs');
  if (canFullscreen) { btnFs.hidden = false; btnFs.addEventListener('click', toggleFullscreen); }

  let shareData = null;
  async function gameOver(title) {
    if (state === 'over') return;
    state = 'over';
    G.log.push({ lv: G.stage, k: G.kills });
    $('#ovTitle').textContent = title;
    $('#ovScore').textContent = fmt(G.score);
    const info = $('#ovInfo'), card = $('#ovCard'), btnShare = $('#btnShare');
    card.hidden = true; btnShare.hidden = true; shareData = null;
    info.textContent = 'Fase ' + (G.stage + 1);
    setTimeout(() => { if (state === 'over') overEl.hidden = false; }, 900);
    if (!G.token) { info.textContent = 'Sem conexão: pontuação não registrada'; return; }
    info.textContent = 'Registrando recorde…';
    try {
      const r = await API.submit({ token: G.token, score: G.score, log: G.log });
      info.textContent = `#${r.rank} no ranking · Fase ${G.stage + 1}`;
      shareData = {
        url: r.shareUrl,
        text: `${G.nick} fez ${fmt(G.score)} pts na Fase ${G.stage + 1}! Você consegue bater esse recorde?`,
      };
      if (r.cardUrl) {
        card.onload = () => { card.hidden = false; };
        card.onerror = () => { card.hidden = true; };
        card.src = r.cardUrl;
      }
      btnShare.hidden = !r.shareUrl;
    } catch (e) {
      info.textContent = e.status === 422 ? 'Partida inválida: pontuação recusada' : 'Não foi possível registrar agora';
    }
  }

  $('#btnShare').addEventListener('click', async () => {
    if (!shareData) return;
    if (navigator.share) {
      try { await navigator.share({ title: 'Astro Arcade', text: shareData.text, url: shareData.url }); return; }
      catch (e) { if (e.name === 'AbortError') return; }
    }
    window.open('https://wa.me/?text=' + encodeURIComponent(shareData.text + ' ' + shareData.url), '_blank', 'noopener');
  });

  // ---------- Boot ----------
  async function boot() {
    requestAnimationFrame(frame);
    try { await document.fonts.load('10px "Press Start 2P"'); } catch (_) { /* fallback monospace */ }
    try {
      levels = await API.levels();
    } catch (_) {
      levels = [];
    }
    if (!levels.length) { state = 'nolevels'; return; }
    await Promise.all(levels.map(async (l) => {
      [l._bg, l._enemy] = await Promise.all([loadImg(l.bg), loadImg(l.enemyImg)]);
    }));
    showMenu();
  }
  boot();
})();
