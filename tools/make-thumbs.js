// トップページのゲームカード用サムネイル（640x360 の WebP）を作る
//
// 使い方（リポジトリのルートで）:
//   python3 -m http.server 8765 &      … サイトをローカルで配信
//   node tools/make-thumbs.js          … 全ゲームを作り直す
//   node tools/make-thumbs.js tetris   … 指定したゲームだけ作り直す
// 出力先は images/thumbs/<フォルダ名>.webp。Playwright が必要。
//
// 新しいゲームを足すときは、下の cfg に
//   sel: 写したい部分の CSS セレクタ（複数なら全部を囲む範囲）
//   pad: そのまわりの余白(px)
//   act: 撮る前の操作（数手進めるなど）
//   vp:  画面の大きさ（省略時 1280x1000）
//   url: ゲーム画面の代わりに使うページ（tools/thumb-art/ のイラストなど）
// を1行追加する。切り出した範囲は 16:9 に収め、余白は左上の色で塗る。
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const out = path.join(__dirname, '..', 'images', 'thumbs');
const only = process.argv.slice(2);
const wait = ms => p => p.waitForTimeout(ms);
const cfg = {
  'suica-fall':   { sel: ['#title', '#stage'], pad: 24, act: async p => { const s = await p.$('#gameCanvas'); const bb = await s.boundingBox(); for (const fx of [0.3, 0.7, 0.5, 0.2, 0.8, 0.45, 0.6, 0.35]) { await p.mouse.click(bb.x + bb.width * fx, bb.y + 60); await p.waitForTimeout(900); } await p.waitForTimeout(1500); } },
  '2048':         { sel: ['.container'], pad: 24, act: async p => { for (let i = 0; i < 40; i++) { await p.keyboard.press(['ArrowUp','ArrowLeft','ArrowDown','ArrowRight'][i % 4]); await p.waitForTimeout(70); } } },
  'tetris':       { sel: ['#game-container'], pad: 12, act: async p => { await p.evaluate(async () => { const plan = [-4,4,-2,2,0,-3,3,-1,1,4,-4,2]; for (const m of plan) { const piece = currentPiece; for (let i = 0; i < Math.abs(m); i++) (m < 0 ? movePieceLeft : movePieceRight)(piece); let n = 0; while (currentPiece === piece && !gameOver && n++ < 30) movePieceDown(piece); await new Promise(r => setTimeout(r, 30)); } for (let i = 0; i < 6; i++) movePieceDown(currentPiece); }); await p.waitForTimeout(300); } },
  'cat-trap':     { sel: ['#wrap'], pad: 16, act: wait(500) },
  // 画面が文字中心で映えないので、遊んでいる様子のイラストを使う
  'hit-and-blow': { url: 'tools/thumb-art/hit-and-blow.html', sel: ['#art'], pad: 0, act: wait(300) },
  // ジャグリング耐久モードのプレイ中
  'isshun':       { sel: ['#c'], pad: 0, act: async p => { await p.evaluate(() => __isshun.startJuggle()); await p.waitForTimeout(1500); } },
  'pong':         { sel: ['#gameCanvas'], pad: 0, act: wait(1500) },
  'avoid-game':   { sel: ['#main'], pad: 0, act: wait(400) },
  // ビッドはパスし、場に3枚出たところ（カードは毎回ランダム）
  'napoleon':     { vp: { width: 900, height: 700 }, sel: ['#trick-wrap', '#human-hand'], pad: 24, act: async p => {
    await p.evaluate(() => { hideModal(); newGame(); });
    for (let t = 0; t < 80; t++) {
      await p.waitForTimeout(400);
      const n = await p.evaluate(() => {
        const vis = e => e && e.offsetParent !== null;
        const pass = [...document.querySelectorAll('button')].find(b => vis(b) && b.textContent.trim() === 'パス');
        if (pass) { pass.click(); return 0; }
        const n = document.querySelectorAll('#trick-area .card').length;
        const card = document.querySelector('#human-hand .card.playable');
        if (card && n < 3) { card.click(); card.click(); }
        return n;
      });
      if (n >= 3) break;
    }
    // カードが出た直後の拡大や、トリック決着時の点滅が終わってから撮る
    await p.waitForTimeout(300);
    await p.waitForFunction(() => !document.querySelector('#trick-area .flash, #trick-area .pop-in'), null, { timeout: 3000 }).catch(() => {});
  } },
  'poker-flip':   { sel: ['.table'], pad: 16, act: wait(500) },
  'zombie-chess': { sel: ['h1', '#board-wrap'], pad: 20, act: async p => { await p.evaluate(() => { setMode('cvc'); newGame(); }); await p.waitForTimeout(5000); } },
  'shut-the-box': { sel: ['#rollButton', '#tilesContainer'], pad: 30, act: async p => { await p.click('#rollButton'); await p.waitForTimeout(600); } },
  'retro-quest':  { sel: ['#cv'], pad: 0, act: wait(1200) },
  'salt-quest-1': { sel: ['#canvas'], pad: 0, act: wait(1200) },
};
(async () => {
  const b = await chromium.launch();
  const enc = await (await b.newContext()).newPage();
  for (const [d, c] of Object.entries(cfg)) {
    if (only.length && !only.includes(d)) continue;
    const p = await (await b.newContext({ viewport: c.vp || { width: 1280, height: 1000 } })).newPage();
    p.on('dialog', dl => dl.dismiss().catch(() => {}));
    await p.goto(`http://127.0.0.1:8765/${c.url || d + '/index.html'}`); await p.waitForTimeout(1000);
    try { await c.act(p); } catch (e) { console.log(d, 'act failed:', e.message.split('\n')[0]); }
    const r = await p.evaluate(({ sel, pad }) => {
      const rs = sel.map(s => document.querySelector(s)).filter(Boolean).map(e => e.getBoundingClientRect());
      const x0 = Math.min(...rs.map(r => r.left)) - pad, y0 = Math.min(...rs.map(r => r.top)) - pad;
      const x1 = Math.max(...rs.map(r => r.right)) + pad, y1 = Math.max(...rs.map(r => r.bottom)) + pad;
      return { x: Math.max(0, x0 + scrollX), y: Math.max(0, y0 + scrollY), w: x1 - x0, h: y1 - y0 };
    }, { sel: c.sel, pad: c.pad });
    const png = await p.screenshot({ clip: { x: r.x, y: r.y, width: r.w, height: r.h }, fullPage: true });
    // 16:9 に収め、余白は切り出した画像の左上の色で塗る
    const webp = await enc.evaluate(async (b64) => {
      const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
      const W = 640, H = 360, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
      const ctx = cv.getContext('2d');
      const probe = document.createElement('canvas'); probe.width = probe.height = 1;
      probe.getContext('2d').drawImage(img, 2, 2, 1, 1, 0, 0, 1, 1);
      const [r, g, bl] = probe.getContext('2d').getImageData(0, 0, 1, 1).data;
      ctx.fillStyle = `rgb(${r},${g},${bl})`; ctx.fillRect(0, 0, W, H);
      const s = Math.min(W / img.width, H / img.height);
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, (W - img.width * s) / 2, (H - img.height * s) / 2, img.width * s, img.height * s);
      return cv.toDataURL('image/webp', 0.82).split(',')[1];
    }, png.toString('base64'));
    fs.writeFileSync(`${out}/${d}.webp`, Buffer.from(webp, 'base64'));
    console.log(d, Math.round(r.w) + 'x' + Math.round(r.h), Math.round(Buffer.from(webp, 'base64').length / 1024) + 'KB');
    await p.context().close();
  }
  await b.close();
})();
