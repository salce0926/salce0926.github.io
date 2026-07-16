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
        hiraganaCursorIndex = 0;
        selectedHiraganaIndex = getCodeByHiragana(passHiraganaList, pass[0]);
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
                `　ぶき：${alignRightWide(player.weapon, 7)}`, `よろい：${alignRightWide(player.armor, 7)}`, `　たて：${alignRightWide(player.shield, 7)}`
            ];
            drawWindow(displayTileSize * screenWidth - displayTileSize * 8.5 - displayTileSize / 2, displayTileSize / 2, displayTileSize * 8.5, displayTileSize * 7.5, stats);
            drawWindowCommon(['おぼえたじゅもん：']);
        } else if (menuCursor === 1) {
            drawWindow(displayTileSize * screenWidth - displayTileSize * 6, displayTileSize, displayTileSize * 5, displayTileSize * ((player.spells.length || 1) + 1), player.spells.length ? player.spells : ['なし']);
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

    // Bキーでエンカウントテスト
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
// ふっかつのじゅもん入力ロジック
// =====================================================================
let textExplainSave = [];

// 選択中のひらがなをカーソル位置に書き込む
function writePassChar() {
    pass = pass.substring(0, hiraganaCursorIndex) + passHiraganaList[selectedHiraganaIndex] + pass.substring(hiraganaCursorIndex + 1);
    textExplainSave[2] = `ふっかつのじゅもん：${pass}`;
}
// カーソル位置の既存文字に選択ホイールを合わせる（移動しただけで上書きしない）
function syncWheelToCursor() {
    selectedHiraganaIndex = getCodeByHiragana(passHiraganaList, pass[hiraganaCursorIndex]);
}

function updatePasscode() {
    if (Input.consume('ArrowUp')) { selectedHiraganaIndex = modAdd(selectedHiraganaIndex, -1, 64); writePassChar(); }
    if (Input.consume('ArrowDown')) { selectedHiraganaIndex = modAdd(selectedHiraganaIndex, 1, 64); writePassChar(); }
    if (Input.consume('ArrowLeft')) { hiraganaCursorIndex = modAdd(hiraganaCursorIndex, -1, 3); syncWheelToCursor(); }
    if (Input.consume('ArrowRight')) { hiraganaCursorIndex = modAdd(hiraganaCursorIndex, 1, 3); syncWheelToCursor(); }

    if (Input.consume(' ')) {
        calcCodeToFlags();
        updatePlayerItems();
        updatePlayerStyle();
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
