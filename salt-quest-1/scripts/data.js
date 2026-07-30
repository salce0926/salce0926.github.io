// =====================================================================
// ゲームデータ定義（フラグ・プレイヤー・アイテム・ふっかつのじゅもん変換）
// =====================================================================
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
// プレイヤーと敵の状態
// =====================================================================
let playerPosition = { x: 51, y: 51 };
let playerStyleNormal = 0, playerStyleSword = 2, playerStyleShield = 4, playerStyleFull = 6, playerStyleWithRora = 8;
let playerIndex = playerStyleNormal, playerStyle = playerStyleNormal;

let player = {
    name: 'ソルト', level: 0, hp: 15, maxHp: 15, mp: 0, maxMp: 0, gold: 0, exp: 0,
    strength: 4, agility: 4, attack: 4, defense: 2, herb: 6, key: 0,
    items: [], spells: [],
    weaponIndex: 0, armorIndex: 1, shieldIndex: 0,   // 初期装備は ぬののふく のみ
    weapon: 'なし', armor: 'ぬののふく', shield: 'なし'
};

// =====================================================================
// 装備（FC版DQ1の攻撃力・守備力・買値。priceが0のものは非売品）
// =====================================================================
const HERB_MAX = 6;      // 本家同様やくそうは6個まで
const HERB_PRICE = 24;

const weapons = [
    { name: 'なし',           power: 0,  price: 0 },
    { name: 'たけざお',       power: 2,  price: 10 },
    { name: 'こんぼう',       power: 4,  price: 60 },
    { name: 'どうのつるぎ',   power: 10, price: 180 },
    { name: 'てつのおの',     power: 15, price: 560 },
    { name: 'はがねのつるぎ', power: 20, price: 1500 },
    { name: 'ほのおのつるぎ', power: 28, price: 9800 },
    { name: 'ロトのつるぎ',   power: 40, price: 0 }
];
const armors = [
    { name: 'なし',           power: 0,  price: 0 },
    { name: 'ぬののふく',     power: 2,  price: 20 },
    { name: 'かわのふく',     power: 4,  price: 70 },
    { name: 'くさりかたびら', power: 10, price: 300 },
    { name: 'てつのよろい',   power: 16, price: 1000 },
    { name: 'はがねのよろい', power: 24, price: 3000 },
    { name: 'まほうのよろい', power: 24, price: 7700 },
    { name: 'ロトのよろい',   power: 28, price: 0 }
];
const shields = [
    { name: 'なし',           power: 0,  price: 0 },
    { name: 'かわのたて',     power: 4,  price: 90 },
    { name: 'てつのたて',     power: 10, price: 800 },
    { name: 'みかがみのたて', power: 20, price: 14800 }
];

// こうげき力=ちから+武器 / しゅび力=すばやさ÷2+よろい+たて（本家の式）
function recalcPlayerPower() {
    const w = weapons[player.weaponIndex] || weapons[0];
    const a = armors[player.armorIndex] || armors[0];
    const s = shields[player.shieldIndex] || shields[0];
    player.weapon = w.name; player.armor = a.name; player.shield = s.name;
    player.attack = player.strength + w.power;
    player.defense = Math.floor(player.agility / 2) + a.power + s.power;
}

// =====================================================================
// 敵図鑑とエンカウント定義
// =====================================================================
// sprite はenemy.png内の切り出し座標(等倍px)
const enemyTable = [
    { name: 'スライム',     hp: 3,  maxHp: 3,  attack: 5,  defense: 3,  agility: 3,  exp: 1,  gold: 2,   sprite: { x: 5,   y: 2,   w: 20, h: 18 } },
    { name: 'ドラキー',     hp: 6,  maxHp: 6,  attack: 9,  defense: 6,  agility: 6,  exp: 2,  gold: 3,   sprite: { x: 5,   y: 23,  w: 24, h: 18 } },
    { name: 'ゴースト',     hp: 7,  maxHp: 7,  attack: 11, defense: 8,  agility: 8,  exp: 3,  gold: 5,   sprite: { x: 5,   y: 59,  w: 27, h: 30 } },
    { name: 'まほうつかい', hp: 13, maxHp: 13, attack: 11, defense: 12, agility: 12, exp: 13, gold: 21,  sprite: { x: 44,  y: 103, w: 36, h: 39 } },
    { name: 'おおさそり',   hp: 20, maxHp: 20, attack: 18, defense: 16, agility: 16, exp: 6,  gold: 25,  sprite: { x: 93,  y: 146, w: 40, h: 31 } },
    { name: 'がいこつ',     hp: 17, maxHp: 17, attack: 28, defense: 22, agility: 22, exp: 11, gold: 30,  sprite: { x: 6,   y: 250, w: 28, h: 45 } },
    { name: 'リカント',     hp: 34, maxHp: 34, attack: 40, defense: 30, agility: 30, exp: 16, gold: 50,  sprite: { x: 6,   y: 299, w: 39, h: 41 } },
    { name: 'キメラ',       hp: 42, maxHp: 42, attack: 56, defense: 48, agility: 48, exp: 31, gold: 105, sprite: { x: 45,  y: 346, w: 37, h: 44 } },
    { name: 'あくまのきし', hp: 47, maxHp: 47, attack: 76, defense: 78, agility: 78, exp: 37, gold: 150, sprite: { x: 108, y: 399, w: 48, h: 52 } },
    { name: 'ドラゴン',     hp: 65, maxHp: 65, attack: 88, defense: 74, agility: 74, exp: 45, gold: 160, sprite: { x: 6,   y: 507, w: 45, h: 38 } }
];
let enemy = { ...enemyTable[0] };

// =====================================================================
// 出現テーブル（本家方式: マップを区画に分け、区画ごとに敵テーブルを割当）
// 区画は8×8タイル。ゾーンIDは城からの歩行経路距離(BFS・洞窟ワープ込み・
// 虹の橋なし)から生成した初期値で、個別に手調整してよい。
// 4=虹の橋の先(りゅうおう領域)・南部深部・海のみの区画
// =====================================================================
const zoneEnemySets = [
    [0, 0, 0, 1, 1], // z0: スライム×3 ドラキー×2
    [1, 2, 2, 3, 3], // z1: ドラキー ゴースト×2 まほうつかい×2
    [3, 4, 4, 5, 5], // z2: まほうつかい おおさそり×2 がいこつ×2
    [5, 6, 6, 7, 7], // z3: がいこつ リカント×2 キメラ×2
    [7, 8, 8, 9, 9]  // z4: キメラ あくまのきし×2 ドラゴン×2
];
const ZONE_CELL = 8; // 区画の一辺(タイル)
const encounterZoneGrid = [
    [4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
    [4,2,1,1,1,1,1,1,1,3,3,3,2,2,2,2,4],
    [4,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,4],
    [4,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,4],
    [4,1,1,1,1,0,1,1,1,1,1,2,2,2,2,2,4],
    [4,1,1,2,0,0,0,0,1,1,1,1,2,2,2,2,4],
    [4,2,2,0,0,0,0,0,4,1,1,2,2,2,2,2,4],
    [4,2,2,1,0,0,4,4,4,2,2,2,2,2,2,2,4],
    [4,2,2,2,2,0,4,4,4,4,2,2,2,2,2,2,4],
    [4,2,2,2,2,2,3,4,4,4,3,2,3,3,3,2,4],
    [4,3,3,3,2,3,3,4,4,4,4,3,3,3,3,2,4],
    [4,3,3,3,3,3,3,4,4,4,4,4,3,3,3,3,4],
    [4,3,3,3,3,4,3,4,4,4,4,4,4,3,3,3,4],
    [4,3,3,3,3,3,4,4,4,4,4,4,4,3,3,3,4],
    [4,3,3,3,3,4,4,4,4,4,4,4,4,3,3,3,4],
    [4,3,3,3,3,4,4,4,4,4,4,4,4,3,3,3,4],
    [4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4]
];

function zoneAt(x, y) {
    const row = encounterZoneGrid[Math.floor(y / ZONE_CELL)];
    if (!row) return 4;
    const z = row[Math.floor(x / ZONE_CELL)];
    return z === undefined ? 4 : z;
}
function pickFieldEnemy(x, y) {
    const set = zoneEnemySets[zoneAt(x, y)];
    return enemyTable[set[Math.floor(Math.random() * set.length)]];
}

// =====================================================================
// エンカウント判定（本家FC版方式: 1歩ごとの固定確率）
// FC版解析(Ryan8bit Formula Guide)より: 城周辺ゾーンは 草原・橋1/48 森・丘1/32、
// 通常エリアはその2倍(草原・橋1/24 森・丘1/16)。歩数による変動はSFC版の仕様なので使わない。
// =====================================================================
// 地形タイル → 通常エリアの遭遇率(1歩あたり)。町・城・洞窟マスは0
const encounterRates = { 27: 1/24, 28: 1/24, 29: 1/16, 33: 1/16, 35: 1/24 };

// 1歩ごとに呼ぶ。trueならエンカウント発生
function checkEncounter(x, y) {
    const tile = (typeof mapData !== 'undefined' && mapData[y]) ? mapData[y][x] : undefined;
    let rate = encounterRates[tile] || 0;
    if (rate === 0) return false;
    // 本家の「開始城周辺ゾーンは遭遇率半分」(ゾーン0の区画が対象)
    if (zoneAt(x, y) === 0) rate /= 2;
    return Math.random() < rate;
}

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

let pass = ''; // 初期値は起動時に現在の状態から生成する
let selectedHiraganaIndex = 0, hiraganaCursorIndex = 0;

// =====================================================================
// アイテム・レベル・見た目の更新ロジック
// =====================================================================
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
    player.maxHp = newStatus.hp; player.maxMp = newStatus.mp;
    recalcPlayerPower();
    if(newStatus.spell !== '-') player.spells.push(newStatus.spell);
}

// フラグから持ち物を組み立て直す。consumedBy は「そのフラグが立つと使い切る」印
// （装備は買い替えできるので weaponIndex等で持ち、ここでは触らない）
function updatePlayerItems(){
    const flagItems = [
        { itemName: 'ようせいのふえ', flagName: 'fairyFlute' }, { itemName: 'ロトのしるし', flagName: 'rotoEmblem' },
        { itemName: 'おうじょのあい', flagName: 'roraLove'}, { itemName: 'ぎんのたてごと', flagName: 'silverHerp'},
        { itemName: 'たいようのいし', flagName: 'sunStone', consumedBy: 'rainbowDrop'},
        { itemName: 'あまぐものつえ', flagName: 'rainCloudStuff', consumedBy: 'rainbowDrop'},
        { itemName: 'にじのしずく', flagName: 'rainbowDrop', consumedBy: 'rainbowBridge'}
    ];
    for (const item of flagItems) {
        const shouldHave = getGameFlag(item.flagName) && !(item.consumedBy && getGameFlag(item.consumedBy));
        const hasItem = player.items.some(i => i.name === item.itemName);
        if(!hasItem && shouldHave) addItemToPlayer(item.itemName);
        else if(hasItem && !shouldHave) deleteItemFromPlayer(item.itemName);
    }
}

// フラグから見た目（剣・盾・姫連れ）を復元する。じゅもん復活時にも呼ぶ
function updatePlayerStyle(){
    playerStyle = getGameFlag('roraLove') ? playerStyleFull
                : getGameFlag('roraRescued') ? playerStyleWithRora
                : playerStyleNormal;
    playerIndex = playerStyle;
}

// =====================================================================
// ふっかつのじゅもん（ひらがな10文字＝60bit）
// 内訳: フラグ14 / 経験値16 / ゴールド16 / やくそう4 / かぎ2 ＝52bit ＋ チェックサム8bit
// 本家同様レベルは経験値から復元するので、レベル自体は保存しない
// =====================================================================
const PASS_FIELDS = [
    { name: 'flags',  bits: 14 },
    { name: 'exp',    bits: 16 },
    { name: 'gold',   bits: 16 },
    { name: 'herb',   bits: 4 },
    { name: 'key',    bits: 3 },
    { name: 'weapon', bits: 3 },
    { name: 'armor',  bits: 3 },
    { name: 'shield', bits: 2 }
];
const PASS_CHECKSUM_BITS = 8;
const PASS_PAYLOAD_BITS = PASS_FIELDS.reduce((n, f) => n + f.bits, 0);
// 6bit(=1文字)単位に収まるよう詰め物を入れる
const PASS_PAD_BITS = (6 - ((PASS_PAYLOAD_BITS + PASS_CHECKSUM_BITS) % 6)) % 6;
const PASS_LENGTH = (PASS_PAYLOAD_BITS + PASS_PAD_BITS + PASS_CHECKSUM_BITS) / 6;

function getCodeByHiragana(object, value) { return Number(Object.keys(object).find(key => object[key] === value)); }
function getHiraganaFromList(index) { return passHiraganaList[index] || '？'; }

function pushBits(bits, value, width) {
    for (let i = width - 1; i >= 0; i--) bits.push((value >>> i) & 1);
}
function readBits(bits, from, width) {
    let v = 0;
    for (let i = 0; i < width; i++) v = v * 2 + (bits[from + i] || 0);
    return v;
}
// CRC-8。1文字＝6bit連続なので、1文字の打ち間違いは必ず検出できる
function passChecksum(bits) {
    let crc = 0xFF;
    for (const b of bits) {
        const mix = ((crc >> 7) & 1) ^ b;
        crc = (crc << 1) & 0xFF;
        if (mix) crc ^= 0x07;
    }
    return crc;
}

// 現在の状態 → じゅもん文字列
function calcFlagsToCode() {
    let flags = 0;
    for (const flagName in gameFlags) if (getGameFlag(flagName)) flags |= 1 << gameFlags[flagName].bit;
    const values = {
        flags,
        exp: Math.min(player.exp, 65535),
        gold: Math.min(player.gold, 65535),
        herb: Math.min(player.herb, 15),
        key: Math.min(player.key, 7),
        weapon: player.weaponIndex,
        armor: player.armorIndex,
        shield: player.shieldIndex
    };
    const bits = [];
    for (const f of PASS_FIELDS) pushBits(bits, values[f.name], f.bits);
    pushBits(bits, 0, PASS_PAD_BITS);
    pushBits(bits, passChecksum(bits), PASS_CHECKSUM_BITS);

    let text = '';
    for (let i = 0; i < bits.length; i += 6) text += getHiraganaFromList(readBits(bits, i, 6));
    pass = text;
}

// じゅもん文字列 → 状態。成功したらtrue、検査値が合わなければfalse
function calcCodeToFlags() {
    if (pass.length !== PASS_LENGTH) return false;
    const bits = [];
    for (const ch of pass) {
        const idx = getCodeByHiragana(passHiraganaList, ch);
        if (isNaN(idx)) return false;
        pushBits(bits, idx, 6);
    }
    const payloadLength = bits.length - PASS_CHECKSUM_BITS;
    const payload = bits.slice(0, payloadLength);
    if (readBits(bits, payloadLength, PASS_CHECKSUM_BITS) !== passChecksum(payload)) return false;

    const values = {};
    let pos = 0;
    for (const f of PASS_FIELDS) { values[f.name] = readBits(bits, pos, f.bits); pos += f.bits; }

    for (const flagName in gameFlags) gameFlags[flagName].flag = (values.flags >> gameFlags[flagName].bit) & 1;
    player.exp = values.exp;
    player.gold = values.gold;
    player.herb = values.herb;
    player.key = values.key;
    player.weaponIndex = values.weapon;
    player.armorIndex = values.armor;
    player.shieldIndex = values.shield;
    restorePlayerFromExp();
    return true;
}

// 経験値からレベル・能力値・じゅもんを組み立て直す（復活時に使う）
function restorePlayerFromExp() {
    player.level = 0;
    player.spells = [];
    let prev = -1;
    while (player.level !== prev) { prev = player.level; updatePlayerLevel(); }
    recalcPlayerPower();
    player.hp = player.maxHp;
    player.mp = player.maxMp;
}
