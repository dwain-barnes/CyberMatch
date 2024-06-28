class MemoryGame {
    constructor() {
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.attempts = 10;
        this.score = 0;
        this.gameOver = false;

        this.startMenu = document.getElementById('start-menu');
        this.howToPlayScreen = document.getElementById('how-to-play-screen');
        this.informationScreen = document.getElementById('information-screen');
        this.gameBoard = document.getElementById('game-board');
        this.endGameMenu = document.getElementById('end-game-menu');
        this.gridContainer = document.querySelector('.grid-container');
        this.messageElement = document.getElementById('message');
        this.attemptsElement = document.getElementById('attempts');
        this.pairsElement = document.getElementById('pairs');
        this.scoreElement = document.getElementById('score');
        this.finalScoreElement = document.getElementById('final-score');

        // Audio elements
        this.backgroundAudio = document.getElementById('backgroundAudio');
        this.flipAudio = document.getElementById('flipAudio');
        this.matchAudio = document.getElementById('matchAudio');
        this.mismatchAudio = document.getElementById('mismatchAudio');

        this.audioInitialized = false;

        this.addMenuListeners();
    }

    addMenuListeners() {
        document.getElementById('start-game').addEventListener('click', () => this.startGame());
        document.getElementById('how-to-play').addEventListener('click', () => this.showHowToPlay());
        document.getElementById('information').addEventListener('click', () => this.showInformation());
        document.querySelectorAll('.back-button').forEach(button => {
            button.addEventListener('click', () => this.showStartMenu());
        });
        document.getElementById('play-again').addEventListener('click', () => this.startGame());
        document.getElementById('return-main-menu').addEventListener('click', () => this.showStartMenu());
    }

    showStartMenu() {
        this.startMenu.style.display = 'block';
        this.howToPlayScreen.style.display = 'none';
        this.informationScreen.style.display = 'none';
        this.gameBoard.style.display = 'none';
        this.endGameMenu.style.display = 'none';
        this.backgroundAudio.pause();
    }

    showHowToPlay() {
        this.startMenu.style.display = 'none';
        this.howToPlayScreen.style.display = 'block';
    }

    showInformation() {
        this.startMenu.style.display = 'none';
        this.informationScreen.style.display = 'block';
        this.displayCardInformation();
    }

    displayCardInformation() {
        const container = document.getElementById('card-info-container');
        container.innerHTML = '';
        cyberConcepts.forEach(concept => {
            const infoDiv = document.createElement('div');
            infoDiv.classList.add('concept-info');
            infoDiv.innerHTML = `
                <div class="concept-header">
                    <img src="${concept.image}" alt="${concept.name}" class="concept-icon">
                    <h3>${concept.name}</h3>
                </div>
                <p>${concept.description}</p>
            `;
            container.appendChild(infoDiv);
        });
    }

    startGame() {
        this.resetGame();
        this.startMenu.style.display = 'none';
        this.endGameMenu.style.display = 'none';
        this.gameBoard.style.display = 'block';
        this.initializeGame();
        this.playBackgroundMusic();
    }

    resetGame() {
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.attempts = 10;
        this.score = 0;
        this.gameOver = false;
        this.backgroundAudio.currentTime = 0;
    }

    initializeGame() {
        this.createCards();
        this.shuffleCards();
        this.renderCards();
        this.addEventListeners();
        this.updateGameInfo();
    }

    createCards() {
        this.cards = cyberConcepts.flatMap((concept, index) => [
            { id: index * 2, name: concept.name, image: concept.image, isFlipped: false, isMatched: false },
            { id: index * 2 + 1, name: concept.name, image: concept.image, isFlipped: false, isMatched: false }
        ]);
    }

    shuffleCards() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    renderCards() {
        this.gridContainer.innerHTML = '';
        this.cards.forEach(card => {
            const cardElement = document.createElement('div');
            cardElement.classList.add('card');
            cardElement.dataset.id = card.id;
            cardElement.innerHTML = `
                <div class="card-inner">
                    <div class="card-front">
                        <img src="${card.image}" alt="${card.name}" class="card-image" onerror="this.src='img/placeholder.png';">
                        <div>${card.name}</div>
                    </div>
                    <div class="card-back"></div>
                </div>
            `;
            this.gridContainer.appendChild(cardElement);
        });
    }

    addEventListeners() {
        this.handleCardClick = (e) => {
            const cardElement = e.target.closest('.card');
            if (cardElement && this.canFlipCard(cardElement)) {
                this.flipCard(cardElement);
            }
        };
        this.gridContainer.addEventListener('click', this.handleCardClick);
    }

    canFlipCard(cardElement) {
        const cardId = parseInt(cardElement.dataset.id);
        const card = this.cards.find(c => c.id === cardId);
        return !card.isFlipped && !card.isMatched && this.flippedCards.length < 2 && !this.gameOver;
    }

    flipCard(cardElement) {
        if (this.gameOver || this.attempts <= 0) {
            return;
        }

        const cardId = parseInt(cardElement.dataset.id);
        const card = this.cards.find(c => c.id === cardId);
        card.isFlipped = true;
        cardElement.classList.add('flipped');
        this.flippedCards.push(card);

        this.playFlipSound();

        if (this.flippedCards.length === 2) {
            this.attempts--;
            this.checkForMatch();
        }

        this.updateGameInfo();
        this.checkGameEnd();
    }

    checkForMatch() {
        const [card1, card2] = this.flippedCards;
        if (card1.name === card2.name) {
            this.handleMatch(card1, card2);
        } else {
            this.handleMismatch(card1, card2);
        }
    }

    handleMatch(card1, card2) {
        card1.isMatched = card2.isMatched = true;
        this.matchedPairs++;
        this.score += 10;
        this.messageElement.textContent = "Match found! +10 points";
        this.flippedCards = [];
        this.playMatchSound();
        this.checkGameEnd();
    }

    handleMismatch(card1, card2) {
        setTimeout(() => {
            card1.isFlipped = card2.isFlipped = false;
            this.flippedCards = [];
            this.updateCardElements();
            this.messageElement.textContent = "No match. Try again!";
            this.playMismatchSound();
        }, 1000);
    }

    updateCardElements() {
        this.cards.forEach(card => {
            const cardElement = document.querySelector(`.card[data-id="${card.id}"]`);
            if (card.isFlipped) {
                cardElement.classList.add('flipped');
            } else {
                cardElement.classList.remove('flipped');
            }
        });
    }

    updateGameInfo() {
        this.attemptsElement.textContent = this.attempts;
        this.pairsElement.textContent = this.matchedPairs;
        this.scoreElement.textContent = this.score;
    }

    checkGameEnd() {
        if (this.matchedPairs === cyberConcepts.length) {
            this.gameOver = true;
            this.finalScoreElement.textContent = `Congratulations! You've matched all pairs with a score of ${this.score}!`;
            this.showEndGameMenu();
        } else if (this.attempts <= 0) {
            this.gameOver = true;
            this.finalScoreElement.textContent = `Game over! Your final score is ${this.score}.`;
            this.showEndGameMenu();
        }

        if (this.gameOver) {
            this.gridContainer.removeEventListener('click', this.handleCardClick);
            this.backgroundAudio.pause();
        }
    }

    showEndGameMenu() {
        this.gameBoard.style.display = 'none';
        this.endGameMenu.style.display = 'block';
    }

    playBackgroundMusic() {
        console.log("Attempting to play background music");
        this.backgroundAudio.play().catch(e => console.error("Error playing background music:", e));
    }

    playFlipSound() {
        console.log("Attempting to play flip sound");
        this.flipAudio.currentTime = 0;
        this.flipAudio.play().catch(e => console.error("Error playing flip sound:", e));
    }

    playMatchSound() {
        console.log("Attempting to play match sound");
        this.matchAudio.currentTime = 0;
        this.matchAudio.play().catch(e => console.error("Error playing match sound:", e));
    }

    playMismatchSound() {
        console.log("Attempting to play mismatch sound");
        this.mismatchAudio.currentTime = 0;
        this.mismatchAudio.play().catch(e => console.error("Error playing mismatch sound:", e));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new MemoryGame();
});
