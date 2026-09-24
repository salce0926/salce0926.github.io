// script.js

document.addEventListener('DOMContentLoaded', () => {
    const gridDisplay = document.querySelector('#game-board');
    const scoreDisplay = document.querySelector('#score');
    const undoButton = document.querySelector('#undo-button');
    let tiles = [];
    let width = 4;
    let score = 0;
    let previousState = [];
    let previousScore = 0;

    function updateScore(points) {
        score += points;
        scoreDisplay.textContent = `Score: ${score}`;
    }

    // 前の状態を保存
    function saveState() {
        previousState = tiles.map(tile => tile.textContent);
        previousScore = score;
    }

    // 状態を復元（盤面とスコアを1手前に戻す）
    function undoMove() {
        if (previousState.length) {
            for (let i = 0; i < tiles.length; i++) {
                tiles[i].textContent = previousState[i];
            }
            score = previousScore;
            scoreDisplay.textContent = `Score: ${score}`;
            updateTileColors(); // タイルの色を更新
        }
    }

    // 初期タイルを作成
    function createBoard() {
        for (let i = 0; i < width * width; i++) {
            const tile = document.createElement('div');
            tile.classList.add('tile');
            tile.textContent = ''; // タイルの初期値を空に設定
            gridDisplay.appendChild(tile);
            tiles.push(tile);
        }
        // // ゲームの初期化時に呼び出し
        // createDebugTile(4, 0);
        // createDebugTile(8, 1);
        // createDebugTile(16, 2);
        // createDebugTile(32, 3);
        // createDebugTile(64, 4);
        // createDebugTile(128, 5);
        // createDebugTile(256, 6);
        // createDebugTile(512, 7);
        // createDebugTile(1024, 8);
        // createDebugTile(2048, 9);
        // createDebugTile(4096, 10);
        // createDebugTile(8192, 11);
        // createDebugTile(16384, 12);
        // createDebugTile(32768, 13);
        // createDebugTile(65536, 14);
        // createDebugTile(131072, 15);
        generateRandomTile();
        generateRandomTile();
    }

    // タイルを右に移動する
    function moveRight() {
        for (let i = 0; i < width * width; i++) {
            if (i % width === 0) {
                let row = [
                    parseInt(tiles[i].textContent) || 0,
                    parseInt(tiles[i + 1].textContent) || 0,
                    parseInt(tiles[i + 2].textContent) || 0,
                    parseInt(tiles[i + 3].textContent) || 0
                ];
                let filteredRow = row.filter(num => num);
                let missing = width - filteredRow.length;
                let zeros = Array(missing).fill(0);
                let newRow = zeros.concat(filteredRow);

                tiles[i].textContent = newRow[0] || '';
                tiles[i + 1].textContent = newRow[1] || '';
                tiles[i + 2].textContent = newRow[2] || '';
                tiles[i + 3].textContent = newRow[3] || '';
            }
        }
    }

    // タイルを左に移動する
    function moveLeft() {
        for (let i = 0; i < width * width; i++) {
            if (i % width === 0) {
                let row = [
                    parseInt(tiles[i].textContent) || 0,
                    parseInt(tiles[i + 1].textContent) || 0,
                    parseInt(tiles[i + 2].textContent) || 0,
                    parseInt(tiles[i + 3].textContent) || 0
                ];
                let filteredRow = row.filter(num => num);
                let missing = width - filteredRow.length;
                let zeros = Array(missing).fill(0);
                let newRow = filteredRow.concat(zeros);

                tiles[i].textContent = newRow[0] || '';
                tiles[i + 1].textContent = newRow[1] || '';
                tiles[i + 2].textContent = newRow[2] || '';
                tiles[i + 3].textContent = newRow[3] || '';
            }
        }
    }

    // タイルを上に移動する
    function moveUp() {
        for (let i = 0; i < width; i++) {
            let column = [
                parseInt(tiles[i].textContent) || 0,
                parseInt(tiles[i + width].textContent) || 0,
                parseInt(tiles[i + width * 2].textContent) || 0,
                parseInt(tiles[i + width * 3].textContent) || 0
            ];
            let filteredColumn = column.filter(num => num);
            let missing = width - filteredColumn.length;
            let zeros = Array(missing).fill(0);
            let newColumn = filteredColumn.concat(zeros);

            tiles[i].textContent = newColumn[0] || '';
            tiles[i + width].textContent = newColumn[1] || '';
            tiles[i + width * 2].textContent = newColumn[2] || '';
            tiles[i + width * 3].textContent = newColumn[3] || '';
        }
    }

    // タイルを下に移動する
    function moveDown() {
        for (let i = 0; i < width; i++) {
            let column = [
                parseInt(tiles[i].textContent) || 0,
                parseInt(tiles[i + width].textContent) || 0,
                parseInt(tiles[i + width * 2].textContent) || 0,
                parseInt(tiles[i + width * 3].textContent) || 0
            ];
            let filteredColumn = column.filter(num => num);
            let missing = width - filteredColumn.length;
            let zeros = Array(missing).fill(0);
            let newColumn = zeros.concat(filteredColumn);

            tiles[i].textContent = newColumn[0] || '';
            tiles[i + width].textContent = newColumn[1] || '';
            tiles[i + width * 2].textContent = newColumn[2] || '';
            tiles[i + width * 3].textContent = newColumn[3] || '';
        }
    }

    // 数字を結合する（移動方向の端に近いペアから結合する）
    function combineRow(dir) {
        for (let r = 0; r < width; r++) {
            for (let k = 0; k < width - 1; k++) {
                const c = dir === 'right' ? width - 1 - k : k;
                const i = r * width + c;
                const j = dir === 'right' ? i - 1 : i + 1;
                if (tiles[i].textContent !== '' && tiles[i].textContent === tiles[j].textContent) {
                    let combinedTotal = parseInt(tiles[i].textContent) + parseInt(tiles[j].textContent);
                    tiles[i].textContent = combinedTotal;
                    tiles[j].textContent = '';
                    updateScore(combinedTotal); // スコアを更新
                }
            }
        }
    }

    function combineColumn(dir) {
        for (let c = 0; c < width; c++) {
            for (let k = 0; k < width - 1; k++) {
                const r = dir === 'down' ? width - 1 - k : k;
                const i = r * width + c;
                const j = dir === 'down' ? i - width : i + width;
                if (tiles[i].textContent !== '' && tiles[i].textContent === tiles[j].textContent) {
                    let combinedTotal = parseInt(tiles[i].textContent) + parseInt(tiles[j].textContent);
                    tiles[i].textContent = combinedTotal;
                    tiles[j].textContent = '';
                    updateScore(combinedTotal); // スコアを更新
                }
            }
        }
    }

    function updateTileColors() {
        tiles.forEach(tile => {
            const value = tile.textContent;
            tile.setAttribute('data-value', value);
        });
    }
    
    // タイルを生成する関数の修正
    function generateRandomTile() {
        let emptyTiles = tiles.filter(tile => tile.textContent === '');
        if (emptyTiles.length === 0) return; // 空のタイルがなければ終了
    
        const randomIndex = Math.floor(Math.random() * emptyTiles.length);
        emptyTiles[randomIndex].textContent = '2';
        updateTileColors(); // タイルの色を更新
        checkForGameOver();
    }
    
    // 指定方向に移動・合体する（キー操作とスワイプ操作で共通）
    function move(direction) {
        // 盤面が動かなかった場合は1手前の状態を残しておく
        const lastState = previousState;
        const lastScore = previousScore;
        saveState(); // 移動前の状態を保存
        if (direction === 'right') {
            moveRight();
            combineRow('right');
            moveRight();
        } else if (direction === 'left') {
            moveLeft();
            combineRow('left');
            moveLeft();
        } else if (direction === 'up') {
            moveUp();
            combineColumn('up');
            moveUp();
        } else if (direction === 'down') {
            moveDown();
            combineColumn('down');
            moveDown();
        }
        if (previousState.join() !== tiles.map(tile => tile.textContent).join()) {
            generateRandomTile();
        } else {
            previousState = lastState;
            previousScore = lastScore;
        }
        updateTileColors(); // タイルの色を更新
    }

    const keyDirections = {
        ArrowRight: 'right',
        ArrowLeft: 'left',
        ArrowUp: 'up',
        ArrowDown: 'down'
    };

    // キー入力に応じて移動
    function control(e) {
        const direction = keyDirections[e.key];
        if (!direction) return;
        e.preventDefault(); // 矢印キーでページがスクロールしないようにする
        move(direction);
    }
    document.addEventListener('keydown', control);

    // スワイプ入力に応じて移動
    const minSwipeDistance = 30;
    let touchStartX = null;
    let touchStartY = null;

    gridDisplay.addEventListener('touchstart', e => {
        if (e.touches.length !== 1) {
            touchStartX = null;
            return;
        }
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }, { passive: true });

    // スワイプ中に画面がスクロールしないようにする
    gridDisplay.addEventListener('touchmove', e => {
        e.preventDefault();
    }, { passive: false });

    gridDisplay.addEventListener('touchend', e => {
        if (touchStartX === null) return;
        const dx = e.changedTouches[0].clientX - touchStartX;
        const dy = e.changedTouches[0].clientY - touchStartY;
        touchStartX = null;
        if (Math.max(Math.abs(dx), Math.abs(dy)) < minSwipeDistance) return;
        if (Math.abs(dx) > Math.abs(dy)) {
            move(dx > 0 ? 'right' : 'left');
        } else {
            move(dy > 0 ? 'down' : 'up');
        }
    });


    function checkForGameOver() {
        // 空のタイルが存在する場合はゲームオーバーではない
        if (tiles.some(tile => tile.textContent === '')) {
            return;
        }
    
        // 各方向に移動できるか確認
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                let currentValue = parseInt(tiles[i * 4 + j].textContent);
                
                // 右方向に移動できるか
                if (j < 3 && currentValue === parseInt(tiles[i * 4 + j + 1].textContent)) {
                    return;
                }
                
                // 下方向に移動できるか
                if (i < 3 && currentValue === parseInt(tiles[(i + 1) * 4 + j].textContent)) {
                    return;
                }
            }
        }
    
        // 上下左右どの方向にも移動できない場合はゲームオーバー
        alert('Game Over!');
    }
    undoButton.addEventListener('click', undoMove);

    // 特定のタイルを手動で生成
    function createDebugTile(value, position) {
        tiles[position].textContent = value;
        tiles[position].dataset.value = value; // 色を適用するためにdata属性も設定
        updateTileColors(); // 色を更新
    }

    createBoard();
});