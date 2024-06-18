// script.js

document.getElementById('dealButton').addEventListener('click', nextStage);

let deck, player1Cards, player2Cards, board;
let stage = 0;

function initializeDeck() {
    const suits = ['H', 'D', 'C', 'S'];
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    deck = [];
    for (let suit of suits) {
        for (let rank of ranks) {
            deck.push(`${rank}${suit}`);
        }
    }
}

function drawCard() {
    const index = Math.floor(Math.random() * deck.length);
    return deck.splice(index, 1)[0];
}

function deal() {
    initializeDeck();
    stage = 0;
    player1Cards = [drawCard(), drawCard()];
    player2Cards = [drawCard(), drawCard()];
    board = [];

    displayCards('player1-cards', player1Cards);
    displayCards('player2-cards', player2Cards);
    displayBoardCards();

    document.getElementById('player1-hand').innerText = 'Player 1：';
    document.getElementById('player2-hand').innerText = 'Player 2：';
    document.getElementById('result').innerText = 'Result:';
}

function nextStage() {
    if (stage === 0) {
        // フロップ
        for (let i = 0; i < 3; i++) {
            board.push(drawCard());
        }
    } else if (stage === 1) {
        // ターン
        board.push(drawCard());
    } else if (stage === 2) {
        // リバー
        board.push(drawCard());
    } else if (stage === 3) {
        deal();
        return;
    }

    stage++;
    displayBoardCards();

    if (stage === 3) {
        determineWinner();
    }
}

function displayCards(elementId, cards) {
    const container = document.getElementById(elementId);
    container.innerHTML = '';
    cards.forEach(card => {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card';
        cardDiv.style.backgroundImage = `url('cards/${card}.png')`;
        container.appendChild(cardDiv);
        setTimeout(() => {
            cardDiv.classList.add('show');
        }, 100);
    });
}

function displayBoardCards() {
    const container = document.getElementById('board-cards');
    container.innerHTML = '';
    board.forEach((card, index) => {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card';
        cardDiv.style.backgroundImage = `url('cards/${card}.png')`;
        container.appendChild(cardDiv);

        if (stage === 1 && index >= 0 && index <= 2) {
            // フロップのカード
            setTimeout(() => {
                cardDiv.classList.add('show');
            }, index * 300);
        } else if (stage === 2 && index === 3) {
            // ターンのカード
            setTimeout(() => {
                cardDiv.classList.add('show');
            }, 300);
        } else if (stage === 3 && index === 4) {
            // リバーのカード
            setTimeout(() => {
                cardDiv.classList.add('show');
            }, 300);
        } else if (index < board.length - 1) {
            cardDiv.classList.add('show');
        }
    });
}

function determineWinner() {
    // プレイヤーの手札とボードのカードを組み合わせる
    const player1AllCards = [...player1Cards, ...board];
    const player2AllCards = [...player2Cards, ...board];

    // 役の判定
    const player1Hand = evaluateHand(player1AllCards);
    const player2Hand = evaluateHand(player2AllCards);

    // 役を表示
    document.getElementById('player1-hand').innerText = `Player 1: ${player1Hand}`;
    document.getElementById('player2-hand').innerText = `Player 2: ${player2Hand}`;

    // 最終的な勝敗を決定（ここでは簡略化）
    const winner = compareHands(player1Hand, player2Hand, player1AllCards, player2AllCards);
    if (winner === 1) {
        document.getElementById('result').innerText = 'Result: Player 1 win!';
    } else if (winner === 2) {
        document.getElementById('result').innerText = 'Result: Player 2 win!';
    } else {
        document.getElementById('result').innerText = 'Result: Draw!';
    }
}

// 役を比較する関数
function compareHands(hand1, hand2, cards1, cards2) {
    const handOrder = [
        "RoyalFlush", "StraightFlush", "FourOfAKind", "FullHouse",
        "Flush", "Straight", "ThreeOfAKind", "TwoPair", "OnePair", "HighCard"
    ];
    const hand1Index = handOrder.indexOf(hand1);
    const hand2Index = handOrder.indexOf(hand2);

    if (hand1Index < hand2Index) {
        return 1; // プレイヤー1の役が強い
    } else if (hand1Index > hand2Index) {
        return 2; // プレイヤー2の役が強い
    } else {
        // 役が同じ場合、役に応じた比較を行う
        switch (hand1) {
            case "FourOfAKind":
                return compareFourOfAKind(cards1, cards2);
            case "FullHouse":
                return compareFullHouse(cards1, cards2);
            case "ThreeOfAKind":
                return compareThreeOfAKind(cards1, cards2);
            case "TwoPair":
                return compareTwoPair(cards1, cards2);
            case "OnePair":
                return compareOnePair(cards1, cards2);
            default:
                return compareHighCard(cards1, cards2);
        }
    }
}

// ワンペアを比較する関数
function compareOnePair(cards1, cards2) {
    const pairRank1 = findPairRank(cards1);
    const pairRank2 = findPairRank(cards2);

    if (pairRank1 > pairRank2) {
        return 1; // プレイヤー1のペアが強い
    } else if (pairRank1 < pairRank2) {
        return 2; // プレイヤー2のペアが強い
    } else {
        // ペアのランクが同じ場合はキッカーで比較
        const kickerCards1 = cards1.filter(card => rankValue(card) !== pairRank1);
        const kickerCards2 = cards2.filter(card => rankValue(card) !== pairRank2);
        return compareHighCard(kickerCards1, kickerCards2);
    }
}

// ツーペアを比較する関数
function compareTwoPair(cards1, cards2) {
    const pairs1 = findPairs(cards1);
    const pairs2 = findPairs(cards2);

    const highestPair1 = Math.max(...pairs1);
    const highestPair2 = Math.max(...pairs2);

    if (highestPair1 > highestPair2) {
        return 1; // プレイヤー1の最高ペアが強い
    } else if (highestPair1 < highestPair2) {
        return 2; // プレイヤー2の最高ペアが強い
    } else {
        const lowestPair1 = Math.min(...pairs1);
        const lowestPair2 = Math.min(...pairs2);

        if (lowestPair1 > lowestPair2) {
            return 1; // プレイヤー1の次のペアが強い
        } else if (lowestPair1 < lowestPair2) {
            return 2; // プレイヤー2の次のペアが強い
        } else {
            // ペアが同じ場合はキッカーで比較
            const kicker1 = cards1.filter(card => !pairs1.includes(rankValue(card)));
            const kicker2 = cards2.filter(card => !pairs2.includes(rankValue(card)));
            return compareHighCard(kicker1, kicker2);
        }
    }
}

// スリーカードを比較する関数
function compareThreeOfAKind(cards1, cards2) {
    const threeRank1 = findThreeOfAKindRank(cards1);
    const threeRank2 = findThreeOfAKindRank(cards2);

    if (threeRank1 > threeRank2) {
        return 1; // プレイヤー1のスリーカードが強い
    } else if (threeRank1 < threeRank2) {
        return 2; // プレイヤー2のスリーカードが強い
    } else {
        // スリーカードが同じ場合はキッカーで比較
        const kickerCards1 = cards1.filter(card => rankValue(card) !== threeRank1);
        const kickerCards2 = cards2.filter(card => rankValue(card) !== threeRank2);
        return compareHighCard(kickerCards1, kickerCards2);
    }
}

// フルハウスを比較する関数
function compareFullHouse(cards1, cards2) {
    const threeRank1 = findThreeOfAKindRank(cards1);
    const threeRank2 = findThreeOfAKindRank(cards2);

    if (threeRank1 > threeRank2) {
        return 1; // プレイヤー1のスリーカードが強い
    } else if (threeRank1 < threeRank2) {
        return 2; // プレイヤー2のスリーカードが強い
    } else {
        const pairRank1 = findPairRank(cards1.filter(card => rankValue(card) !== threeRank1));
        const pairRank2 = findPairRank(cards2.filter(card => rankValue(card) !== threeRank2));

        if (pairRank1 > pairRank2) {
            return 1; // プレイヤー1のペアが強い
        } else if (pairRank1 < pairRank2) {
            return 2; // プレイヤー2のペアが強い
        } else {
            return 0; // 引き分け
        }
    }
}

// フォーカードを比較する関数
function compareFourOfAKind(cards1, cards2) {
    const fourRank1 = findFourOfAKindRank(cards1);
    const fourRank2 = findFourOfAKindRank(cards2);

    if (fourRank1 > fourRank2) {
        return 1; // プレイヤー1のフォーカードが強い
    } else if (fourRank1 < fourRank2) {
        return 2; // プレイヤー2のフォーカードが強い
    } else {
        // フォーカードが同じ場合はキッカーで比較
        const kicker1 = cards1.find(card => rankValue(card) !== fourRank1);
        const kicker2 = cards2.find(card => rankValue(card) !== fourRank2);
        return compareHighCard([kicker1], [kicker2]);
    }
}

// ハンドからペアのランクを見つける関数
function findPairRank(cards) {
    const ranks = {};
    cards.forEach(card => {
        const rank = card.slice(0, -1);
        ranks[rank] = ranks[rank] + 1 || 1;
    });
    for (let rank in ranks) {
        if (ranks[rank] === 2) {
            return rankValue(rank + 's');
        }
    }
    return 0; // ペアが見つからない場合
}

// ハンドからスリーカードのランクを見つける関数
function findThreeOfAKindRank(cards) {
    const ranks = {};
    cards.forEach(card => {
        const rank = card.slice(0, -1);
        ranks[rank] = ranks[rank] + 1 || 1;
    });
    for (let rank in ranks) {
        if (ranks[rank] === 3) {
            return rankValue(rank + 's');
        }
    }
    return 0; // スリーカードが見つからない場合
}

// ハンドからフォーカードのランクを見つける関数
function findFourOfAKindRank(cards) {
    const ranks = {};
    cards.forEach(card => {
        const rank = card.slice(0, -1);
        ranks[rank] = ranks[rank] + 1 || 1;
    });
    for (let rank in ranks) {
        if (ranks[rank] === 4) {
            return rankValue(rank + 's');
        }
    }
    return 0; // フォーカードが見つからない場合
}

// ツーペアのランクを見つける関数
function findPairs(cards) {
    const ranks = {};
    cards.forEach(card => {
        const rank = card.slice(0, -1);
        ranks[rank] = ranks[rank] + 1 || 1;
    });
    const pairs = [];
    for (let rank in ranks) {
        if (ranks[rank] === 2) {
            pairs.push(rankValue(rank + 's'));
        }
    }
    return pairs; // ペアが見つからない場合
}

// ハイカードを比較する関数
function compareHighCard(cards1, cards2) {
    cards1.sort((a, b) => rankValue(b) - rankValue(a));
    cards2.sort((a, b) => rankValue(b) - rankValue(a));

    for (let i = 0; i < Math.min(cards1.length, cards2.length); i++) {
        const rank1 = rankValue(cards1[i]);
        const rank2 = rankValue(cards2[i]);
        if (rank1 > rank2) {
            return 1;
        } else if (rank1 < rank2) {
            return 2;
        }
    }
    return 0; // 引き分け
}


// 役判定関数
function evaluateHand(cards) {
    // カードをランク（数値）の昇順でソートする
    cards.sort((a, b) => rankValue(a) - rankValue(b));

    // 役の判定
    console.log("全体のカード:", cards);

    if (isRoyalFlush(cards)) {
        console.log("RoyalFlush");
        return "RoyalFlush";
    } else if (isStraightFlush(cards)) {
        console.log("StraightFlush");
        return "StraightFlush";
    } else if (isFourOfAKind(cards)) {
        console.log("FourOfAKind");
        return "FourOfAKind";
    } else if (isFullHouse(cards)) {
        console.log("FullHouse");
        return "FullHouse";
    } else if (isFlush(cards)) {
        console.log("Flush");
        return "Flush";
    } else if (isStraight(cards)) {
        console.log("Straight");
        return "Straight";
    } else if (isThreeOfAKind(cards)) {
        console.log("ThreeOfAKind");
        return "ThreeOfAKind";
    } else if (isTwoPair(cards)) {
        console.log("TwoPair");
        return "TwoPair";
    } else if (isOnePair(cards)) {
        console.log("OnePair");
        return "OnePair";
    } else {
        console.log("HighCard");
        return "HighCard";
    }
}


// ランク（数値）を返す関数
function rankValue(card) {
    const rank = card.substring(0, card.length - 1);
    const rankValues = {
        '2': 2, '3': 3, '4': 4, '5': 5,
        '6': 6, '7': 7, '8': 8, '9': 9,
        '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
    };
    return rankValues[rank];
}

// ロイヤルフラッシュの判定
function isRoyalFlush(cards) {
    return isStraightFlush(cards) && cards.some(card => card.startsWith('A'));
}

// ストレートフラッシュの判定
function isStraightFlush(cards) {
    return isFlush(cards) && isStraight(cards);
}

// フォーカードの判定
function isFourOfAKind(cards) {
    const ranks = getRanks(cards);
    return Object.keys(ranks).some(rank => ranks[rank] === 4);
}

// フルハウスの判定
function isFullHouse(cards) {
    const ranks = getRanks(cards);
    const values = Object.values(ranks);
    return values.includes(3) && values.includes(2);
}

// フラッシュの判定
function isFlush(cards) {
    const suits = getSuits(cards);
    return Object.values(suits).some(count => count >= 5);
}

// ストレートの判定
function isStraight(cards) {
    const ranks = getRanks(cards);
    const sortedRanks = Object.keys(ranks).sort((a, b) => a - b);
    if (sortedRanks.length < 5) return false;
    for (let i = 0; i <= sortedRanks.length - 5; i++) {
        if (sortedRanks[i + 4] - sortedRanks[i] === 4) return true;
    }
    // A2345のストレートの場合
    if (sortedRanks.includes('14') && sortedRanks.includes('2') && sortedRanks.includes('3') && sortedRanks.includes('4') && sortedRanks.includes('5')) {
        return true;
    }
    return false;
}

// スリーカードの判定
function isThreeOfAKind(cards) {
    const ranks = getRanks(cards);
    return Object.keys(ranks).some(rank => ranks[rank] === 3);
}

// ツーペアの判定
function isTwoPair(cards) {
    const ranks = getRanks(cards);
    let pairs = 0;
    for (let rank in ranks) {
        if (ranks[rank] === 2) pairs++;
    }
    return pairs === 2;
}

// ワンペアの判定
function isOnePair(cards) {
    const ranks = getRanks(cards);
    return Object.keys(ranks).filter(rank => ranks[rank] === 2).length === 1;
}

// カードのランクを数える関数
function getRanks(cards) {
    const ranks = {};
    cards.forEach(card => {
        const rank = card.substring(0, card.length - 1);
        ranks[rank] = ranks[rank] + 1 || 1;
    });
    return ranks;
}

// カードのスートを数える関数
function getSuits(cards) {
    const suits = {};
    cards.forEach(card => {
        const suit = card.substring(card.length - 1);
        suits[suit] = suits[suit] + 1 || 1;
    });
    return suits;
}

// ページが読み込まれた時にリセットを実行
window.onload = deal;