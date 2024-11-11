const canvas = document.getElementById("gameCanvas");
const context = canvas.getContext("2d");

// Paddle settings
const paddleWidth = 10;
const paddleHeight = 100;
const paddleSpeed = 6;
const paddleX = 20;
let paddleY = (canvas.height - paddleHeight) / 2;

// CPU Paddle settings
const cpuPaddleX = canvas.width - paddleX - paddleWidth;
let cpuPaddleY = (canvas.height - paddleHeight) / 2;
const cpuPaddleSpeed = 4; // CPUの移動速度

// Ball settings
const ballSize = 10;
let balls = [
  { x: canvas.width / 2, y: canvas.height / 2, speedX: 5, speedY: 5 }
];

// Score
let score = 0;
let cpuScore = 0;

// Draw Player Paddle
function drawPaddle() {
  context.fillStyle = "#fff";
  context.fillRect(paddleX, paddleY, paddleWidth, paddleHeight);
}

// Draw CPU Paddle
function drawCpuPaddle() {
  context.fillStyle = "#fff";
  context.fillRect(cpuPaddleX, cpuPaddleY, paddleWidth, paddleHeight);
}

// Draw Balls
function drawBalls() {
  balls.forEach(ball => {
    context.fillStyle = "#fff";
    context.beginPath();
    context.arc(ball.x, ball.y, ballSize, 0, Math.PI * 2);
    context.fill();
  });
}

// Draw Score
function drawScore() {
  context.font = "20px Arial";
  context.fillStyle = "#fff";
  context.fillText(`Player: ${score}`, 20, 30);
  context.fillText(`CPU: ${cpuScore}`, canvas.width - 100, 30);
}

// Update Ball Position
function updateBalls() {
    balls.forEach((ball, index) => {
      ball.x += ball.speedX;
      ball.y += ball.speedY;
  
      // 上下の壁に当たったときの反転
      if (ball.y + ballSize > canvas.height || ball.y - ballSize < 0) {
        ball.speedY = -ball.speedY;
      }
  
      // プレイヤーのパドルに当たったときの反転
      if (
        ball.x - ballSize < paddleX + paddleWidth &&
        ball.x > paddleX &&
        ball.y > paddleY &&
        ball.y < paddleY + paddleHeight
      ) {
        let deltaY = ball.y - (paddleY + paddleHeight / 2);
        ball.speedY = deltaY * 0.3;
        ball.speedX = -ball.speedX;
        score++;
      }
  
      // CPUのパドルに当たったときの反転
      if (
        ball.x + ballSize > cpuPaddleX &&
        ball.y > cpuPaddleY &&
        ball.y < cpuPaddleY + paddleHeight
      ) {
        let deltaY = ball.y - (cpuPaddleY + paddleHeight / 2);
        ball.speedY = deltaY * 0.3;
        ball.speedX = -ball.speedX;
        ball.x = cpuPaddleX - ballSize;
        cpuScore++;
      }
  
      // ボールが右端に行った場合、リセットしてプレイヤーに得点
      if (ball.x + ballSize > canvas.width) {
        score++;
        resetBall(index, 'right');
      }
  
      // ボールが左端に行った場合、リセットしてCPUに得点
      if (ball.x - ballSize < 0) {
        cpuScore++;
        resetBall(index, 'left');
      }
    });
  }
  
  function resetBall(index, side) {
    // ボールをリセット
    balls[index] = {
      x: canvas.width / 2,
      y: canvas.height / 2,
      speedX: 5 * (side === 'right' ? 1 : -1), // 右端なら右方向、左端なら左方向
      speedY: 5 * (2 * Math.random() - 1), // ランダムなY方向
    };

    if (side === 'right' && balls.length < score / 10) {
        balls.push({
            x: canvas.width / 2,
            y: canvas.height / 2,
            speedX: 5 * (Math.random() > 0.5 ? 1 : -1), // ランダムな方向
            speedY: 5 * (2 * Math.random() - 1), // ランダムなY方向
        });
    }
}

// Update Player Paddle Position
function updatePaddle(event) {
  const rect = canvas.getBoundingClientRect();
  const root = document.documentElement;
  const mouseY = event.clientY - rect.top - root.scrollTop;
  paddleY = mouseY - paddleHeight / 2;

  if (paddleY < 0) paddleY = 0;
  if (paddleY + paddleHeight > canvas.height) paddleY = canvas.height - paddleHeight;
}

// Update CPU Paddle Position
function updateCpuPaddle() {
    // 最も近いボールを追跡
    let closestBall = balls.reduce((closest, ball) => {
      // Y軸の距離を計算
      let distance = Math.abs(ball.x - (cpuPaddleX + paddleWidth / 2));
      return distance < Math.abs(closest.x - (cpuPaddleX + paddleWidth / 2)) ? ball : closest;
    });
    console.log(closestBall);
  
    // 最も近いボールの位置に基づいてCPUパドルを移動
    if (closestBall.y < cpuPaddleY + paddleHeight / 2) {
      cpuPaddleY -= cpuPaddleSpeed;
    } else if (closestBall.y > cpuPaddleY + paddleHeight / 2) {
      cpuPaddleY += cpuPaddleSpeed;
    }
  
    // 画面の端を超えないようにする
    if (cpuPaddleY < 0) cpuPaddleY = 0;
    if (cpuPaddleY + paddleHeight > canvas.height) cpuPaddleY = canvas.height - paddleHeight;
  }

// Game Loop
function gameLoop() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  drawPaddle();
  drawCpuPaddle();
  drawBalls();
  drawScore();
  updateBalls();
  updateCpuPaddle();

  requestAnimationFrame(gameLoop);
}

// Mouse Movement Listener
canvas.addEventListener("mousemove", updatePaddle);

// Start the game
gameLoop();