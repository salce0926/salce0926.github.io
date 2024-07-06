const maxDigits = 4;
let playerAnswer, cpuAnswer;
let possibleAnswers, previousGuesses;

function generateAnswer() {
    let digits = [];
    while (digits.length < maxDigits) {
        let randomDigit = Math.floor(Math.random() * 10);
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

function generateAllPossibleAnswers() {
    let answers = [];
    function generate(current) {
        if (current.length === maxDigits) {
            answers.push(current);
            return;
        }
        for (let i = 0; i < 10; i++) {
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
    playerAnswer = generateAnswer();
    cpuAnswer = generateAnswer();
    console.log(`Player Answer: ${playerAnswer}`);
    console.log(`CPU Answer: ${cpuAnswer}`);
    document.getElementById('playerAnswer').textContent = playerAnswer;
    possibleAnswers = generateAllPossibleAnswers();
    previousGuesses = [];
    document.getElementById('results').innerHTML = '';
    document.getElementById('guessInput').value = '';
    document.getElementById('restartBtn').style.display = 'none';
    document.getElementById('inputContainer').style.display = 'block';
}

document.getElementById('submitBtn').addEventListener('click', () => {
    const guessInput = document.getElementById('guessInput');
    const playerGuess = guessInput.value;

    if (playerGuess.length !== maxDigits || isNaN(playerGuess)) {
        alert('4桁の数字を入力してください。');
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
    possibleAnswers = filterAnswers(possibleAnswers, cpuGuess, cpuHits, cpuBlows);

    const resultDiv = document.createElement('div');
    resultDiv.className = 'result';
    resultDiv.innerHTML = `
        <p>あなたの推測: ${playerGuess}, Hits: ${playerHits}, Blows: ${playerBlows}</p>
        <p>CPUの推測: ${cpuGuess}, Hits: ${cpuHits}, Blows: ${cpuBlows}</p>
    `;
    document.getElementById('results').appendChild(resultDiv);

    if (playerHits === maxDigits) {
        alert('おめでとうございます！ あなたの勝ちです。');
        document.getElementById('restartBtn').style.display = 'block';
        document.getElementById('inputContainer').style.display = 'none';
    } else if (cpuHits === maxDigits) {
        alert('残念！ CPUの勝ちです。');
        document.getElementById('restartBtn').style.display = 'block';
        document.getElementById('inputContainer').style.display = 'none';
    }

    guessInput.value = '';
});

document.getElementById('restartBtn').addEventListener('click', resetGame);

// 初期化
resetGame();