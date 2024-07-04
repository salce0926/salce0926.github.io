// handRanges.js
const handStrength = {
    "AA":  8, "AKs": 8, "AQs": 7, "AJs": 7, "ATs": 7, "A9s": 5, "A8s": 5, "A7s": 5, "A6s": 5, "A5s": 5, "A4s": 5, "A3s": 5, "A2s": 5,
    "AKo": 8, "KK":  8, "KQs": 7, "KJs": 6, "KTs": 5, "K9s": 5, "K8s": 3, "K7s": 3, "K6s": 3, "K5s": 3, "K4s": 3, "K3s": 3, "K2s": 3,
    "AQo": 7, "KQo": 6, "QQ":  8, "QJs": 6, "QTs": 5, "Q9s": 4, "Q8s": 3, "Q7s": 3, "Q6s": 3, "Q5s": 2, "Q4s": 2, "Q3s": 2, "Q2s": 2,
    "AJo": 6, "KJo": 5, "QJo": 4, "JJ":  7, "JTs": 6, "J9s": 4, "J8s": 3, "J7s": 3, "J6s": 2, "J5s": 1, "J4s": 1, "J3s": 1, "J2s": 1,
    "ATo": 5, "KTo": 4, "QTo": 3, "JTo": 4, "TT":  7, "T9s": 5, "T8s": 4, "T7s": 2, "T6s": 1, "T5s": 1, "T4s": 1, "T3s": 1, "T2s": 0,
    "A9o": 4, "K9o": 3, "Q9o": 3, "J9o": 3, "T9o": 3, "99":  7, "98s": 4, "97s": 3, "96s": 2, "95s": 1, "94s": 0, "93s": 0, "92s": 0,
    "A8o": 3, "K8o": 1, "Q8o": 1, "J8o": 1, "T8o": 1, "98o": 2, "88":  6, "87s": 3, "86s": 2, "85s": 1, "84s": 0, "83s": 0, "82s": 0,
    "A7o": 3, "K7o": 1, "Q7o": 1, "J7o": 0, "T7o": 0, "97o": 1, "87o": 1, "77":  6, "76s": 3, "75s": 2, "74s": 1, "73s": 0, "72s": 0,
    "A6o": 2, "K6o": 1, "Q6o": 0, "J6o": 0, "T6o": 0, "96o": 0, "86o": 0, "76o": 0, "66":  5, "65s": 3, "64s": 2, "63s": 1, "62s": 0,
    "A5o": 1, "K5o": 1, "Q5o": 0, "J5o": 0, "T5o": 0, "95o": 0, "85o": 0, "75o": 0, "65o": 0, "55":  5, "54s": 2, "53s": 1, "52s": 0,
    "A4o": 1, "K4o": 0, "Q4o": 0, "J4o": 0, "T4o": 0, "94o": 0, "84o": 0, "74o": 0, "64o": 0, "54o": 0, "44":  4, "43s": 1, "42s": 0,
    "A3o": 1, "K3o": 0, "Q3o": 0, "J3o": 0, "T3o": 0, "93o": 0, "83o": 0, "73o": 0, "63o": 0, "53o": 0, "43o": 0, "33":  4, "32s": 0,
    "A2o": 1, "K2o": 0, "Q2o": 0, "J2o": 0, "T2o": 0, "92o": 0, "82o": 0, "72o": 0, "62o": 0, "52o": 0, "42o": 0, "32o": 0, "22":  4,
};

const positionThresholds = {
    "BB": 1, "SB": 2, "BTN": 2, "CO": 3, "HJ": 4, 
    "LJ": 4, "UTG2": 5, "UTG1": 5, "UTG": 6
};


// script.js
document.addEventListener("DOMContentLoaded", loadQuestion);

const positions = ["UTG", "UTG1", "UTG2", "LJ", "HJ", "CO", "BTN", "SB", "BB"];
const positionOrder = {
    "UTG": 0, "UTG1": 1, "UTG2": 2, "LJ": 3, "HJ": 4, "CO": 5, "BTN": 6, "SB": 7, "BB": 8
};

function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function getValidRaisePosition(currentPosition) {
    const currentPosIndex = positionOrder[currentPosition];
    const validPositions = positions.slice(0, currentPosIndex); 
    console.log(validPositions);
    return validPositions.length ? getRandomElement(validPositions) : null;
}

function generateQuestion() {
    const position = getRandomElement(positions);
    const hand = getRandomElement(Object.keys(handStrength));
    const raisePosition = position === "BB" || Math.random() < 0.5 ? getValidRaisePosition(position) : null; // BBの場合は必ずレイズされる

    return {
        position,
        hand,
        raisePosition,
        question: `ポジション：${position}\nハンド：${hand}\n${raisePosition ? `レイズされたポジション：${raisePosition}\n` : ''}このハンドでどのアクションをすべきですか？`,
        options: {
            A: "フォールド",
            B: "コール",
            C: "レイズ"
        },
        correct: determineCorrectAnswer(position, hand, raisePosition)
    };
}

function determineCorrectAnswer(position, hand, raisePosition) {
    const handValue = handStrength[hand];
    const threshold = positionThresholds[position];
    if (raisePosition) {
        const raiseThreshold = positionThresholds[raisePosition];
        if (raisePosition === "CO" && position === "BB") {
            if (handValue >= 3) {
                return "C"; // レイズ
            } else if (handValue >= 2) {
                return "B"; // コール
            } else {
                return "A"; // フォールド
            }
        } else if (["UTG", "UTG1", "UTG2", "LJ", "HJ"].includes(position) && position === "BB") {
            if (handValue >= 4) {
                return "C"; // レイズ
            } else if (handValue >= 3) {
                return "B"; // コール
            } else {
                return "A"; // フォールド
            }
        } else {
            if (handValue >= raiseThreshold + 2) {
                return "C"; // レイズ
            } else if (handValue >= raiseThreshold + 1) {
                return "B"; // コール
            } else {
                return "A"; // フォールド
            }
        }
    } else {
        if (handValue >= threshold) {
            return "C"; // レイズ
        } else {
            return "A"; // フォールド
        }
    }
}

// ハンドレンジの表示を切り替える関数
function toggleHandRange() {
    const handRangeContainer = document.getElementById("hand-range");

    if (handRangeContainer.style.display !== "flex") {
        // ハンドレンジを表示する
        handRangeContainer.style.display = "flex";
        displayHandRange(handStrength);
    } else {
        // ハンドレンジを隠す
        handRangeContainer.style.display = "none";
    }
}

// ハンドレンジを表示する関数
function displayHandRange(handStrengths) {
    const handRangeContainer = document.getElementById("hand-range");
    handRangeContainer.innerHTML = "";

    const ranks = [
        "AA", "AKs", "AQs", "AJs", "ATs", "A9s", "A8s", "A7s", "A6s", "A5s", "A4s", "A3s", "A2s",
        "AKo", "KK", "KQs", "KJs", "KTs", "K9s", "K8s", "K7s", "K6s", "K5s", "K4s", "K3s", "K2s",
        "AQo", "KQo", "QQ", "QJs", "QTs", "Q9s", "Q8s", "Q7s", "Q6s", "Q5s", "Q4s", "Q3s", "Q2s",
        "AJo", "KJo", "QJo", "JJ", "JTs", "J9s", "J8s", "J7s", "J6s", "J5s", "J4s", "J3s", "J2s",
        "ATo", "KTo", "QTo", "JTo", "TT", "T9s", "T8s", "T7s", "T6s", "T5s", "T4s", "T3s", "T2s",
        "A9o", "K9o", "Q9o", "J9o", "T9o", "99", "98s", "97s", "96s", "95s", "94s", "93s", "92s",
        "A8o", "K8o", "Q8o", "J8o", "T8o", "98o", "88", "87s", "86s", "85s", "84s", "83s", "82s",
        "A7o", "K7o", "Q7o", "J7o", "T7o", "97o", "87o", "77", "76s", "75s", "74s", "73s", "72s",
        "A6o", "K6o", "Q6o", "J6o", "T6o", "96o", "86o", "76o", "66", "65s", "64s", "63s", "62s",
        "A5o", "K5o", "Q5o", "J5o", "T5o", "95o", "85o", "75o", "65o", "55", "54s", "53s", "52s",
        "A4o", "K4o", "Q4o", "J4o", "T4o", "94o", "84o", "74o", "64o", "54o", "44", "43s", "42s",
        "A3o", "K3o", "Q3o", "J3o", "T3o", "93o", "83o", "73o", "63o", "53o", "43o", "33", "32s",
        "A2o", "K2o", "Q2o", "J2o", "T2o", "92o", "82o", "72o", "62o", "52o", "42o", "32o", "22"
    ];

    const numColumns = 13; // 一行に表示する最大のハンド数
    const numRows = Math.ceil(ranks.length / numColumns); // 必要な行数

    for (let i = 0; i < numRows; i++) {
        const rowElement = document.createElement("div");
        rowElement.classList.add("hand-row");
        handRangeContainer.appendChild(rowElement);

        for (let j = 0; j < numColumns; j++) {
            const index = i * numColumns + j;
            if (index >= ranks.length) break;

            const hand = ranks[index];
            const strength = handStrengths[hand];
            const handElement = document.createElement("div");
            handElement.textContent = hand;
            handElement.classList.add("hand", `strength-${strength}`);
            rowElement.appendChild(handElement);
        }
    }
}

let currentQuestion;

function loadQuestion() {
    currentQuestion = generateQuestion();
    document.getElementById("question").textContent = currentQuestion.question;
    document.querySelectorAll(".option").forEach((button, index) => {
        const optionKey = String.fromCharCode(65 + index);
        button.textContent = `${optionKey}. ${currentQuestion.options[optionKey]}`;
    });
    document.getElementById("result").textContent = "";
    document.getElementById("next-button").style.display = "none";
}

function checkAnswer(answer) {
    if (answer === currentQuestion.correct) {
        document.getElementById("result").textContent = "正解です！";
    } else {
        document.getElementById("result").textContent = `不正解です。正解は${currentQuestion.correct}です。`;
    }
    document.getElementById("next-button").style.display = "block";
}

function nextQuestion() {
    loadQuestion();
}
