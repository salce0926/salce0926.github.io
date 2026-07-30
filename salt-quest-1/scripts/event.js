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
        await offerTown('マイラの村', townShops.maira);
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
        await offerTown('リムルダールの町', townShops.rimuldar);
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
        await offerTown('ガライの町', townShops.garai);
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
                await showMessage(['ゴーレムが守っていた町', 'メルキドに 入ることができた！']);
            }
        }
        if (getGameFlag('golemKilled')) await offerTown('メルキドの町', townShops.melkido);
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
            player.armorIndex = armors.findIndex(a => a.name === 'ロトのよろい');
            recalcPlayerPower();
            await showMessage(['ここはドムドーラの町だった', '今は廃墟となってしまっている...', '突然 あくまのきし が現れた！']);
            await showMessage(['あくまのきし を倒して', 'ロトのよろいを 手に入れた！', `しゅび力が ${player.defense}に なった！`]);
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
        await showMessage(['ここは ラダトームの町だ', 'じゅもんの きろくと やどやが あるらしい']);
        await offerTown('ラダトームの町', townShops.radatome);
        calcFlagsToCode();
        await showMessage(['しんかん「そなたの ぼうけんを きろくしよう」', 'ふっかつのじゅもん：', `　${pass}`]);
        openPasscode();
        return;
    } else {
        handled = false;
    }

    // イベントで立ったフラグを装備・持ち物・見た目へ反映する
    updatePlayerItems();
    updatePlayerStyle();

    if (handled) currentState = STATE.FIELD;
    else {
        menuLevel = 1; menuCursor = 0; currentState = STATE.MENU;
    }
}

// =====================================================================
// 町の施設（やどや・どうぐや・ぶきや）
// 品揃えはFC版DQ1の各町の店に合わせている
// =====================================================================
const townShops = {
    radatome:   { inn: 6,  tools: true, weapons: [1, 2, 3], armors: [1, 2], shieldList: [1] },
    garai:      { inn: 20, tools: true, weapons: [4], armors: [3, 4], shieldList: [2] },
    maira:      { inn: 25, tools: true, armors: [5] },
    rimuldar:   { inn: 55, tools: true, weapons: [5], armors: [6] },
    melkido:    { tools: true, weapons: [6], shieldList: [3] }
};

async function stayInn(price) {
    if (player.gold < price) {
        await showMessage(['やどや「おきゃくさん おかねが', '　　　　たりないようですが...」']);
        return;
    }
    player.gold -= price;
    player.hp = player.maxHp;
    player.mp = player.maxMp;
    await showMessage(['やどや「おはようございます', '　　　　よい たびを！」', 'HPとMPが かいふくした！']);
}

async function shopTools() {
    while (true) {
        const menu = [`やくそう ${HERB_PRICE}G`, 'やめる'];
        const i = await chooseFromList([`どうぐや「なにを おかいに なりますか？」`,
                                        `　もちきん ${player.gold}G　やくそう ${player.herb}こ`], menu);
        if (i === menu.length - 1) return;
        if (player.herb >= HERB_MAX) {
            await showMessage([`どうぐや「やくそうは ${HERB_MAX}こまでしか`, '　　　　　もてませんよ」']);
        } else if (player.gold < HERB_PRICE) {
            await showMessage(['どうぐや「おかねが たりませんね」']);
        } else {
            player.gold -= HERB_PRICE;
            player.herb++;
            await showMessage(['やくそうを かいました！', `のこり ${player.gold}G　やくそう ${player.herb}こ`]);
        }
    }
}

// 武器・鎧・盾を売る店。買うと今の装備は下取り（買値の半額）になる
async function shopWeapons(shop) {
    while (true) {
        const stock = [];
        (shop.weapons || []).forEach(n => stock.push({ kind: 'weapon', list: weapons, index: n }));
        (shop.armors || []).forEach(n => stock.push({ kind: 'armor', list: armors, index: n }));
        (shop.shieldList || []).forEach(n => stock.push({ kind: 'shield', list: shields, index: n }));
        const menu = stock.map(s => `${s.list[s.index].name} ${s.list[s.index].price}G`);
        menu.push('やめる');
        const i = await chooseFromList(['ぶきや「どれに なさいますか？」', `　もちきん ${player.gold}G`], menu);
        if (i === menu.length - 1) return;

        const pick = stock[i];
        const goods = pick.list[pick.index];
        const nowIndex = pick.kind === 'weapon' ? player.weaponIndex
                       : pick.kind === 'armor' ? player.armorIndex : player.shieldIndex;
        if (nowIndex === pick.index) {
            await showMessage(['ぶきや「それは もう おもちですよ」']);
            continue;
        }
        const tradeIn = Math.floor(pick.list[nowIndex].price / 2);
        const cost = goods.price - tradeIn;
        if (player.gold < cost) {
            await showMessage(['ぶきや「おかねが たりませんね」',
                               `${goods.name}は ${goods.price}G`,
                               tradeIn > 0 ? `いまの ${pick.list[nowIndex].name}は ${tradeIn}Gで ひきとります` : '']);
            continue;
        }
        player.gold -= cost;
        if (pick.kind === 'weapon') player.weaponIndex = pick.index;
        else if (pick.kind === 'armor') player.armorIndex = pick.index;
        else player.shieldIndex = pick.index;
        recalcPlayerPower();
        await showMessage([`${goods.name}を そうびした！`,
            tradeIn > 0 ? `いままでの ${pick.list[nowIndex].name}は ${tradeIn}Gに なった` : '',
            `こうげき力 ${player.attack}　しゅび力 ${player.defense}　のこり ${player.gold}G`]);
    }
}

async function offerTown(townName, shop) {
    while (true) {
        const menu = [];
        if (shop.inn) menu.push({ label: `やどや ${shop.inn}G`, act: () => stayInn(shop.inn) });
        if (shop.tools) menu.push({ label: 'どうぐや', act: () => shopTools() });
        if (shop.weapons || shop.armors || shop.shieldList) menu.push({ label: 'ぶきや', act: () => shopWeapons(shop) });
        menu.push({ label: 'でる', act: null });
        const i = await chooseFromList([`${townName}には なにが あるかな？`,
                                        `　もちきん ${player.gold}G`], menu.map(m => m.label));
        if (!menu[i].act) return;
        await menu[i].act();
    }
}

// =====================================================================
// フィールドでの呪文・どうぐ
// =====================================================================
const FIELD_SPELL_MP = { 'ホイミ': 4, 'ギラ': 2, 'ラリホー': 2, 'レミーラ': 3, 'マホトーン': 2, 'リレミト': 6, 'ルーラ': 8, 'トヘロス': 2, 'ベホイミ': 10, 'ベギラマ': 5 };
let repelSteps = 0; // トヘロスの残り歩数

async function castFieldSpell(spellName) {
    const mpCost = FIELD_SPELL_MP[spellName] || 0;
    if (player.mp < mpCost) {
        await showMessage(['MPが たりない！']);
        currentState = STATE.FIELD;
        return;
    }
    if (spellName === 'ホイミ' || spellName === 'ベホイミ') {
        player.mp -= mpCost;
        const heal = spellName === 'ホイミ' ? 10 + Math.floor(Math.random() * 8) : 85 + Math.floor(Math.random() * 16);
        player.hp = Math.min(player.maxHp, player.hp + heal);
        await showMessage([`${player.name}は ${spellName}を となえた！`, `HPが ${heal} かいふくした！`]);
    } else if (spellName === 'ルーラ') {
        player.mp -= mpCost;
        playerPosition.x = 51; playerPosition.y = 51;
        await showMessage([`${player.name}は ルーラを となえた！`, 'ラダトームの城に もどった！']);
    } else if (spellName === 'トヘロス') {
        player.mp -= mpCost;
        repelSteps = 128;
        await showMessage([`${player.name}は トヘロスを となえた！`, 'よわい まものが よってこなくなった！']);
    } else {
        player.mp -= mpCost;
        await showMessage([`${player.name}は ${spellName}を となえた！`, 'しかし なにも おこらなかった！']);
    }
    currentState = STATE.FIELD;
}

async function useFieldItem(itemName) {
    if (itemName === 'やくそう') {
        player.herb--;
        const heal = 25 + Math.floor(Math.random() * 10);
        player.hp = Math.min(player.maxHp, player.hp + heal);
        await showMessage([`${player.name}は やくそうを つかった！`, `HPが ${heal} かいふくした！`]);
    } else {
        await showMessage([`${itemName}は ここでは つかえない！`]);
    }
    currentState = STATE.FIELD;
}

// =====================================================================
// メニューロジック
// =====================================================================
let menuLevel = 0, menuCursor = 0, subCursor = 0;
const commandList = ['つよさ', 'じゅもん', 'どうぐ', 'きろく'];

// じゅもん/どうぐ画面の選択肢
function menuOptions() {
    if (menuCursor === 1) return [...player.spells, 'もどる'];
    const opts = [];
    if (player.herb > 0) opts.push('やくそう');
    if (player.key > 0) opts.push('かぎ');
    return opts.concat(player.items.map(i => i.name), ['もどる']);
}

function updateMenu() {
    if (menuLevel === 1) {
        if (Input.consume('ArrowUp')) menuCursor = modAdd(menuCursor, -1, 4);
        if (Input.consume('ArrowDown')) menuCursor = modAdd(menuCursor, 1, 4);
        if (Input.consume(' ')) {
            menuLevel = 2; subCursor = 0;
            if (menuCursor === 3) calcFlagsToCode();
        }
    } else if (menuLevel === 2) {
        if (menuCursor === 1 || menuCursor === 2) {
            const options = menuOptions();
            if (Input.consume('ArrowUp')) subCursor = modAdd(subCursor, -1, options.length);
            if (Input.consume('ArrowDown')) subCursor = modAdd(subCursor, 1, options.length);
            if (Input.consume(' ')) {
                const sel = options[subCursor];
                menuLevel = 0;
                if (sel === 'もどる') currentState = STATE.FIELD;
                else if (menuCursor === 1) castFieldSpell(sel);
                else useFieldItem(sel);
            }
        } else if (Input.consume(' ')) {
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
                `こうげき力：　　　${alignRight(player.attack, 3)}`, `　しゅび力：　　　${alignRight(player.defense, 3)}`,
                `　ぶき：${alignRightWide(player.weapon, 7)}`, `よろい：${alignRightWide(player.armor, 7)}`, `　たて：${alignRightWide(player.shield, 7)}`
            ];
            drawWindow(displayTileSize * screenWidth - displayTileSize * 8.5 - displayTileSize / 2, displayTileSize / 2, displayTileSize * 8.5, displayTileSize * 7.5, stats);
            drawWindowCommon(['おぼえたじゅもん：']);
        } else if (menuCursor === 1 || menuCursor === 2) {
            const options = menuOptions();
            const label = (name) => {
                if (name === 'やくそう') return `やくそう ${player.herb}`;
                if (name === 'かぎ') return `かぎ ${player.key}`;
                return name;
            };
            const text = options.map((s, i) => (i === subCursor ? `▶${label(s)}` : `　${label(s)}`));
            drawWindow(displayTileSize * screenWidth - displayTileSize * 7, displayTileSize, displayTileSize * 6.5, displayTileSize * (options.length + 1), text);
        } else if (menuCursor === 3) {
            drawWindowCommon([`ふっかつのじゅもん：`, `　${pass}`, `しろの みぎうえの まちで にゅうりょく`]);
        }
    }
}

// =====================================================================
// フィールド移動とデバッグ操作
// =====================================================================
// 移動は時間基準(ms)。フレームレート(60Hz/120Hz)に依存しない
const MOVE_INTERVAL = 150; // 1歩あたりのミリ秒
let lastMoveTime = 0;
function isMoveAllowed(x, y) {
    if (debugMode) return true;
    if (typeof mapData === 'undefined' || !mapData[y] || mapData[y][x] === undefined) return false;
    return [25, 26, 27, 28, 29, 31, 32, 33, 34, 35].includes(mapData[y][x]);
}

function updateField() {
    if (Input.consume('d')) { debugMode = !debugMode; }
    if (Input.consume('l')) { // デバッグ: 1レベル上げてHP/MP全快
        const next = playerStatus.find(s => s.level === player.level + 1);
        if (next) {
            player.exp = Math.max(player.exp, next.requiredExp);
            updatePlayerLevel();
            player.hp = player.maxHp; player.mp = player.maxMp;
        }
    }

    // Bキーでエンカウントテスト（その場のゾーンの敵が出る）
    if (Input.consume('b')) {
        startBattle(pickFieldEnemy(playerPosition.x, playerPosition.y));
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
        const now = performance.now();
        if (now - lastMoveTime >= MOVE_INTERVAL) {
            lastMoveTime = now;
            let nx = modAdd(playerPosition.x, dx, mapWidth);
            let ny = modAdd(playerPosition.y, dy, mapHeight);
            if (isMoveAllowed(nx, ny)) {
                playerPosition.x = nx;
                playerPosition.y = ny;
                if (repelSteps > 0) repelSteps--; // トヘロスは128歩で切れる
                // ランダムエンカウント（デバッグモード中は発生しない）
                if (!debugMode && checkEncounter(nx, ny)) {
                    const foe = pickFieldEnemy(nx, ny);
                    // トヘロス効果中は勇者の守備力より攻撃力が低い敵を避ける(本家仕様)
                    if (!(repelSteps > 0 && foe.attack < player.defense)) {
                        startBattle(foe);
                        return;
                    }
                }
            }
        }
    }
}

// =====================================================================
// ふっかつのじゅもん入力ロジック
// =====================================================================
let textExplainSave = [];

// じゅもん入力画面を開く
function openPasscode() {
    calcFlagsToCode();
    hiraganaCursorIndex = 0;
    syncWheelToCursor();
    refreshPassText();
    currentState = STATE.PASSCODE;
}
// 入力中のじゅもんを表示に反映（カーソルはdrawPasscodeが実測位置に描く）
const PASS_LINE_PREFIX = '　';
function refreshPassText() {
    textExplainSave = [
        '←→で もじを えらび ↑↓で かえる',
        PASS_LINE_PREFIX + pass,
        'スペースで けってい'
    ];
}
// 選択中のひらがなをカーソル位置に書き込む
function writePassChar() {
    pass = pass.substring(0, hiraganaCursorIndex) + passHiraganaList[selectedHiraganaIndex] + pass.substring(hiraganaCursorIndex + 1);
    refreshPassText();
}
// カーソル位置の既存文字に選択ホイールを合わせる（移動しただけで上書きしない）
function syncWheelToCursor() {
    selectedHiraganaIndex = getCodeByHiragana(passHiraganaList, pass[hiraganaCursorIndex]);
}

async function confirmPasscode() {
    if (calcCodeToFlags()) {
        updatePlayerItems();
        updatePlayerStyle();
        await showMessage([`${player.name}よ よくぞもどった！`,
            `レベル${player.level}　G ${player.gold}　やくそう ${player.herb}`]);
        currentState = STATE.FIELD;
    } else {
        await showMessage(['じゅもんが ちがいます！', 'もういちど かくにんしてください']);
        refreshPassText();
        currentState = STATE.PASSCODE;
    }
}

function updatePasscode() {
    if (Input.consume('ArrowUp')) { selectedHiraganaIndex = modAdd(selectedHiraganaIndex, -1, 64); writePassChar(); }
    if (Input.consume('ArrowDown')) { selectedHiraganaIndex = modAdd(selectedHiraganaIndex, 1, 64); writePassChar(); }
    if (Input.consume('ArrowLeft')) { hiraganaCursorIndex = modAdd(hiraganaCursorIndex, -1, PASS_LENGTH); syncWheelToCursor(); refreshPassText(); }
    if (Input.consume('ArrowRight')) { hiraganaCursorIndex = modAdd(hiraganaCursorIndex, 1, PASS_LENGTH); syncWheelToCursor(); refreshPassText(); }

    if (Input.consume(' ')) confirmPasscode();
}

// じゅもん文字列の何文字目を編集中かを、実際の文字幅を測って示す
function drawPassCursor() {
    const winX = displayTileSize / 2;
    const winY = displayTileSize * screenHeight - displayTileSize * 4 - displayTileSize / 2;
    const textX = winX + displayTileSize / 2;
    const baseline = winY + displayTileSize * 2; // じゅもんは2行目
    ctx.font = '16px cinecaption';
    const left = textX + ctx.measureText(PASS_LINE_PREFIX + pass.substring(0, hiraganaCursorIndex)).width;
    const w = ctx.measureText(pass[hiraganaCursorIndex] || '　').width;
    ctx.fillStyle = 'yellow';
    ctx.fillRect(left, baseline + 3, w, 3);
}

function drawPasscode() {
    drawWindowCommon(textExplainSave);
    drawPassCursor();
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
