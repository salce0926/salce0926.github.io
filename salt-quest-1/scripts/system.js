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
    CHOICE: 'CHOICE'
};
let currentState = STATE.FIELD;
let debugMode = false;

// =====================================================================
// 入力バッファシステム
// =====================================================================
const ARROW_KEYS = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
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
    if ([...ARROW_KEYS, ' '].includes(e.key)) e.preventDefault();
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
var centerX = displayTileSize * screenWidth / 2, centerY = displayTileSize * screenHeight / 2;
var centerLeftX = displayTileSize * screenWidth / 3;
var centerRightX = displayTileSize * screenWidth * 2 / 3;
var centerTopY = displayTileSize * screenHeight / 3;
var centerBottomY = displayTileSize * screenHeight * 2 / 3;

// 画面上のタッチ位置をcanvas内部座標へ変換する（拡大縮小・余白に依らず一致させる）
function touchToCanvas(touch) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: (touch.clientX - rect.left) * canvas.width / rect.width,
        y: (touch.clientY - rect.top) * canvas.height / rect.height
    };
}

let touchKey = null; // いま押している扱いのキー

function applyTouch(touch) {
    const p = touchToCanvas(touch);
    let key;
    if (p.x > centerLeftX && p.x < centerRightX && p.y > centerTopY && p.y < centerBottomY) {
        key = ' ';
    } else {
        const dx = p.x - centerX, dy = p.y - centerY;
        key = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'ArrowRight' : 'ArrowLeft')
                                         : (dy > 0 ? 'ArrowDown' : 'ArrowUp');
    }
    if (key === touchKey) return;
    if (touchKey) Input.release(touchKey);
    touchKey = key;
    Input.press(key);  // 方向もjustPressedを立てるのでメニューや店も操作できる
}

function endTouch() {
    if (touchKey) Input.release(touchKey);
    touchKey = null;
}

canvas.addEventListener('touchstart', e => {
    e.preventDefault();
    Input.isTouch = true;
    applyTouch(e.touches[0]);
}, { passive: false });

// 指をずらすと方向を変えられる
canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    if (e.touches[0]) applyTouch(e.touches[0]);
}, { passive: false });

canvas.addEventListener('touchend', e => { e.preventDefault(); endTouch(); }, { passive: false });
canvas.addEventListener('touchcancel', endTouch);

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
function drawEnemy() {
    const s = enemy.sprite || { x: 5, y: 2, w: 20, h: 18 };
    ctx.drawImage(enemyImage, s.x, s.y, s.w, s.h, canvas.width / 2 - s.w, canvas.height / 2 - s.h, s.w * 2, s.h * 2);
}
function drawWindowBattleEnemy() {
    const w = canvas.width / 2, h = canvas.height / 2;
    const x = canvas.width / 4, y = canvas.height / 4;
    ctx.fillStyle = '#80D010'; // バトル背景色
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.strokeRect(x, y, w, h);
    drawEnemy();
}
function drawMap(){
    for (var y = 0; y <= screenHeight; y++) {
        for (var x = 0; x <= screenWidth; x++) {
            var worldY = modAdd(playerPosition.y - screenHeight/2, y, mapHeight);
            var worldX = modAdd(playerPosition.x - screenWidth/2, x, mapWidth);
            if (typeof mapData === 'undefined' || !mapData[worldY] || mapData[worldY][worldX] === undefined) continue;
            var tileIndex = mapData[worldY][worldX];
            if(tileIndex >= 350) tileIndex -= 12*25;
            drawTile(x, y, tileIndex);
            if(x === screenWidth/2 && y === screenHeight/2) drawCharacter(x, y, playerIndex);
        }
    }
}
function drawWindow(x, y, width, height, textArray) {
    ctx.fillStyle = 'black'; ctx.fillRect(x, y, width, height);
    ctx.strokeStyle = 'white'; ctx.lineWidth = 5; ctx.lineJoin = 'round'; ctx.strokeRect(x, y, width, height);
    ctx.strokeStyle = 'black'; ctx.lineWidth = 2; ctx.lineJoin = 'round'; ctx.strokeRect(x - 2, y - 2, width + 4, height + 4);
    ctx.fillStyle = 'white'; ctx.font = '16px cinecaption';
    let textX = x + displayTileSize / 2, textY = y + displayTileSize;
    for (let i = 0; i < textArray.length; i++) {
        if(textArray[i]) ctx.fillText(textArray[i], textX, textY);
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
function drawTapArea(){ // スマホ用タップ枠線
    if(!Input.isTouch) return;
    ctx.beginPath(); ctx.moveTo(centerLeftX, centerTopY); ctx.lineTo(centerRightX, centerTopY); ctx.lineTo(centerRightX, centerBottomY); ctx.lineTo(centerLeftX, centerBottomY); ctx.lineTo(centerLeftX, centerTopY);
    ctx.strokeStyle = 'red'; ctx.stroke(); ctx.closePath();
}
function drawPoint(){ // ローラ姫ナビゲーション＆デバッグ座標
    let text = '';
    if(getGameFlag('roraLove')) {
        let dx = gameFlags.sunStone.location.x - playerPosition.x;
        let dy = gameFlags.sunStone.location.y - playerPosition.y;
        let ns = (dx > 0 ? '東' : '西'), ew = (dy > 0 ? '南' : '北');
        text = `ローラ「ラダトーム城まで${ns}へ${Math.abs(dx)} ${ew}へ${Math.abs(dy)}ですわ」`;
    }
    if(debugMode) text = `x: ${playerPosition.x}, y: ${playerPosition.y}`;
    const pt = document.getElementById('point');
    if(pt) { pt.innerText = text; pt.style.display = text ? 'block' : 'none'; }
}

// =====================================================================
// メッセージシステム
// =====================================================================
let messageResolver = null;
let currentMessage = [];

function showMessage(textLines) {
    currentMessage = textLines;
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

function updateYesNo() {
    if (Input.consume('ArrowUp') || Input.consume('ArrowDown')) yesNoCursor = 1 - yesNoCursor;
    if (Input.consume(' ')) {
        if (yesNoResolver) {
            let res = yesNoResolver;
            yesNoResolver = null;
            res(yesNoCursor === 0);
        }
    }
}

function drawYesNo() {
    drawWindowCommon(yesNoPrompt);
    const opts = ['はい', 'いいえ'].map((o, i) => (i === yesNoCursor ? `▶${o}` : `　${o}`));
    drawWindow(displayTileSize * (screenWidth - 5), displayTileSize * screenHeight - displayTileSize * 7.5, displayTileSize * 4, displayTileSize * 2.5, opts);
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

function updateChoice() {
    if (Input.consume('ArrowUp')) choiceCursor = modAdd(choiceCursor, -1, choiceOptions.length);
    if (Input.consume('ArrowDown')) choiceCursor = modAdd(choiceCursor, 1, choiceOptions.length);
    if (Input.consume(' ')) {
        if (choiceResolver) {
            let res = choiceResolver;
            choiceResolver = null;
            res(choiceCursor);
        }
    }
}

function drawChoice() {
    drawWindowCommon(choicePrompt);
    const text = choiceOptions.map((o, i) => (i === choiceCursor ? `▶${o}` : `　${o}`));
    const width = displayTileSize * (2 + Math.max(...choiceOptions.map(o => o.length)) * 0.75);
    drawWindow(displayTileSize * screenWidth - width - displayTileSize / 2, displayTileSize / 2,
               width, displayTileSize * (text.length + 0.5), text);
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
    drawTapArea();

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
    requestAnimationFrame(gameLoop);
};
