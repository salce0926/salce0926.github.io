let blinds = [
    {small: 100, big: 200},
    {small: 200, big: 400},
    {small: 300, big: 600},
    {small: 400, big: 800},
    {small: 500, big: 1000},
    {small: 700, big: 1400},
    {small: 1000, big: 2000},
    {small: 1500, big: 3000},
    {small: 2000, big: 4000},
    {small: 3000, big: 6000},
    {small: 5000, big: 10000},
    {small: 7000, big: 14000},
    {small: 10000, big: 20000},
    {small: 15000, big: 30000},
    {small: 20000, big: 40000},
    {small: 30000, big: 60000},
    {small: 40000, big: 80000},
    {small: 50000, big: 100000},
];

let currentLevel = 0;
let timer;
let blindInterval = 10; // デフォルトのブラインド間隔は10分
let timeLeft;

function startTimer() {
    const intervalInput = document.getElementById('blind-interval');
    blindInterval = parseInt(intervalInput.value, 10) || 10;
    timeLeft = blindInterval * 60;
    
    if (timer) {
        clearInterval(timer);
    }
    timer = setInterval(updateTimer, 1000);
    updateDisplay();
    playSound('money');
}

function resetTimer() {
    clearInterval(timer);
    currentLevel = 0;
    timeLeft = blindInterval * 60;
    document.getElementById('timer').textContent = '00:00';
    document.getElementById('small-blind').textContent = '100';
    document.getElementById('big-blind').textContent = '200';
}

function skipTime(seconds) {
    timeLeft -= seconds;
    if (timeLeft < 0) {
        timeLeft = 0;
    }
    updateDisplay();
}

function updateTimer() {
    if (timeLeft > 1) {
        timeLeft--;
        console.log(timeLeft);
        if (timeLeft <= 5 && timeLeft >= 1) {
            playPonSound(timeLeft);
        }
    } else {
        currentLevel++;
        if (currentLevel >= blinds.length) {
            clearInterval(timer);
            alert("全てのブラインドレベルが終了しました。");
            return;
        }
        playSound('pop');
        timeLeft = blindInterval * 60;
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

function playSound(soundId) {
    const sound = document.getElementById(soundId);
    if (sound) {
        sound.play();
    }
}

function playPonSound(id) {
    const soundId = `pon-${id % 2}`;
    const sound = document.getElementById(soundId);
    if (sound) {
        sound.currentTime = 0;
        sound.play();
    }
}

function openPopup() {
    document.getElementById('popup').style.display = 'flex';
}

function closePopup() {
    document.getElementById('popup').style.display = 'none';
    const intervalInput = document.getElementById('blind-interval');
    blindInterval = parseInt(intervalInput.value, 10) || 10;
    timeLeft = blindInterval * 60;
    updateDisplay();
}

// ページが読み込まれた時にリセットを実行
window.onload = resetTimer;
