class MemoryGame {
    constructor() {
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.attempts = 10;
        this.score = 0;
        this.gameOver = false;

        this.gridContainer = document.querySelector('.grid-container');
        this.messageElement = document.getElementById('message');
        this.attemptsElement = document.getElementById('attempts');
        this.pairsElement = document.getElementById('pairs');
        this.scoreElement = document.getElementById('score');

        this.initializeGame();
    }

    initializeGame() {
        this.createCards();
        this.shuffleCards();
        this.renderCards();
        this.addEventListeners();
        this.updateGameInfo();
    }

    createCards() {
        const concepts = cyberConcepts.slice(0, 8); // Use 8 unique concepts
        this.cards = [...concepts, ...concepts].map((concept, index) => ({
            id: index,
            name: concept.name,
            image: concept.image,
            isFlipped: false,
            isMatched: false
        }));
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
            return; // Prevent further plays if game is over or no attempts left
        }

        const cardId = parseInt(cardElement.dataset.id);
        const card = this.cards.find(c => c.id === cardId);
        card.isFlipped = true;
        cardElement.classList.add('flipped');
        this.flippedCards.push(card);

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
        this.checkGameEnd();
    }

    handleMismatch(card1, card2) {
        setTimeout(() => {
            card1.isFlipped = card2.isFlipped = false;
            this.flippedCards = [];
            this.updateCardElements();
            this.messageElement.textContent = "No match. Try again!";
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
        if (this.matchedPairs === 8) {
            this.gameOver = true;
            this.messageElement.textContent = `Congratulations! You've matched all pairs with a score of ${this.score}!`;
        } else if (this.attempts <= 0) {
            this.gameOver = true;
            this.messageElement.textContent = `Game over! Your final score is ${this.score}.`;
        }

        if (this.gameOver) {
            // Disable further card flips
            this.gridContainer.removeEventListener('click', this.handleCardClick);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new MemoryGame();
});