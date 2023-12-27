// 画像のURL
var tilesetURL = 'https://www.spriters-resource.com/resources/sheets/10/10199.png';
var mapURL = 'https://www.spriters-resource.com/resources/sheets/106/109509.png';
var characterURL = 'https://www.spriters-resource.com/resources/sheets/39/41381.png';

// タイルのサイズ
const tileSize = 16;
const rate = 1.5;
const displayTileSize = tileSize * rate;

// マップサイズ
var mapWidth = mapData[0].length;
var mapHeight = mapData.length;

// スクリーンサイズ
var screenWidth = 16;
var screenHeight = 16;

// フラグとクリア条件を管理するオブジェクト
var gameFlags = {
    start:          { bit: 0, flag: false, location: { x: 0, y: 0 } },
    fairyFlute:     { bit: 1, flag: false, location: { x: 112, y: 18 } },
    magicKey:       { bit: 2, flag: false, location: { x: 110, y: 80 } },
    roraRescued:    { bit: 3, flag: false, location: { x: 0, y: 0 } },
    roraLove:       { bit: 4, flag: false, location: { x: 0, y: 0 } },
    sunStone:       { bit: 5, flag: false, location: { x: 51, y: 51 } },
    silverHerp:     { bit: 6, flag: false, location: { x: 10, y: 10 } },
    rainCloudStuff: { bit: 7, flag: false, location: { x: 89, y: 9 } },
    golemKilled:    { bit: 8, flag: false, location: { x: 81, y: 108 } },
    rotoEmblem:     { bit: 9, flag: false, location: { x: 91, y: 121 } },
    rotoArmor:      { bit: 10, flag: false, location: { x: 33, y: 97 } },
    rainbowDrop:    { bit: 11, flag: false, location: { x: 116, y: 117 } },
    rainbowBridge:  { bit: 12, flag: false, location: { x: 73, y: 57 } },
    lightBall:      { bit: 13, flag: false, location: { x: 56, y: 56 } }
};

function setGameFlag(flagName){
    gameFlags[flagName].flag = true;
}
function clearGameFlag(flagName){
    gameFlags[flagName].flag = false;
}
function getGameFlag(flagName){
    return gameFlags[flagName].flag;
}

var maxLevel = 3;
var commandMenuStrength = 0;
var commandMenuSpell = 1;
var commandMenuItem = 2;
var commandMenuSave = 3;

let gameStates = {
    waitingInput:     { bit: 0, state: false },
    afterMessage:     { bit: 1, state: false },
    stillTalking:     { bit: 2, state: false },
    debug:            { bit: 3, state: false },
    touch:            { bit: 4, state: false },
    commandMenuLevel: { bit: 5, state: 0 }
};
var isCommandMenuLevel = 0;

function setGameState(stateName){
    gameStates[stateName].state = true;
}
function clearGameState(stateName){
    gameStates[stateName].state = false;
}
function getGameState(stateName){
    return gameStates[stateName].state;
}

let code = 0;
const codeMax = 16384;

function modAdd(x, y, mod){
    let res = x;
    res += y;
    res += mod;
    res %= mod;
    return res;
}

// プレイヤーの初期位置
var playerPosition = { x: 51, y: 51 };
// var playerPosition = { x: 112, y: 17 };

// Canvasの設定
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
canvas.width = screenWidth * displayTileSize;
canvas.height = screenHeight * displayTileSize;

// 画面の中央を起点にしてタッチ位置を計算
var centerX = window.innerWidth / 2;
var centerY = window.innerHeight / 2;

var centerLeftX = displayTileSize * screenWidth / 3;
var centerRightX = displayTileSize * screenWidth * 2 / 3;
var centerTopY = displayTileSize * screenHeight / 3;
var centerBottomY = displayTileSize * screenHeight * 2 / 3;

var message = '';
var interval = 500;

var textExplainSave = [
    `きろく：${code}`
];
function updateTextExplainSave(){
    textExplainSave = [
        'きろく を へんこうできます',
        `きろく：${code}`
    ];
}

// プレイヤーの見た目
var playerStyleNormal = 0;
var playerStyleSword = 2;
var playerStyleShield = 4;
var playerStyleFull = 6;
var playerStyleWithRora = 8;
var playerIndex = playerStyleNormal;
var playerStyle = playerStyleNormal;

// イメージのロード
var characterImage = new Image();
characterImage.src = characterURL;
var tilesetImage = new Image();
tilesetImage.src = tilesetURL;
tilesetImage.onload = function () {
    drawScreen();
};

function displayMessage(mes){
    document.getElementById('message').innerText = mes;
    message = '';
}

function waitForInput(isTalking){
    setGameState('waitingInput');
    if(isTalking){
        setGameState('stillTalking');
    }else{
        clearGameState('stillTalking');
    }
    drawWindowCommon(message);

    return new Promise(resolve => {
        window.addEventListener('keydown', function keydownListener(e) {
            clearGameState('waitingInput');
            setGameState('afterMessage');
            window.removeEventListener('keydown', keydownListener);
            resolve();
        });
        window.addEventListener('touchstart', function keydownListener(e) {
            clearGameState('waitingInput');
            setGameState('afterMessage');
            window.removeEventListener('touchstart', keydownListener);
            resolve();
        });
    });
}

function changeCode(){
    setGameState('waitingInput');
    drawWindowCommon(message);

    return new Promise(resolve => {
        window.addEventListener('keydown', function keydownListener(e) {
            switch (e.key) {
                case 'ArrowUp':
                    code = modAdd(code, -1, codeMax);
                    updateTextExplainSave();
                    drawWindowCommon(textExplainSave);
                    break;
                case 'ArrowDown':
                    code = modAdd(code, 1, codeMax);
                    updateTextExplainSave();
                    drawWindowCommon(textExplainSave);
                    break;
                default:
                    calcCodeToFlags();
                    clearGameState('waitingInput');
                    setGameState('afterMessage');
                    window.removeEventListener('keydown', keydownListener);
                    resolve();
                    break;
            }
        });
        window.addEventListener('touchstart', function keydownListener(e) {
            // タッチ位置を取得
            var touchX = e.touches[0].clientX;
            var touchY = e.touches[0].clientY;

            // タッチ位置と中央位置の差を計算
            var deltaX = touchX - centerX;
            var deltaY = touchY - centerY;

            // 差の絶対値が大きい方に動く方向を設定
            if(centerLeftX < touchX - canvas.getBoundingClientRect().left 
            && touchX - canvas.getBoundingClientRect().left < centerRightX 
            && centerTopY < touchY - canvas.getBoundingClientRect().top 
            && touchY - canvas.getBoundingClientRect().top < centerBottomY){
                calcCodeToFlags();
                clearGameState('waitingInput');
                setGameState('afterMessage');
                window.removeEventListener('touchstart', keydownListener);
                resolve();
            }else if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // 左右移動
                calcCodeToFlags();
                clearGameState('waitingInput');
                setGameState('afterMessage');
                window.removeEventListener('touchstart', keydownListener);
                resolve();
            } else {
                // 上下移動
                const dy = deltaY > 0 ? 1 : -1;
                code = modAdd(code, dy, codeMax);
                textExplainSave = [
                    `きろく：${code}`
                ];
                drawWindowCommon(textExplainSave);
            }
        });
    });
}

function movePlayer(x, y){
    playerPosition.x = x;
    playerPosition.y = y;
}

function playerKilled(){
    movePlayer(51, 51);
}

function screenXToWorldX(screenX){
    return modAdd(playerPosition.x - screenWidth/2, screenX, mapWidth);
}

function screenYToWorldY(screenY){
    return modAdd(playerPosition.y - screenHeight/2, screenY, mapHeight);
}

function drawTile(x, y, index){
    var offsetX = 3;
    var offsetY = 2;
    var offsetTile = 1;
    var tileRowLength = 25;
    var src = tilesetImage;
    ctx.drawImage(src, offsetX+(index % tileRowLength) * (tileSize+offsetTile), offsetY+Math.floor(index / tileRowLength) * (tileSize+offsetTile), tileSize, tileSize, x * displayTileSize, y * displayTileSize, displayTileSize, displayTileSize);
}
function drawCharacter(x, y, index){
    var offsetX = 8;
    var offsetY = 8;
    var offsetTile = 8;
    var tileRowLength = 14;
    var src = characterImage;
    ctx.drawImage(src, offsetX+(index % tileRowLength) * (tileSize+offsetTile), offsetY+Math.floor(index / tileRowLength) * (tileSize+offsetTile), tileSize, tileSize, x * displayTileSize, y * displayTileSize, displayTileSize, displayTileSize);
}
function drawMap(){
    for (var y = 0; y <= screenHeight; y++) {
        for (var x = 0; x <= screenWidth; x++) {
            var tileIndex = mapData[screenYToWorldY(y)][screenXToWorldX(x)];
            if(tileIndex >= 350) tileIndex -= 12*25;
            if(x === screenWidth/2 && y === screenHeight/2){
                drawCharacter(x, y, playerIndex);
                playerIndex = modAdd(playerIndex, 2, 2) + playerStyle;
            }else{
                drawTile(x, y, tileIndex);
            }
        }
    }
}
function drawPoint(){
    let dx = gameFlags.sunStone.location.x - playerPosition.x;
    let dy = gameFlags.sunStone.location.y - playerPosition.y;
    let ns = (dx > 0 ? '東' : '西');
    let ew = (dy > 0 ? '南' : '北');
    dx = (dx > 0 ? dx : -dx);
    dy = (dy > 0 ? dy : -dy);
    let x = playerPosition.x;
    let y = playerPosition.y;
    let tile = mapData[playerPosition.y][playerPosition.x];
    if(getGameFlag('roraLove')) document.getElementById('point').innerText = `ローラ「ラダトーム城まで${ns}へ${dx} ${ew}へ${dy}ですわ」`;
    else if(getGameState('debug')) document.getElementById('point').innerText = `x: ${x}, y: ${y}, tile: ${tile}`;
}
function drawWindow(x, y, width, height, textArray) {
    // 背景
    ctx.fillStyle = 'black';
    ctx.fillRect(x, y, width, height);

    // 枠
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 5; // 枠の太さ
    ctx.lineJoin = 'round'; // 角を丸くする
    ctx.strokeRect(x, y, width, height);

    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2; // 枠の太さ
    ctx.lineJoin = 'round'; // 角を丸くする
    ctx.strokeRect(x - 2, y - 2, width + 4, height + 4);

    // テキスト
    ctx.fillStyle = 'white';
    ctx.font = '16px cinecaption';
    // ctx.font = '16px Arial';

    let textX = x + displayTileSize / 2;
    let textY = y + displayTileSize;

    for (let i = 0; i < textArray.length; i++) {
        ctx.fillText(textArray[i], textX, textY);
        textY += displayTileSize;
    }
}

function drawWindowPlayerInfo(){
    const text = [
        'ソルト',
        'レベル　1',
        'HP　　15',
        'MP　　 0',
        'G 　　 0',
        'E 　　 0'
    ];

    const x = displayTileSize / 2;
    const y = displayTileSize / 2;
    const width = displayTileSize * 4;
    const height = displayTileSize * (text.length + 0.5);

    drawWindow(x, y, width, height, text);
}
const textSelectCommand = ['つよさ', 'じゅもん', 'どうぐ', 'きろく'];
const cursor = '▶';

function getTextSelect() {
    if (
        textExplainIndex >= 0 &&
        textExplainIndex < textSelectCommand.length
    ) {
        const selectedText = textSelectCommand[textExplainIndex];
        return textSelectCommand.map(text =>
            text === selectedText ? `${cursor}${text}` : `　${text}`
        );
    } else {
        return 'getSelectExplain() has error.';
    }
}

function drawWindowPlayerCommand(text){
    const playerCommandWidth = displayTileSize * 4.5;
    const playerCommandHeight = displayTileSize * 4.5;
    const playerCommandX = displayTileSize * screenWidth - playerCommandWidth - displayTileSize / 2;
    const playerCommandY = displayTileSize / 2;

    const playerCommandText = text;

    drawWindow(playerCommandX, playerCommandY, playerCommandWidth, playerCommandHeight, playerCommandText);
}
let textExplainIndex = 0;

const textExplainCommand = [
    [
        'つよさ：',
        '　あなたの つよさは あなたがきめよう',
        '　でも きゃっかんてきには こうみえてます'
    ],
    [
        'じゅもん：',
        '　あなたの つかえる じゅもんりすと',
        '　MPの ごりようは けいかくてきに'
    ],
    [
        'どうぐ：',
        '　あなたの もっている どうぐたち',
        '　でもほぼ ふらぐの りすとです'
    ],
    [
        'きろく：',
        '　あなたの ぼうけんを きろくしよう',
        '　がめんを とじちゃうと だいさんじ'
    ]
];

function getTextExplain() {
    if (textExplainIndex >= 0 && textExplainIndex < textExplainCommand.length) {
        return textExplainCommand[textExplainIndex];
    } else {
        return 'getTextExplain() has error.';
    }
}

function drawWindowCommon(text){
    const commonWidth = displayTileSize * (screenWidth - 1);
    const commonHeight = displayTileSize * 4;
    const commonX = displayTileSize / 2;
    const commonY = displayTileSize * screenHeight - commonHeight - displayTileSize / 2;

    const commonText = text;

    drawWindow(commonX, commonY, commonWidth, commonHeight, commonText);
    message = '';
}
function drawWindowPlayerStrength(){
    const text = [
        '　　ちから：　　　10',
        '　すばやさ：　　　 4',
        'こうげき力：　　　10',
        '　しゅび力：　　　 4',
        '　ぶき：　　　　なし',
        'よろい：　ぬののふく',
        '　たて：　　　　なし'
    ];

    const width = displayTileSize * 8;
    const height = displayTileSize * (text.length + 0.5);
    const x = displayTileSize * screenWidth - width - displayTileSize / 2;
    const y = displayTileSize / 2;

    drawWindow(x, y, width, height, text);
}
const textExplainPlayerSpellList = [
    'おぼえたじゅもん：'
];
function drawWindowPlayerSpell(){
    const text = [
        ' ホイミ',
        ' ギラ',
        ' ラリホー',
        ' レミーラ',
        ' マホトーン',
        ' リレミト',
        ' ルーラ',
        ' トヘロス',
        ' ベホイミ',
        ' ベギラマ'
    ];

    const width = displayTileSize * 5;
    const height = displayTileSize * (text.length + 0.5);
    const x = displayTileSize * screenWidth - width - displayTileSize;
    const y = displayTileSize;

    drawWindow(x, y, width, height, text);
}
function drawWindowPlayerItem(){
    const text = [
        ' やくそう　　 6',
        ' かぎ　　　　 4',
        ' たいようのいし',
        ' たいまつ',
        ' せいすい',
        ' せいすい',
        ' せいすい',
        ' せいすい',
        ' せいすい',
        ' せいすい'
    ];

    const width = displayTileSize * 6;
    const height = displayTileSize * (text.length + 0.5);
    const x = displayTileSize * screenWidth - width - displayTileSize;
    const y = displayTileSize;

    drawWindow(x, y, width, height, text);
}
function calcFlagsToCode(){
    code = 0;
    for (const flagName in gameFlags) {
        if (getGameFlag(flagName)) {
            code |= gameFlags[flagName].flag << gameFlags[flagName].bit;
        }
    }
}
function calcCodeToFlags(){
    for (const flagName in gameFlags) {
        gameFlags[flagName].flag = code >> gameFlags[flagName].bit;
    }
    // console.log(code);
}
function drawCommandMenu() {
    if(isCommandMenuLevel > 0){
        drawWindowPlayerInfo();
        drawWindowPlayerCommand(getTextSelect());
        if(isCommandMenuLevel === 1){
            drawWindowCommon(getTextExplain());
        }
    }
    if(isCommandMenuLevel > 1){
        switch (textExplainIndex){
            case commandMenuStrength:
                drawWindowPlayerStrength();
                drawWindowCommon(textExplainPlayerSpellList);
                break;
            case commandMenuSpell:
                drawWindowPlayerSpell();
                break;
            case commandMenuItem:
                drawWindowPlayerItem();
                break;
            case commandMenuSave:
                calcFlagsToCode();
                textExplainSave = [
                    `きろく：${code}`
                ];
                drawWindowCommon(textExplainSave);
                break;
            default:
                break;
        }
    }

    // 他のテキストやボタンを描画するロジックもここに追加
}
function drawTapArea(){
    if(!getGameState('touch')) return;
    ctx.beginPath();
    ctx.moveTo(centerLeftX, centerTopY);
    ctx.lineTo(centerRightX, centerTopY);
    ctx.lineTo(centerRightX, centerBottomY);
    ctx.lineTo(centerLeftX, centerBottomY);
    ctx.lineTo(centerLeftX, centerTopY);
    ctx.strokeStyle = 'red';
    ctx.stroke();
    ctx.closePath();
}

function drawScreen() {
    drawMap();
    drawPoint();
    drawTapArea();
    drawCommandMenu();
}

function isMoveAllowed(x, y) {
    if(getGameState('debug')) return true;
    switch (mapData[y][x]){
        case 25://城
        case 26://町
        case 27://平原
        case 28://森
        case 29://山
        case 31://洞窟
        case 32://外階段
        case 33://砂漠
        case 34://毒沼
        case 35://橋
            return true;
    }
    return false;
}

let lastTime = 0;
let count = 0;
async function gameLoop(timestamp){
    const deltaTime = timestamp - lastTime;
    if(!getGameState('waitingInput')){
        if(deltaTime > interval){
            playerIndex = modAdd(playerIndex, 1, 2) + playerStyle;
            lastTime = timestamp;
        }else if(getGameState('debug')){
            let x = modAdd(playerPosition.x, moveX, mapWidth);
            let y = modAdd(playerPosition.y, moveY, mapHeight);
            
            movePlayer(x, y);
        }
        if (!isCommandMenuLevel && (moveX !== 0 || moveY !== 0)) {
            let x = modAdd(playerPosition.x, moveX, mapWidth);
            let y = modAdd(playerPosition.y, moveY, mapHeight);
            
            if(count++ % 6 === 0 && isMoveAllowed(x, y)){
                movePlayer(x, y);
            }else if(getGameState('afterMessage') && isMoveAllowed(x, y)){
                clearGameState('afterMessage');
                movePlayer(x, y);
            }
        }
        
            
    }
    drawScreen();
    await checkConditions();
    drawScreen();
    requestAnimationFrame(gameLoop);
}

let moveX = 0;
let moveY = 0;
let keyDownMap = {}; // キーが押されているかどうかを管理するオブジェクト

window.addEventListener('keydown', function (e) {
    if(getGameState('stillTalking')){
        return;
    }
    clearGameState('waitingInput');
    setGameState('afterMessage');

    // キーが押されている状態を記録
    keyDownMap[e.key] = true;

    switch (e.key) {
        case 'ArrowUp':
            moveY = -1;
            if(isCommandMenuLevel > 0){
                textExplainIndex = modAdd(textExplainIndex, moveY, 4);
            }
            break;
        case 'ArrowDown':
            moveY = 1;
            if(isCommandMenuLevel > 0){
                textExplainIndex = modAdd(textExplainIndex, moveY, 4);
            }
            break;
        case 'ArrowLeft':
            moveX = -1;
            break;
        case 'ArrowRight':
            moveX = 1;
            break;
        case 'c':
            isCommandMenuLevel = modAdd(isCommandMenuLevel, 1, maxLevel);
            break;
        case 'd':
            if(getGameState('debug')){
                clearGameState('debug');
            }else{
                setGameState('debug');
            }
            break;
        default:
            break;
    }
});

window.addEventListener('keyup', function (e) {
    // キーが離されたら、そのキーの状態をリセット
    keyDownMap[e.key] = false;

    switch (e.key) {
        case 'ArrowUp':
        case 'ArrowDown':
            moveY = 0;
            break;
        case 'ArrowLeft':
        case 'ArrowRight':
            moveX = 0;
            break;
        default:
            break;
    }

    // 全ての方向のキーが離された場合、移動を停止
    if (!Object.values(keyDownMap).includes(true)) {
        moveX = 0;
        moveY = 0;
    }
});

// タッチデバイスの場合にはデフォルトのスクロールを防ぐ
if ('ontouchstart' in window) {
    document.body.style.touchAction = 'none';
}

window.addEventListener('touchstart', function (e) {
    setGameState('touch');
    if(getGameState('stillTalking')){
        return;
    }
    clearGameState('waitingInput');
    setGameState('afterMessage');
    let x = playerPosition.x;
    let y = playerPosition.y;
    // タッチ位置を取得
    var touchX = e.touches[0].clientX;
    var touchY = e.touches[0].clientY;

    // タッチ位置と中央位置の差を計算
    var deltaX = touchX - centerX;
    var deltaY = touchY - centerY;

    // 差の絶対値が大きい方に動く方向を設定
    if(centerLeftX < touchX - canvas.getBoundingClientRect().left 
    && touchX - canvas.getBoundingClientRect().left < centerRightX 
    && centerTopY < touchY - canvas.getBoundingClientRect().top 
    && touchY - canvas.getBoundingClientRect().top < centerBottomY){
        isCommandMenuLevel = modAdd(isCommandMenuLevel, 1, maxLevel);
    }else if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // 左右移動
        moveX = deltaX > 0 ? 1 : -1;
        x = modAdd(x, moveX, mapWidth);
    } else {
        // 上下移動
        moveY = deltaY > 0 ? 1 : -1;
        y = modAdd(y, moveY, mapHeight);
    }
    if(isCommandMenuLevel > 0){
        if(Math.abs(deltaX) < Math.abs(deltaY)){
            moveY = (deltaY > 0 ? 1 : -1);
            textExplainIndex = modAdd(textExplainIndex, moveY, 4);
        }
    }
    drawScreen();

    // デフォルトのスクロールを防ぐ
    e.preventDefault();
});

window.addEventListener('touchend', function (e) {
    moveX = 0;
    moveY = 0;
});

window.onload = function () {
    gameLoop();
};

//-----------------------------------------------------------------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------------------------------------------------------------

function isVisit(location){
    return playerPosition.x === location.x && playerPosition.y === location.y;
}
function isVisitTown(){
    const location = { x: 56, y: 49 };
    return isVisit(location);
}
function isVisitMaira(){
    return isVisit(gameFlags.fairyFlute.location);
}
function isVisitCaveNorth(){
    const location = { x: 112, y: 52 };
    return isVisit(location);
}
function isVisitCaveSouth(){
    const location = { x: 112, y: 57 };
    return isVisit(location);
}
function isVisitCave(){
    return isVisitCaveNorth() || isVisitCaveSouth();
}
function isVisitRimurudaru(){
    return isVisit(gameFlags.magicKey.location);
}
function isVisitCastle(){
    return isVisit(gameFlags.sunStone.location);
}
function isVisitGarai(){
    return isVisit(gameFlags.silverHerp.location);
}
function isVisitMairaShrine(){
    return isVisit(gameFlags.rainCloudStuff.location);
}
function isVisitMerukidoGate(){
    return isVisit(gameFlags.golemKilled.location);
}
function isVisitMerukido(){
    const location = gameFlags.golemKilled.location;
    location.y += 2;
    return isVisit(location);
}
function isVisitRotoEmblem(){
    return isVisit(gameFlags.rotoEmblem.location);
}
function isVisitDomudora(){
    return isVisit(gameFlags.rotoArmor.location);
}
function isVisitRimurudaruShrine(){
    return isVisit(gameFlags.rainbowDrop.location);
}
function isVisitRainbowBridge(){
    return isVisit(gameFlags.rainbowBridge.location);
}
function isVisitDragonCastle(){
    return isVisit(gameFlags.lightBall.location);
}

async function checkConditions() {
    document.getElementById('point').style.display = 'none';
    message = '';
    if(isVisitMaira()){
        if(!getGameFlag('fairyFlute')){
            setGameFlag('fairyFlute');
            message = [
                'ここはマイラの村だ',
                '温泉で有名らしい',
                '温泉の近くに何か落ちている...'
            ];
            await waitForInput(true);
            message = ['妖精の笛を手に入れた！'];
            await waitForInput(false);
        }else{
            message = [
                'ここはマイラの村だ',
                '温泉で有名らしい'
            ];
            await waitForInput(false);
        }
    }else if(isVisitCave()){
        if(!getGameFlag('roraRescued')){
            if(!getGameFlag('magicKey')){
                message = [
                    '洞窟の中に扉があったが',
                    '鍵が無いので開けられなかった...'
                ];
                await waitForInput(false);
            }else{
                setGameFlag('roraRescued');
                message = [
                    '魔法の鍵で扉を開けた！',
                    'ドラゴンを倒してローラ姫を救出した！'
                ];
                await waitForInput(false);
                playerStyle = playerStyleWithRora;
            }
        }else{
            message = [
                '倒したドラゴンのことは',
                '今度片付けよう'
            ];
            await waitForInput(false);
        }
        if(isVisitCaveNorth()){
            playerPosition.y = 57;
        }else if(isVisitCaveSouth()){
            playerPosition.y = 52;
        }
    }else if(isVisitRimurudaru()){
        if(!getGameFlag('magicKey')){
            setGameFlag('magicKey');
            message = [
                'ここはリムルダールの町だ',
                '店で魔法の鍵を手に入れた！'
            ];
            await waitForInput(false);
        }else{
            message = ['ここはリムルダールの町だ'];
            await waitForInput(false);
        }
    }else if(isVisitCastle()){
        message = ['ここはラダトームの城だ'];
        await waitForInput(true);
        if(getGameFlag('lightBall')){
            message = [
                '王様「勇者よ！よくぞりゅうおうを倒してくれた！',
                '　　　わしに代わってこの国を治めてくれい！　　」'
            ];
            await waitForInput(true);
            message = ['しかし あなたは いいました（←！？）'];
            await waitForInput(true);
            message = [
                '勇者「自分の治める国があるなら',
                '　　　それは自分で探したいのです」'
            ];
            await waitForInput(true);
            message = [
                'ローラ姫「私も連れて行ってください！」',
                'ローラ姫は 返事も聞かずに隣に立った！'
            ];
            await waitForInput(true);
            message = ['～THE END～'];
            await waitForInput(false);
        }else{
            if(!getGameFlag('roraLove') && getGameFlag('roraRescued')){
                setGameFlag('roraLove');
                playerStyle = playerStyleFull;
                message = ['王様「ローラ姫！」'];
                await waitForInput(true);
                message = [
                    '王様「なんと！ドラゴンに囚われておったのか',
                    '　　　よくぞローラ姫を救い出してくれた！」'
                ];
                await waitForInput(true);
                message = [
                    'ローラ姫「ありがとうございます...//」',
                    'おうじょのあいを手に入れた！'
                ];
                await waitForInput(false);
            }else{
                if(!getGameFlag('start')){
                    setGameFlag('start');
                    message = [
                        '王様「勇者よ！りゅうおうを倒すのだ！',
                        '　　　光の玉を取り返し',
                        '　　　世界の闇を振り払え！」'
                    ];
                    await waitForInput(true);
                }
                if(!getGameFlag('sunStone')){
                    if(getGameFlag('magicKey')){
                        setGameFlag('sunStone');
                        message = ['城の裏で鍵を使い太陽の石を手に入れた！'];
                        await waitForInput(false);
                    }else{
                        message = ['王様「こんな時にローラ姫はどこへ...」'];
                        await waitForInput(false);
                    }
                }else{
                    if(playerStyle === playerStyleNormal){
                        message = [
                            '王様「もし敵にやられてしまったら',
                            '　　　ここまで運び込まれるのじゃ」'
                        ];
                        await waitForInput(true);
                        message = [
                            '王様「所持金の概念が無くて良かったのう',
                            '　　　我が城の兵士を動かすのも',
                            '　　　タダというわけではないんじゃが… 」'
                        ];
                        await waitForInput(false);
                    }else{
                        message = [
                            '王様「ローラ姫を助けるくだりが',
                            '　　　正直ほとんど無かったじゃろう」'
                        ];
                        await waitForInput(true);
                        message = [
                            '王様「装備の概念も少なすぎるから',
                            '　　　一応見た目だけ 剣と盾を与えてあるぞ',
                            '　　　せめてもの計らいに 感謝してくれ　　」'
                        ];
                        await waitForInput(false);
                    }
                }
            }
        }
    }else if(isVisitGarai()){
        if(!getGameFlag('silverHerp')){
            if(getGameFlag('magicKey')){
                setGameFlag('silverHerp');
                message = [
                    'ここはガライの町だ',
                    '吟遊詩人ガライの墓があるらしい',
                    '隠し通路の鍵を開けてダンジョンに挑んだ！'
                ];
                await waitForInput(true);
                message = ['ガライの墓で銀の竪琴を手に入れた！'];
                await waitForInput(false);
            }else{
                message = [
                    'ここはガライの町だ',
                    '吟遊詩人ガライの墓があるらしい',
                    '隠し通路を見つけたが鍵がかかっている...'
                ];
                await waitForInput(false);
            }
        }else{
            message = [
                'ここはガライの町だ',
                '吟遊詩人ガライの墓があるらしい'
            ];
            await waitForInput(false);
        }
    }else if(isVisitMairaShrine()){
        if(!getGameFlag('rainCloudStuff')){
            if(!getGameFlag('silverHerp')){
                message = ['老人「銀の竪琴の音色を聞きたいなあ...」'];
                await waitForInput(false);
            }else{
                setGameFlag('rainCloudStuff');
                message = [
                    '老人「おお！それは銀の竪琴ではないか！',
                    '　　　そなたに雨雲の杖を授けよう！　　」',
                    '雨雲の杖を手に入れた！'
                ];
                await waitForInput(false);
            }
        }else{
            message = ['老人「もう思い残すことはないわいﾋﾟﾛﾋﾟﾛ」'];
            await waitForInput(false);
        }
    }else if(isVisitMerukidoGate()){
        if(!getGameFlag('golemKilled')){
            if(!getGameFlag('fairyFlute')){
                message = [
                    'ゴーレムが現れた！',
                    '動きを止めないと勝ち目がない...！',
                    'しんでしまった...'
                ];
                await waitForInput(false);
                playerKilled();
            }else{
                setGameFlag('golemKilled');
                message = [
                    '妖精の笛でゴーレムを眠らせた！',
                    'ゴーレムを倒した！'
                ];
                await waitForInput(false);
            }
        }
    }else if(isVisitMerukido()){
        if(!getGameFlag('rotoEmblem')){
            const dx = gameFlags.rotoEmblem.location.x - gameFlags.sunStone.location.x;
            const dy = gameFlags.rotoEmblem.location.y - gameFlags.sunStone.location.y;
            message = [
                '老人「ラダトーム城まで',
                `西に${dx} 北に${dy}`,
                'の場所を調べなされ！」'
            ];
            await waitForInput(false);
        }else{
            message = ['老人「てか おうじょのあい 重くない？」'];
            await waitForInput(true);
            message = ['老人「もちろん 物理的な 話なんだけど」'];
            await waitForInput(false);
        }
    }else if(isVisitRotoEmblem()){
        if(!getGameFlag('rotoEmblem')){
            setGameFlag('rotoEmblem');
            message += 'ロトのしるしを手に入れた！';
            await waitForInput(false);
        }
    }else if(isVisitDomudora()){
        if(!getGameFlag('rotoArmor')){
            setGameFlag('rotoArmor');
            message = [
                'ここはドムドーラの町だった',
                '今は廃墟となってしまっている...',
                '突然 あくまのきし が現れた！'
            ];
            await waitForInput(true);
            message = [
                'あくまのきし を倒して',
                'ロトのよろいを 手に入れた！'
            ];
            await waitForInput(false);
        }else{
            message = [
                'ここはドムドーラの町だった',
                '今は廃墟となってしまっている...'
            ];
            await waitForInput(true);
            message = [
                '何故ここにロトのよろいがあったのか',
                'その真相は製品版をお買い求めください'
            ];
            await waitForInput(false);
        }
    }else if(isVisitRimurudaruShrine()){
        if(!getGameFlag('rainbowDrop')){
            if(getGameFlag('sunStone') && getGameFlag('rainCloudStuff') && getGameFlag('rotoEmblem')){
                setGameFlag('rainbowDrop');
                message = ['老人「よくぞ太陽と雨雲を揃えた！」'];
                await waitForInput(true);
                message = [
                    '老人「ここに虹のしずくが完成した！',
                    '　　　これでりゅうおうへの',
                    '　　　道が開かれるであろう！」'
                ];
                await waitForInput(false);
            }else if(!getGameFlag('rotoEmblem')){
                message = ['老人「勇者だと？嘘をつくな！」'];
                await waitForInput(true);
                message = [
                    '老人「もし本物の勇者なら',
                    '　　　どこかにしるしがあるはずじゃ！」'
                ];
                await waitForInput(false);
            }else{
                message = ['老人「しるしを持っているな！本物の勇者じゃ」'];
                await waitForInput(true);
                message = [
                    '老人「太陽と雨雲が揃ったとき',
                    '　　　虹の橋が架かるとの言い伝えじゃ！」'
                ];
                await waitForInput(false);
            }
        }else{
            message = ['老人「前から 思ってたけど...」'];
            await waitForInput(true);
            message = [
                '老人「虹のしずくを 経由しなくても',
                '　　　全部揃ってたら 橋が架かる',
                '　　　って勘違いしない？」'
            ];
            await waitForInput(false);
        }
    }else if(isVisitRainbowBridge()){
        if(!getGameFlag('rainbowBridge') && getGameFlag('rainbowDrop')){
            setGameFlag('rainbowBridge');
            mapData[gameFlags.rainbowBridge.location.y][gameFlags.rainbowBridge.location.x-1] = 35;
            message = ['虹のしずくを使った！'];
            await waitForInput(true);
            message = ['虹の橋が架かった！'];
            await waitForInput(false);
        }
    }else if(isVisitDragonCastle()){
        if(!getGameFlag('rotoArmor')){
            message = ['りゅうおうが 現れた！'];
            await waitForInput(true);
            message = ['防御が紙なので 普通にやられてしまった！'];
            await waitForInput(true);
            message = ['どうしてこんな装備で 挑んでしまったんだ！'];
            await waitForInput(false);
            playerKilled();
        }else{
            setGameFlag('lightBall');
            message = ['りゅうおうを倒し、光の玉を手に入れた！'];
            await waitForInput(false);
        }
    }else if(isVisitTown()){
        message = [
            'きろく を へんこうできます',
            `きろく：${code}`
        ];
        await changeCode();
    }else{
        displayMessage(message);
    }
    if(getGameFlag('roraLove')) document.getElementById('point').style.display = 'block';
}