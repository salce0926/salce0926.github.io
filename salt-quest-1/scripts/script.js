// =====================================================================
// 初期設定とデータ定義 (元のロジックを完全保持)
// =====================================================================
const tilesetURL = './images/tileset.png'; // ※ご自身の環境に合わせてください
const characterURL = './images/character.png';
const enemyURL = './images/enemy.png';

const tileSize = 16;
const rate = 1.5;
const displayTileSize = tileSize * rate;

var mapWidth = typeof mapData !== 'undefined' ? mapData[0].length : 120;
var mapHeight = typeof mapData !== 'undefined' ? mapData.length : 120;

var screenWidth = 16;
var screenHeight = 16;

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

function setGameFlag(flagName) { gameFlags[flagName].flag = true; }
function clearGameFlag(flagName) { gameFlags[flagName].flag = false; }
function getGameFlag(flagName) { return gameFlags[flagName].flag; }

// =====================================================================
// 堅牢なステートマシン（状態管理）
// =====================================================================
const STATE = {
    FIELD: 'FIELD',
    MESSAGE: 'MESSAGE',
    MENU: 'MENU',
    BATTLE: 'BATTLE',
    PASSCODE: 'PASSCODE'
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

let touchStartX = 0, touchStartY = 0;
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
// ゲームデータ
// =====================================================================
let playerPosition = { x: 51, y: 51 };
let playerStyleNormal = 0, playerStyleSword = 2, playerStyleShield = 4, playerStyleFull = 6, playerStyleWithRora = 8;
let playerIndex = playerStyleNormal, playerStyle = playerStyleNormal;

let player = {
    name: 'ソルト', level: 0, hp: 15, maxHp: 15, mp: 0, maxMp: 0, gold: 0, exp: 0,
    strength: 4, agility: 4, attack: 4, defense: 2, herb: 6, key: 0,
    items: [], spells: [], weapon: 'なし', armor: 'ぬののふく', shield: 'なし'
};
let enemy = { name: 'スライム', hp: 3, maxHp: 3, attack: 5, defense: 3, exp: 1, gold: 2 };

const items = [{name:'なし',description:''},{name:'たいまつ',description:''},{name:'せいすい',description:''},{name:'キメラのつばさ',description:''},{name:'りゅうのうろこ',description:''},{name:'ようせいのふえ',description:''},{name:'せんしのゆびわ',description:''},{name:'ロトのしるし',description:''},{name:'おうじょのあい',description:''},{name:'のろいのベルト',description:''},{name:'ぎんのたてごと',description:''},{name:'しのくびかざり',description:''},{name:'たいようのいし',description:''},{name:'あまぐものつえ',description:''},{name:'にじのしずく',description:''}];
const playerStatus = [
    { level: 1, strength: 4, agility: 4, hp: 15, mp: 0, requiredExp: 0, spell: '-' },
    { level: 2, strength: 5, agility: 4, hp: 22, mp: 0, requiredExp: 7, spell: '-' },
    { level: 3, strength: 7, agility: 6, hp: 24, mp: 5, requiredExp: 23, spell: 'ホイミ' },
    { level: 4, strength: 7, agility: 8, hp: 31, mp: 16, requiredExp: 47, spell: 'ギラ' },
    { level: 5, strength: 12, agility: 10, hp: 35, mp: 20, requiredExp: 110, spell: '-' },
    { level: 6, strength: 16, agility: 10, hp: 38, mp: 24, requiredExp: 220, spell: '-' },
    { level: 7, strength: 18, agility: 17, hp: 40, mp: 26, requiredExp: 450, spell: 'ラリホー' },
    { level: 8, strength: 22, agility: 20, hp: 46, mp: 29, requiredExp: 800, spell: '-' },
    { level: 9, strength: 30, agility: 22, hp: 50, mp: 36, requiredExp: 1300, spell: 'レミーラ' },
    { level: 10, strength: 35, agility: 31, hp: 54, mp: 40, requiredExp: 2000, spell: 'マホトーン' },
    { level: 11, strength: 40, agility: 35, hp: 62, mp: 50, requiredExp: 2900, spell: '-' },
    { level: 12, strength: 48, agility: 40, hp: 63, mp: 58, requiredExp: 4000, spell: 'リレミト' },
    { level: 13, strength: 52, agility: 48, hp: 70, mp: 64, requiredExp: 5500, spell: 'ルーラ' },
    { level: 14, strength: 60, agility: 55, hp: 78, mp: 70, requiredExp: 7500, spell: '-' },
    { level: 15, strength: 68, agility: 64, hp: 86, mp: 72, requiredExp: 10000, spell: 'トヘロス' },
    { level: 16, strength: 72, agility: 70, hp: 92, mp: 95, requiredExp: 13000, spell: '-' },
    { level: 17, strength: 72, agility: 78, hp: 100, mp: 100, requiredExp: 17000, spell: 'ベホイミ' },
    { level: 18, strength: 85, agility: 84, hp: 115, mp: 108, requiredExp: 21000, spell: '-' },
    { level: 19, strength: 87, agility: 86, hp: 130, mp: 115, requiredExp: 25000, spell: 'ベギラマ' },
    { level: 20, strength: 92, agility: 88, hp: 138, mp: 128, requiredExp: 29000, spell: '-' },
    { level: 21, strength: 95, agility: 90, hp: 149, mp: 135, requiredExp: 33000, spell: '-' },
    { level: 22, strength: 97, agility: 90, hp: 158, mp: 146, requiredExp: 37000, spell: '-' },
    { level: 23, strength: 99, agility: 94, hp: 165, mp: 153, requiredExp: 41000, spell: '-' },
    { level: 24, strength: 103, agility: 98, hp: 170, mp: 161, requiredExp: 45000, spell: '-' },
    { level: 25, strength: 113, agility: 100, hp: 174, mp: 161, requiredExp: 49000, spell: '-' },
    { level: 26, strength: 117, agility: 105, hp: 180, mp: 168, requiredExp: 53000, spell: '-' },
    { level: 27, strength: 125, agility: 107, hp: 189, mp: 175, requiredExp: 57000, spell: '-' },
    { level: 28, strength: 130, agility: 115, hp: 195, mp: 180, requiredExp: 61000, spell: '-' },
    { level: 29, strength: 135, agility: 120, hp: 200, mp: 190, requiredExp: 65000, spell: '-' },
    { level: 30, strength: 140, agility: 130, hp: 210, mp: 200, requiredExp: 65535, spell: '-' }
];

const passHiraganaList = {
    0:"あ", 1:"い", 2:"う", 3:"え", 4:"お", 5:"か", 6:"き", 7:"く", 8:"け", 9:"こ",
    10:"さ", 11:"し", 12:"す", 13:"せ", 14:"そ", 15:"た", 16:"ち", 17:"つ", 18:"て", 19:"と",
    20:"な", 21:"に", 22:"ぬ", 23:"ね", 24:"の", 25:"は", 26:"ひ", 27:"ふ", 28:"へ", 29:"ほ",
    30:"ま", 31:"み", 32:"む", 33:"め", 34:"も", 35:"や", 36:"ゆ", 37:"よ", 38:"ら", 39:"り",
    40:"る", 41:"れ", 42:"ろ", 43:"わ", 44:"が", 45:"ぎ", 46:"ぐ", 47:"げ", 48:"ご", 49:"ざ",
    50:"じ", 51:"ず", 52:"ぜ", 53:"ぞ", 54:"だ", 55:"ぢ", 56:"づ", 57:"で", 58:"ど", 59:"ば",
    60:"び", 61:"ぶ", 62:"べ", 63:"ぼ"
};

let code = 0;
let pass = 'ああい';
let selectedHiraganaIndex = 0, hiraganaCursorIndex = 0;

function modAdd(x, y, mod){ let res = x + y + mod; return res % mod; }
function alignRight(number, width) { return ' '.repeat(Math.max(0, width - number.toString().length)) + number.toString(); }
function AlignRight(number, width) { return '　'.repeat(Math.max(0, width - number.toString().length)) + number.toString(); }

function addItemToPlayer(itemName) {
    const itemIndex = items.findIndex(item => item.name === itemName);
    if (itemIndex !== -1 && player.items.length < 8) player.items.push({ ...items[itemIndex]});
}
function deleteItemFromPlayer(itemName) {
    const itemIndex = player.items.findIndex(item => item.name === itemName);
    if (itemIndex !== -1) player.items.splice(itemIndex, 1);
}

function updatePlayerLevel(){
    if(player.level >= 30) return;
    const newStatus = playerStatus.find(s => s.level === player.level + 1);
    if(player.exp < newStatus.requiredExp) return;
    player.level = newStatus.level; player.strength = newStatus.strength; player.agility = newStatus.agility;
    player.attack = newStatus.strength; player.defense = newStatus.agility / 2;
    player.maxHp = newStatus.hp; player.maxMp = newStatus.mp;
    if(newStatus.spell !== '-') player.spells.push(newStatus.spell);
}

function updatePlayerItems(){
    player.armor = (getGameFlag('rotoArmor') ? 'ロトのよろい' : 'ぬののふく');
    const flagItems = [
        { itemName: 'ようせいのふえ', flagName: 'fairyFlute' }, { itemName: 'ロトのしるし', flagName: 'rotoEmblem' },
        { itemName: 'おうじょのあい', flagName: 'roraLove'}, { itemName: 'ぎんのたてごと', flagName: 'silverHerp'},
        { itemName: 'たいようのいし', flagName: 'sunStone'}, { itemName: 'あまぐものつえ', flagName: 'rainCloudStuff'},
        { itemName: 'にじのしずく', flagName: 'rainbowDrop'}
    ];
    for (const item of flagItems) {
        const hasItem = player.items.some(i => i.name === item.itemName);
        if(!hasItem && getGameFlag(item.flagName)) addItemToPlayer(item.itemName);
        else if(hasItem && !getGameFlag(item.flagName)) deleteItemFromPlayer(item.itemName);
    }
}

function getCodeByHiragana(object, value) { return Number(Object.keys(object).find(key => object[key] === value)); }
function getHiraganaFromList(index) { return passHiraganaList[index] || '？'; }
function calcFlagsToCode() {
    code = 0;
    for (const flagName in gameFlags) if (getGameFlag(flagName)) code |= gameFlags[flagName].flag << gameFlags[flagName].bit;
    pass = getHiraganaFromList((code >> 12) & 0x3F) + getHiraganaFromList((code >> 6) & 0x3F) + getHiraganaFromList(code & 0x3F);
}
function calcCodeToFlags() {
    code = (getCodeByHiragana(passHiraganaList, pass[0]) << 12) | (getCodeByHiragana(passHiraganaList, pass[1]) << 6) | getCodeByHiragana(passHiraganaList, pass[2]);
    for (const flagName in gameFlags) gameFlags[flagName].flag = (code >> gameFlags[flagName].bit) & 1;
}

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
    ctx.drawImage(enemyImage, 2, 2, 22, 18, canvas.width / 2 - 22, canvas.height / 2 - 18, 44, 36);
}
function drawEnemyWindow() {
    const w = canvas.width / 2, h = canvas.height / 2;
    const x = canvas.width / 4, y = canvas.height / 4;
    ctx.fillStyle = '#80D010'; ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = 'black'; ctx.lineWidth = 2; ctx.lineJoin = 'round'; ctx.strokeRect(x, y, w, h);
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
function drawTapArea(){ // 【復元】スマホ用タップ枠線
    if(!Input.isTouch) return;
    ctx.beginPath(); ctx.moveTo(centerLeftX, centerTopY); ctx.lineTo(centerRightX, centerTopY); ctx.lineTo(centerRightX, centerBottomY); ctx.lineTo(centerLeftX, centerBottomY); ctx.lineTo(centerLeftX, centerTopY);
    ctx.strokeStyle = 'red'; ctx.stroke(); ctx.closePath();
}
function drawPoint(){ // 【復元】ローラ姫ナビゲーション＆デバッグ座標
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

// 【復元】戦闘画面の枠と敵の描画関数
function drawEnemy() {
    ctx.drawImage(enemyImage, 2, 2, 22, 18, canvas.width / 2 - 22, canvas.height / 2 - 18, 44, 36);
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

// =====================================================================
// メッセージ＆イベントシステム
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
// フィールドロジックと全イベント
// =====================================================================
function isVisit(x, y) { return playerPosition.x === x && playerPosition.y === y; }

function playerKilled(){
    playerPosition.x = 51; playerPosition.y = 51; player.hp = player.maxHp;
}

async function interactField() {
    let handled = true;

    if (isVisit(gameFlags.fairyFlute.location.x, gameFlags.fairyFlute.location.y)) { 
        if(!getGameFlag('fairyFlute')){
            setGameFlag('fairyFlute'); addItemToPlayer('ようせいのふえ');
            await showMessage(['ここはマイラの村だ', '温泉で有名らしい', '温泉の近くに何か落ちている...']);
            await showMessage(['妖精の笛を手に入れた！']);
        } else await showMessage(['ここはマイラの村だ', '温泉で有名らしい']);
    } else if (isVisit(112, 52) || isVisit(112, 57)) { 
        if(!getGameFlag('roraRescued')){
            if(!getGameFlag('magicKey')) await showMessage(['洞窟の中に扉があったが', '鍵が無いので開けられなかった...']);
            else{
                setGameFlag('roraRescued'); playerStyle = playerStyleWithRora;
                await showMessage(['魔法の鍵で扉を開けた！', 'ドラゴンを倒してローラ姫を救出した！']);
            }
        } else await showMessage(['倒したドラゴンのことは', '今度片付けよう']);
        playerPosition.y = isVisit(112,52) ? 57 : 52;
    } else if (isVisit(gameFlags.magicKey.location.x, gameFlags.magicKey.location.y)) { 
        if(!getGameFlag('magicKey')){
            setGameFlag('magicKey'); player.key = 1;
            await showMessage(['ここはリムルダールの町だ', '店で魔法の鍵を手に入れた！']);
        }else await showMessage(['ここはリムルダールの町だ']);
    } else if (isVisit(gameFlags.sunStone.location.x, gameFlags.sunStone.location.y)) { 
        await showMessage(['ここはラダトームの城だ']);
        if(getGameFlag('lightBall')){
            await showMessage(['王様「勇者よ！よくぞりゅうおうを倒してくれた！', '　　　わしに代わってこの国を治めてくれい！　　」']);
            await showMessage(['しかし あなたは いいました（←！？）']);
            await showMessage(['勇者「自分の治める国があるなら', '　　　それは自分で探したいのです」']);
            await showMessage(['ローラ姫「私も連れて行ってください！」', 'ローラ姫は 返事も聞かずに隣に立った！']);
            await showMessage(['～THE END～']);
        } else if(!getGameFlag('roraLove') && getGameFlag('roraRescued')){
            setGameFlag('roraLove'); addItemToPlayer('おうじょのあい'); playerStyle = playerStyleFull;
            await showMessage(['王様「ローラ姫！」']);
            await showMessage(['王様「なんと！ドラゴンに囚われておったのか', '　　　よくぞローラ姫を救い出してくれた！」']);
            await showMessage(['ローラ姫「ありがとうございます...//」', 'おうじょのあいを手に入れた！']);
        } else {
            if(!getGameFlag('start')){
                setGameFlag('start');
                await showMessage(['王様「勇者よ！りゅうおうを倒すのだ！', '　　　光の玉を取り返し', '　　　世界の闇を振り払え！」']);
            }
            if(!getGameFlag('sunStone')){
                if(getGameFlag('magicKey')){
                    setGameFlag('sunStone'); addItemToPlayer('たいようのいし');
                    await showMessage(['城の裏で鍵を使い太陽の石を手に入れた！']);
                } else await showMessage(['王様「こんな時にローラ姫はどこへ...」']);
            } else {
                if(playerStyle === playerStyleNormal){
                    await showMessage(['王様「もし敵にやられてしまったら', '　　　ここまで運び込まれるのじゃ」']);
                    await showMessage(['王様「所持金の概念が無くて良かったのう', '　　　我が城の兵士を動かすのも', '　　　タダというわけではないんじゃが… 」']);
                } else {
                    await showMessage(['王様「ローラ姫を助けるくだりが', '　　　正直ほとんど無かったじゃろう」']);
                    await showMessage(['王様「装備の概念も少なすぎるから', '　　　一応見た目だけ 剣と盾を与えてあるぞ', '　　　せめてもの計らいに 感謝してくれ　　」']);
                }
            }
        }
    } else if (isVisit(gameFlags.silverHerp.location.x, gameFlags.silverHerp.location.y)) { 
        if(!getGameFlag('silverHerp')){
            if(getGameFlag('magicKey')){
                setGameFlag('silverHerp'); addItemToPlayer('ぎんのたてごと');
                await showMessage(['ここはガライの町だ', '吟遊詩人ガライの墓があるらしい', '隠し通路の鍵を開けてダンジョンに挑んだ！']);
                await showMessage(['ガライの墓で銀の竪琴を手に入れた！']);
            }else await showMessage(['ここはガライの町だ', '吟遊詩人ガライの墓があるらしい', '隠し通路を見つけたが鍵がかかっている...']);
        }else await showMessage(['ここはガライの町だ', '吟遊詩人ガライの墓があるらしい']);
    } else if (isVisit(gameFlags.rainCloudStuff.location.x, gameFlags.rainCloudStuff.location.y)) { 
        if(!getGameFlag('rainCloudStuff')){
            if(!getGameFlag('silverHerp')) await showMessage(['老人「銀の竪琴の音色を聞きたいなあ...」']);
            else{
                setGameFlag('rainCloudStuff'); addItemToPlayer('あまぐものつえ');
                await showMessage(['老人「おお！それは銀の竪琴ではないか！', '　　　そなたに雨雲の杖を授けよう！　　」']);
                await showMessage(['雨雲の杖を手に入れた！']);
            }
        }else await showMessage(['老人「もう思い残すことはないわいﾋﾟﾛﾋﾟﾛ」']);
    } else if (isVisit(gameFlags.golemKilled.location.x, gameFlags.golemKilled.location.y)) { 
        if(!getGameFlag('golemKilled')){
            if(!getGameFlag('fairyFlute')){
                await showMessage(['ゴーレムが現れた！', '動きを止めないと勝ち目がない...！', 'しんでしまった...']);
                playerKilled();
            }else{
                setGameFlag('golemKilled');
                await showMessage(['妖精の笛でゴーレムを眠らせた！', 'ゴーレムを倒した！']);
            }
        }
    } else if (isVisit(gameFlags.golemKilled.location.x, gameFlags.golemKilled.location.y + 2)) { 
        if(!getGameFlag('rotoEmblem')){
            const dx = gameFlags.rotoEmblem.location.x - gameFlags.sunStone.location.x;
            const dy = gameFlags.rotoEmblem.location.y - gameFlags.sunStone.location.y;
            await showMessage(['老人「ラダトーム城まで', `西に${dx} 北に${dy}`, 'の場所を調べなされ！」']);
        }else{
            await showMessage(['老人「てか おうじょのあい 重くない？」']);
            await showMessage(['老人「もちろん 物理的な 話なんだけど」']);
        }
    } else if (isVisit(gameFlags.rotoEmblem.location.x, gameFlags.rotoEmblem.location.y)) { 
        if(!getGameFlag('rotoEmblem')){
            setGameFlag('rotoEmblem'); addItemToPlayer('ロトのしるし');
            await showMessage(['ロトのしるしを手に入れた！']);
        }
    } else if (isVisit(gameFlags.rotoArmor.location.x, gameFlags.rotoArmor.location.y)) { 
        if(!getGameFlag('rotoArmor')){
            setGameFlag('rotoArmor');
            await showMessage(['ここはドムドーラの町だった', '今は廃墟となってしまっている...', '突然 あくまのきし が現れた！']);
            await showMessage(['あくまのきし を倒して', 'ロトのよろいを 手に入れた！']);
        }else{
            await showMessage(['ここはドムドーラの町だった', '今は廃墟となってしまっている...']);
            await showMessage(['何故ここにロトのよろいがあったのか', 'その真相は製品版をお買い求めください']);
        }
    } else if (isVisit(gameFlags.rainbowDrop.location.x, gameFlags.rainbowDrop.location.y)) { 
        if(!getGameFlag('rainbowDrop')){
            if(getGameFlag('sunStone') && getGameFlag('rainCloudStuff') && getGameFlag('rotoEmblem')){
                setGameFlag('rainbowDrop'); deleteItemFromPlayer('たいようのいし'); deleteItemFromPlayer('あまぐものつえ'); addItemToPlayer('にじのしずく');
                await showMessage(['老人「よくぞ太陽と雨雲を揃えた！」']);
                await showMessage(['老人「ここに虹のしずくが完成した！', '　　　これでりゅうおうへの', '　　　道が開かれるであろう！」']);
            }else if(!getGameFlag('rotoEmblem')){
                await showMessage(['老人「勇者だと？嘘をつくな！」']);
                await showMessage(['老人「もし本物の勇者なら', '　　　どこかにしるしがあるはずじゃ！」']);
            }else{
                await showMessage(['老人「しるしを持っているな！本物の勇者じゃ」']);
                await showMessage(['老人「太陽と雨雲が揃ったとき', '　　　虹の橋が架かるとの言い伝えじゃ！」']);
            }
        }else{
            await showMessage(['老人「前から 思ってたけど...」']);
            await showMessage(['老人「虹のしずくを 経由しなくても', '　　　全部揃ってたら 橋が架かる', '　　　って勘違いしない？」']);
        }
    } else if (isVisit(gameFlags.rainbowBridge.location.x, gameFlags.rainbowBridge.location.y)) { 
        if(!getGameFlag('rainbowBridge') && getGameFlag('rainbowDrop')){
            setGameFlag('rainbowBridge');
            if (typeof mapData !== 'undefined' && mapData[gameFlags.rainbowBridge.location.y]) {
                mapData[gameFlags.rainbowBridge.location.y][gameFlags.rainbowBridge.location.x-1] = 35;
            }
            await showMessage(['虹のしずくを使った！']);
            deleteItemFromPlayer('にじのしずく');
            await showMessage(['虹の橋が架かった！']);
        }
    } else if (isVisit(gameFlags.lightBall.location.x, gameFlags.lightBall.location.y)) { 
        if(!getGameFlag('rotoArmor')){
            await showMessage(['りゅうおうが 現れた！']);
            await showMessage(['防御が紙なので 普通にやられてしまった！']);
            await showMessage(['どうしてこんな装備で 挑んでしまったんだ！']);
            playerKilled();
        }else{
            setGameFlag('lightBall');
            await showMessage(['りゅうおうを倒し、光の玉を手に入れた！']);
        }
    } else if (isVisit(56, 49)) { 
        calcFlagsToCode();
        textExplainSave = ['じゅもん を へんこうできます', 'きろくした じゅもんに かえてね', `ふっかつのじゅもん：${pass}`];
        currentState = STATE.PASSCODE;
        return; 
    } else {
        handled = false; 
    }

    if (handled) currentState = STATE.FIELD;
    else {
        menuLevel = 1; menuCursor = 0; currentState = STATE.MENU;
    }
}

// =====================================================================
// 戦闘（バトル）システム 【本格実装版】
// =====================================================================
let battleCursor = 0;
const battleCommands = ['たたかう', 'じゅもん', 'どうぐ', 'にげる'];
let battleStateMode = 'COMMAND'; // COMMAND または SPELL
let spellCursor = 0;

async function executeBattleTurn() {
    currentState = STATE.MESSAGE; // メッセージ中は入力をロック

    if (battleCursor === 0) { // たたかう
        // ダメージ計算（乱数を加えて単調さを防ぐ）
        const damage = Math.max(1, Math.floor((player.attack - enemy.defense / 2) * (0.8 + Math.random() * 0.4)));
        enemy.hp -= damage;
        await showMessage([`${player.name}の こうげき！`, `${enemy.name}に ${damage}ポイントの`, `ダメージを あたえた！`]);
        await checkEnemySurvival();

    } else if (battleCursor === 1) { // じゅもん
        // 戦闘用の呪文だけをフィルタリング
        const combatSpells = player.spells.filter(s => ['ホイミ', 'ギラ', 'ベホイミ', 'ベギラマ'].includes(s));
        if (combatSpells.length === 0) {
            await showMessage([`せんとうに つかえる`, `じゅもんを おぼえていない！`]);
            currentState = STATE.BATTLE;
        } else {
            battleStateMode = 'SPELL'; // 呪文選択ウィンドウへ移行
            spellCursor = 0;
            currentState = STATE.BATTLE;
        }

    } else if (battleCursor === 2) { // どうぐ（やくそう）
        if (player.herb > 0) {
            player.herb--;
            const heal = 25 + Math.floor(Math.random() * 10);
            player.hp = Math.min(player.maxHp, player.hp + heal);
            await showMessage([`${player.name}は やくそうを つかった！`, `HPが ${heal} かいふくした！`]);
            await executeEnemyTurn();
        } else {
            await showMessage([`つかえる どうぐを もっていない！`]);
            currentState = STATE.BATTLE;
        }

    } else if (battleCursor === 3) { // にげる
        // 敏捷性による逃走確率の判定
        const escapeChance = player.agility >= enemy.agility ? 0.75 : 0.5;
        if (Math.random() < escapeChance) {
            await showMessage([`${player.name}は にげだした！`]);
            currentState = STATE.FIELD;
        } else {
            await showMessage([`${player.name}は にげだした！`, `しかし まわりこまれてしまった！`]);
            await executeEnemyTurn();
        }
    }
}

async function executeSpellTurn(spellName) {
    currentState = STATE.MESSAGE;
    let mpCost = 0, heal = 0, damage = 0;
    
    // 呪文の性能定義
    if (spellName === 'ホイミ') { mpCost = 3; heal = 30; }
    else if (spellName === 'ベホイミ') { mpCost = 8; heal = 85; }
    else if (spellName === 'ギラ') { mpCost = 2; damage = 10 + Math.floor(Math.random() * 6); }
    else if (spellName === 'ベギラマ') { mpCost = 5; damage = 35 + Math.floor(Math.random() * 15); }

    if (player.mp < mpCost) {
        await showMessage([`MPが たりない！`]);
        currentState = STATE.BATTLE;
        return;
    }

    player.mp -= mpCost;
    await showMessage([`${player.name}は ${spellName}を となえた！`]);

    if (heal > 0) {
        const actualHeal = Math.floor(heal * (0.9 + Math.random() * 0.2));
        player.hp = Math.min(player.maxHp, player.hp + actualHeal);
        await showMessage([`${player.name}の HPが ${actualHeal} かいふくした！`]);
    } else if (damage > 0) {
        enemy.hp -= damage;
        await showMessage([`${enemy.name}に ${damage}ポイントの`, `ダメージを あたえた！`]);
    }

    battleStateMode = 'COMMAND'; // 呪文使用後は通常コマンドに戻る
    await checkEnemySurvival();
}

async function checkEnemySurvival() {
    if (enemy.hp <= 0) {
        await showMessage([`${enemy.name}を たおした！`]);
        await showMessage([`${enemy.exp}の けいけんちと`, `${enemy.gold}ゴールドを てにいれた！`]);
        
        player.exp += enemy.exp;
        player.gold += enemy.gold;
        
        // レベルアップの判定
        const oldLevel = player.level;
        updatePlayerLevel(); 
        if (player.level > oldLevel) {
            await showMessage([`${player.name}は レベル${player.level}に あがった！`]);
        }
        
        battleStateMode = 'COMMAND';
        currentState = STATE.FIELD;
    } else {
        await executeEnemyTurn();
    }
}

async function executeEnemyTurn() {
    const damage = Math.max(1, Math.floor((enemy.attack - player.defense / 2) * (0.8 + Math.random() * 0.4)));
    player.hp -= damage;
    await showMessage([`${enemy.name}の こうげき！`, `${player.name}に ${damage}ポイントの`, `ダメージを あたえた！`]);
    
    if (player.hp <= 0) {
        await showMessage([`${player.name}は しんでしまった！`]);
        playerKilled();
        battleStateMode = 'COMMAND';
        currentState = STATE.FIELD;
    } else {
        currentState = STATE.BATTLE;
    }
}

function updateBattle() {
    if (battleStateMode === 'COMMAND') {
        if (Input.consume('ArrowUp')) battleCursor = modAdd(battleCursor, -1, 4);
        if (Input.consume('ArrowDown')) battleCursor = modAdd(battleCursor, 1, 4);
        if (Input.consume(' ')) executeBattleTurn();
    } else if (battleStateMode === 'SPELL') {
        // ホイミやギラなど、戦闘で使える呪文のみを抽出
        const combatSpells = player.spells.filter(s => ['ホイミ', 'ギラ', 'ベホイミ', 'ベギラマ'].includes(s));
        const options = [...combatSpells, 'もどる'];
        if (Input.consume('ArrowUp')) spellCursor = modAdd(spellCursor, -1, options.length);
        if (Input.consume('ArrowDown')) spellCursor = modAdd(spellCursor, 1, options.length);
        if (Input.consume(' ')) {
            if (spellCursor === options.length - 1) {
                battleStateMode = 'COMMAND'; // キャンセルして戻る
            } else {
                executeSpellTurn(options[spellCursor]);
            }
        }
    }
}

function drawBattle() {
    drawWindowBattleEnemy();
    drawWindowPlayerInfo();

    if (battleStateMode === 'COMMAND') {
        let cmdText = battleCommands.map((c, i) => (i === battleCursor ? `▶${c}` : `　${c}`));
        drawWindow(displayTileSize * screenWidth - displayTileSize * 4.5 - displayTileSize / 2, displayTileSize / 2, displayTileSize * 4.5, displayTileSize * 4.5, cmdText);
        drawWindowCommon(['コマンド？']);
    } else if (battleStateMode === 'SPELL') {
        const combatSpells = player.spells.filter(s => ['ホイミ', 'ギラ', 'ベホイミ', 'ベギラマ'].includes(s));
        const options = [...combatSpells, 'もどる'];
        let spellText = options.map((s, i) => (i === spellCursor ? `▶${s}` : `　${s}`));
        drawWindow(displayTileSize * screenWidth - displayTileSize * 5.5 - displayTileSize / 2, displayTileSize / 2, displayTileSize * 5.5, displayTileSize * (options.length + 0.5), spellText);
        drawWindowCommon(['じゅもん？']);
    }
}

// =====================================================================
// メニューロジック
// =====================================================================
let menuLevel = 0, menuCursor = 0;
const commandList = ['つよさ', 'じゅもん', 'どうぐ', 'きろく'];

function updateMenu() {
    if (Input.consume('ArrowUp')) menuCursor = modAdd(menuCursor, -1, 4);
    if (Input.consume('ArrowDown')) menuCursor = modAdd(menuCursor, 1, 4);

    if (Input.consume(' ')) {
        if (menuLevel === 1) {
            menuLevel = 2; 
            if (menuCursor === 3) calcFlagsToCode();
        } else if (menuLevel === 2) {
            menuLevel = 0; currentState = STATE.FIELD; 
        }
    }
}

function drawMenu() {
    drawWindowPlayerInfo();
    let cmdText = commandList.map((c, i) => (i === menuCursor ? `▶${c}` : `　${c}`));
    drawWindow(displayTileSize * screenWidth - displayTileSize * 4.5 - displayTileSize / 2, displayTileSize / 2, displayTileSize * 4.5, displayTileSize * 4.5, cmdText);

    if (menuLevel === 1) {
        const explains = [
            ['つよさ：', '　あなたの つよさは あなたがきめよう', '　でも きゃっかんてきには こうみえてます'],
            ['じゅもん：', '　あなたの つかえる じゅもんりすと', '　MPの ごりようは けいかくてきに'],
            ['どうぐ：', '　あなたの もっている どうぐたち', '　でもほぼ ふらぐの りすとです'],
            ['きろく：', '　あなたの ぼうけんを きろくしよう', '　がめんを とじちゃうと だいさんじ']
        ];
        drawWindowCommon(explains[menuCursor]);
    } else if (menuLevel === 2) {
        if (menuCursor === 0) { 
            const stats = [
                `　　ちから：　　　${alignRight(player.strength, 3)}`, `　すばやさ：　　　${alignRight(player.agility, 3)}`,
                `こうげき力：　　　${alignRight(player.strength, 3)}`, `　しゅび力：　　　${alignRight(Math.floor(player.agility/2), 3)}`,
                `　ぶき：${AlignRight(player.weapon, 7)}`, `よろい：${AlignRight(player.armor, 7)}`, `　たて：${AlignRight(player.shield, 7)}`
            ];
            drawWindow(displayTileSize * screenWidth - displayTileSize * 8.5 - displayTileSize / 2, displayTileSize / 2, displayTileSize * 8.5, displayTileSize * 7.5, stats);
            drawWindowCommon(['おぼえたじゅもん：']);
        } else if (menuCursor === 1) { 
            drawWindow(displayTileSize * screenWidth - displayTileSize * 6, displayTileSize, displayTileSize * 5, displayTileSize * (player.spells.length || 1 + 1), player.spells.length ? player.spells : ['なし']);
        } else if (menuCursor === 2) { 
            let itemsText = [];
            if (player.herb > 0) itemsText.push(`やくそう　　　${player.herb}`);
            if (player.key > 0) itemsText.push(`かぎ　　　　　${player.key}`);
            itemsText = itemsText.concat(player.items.map(i => i.name));
            drawWindow(displayTileSize * screenWidth - displayTileSize * 7, displayTileSize, displayTileSize * 6, displayTileSize * (itemsText.length + 1), itemsText);
        } else if (menuCursor === 3) { 
            drawWindowCommon([`じかい まちで にゅうりょくしてください`, `しろの みぎうえの まちです`, `ふっかつのじゅもん：${pass}`]);
        }
    }
}

// =====================================================================
// フィールド移動とデバッグ操作
// =====================================================================
let moveTimer = 0;
function isMoveAllowed(x, y) {
    if (debugMode) return true;
    if (typeof mapData === 'undefined' || !mapData[y] || mapData[y][x] === undefined) return false;
    return [25, 26, 27, 28, 29, 31, 32, 33, 34, 35].includes(mapData[y][x]);
}

function updateField() {
    if (Input.consume('d')) { debugMode = !debugMode; }
    if (Input.consume('l')) { player.exp++; updatePlayerLevel(); }
    
    // 【復元】Bキーでエンカウントテスト
    if (Input.consume('b')) {
        enemy.hp = enemy.maxHp;
        battleCursor = 0;
        showMessage([`${enemy.name}が あらわれた！`]).then(() => {
            if (currentState !== STATE.FIELD) currentState = STATE.BATTLE;
        });
        return;
    }

    if (Input.consume(' ')) {
        interactField();
        return;
    }

    let dx = 0, dy = 0;
    if (Input.isDown('ArrowUp')) dy = -1;
    else if (Input.isDown('ArrowDown')) dy = 1;
    else if (Input.isDown('ArrowLeft')) dx = -1;
    else if (Input.isDown('ArrowRight')) dx = 1;

    if (dx !== 0 || dy !== 0) {
        moveTimer++;
        if (moveTimer >= 6) { 
            let nx = modAdd(playerPosition.x, dx, mapWidth);
            let ny = modAdd(playerPosition.y, dy, mapHeight);
            if (isMoveAllowed(nx, ny)) {
                playerPosition.x = nx;
                playerPosition.y = ny;
            }
            moveTimer = 0;
        }
    } else moveTimer = 0; 
}

// =====================================================================
// パスワード入力ロジック
// =====================================================================
let textExplainSave = [];
function updatePasscode() {
    if (Input.consume('ArrowUp')) selectedHiraganaIndex = modAdd(selectedHiraganaIndex, -1, 64);
    if (Input.consume('ArrowDown')) selectedHiraganaIndex = modAdd(selectedHiraganaIndex, 1, 64);
    if (Input.consume('ArrowLeft')) hiraganaCursorIndex = modAdd(hiraganaCursorIndex, -1, 3);
    if (Input.consume('ArrowRight')) hiraganaCursorIndex = modAdd(hiraganaCursorIndex, 1, 3);

    pass = pass.substring(0, hiraganaCursorIndex) + passHiraganaList[selectedHiraganaIndex] + pass.substring(hiraganaCursorIndex + 1);
    textExplainSave[2] = `ふっかつのじゅもん：${pass}`;

    if (Input.consume(' ')) {
        calcCodeToFlags(); 
        updatePlayerItems();
        currentState = STATE.FIELD; 
    }
}

function drawPasscode() {
    drawWindowCommon(textExplainSave);
    const x = displayTileSize / 2, y = displayTileSize * 2.5, width = displayTileSize * 2, height = displayTileSize * 5;
    ctx.fillStyle = 'black'; ctx.fillRect(x, y, width, height);
    ctx.strokeStyle = 'white'; ctx.lineWidth = 2; ctx.strokeRect(x, y, width, height);
    ctx.fillStyle = 'white'; ctx.font = '16px cinecaption';
    for (let i = -2; i < 3; i++) {
        if (i === 0) {
            ctx.fillStyle = 'yellow'; ctx.fillRect(x, y + displayTileSize * (i + 2), width, displayTileSize); ctx.fillStyle = 'black';
        }
        ctx.fillText(passHiraganaList[modAdd(selectedHiraganaIndex, i, 64)], x + displayTileSize / 2, y + displayTileSize * (i + 2.8));
        ctx.fillStyle = 'white';
    }
}

// =====================================================================
// メインゲームループ（止まらないエンジン）
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
        case STATE.BATTLE: updateBattle(); break; // 【復元】バトルの更新
        case STATE.PASSCODE: updatePasscode(); break;
    }

    drawMap();
    drawPoint();    // 【復元】ローラ姫＆座標表示
    drawTapArea();  // 【復元】スマホ操作UI

    switch (currentState) {
        case STATE.MESSAGE: drawWindowCommon(currentMessage); break;
        case STATE.MENU: drawMenu(); break;
        case STATE.BATTLE: drawBattle(); break; // 【復元】バトルの描画
        case STATE.PASSCODE: drawPasscode(); break;
    }

    Input.clearJustPressed();
    requestAnimationFrame(gameLoop);
}

// ゲーム起動
window.onload = function () {
    updatePlayerLevel();
    updatePlayerItems();
    requestAnimationFrame(gameLoop);
};