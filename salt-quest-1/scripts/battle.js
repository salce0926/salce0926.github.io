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
function calcDamage(attack, defense) {
    const base = attack - Math.floor(defense / 2);
    const lo = Math.floor(base / 4), hi = Math.floor(base / 2);
    if (hi <= lo) return Math.max(0, lo);
    return lo + Math.floor(Math.random() * (hi - lo + 1));
}
// 敵の攻撃。しゅび力が高いとかすり傷程度しか通らない
function calcEnemyDamage(attack, defense) {
    const base = attack - Math.floor(defense / 2);
    if (base < Math.floor(attack / 2) + 1) {
        return Math.floor(Math.random() * (Math.floor(attack / 2) + 2) / 4);
    }
    return calcDamage(attack, defense);
}
// 会心の一撃は1/32で出て、しゅび力を無視して攻撃力の約50〜100%
function calcCritical(attack) {
    const lo = Math.max(1, attack - Math.floor(attack / 2) + 1);
    return lo + Math.floor(Math.random() * Math.max(1, attack - lo + 1));
}

// 敵データを受け取って戦闘を開始する（ランダムエンカウント/Bキー共通の入口）
async function startBattle(enemyDef) {
    enemy = { ...enemyDef };
    battleCursor = 0;
    battleStateMode = 'COMMAND';
    await showMessage([`${enemy.name}が あらわれた！`]);
    // 先制判定: すばやさ勝負に負けると敵に先に殴られる
    const heroRoll = player.agility * Math.floor(Math.random() * 256);
    const foeRoll = enemy.defense * Math.floor(Math.random() * 64);
    if (heroRoll < foeRoll) {
        await showMessage([`${enemy.name}の きゅうしゅう！`]);
        await executeEnemyTurn();
    } else {
        currentState = STATE.BATTLE;
    }
}

async function executeBattleTurn() {
    currentState = STATE.MESSAGE; // メッセージ中は入力をロック

    if (battleCursor === 0) { // たたかう
        const critical = Math.floor(Math.random() * 32) === 0;
        const damage = critical ? calcCritical(player.attack) : calcDamage(player.attack, enemy.defense);
        enemy.hp -= damage;
        if (critical) {
            await showMessage([`${player.name}の こうげき！`, 'かいしんの いちげき！！', `${enemy.name}に ${damage}ポイントの ダメージ！`]);
        } else if (damage === 0) {
            await showMessage([`${player.name}の こうげき！`, `${enemy.name}には ダメージを`, `あたえられない！`]);
        } else {
            await showMessage([`${player.name}の こうげき！`, `${enemy.name}に ${damage}ポイントの`, `ダメージを あたえた！`]);
        }
        await checkEnemySurvival();

    } else if (battleCursor === 1) { // じゅもん
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

    // 呪文の性能定義(MP消費・回復量は本家DQ1準拠)
    if (spellName === 'ホイミ') { mpCost = 4; heal = 10 + Math.floor(Math.random() * 8); }
    else if (spellName === 'ベホイミ') { mpCost = 10; heal = 85 + Math.floor(Math.random() * 16); }
    else if (spellName === 'ギラ') { mpCost = 2; damage = 10 + Math.floor(Math.random() * 6); }
    else if (spellName === 'ベギラマ') { mpCost = 5; damage = 35 + Math.floor(Math.random() * 15); }
    else if (spellName === 'ラリホー') { mpCost = 2; }
    else if (spellName === 'マホトーン') { mpCost = 2; }

    if (player.mp < mpCost) {
        await showMessage([`MPが たりない！`]);
        currentState = STATE.BATTLE;
        return;
    }

    player.mp -= mpCost;
    await showMessage([`${player.name}は ${spellName}を となえた！`]);

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
    if (enemy.asleep > 0) {
        enemy.asleep--;
        await showMessage([`${enemy.name}は ぐっすり ねむっている！`]);
        currentState = STATE.BATTLE;
        return;
    }
    const damage = calcEnemyDamage(enemy.attack, player.defense);
    player.hp -= damage;
    if (damage === 0) {
        await showMessage([`${enemy.name}の こうげき！`, `しかし ${player.name}は`, `ダメージを うけなかった！`]);
    } else {
        await showMessage([`${enemy.name}の こうげき！`, `${player.name}に ${damage}ポイントの`, `ダメージを あたえた！`]);
    }

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

function drawBattle() {
    drawWindowBattleEnemy();
    drawWindowPlayerInfo();

    if (battleStateMode === 'COMMAND') {
        let cmdText = battleCommands.map((c, i) => (i === battleCursor ? `▶${c}` : `　${c}`));
        drawWindow(displayTileSize * screenWidth - displayTileSize * 4.5 - displayTileSize / 2, displayTileSize / 2, displayTileSize * 4.5, displayTileSize * 4.5, cmdText);
        drawWindowCommon(['コマンド？']);
    } else if (battleStateMode === 'SPELL') {
        const combatSpells = player.spells.filter(s => COMBAT_SPELLS.includes(s));
        const options = [...combatSpells, 'もどる'];
        let spellText = options.map((s, i) => (i === spellCursor ? `▶${s}` : `　${s}`));
        drawWindow(displayTileSize * screenWidth - displayTileSize * 5.5 - displayTileSize / 2, displayTileSize / 2, displayTileSize * 5.5, displayTileSize * (options.length + 0.5), spellText);
        drawWindowCommon(['じゅもん？']);
    }
}
