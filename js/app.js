var copper = ["Copper", 0, "img/copper.jpg", "Treasure"]
var estate = ["Estate", 2, "img/estate.jpg", "Treasure"]

class Player {
    constructor() {
        this.deck = shuffle(makeDeck());
        this.hand = [];
        this.played = []
        this.discard = [];
        this.treasure = 0;
        this.actions = 1;
        this.buys = 1;
    }
    draw(n) {
        while (n > 0) {
            if (!this.deck && !this.discard) {
                console.log("no cards left!")
                break;
            } else if (!this.deck) {
                console.log('shuffling your deck, hang on.', this.discard.length, 'cards in discard pile')
                this.deck = shuffle(discard.splice())
            }

            console.log('drawing,', n, 'left')
            this.hand.push(this.deck.pop()) 
            n--
        }
        renderHand(this)
        return this.hand
    }
    discardRandom(n) {
        if (this.hand) {
            while (n > 0) {
                console.log('discarding,', n, 'left')
                this.discard.push(this.hand.splice(Math.floor(Math.random() * this.hand.length), 1)[0]) // discard random index of hand, remember to de-reference splice
                n--
            }
        }
        renderHand(this)
        return this.hand
    }
    discardSpecific(index) {
        if(this.hand && this.hand[index]) {
            discard.push(this.hand.splice(index, 1))
        }
        renderHand(this)
        return this.hand
    }


}

class Card {
    constructor(name, cost, imageUrl, type) {
        this.name = name;
        this.cost = cost;
        this.imageUrl = imageUrl;
        this.type = type
    }
}

function makeDeck() {
    // makes a starter deck
    let deck = [];
    // add 7 copper
    for (let i = 0; i < 7; i++) {
        deck.push(new Card(...copper))
    }
    // add 3 estates
    for (let i = 0; i < 3; i++) {
        deck.push(new Card(...estate))
    }
    return deck
}

function shuffle(cardsArr) {
    let shuffled = [];
    while (cardsArr.length > 0) {
        shuffled.push(cardsArr.splice(Math.floor(Math.random() * cardsArr.length), 1)[0]) // remember to de-reference splice
    }
    return shuffled
}

function renderHand(player) {
    let htmlHand = document.querySelector('.player-item__hand');
    while (htmlHand.firstChild) {
        htmlHand.remove(htmlHand.firstChild);
    }
    player.hand.forEach((card, index) => {
        let cardImg = document.createElement('img');
        cardImg.src = card.imageUrl
        cardImg.className = `hand-card hand-card--${index}`
        htmlHand.appendChild(cardImg)
    })

}
