// toggle for debug messages
var DEBUG = true;
function dlog(message) {
    if (DEBUG) {
        console.log(message);
    }
}
// GLOBALS
const NUM_PLAYERS = 2 //parseInt(prompt("How many players?"));
const PLAYERS = [];
const SUPPLY = makeSupply();
var TURN = 0;
var PHASE = null;
var DONE = false;
const UI = {
    removeChildren: function(parent) {
        while (parent.firstChild) {
            parent.removeChild(parent.firstChild)
        }
        return parent
    },
    renderTitle: function() {
        console.log('rendering title', PLAYERS[TURN].name);
        UI.title.textContent = `${PLAYERS[TURN].name}: ${PHASE} phase`;
    },
    renderSupply: function() {
        let basic = UI.removeChildren(UI.basicSupply);
        let kingdom = UI.removeChildren(UI.kingdomSupply);
        for (type in SUPPLY) {
            for (stack in SUPPLY[type]) {
                if (stack && stack !== "trash") {
                    let card = new Card(...CARDS[stack]);
                    let name = card.name;
                    card.render(type === "basic"? basic : kingdom, this.name, "supply")
                    .addEventListener('click', e => {PLAYERS[TURN].buy(name)})
                } else {
                    new Card(...CARDS["Empty"]).render(type, this.name, "empty")
                }
            }
        }
    },
    renderDeck: function() {
        let uiDeck = UI.removeChildren(UI.deck);
        if (PLAYERS[TURN].deck) {
            new Card(...CARDS["CardBack"]).render(uiDeck, "CardBack", "deck")
        } else {
            new Card(...CARDS["Empty"]).render(uiDeck, "Empty", "empty")
        }
    },
    renderDiscard() {
        let uiDiscard = UI.removeChildren(UI.discard)
        let player = PLAYERS[TURN];
        if (player.discard) {
            player.discard.forEach((card, id) => {
                card.render(uiDiscard, id, "discard")
            })
        }
    }
};

document.addEventListener('DOMContentLoaded', function init() {
        UI.box = document.getElementById('app');
        UI.title = document.getElementById('title');
        UI.exit =  document.getElementById('exit');
        UI.supply = document.getElementById('supply');
        UI.basicSupply = document.getElementById('supply-basic');
        UI.kingdomSupply = document.getElementById('supply-kingdom');
        UI.btn = document.getElementById('ui-btn-0');
        UI.hand = document.getElementById('hand');
        UI.played = document.getElementById('played')
        UI.deck = document.getElementById('deck')
        UI.hand = document.getElementById('hand')
        UI.discard = document.getElementById('discard')
    PLAYERS.forEach(player => {
        //player.name = prompt(`Player ${player.index}, what is your name?`)
        console.log(this)
        PLAYERS[0].name = "FX";
        PLAYERS[1].name = "AI";
        player.makeStartingDeck();
        player.draw(5)
    })
    // kick off the game
    PLAYERS[TURN].startTurn()
})



// class for cards
class Card {
    constructor(name, cost, buyable, imageUrl, type, treasureVal, victoryVal, playMethod) {
        this.name = name;
        this.cost = cost;
        this.buyable = buyable;
        this.imageUrl = imageUrl;
        this.type = type;
        this.treasureVal = treasureVal;
        this.victoryVal = victoryVal
        this.play = playMethod;
        this.ui;
        this.uiState;
        // dlog(`Card(${name})`);
    }

    render(hook, id, state) {
        if (!state) {
            state = null;
        }
        // make a wrapper div
        let wrap = document.createElement('div');
        wrap.className = !state ? "card" : `card--${state}`;
        hook.appendChild(wrap);
        // make a card image
        let img = document.createElement('img');
        img.className = "card__img";
        img.id = id;
        img.src = this.imageUrl;
        img.alt = this.name
        // add information about card to itself
        this.ui = wrap;
        this.uiState = state;
        // append image to page
        wrap.appendChild(img);
        return wrap;
    }
}

const PLAY = {
    treasure: function(player) {
        player.treasure += this.treasureVal;
    },
    victory: function(player) {
        // do nothing
    },
    smithy: function(player) {
        player.draw(3);
    },
    witch: function(player) {
        player.draw(2);
        PLAYERS.forEach((person, index) => {
            if (index !== TURN) {
                person.gain("Curse")
            }
        })
    },
    village: function(player) {
        console.log('clicked this: ', this)
        console.log('player', player)
        player.draw(1);               // + 1 cards
        player.actions += 2;          // + 2 actions
    }
}

const CARDS = {
    Copper: ["Copper", 0, true, "img/base/copper.jpg", "Treasure", 1, 0, PLAY.treasure],
    Silver: ["Silver", 3, true, "img/base/silver.jpg", "Treasure", 2, 0, PLAY.treasure],
    Gold:   ["Gold", 6, true, "img/base/gold.jpg", "Treasure", 3, 0, PLAY.treasure],

    Estate: ["Estate", 2, true, "img/base/estate.jpg", "Victory", 0, 1, PLAY.victory],
    Duchy: ["Duchy", 5, true, "img/base/duchy.jpg", "Victory", 0, 3, PLAY.victory],
    Province: ["Province", 8, true, "img/base/province.jpg", "Victory", 0, 8, PLAY.victory],
    Curse: ["Curse", 0, true, "img/base/curse.jpg", "Victory", 0, -1, PLAY.victory],

    Chapel: ["Chapel", 2, true, "img/original/chapel.jpg", "Action", 0, 0, PLAY.kingdom],
    Gardens: ["Gardens", 4, true, "img/original/gardens.jpg", "Victory", 0, 0, PLAY.kingdom],
    Smithy: ["Smithy", 4, true, "img/original/smithy.jpg", "Action", 0, 0, PLAY.smithy],
    Village: ["Village", 3, true, "img/original/village.jpg", "Action", 0, 0, PLAY.village], 
    Witch: ["Witch", 5, true, "img/original/witch.jpg", "Action-Attack", 0, 0, PLAY.witch],
    Empty: ["Empty", null, false, "img/stack-empty0.jpg", null, null, null, null],
    CardBack: ["CardBack", null, false, "img/card-back.jpg", null, null, null, null]
}

// makes 0 to n cards, takes n and an array of arguments for the card constructor
function makeCards(n, card) {
    dlog(`makeCards(${n}, ${card[0]})`);
    let output = [];
    for (n; n > 0; n--) {
        output.push(new Card(...card));
    }
    return output;
}
// makes a starter deck of 10 cards

// shuffles an array into a new array. Randomness limited by Math.random(). 
// TODO: implement shuffling in place with Fisher-Yates or equivalent.
// TODO: implement using better RNG
function gShuffle(cardsArr, nameStr) {
    dlog(`global.shuffle(${nameStr ? nameStr : "cards" })`);
    let shuffled = [];
    while (cardsArr.length > 0) {
        shuffled.push(cardsArr.splice(Math.floor(Math.random() * cardsArr.length), 1)[0]); // remember to de-reference splice
    }
    return shuffled;
}

class Player {
    constructor(index) {
        this.name;
        this.index = index;
        this.turnState = null;
        this.deck = [];
        this.hand = [];
        this.uiHand = [];
        this.played = [];
        this.discard = [];
        this.treasure = 0;
        this.actions = 1;
        this.buys = 1;
        this.uiHand = document.getElementById('hand')
        this.uiPlayed = document.getElementById('played')
        this.uiButton = document.getElementById('exit')

        dlog(`Player(${index})`);
    }
    makeStartingDeck() {
        dlog(`makeDeck(${this.name})`);
        // makes a starter deck
        let deck = [];
        deck.push(...makeCards(8, CARDS.Copper));
        deck.push(...makeCards(0, CARDS.Estate));
        deck.push(...makeCards(2, CARDS.Village))
        return this.deck = this.shuffle(deck, "starting-deck");
    }
    shuffle(cardsArr, nameStr) {
        dlog(`${this.name}.shuffle(${this.name}.${nameStr ? nameStr : "cards" })`);
        let shuffled = [];
        while (cardsArr.length > 0) {
            shuffled.push(cardsArr.splice(Math.floor(Math.random() * cardsArr.length), 1)[0]); // remember to de-reference splice
        }
        return shuffled;
    }
    draw(n) {
        dlog(`draw(${n}) from ${this.deck}`)
        while (n > 0) {
            if (this.deck.length > 0) { // if you can, draw
                dlog(`drew ${this.deck[this.deck.length-1].name}`)
                this.hand.push(this.deck.pop()) 
            } else if (this.discard.length > 0) { // if you need to shuffle, shuffle
                console.log('shuffling your deck, hang on.', this.discard.length, 'cards in discard pile')

                this.deck = this.discard.splice(0)
                this.deck = this.shuffle(this.deck, `${this.name}'s deck`)
                this.hand.push(this.deck.pop()) 
            }
            if (!this.deck && !this.discard) { // if you are out of cards, don't draw
                dlog(`out of cards`)
                break;
            }
            n--
        }
        UI.renderDeck()
    }
    gain(cardName) {
        for (let type in SUPPLY) {
                if (SUPPLY[type][cardName]) {                                       // if there is one left
                    SUPPLY[type][cardName]--;                                       // remove it from the supply
                    this.discard.push(new Card(...(CARDS[cardName])));              // add it to current player's discard pile
                    UI.renderSupply();
                    UI.renderDiscard()
                }
            }
        }
    autoPlayTreasures() {
        for(let i = 0; i < this.hand.length; i++) {
            if (this.hand[i].type === "Treasure") {
                this.hand[i].play(i--)
                console.log('Playing treasure')
            }
        }
    }
    buy(cardName) {
        console.log(cardName)
        let card = new Card(...(CARDS[cardName]));
        if (this.treasure >= card.cost && this.buys > 0) {  // if you have enough treasure and enough buys:
            this.treasure -= card.cost;                     // pay the cost of the card
            this.buys--;                                    // decrement the number of buys you have
            this.gain(cardName);                            // gain the card
        }
    }
    playCard(e) {
        let player = PLAYERS[TURN];
        if (player.hand[e.target.id].type.includes("Action") && PHASE === 'action' && player.actions > 0) {
            player.hand[e.target.id].play(player);
            player.played.push(player.hand.splice(e.target.id, 1)[0]);   // move card to played array
        }
        if (player.hand[e.target.id].type.includes("Treasure") && PHASE === 'buy') {
            player.hand[e.target.id].play(player);
            player.played.push(player.hand.splice(e.target.id, 1)[0]);
        }
        player.uiHandRefresh()
        player.uiPlayedRefresh()
    }
    uiHandRefresh() {
        while(this.uiHand.firstChild) {
            this.uiHand.removeChild(this.uiHand.firstChild)
        }
        this.hand.forEach((card, id) => {
            let c = card.render(this.uiHand, id, "hand")
            // 'this' actually works in event handler. Maybe because it's explicitly bound in call of forEach?
            c.addEventListener('click', this.playCard, {once: true}) 
        }, this);
    }
    uiPlayedRefresh() {
        // clear played
        while(this.uiPlayed.firstChild) {
            this.uiPlayed.removeChild(this.uiPlayed.firstChild)
        }
        // render played
        this.played.forEach((card, id) => {
            card.render(this.uiPlayed, id, "played")
        },this);
    }
    actionPhase() {
        // action phase
        PHASE = 'action';
        UI.renderTitle()
        UI.exit.textContent = 'DONE WITH ACTION PHASE'
        UI.exit.addEventListener('click',e => {this.buyPhase()}, {once: true})
        this.uiHandRefresh();
        UI.renderSupply()
    }
    buyPhase() {
        // buy phase
        PHASE = 'buy';
        UI.renderTitle()
        UI.exit.addEventListener('click', e => {this.cleanupPhase()}, {once: true});
        UI.exit.textContent = "DONE WITH BUY PHASE";
        UI.renderSupply()
    }
    cleanupPhase() {
        // cleanup
        PHASE = 'cleanup';
        UI.renderTitle()
        // clear ui
        UI.removeChildren(UI.hand)              // clears ui hand
        UI.removeChildren(UI.played)            // clears ui area for cards in play
        UI.removeChildren(UI.kingdomSupply)     // clears ui of supply cards
        UI.removeChildren(UI.basicSupply)       // clears ui of supply cards
        this.discard = this.discard.concat(this.played.splice(0));      // played cards to discard
        this.played = [];                                               // empty played cards
        this.discard = this.discard.concat(this.hand.splice(0));        // cards remaining in hand to discard
        this.hand = [];                                                 // empty hand
        TURN = ++TURN % NUM_PLAYERS                 // increment turn, mod by number of players to keep within bounds of player array
        this.draw(5)                                // draw up to five cards
        dlog(`end of ${this.name}'s turn`)
        if (gameOver()) {
            scoreGame()
        } else {
            PLAYERS[TURN].startTurn();
        }
    }
    startTurn() {
        dlog(`starting ${this.name}'s turn`);
        alert('it\'s your turn ' + this.name )
        this.buys = 1;          // reset buys
        this.actions = 1;       // reset actions
        this.actionPhase()
        UI.renderDeck()
        UI.renderDiscard()
    }
}


dlog(`NUM_PLAYERS: ${NUM_PLAYERS}`);
dlog(`PLAYERS: ${PLAYERS.map(player => {return 'player 0: ' + player.name})}`);
dlog(`SUPPLY: ${Object.keys(SUPPLY).reduce((acc, key) => {return acc.concat(Object.entries(SUPPLY[key]).map(entry => entry.reduce((acc, next)=> {return next + ' ' + acc})))}, [])}`)
for (let i = 0; i < NUM_PLAYERS; i++) {
    PLAYERS.push(new Player(i));
}
function makeSupply() {
    // dlog(`makeSupply(${NUM_PLAYERS})`)
    switch(NUM_PLAYERS) {
        case 2:
            let supply = {
                basic: {Copper: 1, Silver: 80, Gold: 60, Estate: 8, Duchy: 8, Province: 8, Curse: 10},
                kingdom: {Chapel: 10, Gardens: 10, Smithy: 10, Village: 10, Witch: 10},
                trash: []
            }
            return supply;
        case 3:
            alert('3-player support coming soon. Try 2 players.')
            break;
    }
}


function gameOver() {
    let count = 2;
    for (let type in SUPPLY) {
        // console.log("type: ", type, "SUPPLY: ", SUPPLY);
        if (!Array.isArray(SUPPLY[type])) {     // filter out the trash array, we just want to check the supply piles
            for (let card in SUPPLY[type]) {
                // console.log("card: ", card, "type: ", SUPPLY[type])
                if (type !== "trash" && !SUPPLY[type][card]){
                    dlog(`the ${SUPPLY[type][card]} pile is empty. `)
                    count++
                    if (NUM_PLAYERS < 5 && count > 2) {
                        return true
                    } else if (NUM_PLAYERS > 4 && count > 3 ) {
                        return true
                    }
                }
            }
        }
    }
    return false
}

function scoreGame() {
    let highest = {
        name: null,
        score: null
    };
    PLAYERS.forEach(function(player) {
        console.log(`checking ${player.name}'s score`)
        let cards = [].concat(player.hand, player.deck, player.discard)
        let score = 0;
        console.dir(cards)
        cards.forEach(function(card) {
            score += card.victoryVal
        });
        console.log('score from victory cards: ' + score)
        if (Object.keys(SUPPLY.kingdom).includes('Gardens')) {
            let n = Math.floor(cards.length/10);
            let g = 0;
            cards.forEach(card => {
                if (card.name === "Gardens") {
                    g++
                }
            });
            console.log(`${player.name} scored ${n * g} with Gardens. d/10: ${n} g: ${g}`)
            score += g * n
        };
        console.log(player.score, highest.score, player.score > highest.score)
        if (score > highest.score) {
            highest.name = player.name;
            highest.score = score;
        };
    });
    alert('the player with the highest score was: ' + highest.name + ' with a score of ' + highest.score + '. Congratulations! Good game, and thank you for playing.')
    return highest
};
var f = PLAYERS[0];
var a = PLAYERS[1];
var s = SUPPLY

// // 2 players  8 victory, 10 curse 
// // 3 players  12 victory, 20 curse
// // 4 players  12 victory, 30 curse
// // 5 players  15 Provinces, 40 curse, 4 supply piles
// // 6 players  18 Provinces, 50 curse, 4 supply piles


// // Copper (2 players): 46 (optionally 106)
// // Copper (3 players): 39 (optionally 99)
// // Copper (4 players): 32 (optionally 92)
// // Copper (5 players): 85
// // Copper (6 players): 78
// // Silver (2-4 players): 40 (optionally 80)
// // Silver (5-6 players): 80
// // Gold (2-4 players): 30 (optionally 60)
// // Gold (5-6 players): 60
// // Potion (if used): 16
// // Platinum (if used): 12
// // Kingdom cards used (Non-victory): 10
// // Kingdom cards used (Victory, 2 players): 8
// // Kingdom cards used (Victory, 3-6 players): 12
// // Diadem: 0 in Supply, 1 not in Supply
// // Spoils: 0 in Supply, 15 not in Supply
// // https://boardgamegeek.com/thread/867734/how-many-treasure-cards-supply