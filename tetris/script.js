const rows = 20;
const cols = 10;
const board = createEmptyBoard(rows, cols);
let score = 0;
let gameOver = false;
let lastTime = 0;
let dropInterval = 1000; // Initial drop interval in milliseconds

function createEmptyBoard(rows, cols) {
    return Array.from({ length: rows }, () => Array(cols).fill(0));
}

function drawBoard() {
    const gameBoard = document.getElementById('game-board');
    gameBoard.innerHTML = '';

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.style.backgroundColor = getColor(board[row][col]);
            gameBoard.appendChild(cell);
        }
    }
}

function drawNextPiece(piece) {
    const nextPieceArea = document.getElementById('next-piece');
    nextPieceArea.innerHTML = '';

    const rows = piece.shape.length;
    const cols = piece.shape[0].length;

    for (let rowIndex = 0; rowIndex < 2; rowIndex++) {
    for (let colIndex = 0; colIndex < 4; colIndex++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        const value = rowIndex < rows && colIndex < cols ? piece.shape[rowIndex][colIndex] : 0;
        cell.style.backgroundColor = getColor(value);
        nextPieceArea.appendChild(cell);
    }
    }
}


function getColor(value) {
    if (value === 1) return '#333'; // Active piece color
    if (value === 2) return '#33f'; // Frozen piece color
    return 'transparent';
}

function drawPiece(piece) {
    piece.shape.forEach((row, rowIndex) => {
        row.forEach((value, colIndex) => {
        if (value !== 0) {
            const rowPos = piece.y + rowIndex;
            const colPos = piece.x + colIndex;
            board[rowPos][colPos] = 1;
        }
        });
    });
}

function clearPiece(piece) {
    piece.shape.forEach((row, rowIndex) => {
        row.forEach((value, colIndex) => {
        if (value !== 0) {
            const rowPos = piece.y + rowIndex;
            const colPos = piece.x + colIndex;
            board[rowPos][colPos] = 0;
        }
        });
    });
}

function movePieceDown(piece) {
    clearPiece(piece);
    piece.y++;

    if (!pieceCollides(piece)) {
        drawPiece(piece);
    } else {
        piece.y--;
        drawPiece(piece);
        freezePiece(piece);
        checkForCompletedLines();
        spawnNewPiece();
        if (pieceCollides(currentPiece)) {
        gameOver = true;
        document.getElementById('game-over').style.display = 'block';
        }
    }
}

function movePieceLeft(piece) {
    clearPiece(piece);
    piece.x--;
    if (!pieceCollides(piece)) {
        drawPiece(piece);
    } else {
        piece.x++;
        drawPiece(piece);
    }
}

function movePieceRight(piece) {
    clearPiece(piece);
    piece.x++;
    if (!pieceCollides(piece)) {
        drawPiece(piece);
    } else {
        piece.x--;
        drawPiece(piece);
    }
}

function rotatePiece(piece) {
    clearPiece(piece);
    piece.rotate();
    if (!pieceCollides(piece)) {
        drawPiece(piece);
    } else {
        piece.rotate();
        piece.rotate();
        piece.rotate();
        drawPiece(piece);
    }
}

function pieceCollides(piece) {
    return piece.shape.some((row, rowIndex) =>
        row.some((value, colIndex) => {
        const rowPos = piece.y + rowIndex;
        const colPos = piece.x + colIndex;
        return value !== 0 && (board[rowPos] && board[rowPos][colPos]) !== 0;
        })
    );
}

function freezePiece(piece) {
    piece.shape.forEach((row, rowIndex) => {
        row.forEach((value, colIndex) => {
        if (value !== 0) {
            const rowPos = piece.y + rowIndex;
            const colPos = piece.x + colIndex;
            board[rowPos][colPos] = 2; // Mark frozen cells with a different value
        }
        });
    });
}

function checkForCompletedLines() {
    for (let row = rows - 1; row >= 0; row--) {
        if (board[row].every(cell => cell === 2)) {
            // Completed line
            score += 100;
            document.getElementById('score').innerText = `Score: ${score}`;
            // Remove the completed line and move all lines above it down
            board.splice(row, 1);
            board.unshift(Array(cols).fill(0));
            row++;
        }
    }
}

function spawnNewPiece() {
    currentPiece = new Piece(nextPiece.shape); // Use the next piece
    nextPiece = new Piece(pieces[Math.floor(Math.random() * pieces.length)]); // Generate a new next piece
    drawNextPiece(nextPiece);
    if (pieceCollides(currentPiece)) {
        gameOver = true;
        document.getElementById('game-over').style.display = 'block';
    }
}

class Piece {
    constructor(shape) {
        this.shape = shape;
        this.x = Math.floor(cols / 2) - Math.floor(shape[0].length / 2);
        this.y = 0;
    }

    rotate() {
        this.shape = this.shape[0].map((_, i) => this.shape.map(row => row[i])).reverse();
    }
}

const pieces = [
    [[1, 1, 1, 1]],
    [[1, 1, 1], 
     [1, 0, 0]],
    [[1, 1, 1], 
     [0, 0, 1]],
    [[1, 1, 0], 
     [0, 1, 1]],
    [[0, 1, 1], 
     [1, 1, 0]],
    [[1, 1, 1],
     [0, 1, 0]],
    [[1, 1],
     [1, 1]],
    [[1, 1, 1],
     [0, 1, 0]]
];

let currentPiece = new Piece(pieces[Math.floor(Math.random() * pieces.length)]);
let nextPiece = new Piece(pieces[Math.floor(Math.random() * pieces.length)]);
drawNextPiece(nextPiece);

document.addEventListener('keydown', (event) => {
    if (!gameOver) {
        if (event.key === 'ArrowDown') {
            movePieceDown(currentPiece);   
        } else if (event.key === 'ArrowLeft') {
            movePieceLeft(currentPiece);
        } else if (event.key === 'ArrowRight') {
            movePieceRight(currentPiece);
        } else if (event.key === 'ArrowUp') {
            rotatePiece(currentPiece);
        }
    }
});

const gameContainer = document.getElementById('game-container');

gameContainer.addEventListener('touchstart', (e) => {
    const touchX = e.changedTouches[0].clientX - gameContainer.getBoundingClientRect().left;
    const touchY = e.changedTouches[0].clientY - gameContainer.getBoundingClientRect().top;

    const containerWidth = gameContainer.clientWidth;
    const containerHeight = gameContainer.clientHeight;

    const rotationArea = containerHeight / 3; // 上部 1/3 が回転
    const moveDownArea = containerHeight * 2 / 3; // 下部 1/3 が下移動

    if (touchY < rotationArea) {
        // 上部 (回転エリア) をタップした場合
        rotatePiece(currentPiece);
    }else if(touchY > moveDownArea){
        movePieceDown(currentPiece);
    } else {
        // 下部 (移動エリア) をタップした場合
        if (touchX > containerWidth / 2) {
            // 右半分をタップした場合
            movePieceRight(currentPiece);
        } else {
            // 左半分をタップした場合
            movePieceLeft(currentPiece);
        }
    }
});

function gameLoop(timestamp) {
    if (!gameOver) {
        const deltaTime = timestamp - lastTime;

        if (deltaTime > dropInterval) {
            movePieceDown(currentPiece);
            lastTime = timestamp;
        }

        drawBoard();
        requestAnimationFrame(gameLoop);
    }
}

gameLoop();