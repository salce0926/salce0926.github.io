let maxDigits = 4;
let digitRange = 9;
let playerAnswer, cpuAnswer;
let possibleAnswers, previousGuesses;

function generateAnswer(maxDigits, digitRange) {
    let digits = [];
    while (digits.length < maxDigits) {
        let randomDigit = Math.floor(Math.random() * (digitRange + 1));
        if (!digits.includes(randomDigit)) {
            digits.push(randomDigit);
        }
    }
    return digits.join('');
}

function getHitsAndBlows(answer, guess) {
    let hits = 0;
    let blows = 0;

    for (let i = 0; i < guess.length; i++) {
        if (guess[i] === answer[i]) {
            hits++;
        } else if (answer.includes(guess[i])) {
            blows++;
        }
    }
    return { hits, blows };
}

function generateAllPossibleAnswers(maxDigits, digitRange) {
    let answers = [];
    function generate(current) {
        if (current.length === maxDigits) {
            answers.push(current);
            return;
        }
        for (let i = 0; i <= digitRange; i++) {
            if (!current.includes(i.toString())) {
                generate(current + i.toString());
            }
        }
    }
    generate('');
    return answers;
}

function filterAnswers(answers, guess, hits, blows) {
    return answers.filter(answer => {
        const { hits: h, blows: b } = getHitsAndBlows(answer, guess);
        return h === hits && b === blows;
    });
}

function calculateEntropy(possibleAnswers, guess) {
    const outcomes = {};

    for (const answer of possibleAnswers) {
        const { hits, blows } = getHitsAndBlows(answer, guess);
        const outcome = `${hits}-${blows}`;
        if (outcomes[outcome]) {
            outcomes[outcome]++;
        } else {
            outcomes[outcome] = 1;
        }
    }

    let entropy = 0;
    const total = possibleAnswers.length;
    for (const count of Object.values(outcomes)) {
        const p = count / total;
        entropy -= p * Math.log2(p);
    }

    return entropy;
}

// ---- 画面 ----

const $ = id => document.getElementById(id);

let currentInput = '';
let gameOver = false;
let turn = 0;

function tile(digit, cls = '') {
    const d = document.createElement('div');
    d.className = 'd' + (cls ? ' ' + cls : '');
    d.textContent = digit;
    return d;
}

// answer に対して、各桁が HIT / BLOW / はずれ のどれかを返す
function marks(answer, guess) {
    return [...guess].map((c, i) => (c === answer[i] ? 'hit' : answer.includes(c) ? 'blow' : ''));
}

function makeRow(guess, hits, blows, answerForColor) {
    const row = document.createElement('div');
    row.className = 'row' + (hits === maxDigits ? ' win' : '');
    row.style.setProperty('--n', maxDigits);
    row.dataset.guess = guess;
    const tiles = document.createElement('div');
    tiles.className = 'tiles';
    const m = answerForColor ? marks(answerForColor, guess) : [];
    [...guess].forEach((c, i) => tiles.appendChild(tile(c, m[i])));
    const res = document.createElement('div');
    res.className = 'res';
    res.innerHTML = hits === maxDigits
        ? `<b class="h">${hits} HIT!</b>`
        : `<b class="h">${hits} HIT</b><b class="b">${blows} BLOW</b>`;
    row.append(tiles, res);
    return row;
}

function renderSecret(el, value, hidden) {
    el.innerHTML = '';
    [...value].forEach(c => el.appendChild(tile(hidden ? '?' : c, hidden ? 'hidden' : '')));
}

function renderInput() {
    const row = $('inputRow');
    row.innerHTML = '';
    row.style.setProperty('--n', maxDigits);
    const tiles = document.createElement('div');
    tiles.className = 'tiles';
    for (let i = 0; i < maxDigits; i++) {
        tiles.appendChild(i < currentInput.length ? tile(currentInput[i]) : tile('', 'empty'));
    }
    row.appendChild(tiles);
    // 同じ数字は使えないので、入れた数字のキーは押せなくする
    document.querySelectorAll('#keypad .num').forEach(b => {
        b.disabled = gameOver || currentInput.includes(b.dataset.d) || currentInput.length >= maxDigits;
    });
    $('goBtn').disabled = gameOver || currentInput.length !== maxDigits;
    $('delBtn').disabled = gameOver || currentInput.length === 0;
}

function buildKeypad() {
    const pad = $('keypad');
    pad.innerHTML = '';
    for (let i = 0; i <= digitRange; i++) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'num';
        b.dataset.d = String(i);
        b.textContent = i;
        b.addEventListener('click', () => typeDigit(String(i)));
        pad.appendChild(b);
    }
    const del = document.createElement('button');
    del.type = 'button';
    del.id = 'delBtn';
    del.className = 'del';
    del.textContent = '⌫';
    del.setAttribute('aria-label', '1文字消す');
    del.addEventListener('click', deleteDigit);
    const go = document.createElement('button');
    go.type = 'button';
    go.id = 'goBtn';
    go.className = 'go';
    go.textContent = '推測';
    go.addEventListener('click', submitGuess);
    pad.append(del, go);
}

function typeDigit(c) {
    if (gameOver || currentInput.length >= maxDigits || currentInput.includes(c) || Number(c) > digitRange) return;
    currentInput += c;
    $('inputError').textContent = '';
    renderInput();
}

function deleteDigit() {
    if (gameOver) return;
    currentInput = currentInput.slice(0, -1);
    renderInput();
}

function showScreen(name) {
    $('setup').hidden = name !== 'setup';
    $('game').hidden = name !== 'game';
}

function resetGame() {
    playerAnswer = generateAnswer(maxDigits, digitRange);
    cpuAnswer = generateAnswer(maxDigits, digitRange);
    possibleAnswers = generateAllPossibleAnswers(maxDigits, digitRange);
    previousGuesses = [];
    currentInput = '';
    gameOver = false;
    turn = 0;

    renderSecret($('cpuSecret'), cpuAnswer, true);
    renderSecret($('playerSecret'), playerAnswer, false);
    $('playerBoard').innerHTML = '';
    $('cpuBoard').innerHTML = '';
    $('cpuProcess').innerHTML = '';
    $('candidates').textContent = `残り候補 ${possibleAnswers.length.toLocaleString()}`;
    $('banner').hidden = true;
    $('banner').className = 'banner';
    $('inputArea').hidden = false;
    $('endButtons').hidden = true;
    $('inputError').textContent = '';
    buildKeypad();
    renderInput();
    showScreen('game');
}

$('startBtn').addEventListener('click', () => {
    const count = parseInt($('digitCount').value);
    const range = parseInt($('digitRange').value);
    const error = $('setupError');

    if (isNaN(count) || count < 1 || isNaN(range) || range < 1) {
        error.textContent = '桁数と数字の範囲を入力してください。';
        return;
    }

    if (range + 1 < count) {
        error.textContent = `0〜${range}の${range + 1}種類の数字では${count}桁を構成できません。`;
        return;
    }

    // 組み合わせ数 = (digitRange+1)P(maxDigits)。多すぎるとCPUの思考(全候補×全候補)が固まる
    let combinations = 1;
    for (let i = 0; i < count; i++) {
        combinations *= range + 1 - i;
    }
    if (combinations > 50000) {
        error.textContent = `組み合わせが${combinations.toLocaleString()}通りになり、CPUの思考に時間がかかりすぎます。桁数か範囲を小さくしてください。`;
        return;
    }

    error.textContent = '';
    maxDigits = count;
    digitRange = range;
    resetGame();
});

function submitGuess() {
    if (gameOver) return;
    const playerGuess = currentInput;

    if (playerGuess.length !== maxDigits) {
        $('inputError').textContent = `${maxDigits}桁の数字を入力してください。`;
        return;
    }

    turn++;
    const { hits: playerHits, blows: playerBlows } = getHitsAndBlows(cpuAnswer, playerGuess);

    let cpuGuess;
    if (previousGuesses.length === 0) {
        cpuGuess = possibleAnswers[Math.floor(Math.random() * possibleAnswers.length)];
    } else {
        let maxEntropy = -Infinity;
        for (const guess of possibleAnswers) {
            const entropy = calculateEntropy(possibleAnswers, guess);
            if (entropy > maxEntropy) {
                maxEntropy = entropy;
                cpuGuess = guess;
            }
        }
    }

    const { hits: cpuHits, blows: cpuBlows } = getHitsAndBlows(playerAnswer, cpuGuess);
    previousGuesses.push({ guess: cpuGuess, hits: cpuHits, blows: cpuBlows });

    const possibleAnswersCountBefore = possibleAnswers.length;
    possibleAnswers = filterAnswers(possibleAnswers, cpuGuess, cpuHits, cpuBlows);
    const exampleAnswers = possibleAnswers.slice(0, 3).join(', ');

    // あなたの推測は、勝負がつくまで色を付けない（付けるとどの桁が合っているか分かってしまう）
    $('playerBoard').appendChild(makeRow(playerGuess, playerHits, playerBlows, null));
    // CPUの推測は、当てられる側（あなた）の答えで色を付けてよい
    $('cpuBoard').appendChild(makeRow(cpuGuess, cpuHits, cpuBlows, playerAnswer));
    $('candidates').textContent = `残り候補 ${possibleAnswers.length.toLocaleString()}`;

    const cpuProcessDiv = document.createElement('p');
    cpuProcessDiv.textContent = `${turn}手目: ${cpuGuess}（${cpuHits} HIT / ${cpuBlows} BLOW）で候補を ${possibleAnswersCountBefore.toLocaleString()} → ${possibleAnswers.length.toLocaleString()} に絞り込み。例: ${exampleAnswers}`;
    $('cpuProcess').prepend(cpuProcessDiv);

    currentInput = '';

    if (playerHits === maxDigits || cpuHits === maxDigits) {
        finishGame(playerHits === maxDigits, cpuHits === maxDigits);
    } else {
        renderInput();
    }
}

function finishGame(playerWon, cpuWon) {
    gameOver = true;
    const banner = $('banner');
    if (playerWon && cpuWon) {
        banner.textContent = `引き分け！ どちらも${turn}手目で当てました`;
    } else if (playerWon) {
        banner.textContent = `あなたの勝ち！ ${turn}手で当てました`;
        banner.classList.add('win');
    } else {
        banner.textContent = `CPUの勝ち… ${turn}手で当てられました`;
        banner.classList.add('lose');
    }
    banner.hidden = false;

    // 答え合わせ: CPUの答えを開き、あなたの推測に色を付ける
    renderSecret($('cpuSecret'), cpuAnswer, false);
    $('playerBoard').querySelectorAll('.row').forEach(row => {
        const m = marks(cpuAnswer, row.dataset.guess);
        row.querySelectorAll('.d').forEach((d, i) => {
            if (m[i]) d.classList.add(m[i]);
        });
    });

    $('inputArea').hidden = true;
    $('endButtons').hidden = false;
}

$('againBtn').addEventListener('click', resetGame);
$('settingsBtn').addEventListener('click', () => showScreen('setup'));

// キーボードでも入力できる
document.addEventListener('keydown', e => {
    if ($('game').hidden || gameOver) return;
    if (/^[0-9]$/.test(e.key)) {
        typeDigit(e.key);
    } else if (e.key === 'Backspace') {
        e.preventDefault();
        deleteDigit();
    } else if (e.key === 'Enter') {
        e.preventDefault();
        submitGuess();
    }
});

showScreen('setup');
