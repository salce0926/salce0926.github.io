// =====================================================================
// 基本設定
// =====================================================================
const tilesetURL = './images/tileset.png';
const characterURL = './images/character.png';
const enemyURL = './images/enemy.png';

const tileSize = 16;
const rate = 1.5;
const displayTileSize = tileSize * rate;

var mapWidth = typeof mapData !== 'undefined' ? mapData[0].length : 120;
var mapHeight = typeof mapData !== 'undefined' ? mapData.length : 120;

var screenWidth = 16;
var screenHeight = 16;

// =====================================================================
// ステートマシン（状態管理）
// =====================================================================
const STATE = {
    FIELD: 'FIELD',
    MESSAGE: 'MESSAGE',
    MENU: 'MENU',
    BATTLE: 'BATTLE',
    PASSCODE: 'PASSCODE',
    YESNO: 'YESNO',
    CHOICE: 'CHOICE',
    TITLE: 'TITLE'
};
let currentState = STATE.FIELD;
let debugMode = false;

// =====================================================================
// 開発者モード
// 画面下のメッセージ欄を3秒以内に7回タップすると切り替わる（端末に記憶する）。
// 普通に遊ぶ人にはAUTOボタンも開発用キーも存在しない
// =====================================================================
const DEV_TAPS = 7, DEV_TAP_WINDOW = 3000;
let devMode = false;
try { devMode = localStorage.getItem('sq1dev') === '1'; } catch (e) { /* 使えない環境ではoff */ }

function setDevMode(on) {
    devMode = on;
    try { on ? localStorage.setItem('sq1dev', '1') : localStorage.removeItem('sq1dev'); } catch (e) {}
    const exist = document.getElementById('btnAuto');
    if (on && !exist) {
        const b = document.createElement('button');
        b.id = 'btnAuto'; b.className = 'pk'; b.dataset.key = 'a';
        b.setAttribute('aria-label', 'オートレベルあげ');
        b.textContent = 'AUTO';
        document.getElementById('game-info').appendChild(b);   // 操作パネルの並びを崩さない
        bindPadKey(b);
    } else if (!on && exist) {
        exist.remove();
    }
    const msg = document.getElementById('message');
    if (msg) msg.textContent = on ? 'かいはつモード ON（AUTOボタンが つかえます）'
                                  : 'かいはつモード OFF';
}

// メッセージ欄の連打で切り替える。ゲーム操作には使わない場所なので誤爆しにくい
let devTaps = [];
function setupDevToggle() {
    const area = document.getElementById('game-info');
    if (!area) return;
    area.addEventListener('pointerdown', () => {
        const now = Date.now();
        devTaps = devTaps.filter(t => now - t < DEV_TAP_WINDOW);
        devTaps.push(now);
        if (devTaps.length >= DEV_TAPS) { devTaps = []; setDevMode(!devMode); }
    });
    if (devMode) setDevMode(true);   // 記憶していたらボタンを出す
}
// このスクリプトはbody末尾で読まれるので、すでに描き終わっている場合にも備える
if (document.readyState === 'loading') window.addEventListener('DOMContentLoaded', setupDevToggle);
else setupDevToggle();

// =====================================================================
// 入力バッファシステム
// =====================================================================
const ARROW_KEYS = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
// キャンセル（本家のBボタン）。キーボードはEsc/BackSpace/xのどれでも受ける
const CANCEL_KEYS = ['Escape', 'Backspace', 'x', 'X'];
function consumeCancel() { return CANCEL_KEYS.some(k => Input.consume(k)); }
const REPEAT_DELAY = 350; // 長押しを連射に切り替えるまで(ms)
const REPEAT_INTERVAL = 90;

const Input = {
    keys: {},
    justPressed: {},
    heldSince: {},
    nextRepeat: {},
    isTouch: false,

    press(key) {
        if (!this.keys[key]) {
            this.justPressed[key] = true;
            this.heldSince[key] = performance.now();
            this.nextRepeat[key] = this.heldSince[key] + REPEAT_DELAY;
        }
        this.keys[key] = true;
    },
    release(key) {
        this.keys[key] = false;
        delete this.heldSince[key];
        delete this.nextRepeat[key];
    },
    consume(key) {
        if (this.justPressed[key]) {
            this.justPressed[key] = false;
            return true;
        }
        return false;
    },
    isDown(key) { return this.keys[key] || false; },
    // 方向キーは長押しでカーソルが連続移動する（じゅもん入力やメニュー用）
    updateRepeat(now) {
        for (const key of ARROW_KEYS) {
            if (!this.keys[key] || this.nextRepeat[key] === undefined) continue;
            if (now >= this.nextRepeat[key]) {
                this.justPressed[key] = true;
                this.nextRepeat[key] = now + REPEAT_INTERVAL;
            }
        }
    },
    clearJustPressed() { for (let k in this.justPressed) this.justPressed[k] = false; }
};

window.addEventListener('keydown', e => {
    if ([...ARROW_KEYS, ' ', 'Backspace'].includes(e.key)) e.preventDefault();
    Input.press(e.key);
});

window.addEventListener('keyup', e => { Input.release(e.key); });

// =====================================================================
// キャンバス（タッチ判定で座標変換に使うので入力より先に用意する）
// =====================================================================
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
canvas.width = screenWidth * displayTileSize;
canvas.height = screenHeight * displayTileSize;

// タップ領域(canvas内部座標)。画面の真ん中が決定、外周が方向
// 画面下の十字キー／Aボタンで操作する。方向はパネルに任せ、
// canvasはどこを触っても「けってい（メッセージ送り・調べる）」にする。
// 狙う必要が無くなるので、メッセージ送りが格段に楽になる。
function enableTouchControls() {
    if (document.body.classList.contains('touch')) return;
    document.body.classList.add('touch');
    Input.isTouch = true;
}

// 指で操作する端末なら最初からパネルを出す
if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) enableTouchControls();

let canvasTouching = false;
canvas.addEventListener('touchstart', e => {
    e.preventDefault();
    enableTouchControls();
    if (!canvasTouching) { canvasTouching = true; Input.press(' '); }
}, { passive: false });
const endCanvasTouch = e => {
    if (e && e.cancelable) e.preventDefault();
    if (canvasTouching) { canvasTouching = false; Input.release(' '); }
};
canvas.addEventListener('touchend', endCanvasTouch, { passive: false });
canvas.addEventListener('touchcancel', endCanvasTouch);

// 十字キーとAボタン（あとから足すAUTOボタンにも同じ処理を使う）
function bindPadKey(btn) {
    const key = btn.dataset.key;
    const down = e => {
        e.preventDefault();
        enableTouchControls();
        btn.classList.add('on');
        Input.press(key);
    };
    const up = e => {
        if (e && e.cancelable) e.preventDefault();
        btn.classList.remove('on');
        Input.release(key);
    };
    btn.addEventListener('pointerdown', down);
    btn.addEventListener('pointerup', up);
    btn.addEventListener('pointercancel', up);
    btn.addEventListener('pointerleave', up);
    btn.addEventListener('contextmenu', e => e.preventDefault());
}
document.querySelectorAll('#pad .pk').forEach(bindPadKey);

// =====================================================================
// 汎用ユーティリティ
// =====================================================================
function modAdd(x, y, mod){ let res = x + y + mod; return res % mod; }
function alignRight(number, width) { return ' '.repeat(Math.max(0, width - number.toString().length)) + number.toString(); }
function alignRightWide(number, width) { return '　'.repeat(Math.max(0, width - number.toString().length)) + number.toString(); }

// =====================================================================
// 描画関連
// =====================================================================

var characterImage = new Image(); characterImage.src = characterURL;
var enemyImage = new Image(); enemyImage.src = enemyURL;
var tilesetImage = new Image(); tilesetImage.src = tilesetURL;

function drawTile(x, y, index){
    var offsetX = 3, offsetY = 2, offsetTile = 1, tileRowLength = 25;
    ctx.drawImage(tilesetImage, offsetX+(index % tileRowLength) * (tileSize+offsetTile), offsetY+Math.floor(index / tileRowLength) * (tileSize+offsetTile), tileSize, tileSize, x * displayTileSize, y * displayTileSize, displayTileSize, displayTileSize);
}
function drawCharacter(x, y, index){
    var offsetX = 8, offsetY = 8, offsetTile = 8, tileRowLength = 14;
    ctx.drawImage(characterImage, offsetX+(index % tileRowLength) * (tileSize+offsetTile), offsetY+Math.floor(index / tileRowLength) * (tileSize+offsetTile), tileSize, tileSize, x * displayTileSize, y * displayTileSize, displayTileSize, displayTileSize);
}
// 敵に当てたときの明滅の残りフレーム数
// （本家の「画面が赤くなる」はHPが残り1/4を切ったときの警告で、被弾ごとの点滅ではない）
let enemyFlash = 0;
const FLASH_FRAMES = 14;

function drawEnemy() {
    let s = enemy.sprite || { x: 5, y: 2, w: 20, h: 18 };
    if (enemyFlash > 0) {
        // ダメージを与えたら赤いシルエットと通常絵を交互に出す。
        // 赤絵は素材(enemy.png)に敵ごとに用意されている
        enemyFlash--;
        if (enemy.hit && Math.floor(enemyFlash / 3) % 2 === 0) s = enemy.hit;
    }
    const dx = canvas.width / 2 - s.w, dy = canvas.height / 2 - s.h;
    ctx.drawImage(enemyImage, s.x, s.y, s.w, s.h, dx, dy, s.w * 2, s.h * 2);
}
function drawWindowBattleEnemy() {
    const w = canvas.width / 2, h = canvas.height / 2;
    const x = canvas.width / 4, y = canvas.height / 4;
    // 本家仕様: HPが残り1/4を切ると戦闘背景が赤くなる（被弾ごとの点滅ではなく、
    // 瀕死のあいだ ずっと赤い）
    ctx.fillStyle = (player.hp <= Math.floor(player.maxHp / 4)) ? '#D82820' : '#80D010';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.strokeRect(x, y, w, h);
    drawEnemy();
}
function drawMap(){
    // ダンジョンは明かりの届く範囲(正方形)だけが見え、外は真っ黒
    const dark = (typeof inDungeon === 'function') && inDungeon();
    const wrap = (typeof mapWraps !== 'function') || mapWraps();
    const light = dark ? lightRadius() : Infinity;
    if (dark) { ctx.fillStyle = 'black'; ctx.fillRect(0, 0, canvas.width, canvas.height); }
    for (var y = 0; y <= screenHeight; y++) {
        for (var x = 0; x <= screenWidth; x++) {
            if (Math.max(Math.abs(x - screenWidth/2), Math.abs(y - screenHeight/2)) > light) continue;
            var worldY, worldX;
            if (wrap) {
                worldY = modAdd(playerPosition.y - screenHeight/2, y, mapHeight);
                worldX = modAdd(playerPosition.x - screenWidth/2, x, mapWidth);
            } else {
                worldY = playerPosition.y - screenHeight/2 + y;
                worldX = playerPosition.x - screenWidth/2 + x;
            }
            if (typeof mapData === 'undefined' || !mapData[worldY] || mapData[worldY][worldX] === undefined) continue;
            var tileIndex = mapData[worldY][worldX];
            if(tileIndex >= 350) tileIndex -= 12*25;
            // 本家どおり、開けたとびらは絵が消えてただの床になる
            if(dark && tileIndex === D_DOOR && !isDoorLocked(worldX, worldY)) tileIndex = D_FLOOR;
            drawTile(x, y, tileIndex);
            if(x === screenWidth/2 && y === screenHeight/2) drawCharacter(x, y, playerIndex);
        }
    }
}
// 選択カーソル。▶(U+25B6)はcinecaptionに無く端末ごとに代替フォント(iOSでは絵文字)に
// なってしまうため、三角を直接描いて見た目を固定する
function drawCursorMark(x, baseline) {
    const w = 9, h = 11, left = x + 3, top = baseline - 12;
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.moveTo(left, top);
    ctx.lineTo(left + w, top + h / 2);
    ctx.lineTo(left, top + h);
    ctx.closePath();
    ctx.fill();
}

// cursorLine を渡すと、その行の頭にカーソルを描く（各行は先頭に全角空白をあける）
function drawWindow(x, y, width, height, textArray, cursorLine) {
    ctx.fillStyle = 'black'; ctx.fillRect(x, y, width, height);
    ctx.strokeStyle = 'white'; ctx.lineWidth = 5; ctx.lineJoin = 'round'; ctx.strokeRect(x, y, width, height);
    ctx.strokeStyle = 'black'; ctx.lineWidth = 2; ctx.lineJoin = 'round'; ctx.strokeRect(x - 2, y - 2, width + 4, height + 4);
    ctx.fillStyle = 'white'; ctx.font = '16px cinecaption';
    let textX = x + displayTileSize / 2, textY = y + displayTileSize;
    for (let i = 0; i < textArray.length; i++) {
        if(textArray[i]) ctx.fillText(textArray[i], textX, textY);
        if (i === cursorLine) drawCursorMark(textX, textY);
        textY += displayTileSize;
    }
}

function drawWindowCommon(textArray){
    drawWindow(displayTileSize / 2, displayTileSize * screenHeight - displayTileSize * 4 - displayTileSize / 2, displayTileSize * (screenWidth - 1), displayTileSize * 4, textArray);
}
function drawWindowPlayerInfo(){
    const text = [
        player.name, `レベル ${alignRight(player.level, 2)}`, `HP　　${alignRight(player.hp, 3)}`,
        `MP　　${alignRight(player.mp, 3)}`, `G 　${alignRight(player.gold, 5)}`, `E 　${alignRight(player.exp, 5)}`
    ];
    drawWindow(displayTileSize / 2, displayTileSize / 2, displayTileSize * 4, displayTileSize * (text.length + 0.5), text);
}
function drawPoint(){ // デバッグ用の座標表示だけ（ローラのナビは どうぐ から使う）
    const pt = document.getElementById('point');
    if (!pt) return;
    const text = debugMode ? `x: ${playerPosition.x}, y: ${playerPosition.y}` : '';
    pt.innerText = text;
    pt.style.display = text ? 'block' : 'none';
}


// =====================================================================
// メッセージシステム
// =====================================================================
let messageResolver = null;
let currentMessage = [];

function showMessage(textLines) {
    currentMessage = textLines;
    // オート中は1フレームで流れて読めないので、待たずに先へ進む。
    // 待ち時間が消えるぶん戦闘そのものも速くなる
    if (typeof autoPilot !== 'undefined' && autoPilot.on) return Promise.resolve();
    currentState = STATE.MESSAGE;
    return new Promise(resolve => { messageResolver = resolve; });
}

function updateMessage() {
    if (Input.consume(' ')) {
        if (messageResolver) {
            let res = messageResolver;
            messageResolver = null;
            res();
        }
    }
}

// =====================================================================
// はい/いいえ選択
// =====================================================================
let yesNoResolver = null, yesNoCursor = 0, yesNoPrompt = [];

function askYesNo(promptLines) {
    yesNoPrompt = promptLines;
    yesNoCursor = 0;
    currentState = STATE.YESNO;
    return new Promise(resolve => { yesNoResolver = resolve; });
}

function resolveYesNo(answer) {
    if (!yesNoResolver) return;
    const res = yesNoResolver;
    yesNoResolver = null;
    res(answer);
}

function updateYesNo() {
    if (Input.consume('ArrowUp') || Input.consume('ArrowDown')) yesNoCursor = 1 - yesNoCursor;
    if (consumeCancel()) { yesNoCursor = 1; resolveYesNo(false); return; }  // Bは「いいえ」と同じ
    if (Input.consume(' ')) resolveYesNo(yesNoCursor === 0);
}

function drawYesNo() {
    drawWindowCommon(yesNoPrompt);
    const opts = ['はい', 'いいえ'].map(o => `　${o}`);
    drawWindow(displayTileSize * (screenWidth - 5), displayTileSize * screenHeight - displayTileSize * 7.5, displayTileSize * 4, displayTileSize * 2.5, opts, yesNoCursor);
}

// =====================================================================
// 一覧から1つ選ぶ（店・町の施設など）。選んだ番号を返す
// =====================================================================
let choiceResolver = null, choiceCursor = 0, choicePrompt = [], choiceOptions = [];

function chooseFromList(promptLines, options) {
    choicePrompt = promptLines;
    choiceOptions = options;
    choiceCursor = 0;
    currentState = STATE.CHOICE;
    return new Promise(resolve => { choiceResolver = resolve; });
}

function resolveChoice(index) {
    if (!choiceResolver) return;
    const res = choiceResolver;
    choiceResolver = null;
    res(index);
}

function updateChoice() {
    if (Input.consume('ArrowUp')) choiceCursor = modAdd(choiceCursor, -1, choiceOptions.length);
    if (Input.consume('ArrowDown')) choiceCursor = modAdd(choiceCursor, 1, choiceOptions.length);
    // Bは最後の項目（やめる／でる）を選んだのと同じ扱い
    if (consumeCancel()) { choiceCursor = choiceOptions.length - 1; resolveChoice(choiceCursor); return; }
    if (Input.consume(' ')) resolveChoice(choiceCursor);
}

function drawChoice() {
    drawWindowCommon(choicePrompt);
    const text = choiceOptions.map(o => `　${o}`);
    // 文字数から幅を決めていたので、長い項目があると画面の左へはみ出していた。
    // 実際の描画幅で測り、画面に収まるところで止める
    ctx.font = '16px cinecaption';
    const margin = displayTileSize / 2;
    const need = Math.max(...text.map(t => ctx.measureText(t).width)) + displayTileSize;
    const width = Math.min(need, canvas.width - margin * 2);
    const x = Math.max(margin, canvas.width - width - margin);
    drawWindow(x, margin, width, displayTileSize * (text.length + 0.5), text, choiceCursor);
}

// =====================================================================
// タイトル画面（本家同様 さいしょから / ふっかつのじゅもん を選ぶ）
// =====================================================================
let titleCursor = 0;
const titleOptions = ['さいしょから', 'ふっかつのじゅもん'];

function updateTitle() {
    if (Input.consume('ArrowUp')) titleCursor = modAdd(titleCursor, -1, titleOptions.length);
    if (Input.consume('ArrowDown')) titleCursor = modAdd(titleCursor, 1, titleOptions.length);
    if (Input.consume(' ')) {
        if (titleCursor === 0) currentState = STATE.FIELD;
        else openPasscode(true);   // じゅもんを入力して再開
    }
}

function drawTitle() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffd23f';
    ctx.font = '32px cinecaption';
    ctx.textAlign = 'center';
    ctx.fillText('SaltQuest Ⅰ', canvas.width / 2, canvas.height / 3);
    ctx.fillStyle = '#fff';
    ctx.font = '13px cinecaption';
    ctx.fillText('－ ソルトと ひかりのたま －', canvas.width / 2, canvas.height / 3 + 30);
    ctx.textAlign = 'left';
    const text = titleOptions.map(o => `　${o}`);
    drawWindow(canvas.width / 2 - displayTileSize * 4.5, canvas.height / 2 + displayTileSize,
               displayTileSize * 9, displayTileSize * 2.5, text, titleCursor);
}

// =====================================================================
// メインゲームループ
// =====================================================================
let lastTime = 0;

function gameLoop(timestamp) {
    if (timestamp - lastTime > 1000) {
        playerIndex = modAdd(playerIndex, 1, 2) + playerStyle;
        lastTime = timestamp;
    }
    Input.updateRepeat(timestamp);

    if (currentState === STATE.TITLE) {
        updateTitle();
        drawTitle();
        Input.clearJustPressed();
        requestAnimationFrame(gameLoop);
        return;
    }

    // オートパイロットは通常の入力と同じ経路でキーを押す（本当に「操作されている」）
    if (devMode && typeof autoTick === 'function') autoTick(timestamp);
    if (devMode && Input.consume('a')) {
        // 始めた直後の押し込みで即中止にならないようにする（AUTOを連打しがちなので）
        if (autoPilot.on) {
            if (timestamp - autoPilot.startedAt > 1500) autoStop('じぶんで とめた');
        } else if (currentState === STATE.FIELD) autoStart();
    }

    switch (currentState) {
        case STATE.FIELD: updateField(); break;
        case STATE.MESSAGE: updateMessage(); break;
        case STATE.MENU: updateMenu(); break;
        case STATE.BATTLE: updateBattle(); break;
        case STATE.PASSCODE: updatePasscode(); break;
        case STATE.YESNO: updateYesNo(); break;
        case STATE.CHOICE: updateChoice(); break;
    }

    drawMap();
    drawPoint();

    // 戦闘中は敵とステータスを出しっぱなしにする。メッセージ表示のたびに
    // 敵が消えてしまうのを防ぐ（本家も戦闘が終わるまで敵は出たまま）
    if (typeof battleResolver !== 'undefined' && battleResolver !== null) {
        drawWindowBattleEnemy();
        drawWindowPlayerInfo();
    }

    switch (currentState) {
        case STATE.MESSAGE: drawWindowCommon(currentMessage); break;
        case STATE.MENU: drawMenu(); break;
        case STATE.BATTLE: drawBattle(); break;
        case STATE.PASSCODE: drawPasscode(); break;
        case STATE.YESNO: drawYesNo(); break;
        case STATE.CHOICE: drawChoice(); break;
    }

    Input.clearJustPressed();
    requestAnimationFrame(gameLoop);
}

// ゲーム起動
window.onload = function () {
    updatePlayerLevel();
    updatePlayerItems();
    updatePlayerStyle();
    recalcPlayerPower();
    calcFlagsToCode();
    currentState = STATE.TITLE;
    requestAnimationFrame(gameLoop);
};
