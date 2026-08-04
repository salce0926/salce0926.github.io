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
        autoPilot.recentDeaths = (autoPilot.recentDeaths || 0) + 1;
        autoPilot.path = null; autoPilot.goal = null;   // 城へ運ばれたので経路は捨てる
        // 本編モードは目的地を見失わないよう、次のフレームで引き直させる
        if (!autoPilot.questMode && autoPilot.spot) {
            // 城から狩り場までは歩いて戻る
            autoPilot.path = findPath(playerPosition, autoPilot.spot);
            autoPilot.goal = autoPilot.path ? 'かりばへ もどる' : null;
            autoPilot.home = { ...playerPosition };
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
const MOVE_INTERVAL_AUTO = 0;     // オート中は毎フレーム1歩（開発用なので待たせない）
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

// 幅優先探索で歩ける道をたどる。マップは端がつながっているので modAdd で回り込む。
// 本土と南の陸地(リムルダール側)は洞窟のワープでしかつながっていないので、
// そこだけは「歩く」ではなく「その場でAを押す」移動として経路に組み込む
const DIR_DELTA = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] };
const WARPS = [ [{ x: 112, y: 52 }, { x: 112, y: 57 }], [{ x: 112, y: 57 }, { x: 112, y: 52 }] ];
function warpFrom(x, y) {
    const w = WARPS.find(w => w[0].x === x && w[0].y === y);
    return w ? w[1] : null;
}
function findPath(from, to) {
    if (from.x === to.x && from.y === to.y) return [];
    const key = (x, y) => y * mapWidth + x;
    const prev = new Map();
    const queue = [[from.x, from.y]];
    prev.set(key(from.x, from.y), null);
    let head = 0;
    while (head < queue.length) {
        const [x, y] = queue[head++];
        const nexts = ARROW_KEYS
            .map(k => { const [dx, dy] = DIR_DELTA[k];
                        return [modAdd(x, dx, mapWidth), modAdd(y, dy, mapHeight)]; })
            .filter(([nx, ny]) => isMoveAllowed(nx, ny));
        const w = warpFrom(x, y);
        if (w) nexts.push([w.x, w.y]);
        for (const [nx, ny] of nexts) {
            const id = key(nx, ny);
            if (prev.has(id)) continue;
            prev.set(id, [x, y]);
            if (nx === to.x && ny === to.y) {
                const path = [];
                let cur = [nx, ny];
                while (cur) { path.push({ x: cur[0], y: cur[1] }); cur = prev.get(key(cur[0], cur[1])); }
                return path.reverse().slice(1);
            }
            queue.push([nx, ny]);
        }
    }
    return null;   // たどり着けない（起きないはずだが保険）
}

// 隣のマスへ向かうキー。回り込みを考慮して差が1になる向きを探す
function stepKeyToward(from, to) {
    for (const k of ARROW_KEYS) {
        const [dx, dy] = DIR_DELTA[k];
        if (modAdd(from.x, dx, mapWidth) === to.x && modAdd(from.y, dy, mapHeight) === to.y) return k;
    }
    return null;
}

const autoPilot = {
    on: false, targetLevel: 0, battles: 0, rests: 0, deaths: 0,
    goldGoal: 0, goldGoalName: '', goldGoalTown: null,   // 「装備が買えるまで」モードの目標
    lastLine: '',                        // 画面下に出している状況行
    questMode: false, questName: '', questFails: 0, grindUntil: 0,   // 本編を自動で進めるモード
    shoppedGold: 0, shopKey: null,       // 同じ店で買い直しを繰り返さないための記録
    battlesAtRest: -1,               // 前回泊まった時点の戦闘数（泊まり直しの歯止め）
    path: null, goal: null, inn: null,   // 目的地への経路（宿へ／狩り場へ）
    recentBattles: 0, recentDeaths: 0, recentExp: 0, relocated: 0,   // 割に合わない場所で粘らないための記録
    startedAt: 0,
    spot: null,   // 開始した場所。宿や全滅のあとはここへ戻して同じゾーンで狩り続ける
    home: null, dir: null, dirUntil: 0, lastPos: null, stuck: 0
};

function autoStop(reason) {
    if (!autoPilot.on) return;
    autoPilot.on = false;
    autoPilot.dir = null;
    autoBusy = false;          // 途中で止めると立ちっぱなしになり、再開しても動けなくなる
    MOVE_INTERVAL = MOVE_INTERVAL_NORMAL;
    for (const k of ARROW_KEYS) Input.release(k);
    const pad = document.getElementById('btnAuto');
    if (pad) pad.classList.remove('on');
    document.getElementById('message').textContent =
        `オート終了(${reason})　Lv${player.level}　${player.gold}G　${autoPilot.battles}戦　やどや${autoPilot.rests}回　ぜんめつ${autoPilot.deaths}回`;
}

// いま立っているゾーンを安全に狩れるようになる推奨レベル。
// 目分量ではなく、実際の戦闘式でその場の敵と何度も戦わせて死亡率から決める
function simulateBattle(st, e0, startHp, startMp) {
    const magic = d => (armors[player.armorIndex].name === 'まほうのよろい'
                     || armors[player.armorIndex].name === 'ロトのよろい') ? Math.floor(d * 2 / 3) : d;
    const e = { ...e0 };
    e.maxHp = e.noCritical ? e.maxHp : Math.max(1, Math.floor(e.maxHp * (0.75 + Math.random() * 0.25)));
    e.hp = e.maxHp;
    let hp = startHp === undefined ? st.hp : startHp;
    let mp = startMp === undefined ? st.mp : startMp;
    let asleep = 0, sealed = false, turns = 0;
    const foeTurn = () => {
        // 本家の逃走規則。これが無いと実際より危険に見積もってしまう
        if (e.attack <= (st.str || 0) * 2 && Math.random() < 0.25) return 'fled';
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
    if (st.agi * Math.floor(Math.random() * 256) < e.defense * Math.floor(Math.random() * 64)) {
        if (foeTurn() === 'fled') return { r: 'fled', hp, mp };
    }
    while (turns++ < 120) {
        if (hp <= 0) return { r: 'lose', hp: 0, mp };
        if (asleep > 0) asleep--;
        else {
            const beho = !sealed && st.spells.includes('ベホイミ') && mp >= 10 && hp < st.hp * 0.45;
            const hoi  = !sealed && !beho && st.spells.includes('ホイミ') && mp >= 4 && hp < st.hp * 0.45;
            const phys = expectedHit(st.atk, e.defense);
            const giraHit = 1 - (e.resist && e.resist.gira || 0) / 16;
            const begi = !sealed && !beho && !hoi && st.spells.includes('ベギラマ') && mp >= 5
                      && BEGIRAMA_AVG * giraHit > phys * 1.3;
            const gira = !sealed && !beho && !hoi && !begi && st.spells.includes('ギラ') && mp >= 2
                      && GIRA_AVG * giraHit > phys * 1.3;
            if (beho) { mp -= 10; hp = Math.min(st.hp, hp + randRange(85, 100)); }
            else if (hoi) { mp -= 4; hp = Math.min(st.hp, hp + randRange(10, 17)); }
            else if (begi) { mp -= 5; if (Math.random() < giraHit) e.hp -= randRange(35, 49); }
            else if (gira) { mp -= 2; if (Math.random() < giraHit) e.hp -= randRange(10, 15); }
            else if (Math.floor(Math.random() * 64) >= (e.evasion || 0)) {
                const c = !e.noCritical && Math.floor(Math.random() * 32) === 0;
                e.hp -= c ? calcCritical(st.atk) : calcDamage(st.atk, e.defense);
            }
        }
        if (e.hp <= 0) return { r: 'win', hp, mp };
        if (foeTurn() === 'fled') return { r: 'fled', hp, mp };
    }
    return { r: 'draw', hp, mp };
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
            hp: s.hp, mp: s.mp, agi: s.agility, str: s.strength,
            spells: playerStatus.filter(p => p.level <= lv && p.spell !== '-').map(p => p.spell)
        };
        let dead = 0;
        const N = 150;
        for (let i = 0; i < N; i++) {
            if (simulateBattle(st, set[Math.floor(Math.random() * set.length)]).r === 'lose') dead++;
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
                const town = INN_SPOTS.find(s => s.shop === t)
                          || { name: 'メルキドの町', x: 81, y: 108, shop: t };
                best = { name: list[i].name, price: list[i].price, town };
            }
        }
    };
    check('weapons', weapons, player.weaponIndex);
    check('armors', armors, player.armorIndex);
    check('shieldList', shields, player.shieldIndex);
    return best;
}

// いま歩いて行ける範囲を一度の探索で出す（狩り場候補の絞り込み用）
function reachableSet() {
    const seen = new Set(), q = [[playerPosition.x, playerPosition.y]];
    const key = (x, y) => y * mapWidth + x;
    seen.add(key(playerPosition.x, playerPosition.y));
    let head = 0;
    while (head < q.length) {
        const [x, y] = q[head++];
        const nexts = ARROW_KEYS
            .map(k => { const [dx, dy] = DIR_DELTA[k];
                        return [modAdd(x, dx, mapWidth), modAdd(y, dy, mapHeight)]; })
            .filter(([nx, ny]) => isMoveAllowed(nx, ny));
        const w = warpFrom(x, y);
        if (w) nexts.push([w.x, w.y]);
        for (const [nx, ny] of nexts) {
            const id = key(nx, ny);
            if (seen.has(id)) continue;
            seen.add(id); q.push([nx, ny]);
        }
    }
    return seen;
}

// ゾーンごとの代表地点。森か丘(1/16)のマスで、宿に近いものを1つずつ選ぶ
function huntingSpots() {
    const best = {};
    for (let y = 0; y < mapHeight; y += 2) {
        for (let x = 0; x < mapWidth; x += 2) {
            if ((encounterRates[mapData[y][x]] || 0) < 1 / 16) continue;
            const z = zoneAt(x, y);
            const d = Math.min(...INN_SPOTS.map(s => Math.abs(s.x - x) + Math.abs(s.y - y)));
            if (!best[z] || d < best[z].d) best[z] = { x, y, d, zone: z };
        }
    }
    return Object.values(best);
}

// いまの強さで一番おいしい狩り場を選ぶ。
// 死亡率が高い所は経験値が多くても除く（全滅すると所持金半分＋やり直しで結局遅い）
function bestHuntingSpot(opt) {
    const avoidZone = opt && opt.avoidZone !== undefined ? opt.avoidZone : null;
    const maxDeath  = opt && opt.maxDeath  !== undefined ? opt.maxDeath  : 0.05;
    const reach = reachableSet();
    const key = (x, y) => y * mapWidth + x;
    const st = {
        atk: player.attack, def: player.defense, hp: player.maxHp, mp: player.maxMp,
        agi: player.agility, str: player.strength, spells: player.spells
    };
    let best = null;
    for (const spot of huntingSpots()) {
        if (!reach.has(key(spot.x, spot.y))) continue;
        if (avoidZone !== null && spot.zone === avoidZone) continue;
        // 宿から遠い／宿までの道が危ない狩り場は、休むたびに死ぬので選ばない。
        // 狩り場そのものが安全でも、往復で全滅していては意味がない
        const inn = INN_SPOTS.reduce((b, s) => {
            const d = Math.abs(s.x - spot.x) + Math.abs(s.y - spot.y);
            return (!b || d < b.d) ? { ...s, d } : b;
        }, null);
        const mid = { x: Math.round((inn.x + spot.x) / 2), y: Math.round((inn.y + spot.y) / 2) };
        const trip = [zoneAt(inn.x, inn.y), zoneAt(mid.x, mid.y)];
        if (dangerAtLevel(trip, player.level) > 0.05) continue;
        // そこへ辿り着くまでの道も見る。行き帰りで死んでいては意味がない
        const approach = findPath(playerPosition, spot);
        if (!approach || pathRisk(approach) > 0.2) continue;
        const set = zoneEnemySets[spot.zone].map(i => enemyTable[i]);
        let dead = 0, exp = 0;
        const N = 150;
        // 毎回満タンから始めると実際より死ににくく出る。傷を持ち越して、
        // 半分を切ったら宿に戻る——という実際の動きに合わせて数える
        let hp = st.hp, mp = st.mp;
        for (let i = 0; i < N; i++) {
            if (hp < st.hp * 0.5) { hp = st.hp; mp = st.mp; }
            const e = set[Math.floor(Math.random() * set.length)];
            const r = simulateBattle(st, e, hp, mp);
            if (r.r === 'lose') { dead++; hp = st.hp; mp = st.mp; }
            else { hp = r.hp; mp = r.mp; if (r.r === 'win') exp += e.exp; }
        }
        const death = dead / N;
        if (death > maxDeath) continue;
        // 1歩あたりの期待経験値。ゾーン0は遭遇率が半分
        let rate = encounterRates[mapData[spot.y][spot.x]] || 0;
        if (spot.zone === 0) rate /= 2;
        const score = (exp / N) * rate;
        if (!best || score > best.score) best = { ...spot, score, death, exp: exp / N };
    }
    return best;
}

// 本編の進行順。done が false の一番上が「次に向かうべき場所」になる
const QUEST_STEPS = [
    { name: '城で 王様に あう',        x: 51,  y: 51,  done: () => getGameFlag('start') },
    { name: 'リムルダールで まほうのかぎ', x: 110, y: 80,  done: () => getGameFlag('magicKey') },
    { name: 'ローラひめを たすける',   x: 112, y: 52,  done: () => getGameFlag('roraRescued') },
    { name: 'ひめを 城へ つれて かえる', x: 51, y: 51,  done: () => getGameFlag('roraLove') },
    { name: '城で たいようのいし',     x: 51,  y: 51,  done: () => getGameFlag('sunStone') },
    { name: 'マイラで ようせいのふえ', x: 112, y: 18,  done: () => getGameFlag('fairyFlute') },
    { name: 'ガライの はかで ぎんのたてごと', x: 10, y: 10, done: () => getGameFlag('silverHerp') },
    { name: 'あめのほこらで あまぐものつえ', x: 89, y: 9, done: () => getGameFlag('rainCloudStuff') },
    { name: 'メルキドの ゴーレム',     x: 81,  y: 108, done: () => getGameFlag('golemKilled') },
    { name: 'ロトのしるし',            x: 91,  y: 121, done: () => getGameFlag('rotoEmblem') },
    { name: 'ドムドーラで ロトのよろい', x: 33, y: 97,  done: () => getGameFlag('rotoArmor') },
    { name: 'にじのしずく',            x: 116, y: 117, done: () => getGameFlag('rainbowDrop') },
    { name: 'にじの はしを かける',    x: 73,  y: 57,  done: () => getGameFlag('rainbowBridge') },
    { name: 'りゅうおうを たおす',     x: 56,  y: 56,  done: () => getGameFlag('lightBall') }
];
function nextQuestStep() { return QUEST_STEPS.find(q => !q.done()) || null; }

// いまの装備で、そのレベルだったときの能力値
function statsAtLevel(lv) {
    const s = playerStatus.find(p => p.level === lv) || playerStatus[playerStatus.length - 1];
    return {
        atk: s.strength + weapons[player.weaponIndex].power,
        def: Math.floor(s.agility / 2) + armors[player.armorIndex].power
           + shields[player.shieldIndex].power + (player.scale ? 2 : 0),
        hp: s.hp, mp: s.mp, agi: s.agility, str: s.strength,
        spells: playerStatus.filter(p => p.level <= lv && p.spell !== '-').map(p => p.spell)
    };
}

// 経路が通るゾーンを拾う（5マスおきに見れば十分）
function pathZones(path) {
    const zones = new Set();
    for (let i = 0; i < path.length; i += 5) zones.add(zoneAt(path[i].x, path[i].y));
    if (path.length) zones.add(zoneAt(path[path.length - 1].x, path[path.length - 1].y));
    return [...zones];
}

// そのレベルで道中どれだけ死ぬか（通るゾーンのうち一番危険なもの）
function dangerAtLevel(zones, lv) {
    const st = statsAtLevel(lv);
    let worst = 0;
    for (const z of zones) {
        const set = zoneEnemySets[z].map(i => enemyTable[i]);
        let dead = 0; const N = 60;
        for (let i = 0; i < N; i++) {
            if (simulateBattle(st, set[Math.floor(Math.random() * set.length)]).r === 'lose') dead++;
        }
        worst = Math.max(worst, dead / N);
    }
    return worst;
}
// 道中で何回くらい戦うことになるか（遭遇率はおおむね1/16〜1/24なので20歩に1回）
function battlesOnPath(path) { return Math.max(1, Math.round(path.length / 20)); }

// 「1戦あたりの死亡率」で道中の安全を判断してはいけない。
// 200歩の道なら10回前後戦うので、1戦15%でも通り抜けられる確率は2割しかない。
// 道中ぜんぶを無事に抜けられる確率で見る
function pathRisk(path, lv) {
    if (!path || !path.length) return 0;
    const d = dangerAtLevel(pathZones(path), lv === undefined ? player.level : lv);
    return 1 - Math.pow(1 - d, battlesOnPath(path));
}
function pathDanger(path) { return pathRisk(path); }

// 道中を安全に通れるようになる最小レベル。+2ずつ刻むと何度も往復するので直接求める
function levelForPath(path) {
    if (!path || !path.length) return player.level;
    for (let lv = player.level; lv <= 30; lv++) {
        if (pathRisk(path, lv) <= 0.2) return lv;   // 8割方 無事に抜けられるレベル
    }
    return 30;
}

async function autoStart() {
    if (autoPilot.on) { autoStop('じぶんで とめた'); return; }
    if (currentState !== STATE.FIELD) return;
    const rec = recommendedLevel(playerPosition.x, playerPosition.y);
    const gear = nextGearGoal();
    const spot = bestHuntingSpot();
    const here = zoneAt(playerPosition.x, playerPosition.y);
    const quest = nextQuestStep();
    const opts = [
        quest ? 'ぼうけんを すすめる' : 'ぼうけんは おわっています',
        rec > player.level ? `ここの てきに あわせる（Lv${rec}）` : 'ここの てきには もう まけない',
        gear ? `${gear.name}が かえるまで` : 'つぎの そうびは もう ない',
        spot && spot.zone !== here ? `よい かりばへ いく（z${here}→z${spot.zone}）` : 'ここが いまは さいてきの かりば',
        'やめる'
    ];
    const i = await chooseFromList([
        `オート　Lv${player.level}　${player.gold}G　z${here}`,
        quest ? `つぎ：${quest.name}` : 'ぼうけんは おわっています',
        gear ? `つぎの そうび：${gear.name} ${gear.price}G` : ''], opts);
    if (i === 4 || i === undefined) { currentState = STATE.FIELD; return; }

    autoPilot.goldGoal = 0;
    autoPilot.questMode = false;
    let moveTo = null;
    if (i === 0) {
        if (!quest) { currentState = STATE.FIELD; return; }
        autoPilot.questMode = true;          // 本編を最後まで自動で進める
        autoPilot.noSpotYet = true;          // 狩り場はまだ決まっていない
        autoPilot.targetLevel = 30;
        autoPilot.questFails = 0;
        autoPilot.questName = '';
    }
    else if (i === 1) autoPilot.targetLevel = Math.min(30, Math.max(player.level + 1, rec));
    else if (i === 2) {
        if (!gear) { currentState = STATE.FIELD; return; }
        autoPilot.goldGoal = gear.price;
        autoPilot.goldGoalName = gear.name;
        autoPilot.goldGoalTown = gear.town;
        autoPilot.targetLevel = 30;          // 金が貯まったら止まる
    }
    else {
        if (!spot || spot.zone === here) { currentState = STATE.FIELD; return; }
        moveTo = spot;
        autoPilot.targetLevel = Math.min(30, player.level + 1);
    }
    if (!autoPilot.goldGoal && !autoPilot.questMode && autoPilot.targetLevel <= player.level) {
        currentState = STATE.FIELD; return;
    }
    Object.assign(autoPilot, { on: true, battles: 0, rests: 0, deaths: 0,
                               battlesAtRest: -1, startedAt: performance.now(),
                               path: null, goal: null, inn: null,
                               recentBattles: 0, recentDeaths: 0, recentExp: player.exp, relocated: 0,
                               questFails: 0, questName: '', grindUntil: 0, shoppedGold: 0, shopKey: null,
                               spot: { ...playerPosition }, home: { ...playerPosition },
                               dir: null, dirUntil: 0,
                               lastPos: { ...playerPosition }, stuck: 0 });
    if (autoPilot.noSpotYet) { autoPilot.spot = null; autoPilot.noSpotYet = false; }
    autoBusy = false;
    debugMode = false;            // デバッグモード中はエンカウントしないので必ず切る
    MOVE_INTERVAL = MOVE_INTERVAL_AUTO;
    currentState = STATE.FIELD;
    if (moveTo) {   // 選ばれた狩り場まで歩いて移動してから始める
        autoPilot.spot = { x: moveTo.x, y: moveTo.y };
        autoPilot.home = { x: moveTo.x, y: moveTo.y };
        autoPilot.path = findPath(playerPosition, moveTo);
        autoPilot.goal = 'かりばへ もどる';
        autoPilot.lastLine = '';   // 次のフレームで状況行が出る
        return;
    }
    autoPilot.lastLine = '';
}

// 宿は「歩数」だけでなく「道中の危険度」も見て選ぶ。
// 近くても強いゾーンを突っ切る道だと、休みに行く途中で全滅する
function nearestInn() {
    const cands = [];
    for (const s of INN_SPOTS) {
        const path = findPath(playerPosition, s);
        if (!path) continue;
        cands.push({ ...s, path, danger: pathRisk(path) });
    }
    if (!cands.length) return null;
    const safe = cands.filter(c => c.danger <= 0.1);
    const pool = safe.length ? safe : cands;
    // 危険が同程度なら近いほうを選ぶ。安全な道が無ければ一番マシな道を選ぶ
    pool.sort((a, b) => safe.length ? a.path.length - b.path.length
                                    : (a.danger - b.danger) || (a.path.length - b.path.length));
    return pool[0];
}

// その町で買える中で一番強い装備を買う。値段も下取りも本編の店と同じ計算にする
async function autoShop(shopKey) {
    const shop = townShops[shopKey];
    if (!shop) return;
    const kinds = [
        { stock: shop.weapons,    list: weapons,  key: 'weaponIndex' },
        { stock: shop.armors,     list: armors,   key: 'armorIndex' },
        { stock: shop.shieldList, list: shields,  key: 'shieldIndex' }
    ];
    for (const k of kinds) {
        if (!k.stock) continue;
        // 強い順に、買えるものが見つかったら買う
        const candidates = [...k.stock].sort((a, b) => b - a);
        for (const idx of candidates) {
            if (idx <= player[k.key]) break;
            const tradeIn = Math.floor(k.list[player[k.key]].price / 2);
            const cost = k.list[idx].price - tradeIn;
            if (cost > player.gold) continue;
            player.gold -= cost;
            player[k.key] = idx;
            recalcPlayerPower();
            await showMessage([`オート：${k.list[idx].name}を かった（${cost}G）`,
                               `こうげき力 ${player.attack}　しゅび力 ${player.defense}`]);
            break;
        }
    }
    // やくそうも切らさないようにする
    if (shop.tools && shop.tools.includes('herb')) {
        while (player.herb < HERB_MAX && player.gold >= toolGoods.herb.price * 4) {
            player.gold -= toolGoods.herb.price;
            player.herb++;
        }
    }
    // 買い物のメッセージを出したままだとフィールドに戻れず固まるので必ず戻す
    currentState = STATE.FIELD;
    // 用が済んだら狩り場へ帰る（町のまわりで戦い続けないように）
    if (autoPilot.spot && !(playerPosition.x === autoPilot.spot.x && playerPosition.y === autoPilot.spot.y)) {
        autoPilot.path = findPath(playerPosition, autoPilot.spot);
        autoPilot.goal = autoPilot.path ? 'かりばへ もどる' : null;
    }
}

// 宿に着いたら泊まって、狩り場へ歩いて帰る
async function autoCheckIn(inn) {
    const price = townShops[inn.shop].inn || 0;
    autoPilot.rests++;
    autoPilot.battlesAtRest = autoPilot.battles;
    if (player.gold >= price) {
        await stayInn(price);
    } else {                       // 金欠でも開発用なので止めずに休ませる
        player.hp = player.maxHp; player.mp = player.maxMp;
        await showMessage([`オート：${inn.name}で やすんだ`, '（もちきんが たりないので ただ）']);
    }
    await autoShop(inn.shop);      // 泊まったついでに装備を整える
    autoPilot.shoppedGold = player.gold;
    currentState = STATE.FIELD;
    autoPilot.path = autoPilot.spot ? findPath(playerPosition, autoPilot.spot) : null;
    autoPilot.goal = autoPilot.spot ? 'かりばへ もどる' : null;
    if (!autoPilot.path) { autoPilot.goal = null; autoPilot.home = { ...playerPosition }; }
}

// 戦闘中の判断。回復・逃走・攻撃を選ぶ
// 呪文の平均ダメージ（守備力を無視するので、硬い相手ほど殴るより効く）
const GIRA_AVG = (10 + 15) / 2, BEGIRAMA_AVG = (35 + 49) / 2;
// 殴ったときの1発あたりの期待ダメージ
function expectedHit(attack, defense) {
    const base = attack - Math.floor(defense / 2);
    if (base <= 0) return 0;
    return (Math.floor(base / 4) + Math.floor(base / 2)) / 2;
}

function autoBattleChoice() {
    const can = (name, cost) => player.spells.includes(name) && player.mp >= cost && !player.sealed;
    const low = player.hp <= player.maxHp * 0.45;
    if (low && can('ベホイミ', 10)) return { cmd: 1, spell: 'ベホイミ' };
    if (low && can('ホイミ', 4))    return { cmd: 1, spell: 'ホイミ' };
    if (low && player.herb > 0) return { cmd: 2 };

    const phys = expectedHit(player.attack, enemy.defense);
    // 呪文は守備力を無視するが、敵ごとに回避率がある（本家仕様・記載値/16）。
    // メタルスライムやりゅうおうはギラ系を15/16で弾くので、当たる分だけで見積もる
    const hits = key => 1 - (enemy.resist && enemy.resist[key] || 0) / 16;
    if (can('ベギラマ', 5) && BEGIRAMA_AVG * hits('gira') > phys * 1.3) return { cmd: 1, spell: 'ベギラマ' };
    if (can('ギラ', 2)     && GIRA_AVG     * hits('gira') > phys * 1.3) return { cmd: 1, spell: 'ギラ' };
    // 長引きそうで、こちらも傷ついているなら眠らせて態勢を立て直す
    if (can('ラリホー', 2) && !enemy.asleep && phys > 0 && hits('rariho') >= 0.5
        && enemy.hp / phys > 4 && player.hp < player.maxHp * 0.8) return { cmd: 1, spell: 'ラリホー' };

    // 殴っても呪文も通らない相手からは逃げる
    if (phys <= 0) return { cmd: 3 };
    // 回復手段が尽きて削られたら粘らずに逃げる（全滅すると所持金が半分になる）
    if (player.hp <= player.maxHp * 0.3) return { cmd: 3 };
    return { cmd: 0 };
}

// いま何をしているところかを1行で出す。「◯◯へ むかっています」を出しっぱなしに
// すると、着いたあとも同じ表示のままで何をしているか分からなくなる
function autoStatusLine() {
    const p = autoPilot;
    const left = p.path ? `あと${p.path.length}ほ` : '';
    if (currentState === STATE.BATTLE || (typeof battleResolver !== 'undefined' && battleResolver !== null))
        return `せんとう：${typeof enemy !== 'undefined' && enemy ? enemy.name : ''}`;
    if (p.goal === 'やどやへ')     return `やどやへ いく（${left}）`;
    if (p.goal === 'かいものへ')   return `${p.goldGoalName || 'そうび'}を かいに いく（${left}）`;
    if (p.goal === 'みせへ')       return `${p.goldGoalName}を かいに いく（${left}）`;
    if (p.goal === 'もくてきちへ') return `${p.questName}へ（${left}）`;
    if (p.goal === 'かりばへ もどる') return `かりばへ もどる（${left}）`;
    if (p.goldGoal)  return `かせぐ：${p.goldGoalName}まで あと${Math.max(0, p.goldGoal - player.gold)}G`;
    if (p.grindUntil && player.level < p.grindUntil)
        return `かりをする：Lv${player.level}→${p.grindUntil}（z${zoneAt(playerPosition.x, playerPosition.y)}）`;
    if (p.questMode) return `かりをする（z${zoneAt(playerPosition.x, playerPosition.y)}）／つぎ：${p.questName}`;
    return `かりをする：Lv${player.level}→${p.targetLevel}（z${zoneAt(playerPosition.x, playerPosition.y)}）`;
}

let autoBusy = false;
function autoTick(now) {
    if (!autoPilot.on) return;

    // 状況表示（変わったときだけ書き換える）
    const line = `オート ${autoStatusLine()}　${autoPilot.battles}戦 宿${autoPilot.rests} 死${autoPilot.deaths}`;
    if (line !== autoPilot.lastLine) {
        autoPilot.lastLine = line;
        document.getElementById('message').textContent = line;
    }
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
        // 強すぎる場所に置かれると、逃げてばかりで経験値が入らず、たまに全滅して
        // 所持金だけ半分になる——という運ゲーになる。死亡率だけ見ても逃げて生き延びる
        // ぶん低く出るので、「実際に稼げている経験値」で判断する
        // 狩り場へ戻る途中でまた全滅する、を繰り返すと経路が常に残るので、
        // 「経路が無いとき」を条件にすると永久に判定が走らない。宿へ向かう時だけ除く
        if (autoPilot.recentBattles >= 30 && !['やどやへ', 'みせへ', 'もくてきちへ', 'かいものへ'].includes(autoPilot.goal)) {
            const got = (player.exp - autoPilot.recentExp) / autoPilot.recentBattles;
            const deathRate = autoPilot.recentDeaths / autoPilot.recentBattles;
            const here = zoneAt(playerPosition.x, playerPosition.y);
            // 実際に死にすぎているときは、いまのゾーンを候補から外して安全側へ逃がす。
            // これが無いと「いまの場所が一番おいしい」判定のままそこで死に続ける
            let best = deathRate > 0.1
                ? bestHuntingSpot({ avoidZone: here, maxDeath: 0.03 }) || bestHuntingSpot()
                : bestHuntingSpot();
            const badly = best && best.zone !== here && (best.exp > got * 1.5 || deathRate > 0.1);
            autoPilot.recentBattles = 0; autoPilot.recentDeaths = 0; autoPilot.recentExp = player.exp;
            if (badly) {
                // すでにその狩り場へ向かっている最中なら、数え直すだけにする。
                // ここで経路を引き直すと、道中の弱い敵で判定が再発して永久に着かない
                if (autoPilot.spot && autoPilot.spot.x === best.x && autoPilot.spot.y === best.y) {
                    return;
                }
                if (autoPilot.relocated < 3) {
                    autoPilot.relocated++;
                    autoPilot.spot = { x: best.x, y: best.y };
                    autoPilot.path = findPath(playerPosition, best);
                    autoPilot.goal = 'かりばへ もどる';
                    autoPilot.lastLine = '';   // 表示を出し直す
                    return;
                }
                if (!autoPilot.questMode) {
                    autoStop(`かせげません（1戦${got.toFixed(1)}exp・${Math.round(deathRate*100)}%ぜんめつ）`);
                    return;
                }
                autoPilot.relocated = 0;   // 本編モードは止めずに狩り場を選び直し続ける
            }
        }
        // 本編を自動で進める。次の目的地へ歩き、着いたらAを押してイベントを起こす
        if (autoPilot.questMode && !['やどやへ', 'かいものへ'].includes(autoPilot.goal)) {
            const q = nextQuestStep();
            if (!q) { autoStop('ぼうけんを クリアしました'); return; }
            if (q.name !== autoPilot.questName) {     // 目的地が進んだ
                autoPilot.questName = q.name;
                autoPilot.questFails = 0;
                autoPilot.path = null;
                autoPilot.grindUntil = 0;
            }
            // 買える装備があるなら、鍛えるより先に買う。装備が良くなれば必要レベルも下がる
            const buy = nextGearGoal();
            if (!autoPilot.path && buy && buy.town && player.gold >= buy.price
                && player.gold > autoPilot.shoppedGold) {
                const at = playerPosition.x === buy.town.x && playerPosition.y === buy.town.y;
                if (!at) {
                    autoPilot.path = findPath(playerPosition, buy.town);
                    autoPilot.goal = 'かいものへ';
                    autoPilot.shopKey = buy.town.shop;
                    autoPilot.lastLine = '';   // 表示を出し直す
                    return;
                }
                autoBusy = true;
                autoPilot.shoppedGold = player.gold;
                autoPilot.grindUntil = 0;      // 装備が変わるので必要レベルを測り直す
                Promise.resolve(autoShop(buy.town.shop)).then(() => { autoBusy = false; });
                return;
            }
            // 前回たどり着いてもフラグが立たなかった＝倒せていないので、鍛えてから戻る
            if (autoPilot.grindUntil && player.level < autoPilot.grindUntil) {
                // 下の狩り処理にそのまま流す
            } else if (playerPosition.x === q.x && playerPosition.y === q.y) {
                autoPilot.grindUntil = 0;
                autoBusy = true;
                Promise.resolve(interactField()).then(() => {
                    autoBusy = false;
                    if (!q.done()) {                  // まだ達成できていない
                        autoPilot.questFails++;
                        if (autoPilot.questFails >= 6) { autoStop(`${q.name}が できません`); return; }
                        autoPilot.grindUntil = Math.min(30, player.level + 2);
                        const best = bestHuntingSpot();
                        if (best) {
                            autoPilot.spot = { x: best.x, y: best.y };
                            autoPilot.path = findPath(playerPosition, best);
                            autoPilot.goal = 'かりばへ もどる';
                    autoPilot.lastLine = '';   // 表示を出し直す
                        }
                    }
                });
                return;
            } else if (!autoPilot.path) {
                const path = findPath(playerPosition, q);
                const danger = pathDanger(path);
                // 道中で死にまくる強さなら、先に安全な狩り場で鍛えてから向かう
                if (danger > 0.15 && player.level < 30) {
                    const best = bestHuntingSpot();
                    if (best) {
                        autoPilot.grindUntil = Math.max(player.level + 1, levelForPath(path));
                        autoPilot.relocated = 0;   // 鍛え直しのたびに移動回数はリセット
                        autoPilot.spot = { x: best.x, y: best.y };
                        autoPilot.path = findPath(playerPosition, best);
                        autoPilot.goal = 'かりばへ もどる';
                    autoPilot.lastLine = '';   // 表示を出し直す
                        return;
                    }
                }
                autoPilot.path = path;
                autoPilot.goal = 'もくてきちへ';
                    autoPilot.lastLine = '';   // 表示を出し直す
            }
        }
        if (autoPilot.goldGoal && player.gold >= autoPilot.goldGoal) {
            const shop = autoPilot.goldGoalTown;
            const atShop = shop && playerPosition.x === shop.x && playerPosition.y === shop.y;
            // 貯まったら、その装備を売っている町まで歩いてから止まる
            if (shop && !atShop) {
                if (autoPilot.goal !== 'みせへ') {
                    autoPilot.path = findPath(playerPosition, shop);
                    autoPilot.goal = 'みせへ';
                    autoPilot.lastLine = '';   // 表示を出し直す
                }
                // ここでは止めず、下の経路追従に任せて歩かせる
            } else {
                autoStop(`${autoPilot.goldGoalName}を かえます`);
                return;
            }
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
    if (autoPilot.wasBattle) { autoPilot.wasBattle = false; autoPilot.battles++; autoPilot.recentBattles++; }

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

    // 狩り場から離れたまま放置されないようにする。全滅して城へ送られたり、
    // 町へ寄ったあと戻れないと、弱いゾーンで延々と戦い続けることになる
    if (autoPilot.spot && !autoPilot.path && !autoPilot.goal
        && Math.abs(playerPosition.x - autoPilot.spot.x)
         + Math.abs(playerPosition.y - autoPilot.spot.y) > 12) {
        autoPilot.path = findPath(playerPosition, autoPilot.spot);
        if (autoPilot.path) { autoPilot.goal = 'かりばへ もどる'; return; }
    }

    // 目的地があるときは、うろつかずに経路をたどる（宿へ／狩り場へ）
    if (autoPilot.path && autoPilot.path.length) {
        const next = autoPilot.path[0];
        if (playerPosition.x === next.x && playerPosition.y === next.y) {
            autoPilot.path.shift();
            if (!autoPilot.path.length) return;     // 到着。次のフレームで判定する
        }
        const target = autoPilot.path[0];
        const k = stepKeyToward(playerPosition, target);
        if (!k) {
            const w = warpFrom(playerPosition.x, playerPosition.y);
            if (w && w.x === target.x && w.y === target.y) {   // 洞窟をくぐる
                for (const other of ARROW_KEYS) Input.release(other);
                autoPilot.dir = null;
                Input.press(' ');
                return;
            }
            autoPilot.path = findPath(playerPosition, target);  // 道から外れたので引き直す
            return;
        }
        for (const other of ARROW_KEYS) if (other !== k) Input.release(other);
        autoPilot.dir = k;
        Input.press(k);
        return;
    }
    // 目的地に着いた
    if (autoPilot.path && !autoPilot.path.length) {
        autoPilot.path = null;
        if (autoPilot.goal === 'やどやへ') {
            autoBusy = true;
            autoCheckIn(autoPilot.inn).then(() => { autoBusy = false; });
            autoPilot.goal = null;
            return;
        }
        if (autoPilot.goal === 'かいものへ') {
            autoBusy = true;
            autoPilot.shoppedGold = player.gold;
            autoPilot.grindUntil = 0;      // 装備が変わるので必要レベルを測り直す
            Promise.resolve(autoShop(autoPilot.shopKey)).then(() => { autoBusy = false; });
            autoPilot.goal = null;
            return;
        }
        // うろつく基点を更新するのは狩り場に着いたときだけ。
        // 町に着くたびに書き換えると、その町のまわり(たいてい弱いゾーン)で
        // 戦い続けてしまう
        if (autoPilot.goal === 'かりばへ もどる') autoPilot.home = { ...playerPosition };
        autoPilot.goal = null;
        return;   // 次のフレームで目的地判定が走る
    }

    // HPが半分を切ったら休む。回復呪文を1回も唱えられないほどMPが尽きたときも休む。
    // ここを「MP < 必要量×3」にしていたら、Lv3(最大MP5)は宿から出た瞬間にまた条件が
    // 成立して延々と泊まり続けた。最大MPで満たせない条件を書いてはいけない
    const mpDry = healSpell && player.maxMp >= healCost && player.mp < healCost;
    const wantRest = player.hp <= player.maxHp * 0.5 || (mpDry && player.hp < player.maxHp * 0.8);
    // 念のための歯止め: 前回の休憩から一度も戦っていなければ泊まり直さない
    if (wantRest && autoPilot.battles !== autoPilot.battlesAtRest) {
        const inn = nearestInn();
        if (inn) {
            autoPilot.inn = inn;
            autoPilot.path = inn.path;
            autoPilot.goal = 'やどやへ';
                    autoPilot.lastLine = '';   // 表示を出し直す
            return;
        }
        // どの宿へも歩いて行けない場所（起きないはずだが保険）
        autoPilot.battlesAtRest = autoPilot.battles;
    }

    // 歩く。同じ向きをしばらく保ち、行き止まりや遠出はホームへ引き返す
    if (playerPosition.x === autoPilot.lastPos.x && playerPosition.y === autoPilot.lastPos.y) autoPilot.stuck++;
    else { autoPilot.stuck = 0; autoPilot.lastPos = { ...playerPosition }; }

    // 進めない向きを押し続けると、その間ずっと足踏みしてエンカウントしない。
    // 「実際に進めるマス」だけを候補にする
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
