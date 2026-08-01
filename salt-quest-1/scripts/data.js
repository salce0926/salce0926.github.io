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

// 本家同様、丸腰＋支度金120Gで始まる（まず町で装備を買うのが最初の一歩）
let player = {
    name: 'ソルト', level: 0, hp: 15, maxHp: 15, mp: 0, maxMp: 0, gold: 120, exp: 0,
    strength: 4, agility: 4, attack: 4, defense: 2, herb: 6, key: 0,
    bank: 0,          // あずかりじょの預金。やられても減らない（1000G単位）
    wing: 0,          // キメラのつばさ（城へ戻る）
    water: 0,         // せいすい（127歩の敵よけ）
    scale: false,     // りゅうのうろこ（身に付けると守備力+2）
    items: [], spells: [],
    weaponIndex: 0, armorIndex: 0, shieldIndex: 0,
    weapon: 'なし', armor: 'なし', shield: 'なし'
};

// =====================================================================
// 装備（FC版DQ1の攻撃力・守備力・買値。priceが0のものは非売品）
// =====================================================================
const HERB_MAX = 6;      // 本家同様やくそうは6個まで
const ITEM_MAX = 6;
// どうぐやの品揃え（買値はFC版準拠）
const toolGoods = {
    herb:  { name: 'やくそう',       price: 24 },
    water: { name: 'せいすい',       price: 38 },
    scale: { name: 'りゅうのうろこ', price: 20 },
    wing:  { name: 'キメラのつばさ', price: 70 }
};

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
    player.defense = Math.floor(player.agility / 2) + a.power + s.power + (player.scale ? 2 : 0);
}

// =====================================================================
// 敵図鑑とエンカウント定義
// =====================================================================
// sprite はenemy.png内の切り出し座標(等倍px)
// pattern は毎ターン等確率で選ばれる行動。flees:true は手負いになると逃げ出す
// evasion は回避力。勇者の攻撃が evasion/64 の確率で空振りする（FC版準拠）
// 能力値・経験値・ゴールド・回避力・特殊攻撃はすべてFC版の実データ。
// スプライトは色違いを同じ系統として左から弱い順に割り当てている。
const enemyTable = [
    // --- スライム系 ---
    { name: 'スライム',       hp: 3,   maxHp: 3,   attack: 5,   defense: 3,   agility: 3,   evasion: 1,  exp: 1,   gold: 2,   sprite: { x: 5,   y: 2,   w: 19, h: 18 }, flees: true },
    { name: 'スライムベス',   hp: 4,   maxHp: 4,   attack: 7,   defense: 3,   agility: 3,   evasion: 1,  exp: 1,   gold: 3,   sprite: { x: 26,  y: 2,   w: 19, h: 18 }, flees: true },
    { name: 'メタルスライム', hp: 4,   maxHp: 4,   attack: 10,  defense: 255, agility: 255, evasion: 1,  exp: 115, gold: 6,   sprite: { x: 47,  y: 2,   w: 19, h: 18 }, flees: true, pattern: ['attack', 'gira'] },
    // --- ドラキー系 ---
    { name: 'ドラキー',       hp: 6,   maxHp: 6,   attack: 9,   defense: 6,   agility: 6,   evasion: 1,  exp: 2,   gold: 3,   sprite: { x: 5,   y: 23,  w: 24, h: 18 }, flees: true },
    { name: 'メイジドラキー', hp: 15,  maxHp: 15,  attack: 14,  defense: 14,  agility: 14,  evasion: 1,  exp: 5,   gold: 12,  sprite: { x: 31,  y: 23,  w: 24, h: 18 }, pattern: ['attack', 'attack', 'gira'] },
    { name: 'ドラキーマ',     hp: 20,  maxHp: 20,  attack: 22,  defense: 26,  agility: 26,  evasion: 6,  exp: 11,  gold: 20,  sprite: { x: 57,  y: 23,  w: 24, h: 18 }, pattern: ['attack', 'gira', 'hoimi'] },
    // --- ゴースト系 ---
    { name: 'ゴースト',       hp: 7,   maxHp: 7,   attack: 11,  defense: 8,   agility: 8,   evasion: 4,  exp: 3,   gold: 5,   sprite: { x: 5,   y: 59,  w: 24, h: 30 }, flees: true },
    { name: 'メトロゴースト', hp: 23,  maxHp: 23,  attack: 18,  defense: 20,  agility: 20,  evasion: 6,  exp: 8,   gold: 18,  sprite: { x: 31,  y: 59,  w: 24, h: 30 }, pattern: ['attack', 'attack', 'gira'] },
    { name: 'ヘルゴースト',   hp: 36,  maxHp: 36,  attack: 40,  defense: 38,  agility: 38,  evasion: 4,  exp: 18,  gold: 70,  sprite: { x: 57,  y: 59,  w: 24, h: 30 }, pattern: ['attack', 'gira', 'rarihoo'] },
    // --- まほうつかい系 ---
    { name: 'まほうつかい',   hp: 13,  maxHp: 13,  attack: 11,  defense: 12,  agility: 12,  evasion: 1,  exp: 4,   gold: 12,  sprite: { x: 6,   y: 107, w: 36, h: 35 }, pattern: ['attack', 'gira', 'gira'] },
    { name: 'まどうし',       hp: 30,  maxHp: 30,  attack: 28,  defense: 22,  agility: 22,  evasion: 2,  exp: 13,  gold: 35,  sprite: { x: 44,  y: 105, w: 36, h: 37 }, pattern: ['attack', 'gira', 'rarihoo'] },
    { name: 'だいまどう',     hp: 65,  maxHp: 65,  attack: 80,  defense: 70,  agility: 70,  evasion: 2,  exp: 50,  gold: 165, sprite: { x: 82,  y: 105, w: 36, h: 37 }, pattern: ['attack', 'begirama', 'begirama'] },
    // --- さそり系 ---
    { name: 'おおさそり',     hp: 20,  maxHp: 20,  attack: 18,  defense: 16,  agility: 16,  evasion: 1,  exp: 6,   gold: 16,  sprite: { x: 6,   y: 145, w: 41, h: 32 } },
    { name: 'てつさそり',     hp: 22,  maxHp: 22,  attack: 36,  defense: 42,  agility: 42,  evasion: 2,  exp: 14,  gold: 40,  sprite: { x: 49,  y: 145, w: 41, h: 32 } },
    { name: 'しのさそり',     hp: 35,  maxHp: 35,  attack: 60,  defense: 90,  agility: 90,  evasion: 2,  exp: 26,  gold: 110, sprite: { x: 92,  y: 145, w: 41, h: 32 } },
    // --- メーダ系 ---
    { name: 'メーダ',         hp: 22,  maxHp: 22,  attack: 20,  defense: 18,  agility: 18,  evasion: 2,  exp: 7,   gold: 16,  sprite: { x: 6,   y: 180, w: 36, h: 29 } },
    { name: 'メーダロード',   hp: 35,  maxHp: 35,  attack: 47,  defense: 40,  agility: 40,  evasion: 4,  exp: 20,  gold: 85,  sprite: { x: 44,  y: 180, w: 36, h: 29 }, pattern: ['attack', 'gira', 'hoimi'] },
    // --- ドロル系 ---
    { name: 'ドロル',         hp: 25,  maxHp: 25,  attack: 24,  defense: 24,  agility: 24,  evasion: 2,  exp: 10,  gold: 25,  sprite: { x: 6,   y: 212, w: 32, h: 36 } },
    { name: 'ドロルメイジ',   hp: 38,  maxHp: 38,  attack: 52,  defense: 50,  agility: 50,  evasion: 1,  exp: 22,  gold: 90,  sprite: { x: 40,  y: 212, w: 32, h: 36 }, pattern: ['attack', 'attack', 'mahotone'] },
    // --- がいこつ系 ---
    { name: 'がいこつ',       hp: 30,  maxHp: 30,  attack: 28,  defense: 22,  agility: 22,  evasion: 4,  exp: 11,  gold: 30,  sprite: { x: 6,   y: 251, w: 32, h: 47 } },
    { name: 'しりょう',       hp: 36,  maxHp: 36,  attack: 44,  defense: 34,  agility: 34,  evasion: 4,  exp: 17,  gold: 60,  sprite: { x: 40,  y: 251, w: 32, h: 47 }, pattern: ['attack', 'attack', 'hoimi'] },
    { name: 'しりょうのきし', hp: 46,  maxHp: 46,  attack: 68,  defense: 56,  agility: 56,  evasion: 4,  exp: 28,  gold: 120, sprite: { x: 74,  y: 251, w: 32, h: 47 }, pattern: ['attack', 'attack', 'hoimi'] },
    // --- リカント系 ---
    { name: 'リカント',       hp: 34,  maxHp: 34,  attack: 40,  defense: 30,  agility: 30,  evasion: 2,  exp: 16,  gold: 50,  sprite: { x: 6,   y: 301, w: 44, h: 42 }, pattern: ['attack', 'attack', 'rarihoo'] },
    { name: 'リカントマムル', hp: 38,  maxHp: 38,  attack: 50,  defense: 36,  agility: 36,  evasion: 2,  exp: 20,  gold: 80,  sprite: { x: 52,  y: 301, w: 44, h: 42 }, pattern: ['attack', 'attack', 'mahotone'] },
    { name: 'キラーリカント', hp: 60,  maxHp: 60,  attack: 86,  defense: 70,  agility: 70,  evasion: 7,  exp: 40,  gold: 155, sprite: { x: 98,  y: 301, w: 44, h: 42 } },
    // --- キメラ系 ---
    { name: 'キメラ',         hp: 42,  maxHp: 42,  attack: 56,  defense: 48,  agility: 48,  evasion: 2,  exp: 24,  gold: 100, sprite: { x: 6,   y: 346, w: 36, h: 34 } },
    { name: 'メイジキメラ',   hp: 58,  maxHp: 58,  attack: 78,  defense: 68,  agility: 68,  evasion: 2,  exp: 34,  gold: 140, sprite: { x: 45,  y: 346, w: 37, h: 34 }, pattern: ['attack', 'attack', 'rarihoo'] },
    { name: 'スターキメラ',   hp: 65,  maxHp: 65,  attack: 86,  defense: 80,  agility: 80,  evasion: 2,  exp: 43,  gold: 160, sprite: { x: 85,  y: 346, w: 36, h: 34 }, pattern: ['attack', 'fire', 'hoimi'] },
    // --- きし系 ---
    { name: 'よろいのきし',   hp: 55,  maxHp: 55,  attack: 76,  defense: 78,  agility: 78,  evasion: 1,  exp: 33,  gold: 130, sprite: { x: 6,   y: 405, w: 48, h: 46 }, pattern: ['attack', 'attack', 'mahotone'] },
    { name: 'かげのきし',     hp: 50,  maxHp: 50,  attack: 79,  defense: 64,  agility: 64,  evasion: 15, exp: 37,  gold: 150, sprite: { x: 56,  y: 401, w: 48, h: 50 } },
    { name: 'あくまのきし',   hp: 70,  maxHp: 70,  attack: 94,  defense: 82,  agility: 82,  evasion: 1,  exp: 54,  gold: 165, sprite: { x: 108, y: 399, w: 50, h: 52 }, pattern: ['attack', 'attack', 'rarihoo'] },
    { name: 'しにがみのきし', hp: 90,  maxHp: 90,  attack: 105, defense: 86,  agility: 86,  evasion: 2,  exp: 70,  gold: 140, sprite: { x: 108, y: 399, w: 50, h: 52 }, pattern: ['attack', 'begirama', 'hoimi'] },
    // --- ゴーレム系 ---
    { name: 'ゴールドマン',   hp: 50,  maxHp: 50,  attack: 48,  defense: 40,  agility: 40,  evasion: 1,  exp: 6,   gold: 200, sprite: { x: 6,   y: 454, w: 47, h: 47 } },
    { name: 'ストーンマン',   hp: 160, maxHp: 160, attack: 100, defense: 40,  agility: 40,  evasion: 1,  exp: 65,  gold: 140, sprite: { x: 55,  y: 454, w: 47, h: 47 } },
    { name: 'ゴーレム',       hp: 70,  maxHp: 70,  attack: 120, defense: 60,  agility: 60,  evasion: 0,  exp: 5,   gold: 10,  sprite: { x: 104, y: 454, w: 47, h: 47 } },
    // --- ドラゴン系 ---
    { name: 'ドラゴン',       hp: 65,  maxHp: 65,  attack: 88,  defense: 74,  agility: 74,  evasion: 2,  exp: 45,  gold: 160, sprite: { x: 6,   y: 507, w: 47, h: 38 }, pattern: ['attack', 'attack', 'fire'] },
    { name: 'キースドラゴン', hp: 70,  maxHp: 70,  attack: 98,  defense: 84,  agility: 84,  evasion: 2,  exp: 60,  gold: 150, sprite: { x: 55,  y: 504, w: 60, h: 41 }, pattern: ['attack', 'attack', 'fire'] },
    { name: 'ダースドラゴン', hp: 100, maxHp: 100, attack: 120, defense: 90,  agility: 90,  evasion: 2,  exp: 100, gold: 140, sprite: { x: 117, y: 504, w: 60, h: 41 }, pattern: ['attack', 'fire', 'rarihoo'] }
];
// 名前から引くための索引（ゾーン表を名前で書けるようにする）
const enemyByName = {};
enemyTable.forEach((e, i) => { enemyByName[e.name] = i; });
let enemy = { ...enemyTable[0] };

// ボス（ランダムエンカウントには出さない）。noCriticalは会心の一撃が通らない印
const dragonLordDragon = {
    name: 'りゅうおう', hp: 130, maxHp: 130, attack: 140, defense: 200, agility: 200,
    exp: 0, gold: 0, noCritical: true,
    pattern: ['attack', 'attack', 'firestrong'],
    sprite: { x: 66, y: 550, w: 68, h: 88 }
};
const dragonLordHuman = {
    name: 'りゅうおう', hp: 100, maxHp: 100, attack: 90, defense: 50, agility: 50,
    exp: 0, gold: 0, noCritical: true,
    pattern: ['attack', 'begirama', 'rarihoo'],
    sprite: { x: 6, y: 601, w: 22, h: 38 },
    nextForm: dragonLordDragon,
    nextFormMessage: ['りゅうおうは しょうたいを あらわした！', 'おそろしい りゅうの すがただ！']
};

// =====================================================================
// 出現テーブル（本家方式: マップを区画に分け、区画ごとに敵テーブルを割当）
// 区画は8×8タイル。ゾーンIDは城からの歩行経路距離(BFS・洞窟ワープ込み・
// 虹の橋なし)から生成した初期値で、個別に手調整してよい。
// 4=虹の橋の先(りゅうおう領域)・南部深部・海のみの区画
// =====================================================================
// FC版のエンカウントテーブル(ID 0〜D)をそのまま移植したもの。
// 1段ごとに新顔が1種だけ増え、古株が数段かけて抜けていく緩やかな階段になる。
const zoneEnemyNames = [
    ['スライム', 'スライムベス'],
    ['スライム', 'スライムベス', 'ドラキー'],
    ['スライム', 'スライムベス', 'ドラキー', 'ゴースト'],
    ['スライムベス', 'ドラキー', 'ゴースト', 'まほうつかい'],
    ['ゴースト', 'まほうつかい', 'メイジドラキー', 'おおさそり'],
    ['ゴースト', 'まほうつかい', 'メイジドラキー', 'おおさそり', 'がいこつ'],
    ['メイジドラキー', 'おおさそり', 'がいこつ', 'まどうし', 'リカント'],
    ['がいこつ', 'まどうし', 'てつさそり', 'リカント'],
    ['てつさそり', 'しりょう', 'リカントマムル', 'ゴールドマン'],
    ['しりょう', 'キメラ', 'リカントマムル', 'ゴールドマン'],
    ['キメラ', 'しのさそり', 'しりょうのきし', 'よろいのきし', 'かげのきし'],
    ['しりょうのきし', 'よろいのきし', 'メイジキメラ', 'かげのきし', 'メタルスライム'],
    ['よろいのきし', 'メイジキメラ', 'かげのきし', 'キラーリカント', 'スターキメラ'],
    ['キラーリカント', 'ドラゴン', 'スターキメラ', 'だいまどう']
];
const zoneEnemySets = zoneEnemyNames.map(names => names.map(n => enemyByName[n]));
const ZONE_CELL = 17; // 区画の一辺(タイル)。136÷8=17 で本家と同じ割り
// FC版のエンカウントマップをそのまま移植したもの。8×8区画で1区画=17タイル。
// 本作の地形はアレフガルドと同一なので、本家の区画割りがそのまま当てはまる。
const encounterZoneGrid = [
    [ 3, 3, 2, 2, 3, 5, 4, 5],
    [ 3, 2, 1, 2, 3, 3, 4, 5],
    [ 4, 1, 0, 0, 2, 3, 4, 5],
    [ 5, 1, 1,12, 6, 6, 6, 6],
    [ 5, 5, 4,12, 9, 7, 7, 7],
    [10, 9, 8,12,12,12, 8, 7],
    [10,10,11,12,13,13, 9, 8],
    [11,11,12,13,13,12, 9, 9]
];
const ZONE_MAX = zoneEnemyNames.length - 1;

// 区画の切れ目がちょうどラダトーム城のマスに重なるため、縦に1マスぶん寄せて
// 城と町が同じ区画(ゾーン0)に収まるようにしている
const ZONE_OFFSET_Y = -1;
const clampCell = v => Math.min(7, Math.max(0, Math.floor(v / ZONE_CELL)));

function zoneAt(x, y) {
    const row = encounterZoneGrid[clampCell(y + ZONE_OFFSET_Y)];
    if (!row) return ZONE_MAX;
    const z = row[clampCell(x)];
    return z === undefined ? ZONE_MAX : Math.min(z, ZONE_MAX);
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

// 経験値に見合うところまで一気に上げる（1戦で2レベル上がることもある）
function updatePlayerLevel(){
    while (player.level < 30) {
        const newStatus = playerStatus.find(s => s.level === player.level + 1);
        if (!newStatus || player.exp < newStatus.requiredExp) break;
        player.level = newStatus.level; player.strength = newStatus.strength; player.agility = newStatus.agility;
        player.maxHp = newStatus.hp; player.maxMp = newStatus.mp;
        recalcPlayerPower();
        if(newStatus.spell !== '-') player.spells.push(newStatus.spell);
    }
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
    { name: 'shield', bits: 2 },
    { name: 'bank',   bits: 7 },  // 預金は1000G単位で持つ（最大127000G）
    { name: 'wing',   bits: 3 },
    { name: 'water',  bits: 3 },
    { name: 'scale',  bits: 1 }
];
const BANK_UNIT = 1000;
const BANK_MAX = 127 * BANK_UNIT;
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
        shield: player.shieldIndex,
        bank: Math.min(Math.floor(player.bank / BANK_UNIT), 127),
        wing: Math.min(player.wing, 7),
        water: Math.min(player.water, 7),
        scale: player.scale ? 1 : 0
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
    player.bank = values.bank * BANK_UNIT;
    player.wing = values.wing;
    player.water = values.water;
    player.scale = values.scale === 1;
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
