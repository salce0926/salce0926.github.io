// =====================================================================
// フィールドロジックと全イベント
// =====================================================================
function isVisit(x, y) { return playerPosition.x === x && playerPosition.y === y; }

// 本家同様、やられると所持金が半分になる（あずかりじょに預けた分は無事）
function playerKilled(){
    const lost = player.gold - Math.floor(player.gold / 2);
    player.gold -= lost;
    // 本家同様、王様のもとに運ばれてHPもMPも全快する（眠り・封じも解ける）
    playerPosition.x = 51; playerPosition.y = 51;
    player.hp = player.maxHp; player.mp = player.maxMp;
    player.asleep = 0; player.sealed = false;
    // オート中は城送りになっても、狩っていた場所へ戻して続行する（開発用）
    if (typeof autoPilot !== 'undefined' && autoPilot.on) {
        autoPilot.deaths++;
        if (autoPilot.spot) {
            playerPosition.x = autoPilot.spot.x; playerPosition.y = autoPilot.spot.y;
            autoPilot.home = { ...autoPilot.spot };
        }
    }
    return lost;
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
                await showMessage(['王様「したくきんを もたせてある', '　　　まずは しろの みぎうえの まちで', '　　　ぶきと よろいを ととのえるのじゃ」']);
            }
            if(!getGameFlag('sunStone')){
                if(getGameFlag('magicKey')){
                    setGameFlag('sunStone'); addItemToPlayer('たいようのいし');
                    await showMessage(['城の裏で鍵を使い太陽の石を手に入れた！']);
                } else await showMessage(['王様「こんな時にローラ姫はどこへ...」']);
            } else {
                if(playerStyle === playerStyleNormal){
                    await showMessage(['王様「もし敵にやられてしまったら', '　　　ここまで運び込まれるのじゃ」']);
                    await showMessage(['王様「まちの みせで そうびを ととのえ', '　　　やくそうを きらさぬ ことじゃ」']);
                } else {
                    await showMessage(['王様「ローラ姫を助けるくだりが', '　　　正直ほとんど無かったじゃろう」']);
                    await showMessage(['王様「そのぶん りゅうおうは てごわいぞ', '　　　ドムドーラの ロトのよろいを', '　　　さがすのじゃ」']);
                }
            }
            await offerRecord();
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
            await showMessage(['ここはドムドーラの町だった', '今は はいきょと なってしまっている...']);
            await showMessage(['よろいを まもるように', 'あくまのきし が たちはだかった！']);
            const result = await startBattle(enemyTable.find(e => e.name === 'あくまのきし'));
            if (result === 'win') {
                setGameFlag('rotoArmor');
                player.armorIndex = armors.findIndex(a => a.name === 'ロトのよろい');
                recalcPlayerPower();
                await showMessage(['ロトのよろいを 手に入れた！', `しゅび力が ${player.defense}に なった！`]);
            } else if (result === 'flee') {
                await showMessage(['にげだしたが よろいは', 'あくまのきしが まもったままだ...']);
            }
            // 敗北時は playerKilled で城に運ばれている
        }else{
            await showMessage(['ここはドムドーラの町だった', '今は はいきょと なってしまっている...']);
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
        if (getGameFlag('lightBall')) {
            await showMessage(['りゅうおうの しろは しずかだ', 'ひかりのたまは たしかに この手にある']);
        } else {
            // 本家ではロトのつるぎは竜王の城B2の宝箱。ダンジョンを作るまでの仮置きとして
            // 城に着いた時点で拾えることにしておく（装備indexで持っているか判定する）
            const rotoSword = weapons.findIndex(w => w.name === 'ロトのつるぎ');
            if (player.weaponIndex < rotoSword) {
                player.weaponIndex = rotoSword;
                recalcPlayerPower();
                await showMessage(['しろの ちかに たからばこが あった！', 'ロトのつるぎを 手に入れた！',
                                   `こうげき力が ${player.attack}に なった！`]);
            }
            await showMessage(['りゅうおう「よくきたな ゆうしゃよ', '　　　　　　わが しろで ほろびるがよい！」']);
            const result = await startBattle(dragonLordHuman);
            if (result === 'win') {
                setGameFlag('lightBall');
                await showMessage(['りゅうおうを たおした！', 'ひかりのたまを 手に入れた！']);
                await showMessage(['せかいに ひかりが もどった！', 'ラダトームの しろへ もどろう']);
            } else if (result === 'flee') {
                await showMessage(['いのちあっての ものだね...', 'そうびを ととのえて でなおそう']);
            }
            // 敗北時は playerKilled で城に運ばれている
        }
    } else if (isVisit(56, 49)) {
        await showMessage(['ここは ラダトームの町だ', 'みせと やどやが ならんでいる']);
        await offerTown('ラダトームの町', townShops.radatome);
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
// 冒険の記録（本家同様、王様がふっかつのじゅもんを教えてくれる）
// =====================================================================
async function offerRecord() {
    if (!await askYesNo(['王様「そなたの ぼうけんを', '　　　きろくして おくかね？」'])) return;
    calcFlagsToCode();
    await showMessage(['王様「では ふっかつのじゅもんを おしえよう', '　　　よく メモを とるのじゃぞ」']);
    await showMessage(['ふっかつのじゅもん', `　${pass}`, 'つぎは タイトルがめんで にゅうりょく']);
}

// =====================================================================
// 町の施設（やどや・どうぐや・ぶきや）
// 品揃えはFC版DQ1の各町の店に合わせている
// =====================================================================
const townShops = {
    // 品揃え・宿代は本家FC版の店データどおり。たいまつだけはダンジョン未実装のため置いていない
    radatome:   { inn: 6,   tools: ['herb', 'scale'],          weapons: [1, 2, 3],          armors: [1, 2],       shieldList: [1],    bank: true },
    garai:      { inn: 25,  tools: ['herb', 'scale'],          weapons: [2, 3, 4],          armors: [2, 3, 4],    shieldList: [2] },
    maira:      { inn: 20,  tools: ['herb', 'scale', 'wing'],  weapons: [3, 4],             armors: [4, 5],       shieldList: [1] },
    rimuldar:   { inn: 55,  tools: ['herb', 'wing'],           weapons: [3, 4, 5],          armors: [4, 5, 6] },
    melkido:    { inn: 100, tools: ['herb', 'water', 'scale', 'wing'],
                  weapons: [1, 2, 3, 4, 5, 6], armors: [2, 3, 5, 6], shieldList: [2, 3], bank: true }
};

// あずかりじょ。1000G単位で預けられ、預けた分はやられても減らない（本家準拠）
async function useBank() {
    while (true) {
        const menu = ['あずける', 'ひきだす', 'やめる'];
        const i = await chooseFromList(['あずかりじょ「ごようけんを どうぞ」',
                                        `　もちきん ${player.gold}G　あずかりきん ${player.bank}G`], menu);
        if (i === 2) return;

        const deposit = i === 0;
        const limit = deposit ? Math.min(player.gold, BANK_MAX - player.bank) : player.bank;
        const units = Math.floor(limit / BANK_UNIT);
        if (units === 0) {
            await showMessage(deposit
                ? ['あずかりじょ「1000ゴールドから', '　　　　　　　　おあずかりします」']
                : ['あずかりじょ「おあずかりが ございません」']);
            continue;
        }
        const amounts = [1000, 5000, 10000].filter(a => a <= units * BANK_UNIT);
        if (!amounts.includes(units * BANK_UNIT)) amounts.push(units * BANK_UNIT);
        const opts = amounts.map(a => `${a}G`);
        opts.push('やめる');
        const pick = await chooseFromList([`いくら ${deposit ? 'あずけますか' : 'ひきだしますか'}？`,
                                           `　もちきん ${player.gold}G　あずかりきん ${player.bank}G`], opts);
        if (pick === opts.length - 1) continue;

        const amount = amounts[pick];
        if (deposit) { player.gold -= amount; player.bank += amount; }
        else { player.bank -= amount; player.gold += amount; }
        await showMessage([`あずかりじょ「たしかに ${deposit ? 'おあずかり' : 'おわたし'}しました」`,
                           `　もちきん ${player.gold}G　あずかりきん ${player.bank}G`]);
    }
}

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

// 所持数の増減をまとめて扱う（りゅうのうろこは身に付ける装飾なので個数を持たない）
function toolCount(key) {
    if (key === 'herb') return player.herb;
    if (key === 'wing') return player.wing;
    if (key === 'water') return player.water;
    return player.scale ? 1 : 0;
}
function addTool(key) {
    if (key === 'herb') player.herb++;
    else if (key === 'wing') player.wing++;
    else if (key === 'water') player.water++;
    else { player.scale = true; recalcPlayerPower(); }
}

async function shopTools(stock) {
    while (true) {
        const menu = stock.map(k => `${toolGoods[k].name} ${toolGoods[k].price}G`);
        menu.push('やめる');
        const i = await chooseFromList(['どうぐや「なにを おかいに なりますか？」',
                                        `　もちきん ${player.gold}G`], menu);
        if (i === menu.length - 1) return;

        const key = stock[i], goods = toolGoods[key];
        const max = key === 'herb' ? HERB_MAX : (key === 'scale' ? 1 : ITEM_MAX);
        if (toolCount(key) >= max) {
            await showMessage(key === 'scale'
                ? ['どうぐや「もう みに つけていますよ」']
                : [`どうぐや「${goods.name}は ${max}こまでしか`, '　　　　　もてませんよ」']);
        } else if (player.gold < goods.price) {
            await showMessage(['どうぐや「おかねが たりませんね」']);
        } else {
            player.gold -= goods.price;
            addTool(key);
            await showMessage(key === 'scale'
                ? ['りゅうのうろこを みに つけた！', `しゅび力が ${player.defense}に なった！`, `のこり ${player.gold}G`]
                : [`${goods.name}を かいました！`, `のこり ${player.gold}G　${goods.name} ${toolCount(key)}こ`]);
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
        if (shop.tools) menu.push({ label: 'どうぐや', act: () => shopTools(shop.tools) });
        if (shop.weapons || shop.armors || shop.shieldList) menu.push({ label: 'ぶきや', act: () => shopWeapons(shop) });
        if (shop.bank) menu.push({ label: 'あずかりじょ', act: () => useBank() });
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
        const heal = 23 + Math.floor(Math.random() * 8);   // 本家は23〜30回復
        player.hp = Math.min(player.maxHp, player.hp + heal);
        await showMessage([`${player.name}は やくそうを つかった！`, `HPが ${heal} かいふくした！`]);
    } else if (itemName === 'キメラのつばさ') {
        player.wing--;
        playerPosition.x = 51; playerPosition.y = 51;
        await showMessage([`${player.name}は キメラのつばさを つかった！`, 'ラダトームの城に もどった！']);
    } else if (itemName === 'せいすい') {
        player.water--;
        repelSteps = 127;                                  // 本家は127歩
        await showMessage([`${player.name}は せいすいを まいた！`, 'よわい まものが よってこなくなった！']);
    } else if (itemName === 'りゅうのうろこ') {
        await showMessage(['りゅうのうろこを みに つけている', `しゅび力が 2 あがっている`]);
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
    if (player.wing > 0) opts.push('キメラのつばさ');
    if (player.water > 0) opts.push('せいすい');
    if (player.scale) opts.push('りゅうのうろこ');
    if (player.key > 0) opts.push('かぎ');
    return opts.concat(player.items.map(i => i.name), ['もどる']);
}

function updateMenu() {
    if (menuLevel === 1) {
        if (Input.consume('ArrowUp')) menuCursor = modAdd(menuCursor, -1, 4);
        if (Input.consume('ArrowDown')) menuCursor = modAdd(menuCursor, 1, 4);
        if (consumeCancel()) { menuLevel = 0; currentState = STATE.FIELD; return; }  // メニューを閉じる
        if (Input.consume(' ')) {
            menuLevel = 2; subCursor = 0;
        }
    } else if (menuLevel === 2) {
        if (consumeCancel()) { menuLevel = 1; return; }   // 一つ前の階層へ戻る
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
    let cmdText = commandList.map(c => `　${c}`);
    drawWindow(displayTileSize * screenWidth - displayTileSize * 4.5 - displayTileSize / 2, displayTileSize / 2, displayTileSize * 4.5, displayTileSize * 4.5, cmdText, menuCursor);

    if (menuLevel === 1) {
        const explains = [
            ['つよさ：', '　あなたの つよさは あなたがきめよう', '　でも きゃっかんてきには こうみえてます'],
            ['じゅもん：', '　あなたの つかえる じゅもんりすと', '　MPの ごりようは けいかくてきに'],
            ['どうぐ：', '　あなたの もっている どうぐたち', '　でもほぼ ふらぐの りすとです'],
            ['きろく：', '　ラダトームの おうさまに はなすと', '　ふっかつのじゅもんを おしえてくれる']
        ];
        drawWindowCommon(explains[menuCursor]);
    } else if (menuLevel === 2) {
        if (menuCursor === 0) {
            // 並びは本家の「つよさ」に合わせる（さいだいHP/MPを含む9項目）
            const stats = [
                `　　ちから：　　　${alignRight(player.strength, 3)}`, `　すばやさ：　　　${alignRight(player.agility, 3)}`,
                `さいだいHP：　　　${alignRight(player.maxHp, 3)}`,   `さいだいMP：　　　${alignRight(player.maxMp, 3)}`,
                `こうげき力：　　　${alignRight(player.attack, 3)}`,   `　しゅび力：　　　${alignRight(player.defense, 3)}`,
                `　ぶき：${alignRightWide(player.weapon, 7)}`, `よろい：${alignRightWide(player.armor, 7)}`, `　たて：${alignRightWide(player.shield, 7)}`
            ];
            drawWindow(displayTileSize * screenWidth - displayTileSize * 8.5 - displayTileSize / 2, displayTileSize / 2, displayTileSize * 8.5, displayTileSize * 9.5, stats);
            // 覚えたじゅもん。窓は3行までなので4つずつ折り返す（Lv20の全10個がちょうど収まる）
            const lines = player.spells.length
                ? Array.from({ length: Math.ceil(player.spells.length / 4) },
                             (_, i) => '　' + player.spells.slice(i * 4, i * 4 + 4).join('　'))
                : ['じゅもんは まだ おぼえていない'];
            drawWindowCommon(lines);
        } else if (menuCursor === 1 || menuCursor === 2) {
            const options = menuOptions();
            // 個数は元の見た目どおり桁を揃えて右に置く
            const label = (name) => {
                const padded = name + '　'.repeat(Math.max(0, 7 - name.length));
                if (name === 'やくそう') return padded + player.herb;
                if (name === 'キメラのつばさ') return padded + player.wing;
                if (name === 'せいすい') return padded + player.water;
                if (name === 'かぎ') return padded + player.key;
                return name;
            };
            const text = options.map(s => `　${label(s)}`);
            drawWindow(displayTileSize * screenWidth - displayTileSize * 7 - displayTileSize / 2, displayTileSize,
                       displayTileSize * 7, displayTileSize * (options.length + 1), text, subCursor);
        } else if (menuCursor === 3) {
            drawWindowCommon(['ぼうけんの きろくは', 'ラダトームの おうさまに たのもう', '（しろの まんなかで しらべる）']);
        }
    }
}

// =====================================================================
// フィールド移動とデバッグ操作
// =====================================================================
// 移動は時間基準(ms)。フレームレート(60Hz/120Hz)に依存しない
let MOVE_INTERVAL = 150;          // 1歩あたりのミリ秒
const MOVE_INTERVAL_NORMAL = 150;
const MOVE_INTERVAL_AUTO = 40;    // オート中は早送りする（開発用なので待たせない）
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

// じゅもん入力画面を開く（タイトルから呼ぶ。空欄から入力する）
let passcodeFromTitle = false;
function openPasscode(fromTitle) {
    passcodeFromTitle = !!fromTitle;
    if (fromTitle) pass = passHiraganaList[0].repeat(PASS_LENGTH);
    else calcFlagsToCode();
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
        'スペース＝けってい　B＝もどる'
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
        playerPosition.x = 51; playerPosition.y = 51;   // 本家同様ラダトーム城から再開
        await showMessage([`${player.name}よ よくぞもどった！`,
            `レベル${player.level}　G ${player.gold}　やくそう ${player.herb}`,
            `${player.weapon} / ${player.armor} / ${player.shield}`]);
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

    // Bは一つ前の文字へ戻る。先頭でもう一度押すとタイトルに戻る
    if (consumeCancel()) {
        if (hiraganaCursorIndex > 0) {
            hiraganaCursorIndex--; syncWheelToCursor(); refreshPassText();
        } else if (passcodeFromTitle) {
            currentState = STATE.TITLE;
        }
        return;
    }

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
    const ch = pass[hiraganaCursorIndex] || '　';
    const w = ctx.measureText(ch).width;
    // 左のホイールと同じ「黄色地に黒文字」で選択中の文字を示す
    ctx.fillStyle = 'yellow';
    ctx.fillRect(left, baseline - displayTileSize + 6, w, displayTileSize);
    ctx.fillStyle = 'black';
    ctx.fillText(ch, left, baseline);
    ctx.fillStyle = 'white';
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

// =====================================================================
// 開発用オートパイロット
// 「勝手に操作される」形で自動的にレベルを上げる。実際に歩いてエンカウントし、
// 戦って、危なくなったら回復し、近くの宿屋に泊まる。指で押せるようパネルに
// AUTOボタンを置いてある（キーボードは a）
// =====================================================================
const INN_SPOTS = [   // 宿のある町。自動休憩はここへ運んで stayInn を呼ぶ
    { name: 'ラダトームの町', x: 56, y: 49, shop: 'radatome' },
    { name: 'ガライの町',     x: 10, y: 10, shop: 'garai' },
    { name: 'マイラの村',     x: 112, y: 18, shop: 'maira' },
    { name: 'リムルダールの町', x: 110, y: 80, shop: 'rimuldar' },
    { name: 'メルキドの町',   x: 81, y: 108, shop: 'melkido' }
];

const autoPilot = {
    on: false, targetLevel: 0, battles: 0, rests: 0, deaths: 0,
    goldGoal: 0, goldGoalName: '',   // 「装備が買えるまで」モードの目標額
    battlesAtRest: -1,               // 前回泊まった時点の戦闘数（泊まり直しの歯止め）
    startedAt: 0,
    spot: null,   // 開始した場所。宿や全滅のあとはここへ戻して同じゾーンで狩り続ける
    home: null, dir: null, dirUntil: 0, lastPos: null, stuck: 0
};

function autoStop(reason) {
    if (!autoPilot.on) return;
    autoPilot.on = false;
    autoPilot.dir = null;
    MOVE_INTERVAL = MOVE_INTERVAL_NORMAL;
    for (const k of ARROW_KEYS) Input.release(k);
    const pad = document.getElementById('btnAuto');
    if (pad) pad.classList.remove('on');
    document.getElementById('message').textContent =
        `オート終了(${reason})　Lv${player.level}　${player.gold}G　${autoPilot.battles}戦　やどや${autoPilot.rests}回　ぜんめつ${autoPilot.deaths}回`;
}

// いま立っているゾーンを安全に狩れるようになる推奨レベル。
// 目分量ではなく、実際の戦闘式でその場の敵と何度も戦わせて死亡率から決める
function simulateBattle(st, e0) {
    const magic = d => (armors[player.armorIndex].name === 'まほうのよろい'
                     || armors[player.armorIndex].name === 'ロトのよろい') ? Math.floor(d * 2 / 3) : d;
    const e = { ...e0 };
    e.maxHp = e.noCritical ? e.maxHp : Math.max(1, Math.floor(e.maxHp * (0.75 + Math.random() * 0.25)));
    e.hp = e.maxHp;
    let hp = st.hp, mp = st.mp, asleep = 0, sealed = false, turns = 0;
    const foeTurn = () => {
        const pat = e.pattern || ['attack'];
        let act = pat[Math.floor(Math.random() * pat.length)];
        if (['gira','begirama','hoimi','rarihoo','mahotone'].includes(act) && sealed) act = 'attack';
        if (act === 'rarihoo' && asleep > 0) act = 'attack';
        if (act === 'hoimi' && e.hp > e.maxHp * 0.6) act = 'attack';
        if (act === 'gira') hp -= magic(randRange(3, 10));
        else if (act === 'begirama') hp -= magic(randRange(30, 45));
        else if (act === 'fire') hp -= magic(randRange(16, 23));
        else if (act === 'firestrong') hp -= magic(randRange(65, 72));
        else if (act === 'hoimi') e.hp = Math.min(e.maxHp, e.hp + randRange(20, 30));
        else if (act === 'rarihoo') asleep = randRange(2, 4);
        else if (act === 'mahotone') sealed = true;
        else hp -= calcEnemyDamage(e.attack, st.def);
    };
    if (st.agi * Math.floor(Math.random() * 256) < e.defense * Math.floor(Math.random() * 64)) foeTurn();
    while (turns++ < 120) {
        if (hp <= 0) return 'lose';
        if (asleep > 0) asleep--;
        else {
            const beho = !sealed && st.spells.includes('ベホイミ') && mp >= 10 && hp < st.hp * 0.45;
            const hoi  = !sealed && !beho && st.spells.includes('ホイミ') && mp >= 4 && hp < st.hp * 0.35;
            if (beho) { mp -= 10; hp = Math.min(st.hp, hp + randRange(85, 100)); }
            else if (hoi) { mp -= 4; hp = Math.min(st.hp, hp + randRange(10, 17)); }
            else if (Math.floor(Math.random() * 64) >= (e.evasion || 0)) {
                const c = !e.noCritical && Math.floor(Math.random() * 32) === 0;
                e.hp -= c ? calcCritical(st.atk) : calcDamage(st.atk, e.defense);
            }
        }
        if (e.hp <= 0) return 'win';
        foeTurn();
    }
    return 'draw';
}

function recommendedLevel(x, y) {
    const set = zoneEnemySets[zoneAt(x, y)].map(i => enemyTable[i]);
    for (let lv = Math.max(1, player.level); lv <= 30; lv++) {
        const s = playerStatus.find(p => p.level === lv);
        if (!s) break;
        const st = {
            atk: s.strength + weapons[player.weaponIndex].power,
            def: Math.floor(s.agility / 2) + armors[player.armorIndex].power
               + shields[player.shieldIndex].power + (player.scale ? 2 : 0),
            hp: s.hp, mp: s.mp, agi: s.agility,
            spells: playerStatus.filter(p => p.level <= lv && p.spell !== '-').map(p => p.spell)
        };
        let dead = 0;
        const N = 150;
        for (let i = 0; i < N; i++) {
            if (simulateBattle(st, set[Math.floor(Math.random() * set.length)]) === 'lose') dead++;
        }
        if (dead / N <= 0.05) return lv;   // 1戦あたり5%以下で死ぬなら十分
    }
    return 30;
}

// 次に買える装備（行ける町に並んでいて、いま持っているものより強い最安のもの）
function nextGearGoal() {
    const towns = ['radatome', 'garai', 'maira', 'rimuldar', 'melkido'];
    let best = null;
    const check = (kind, list, idx) => {
        for (const t of towns) for (const i of (townShops[t][kind] || [])) {
            if (i > idx && list[i].price > 0 && (!best || list[i].price < best.price)) {
                best = { name: list[i].name, price: list[i].price };
            }
        }
    };
    check('weapons', weapons, player.weaponIndex);
    check('armors', armors, player.armorIndex);
    check('shieldList', shields, player.shieldIndex);
    return best;
}

async function autoStart() {
    if (autoPilot.on) { autoStop('じぶんで とめた'); return; }
    if (currentState !== STATE.FIELD) return;
    const rec = recommendedLevel(playerPosition.x, playerPosition.y);
    const gear = nextGearGoal();
    const opts = [
        rec > player.level ? `ここの てきに あわせる（Lv${rec}）` : 'ここの てきには もう まけない',
        gear ? `${gear.name}が かえるまで（${gear.price}G）` : 'つぎの そうびは もう ない',
        'つぎの レベルまで',
        '5レベル あげる',
        'やめる'
    ];
    const i = await chooseFromList(['オート（かいはつよう）',
        `　いまLv${player.level}　${player.hp}/${player.maxHp}　もちきん${player.gold}G　ゾーンz${zoneAt(playerPosition.x, playerPosition.y)}`], opts);
    if (i === 4 || i === undefined) { currentState = STATE.FIELD; return; }

    autoPilot.goldGoal = 0;
    if (i === 0)      autoPilot.targetLevel = Math.min(30, Math.max(player.level + 1, rec));
    else if (i === 1) {
        if (!gear) { currentState = STATE.FIELD; return; }
        autoPilot.goldGoal = gear.price;
        autoPilot.goldGoalName = gear.name;
        autoPilot.targetLevel = 30;          // 金が貯まったら止まる
    }
    else if (i === 2) autoPilot.targetLevel = player.level + 1;
    else              autoPilot.targetLevel = Math.min(30, player.level + 5);
    if (i === 2) autoPilot.targetLevel = Math.min(30, autoPilot.targetLevel);
    if (!autoPilot.goldGoal && autoPilot.targetLevel <= player.level) { currentState = STATE.FIELD; return; }
    Object.assign(autoPilot, { on: true, battles: 0, rests: 0, deaths: 0,
                               battlesAtRest: -1, startedAt: performance.now(),
                               spot: { ...playerPosition }, home: { ...playerPosition },
                               dir: null, dirUntil: 0,
                               lastPos: { ...playerPosition }, stuck: 0 });
    debugMode = false;            // デバッグモード中はエンカウントしないので必ず切る
    MOVE_INTERVAL = MOVE_INTERVAL_AUTO;
    currentState = STATE.FIELD;
    document.getElementById('message').textContent = autoPilot.goldGoal
        ? `オート開始　${autoPilot.goldGoalName}(${autoPilot.goldGoal}G)が かえるまで`
        : `オート開始　Lv${player.level} → Lv${autoPilot.targetLevel}`;
}

// 危なくなったら一番近い宿へ運んで泊まる（開発用なので移動は瞬間移動）
async function autoRest() {
    const near = INN_SPOTS.reduce((best, s) => {
        const d = Math.abs(s.x - playerPosition.x) + Math.abs(s.y - playerPosition.y);
        return (!best || d < best.d) ? { ...s, d } : best;
    }, null);
    const price = townShops[near.shop].inn || 0;
    playerPosition.x = near.x; playerPosition.y = near.y;
    autoPilot.rests++;
    autoPilot.battlesAtRest = autoPilot.battles;
    if (player.gold >= price) {
        await stayInn(price);
    } else {                       // 金欠でも開発用なので止めずに休ませる
        player.hp = player.maxHp; player.mp = player.maxMp;
        await showMessage([`オート：${near.name}で やすんだ`, '（もちきんが たりないので ただ）']);
    }
    // 泊まったら狩り場へ戻す（歩いて往復させると開発用には遅すぎる）
    if (autoPilot.spot) { playerPosition.x = autoPilot.spot.x; playerPosition.y = autoPilot.spot.y; }
    autoPilot.home = { ...playerPosition };
    currentState = STATE.FIELD;
}

// 戦闘中の判断。回復・逃走・攻撃を選ぶ
function autoBattleChoice() {
    const low = player.hp <= player.maxHp * 0.45;
    const canBeho = player.spells.includes('ベホイミ') && player.mp >= 10 && !player.sealed;
    const canHoi  = player.spells.includes('ホイミ')   && player.mp >= 4  && !player.sealed;
    if (low && (canBeho || canHoi)) return { cmd: 1, spell: canBeho ? 'ベホイミ' : 'ホイミ' };
    if (low && player.herb > 0) return { cmd: 2 };
    // 手も足も出ない相手（しゅび力が高すぎる）からは逃げる
    if (player.attack - Math.floor(enemy.defense / 2) < 2) return { cmd: 3 };
    // 回復手段が尽きて削られたら粘らずに逃げる（全滅すると所持金が半分になる）
    if (player.hp <= player.maxHp * 0.3) return { cmd: 3 };
    return { cmd: 0 };
}

let autoBusy = false;
function autoTick(now) {
    if (!autoPilot.on) return;
    // autoBusy中（宿の処理待ち）でもメッセージ送りは続ける。ここで止めると
    // 「やすんだ」の表示から進めなくなって固まる

    // 押しっぱなしだと2回目の justPressed が立たないので、毎フレーム離してから押す。
    // 方向キーだけは歩き続けるために押したままにする（下のフィールド処理で管理）
    Input.release(' ');
    Input.release('Escape');
    if (currentState !== STATE.FIELD) {
        for (const k of ARROW_KEYS) Input.release(k);
        autoPilot.dir = null;
    }

    if (currentState === STATE.FIELD) {
        if (autoPilot.goldGoal && player.gold >= autoPilot.goldGoal) {
            autoStop(`${autoPilot.goldGoalName}が かえる`);
            return;
        }
        if (player.level >= autoPilot.targetLevel) { autoStop('もくひょうに とうたつ'); return; }
    }

    if (currentState === STATE.MESSAGE) { Input.press(' '); return; }
    if (currentState === STATE.YESNO)   { Input.press('Escape'); return; }
    if (currentState === STATE.CHOICE) {  // 町のメニューに入ってしまったら出る
        const idx = choiceOptions.findIndex(o => o === 'でる' || o === 'やめる');
        if (idx >= 0 && choiceCursor !== idx) { Input.press('ArrowDown'); return; }
        Input.press(' ');
        return;
    }

    if (currentState === STATE.BATTLE) {
        const pick = autoBattleChoice();
        if (battleStateMode === 'COMMAND') {
            battleCursor = pick.cmd;
            Input.press(' ');
        } else if (battleStateMode === 'SPELL') {
            const list = player.spells.filter(s => COMBAT_SPELLS.includes(s));
            const at = list.indexOf(pick.spell);
            spellCursor = at >= 0 ? at : list.length;   // 見つからなければ「もどる」
            Input.press(' ');
        }
        return;
    }

    if (currentState !== STATE.FIELD || autoBusy) return;

    // 戦闘が終わった直後に数える
    if (autoPilot.wasBattle) { autoPilot.wasBattle = false; autoPilot.battles++; }

    // 戦いに出る前にフィールドで回復しておく。傷ついたまま次の戦闘に入ると
    // ラリホーで眠らされている間に削り殺される
    const healSpell = player.spells.includes('ベホイミ') ? 'ベホイミ'
                    : player.spells.includes('ホイミ')   ? 'ホイミ' : null;
    const healCost = healSpell === 'ベホイミ' ? 10 : 4;
    if (healSpell && player.hp < player.maxHp * 0.8 && player.mp >= healCost * 3) {
        autoBusy = true;
        Promise.resolve(castFieldSpell(healSpell)).then(() => { autoBusy = false; });
        return;
    }

    // HPが半分を切ったら休む。回復呪文を1回も唱えられないほどMPが尽きたときも休む。
    // ここを「MP < 必要量×3」にしていたら、Lv3(最大MP5)は宿から出た瞬間にまた条件が
    // 成立して延々と泊まり続けた。最大MPで満たせない条件を書いてはいけない
    const mpDry = healSpell && player.maxMp >= healCost && player.mp < healCost;
    const wantRest = player.hp <= player.maxHp * 0.5 || (mpDry && player.hp < player.maxHp * 0.8);
    // 念のための歯止め: 前回の休憩から一度も戦っていなければ泊まり直さない
    if (wantRest && autoPilot.battles !== autoPilot.battlesAtRest) {
        autoBusy = true;
        autoRest().then(() => { autoBusy = false; });
        return;
    }

    // 歩く。同じ向きをしばらく保ち、行き止まりや遠出はホームへ引き返す
    if (playerPosition.x === autoPilot.lastPos.x && playerPosition.y === autoPilot.lastPos.y) autoPilot.stuck++;
    else { autoPilot.stuck = 0; autoPilot.lastPos = { ...playerPosition }; }

    // 進めない向きを押し続けると、その間ずっと足踏みしてエンカウントしない。
    // 「実際に進めるマス」だけを候補にする
    const DIR_DELTA = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] };
    const walkable = k => {
        const [dx, dy] = DIR_DELTA[k];
        return isMoveAllowed(modAdd(playerPosition.x, dx, mapWidth),
                             modAdd(playerPosition.y, dy, mapHeight));
    };
    const open = ARROW_KEYS.filter(walkable);
    if (!open.length) return;      // 完全に囲まれている（起きないはずだが保険）

    // 行き先のエンカウント率。森・丘(1/16)は草原・砂漠・橋(1/24)より1.5倍出る。
    // 城・町・洞窟・ほこら・毒沼は0なので、そこを踏む歩数はまるごと無駄になる
    const rateOf = k => {
        const [dx, dy] = DIR_DELTA[k];
        const tile = mapData[modAdd(playerPosition.y, dy, mapHeight)][modAdd(playerPosition.x, dx, mapWidth)];
        return encounterRates[tile] || 0;
    };
    const bestRate = Math.max(...open.map(rateOf));
    // 出やすい地形だけに絞る。まわりが全部0なら仕方ないので全候補から選んで抜け出す
    const good = bestRate > 0 ? open.filter(k => rateOf(k) === bestRate) : open;

    const far = Math.abs(playerPosition.x - autoPilot.home.x)
              + Math.abs(playerPosition.y - autoPilot.home.y) > 12;
    // 今の向きがより出やすい地形を素通りしているなら選び直す
    const dirStale = !autoPilot.dir || now > autoPilot.dirUntil
                  || !walkable(autoPilot.dir) || rateOf(autoPilot.dir) < bestRate;
    if (dirStale) {
        const prev = autoPilot.dir;
        if (prev) Input.release(prev);
        const REVERSE = { ArrowUp: 'ArrowDown', ArrowDown: 'ArrowUp',
                          ArrowLeft: 'ArrowRight', ArrowRight: 'ArrowLeft' };
        let choices = good;
        if (far) {   // 遠ざかりすぎたらホーム側へ寄せる（地形より優先）
            const dx = autoPilot.home.x - playerPosition.x, dy = autoPilot.home.y - playerPosition.y;
            const toward = [ dx > 0 ? 'ArrowRight' : 'ArrowLeft', dy > 0 ? 'ArrowDown' : 'ArrowUp' ]
                           .filter(k => open.includes(k));
            if (toward.length) choices = toward;
        } else if (choices.length > 1) {
            // 来た道をすぐ引き返すと同じ数マスを往復するだけになる
            const forward = choices.filter(k => k !== REVERSE[prev]);
            if (forward.length) choices = forward;
        }
        autoPilot.dir = choices[Math.floor(Math.random() * choices.length)];
        autoPilot.dirUntil = now + 700 + Math.random() * 900;   // 一直線に歩く時間を長めに
    }
    Input.press(autoPilot.dir);
}
