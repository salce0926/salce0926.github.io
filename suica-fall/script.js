const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const wallWidth = 10; // 左右の壁の幅
const floorHeight = 10; // 床の高さ
const roofHeight = 200; // 天井の高さ
const gravity = 0.98; // 重力加速度
const friction = 0.8; // 摩擦係数

let fruits = [];
let score = 0;
let gameover = false;
const gameArea = {
    top: wallWidth,
    bottom: canvas.height - floorHeight,
    left: wallWidth,
    right: canvas.width - wallWidth,
};

// サイズと色の情報を持つ配列
const fruitInfo = [
    { size: 20, color: '#FF0000' },    // 赤
    { size: 40, color: '#FF8C00' },    // ダークオレンジ
    { size: 60, color: '#FFD700' },    // 金色
    { size: 80, color: '#00FF00' },    // 緑
    { size: 100, color: '#32CD32' },   // ライムグリーン
    { size: 120, color: '#0000FF' },   // 青
    { size: 140, color: '#4B0082' },   // インディゴ
    { size: 160, color: '#8A2BE2' },   // ブルー・バイオレット
    { size: 180, color: '#800000' },   // マルーン
    { size: 200, color: '#FF1493' },   // ディープピンク
    { size: 220, color: '#8B4513' },   // シエナ
];

let nextFruit = generateFruit(); // 次に落ちる果物
let dragFruit = null; // ドラッグ中の果物

function getRandomSize() {
    // 小さい方から5つのサイズをランダムに選ぶ
    const sizes = [0, 1, 2, 3, 4];
    return sizes[Math.floor(Math.random() * sizes.length)];
}

function drawFruits() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.beginPath();
    ctx.moveTo(0, roofHeight);
    ctx.lineTo(canvas.width, roofHeight);
    ctx.strokeStyle = 'red';
    ctx.stroke();
    ctx.closePath();

    // 床の描画
    ctx.fillStyle = '#DED0B6';
    ctx.fillRect(0, canvas.height - floorHeight, canvas.width, floorHeight);

    // 壁の描画
    ctx.fillRect(0, 0, wallWidth, canvas.height);
    ctx.fillRect(canvas.width - wallWidth, 0, wallWidth, canvas.height);

    // nextの描画
    ctx.strokeRect(
    canvas.width - fruitInfo[4].size - wallWidth,
    0,
    fruitInfo[4].size,
    fruitInfo[4].size
    );

    for (const fruit of fruits) {
        ctx.beginPath();
        ctx.arc(
            fruit.x,
            fruit.y,
            fruitInfo[fruit.type].size / 2,
            0,
            Math.PI * 2
        );
        ctx.fillStyle = fruitInfo[fruit.type].color;
        ctx.fill();
        ctx.closePath();
    }

    // 次に落ちる果物を描画
    if (nextFruit) {
        ctx.beginPath();
        ctx.arc(
            canvas.width - fruitInfo[4].size / 2 - wallWidth,
            fruitInfo[4].size / 2,
            fruitInfo[nextFruit.type].size / 2,
            0,
            Math.PI * 2
        );
        ctx.fillStyle = fruitInfo[nextFruit.type].color;
        ctx.fill();
        ctx.closePath();
    }

    // 操作中の果物を描画
    if (dragFruit) {
        ctx.beginPath();
        ctx.arc(
            clickX,
            dragFruit.y,
            fruitInfo[dragFruit.type].size / 2,
            0,
            Math.PI * 2
        );
        ctx.fillStyle = fruitInfo[dragFruit.type].color;
        ctx.fill();
        ctx.closePath();
    }
}

function updateFruits() {
    for (const fruit of fruits) {
    fruit.vy += gravity; // 重力を速度に加える
    fruit.vy *= friction; // 摩擦を適用
    fruit.y += fruit.vy; // 速度を位置に加える

    // 落下後の床や壁を通り抜けないように修正
    if (fruit.y > gameArea.bottom - fruitInfo[fruit.type].size / 2) {
        fruit.y = gameArea.bottom - fruitInfo[fruit.type].size / 2;
        fruit.vy *= friction; // 床に接触したら摩擦を適用
    }

    // 壁を通り抜けないように修正
    if (fruit.x < gameArea.left + fruitInfo[fruit.type].size / 2) {
        fruit.x = gameArea.left + fruitInfo[fruit.type].size / 2;
        fruit.vy *= friction; // 壁に接触したら摩擦を適用
    } else if (fruit.x > gameArea.right - fruitInfo[fruit.type].size / 2) {
        fruit.x =
        gameArea.right - fruitInfo[fruit.type].size / 2;
        fruit.vy *= friction; // 壁に接触したら摩擦を適用
    }

    // 画面上部に到達した場合にゲームオーバー
    if (!gameover &&
        fruit.y < gameArea.top +
            roofHeight +
            fruitInfo[fruit.type].size / 2) {
        gameover = true;
        alert('Game Over! Score: ' + score);
    }
    }
}

function resetGame() {
    fruits = [];
    nextFruit = generateFruit();
    score = 0;
    gameover = false;
    drawFruits();
    location.reload();
}

function checkCollision() {
    for (let i = 0; i < fruits.length; i++) {
    for (let j = i + 1; j < fruits.length; j++) {
        const currentFruit = fruits[i];
        const nextFruit = fruits[j];

        const distance = Math.sqrt(
        Math.pow(currentFruit.x - nextFruit.x, 2) +
            Math.pow(currentFruit.y - nextFruit.y, 2)
        );

        const overlap = (fruitInfo[currentFruit.type].size + fruitInfo[nextFruit.type].size) / 2 - distance;

        // 統合判定
        const canMerge =
        currentFruit.type < 10 &&
        currentFruit.type === nextFruit.type;

        // 通り抜け防止の判定
        if (overlap > 0) {
            if (canMerge) {
                fruits.splice(i, 1);
                fruits.splice(j - 1, 1);
                // 大きな果物を生成
                fruits.push({
                x: (currentFruit.x + nextFruit.x) / 2,
                y: (currentFruit.y + nextFruit.y) / 2,
                type: currentFruit.type + 1,
                vy: 0,
                });
                score += 10;
                // 衝突があった場合、iおよびjの値をデクリメントして、次の組み合わせを検証する
                i--;
                break;
            }
            // 通り抜けを防ぐ処理
            const angle = Math.atan2(
                nextFruit.y - currentFruit.y,
                nextFruit.x - currentFruit.x
            );
            currentFruit.x -= overlap / 2 * Math.cos(angle);
            currentFruit.y -= overlap / 2 * Math.sin(angle);
            nextFruit.x += overlap / 2 * Math.cos(angle);
            nextFruit.y += overlap / 2 * Math.sin(angle);
            currentFruit.vy *= friction;
            nextFruit.vy *= friction;
        }
    }
    }
}

let clickX = null; // クリックしたx座標

canvas.addEventListener('mousedown', (event) => {
    if (!gameover) {
        // 果物を配列に追加
        dragFruit = nextFruit;
        getClickX(event);
        nextFruit = generateFruit();
    }
});

canvas.addEventListener('mousemove', (event) => {
    // ドラッグ中の果物が存在すれば座標を更新
    if (dragFruit) {
        getClickX(event);
        dragFruit.x = clickX;
    }
});

canvas.addEventListener('mouseup', (event) => {
    // ドラッグ中の果物が存在すればフラグを解除
    if (dragFruit) {
        getClickX(event);
        dragFruit.x = clickX;
        fruits.push(dragFruit);
        dragFruit = null;
    }
});

function getClickX(event) {
    clickX = event.clientX - canvas.getBoundingClientRect().left;
    // 壁を通り抜けないように修正
    if (clickX < gameArea.left + fruitInfo[dragFruit.type].size / 2) {
        clickX = gameArea.left + fruitInfo[dragFruit.type].size / 2;
    } else if (clickX > gameArea.right - fruitInfo[dragFruit.type].size / 2) {
        clickX = gameArea.right - fruitInfo[dragFruit.type].size / 2;
    }
}

function generateFruit() {
    // ランダムなサイズで果物を生成
    const randomSize = getRandomSize();

    // 果物の x 座標を仮設定
    const x = 0;

    // 果物の y 座標を計算
    const y =
    gameArea.top +
    roofHeight +
    fruitInfo[randomSize].size / 2;

    // 次に落ちる果物のプロパティを設定
    const fruit = {
    x: x,
    y: y,
    type: randomSize,
    vy: gravity * 2,
    };
    return fruit;
}

function gameLoop() {
    updateFruits();
    checkCollision();
    drawFruits();
    if (!gameover) requestAnimationFrame(gameLoop);
}

// ゲームループを開始
gameLoop();