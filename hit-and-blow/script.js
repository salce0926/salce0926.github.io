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

function resetGame() {
    playerAnswer = generateAnswer(maxDigits, digitRange);
    cpuAnswer = generateAnswer(maxDigits, digitRange);
    console.log(`Player Answer: ${playerAnswer}`);
    console.log(`CPU Answer: ${cpuAnswer}`);
    document.getElementById('playerAnswer').textContent = playerAnswer;
    possibleAnswers = generateAllPossibleAnswers(maxDigits, digitRange);
    previousGuesses = [];
    document.getElementById('results').innerHTML = '';
    document.getElementById('cpuProcess').innerHTML = '';
    document.getElementById('guessInput').value = '';
    document.getElementById('restartBtn').style.display = 'none';
    document.getElementById('inputContainer').style.display = 'block';
}

document.getElementById('startBtn').addEventListener('click', () => {
    maxDigits = parseInt(document.getElementById('digitCount').value);
    digitRange = parseInt(document.getElementById('digitRange').value);

    if (isNaN(maxDigits) || maxDigits < 1 || isNaN(digitRange) || digitRange < 1) {
        alert('桁数と数字の範囲を入力してください。');
        return;
    }

    if (digitRange + 1 < maxDigits) {
        alert(`0〜${digitRange}の${digitRange + 1}種類の数字では${maxDigits}桁を構成できません。`);
        return;
    }

    // 組み合わせ数 = (digitRange+1)P(maxDigits)。多すぎるとCPUの思考(全候補×全候補)が固まる
    let combinations = 1;
    for (let i = 0; i < maxDigits; i++) {
        combinations *= digitRange + 1 - i;
    }
    if (combinations > 50000) {
        alert(`組み合わせが${combinations.toLocaleString()}通りになり、CPUの思考に時間がかかりすぎます。桁数か範囲を小さくしてください。`);
        return;
    }

    document.getElementById('settingsContainer').style.display = 'none';
    document.getElementById('playerAnswerDisplay').style.display = 'block';
    document.getElementById('inputContainer').style.display = 'block';

    document.getElementById('guessInput').setAttribute('maxlength', maxDigits);
    document.getElementById('guessInput').setAttribute('placeholder', `${maxDigits}桁の数字を入力`);

    resetGame();
});

document.getElementById('submitBtn').addEventListener('click', () => {
    const guessInput = document.getElementById('guessInput');
    const playerGuess = guessInput.value;

    if (playerGuess.length !== maxDigits || !/^[0-9]+$/.test(playerGuess)) {
        alert(`${maxDigits}桁の数字を入力してください。`);
        return;
    }

    if ([...playerGuess].some(c => parseInt(c, 10) > digitRange)) {
        alert(`0〜${digitRange}の数字で入力してください。`);
        return;
    }

    if (new Set(playerGuess).size !== playerGuess.length) {
        alert('同じ数字は2回使えません。');
        return;
    }

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
    const resultDiv = document.createElement('div');
    resultDiv.className = 'result';
    resultDiv.innerHTML = `
        <p>あなたの推測: ${playerGuess}, Hits: ${playerHits}, Blows: ${playerBlows}</p>
        <p>CPUの推測: ${cpuGuess}, Hits: ${cpuHits}, Blows: ${cpuBlows}</p>
    `;
    const resultsContainer = document.getElementById('results');
    resultsContainer.insertBefore(resultDiv, resultsContainer.firstChild);

    const cpuProcessDiv = document.createElement('div');
    cpuProcessDiv.className = 'result';
    cpuProcessDiv.innerHTML = `
        <p>推測: ${cpuGuess}, Hits: ${cpuHits}, Blows: ${cpuBlows}</p>
        <p>絞り込み前の可能性の数: ${possibleAnswersCountBefore}</p>
        <p>絞り込み後の可能性の数: ${possibleAnswers.length}</p>
        <p>絞り込まれた可能性の例: ${exampleAnswers}</p>
    `;
    const cpuProcessContainer = document.getElementById('cpuProcess');
    cpuProcessContainer.insertBefore(cpuProcessDiv, cpuProcessContainer.firstChild);

    if (playerHits === maxDigits || cpuHits === maxDigits) {
        const winnerMessage = playerHits === maxDigits ? 'おめでとうございます！ あなたの勝ちです。' : '残念！ CPUの勝ちです。';
        alert(winnerMessage);
        document.getElementById('restartBtn').style.display = 'block';
        document.getElementById('inputContainer').style.display = 'none';
        const cpuAnswerDiv = document.createElement('div');
        cpuAnswerDiv.className = 'result';
        cpuAnswerDiv.innerHTML = `<p>CPUの答えは: ${cpuAnswer}でした。</p>`;
        const resultsContainer = document.getElementById('results');
        resultsContainer.insertBefore(cpuAnswerDiv, resultsContainer.firstChild); 
    }

    guessInput.value = '';
});

document.getElementById('restartBtn').addEventListener('click', () => {
    document.getElementById('settingsContainer').style.display = 'block';
    document.getElementById('playerAnswerDisplay').style.display = 'none';
    document.getElementById('inputContainer').style.display = 'none';
    document.getElementById('restartBtn').style.display = 'none';
});

// 初期化
document.getElementById('settingsContainer').style.display = 'block';
document.getElementById('playerAnswerDisplay').style.display = 'none';
document.getElementById('inputContainer').style.display = 'none';
document.getElementById('restartBtn').style.display = 'none';