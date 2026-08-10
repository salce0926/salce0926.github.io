// =====================================================================
// ダンジョン（地下マップ）
// =====================================================================
// 本家FC版のダンジョンをそのまま移植したもの（いわやま／ぬまち）。
// 地形は way78.com/dq1/fc/dn02.html・dn03.html のマップ画像から読み取った。
// 出現モンスターは Ryan8bit "Dragon Warrior Formula Guide"(GameFAQs) の
// ゾーン表と dqwiz.net の出現場所表が一致した値（B1=ゾーン19 / B2=ゾーン14）。
// 宝箱の中身・たいまつ/レミーラの仕様も上記2資料どおり。
// =====================================================================

// ダンジョンで使うタイル番号（tileset.png の通し番号）。
// 本家FC版のダンジョン画面と絵柄を1ドット単位で照合して決めた
// （pidlio.com の実画面マップと tileset.png を突き合わせ）:
//   床＝茶色いレンガ／壁＝灰色の石ブロック／階段・宝箱・とびらはレンガ縁の版
const D_FLOOR = 3;    // 床（茶色いレンガ）
const D_WALL  = 1;    // 壁（灰色の石ブロック）
const D_STAIR = 6;    // 階段
const D_CHEST = 4;    // 宝箱
const D_DOOR  = 5;    // かぎのかかった とびら

// マップ記号  # 壁 ／ . 床 ／ a b c 階段 ／ < > 地上への出入口 ／ 1〜5 宝箱
//             + とびら ／ D ドラゴン ／ P ローラ姫
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
    },
    // 本家「ぬまちのどうくつ」。地形は way78.com/dq1/fc/dn03.html のマップ画像を6×30で読み取った。
    // 北口(0,0)＝地上(112,52)／南口(0,29)＝地上(112,57)。左端の縦通路がリムルダールへの近道で、
    // ドラゴンを避けて通り抜けられる。姫のいる区画へはドラゴンのマスを必ず通る（本家どおり）
    numachi: {
        name: 'ぬまちの どうくつ',
        floorName: 'ちか1かい',
        zone: 19,
        rows: [
            '<.....', '.##.##', '.#..#.', '.##...', '....#.',
            '.#.##.', '..##..', '.##...', '....#.', '.#.##.',
            '.#....', '.#..#.', '.#.##.', '.#....', '.###D#',
            '.#....', '.#.###', '.#.#..', '.#.#.P', '.#.#..',
            '.#.##+', '.#....', '.#####', '....#.', '.##.#.',
            '..#...', '#...##', '###...', '..#.#.', '>...#.'
        ],
        links: { '<': ['world', 112, 52], '>': ['world', 112, 57] }
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

// ダンジョンごとの、その場所で起きること
const DUNGEON_EVENTS = { D: 'dragon', P: 'rora' };
// とびらは「開けた」ことをじゅもんに残すのでフラグで持つ
const DUNGEON_DOORS = { numachi: 'numachiDoor' };

// 記号の並びから、描画用のタイル配列・階段・宝箱・とびら・イベントの位置を組み立てる
function buildDungeon(d, id) {
    d.grid = []; d.marks = {}; d.chestAt = {}; d.doorAt = {}; d.eventAt = {};
    d.rows.forEach((row, y) => {
        const line = [];
        [...row].forEach((ch, x) => {
            const at = x + ',' + y;
            if (ch === '#') line.push(D_WALL);
            else if (ch === '.') line.push(D_FLOOR);
            else if (ch >= '1' && ch <= '9') { line.push(D_CHEST); d.chestAt[at] = ch; }
            else if (ch === '+') { line.push(D_DOOR); d.doorAt[at] = DUNGEON_DOORS[id]; }
            else if (DUNGEON_EVENTS[ch]) { line.push(D_FLOOR); d.eventAt[at] = DUNGEON_EVENTS[ch]; }
            else { line.push(D_STAIR); d.marks[ch] = { x, y }; }
        });
        d.grid.push(line);
    });
}
for (const id in DUNGEONS) buildDungeon(DUNGEONS[id], id);

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

// 入ってきた地上の出入口。リレミトや全滅のときの戻り先に使う
let dungeonEnteredFrom = { x: 37, y: 65 };
function dungeonExit() { return dungeonEnteredFrom; }

// 地上のこのマスに入ったらダンジョンへ、という対応表
const DUNGEON_ENTRANCES = {
    '37,65':  ['iwayama1', '<'],
    '112,52': ['numachi', '<'],     // 北口（本土側）
    '112,57': ['numachi', '>']      // 南口（リムルダール側）
};

// とびら。開けるまでは壁と同じ扱い
function doorFlagAt(x, y) {
    const d = currentDungeon();
    return (d && d.doorAt) ? (d.doorAt[x + ',' + y] || null) : null;
}
function isDoorLocked(x, y) {
    const f = doorFlagAt(x, y);
    return !!f && !getGameFlag(f);
}
// 隣にある閉じたとびら（本家の「とびら」コマンドは隣のマスに使う）
function adjacentLockedDoor() {
    if (!inDungeon()) return null;
    for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]]) {
        const x = playerPosition.x + dx, y = playerPosition.y + dy;
        if (!mapData[y] || mapData[y][x] === undefined) continue;
        if (isDoorLocked(x, y)) return { x, y, flag: doorFlagAt(x, y) };
    }
    return null;
}

// 足元で起きること（ドラゴン・ローラ姫）
function dungeonEventHere() {
    const d = currentDungeon();
    if (!d || !d.eventAt) return null;
    return d.eventAt[playerPosition.x + ',' + playerPosition.y] || null;
}

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
    dungeonEnteredFrom = { x, y };
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

// =====================================================================
// オート用: ダンジョンの経路探索と巡回計画
// =====================================================================
// そのマスを歩けるか（壁と、まだ開けていないとびらは通れない）
function dungeonPassable(mapId, x, y) {
    const d = DUNGEONS[mapId], g = d.grid;
    if (y < 0 || x < 0 || y >= g.length || x >= g[0].length) return false;
    if (g[y][x] === D_WALL) return false;
    const f = d.doorAt ? d.doorAt[x + ',' + y] : null;
    return !(f && !getGameFlag(f));
}

// 同じ階の中だけを歩く経路。地上とちがって端はつながっていない
function dungeonWalk(mapId, from, to) {
    if (from.x === to.x && from.y === to.y) return [];
    const prev = new Map([[from.x + ',' + from.y, null]]);
    const q = [[from.x, from.y]];
    while (q.length) {
        const [x, y] = q.shift();
        if (x === to.x && y === to.y) break;
        for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]]) {
            const nx = x + dx, ny = y + dy;
            if (!dungeonPassable(mapId, nx, ny)) continue;
            const k = nx + ',' + ny;
            if (prev.has(k)) continue;
            prev.set(k, [x + ',' + y, { x: nx, y: ny }]);
            q.push([nx, ny]);
        }
    }
    const goal = to.x + ',' + to.y;
    if (!prev.has(goal)) return null;
    const out = []; let cur = goal;
    while (prev.get(cur)) { out.unshift(prev.get(cur)[1]); cur = prev.get(cur)[0]; }
    return out;
}

// 階段でつながった別の階もひとつづきのグラフとして探索する。
// 返り値は「このマップのこのマスまで歩いて、着いたらAを押す」の並び
function dungeonRoute(fromMap, from, toMap, to) {
    const key = (m, x, y) => m + ':' + x + ',' + y;
    const startK = key(fromMap, from.x, from.y), goalK = key(toMap, to.x, to.y);
    if (startK === goalK) return { legs: [], cost: 0 };
    const prev = new Map([[startK, null]]);
    const dist = new Map([[startK, 0]]);
    const q = [[fromMap, from.x, from.y]];
    while (q.length) {
        const [m, x, y] = q.shift();
        if (key(m, x, y) === goalK) break;
        const d = DUNGEONS[m];
        const here = key(m, x, y);
        for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]]) {
            const nx = x + dx, ny = y + dy;
            if (!dungeonPassable(m, nx, ny)) continue;
            const k = key(m, nx, ny);
            if (prev.has(k)) continue;
            prev.set(k, [here, { kind: 'walk' }]);
            dist.set(k, dist.get(here) + 1);
            q.push([m, nx, ny]);
        }
        for (const mark in d.marks) {
            const p = d.marks[mark];
            if (p.x !== x || p.y !== y) continue;
            const link = d.links[mark];
            if (!link || link[0] === 'world') continue;       // 地上への出口はここでは使わない
            const t = DUNGEONS[link[0]].marks[link[1]];
            const k = key(link[0], t.x, t.y);
            if (prev.has(k)) continue;
            prev.set(k, [here, { kind: 'stairs', map: m, x, y }]);
            dist.set(k, dist.get(here) + 1);
            q.push([link[0], t.x, t.y]);
        }
    }
    if (!prev.has(goalK)) return null;
    const steps = []; let cur = goalK;
    while (prev.get(cur)) { steps.unshift(prev.get(cur)[1]); cur = prev.get(cur)[0]; }
    const legs = [];
    for (const s of steps) if (s.kind === 'stairs') legs.push({ map: s.map, x: s.x, y: s.y, act: 'stairs' });
    legs.push({ map: toMap, x: to.x, y: to.y, act: null });
    return { legs, cost: dist.get(goalK) };
}

// 入口から入って、行ける宝箱を近い順に全部あけて、出口から出るまでの計画。
// from を渡すとその場所から作り直す（全滅したあとや、途中でオートを入れたとき用）
function planDungeonTour(opt) {
    opt = opt || {};
    // 入口は「探索したいダンジョン」の出入口。中から始めるときは入ってきた口を使う
    const entranceKey = opt.entranceKey || '37,65';
    const ent = DUNGEON_ENTRANCES[entranceKey];
    if (!ent) return [];
    const [ex, ey] = entranceKey.split(',').map(Number);
    const startMap = ent[0], startPos = DUNGEONS[startMap].marks[ent[1]];
    const plan = [];
    let cur;
    if (opt.fromMap && opt.fromMap !== 'world') {
        cur = { map: opt.fromMap, x: opt.x, y: opt.y };
    } else {
        plan.push({ map: 'world', x: ex, y: ey, act: 'enter' });
        cur = { map: startMap, x: startPos.x, y: startPos.y };
    }
    if (!opt.exitOnly) {
        const left = [];
        for (const id in DUNGEONS) for (const k in DUNGEONS[id].chestAt) {
            if (openedChests.has(id + ':' + DUNGEONS[id].chestAt[k])) continue;
            const [x, y] = k.split(',').map(Number);
            left.push({ map: id, x, y });
        }
        while (left.length) {
            let best = null, bestRoute = null;
            for (const c of left) {
                const r = dungeonRoute(cur.map, cur, c.map, c);
                if (r && (!bestRoute || r.cost < bestRoute.cost)) { best = c; bestRoute = r; }
            }
            if (!best) break;                                  // 行けない宝箱は諦める
            bestRoute.legs[bestRoute.legs.length - 1].act = 'chest';
            plan.push(...bestRoute.legs);
            cur = best;
            left.splice(left.indexOf(best), 1);
        }
    }
    const back = dungeonRoute(cur.map, cur, startMap, startPos);
    if (back) {
        // 出入口の上に立っていても必ず「出る」区間を1つ置く
        if (!back.legs.length) plan.push({ map: startMap, x: startPos.x, y: startPos.y, act: 'exit' });
        else { plan.push(...back.legs); plan[plan.length - 1].act = 'exit'; }
    }
    return plan;
}

// 地上のある出入口から入って、別の出入口へ抜けるまでの計画（沼地の洞窟の通り抜け用）
function planTraverse(fromKey, toKey) {
    const a = DUNGEON_ENTRANCES[fromKey], b = DUNGEON_ENTRANCES[toKey];
    if (!a || !b || a[0] !== b[0]) return null;
    const [fx, fy] = fromKey.split(',').map(Number);
    const start = DUNGEONS[a[0]].marks[a[1]], goal = DUNGEONS[b[0]].marks[b[1]];
    const r = dungeonRoute(a[0], start, b[0], goal);
    if (!r || !r.legs.length) return null;
    const plan = [{ map: 'world', x: fx, y: fy, act: 'enter' }, ...r.legs];
    plan[plan.length - 1].act = 'exit';
    return plan;
}

// いまダンジョンの中にいる状態から、残りの目的地を回って出口へ出るまでの計画
function planFromHere(targets, exitKey) {
    const plan = [];
    let cur = { map: currentMapId, x: playerPosition.x, y: playerPosition.y };
    for (const t of targets || []) {
        const r = dungeonRoute(cur.map, cur, t.map, t);
        if (r && r.legs.length > 1) plan.push(...r.legs.slice(0, -1));
        plan.push({ map: t.map, x: t.x, y: t.y, act: t.act || null });
        cur = { map: t.map, x: t.x, y: t.y };
    }
    const ex = DUNGEON_ENTRANCES[exitKey];
    const ep = DUNGEONS[ex[0]].marks[ex[1]];
    const r = dungeonRoute(cur.map, cur, ex[0], ep);
    if (r && r.legs.length > 1) plan.push(...r.legs.slice(0, -1));
    plan.push({ map: ex[0], x: ep.x, y: ep.y, act: 'exit' });
    return plan;
}

// 目的地までの計画（ローラ姫の救出など、ダンジョン内の1点へ行って戻ってくる用）
function planErrand(fromKey, targets, backKey) {
    const a = DUNGEON_ENTRANCES[fromKey];
    if (!a) return null;
    const [fx, fy] = fromKey.split(',').map(Number);
    const plan = [{ map: 'world', x: fx, y: fy, act: 'enter' }];
    let cur = { map: a[0], ...DUNGEONS[a[0]].marks[a[1]] };
    // 経路は「階をまたぐ区間」を挟むために引くだけ。まだ開けていない扉の先など、
    // いま引けなくても実行時に引き直せばよいので、行き先だけは必ず積む
    for (const t of targets) {
        const r = dungeonRoute(cur.map, cur, t.map, t);
        if (r && r.legs.length > 1) plan.push(...r.legs.slice(0, -1));
        plan.push({ map: t.map, x: t.x, y: t.y, act: t.act || null });
        cur = { map: t.map, x: t.x, y: t.y };
    }
    const back = DUNGEON_ENTRANCES[backKey || fromKey];
    const bp = DUNGEONS[back[0]].marks[back[1]];
    const r = dungeonRoute(cur.map, cur, back[0], bp);
    if (r && r.legs.length > 1) plan.push(...r.legs.slice(0, -1));
    plan.push({ map: back[0], x: bp.x, y: bp.y, act: 'exit' });
    return plan;
}
