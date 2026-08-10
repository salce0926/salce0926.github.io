'use strict';

/* =========================================================
   スイカフォール
   円だけの簡易剛体シミュレーション + 合体パズル
   ========================================================= */

/* ---------------- 果物定義 ---------------- */
// r: 半径(px, 論理座標). kind: 描き分け用のパターン名
const FRUITS = [
  { name: 'さくらんぼ',   r: 12, color: '#e2404a', light: '#ff8f92', dark: '#a3202b', kind: 'cherry' },
  { name: 'いちご',       r: 16, color: '#e8384f', light: '#ff97a6', dark: '#a81f37', kind: 'strawberry' },
  { name: 'ぶどう',       r: 22, color: '#8e44ad', light: '#c489dc', dark: '#5c2477', kind: 'grape' },
  { name: 'デコポン',     r: 27, color: '#f39c12', light: '#ffd06a', dark: '#b06c00', kind: 'dekopon' },
  { name: 'かき',         r: 33, color: '#e2701e', light: '#ffb268', dark: '#a24a06', kind: 'persimmon' },
  { name: 'りんご',       r: 39, color: '#d2372f', light: '#ff8a72', dark: '#8f1c17', kind: 'apple' },
  { name: 'なし',         r: 46, color: '#c3d24a', light: '#eaf58f', dark: '#8a9a1e', kind: 'pear' },
  { name: 'もも',         r: 53, color: '#f5a0b8', light: '#ffd6e2', dark: '#c06a83', kind: 'peach' },
  { name: 'パイナップル', r: 62, color: '#efc019', light: '#ffe37a', dark: '#a98505', kind: 'pineapple' },
  { name: 'メロン',       r: 72, color: '#a4d24a', light: '#d9f2a0', dark: '#6f9a20', kind: 'melon' },
  { name: 'スイカ',       r: 84, color: '#2f8b3f', light: '#63c46f', dark: '#175a25', kind: 'watermelon' },
];
const LAST = FRUITS.length - 1;

/* ---------------- ステージ定数 ---------------- */
const W = 400;            // 論理幅
const H = 580;            // 論理高さ
const WALL = 10;          // 壁の厚み
const LEFT = WALL;
const RIGHT = W - WALL;
const FLOOR = H - WALL;
const DEAD_Y = 108;       // デッドライン
const SPAWN_Y = 58;       // 落とす前の待機位置

/* ---------------- 物理定数（1ステップ = 1/60秒 前提） ---------------- */
const STEP = 1 / 60;
const GRAVITY = 0.34;
const AIR = 0.999;
const REST = 0.10;          // 反発係数
const FRICTION = 0.24;      // 接線摩擦
const GROUND_FRICTION = 0.93;
const ITERATIONS = 14;      // 位置補正の反復回数
const DROP_COOLDOWN = 0.30; // 連打防止(秒)
const OVER_LIMIT = 1.3;     // デッドライン滞在の許容時間(秒)
const SPAWN_GRACE = 40;     // 落下直後の判定猶予(フレーム)
const COMBO_WINDOW = 0.45;  // 連鎖とみなす間隔(秒)
const COMBO_MAX_MULT = 4;   // コンボ倍率の上限
const MERGE_SLOP = 2;       // 接触しているとみなす余裕(px)。これが無いと横並びで静止した同種が合体しない

/* ---------------- DOM ---------------- */
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const nextCanvas = document.getElementById('nextCanvas');
const nextCtx = nextCanvas.getContext('2d');
const scoreEl = document.getElementById('score');
const bestEl = document.getElementById('best');
const comboEl = document.getElementById('combo');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlayTitle');
const overlayScore = document.getElementById('overlayScore');
const overlayNote = document.getElementById('overlayNote');
const retryButton = document.getElementById('retryButton');
const resetButton = document.getElementById('resetButton');
const soundButton = document.getElementById('soundButton');
const chainEl = document.getElementById('chain');

/* ---------------- 状態 ---------------- */
let fruits = [];
let particles = [];
let popups = [];
let score = 0;
let best = 0;
let combo = 0;
let comboTimer = 0;
let shownCombo = -1;
let current = null;   // 手持ち
let nextType = 0;     // 次
let aimX = W / 2;
let cooldown = 0;
let gameover = false;
let dangerLevel = 0;  // 0..1 デッドライン警告の強さ
let unlocked = 0;     // これまでに作った最大の果物
let seq = 0;

const BEST_KEY = 'suicaFall.best';
const SOUND_KEY = 'suicaFall.sound';

/* =========================================================
   セットアップ
   ========================================================= */
function setupCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const ndpr = dpr;
  nextCanvas.width = 64 * ndpr;
  nextCanvas.height = 64 * ndpr;
  nextCtx.setTransform(ndpr, 0, 0, ndpr, 0, 0);
}

function loadBest() {
  const v = parseInt(localStorage.getItem(BEST_KEY) || '0', 10);
  best = Number.isFinite(v) ? v : 0;
  bestEl.textContent = best;
}

function saveBest() {
  if (score > best) {
    best = score;
    localStorage.setItem(BEST_KEY, String(best));
    bestEl.textContent = best;
    return true;
  }
  return false;
}

/* =========================================================
   果物の生成
   ========================================================= */
function randType() {
  // 小さいものほど出やすい（0〜4）
  const w = [30, 26, 20, 14, 10];
  let total = 0;
  for (const x of w) total += x;
  let r = Math.random() * total;
  for (let i = 0; i < w.length; i++) {
    r -= w[i];
    if (r < 0) return i;
  }
  return 0;
}

function makeFruit(type, x, y) {
  const r = FRUITS[type].r;
  return {
    id: ++seq,
    type, x, y, r,
    vx: 0, vy: 0,
    px: x,
    contact: false,
    angle: (Math.random() - 0.5) * 0.3, // ほぼ正面向き。傾きは転がった結果だけで付く
    angVel: 0,
    mass: r * r,
    age: 0,
    overTime: 0,
    pop: 0,       // 出現演出用
    dead: false,
  };
}

function mergeScore(type) {
  // 合体して生まれた果物の種類に応じた得点（本家準拠）
  return (type * (type + 1)) / 2;
}

/* =========================================================
   入力
   ========================================================= */
function pointerX(e) {
  const rect = canvas.getBoundingClientRect();
  return ((e.clientX - rect.left) / rect.width) * W;
}

function clampAim(x, r) {
  return Math.max(LEFT + r, Math.min(RIGHT - r, x));
}

function updateAim(x) {
  aimX = clampAim(x, current ? current.r : 12);
}

canvas.addEventListener('pointermove', (e) => {
  if (gameover) return;
  updateAim(pointerX(e));
});

canvas.addEventListener('pointerdown', (e) => {
  if (gameover) return;
  updateAim(pointerX(e));
});

canvas.addEventListener('pointerup', (e) => {
  if (gameover) return;
  updateAim(pointerX(e));
  drop();
});

canvas.addEventListener('pointercancel', () => { /* 何もしない */ });

// キーボード操作
window.addEventListener('keydown', (e) => {
  if (gameover) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); resetGame(); }
    return;
  }
  const stepX = e.shiftKey ? 24 : 8;
  if (e.key === 'ArrowLeft') { updateAim(aimX - stepX); e.preventDefault(); }
  else if (e.key === 'ArrowRight') { updateAim(aimX + stepX); e.preventDefault(); }
  else if (e.key === ' ' || e.key === 'ArrowDown' || e.key === 'Enter') { drop(); e.preventDefault(); }
});

retryButton.addEventListener('click', resetGame);
resetButton.addEventListener('click', resetGame);

function drop() {
  if (gameover || cooldown > 0 || !current) return;
  const f = makeFruit(current.type, clampAim(aimX, current.r), SPAWN_Y);
  f.vy = 1.5;
  fruits.push(f);
  playDrop();

  current = { type: nextType, r: FRUITS[nextType].r };
  nextType = randType();
  aimX = clampAim(aimX, current.r);
  cooldown = DROP_COOLDOWN;
  drawNext();
}

/* =========================================================
   物理
   ========================================================= */
function integrate() {
  for (const f of fruits) {
    f.vy += GRAVITY;
    f.vx *= AIR;
    f.vy *= AIR;
    f.px = f.x; // このステップで実際に動いた量を測るため
    f.x += f.vx;
    f.y += f.vy;
    f.contact = false;

    // 空中での回転は慣性のみ。接触中の回転は applyRolling() が担当する
    f.angVel *= 0.94;
    if (Math.abs(f.angVel) < 0.002) f.angVel = 0;

    f.age++;
    if (f.pop > 0) f.pop = Math.max(0, f.pop - 0.08);
  }
}

function solveWalls(applyImpulse) {
  for (const f of fruits) {
    if (f.x - f.r < LEFT) {
      f.x = LEFT + f.r;
      f.contact = true;
      if (applyImpulse && f.vx < 0) {
        f.vx *= -REST;
        f.vy *= GROUND_FRICTION;
      }
    } else if (f.x + f.r > RIGHT) {
      f.x = RIGHT - f.r;
      f.contact = true;
      if (applyImpulse && f.vx > 0) {
        f.vx *= -REST;
        f.vy *= GROUND_FRICTION;
      }
    }
    if (f.y + f.r > FLOOR) {
      f.y = FLOOR - f.r;
      f.contact = true;
      if (applyImpulse && f.vy > 0) f.vy *= -REST;
      if (applyImpulse) f.vx *= GROUND_FRICTION;
    }
    // 天井は無し。上に飛び出しても戻れるように速度だけ抑える
    if (f.y - f.r < -H) f.y = -H + f.r;
  }
}

function solvePairs(applyImpulse, mergeQueue) {
  for (let i = 0; i < fruits.length; i++) {
    const a = fruits[i];
    if (a.dead) continue;
    for (let j = i + 1; j < fruits.length; j++) {
      const b = fruits[j];
      if (b.dead) continue;

      let dx = b.x - a.x;
      let dy = b.y - a.y;
      let d2 = dx * dx + dy * dy;
      const minD = a.r + b.r;
      // 合体は接触ぎりぎりでも成立させたいので、判定だけ少し広く取る
      const mergeD = a.type === b.type ? minD + MERGE_SLOP : minD;
      if (d2 >= mergeD * mergeD) continue;

      let d = Math.sqrt(d2);
      if (d < 1e-6) { dx = 0; dy = -1; d = 1e-6; }
      const nx = dx / d;
      const ny = dy / d;

      // 合体判定（同種のみ・1ステップにつき1ペアまで登録）
      if (a.type === b.type && mergeQueue && !a.merging && !b.merging) {
        a.merging = b.merging = true;
        mergeQueue.push([a, b]);
        continue;
      }
      if (a.merging || b.merging) continue;
      if (d >= minD) continue;

      a.contact = true;
      b.contact = true;

      const overlap = minD - d;
      const total = a.mass + b.mass;
      // 質量比で押し分けるが、極端な比率だと小さい果物だけが潰れるので上下限を設ける
      let wa = b.mass / total;
      if (wa < 0.2) wa = 0.2; else if (wa > 0.8) wa = 0.8;
      const wb = 1 - wa;
      const corr = overlap * 0.9;
      a.x -= nx * corr * wa;
      a.y -= ny * corr * wa;
      b.x += nx * corr * wb;
      b.y += ny * corr * wb;

      if (!applyImpulse) continue;

      const rvx = b.vx - a.vx;
      const rvy = b.vy - a.vy;
      const vn = rvx * nx + rvy * ny;
      if (vn >= 0) continue;

      const invSum = 1 / a.mass + 1 / b.mass;
      const jn = -(1 + REST) * vn / invSum;
      a.vx -= jn * nx / a.mass;
      a.vy -= jn * ny / a.mass;
      b.vx += jn * nx / b.mass;
      b.vy += jn * ny / b.mass;

      // 接線方向の摩擦
      const tx = -ny;
      const ty = nx;
      const vt = rvx * tx + rvy * ty;
      const jt = -vt * FRICTION / invSum;
      a.vx -= jt * tx / a.mass;
      a.vy -= jt * ty / a.mass;
      b.vx += jt * tx / b.mass;
      b.vy += jt * ty / b.mass;
    }
  }
}

// 接触している果物の回転は「実際に転がった距離」から決める。
// 角速度を独立に積分すると、山の中で押し合う微小な力で
// その場で永久に回り続けてしまうため。
function applyRolling() {
  for (const f of fruits) {
    if (f.contact) {
      f.angle += (f.x - f.px) / f.r;
      f.angVel = 0;
    } else {
      f.angle += f.angVel;
    }
  }
}

function resolveMerges(queue) {
  let loudest = -1; // このステップで鳴らす音は一番大きい果物の1回だけ

  for (const [a, b] of queue) {
    a.dead = true;
    b.dead = true;
    const mx = (a.x * a.mass + b.x * b.mass) / (a.mass + b.mass);
    const my = (a.y * a.mass + b.y * b.mass) / (a.mass + b.mass);

    comboTimer = COMBO_WINDOW;
    combo++;
    const mult = Math.min(COMBO_MAX_MULT, 1 + (combo - 1) * 0.5);

    if (a.type === LAST) {
      // スイカ同士は消滅してボーナス
      const gain = Math.round(66 * mult);
      score += gain;
      burst(mx, my, FRUITS[LAST].color, 34, 5.5);
      addPopup(mx, my, '+' + gain, '#ffe36e', 26);
      loudest = Math.max(loudest, LAST + 2);
      continue;
    }

    const type = a.type + 1;
    const nf = makeFruit(type, mx, my);
    nf.vx = (a.vx * a.mass + b.vx * b.mass) / (a.mass + b.mass) * 0.6;
    nf.vy = (a.vy * a.mass + b.vy * b.mass) / (a.mass + b.mass) * 0.6 - 0.6;
    nf.angle = (a.angle + b.angle) / 2;
    nf.pop = 1;
    nf.age = SPAWN_GRACE; // 合体で生まれたものは即判定対象
    fruits.push(nf);

    const gain = Math.round(mergeScore(type) * mult);
    score += gain;
    if (type > unlocked) { unlocked = type; refreshChain(); }

    burst(mx, my, FRUITS[a.type].light, 12 + type, 2.2 + type * 0.25);
    addPopup(mx, my, '+' + gain, '#fff', 16 + type);
    loudest = Math.max(loudest, type);
  }

  if (queue.length) {
    fruits = fruits.filter((f) => !f.dead);
    scoreEl.textContent = score;
    if (loudest >= 0) playMerge(loudest);
  }
}

/* =========================================================
   更新
   ========================================================= */
function update(dt) {
  if (cooldown > 0) cooldown = Math.max(0, cooldown - dt);

  if (comboTimer > 0) {
    comboTimer -= dt;
    if (comboTimer <= 0) combo = 0;
  }
  if (!gameover) {
    integrate();

    const mergeQueue = [];
    for (let it = 0; it < ITERATIONS; it++) {
      const first = it === 0;
      solvePairs(first, first ? mergeQueue : null);
      solveWalls(first);
    }
    applyRolling();
    resolveMerges(mergeQueue);

    checkGameOver(dt);
  }

  // 表示の同期はこのステップの合体結果を反映してから
  if (combo !== shownCombo) {
    shownCombo = combo;
    comboEl.textContent = combo >= 2 ? 'コンボ ×' + combo : '';
    comboEl.classList.toggle('show', combo >= 2);
  }

  updateEffects(dt);
}

function checkGameOver(dt) {
  let worst = 0;
  for (const f of fruits) {
    if (f.age < SPAWN_GRACE) { f.overTime = 0; continue; }
    if (f.y - f.r < DEAD_Y) {
      f.overTime += dt;
      worst = Math.max(worst, f.overTime / OVER_LIMIT);
      if (f.overTime >= OVER_LIMIT) { endGame(); return; }
    } else if (f.overTime > 0) {
      f.overTime = Math.max(0, f.overTime - dt * 2);
    }
  }
  dangerLevel = Math.min(1, worst);
}

function endGame() {
  gameover = true;
  dangerLevel = 1;
  playGameOver();
  const isBest = saveBest();
  overlayTitle.textContent = 'GAME OVER';
  overlayScore.textContent = 'SCORE ' + score;
  overlayNote.textContent = isBest ? '自己ベスト更新！' : 'BEST ' + best;
  overlay.classList.remove('hidden');
}

function resetGame() {
  saveBest();
  fruits = [];
  particles = [];
  popups = [];
  score = 0;
  combo = 0;
  comboTimer = 0;
  cooldown = 0;
  gameover = false;
  dangerLevel = 0;
  unlocked = 0;
  seq = 0;
  const t = randType();
  current = { type: t, r: FRUITS[t].r };
  nextType = randType();
  aimX = W / 2;
  scoreEl.textContent = '0';
  shownCombo = -1;
  overlay.classList.add('hidden');
  drawNext();
  refreshChain();
}

/* =========================================================
   エフェクト
   ========================================================= */
function burst(x, y, color, count, speed) {
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const s = speed * (0.4 + Math.random() * 0.8);
    particles.push({
      x, y,
      vx: Math.cos(a) * s,
      vy: Math.sin(a) * s - 1,
      r: 2 + Math.random() * 3,
      life: 1,
      color,
    });
  }
}

function addPopup(x, y, text, color, size) {
  popups.push({ x, y, text, color, size, life: 1 });
}

function updateEffects(dt) {
  for (const p of particles) {
    p.vy += 0.25;
    p.x += p.vx;
    p.y += p.vy;
    p.life -= dt * 1.6;
  }
  particles = particles.filter((p) => p.life > 0);

  for (const p of popups) {
    p.y -= 0.8;
    p.life -= dt * 1.2;
  }
  popups = popups.filter((p) => p.life > 0);
}

/* =========================================================
   描画
   ========================================================= */
function render() {
  ctx.clearRect(0, 0, W, H);

  // 背景
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#fffaf0');
  bg.addColorStop(1, '#ffeec9');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // 待機ゾーン
  ctx.fillStyle = 'rgba(0,0,0,0.035)';
  ctx.fillRect(0, 0, W, DEAD_Y);

  drawDeadline();
  drawGuide();

  for (const f of fruits) {
    const scale = 1 + f.pop * 0.18;
    drawFruit(ctx, f.type, f.x, f.y, f.r * scale, f.angle);
  }

  drawHeld();
  drawParticles();
  drawPopups();
  drawFrame();
}

function drawDeadline() {
  const warn = dangerLevel;
  ctx.save();
  ctx.setLineDash([8, 6]);
  ctx.lineWidth = 2;
  const pulse = 0.35 + 0.45 * Math.abs(Math.sin(performance.now() / 220));
  ctx.strokeStyle = warn > 0.02
    ? `rgba(226, 64, 74, ${0.35 + warn * pulse})`
    : 'rgba(200,110,60,0.35)';
  ctx.beginPath();
  ctx.moveTo(WALL, DEAD_Y);
  ctx.lineTo(W - WALL, DEAD_Y);
  ctx.stroke();
  ctx.restore();

  if (warn > 0.02) {
    ctx.save();
    const g = ctx.createLinearGradient(0, DEAD_Y - 40, 0, DEAD_Y);
    g.addColorStop(0, `rgba(226,64,74,0)`);
    g.addColorStop(1, `rgba(226,64,74,${0.28 * warn})`);
    ctx.fillStyle = g;
    ctx.fillRect(WALL, DEAD_Y - 40, W - WALL * 2, 40);
    ctx.restore();
  }
}

function drawGuide() {
  if (gameover || !current) return;
  const r = current.r;
  const x = clampAim(aimX, r);
  ctx.save();
  ctx.setLineDash([5, 7]);
  ctx.lineWidth = 2;
  ctx.strokeStyle = cooldown > 0 ? 'rgba(0,0,0,0.10)' : 'rgba(0,0,0,0.22)';
  ctx.beginPath();
  ctx.moveTo(x, SPAWN_Y + r);
  ctx.lineTo(x, FLOOR - 2);
  ctx.stroke();
  ctx.restore();
}

function drawHeld() {
  if (gameover || !current) return;
  const r = current.r;
  const x = clampAim(aimX, r);
  ctx.save();
  ctx.globalAlpha = cooldown > 0 ? 0.45 : 1;
  drawFruit(ctx, current.type, x, SPAWN_Y, r, 0);
  ctx.restore();
}

function drawParticles() {
  for (const p of particles) {
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawPopups() {
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (const p of popups) {
    ctx.globalAlpha = Math.max(0, Math.min(1, p.life));
    ctx.font = `bold ${p.size}px 'cinecaption', sans-serif`;
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(60,30,10,0.55)';
    ctx.strokeText(p.text, p.x, p.y);
    ctx.fillStyle = p.color;
    ctx.fillText(p.text, p.x, p.y);
  }
  ctx.restore();
  ctx.globalAlpha = 1;
}

function drawFrame() {
  // 壁と床（内側に影）
  ctx.fillStyle = '#8b5e34';
  ctx.fillRect(0, 0, WALL, H);
  ctx.fillRect(W - WALL, 0, WALL, H);
  ctx.fillRect(0, H - WALL, W, WALL);

  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  ctx.fillRect(0, 0, 3, H);
  ctx.fillRect(W - WALL, 0, 3, H);

  ctx.save();
  const s = ctx.createLinearGradient(0, FLOOR - 18, 0, FLOOR);
  s.addColorStop(0, 'rgba(0,0,0,0)');
  s.addColorStop(1, 'rgba(0,0,0,0.10)');
  ctx.fillStyle = s;
  ctx.fillRect(WALL, FLOOR - 18, W - WALL * 2, 18);
  ctx.restore();
}

/* ---------------- 果物の絵 ---------------- */
function drawFruit(g, type, x, y, r, angle) {
  const F = FRUITS[type];
  g.save();
  g.translate(x, y);

  // 落ち影
  g.fillStyle = 'rgba(120,70,30,0.16)';
  g.beginPath();
  g.arc(0, r * 0.12, r, 0, Math.PI * 2);
  g.fill();

  g.rotate(angle);

  const grad = g.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.08, 0, 0, r);
  grad.addColorStop(0, F.light);
  grad.addColorStop(0.65, F.color);
  grad.addColorStop(1, F.dark);
  g.fillStyle = grad;
  g.beginPath();
  g.arc(0, 0, r, 0, Math.PI * 2);
  g.fill();

  g.save();
  g.beginPath();
  g.arc(0, 0, r, 0, Math.PI * 2);
  g.clip();
  drawPattern(g, F, r);
  g.restore();

  // ふち
  g.lineWidth = Math.max(1, r * 0.05);
  g.strokeStyle = F.dark;
  g.globalAlpha = 0.45;
  g.beginPath();
  g.arc(0, 0, r - g.lineWidth / 2, 0, Math.PI * 2);
  g.stroke();
  g.globalAlpha = 1;

  drawStem(g, F, r);
  drawFace(g, r);

  // ハイライト
  g.fillStyle = 'rgba(255,255,255,0.35)';
  g.beginPath();
  g.ellipse(-r * 0.38, -r * 0.42, r * 0.22, r * 0.14, -0.6, 0, Math.PI * 2);
  g.fill();

  g.restore();
}

function drawPattern(g, F, r) {
  switch (F.kind) {
    case 'strawberry': {
      g.fillStyle = 'rgba(255,236,140,0.9)';
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2 + 0.3;
        const rr = r * 0.55;
        g.beginPath();
        g.ellipse(Math.cos(a) * rr, Math.sin(a) * rr, r * 0.07, r * 0.05, a, 0, Math.PI * 2);
        g.fill();
      }
      break;
    }
    case 'grape': {
      g.fillStyle = 'rgba(0,0,0,0.16)';
      const pts = [[-0.4, -0.2], [0.35, -0.3], [0, 0.1], [-0.3, 0.45], [0.4, 0.35]];
      for (const [px, py] of pts) {
        g.beginPath();
        g.arc(px * r, py * r, r * 0.28, 0, Math.PI * 2);
        g.fill();
      }
      break;
    }
    case 'dekopon': {
      // 特徴の「デコ」（上の出っ張り）。顔にかからないよう上端だけに描く
      g.fillStyle = F.light;
      g.beginPath();
      g.arc(0, -r * 0.92, r * 0.34, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = 'rgba(160,90,0,0.28)';
      g.lineWidth = Math.max(1, r * 0.04);
      g.beginPath();
      g.arc(0, -r * 0.92, r * 0.34, 0, Math.PI * 2);
      g.stroke();
      // 下側の皮の質感
      g.fillStyle = 'rgba(160,90,0,0.14)';
      for (let i = 0; i < 10; i++) {
        const a = Math.PI * (0.15 + (i / 10) * 0.7);
        g.beginPath();
        g.arc(Math.cos(a) * r * 0.78, Math.sin(a) * r * 0.78, r * 0.05, 0, Math.PI * 2);
        g.fill();
      }
      break;
    }
    case 'persimmon': {
      g.fillStyle = 'rgba(255,180,90,0.35)';
      g.beginPath();
      g.ellipse(0, r * 0.25, r * 0.75, r * 0.45, 0, 0, Math.PI * 2);
      g.fill();
      break;
    }
    case 'pear': {
      g.fillStyle = 'rgba(120,140,30,0.28)';
      for (let i = 0; i < 14; i++) {
        const a = (i / 14) * Math.PI * 2 * 1.7;
        const rr = r * (0.2 + (i % 5) * 0.15);
        g.beginPath();
        g.arc(Math.cos(a) * rr, Math.sin(a) * rr, r * 0.035, 0, Math.PI * 2);
        g.fill();
      }
      break;
    }
    case 'peach': {
      g.fillStyle = 'rgba(226,64,90,0.22)';
      g.beginPath();
      g.ellipse(-r * 0.35, -r * 0.1, r * 0.5, r * 0.65, 0.2, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = 'rgba(190,80,110,0.4)';
      g.lineWidth = r * 0.05;
      g.beginPath();
      g.moveTo(0, -r);
      g.quadraticCurveTo(r * 0.18, 0, 0, r);
      g.stroke();
      break;
    }
    case 'pineapple': {
      g.strokeStyle = 'rgba(150,105,10,0.4)';
      g.lineWidth = Math.max(1, r * 0.035);
      for (let i = -6; i <= 6; i++) {
        g.beginPath();
        g.moveTo(-r, i * r * 0.28 - r);
        g.lineTo(r, i * r * 0.28 + r);
        g.stroke();
        g.beginPath();
        g.moveTo(-r, -i * r * 0.28 + r);
        g.lineTo(r, -i * r * 0.28 - r);
        g.stroke();
      }
      break;
    }
    case 'melon': {
      g.strokeStyle = 'rgba(255,255,255,0.6)';
      g.lineWidth = Math.max(1, r * 0.04);
      for (let i = 0; i < 5; i++) {
        g.beginPath();
        g.arc(r * (i - 2) * 0.45, r * 0.1, r * 0.72, 0, Math.PI * 2);
        g.stroke();
      }
      for (let i = 0; i < 4; i++) {
        g.beginPath();
        g.arc(0, r * (i - 1.5) * 0.5, r * 0.85, 0, Math.PI * 2);
        g.stroke();
      }
      break;
    }
    case 'watermelon': {
      g.strokeStyle = 'rgba(20,70,25,0.85)';
      g.lineWidth = r * 0.11;
      for (let i = -2; i <= 2; i++) {
        g.beginPath();
        g.moveTo(i * r * 0.45, -r);
        g.quadraticCurveTo(i * r * 0.7, 0, i * r * 0.45, r);
        g.stroke();
      }
      break;
    }
    case 'apple': {
      g.fillStyle = 'rgba(255,240,140,0.18)';
      g.beginPath();
      g.ellipse(r * 0.35, r * 0.15, r * 0.35, r * 0.6, 0.3, 0, Math.PI * 2);
      g.fill();
      break;
    }
    default:
      break;
  }
}

function drawStem(g, F, r) {
  if (r < 14) return;
  const stemKinds = ['cherry', 'strawberry', 'apple', 'grape', 'persimmon', 'dekopon', 'pear', 'peach', 'pineapple'];
  if (!stemKinds.includes(F.kind)) return;

  g.save();
  // ヘタ（緑）
  if (F.kind === 'strawberry' || F.kind === 'persimmon') {
    g.fillStyle = '#4b8b32';
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
      g.beginPath();
      g.ellipse(Math.cos(a) * r * 0.28, -r * 0.78 + Math.sin(a) * r * 0.12,
        r * 0.22, r * 0.1, a, 0, Math.PI * 2);
      g.fill();
    }
  }
  if (F.kind === 'pineapple') {
    g.fillStyle = '#4f9b3a';
    for (let i = -2; i <= 2; i++) {
      g.beginPath();
      g.moveTo(0, -r * 0.6);
      g.quadraticCurveTo(i * r * 0.3, -r * 1.15, i * r * 0.12, -r * 0.55);
      g.fill();
    }
  }
  // 茎
  g.strokeStyle = '#6b4423';
  g.lineWidth = Math.max(1.5, r * 0.07);
  g.lineCap = 'round';
  g.beginPath();
  g.moveTo(0, -r * 0.85);
  g.quadraticCurveTo(r * 0.12, -r * 1.05, r * 0.05, -r * 1.15);
  g.stroke();

  if (F.kind === 'apple' || F.kind === 'cherry' || F.kind === 'pear' || F.kind === 'peach') {
    g.fillStyle = '#4b8b32';
    g.beginPath();
    g.ellipse(-r * 0.22, -r * 1.02, r * 0.26, r * 0.13, -0.5, 0, Math.PI * 2);
    g.fill();
  }
  g.restore();
}

function drawFace(g, r) {
  if (r < 15) return;
  const eye = r * 0.09;
  g.fillStyle = 'rgba(50,25,10,0.85)';
  g.beginPath();
  g.ellipse(-r * 0.26, -r * 0.05, eye, eye * 1.25, 0, 0, Math.PI * 2);
  g.fill();
  g.beginPath();
  g.ellipse(r * 0.26, -r * 0.05, eye, eye * 1.25, 0, 0, Math.PI * 2);
  g.fill();

  g.strokeStyle = 'rgba(50,25,10,0.7)';
  g.lineWidth = Math.max(1, r * 0.04);
  g.lineCap = 'round';
  g.beginPath();
  g.arc(0, r * 0.12, r * 0.16, 0.2 * Math.PI, 0.8 * Math.PI);
  g.stroke();

  if (r > 30) {
    g.fillStyle = 'rgba(255,120,120,0.30)';
    g.beginPath();
    g.arc(-r * 0.46, r * 0.16, r * 0.11, 0, Math.PI * 2);
    g.fill();
    g.beginPath();
    g.arc(r * 0.46, r * 0.16, r * 0.11, 0, Math.PI * 2);
    g.fill();
  }
}

/* ---------------- NEXT と 進化チャート ---------------- */
function drawNext() {
  nextCtx.clearRect(0, 0, 64, 64);
  const F = FRUITS[nextType];
  const r = Math.min(24, 10 + F.r * 0.22);
  drawFruit(nextCtx, nextType, 32, 34, r, 0);
}

function buildChain() {
  chainEl.innerHTML = '';
  FRUITS.forEach((F, i) => {
    const item = document.createElement('div');
    item.className = 'chain-item';
    item.title = F.name;

    const c = document.createElement('canvas');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const size = 34;
    c.width = size * dpr;
    c.height = size * dpr;
    c.style.width = size + 'px';
    c.style.height = size + 'px';
    const cc = c.getContext('2d');
    cc.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawFruit(cc, i, size / 2, size / 2 + 1, size / 2 - 4, 0);

    const label = document.createElement('span');
    label.textContent = F.name;

    item.appendChild(c);
    item.appendChild(label);
    chainEl.appendChild(item);
  });
}

function refreshChain() {
  const items = chainEl.children;
  for (let i = 0; i < items.length; i++) {
    items[i].classList.toggle('unlocked', i <= unlocked);
  }
}

/* =========================================================
   サウンド（WebAudio・外部ファイル無し）
   ========================================================= */
let audioCtx = null;
let masterGain = null;
// 既定はオフ。明示的にオンにした人だけ鳴らす
let soundOn = localStorage.getItem(SOUND_KEY) === 'on';
const lastPlayed = {};      // 音の種類ごとの最終再生時刻(ms)
const MIN_INTERVAL = 70;    // 同じ音を続けて鳴らす最短間隔(ms)

function updateSoundButton() {
  soundButton.textContent = soundOn ? '♪ ON' : '♪ OFF';
  soundButton.classList.toggle('off', !soundOn);
}

soundButton.addEventListener('click', () => {
  soundOn = !soundOn;
  localStorage.setItem(SOUND_KEY, soundOn ? 'on' : 'off');
  updateSoundButton();
  if (soundOn) ensureAudio();
});

function ensureAudio() {
  if (!soundOn) return null;
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    audioCtx = new AC();
    // 音が重なっても割れないようにコンプレッサ経由でまとめる
    const comp = audioCtx.createDynamicsCompressor();
    comp.threshold.value = -24;
    comp.knee.value = 12;
    comp.ratio.value = 12;
    comp.attack.value = 0.003;
    comp.release.value = 0.15;
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.5;
    masterGain.connect(comp).connect(audioCtx.destination);
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

// at: 再生開始を遅らせる秒数（setTimeout を使うと音が団子になるので時刻指定で予約する）
function tone(freq, dur, type, vol, slideTo, at) {
  const ac = ensureAudio();
  if (!ac) return;
  const t0 = ac.currentTime + (at || 0);
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type || 'sine';
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain).connect(masterGain);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

// 短時間に同じ音が殺到したら間引く
function throttled(name) {
  const now = performance.now();
  if (now - (lastPlayed[name] || -Infinity) < MIN_INTERVAL) return false;
  lastPlayed[name] = now;
  return true;
}

function playDrop() {
  if (!soundOn || !throttled('drop')) return;
  tone(220, 0.09, 'triangle', 0.05);
}

function playMerge(type) {
  if (!soundOn || !throttled('merge')) return;
  const f = 300 * Math.pow(1.09, type);
  tone(f, 0.13, 'triangle', 0.07);
  tone(f * 1.5, 0.11, 'sine', 0.04, null, 0.055);
}

function playGameOver() {
  if (!soundOn) return;
  tone(320, 0.6, 'sawtooth', 0.07, 70);
}

document.addEventListener('pointerdown', () => ensureAudio(), { once: true });

/* =========================================================
   メインループ
   ========================================================= */
let lastTime = 0;
let acc = 0;

function loop(t) {
  if (!lastTime) lastTime = t;
  let dt = (t - lastTime) / 1000;
  lastTime = t;
  if (dt > 0.25) dt = 0.25;

  acc += dt;
  let guard = 0;
  while (acc >= STEP && guard++ < 6) {
    update(STEP);
    acc -= STEP;
  }
  render();
  requestAnimationFrame(loop);
}

window.addEventListener('resize', () => {
  setupCanvas();
  drawNext();
});

/* ---------------- 起動 ---------------- */
setupCanvas();
loadBest();
updateSoundButton();
buildChain();
resetGame();
requestAnimationFrame(loop);
