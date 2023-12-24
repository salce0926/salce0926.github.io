// 画像のURL
var tilesetURL = 'https://www.spriters-resource.com/resources/sheets/10/10199.png';
var mapURL = 'https://www.spriters-resource.com/resources/sheets/106/109509.png';
var characterURL = 'https://www.spriters-resource.com/resources/sheets/39/41381.png';

// タイルのサイズ
var tileSize = 16;
var rate = 1.5;

// マップサイズ
var mapWidth = mapData[0].length;
var mapHeight = mapData.length;

// スクリーンサイズ
var screenWidth = 16;
var screenHeight = 16;

// フラグとクリア条件を管理するオブジェクト
var flags = {
    start: { flag: false, location: { x: 0, y: 0 } },
    fairyFlute: { flag: false, location: { x: 112, y: 18 } },
    magicKey: { flag: false, location: { x: 110, y: 80 } },
    roraRescued: { flag: false, location: { x: 0, y: 0 } },
    roraLove: { flag: false, location: { x: 0, y: 0 } },
    sunStone: { flag: false, location: { x: 51, y: 51 } },
    silverHerp: { flag: false, location: { x: 10, y: 10 } },
    rainCloudStuff: { flag: false, location: { x: 89, y: 9 } },
    golemKilled: { flag: false, location: { x: 81, y: 108 } },
    rotoEmblem: { flag: false, location: { x: 91, y: 121 } },
    rotoArmor: { flag: false, location: { x: 33, y: 97 } },
    rainbowDrop: { flag: false, location: { x: 116, y: 117 } },
    rainbowBridge: { flag: false, location: { x: 73, y: 57 } },
    lightBall: { flag: false, location: { x: 56, y: 56 } }
};

// プレイヤーの初期位置
var playerPosition = { x: 51, y: 51 };
// var playerPosition = { x: 112, y: 17 };

// Canvasの設定
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
canvas.width = screenWidth * tileSize * rate;
canvas.height = screenHeight * tileSize * rate;

var message = '';
var interval = 500;
var isWaitingInput = false;
var isStillTalking = false;
var isDebug = false;

// イメージのロード
var characterImage = new Image();
characterImage.src = characterURL;
var tilesetImage = new Image();
tilesetImage.src = tilesetURL;
tilesetImage.onload = function () {
    drawScreen();
};

function drawTile(x, y, index){
    var offsetX = 3;
    var offsetY = 2;
    var offsetTile = 1;
    var tileRowLength = 25;
    var src = tilesetImage;
    ctx.drawImage(src, offsetX+(index % tileRowLength) * (tileSize+offsetTile), offsetY+Math.floor(index / tileRowLength) * (tileSize+offsetTile), tileSize, tileSize, x * tileSize*rate, y * tileSize*rate, tileSize*rate, tileSize*rate);
}
function drawCharacter(x, y, index){
    var offsetX = 8;
    var offsetY = 8;
    var offsetTile = 8;
    var tileRowLength = 14;
    var src = characterImage;
    ctx.drawImage(src, offsetX+(index % tileRowLength) * (tileSize+offsetTile), offsetY+Math.floor(index / tileRowLength) * (tileSize+offsetTile), tileSize, tileSize, x * tileSize*rate, y * tileSize*rate, tileSize*rate, tileSize*rate);
}

function displayMessage(mes){
    document.getElementById('message').innerText = mes;
    message = '';
}

function waitForInput(isTalking){
    isWaitingInput = true;
    isStillTalking = isTalking;
    displayMessage(message);

    return new Promise(resolve => {
        window.addEventListener('keydown', function keydownListener(e) {
            isWaitingInput = false;
            window.removeEventListener('keydown', keydownListener);
            resolve();
        });
        window.addEventListener('touchstart', function keydownListener(e) {
            isWaitingInput = false;
            window.removeEventListener('touchstart', keydownListener);
            resolve();
        });
    });
}

function playerKilled(){
    playerPosition.x = 51;
    playerPosition.y = 51;
}

function isVisitMaira(position){
    return position.x === flags.fairyFlute.location.x && position.y === flags.fairyFlute.location.y;
}
function isVisitCaveNorth(position){
    return position.x === 112 && position.y === 52;
}
function isVisitCaveSouth(position){
    return position.x === 112 && position.y === 57;
}
function isVisitCave(position){
    return isVisitCaveNorth(position) || isVisitCaveSouth(position);
}
function isVisitRimurudaru(position){
    return position.x === flags.magicKey.location.x && position.y === flags.magicKey.location.y;
}
function isVisitCastle(position){
    return position.x === flags.sunStone.location.x && position.y === flags.sunStone.location.y;
}
function isVisitGarai(position){
    return position.x === flags.silverHerp.location.x && position.y === flags.silverHerp.location.y;
}
function isVisitMairaShrine(position){
    return position.x === flags.rainCloudStuff.location.x && position.y === flags.rainCloudStuff.location.y;
}
function isVisitMerukidoGate(position){
    return position.x === flags.golemKilled.location.x && position.y === flags.golemKilled.location.y;
}
function isVisitMerukido(position){
    return position.x === flags.golemKilled.location.x && position.y === flags.golemKilled.location.y+2;
}
function isVisitRotoEmblem(position){
    return position.x === flags.rotoEmblem.location.x && position.y === flags.rotoEmblem.location.y;
}
function isVisitDomudora(position){
    return position.x === flags.rotoArmor.location.x && position.y === flags.rotoArmor.location.y;
}
function isVisitRimurudaruShrine(position){
    return position.x === flags.rainbowDrop.location.x && position.y === flags.rainbowDrop.location.y;
}
function isVisitRainbowBridge(position){
    return position.x === flags.rainbowBridge.location.x && position.y === flags.rainbowBridge.location.y;
}
function isVisitDragonCastle(position){
    return position.x === flags.lightBall.location.x && position.y === flags.lightBall.location.y;
}

async function checkConditions() {
    document.getElementById('point').style.display = 'none';
    message = '';
    if(isVisitMaira(playerPosition)){
        if(!flags.fairyFlute.flag){
            flags.fairyFlute.flag = true;
            message += 'ここはマイラの村だ\n';
            message += '温泉で有名らしい\n';
            message += '温泉の近くに何か落ちている...\n';
            await waitForInput(true);
            message += '妖精の笛を手に入れた！';
            await waitForInput(false);
        }else{
            message += 'ここはマイラの村だ\n';
            message += '温泉で有名らしい';
            await waitForInput(false);
        }
    }else if(isVisitCave(playerPosition)){
        if(!flags.roraRescued.flag){
            if(!flags.magicKey.flag){
                message += '洞窟の中に扉があったが、鍵が無いので開けられなかった...';
                await waitForInput(false);
            }else{
                flags.roraRescued.flag = true;
                message += '魔法の鍵で扉を開けた！\n';
                message += 'ドラゴンを倒してローラ姫を救出した！';
                await waitForInput(false);
            }
        }else{
            message += '倒したドラゴンのことは今度片付けよう';
            await waitForInput(false);
        }
        if(isVisitCaveNorth(playerPosition)){
            playerPosition.y = 57;
        }else if(isVisitCaveSouth(playerPosition)){
            playerPosition.y = 52;
        }
    }else if(isVisitRimurudaru(playerPosition)){
        if(!flags.magicKey.flag){
            flags.magicKey.flag = true;
            message += 'ここはリムルダールの町だ\n';
            message += '店で魔法の鍵を手に入れた！';
            await waitForInput(false);
        }else{
            message += 'ここはリムルダールの町だ';
            await waitForInput(false);
        }
    }else if(isVisitCastle(playerPosition)){
        message += 'ここはラダトームの城だ\n';
        await waitForInput(true);
        if(flags.lightBall.flag){
            message += '王様「勇者よ！よくぞりゅうおうを倒してくれた！」\n';
            message += '王様「わしに代わってこの国を治めてくれい！」\n';
            await waitForInput(true);
            message += 'しかし あなたは いいました（←！？）\n';
            await waitForInput(true);
            message += '勇者「自分の治める国があるなら、それは自分で探したいのです」\n';
            await waitForInput(true);
            message += 'ローラ姫「私も連れて行ってください！」\n';
            message += 'ローラ姫は 返事も聞かずに隣に立った！\n';
            await waitForInput(true);
            message += '～THE END～';
            await waitForInput(false);
        }else{
            if(!flags.roraLove.flag && flags.roraRescued.flag){
                flags.roraLove.flag = true;
                message += '王様「ローラ姫！」\n';
                await waitForInput(true);
                message += '王様「なんと！ドラゴンに囚われておったのか」\n';
                message += '王様「勇者よ！よくぞローラ姫を救い出してくれた！」\n';
                await waitForInput(true);
                message += 'ローラ姫「ありがとうございます...//」\n'
                message += 'おうじょのあいを手に入れた！';
                await waitForInput(true);
                message += 'ローラ姫「こころは ずっといっしょですわ...//」\n'
                await waitForInput(false);
            }else{
                if(!flags.start.flag){
                    flags.start.flag = true;
                    message += '王様「勇者よ！りゅうおうを倒すのだ！」\n';
                    message += '王様「光の玉を取り返し 世界の闇を振り払え！」';
                    await waitForInput(true);
                }
                if(!flags.sunStone.flag){
                    if(flags.magicKey.flag){
                        flags.sunStone.flag = true;
                        message += '城の裏で鍵を使い太陽の石を手に入れた！';
                        await waitForInput(false);
                    }else{
                        message += '王様「こんな時にローラ姫はどこへ...」';
                        await waitForInput(false);
                    }
                }else{
                    message += '王様「もし敵にやられてしまったら」\n';
                    message += '王様「ここまで運び込まれるのじゃ」\n';
                    await waitForInput(true);
                    message += '王様「所持金の概念が無くて良かったのう」\n';
                    message += '王様「我が城の兵士を動かすのも」\n';
                    message += '王様「タダというわけではないんじゃが...」\n';
                    await waitForInput(false);
                }
            }
        }
    }else if(isVisitGarai(playerPosition)){
        if(!flags.silverHerp.flag){
            if(flags.magicKey.flag){
                flags.silverHerp.flag = true;
                message += 'ここはガライの町だ\n';
                message += '吟遊詩人ガライの墓があるらしい\n';
                message += '隠し通路の鍵を開けてダンジョンに挑んだ！\n';
                await waitForInput(true);
                message += 'ガライの墓で銀の竪琴を手に入れた！';
                await waitForInput(false);
            }else{
                message += 'ここはガライの町だ\n';
                message += '吟遊詩人ガライの墓があるらしい\n';
                message += '隠し通路を見つけたが鍵がかかっている...';
                await waitForInput(false);
            }
        }else{
            message += 'ここはガライの町だ\n';
            message += '吟遊詩人ガライの墓があるらしい';
            await waitForInput(false);
        }
    }else if(isVisitMairaShrine(playerPosition)){
        if(!flags.rainCloudStuff.flag){
            if(!flags.silverHerp.flag){
                message += '老人「銀の竪琴の音色を聞きたいなあ...」';
                await waitForInput(false);
            }else{
                flags.rainCloudStuff.flag = true;
                message += '老人「おお！それは銀の竪琴ではないか！」\n';
                message += '老人「そなたに雨雲の杖を授けよう！」\n';
                message += '雨雲の杖を手に入れた！';
                await waitForInput(false);
            }
        }else{
            message += '老人「もう思い残すことはないわいﾋﾟﾛﾋﾟﾛ」';
            await waitForInput(false);
        }
    }else if(isVisitMerukidoGate(playerPosition)){
        if(!flags.golemKilled.flag){
            if(!flags.fairyFlute.flag){
                message += 'ゴーレムが現れた！\n';
                message += '動きを止めないと勝ち目がない...！\n';
                message += 'しんでしまった...';
                await waitForInput(false);
                playerKilled();
            }else{
                flags.golemKilled.flag = true;
                message += '妖精の笛でゴーレムを眠らせた！\n';
                message += 'ゴーレムを倒した！';
                await waitForInput(false);
            }
        }
    }else if(isVisitMerukido(playerPosition)){
        if(!flags.rotoEmblem.flag){
            const dx = flags.rotoEmblem.location.x - flags.sunStone.location.x;
            const dy = flags.rotoEmblem.location.y - flags.sunStone.location.y;
            message += `老人「ラダトーム城まで西に${dx} 北に${dy}の場所を調べなされ！」`;
            await waitForInput(false);
        }else{
            message += '老人「てか おうじょのあい 重くない？」\n';
            await waitForInput(true);
            message += '老人「もちろん 物理的な 話なんだけど」';
            await waitForInput(false);
        }
    }else if(isVisitRotoEmblem(playerPosition)){
        if(!flags.rotoEmblem.flag){
            flags.rotoEmblem.flag = true;
            message += 'ロトのしるしを手に入れた！';
            await waitForInput(false);
        }
    }else if(isVisitDomudora(playerPosition)){
        if(!flags.rotoArmor.flag){
            flags.rotoArmor.flag = true;
            message += 'ここはドムドーラの町だった\n';
            message += '今は廃墟となってしまっている...\n';
            message += '突然 あくまのきし が現れた！';
            await waitForInput(true);
            message += 'あくまのきし を倒してロトの鎧を手に入れた！';
            await waitForInput(false);
        }else{
            message += 'ここはドムドーラの町だった\n';
            message += '今は廃墟となってしまっている...';
            await waitForInput(true);
            message += '何故ここにロトの鎧があったのか\n';
            message += 'その真相は製品版をお買い求めください';
            await waitForInput(false);
        }
    }else if(isVisitRimurudaruShrine(playerPosition)){
        if(!flags.rainbowDrop.flag){
            if(flags.sunStone.flag && flags.rainCloudStuff.flag && flags.rotoEmblem.flag){
                flags.rainbowDrop.flag = true;
                message += '老人「よくぞ太陽と雨雲を揃えた！」\n';
                await waitForInput(true);
                message += '老人「ここに虹のしずくが完成した！」\n';
                message += '老人「これでりゅうおうへの道が開かれるであろう！」';
                await waitForInput(false);
            }else if(!flags.rotoEmblem.flag){
                message += '老人「勇者だと？嘘をつくな！」\n';
                await waitForInput(true);
                message += '老人「もし本物の勇者なら」\n';
                message += '老人「どこかにしるしがあるはずじゃ！」';
                await waitForInput(false);
            }else{
                message += '老人「しるしを持っているな！本物の勇者じゃ」\n';
                await waitForInput(true);
                message += '老人「太陽と雨雲が揃ったとき」\n';
                message += '老人「虹の橋が架かるとの言い伝えじゃ！」';
                await waitForInput(false);
            }
        }else{
            message += '老人「前から 思ってたけど...」\n';
            await waitForInput(true);
            message += '老人「虹のしずくを 経由しなくても」\n';
            message += '老人「全部揃ってたら 橋が架かるって勘違いしない？」';
            await waitForInput(false);
        }
    }else if(isVisitRainbowBridge(playerPosition)){
        if(!flags.rainbowBridge.flag && flags.rainbowDrop.flag){
            flags.rainbowBridge.flag = true;
            mapData[flags.rainbowBridge.location.y][flags.rainbowBridge.location.x-1] = 35;
            message += '虹のしずくを使った！\n';
            await waitForInput(true);
            message += '虹の橋が架かった！';
            await waitForInput(false);
        }
    }else if(isVisitDragonCastle(playerPosition)){
        if(!flags.rotoArmor.flag){
            message += 'りゅうおうが 現れた！\n';
            await waitForInput(true);
            message += '防御が紙なので 普通にやられてしまった！';
            await waitForInput(true);
            message += 'どうしてこんな装備で 挑んでしまったんだ！';
            await waitForInput(false);
            playerKilled();
        }else{
            flags.lightBall.flag = true;
            message += 'りゅうおうを倒し、光の玉を手に入れた！\n';
            await waitForInput(false);
        }
    }else{
        displayMessage(message);
    }
    if(flags.roraLove.flag) document.getElementById('point').style.display = 'block';
}

function screenXToWorldX(screenX){
    return ((playerPosition.x - screenWidth/2 + screenX) + mapWidth) % mapWidth;
}

function screenYToWorldY(screenY){
    return ((playerPosition.y - screenHeight/2 + screenY) + mapHeight) % mapHeight;
}

var index = 4;
function drawScreen() {
    for (var y = 0; y <= screenHeight; y++) {
        for (var x = 0; x <= screenWidth; x++) {
            var tileIndex = mapData[screenYToWorldY(y)][screenXToWorldX(x)];
            if(tileIndex >= 350) tileIndex -= 12*25;
            if(x === screenWidth/2 && y === screenHeight/2){
                drawCharacter(x, y, index);
                index = (index + 2) % 2 + 4;
            }else{
                drawTile(x, y, tileIndex);
            }
        }
    }

    let dx = flags.sunStone.location.x - playerPosition.x;
    let dy = flags.sunStone.location.y - playerPosition.y;
    let ns = (dx > 0 ? '東' : '西');
    let ew = (dy > 0 ? '南' : '北');
    dx = (dx > 0 ? dx : -dx);
    dy = (dy > 0 ? dy : -dy);
    if(flags.roraLove.flag) document.getElementById('point').innerText = `ローラ「ラダトーム城まで${ns}へ${dx} ${ew}へ${dy}ですわ」`;
    else if(isDebug) document.getElementById('point').innerText = `x: ${playerPosition.x}, y: ${playerPosition.y}, tile: ${mapData[playerPosition.y][playerPosition.x]}`;
}

let lastTime = 0;
async function gameLoop(timestamp){
    const deltaTime = timestamp - lastTime;
    if(!isWaitingInput){
        if(deltaTime > interval){
            index++;
            lastTime = timestamp;
        }
    }

    if (moveX !== 0 || moveY !== 0) {
        let x = playerPosition.x + moveX;
        let y = playerPosition.y + moveY;

        // マップ外に移動しないように修正
        x = (x + mapWidth) % mapWidth;
        y = (y + mapHeight) % mapHeight;

        switch (mapData[y][x]){
            case 25://城
            case 26://町
            case 27://平原
            case 28://森
            case 29://山
            case 31://洞窟
            case 32://外階段
            case 33://砂漠
            case 34://毒沼
            case 35://橋
                playerPosition.x = x;
                playerPosition.y = y;
                break;
            default:
                if(isDebug){
                    playerPosition.x = x;
                    playerPosition.y = y;
                }
                break;
        }
    }
    
    drawScreen();
    await checkConditions();
    drawScreen();
    requestAnimationFrame(gameLoop);
}

let moveX = 0;
let moveY = 0;
let keyDownMap = {}; // キーが押されているかどうかを管理するオブジェクト

window.addEventListener('keydown', function (e) {
    if(isStillTalking){
        return;
    }
    isWaitingInput = false;

    // キーが押されている状態を記録
    keyDownMap[e.key] = true;

    switch (e.key) {
        case 'ArrowUp':
            moveY = -1;
            break;
        case 'ArrowDown':
            moveY = 1;
            break;
        case 'ArrowLeft':
            moveX = -1;
            break;
        case 'ArrowRight':
            moveX = 1;
            break;
        case 'd':
            isDebug ^= true;
            break;
        default:
            break;
    }
});

window.addEventListener('keyup', function (e) {
    // キーが離されたら、そのキーの状態をリセット
    keyDownMap[e.key] = false;

    switch (e.key) {
        case 'ArrowUp':
        case 'ArrowDown':
            moveY = 0;
            break;
        case 'ArrowLeft':
        case 'ArrowRight':
            moveX = 0;
            break;
        default:
            break;
    }

    // 全ての方向のキーが離された場合、移動を停止
    if (!Object.values(keyDownMap).includes(true)) {
        moveX = 0;
        moveY = 0;
    }
});

// タッチデバイスの場合にはデフォルトのスクロールを防ぐ
if ('ontouchstart' in window) {
    document.body.style.touchAction = 'none';
}

window.addEventListener('touchstart', function (e) {
    if(isStillTalking){
        return;
    }
    isWaitingInput = false;
    let x = playerPosition.x;
    let y = playerPosition.y;
    // タッチ位置を取得
    var touchX = e.touches[0].clientX;
    var touchY = e.touches[0].clientY;

    // 画面の中央を起点にしてタッチ位置を計算
    var centerX = window.innerWidth / 2;
    var centerY = window.innerHeight / 2;

    // タッチ位置と中央位置の差を計算
    var deltaX = touchX - centerX;
    var deltaY = touchY - centerY;

    // 差の絶対値が大きい方に動く方向を設定
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // 左右移動
        x += deltaX > 0 ? 1 : -1;
        x = (x + mapWidth) % mapWidth;
    } else {
        // 上下移動
        y += deltaY > 0 ? 1 : -1;
        y = (y + mapHeight) % mapHeight;
    }

    switch (mapData[y][x]){
        case 25://城
        case 26://町
        case 27://平原
        case 28://森
        case 29://山
        case 31://洞窟
        case 32://外階段
        case 33://砂漠
        case 34://毒沼
        case 35://橋
            playerPosition.x = x;
            playerPosition.y = y;
            break;
        default:
            if(isDebug){
                playerPosition.x = x;
                playerPosition.y = y;
            }
            break;
    }
    drawScreen();

    // デフォルトのスクロールを防ぐ
    e.preventDefault();
});

window.onload = function () {
    gameLoop();
};