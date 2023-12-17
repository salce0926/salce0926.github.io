// ゲームの状態を管理する変数
let tiles = [1, 2, 3, 4, 5, 6, 7, 8, 9];
let selectedTiles = [];
let closedTiles = [];
let rollSum = 0;
let gameOver = false;
let log = "";

let canRoll = true; // ロールの許可フラグ

// サイコロを振る処理
function rollDice() {
    if (gameOver || !canRoll) return; // ゲームオーバーまたはロール不可の場合は処理しない

    let dice1 = Math.floor(Math.random() * 6) + 1;
    let dice2 = Math.floor(Math.random() * 6) + 1;
    rollSum = dice1 + dice2;

    let resultMessage = document.getElementById('resultMessage');
    resultMessage.innerHTML = `Roll: ${dice1} + ${dice2} = ${rollSum}<br>`;
    log += `Roll: ${dice1} + ${dice2} = ${rollSum}<br>`;
    updateLogDisplay();

    canRoll = false; // ロール後はロール不可にする
}

// タイルの選択/非選択を切り替える処理
function toggleTile(tile) {
    if (gameOver) return;

    let tileButton = document.getElementById(`tile${tile}`);
    if (!tileButton.classList.contains('selected') && !tileButton.classList.contains('disabled')) {
        tileButton.classList.toggle('selected');
        selectedTiles.push(tile);
        console.log(`Button ${tile} selected.`);
        log += `Button ${tile} selected.<br>`;
    } else {
        let index = selectedTiles.indexOf(tile);
        if (index !== -1) {
            selectedTiles.splice(index, 1);
        }
        tileButton.classList.toggle('selected');
        console.log(`Button ${tile} deselected.`);
        log += `Button ${tile} deselected.<br>`;
    }
    updateLogDisplay();
}

// タイルの表示を更新する処理
function updateTilesDisplay() {
    let tilesContainer = document.getElementById('tilesContainer');
    tilesContainer.innerHTML = '';

    tiles.forEach(tile => {
        let button = document.createElement('button');
        button.textContent = tile;
        button.id = `tile${tile}`;
        button.className = 'tileButton';
        button.onclick = () => toggleTile(tile);
        tilesContainer.appendChild(button);

        if (selectedTiles.includes(tile)) {
            button.classList.add('selected');
        }

        if (closedTiles.includes(tile)) {
            button.classList.add('selected', 'disabled');
        }

        if (tiles.length === 0 || closedTiles.includes(tile)) {
            button.classList.add('disabled');
        }
    });
}

// 選択されたタイルの組み合わせを確認する処理
function checkCombination() {
    if (gameOver) return;

    let resultMessage = document.getElementById('resultMessage');

    let selectedSum = selectedTiles.reduce((acc, val) => acc + val, 0);
    if (selectedSum === rollSum) {
        resultMessage.innerHTML += `Selected Tiles: ${selectedTiles.join(', ')}<br>`;
        log += `Selected Tiles: ${selectedTiles.join(', ')}<br>`;
        closeSelectedTiles();
        updateTilesDisplay(); // クローズ後に盤面を更新
        canRoll = true; // クローズ後にロール可能にする

        // ゲームクリア判定: 選択可能なタイルが残っていない場合
        if (getAvailableTiles().length === 0) {
            let score = closedTiles.reduce((acc, val) => acc + val, 0);
            resultMessage.innerHTML += `You win! Score: ${score}`;
            log += `You win! Score: ${score}<br>`;
            gameOver = true;
        }
    } else {
        resultMessage.innerHTML += `Invalid combination. Game over. Score: ${closedTiles.reduce((acc, val) => acc + val, 0)}`;
        log += `Invalid combination. Game over. Score: ${closedTiles.reduce((acc, val) => acc + val, 0)}<br>`;
        gameOver = true;
    }

    // 選択されたタイルのリセット
    selectedTiles = [];
    updateLogDisplay();
}

// 使用可能なタイルを取得する処理
function getAvailableTiles() {
    return tiles.filter(tile => !closedTiles.includes(tile));
}

// 選択されたタイルをクローズする処理
function closeSelectedTiles() {
    selectedTiles.forEach(tile => {
        closedTiles.push(tile);
    });
}

// ログ表示を更新する処理
function updateLogDisplay() {
    let logContainer = document.getElementById('logContainer');
    logContainer.innerHTML = log;
}

// 初回の盤面表示
document.body.onload = updateTilesDisplay;