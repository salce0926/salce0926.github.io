const ws = new WebSocket('wss://nodepractice-e56g.onrender.com/');

ws.addEventListener('open', (event) => {
  console.log('WebSocket connection opened');

  // クライアントが接続した際にユーザー名をサーバーに送信
  const username = prompt('Enter your username:');
  ws.send(JSON.stringify({ type: 'join', username }));
});

ws.addEventListener('message', (event) => {
  const data = JSON.parse(event.data);

  if (data.type === 'userList') {
    // サーバーからのユーザーリストを受信したときの処理
    const usernames = data.usernames;
    console.log('User list:', usernames);
  } else {
    // じゃんけんの結果などの他のメッセージの処理
    const { result } = data;
    displayResult(result);
  }
});

async function playGame() {
  const playerChoice = document.getElementById('choice').value;

  // じゃんけんの手をサーバーに送信
  ws.send(JSON.stringify({ type: 'game', playerChoice }));
}

function displayResult(result) {
  const resultElement = document.getElementById('result');
  resultElement.textContent = result;
}