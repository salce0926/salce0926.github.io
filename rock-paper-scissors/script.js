const ws = new WebSocket('ws://nodepractice-e56g.onrender.com/');

    ws.addEventListener('open', (event) => {
      console.log('WebSocket connection opened');
    });

    ws.addEventListener('message', (event) => {
      const { result } = JSON.parse(event.data);
      displayResult(result);
    });

    async function playGame() {
      const playerChoice = document.getElementById('choice').value;

      ws.send(JSON.stringify({ playerChoice }));
    }

    function displayResult(result) {
      const resultElement = document.getElementById('result');
      resultElement.textContent = result;
    }