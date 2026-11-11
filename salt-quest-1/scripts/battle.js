// =====================================================================
// 戦闘（バトル）システム
// =====================================================================
let battleCursor = 0;
const battleCommands = ['たたかう', 'じゅもん', 'どうぐ', 'にげる'];
let battleStateMode = 'COMMAND'; // COMMAND または SPELL
let spellCursor = 0;
const COMBAT_SPELLS = ['ホイミ', 'ギラ', 'ラリホー', 'マホトーン', 'ベホイミ', 'ベギラマ'];

// =====================================================================
// ダメージ計算（FC版DQ1準拠）
// 通常攻撃は (こうげき力 － しゅび力÷2) の 1/4〜1/2
// =====================================================================
// 本家FC版 ROM の battle_strike_enemy をそのまま写したもの
// （gitlab.com/segaloco/dq1disasm src/battle.s）
function rnd8() { return Math.floor(Math.random() * 256); }
function calcDamage(attack, defense) {
    const a = attack - (defense >> 1);
    if (a >= 2) {
        // ダメージ = ( rand(0〜a) + a ) >> 2 ＝ だいたい a/4 〜 a/2
        return (Math.floor(rnd8() * (a + 1) / 256) + a) >> 2;
    }
    // こうげき力が しゅび力の半分に届かないときは 0 か 1 しか通らない
    return rnd8() & 1;
}
// 敵の攻撃。しゅび力が高いとかすり傷程度しか通らない
// 本家FC版 ROM の battle_strike_player。しゅび力が高いとこちらの式になる
function calcEnemyDamage(attack, defense) {
    const d = defense >> 1;
    const b = (attack >> 1) + 1;
    const a = attack - d;
    if (a >= 0 && a < b) return Math.floor((Math.floor(rnd8() * b / 256) + 2) / 3);
    if (a >= 2) return (Math.floor(rnd8() * (a + 1) / 256) + a) >> 2;
    return rnd8() & 1;
}
// 会心の一撃は1/32で出て、しゅび力を無視して攻撃力の約50〜100%
function calcCritical(attack) {
    const lo = Math.max(1, attack - Math.floor(attack / 2) + 1);
    return lo + Math.floor(Math.random() * Math.max(1, attack - lo + 1));
}

// 戦闘の決着をイベント側で待てるようにする（'win' / 'lose' / 'flee'）
let battleResolver = null;

function endBattle(result) {
    battleStateMode = 'COMMAND';
    currentState = STATE.FIELD;
    if (battleResolver) {
        const resolve = battleResolver;
        battleResolver = null;
        resolve(result);
    }
}

// 敵データを受け取って戦闘を開始する（ランダムエンカウント/Bキー/ボス共通の入口）
function startBattle(enemyDef) {
    if (typeof autoPilot !== 'undefined' && autoPilot.on) autoPilot.wasBattle = true;
    const done = new Promise(resolve => { battleResolver = resolve; });
    beginBattleSequence(enemyDef);   // 演出は非同期に進める
    return done;
}

async function beginBattleSequence(enemyDef) {
    // 画面をすぐ戦闘に切り替える。await をはさんでから切り替えると、
    // そのあいだ画面は「フィールド」のままなので、キーを押しっぱなしだと
    // 戦闘のウィンドウを出したまま歩けてしまう（さらに歩いた先で
    // もう1つ戦闘が始まり、前の戦闘が宙に浮く）
    currentState = STATE.BATTLE;
    enemy = { ...enemyDef };
    // 本家同様、敵のHPは図鑑値の75〜100%でばらつく（毎回きっちり満タンではない）
    if (!enemy.noCritical) {
        // 本家: 現在HP = 最大HP － [最大HP×乱数(0〜255)÷1024]（＝75〜100%）
        const drop = Math.floor(enemy.maxHp * Math.floor(Math.random() * 256) / 1024);
        enemy.maxHp = Math.max(1, enemy.maxHp - drop);
        enemy.hp = enemy.maxHp;
    }
    battleCursor = 0;
    battleStateMode = 'COMMAND';
    // 前の戦闘を倒した瞬間や逃げた直後は明滅の残りが消化されずに残るため、
    // ここで戻さないと次の敵が出てきた瞬間から赤く点滅する
    enemyFlash = 0;
    player.asleep = 0;      // 眠り・呪文封じは戦闘ごとに解ける
    player.sealed = false;
    await showMessage([`${enemy.name}が あらわれた！`]);
    // 先制判定（本家の式）: すばやさ×4 ÷ (すばやさ×4 + 敵のすばやさ) で勇者が先手
    const a4 = player.agility * 4;
    if (Math.random() >= a4 / (a4 + (enemy.agility || enemy.defense || 1))) {
        // きゅうしゅう も「1回のターン処理」なので錠をかける。ここが外にあると、
        // 処理の途中でオートがAを押せてしまい、敵のターンが二重に走って
        // ひとつの戦闘で2回 殺されていた（所持金も2回 半分になる）
        battleBusy = true;
        try {
            await showMessage([`${enemy.name}の きゅうしゅう！`]);
            await executeEnemyTurn();
        } finally { battleBusy = false; }
    } else {
        currentState = STATE.BATTLE;
    }
}

// 1回のターン処理が終わるまで、次のターンを始めさせないための錠。
// オートは毎フレームAを押すので、これが無いとターンの途中でもう1回
// 走り込んでしまい、状態がちぐはぐになって固まることがある
let battleBusy = false;
async function executeBattleTurn() {
    if (battleBusy) return;
    battleBusy = true;
    try { await executeBattleTurnInner(); } finally { battleBusy = false; }
}
async function executeBattleTurnInner() {
    currentState = STATE.MESSAGE; // メッセージ中は入力をロック

    if (player.asleep > 0) {      // ラリホーで眠っている間は行動できない
        player.asleep--;
        await showMessage([`${player.name}は ねむっている！`]);
        await executeEnemyTurn();
        return;
    }

    if (battleCursor === 0) { // たたかう
        // 回避判定（本家: 敵の回避力÷64 の確率で空振り。会心の一撃も同じく外れる）
        if (Math.floor(Math.random() * 64) < (enemy.evasion || 0)) {
            await showMessage([`${player.name}の こうげき！`, `しかし ${enemy.name}は`, `すばやく みをかわした！`]);
            await executeEnemyTurn();
            return;
        }
        // 本家ROM: りゅうおうは1体目も2体目も会心の一撃の対象外
        const critical = !enemy.noCritical && enemy.name !== 'りゅうおう'
                         && Math.floor(Math.random() * 32) === 0;
        const damage = critical ? calcCritical(player.attack) : calcDamage(player.attack, enemy.defense);
        enemy.hp -= damage;
        if (damage > 0) enemyFlash = FLASH_FRAMES;
        if (critical) {
            await showMessage([`${player.name}の こうげき！`, 'かいしんの いちげき！！', `${enemy.name}に ${damage}ポイントの ダメージ！`]);
        } else if (damage === 0) {
            await showMessage([`${player.name}の こうげき！`, `${enemy.name}には ダメージを`, `あたえられない！`]);
        } else {
            await showMessage([`${player.name}の こうげき！`, `${enemy.name}に ${damage}ポイントの`, `ダメージを あたえた！`]);
        }
        await checkEnemySurvival();

    } else if (battleCursor === 1) { // じゅもん
        if (player.sealed) {
            await showMessage(['じゅもんは ふうじこめられている！']);
            currentState = STATE.BATTLE;
            return;
        }
        // 戦闘用の呪文だけをフィルタリング
        const combatSpells = player.spells.filter(s => COMBAT_SPELLS.includes(s));
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
            const heal = randRange(23, 30);   // 本家は23〜30
            player.hp = Math.min(player.maxHp, player.hp + heal);
            await showMessage([`${player.name}は やくそうを つかった！`, `HPが ${heal} かいふくした！`]);
            await executeEnemyTurn();
        } else {
            await showMessage([`つかえる どうぐを もっていない！`]);
            currentState = STATE.BATTLE;
        }

    } else if (battleCursor === 3) { // にげる
        // 本家の逃走成功確率。敵ごとに逃げにくさが4段階ある（escapeRank）
        const A = player.agility, B = enemy.agility || enemy.defense || 1;
        const k = [4, 8 / 3, 2, 1][enemy.escapeRank || 0];
        const escapeChance = (A * k) / (A * k + B);
        if (Math.random() < escapeChance) {
            await showMessage([`${player.name}は にげだした！`]);
            endBattle('flee');
        } else {
            await showMessage([`${player.name}は にげだした！`, `しかし まわりこまれてしまった！`]);
            await executeEnemyTurn();
        }
    }
}

async function executeSpellTurn(spellName) {
    if (battleBusy) return;
    battleBusy = true;
    try { await executeSpellTurnInner(spellName); } finally { battleBusy = false; }
}
async function executeSpellTurnInner(spellName) {
    currentState = STATE.MESSAGE;
    let mpCost = 0, heal = 0, damage = 0;

    // 呪文の性能定義(MP消費・回復量は本家DQ1準拠)
    if (spellName === 'ホイミ') { mpCost = 4; heal = 10 + Math.floor(Math.random() * 8); }
    else if (spellName === 'ベホイミ') { mpCost = 10; heal = 85 + Math.floor(Math.random() * 16); }
    else if (spellName === 'ギラ') { mpCost = 2; damage = randRange(5, 12); }
    else if (spellName === 'ベギラマ') { mpCost = 5; damage = randRange(58, 65); }
    else if (spellName === 'ラリホー') { mpCost = 2; }
    else if (spellName === 'マホトーン') { mpCost = 2; }

    if (player.mp < mpCost) {
        await showMessage([`MPが たりない！`]);
        currentState = STATE.BATTLE;
        return;
    }

    player.mp -= mpCost;
    await showMessage([`${player.name}は ${spellName}を となえた！`]);

    // 本家仕様: 敵ごとに呪文の回避率がある（記載値/16）。メタルスライムや
    // りゅうおうはギラ系もラリホーも15/16で弾く
    const resist = enemy.resist || {};
    const dodges = key => Math.floor(Math.random() * 16) < (resist[key] || 0);
    const resistKey = (spellName === 'ラリホー') ? 'rariho'
                    : (spellName === 'マホトーン') ? 'mahoton'
                    : (spellName === 'ギラ' || spellName === 'ベギラマ') ? 'gira' : null;
    if (resistKey && dodges(resistKey)) {
        await showMessage([`しかし ${enemy.name}には`, `きかなかった！`]);
        battleStateMode = 'COMMAND';
        await executeEnemyTurn();
        return;
    }

    if (spellName === 'ラリホー') {
        enemy.asleep = 2 + Math.floor(Math.random() * 2);
        await showMessage([`${enemy.name}は ねむってしまった！`]);
    } else if (spellName === 'マホトーン') {
        enemy.sealed = true;
        await showMessage([`${enemy.name}の じゅもんを ふうじこめた！`]);
    } else if (heal > 0) {
        player.hp = Math.min(player.maxHp, player.hp + heal);
        await showMessage([`${player.name}の HPが ${heal} かいふくした！`]);
    } else if (damage > 0) {
        enemy.hp -= damage;
        enemyFlash = FLASH_FRAMES;
        await showMessage([`${enemy.name}に ${damage}ポイントの`, `ダメージを あたえた！`]);
    }

    battleStateMode = 'COMMAND'; // 呪文使用後は通常コマンドに戻る
    await checkEnemySurvival();
}

async function checkEnemySurvival() {
    if (!battleResolver) return;        // すでに畳まれた戦闘
    if (enemy.hp > 0) {
        await executeEnemyTurn();
        return;
    }

    // 第二形態があるボスは倒れずに姿を変える
    if (enemy.nextForm) {
        const next = enemy.nextForm;
        await showMessage(enemy.nextFormMessage || [`${enemy.name}は すがたを かえた！`]);
        enemy = { ...next };
        battleStateMode = 'COMMAND';
        player.asleep = 0;
        currentState = STATE.BATTLE;
        return;
    }

    await showMessage([`${enemy.name}を たおした！`]);
    if (enemy.exp > 0 || enemy.gold > 0) {
        await showMessage([`${enemy.exp}の けいけんちと`, `${enemy.gold}ゴールドを てにいれた！`]);
        player.exp += enemy.exp;
        player.gold += enemy.gold;

        // レベルアップの判定
        const oldLevel = player.level;
        updatePlayerLevel();
        if (player.level > oldLevel) {
            await showMessage([`${player.name}は レベル${player.level}に あがった！`,
                `HP ${player.maxHp}　MP ${player.maxMp}　こうげき ${player.attack}　しゅび ${player.defense}`]);
        }
    }
    endBattle('win');
}

// 呪文・炎のダメージは まほうのよろい / ロトのよろい で2/3に軽減される（本家仕様）
// 本家: まほうのよろいは「呪文ダメージ」だけ2/3、ロトのよろいは「呪文と炎」を2/3
function mitigateMagic(damage) {
    const name = armors[player.armorIndex] ? armors[player.armorIndex].name : '';
    if (name === 'まほうのよろい' || name === 'ロトのよろい') return Math.floor(damage * 2 / 3);
    return damage;
}
function mitigateFire(damage) {
    const name = armors[player.armorIndex] ? armors[player.armorIndex].name : '';
    if (name === 'ロトのよろい') return Math.floor(damage * 2 / 3);
    return damage;
}
function randRange(lo, hi) { return lo + Math.floor(Math.random() * (hi - lo + 1)); }

// 敵がこのターン何をするか決める。封じられていれば呪文は選ばない
// 本家の行動決定手順。上から順に判定し、決まらなければ次へ落ちる
//   1. 逃げる → 2. 補助呪文(ホイミ/ベホイミ/ラリホー/マホトーン) → 3. 攻撃呪文 → 4. たたかう
// 確率は敵ごとに 1/4・2/4・3/4 が決まっている
function pickEnemyAction() {
    // 本家仕様: 勇者のこうげき力が敵のこうげき力の2倍以上なら、毎ターン1/4で逃げる。
    // HPは関係ない。メタルスライム(攻10)が捕まらないのはこの規則のため
    if (!enemy.noFlee && player.attack >= enemy.attack * 2 && Math.random() < 0.25) return 'flee';

    const acts = enemy.acts || {};
    const sup = acts.support;
    if (sup && !enemy.sealed && Math.random() < sup.p) {
        // 唱えようとしても、条件を満たさなければ「行動が決まらなかった」ことになり次へ落ちる
        const heal = (sup.spell === 'hoimi' || sup.spell === 'behoimi');
        const blocked = (heal && enemy.hp > enemy.maxHp / 4)
                     || (sup.spell === 'rarihoo' && player.asleep > 0)
                     || (sup.spell === 'mahotone' && player.sealed);
        if (!blocked) return sup.spell;
    }
    const atk = acts.attack;
    if (atk && Math.random() < atk.p) {
        // 炎は呪文ではないのでマホトーンで封じられない
        const isSpell = (atk.spell === 'gira' || atk.spell === 'begirama');
        if (!(isSpell && enemy.sealed)) return atk.spell;
    }
    return 'attack';
}

async function executeEnemyTurn() {
    // すでに畳まれた戦闘（全滅・逃走・勝利のあと）では何もしない。
    // 二重に走ると、城へ運ばれたあとの勇者をもう一度 殺してしまう
    if (!battleResolver) return;
    currentState = STATE.MESSAGE;   // 処理中は入力をロック（たたかうと同じ扱い）
    if (enemy.asleep > 0) {
        enemy.asleep--;
        await showMessage([`${enemy.name}は ぐっすり ねむっている！`]);
        currentState = STATE.BATTLE;
        return;
    }

    let damage = 0;
    switch (pickEnemyAction()) {
        case 'flee':
            await showMessage([`${enemy.name}は にげだした！`]);
            endBattle('win');   // 取り逃がしても戦闘自体は切り抜けた扱い
            return;
        case 'gira':
            damage = mitigateMagic(randRange(3, 10));
            player.hp = Math.max(0, player.hp - damage);   // 本家の表示は0どまり
            await showMessage([`${enemy.name}は ギラを となえた！`, `${player.name}に ${damage}ポイントの`, `ダメージを あたえた！`]);
            break;
        case 'begirama':
            damage = mitigateMagic(randRange(30, 45));
            player.hp = Math.max(0, player.hp - damage);   // 本家の表示は0どまり
            await showMessage([`${enemy.name}は ベギラマを となえた！`, `${player.name}に ${damage}ポイントの`, `ダメージを あたえた！`]);
            break;
        case 'fire':
            damage = mitigateFire(randRange(16, 23));
            player.hp = Math.max(0, player.hp - damage);   // 本家の表示は0どまり
            await showMessage([`${enemy.name}は ほのおを はいた！`, `${player.name}に ${damage}ポイントの`, `ダメージを あたえた！`]);
            break;
        case 'firestrong':
            damage = mitigateFire(randRange(65, 72));
            player.hp = Math.max(0, player.hp - damage);   // 本家の表示は0どまり
            await showMessage([`${enemy.name}は はげしい ほのおを はいた！`, `${player.name}に ${damage}ポイントの`, `ダメージを あたえた！`]);
            break;
        case 'behoimi': {
            const heal = randRange(85, 100);
            enemy.hp = Math.min(enemy.maxHp, enemy.hp + heal);
            await showMessage([`${enemy.name}は ベホイミを となえた！`, `${enemy.name}の きずが かいふくした！`]);
            break;
        }
        case 'hoimi': {
            const heal = randRange(20, 27);
            enemy.hp = Math.min(enemy.maxHp, enemy.hp + heal);
            await showMessage([`${enemy.name}は ホイミを となえた！`, `${enemy.name}の きずが かいふくした！`]);
            break;
        }
        case 'rarihoo':
            // 本家: 敵のラリホーは必ず成功する（ロトのよろいでも防げない）
            await showMessage([`${enemy.name}は ラリホーを となえた！`]);
            player.asleep = randRange(2, 4);
            await showMessage([`${player.name}は ねむって しまった！`]);
            break;
        case 'mahotone':
            await showMessage([`${enemy.name}は マホトーンを となえた！`]);
            if (armors[player.armorIndex] && armors[player.armorIndex].name === 'ロトのよろい') {
                await showMessage(['しかし ロトのよろいが ひかり', 'じゅもんを まもった！']);
            } else if (Math.random() < 0.5) {   // 本家: 成功率50%
                player.sealed = true;
                await showMessage([`${player.name}の じゅもんが`, 'ふうじこめられた！']);
            } else {
                await showMessage([`しかし ${player.name}には`, 'きかなかった！']);
            }
            break;
        default:
            damage = calcEnemyDamage(enemy.attack, player.defense);
            player.hp = Math.max(0, player.hp - damage);   // 本家の表示は0どまり
            if (damage === 0) {
                await showMessage([`${enemy.name}の こうげき！`, `しかし ${player.name}は`, `ダメージを うけなかった！`]);
            } else {
                await showMessage([`${enemy.name}の こうげき！`, `${player.name}に ${damage}ポイントの`, `ダメージを あたえた！`]);
            }
    }

    if (player.hp <= 0) {
        // 本家FC版の死亡メッセージと、城で生き返ったときの王様のことば
        // （ドラゴンクエスト大辞典【あなたは　しにました】）
        await showMessage(['あなたは しにました']);
        const lost = playerKilled();
        await showMessage([`おうさま「おお ${player.name}！`,
            '　　　　　しんでしまうとは なにごとだ！」',
            lost > 0 ? `ゴールドを ${lost} おとしてしまった...` : '',
            `のこりの もちきんは ${player.gold}G`]);
        endBattle('lose');
    } else {
        currentState = STATE.BATTLE;
    }
}

function updateBattle() {
    if (battleBusy) return;        // ターン処理中は入力を受けない
    if (battleStateMode === 'COMMAND') {
        if (Input.consume('ArrowUp')) battleCursor = modAdd(battleCursor, -1, 4);
        if (Input.consume('ArrowDown')) battleCursor = modAdd(battleCursor, 1, 4);
        consumeCancel();   // 戦闘中は逃げられないので、Bは何もしない
        if (Input.consume(' ')) executeBattleTurn();
    } else if (battleStateMode === 'SPELL') {
        if (consumeCancel()) { battleStateMode = 'COMMAND'; return; }   // 呪文選択をやめる
        // ホイミやギラなど、戦闘で使える呪文のみを抽出
        const combatSpells = player.spells.filter(s => COMBAT_SPELLS.includes(s));
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

// 敵とステータスの窓は gameLoop 側が戦闘中ずっと描いているのでここでは触らない
function drawBattle() {
    if (battleStateMode === 'COMMAND') {
        let cmdText = battleCommands.map(c => `　${c}`);
        drawWindow(displayTileSize * screenWidth - displayTileSize * 4.5 - displayTileSize / 2, displayTileSize / 2, displayTileSize * 4.5, displayTileSize * 4.5, cmdText, battleCursor);
        drawWindowCommon(['コマンド？']);
    } else if (battleStateMode === 'SPELL') {
        const combatSpells = player.spells.filter(s => COMBAT_SPELLS.includes(s));
        const options = [...combatSpells, 'もどる'];
        let spellText = options.map(s => `　${s}`);
        drawWindow(displayTileSize * screenWidth - displayTileSize * 5.5 - displayTileSize / 2, displayTileSize / 2, displayTileSize * 5.5, displayTileSize * (options.length + 0.5), spellText, spellCursor);
        drawWindowCommon(['じゅもん？']);
    }
}
