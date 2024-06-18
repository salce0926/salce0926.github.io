let blinds = [
    {small: 100, big: 200},
    {small: 200, big: 400},
    {small: 300, big: 600},
    {small: 400, big: 800},
    {small: 500, big: 1000},
    {small: 600, big: 1200},
    {small: 700, big: 1400},
    {small: 800, big: 1600},
    {small: 1000, big: 2000},
    {small: 2000, big: 4000},
    {small: 3000, big: 6000},
    {small: 4000, big: 8000},
    {small: 5000, big: 10000},
    {small: 6000, big: 12000},
    {small: 7000, big: 14000},
    {small: 8000, big: 16000},
    {small: 10000, big: 20000},
    {small: 15000, big: 30000},
    {small: 20000, big: 40000},
    {small: 25000, big: 50000},
    {small: 30000, big: 60000},
    {small: 35000, big: 70000},
    {small: 40000, big: 80000},
    {small: 45000, big: 90000},
    {small: 50000, big: 100000},
    // 追加のブラインドレベルをここに追加できます
];

const defaultTime = 10 * 60; // 10分

let currentLevel = 0;
let timer;
let timeLeft = defaultTime;

function startTimer() {
    if (timer) {
        clearInterval(timer);
    }
    timer = setInterval(updateTimer, 1000);
}

function resetTimer() {
    clearInterval(timer);
    currentLevel = 0;
    timeLeft = defaultTime;
    updateDisplay();
}

function skipTime(seconds) {
    timeLeft -= seconds;
    if (timeLeft < 0) {
        timeLeft = 0;
    }
    updateDisplay();
}

function updateTimer() {
    if (timeLeft > 0) {
        timeLeft--;
    } else {
        currentLevel++;
        if (currentLevel >= blinds.length) {
            clearInterval(timer);
            alert("全てのブラインドレベルが終了しました。");
            return;
        }
        timeLeft = defaultTime;
    }
    updateDisplay();
}

function updateDisplay() {
    let minutes = Math.floor(timeLeft / 60);
    let seconds = timeLeft % 60;
    document.getElementById('timer').textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    document.getElementById('small-blind').textContent = blinds[currentLevel].small;
    document.getElementById('big-blind').textContent = blinds[currentLevel].big;
}

// ページが読み込まれた時にリセットを実行
window.onload = resetTimer;