// =====================================================================
// ダンジョン（地下マップ）
// =====================================================================
// 本家FC版の「いわやまのどうくつ」をそのまま移植したもの。
// 地形は way78.com/dq1/fc/dn02.html のマップ画像を14×14で読み取った。
// 出現モンスターは Ryan8bit "Dragon Warrior Formula Guide"(GameFAQs) の
// ゾーン表と dqwiz.net の出現場所表が一致した値（B1=ゾーン19 / B2=ゾーン14）。
// 宝箱の中身・たいまつ/レミーラの仕様も上記2資料どおり。
// =====================================================================

// ダンジョンで使うタイル番号（tileset.png の通し番号）
const D_FLOOR = -1;   // 床。本家と同じく真っ黒なので絵は描かない
const D_WALL  = 1;    // 岩壁
const D_STAIR = 7;    // 階段
const D_CHEST = 14;   // 宝箱

// マップ記号  # 壁 ／ . 床 ／ a b c 階段 ／ < 地上への出入口 ／ 1〜5 宝箱
const DUNGEONS = {
    iwayama1: {
        name: 'いわやまの どうくつ',
        floorName: 'ちか1かい',
        zone: 19,
        rows: [
            'a...####......',
            '.##......#.##.',
            '.#.#######.#..',
            '.........#.#..',
            '####.#####.#..',
            '.....#b....#.1',
            '##.##.########',
            '<........#...#',
            '##.#####...#.#',
            '.....#...#....',
            '.###.#.#.###.#',
            '.......#......',
            '.#.#.###.#..c.',
            '.........#....'
        ],
        links: { a: ['iwayama2', 'a'], b: ['iwayama2', 'b'], c: ['iwayama2', 'c'],
                 '<': ['world', 37, 65] }
    },
    iwayama2: {
        name: 'いわやまの どうくつ',
        floorName: 'ちか2かい',
        zone: 14,
        rows: [
            'a.#...........',
            '..#.#.#.##.##.',
            '##23#.#.#...#.',
            '.###..###.....',
            '.....#..##.###',
            '####.#b.......',
            '.5.#.#..##.##.',
            '...#.####..#..',
            '#.##....#..#..',
            '...###....4##.',
            '.###...####.##',
            '.#...#...#....',
            '.#######.#.#c.',
            '.........#....'
        ],
        links: { a: ['iwayama1', 'a'], b: ['iwayama1', 'b'], c: ['iwayama1', 'c'] }
    }
};

// 宝箱の中身（本家 dn02.html より）
//   1 やくそう ／ 2 せんしのゆびわ ／ 3 たいまつ
//   4 10〜15ゴールド ／ 5 100〜131ゴールド（1/16で しのくびかざり）
const CHEST_TABLE = {
    '1': () => ({ tool: 'herb', name: 'やくそう' }),
    '2': () => ({ item: 'せんしのゆびわ', flag: 'warriorRing' }),
    '3': () => ({ tool: 'torch', name: 'たいまつ' }),
    '4': () => ({ gold: 10 + Math.floor(Math.random() * 6) }),
    '5': () => (!getGameFlag('deathNecklace') && Math.floor(Math.random() * 16) === 0)
              ? { item: 'しのくびかざり', flag: 'deathNecklace' }
              : { gold: 100 + Math.floor(Math.random() * 32) }
};

// 記号の並びから、描画用のタイル配列・階段の位置・宝箱の位置を組み立てる
function buildDungeon(d) {
    d.grid = []; d.marks = {}; d.chestAt = {};
    d.rows.forEach((row, y) => {
        const line = [];
        [...row].forEach((ch, x) => {
            if (ch === '#') line.push(D_WALL);
            else if (ch === '.') line.push(D_FLOOR);
            else if (ch >= '1' && ch <= '9') { line.push(D_CHEST); d.chestAt[x + ',' + y] = ch; }
            else { line.push(D_STAIR); d.marks[ch] = { x, y }; }
        });
        d.grid.push(line);
    });
}
for (const id in DUNGEONS) buildDungeon(DUNGEONS[id]);

// =====================================================================
// 現在いるマップ
// =====================================================================
var worldMapData = (typeof mapData !== 'undefined') ? mapData : null;
let currentMapId = 'world';

function currentDungeon() { return currentMapId === 'world' ? null : DUNGEONS[currentMapId]; }
function inDungeon() { return currentMapId !== 'world'; }
function mapWraps() { return currentMapId === 'world'; }   // 地上だけ端がつながっている

// 明かり。たいまつは一度つければダンジョンを出るまで消えない（本家どおり）
let torchLit = false;
let radiantSteps = 0;          // レミーラの残り歩数（本家は合計200歩）
const RADIANT_STEPS = 200;
const AUTO_LIGHT = 8;          // オート中の見え方（画面いっぱい。開発用の便宜）
function lightRadius() {
    // オート中は真っ暗だと何をしているか分からないので、明かり無しでも見えるようにする。
    // 手で遊ぶときは本家どおり真っ暗
    if (typeof autoPilot !== 'undefined' && autoPilot.on) return AUTO_LIGHT;
    let r = torchLit ? 1 : 0;
    // 本家: 半径3が80歩 → 半径2が60歩 → 半径1が60歩
    if (radiantSteps > 120) r = Math.max(r, 3);
    else if (radiantSteps > 60) r = Math.max(r, 2);
    else if (radiantSteps > 0) r = Math.max(r, 1);
    return r;
}

// 開けた宝箱。本家どおり、ダンジョンを出るとまた閉まっている
let openedChests = new Set();

function switchMap(id, x, y) {
    currentMapId = id;
    mapData = (id === 'world') ? worldMapData : DUNGEONS[id].grid;
    mapWidth = mapData[0].length;
    mapHeight = mapData.length;
    playerPosition.x = x;
    playerPosition.y = y;
}

// 地上へ戻る（出口・リレミト・全滅・つばさ など共通）
function leaveDungeon(x, y) {
    const exit = dungeonExit();
    switchMap('world', x !== undefined ? x : exit.x, y !== undefined ? y : exit.y);
    torchLit = false;          // たいまつはダンジョンを出ると効果が切れる
    radiantSteps = 0;
    openedChests = new Set();  // 宝箱が復活する
}

// 今いるダンジョンの地上出入口。今は岩山だけなので固定
function dungeonExit() { return { x: 37, y: 65 }; }

// 地上のこのマスに入ったらダンジョンへ、という対応表
const DUNGEON_ENTRANCES = { '37,65': ['iwayama1', '<'] };

// 足元が階段・出入口かどうか（動かさずに調べるだけ）
function stairsHere() {
    const x = playerPosition.x, y = playerPosition.y;
    const d = currentDungeon();
    if (!d) return !!DUNGEON_ENTRANCES[x + ',' + y];
    for (const mark in d.marks) {
        if (d.marks[mark].x === x && d.marks[mark].y === y && d.links[mark]) return true;
    }
    return false;
}

// 階段・出入口に乗ったときの移動。移動したら true
function useStairs(x, y) {
    const d = currentDungeon();
    if (!d) return false;
    for (const mark in d.marks) {
        if (d.marks[mark].x !== x || d.marks[mark].y !== y) continue;
        const link = d.links[mark];
        if (!link) return false;
        if (link[0] === 'world') { leaveDungeon(link[1], link[2]); return true; }
        const to = DUNGEONS[link[0]].marks[link[1]];
        switchMap(link[0], to.x, to.y);
        return true;
    }
    return false;
}

// 地上の洞窟の入口に乗ったとき
function enterDungeonAt(x, y) {
    const e = DUNGEON_ENTRANCES[x + ',' + y];
    if (!e) return false;
    const to = DUNGEONS[e[0]].marks[e[1]];
    torchLit = false; radiantSteps = 0; openedChests = new Set();
    switchMap(e[0], to.x, to.y);
    return true;
}

// 足元の宝箱の番号（無ければ null）
function chestHere() {
    const d = currentDungeon();
    if (!d) return null;
    const id = d.chestAt[playerPosition.x + ',' + playerPosition.y];
    if (!id) return null;
    return openedChests.has(currentMapId + ':' + id) ? null : id;
}
