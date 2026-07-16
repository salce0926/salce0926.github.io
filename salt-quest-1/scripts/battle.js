// =====================================================================
// 戦闘（バトル）システム
// ※現状は小さく試す段階: フィールドのBキーでのみ発生（ランダムエンカウント未実装）
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
