let ws = new WebSocket('wss://nodepractice-e56g.onrender.com/');
let username = null;

ws.addEventListener('open', (event) => {
  console.log('WebSocket connection opened');
  
  // ユーザーが参加したことをサーバーに通知
  username = prompt('Enter your username:');
    ws.send(JSON.stringify({ type: 'join', username }));
  });

  ws.addEventListener('message', (event) => {
    const data = JSON.parse(event.data);

    if (data.type === 'userList') {
      // ユーザーリストを表示
      displayUserList(data.usernames);
    } else if (data.type === 'choicesList') {
      // ユーザーのじゃんけんの手を表示
      displayChoicesList(data.userChoices);
    } else if (data.result) {
      // じゃんけんの結果を表示
      displayResult(data.result);
    }
  });

  ws.addEventListener('close', (event) => {
    console.log('WebSocket connection closed');

    // クリーンアップ
    ws = null;
    username = null;
    displayUserList([]);
  });

async function playGame() {
  const playerChoice = document.getElementById('choice').value;

  if (!ws || ws.readyState !== WebSocket.OPEN) {
    alert('WebSocket connection is not open.');
    return;
  }

  ws.send(JSON.stringify({ type: 'game', username, playerChoice }));
}

function displayUserList(usernames) {
  const userListElement = document.getElementById('userList');
  userListElement.innerHTML = '';

  usernames.forEach((name) => {
    const listItem = document.createElement('li');
    listItem.textContent = name;
    userListElement.appendChild(listItem);
  });
}

function displayChoicesList(userChoices) {
  const choicesListElement = document.getElementById('choicesList');
  choicesListElement.innerHTML = '';

  userChoices.forEach(([name, choice]) => {
    const listItem = document.createElement('li');
    listItem.textContent = `${name}: ${choice}`;
    choicesListElement.appendChild(listItem);
  });
}

function displayResult(result) {
  const resultElement = document.getElementById('result');
  resultElement.textContent = result;
}
