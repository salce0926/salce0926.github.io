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
    YESNO: 'YESNO'
};
let currentState = STATE.FIELD;
let debugMode = false;

// =====================================================================
// 入力バッファシステム
// =====================================================================
const Input = {
    keys: {},
    justPressed: {},
    isTouch: false,

    consume(key) {
        if (this.justPressed[key]) {
            this.justPressed[key] = false;
            return true;
        }
        return false;
    },
    isDown(key) { return this.keys[key] || false; },
    clearJustPressed() { for (let k in this.justPressed) this.justPressed[k] = false; }
};

window.addEventListener('keydown', e => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault();
    if (!Input.keys[e.key]) Input.justPressed[e.key] = true;
    Input.keys[e.key] = true;
});

window.addEventListener('keyup', e => { Input.keys[e.key] = false; });

var centerX = window.innerWidth / 2, centerY = window.innerHeight / 2;
var centerLeftX = displayTileSize * screenWidth / 3;
var centerRightX = displayTileSize * screenWidth * 2 / 3;
var centerTopY = displayTileSize * screenHeight / 3;
var centerBottomY = displayTileSize * screenHeight * 2 / 3;

window.addEventListener('touchstart', e => {
    e.preventDefault();
    Input.isTouch = true;
    let tx = e.touches[0].clientX, ty = e.touches[0].clientY;

    if (tx > centerLeftX && tx < centerRightX && ty > centerTopY && ty < centerBottomY) {
        if (!Input.keys[' ']) Input.justPressed[' '] = true;
        Input.keys[' '] = true;
    } else {
        let dx = tx - centerX, dy = ty - centerY;
        if (Math.abs(dx) > Math.abs(dy)) {
            if (dx > 0) Input.keys['ArrowRight'] = true; else Input.keys['ArrowLeft'] = true;
        } else {
            if (dy > 0) Input.keys['ArrowDown'] = true; else Input.keys['ArrowUp'] = true;
        }
    }
}, { passive: false });

window.addEventListener('touchend', e => {
    Input.keys['ArrowUp'] = Input.keys['ArrowDown'] = Input.keys['ArrowLeft'] = Input.keys['ArrowRight'] = Input.keys[' '] = false;
});

// =====================================================================
// 汎用ユーティリティ
// =====================================================================
function modAdd(x, y, mod){ let res = x + y + mod; return res % mod; }
function alignRight(number, width) { return ' '.repeat(Math.max(0, width - number.toString().length)) + number.toString(); }
function alignRightWide(number, width) { return '　'.repeat(Math.max(0, width - number.toString().length)) + number.toString(); }

// =====================================================================
// 描画関連
// =====================================================================
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
canvas.width = screenWidth * displayTileSize;
canvas.height = screenHeight * displayTileSize;

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
// メインゲームループ
// =====================================================================
let lastTime = 0;

function gameLoop(timestamp) {
    if (timestamp - lastTime > 1000) {
        playerIndex = modAdd(playerIndex, 1, 2) + playerStyle;
        lastTime = timestamp;
    }

    switch (currentState) {
        case STATE.FIELD: updateField(); break;
        case STATE.MESSAGE: updateMessage(); break;
        case STATE.MENU: updateMenu(); break;
        case STATE.BATTLE: updateBattle(); break;
        case STATE.PASSCODE: updatePasscode(); break;
        case STATE.YESNO: updateYesNo(); break;
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
    }

    Input.clearJustPressed();
    requestAnimationFrame(gameLoop);
}

// ゲーム起動
window.onload = function () {
    updatePlayerLevel();
    updatePlayerItems();
    updatePlayerStyle();
    requestAnimationFrame(gameLoop);
};
