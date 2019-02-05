// toggle for debug messages
var DEBUG = true;
function dlog(message) {
    if (DEBUG) {
        console.log(message);
    }
}
// class for cards
class Card {
    constructor(name, cost, buyable, imageUrl, type, treasureVal, victoryVal, playMethod) {
        this.name = name;
        this.cost = cost;
        this.buyable = buyable;
        this.imageUrl = imageUrl;
        this.type = type;
        this.treasureVal = treasureVal;
        this.play = playMethod;
        // dlog(`Card(${name})`);
    }
}

const PLAY = {
    treasure: function(i) {
        // for now we will use a simple index
        // e will be an event, html cards in hand must have ids that will parse to an integer index for position in hand
        let player = PLAYERS[TURN];
        if (PHASE === "buy") {
            player.played.push(player.hand.splice(i, 1)[0])
            player.treasure += this.treasureVal;
        }
    },
    victory: function(i) {
        // do nothing
    },
    smithy: function(i) {
        let player = PLAYERS[TURN];
        console.log()
        if (PHASE === 'action' && player.actions > 0) {
                player.actions--
                player.draw(3);
                player.played.push((player.hand.splice(i, 1)[0]))
        }
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
    Village: ["Village", 3, true, "img/original/village.jpg", "Action", 0, 0, PLAY.kingdom], 
    Witch: ["Witch", 5, true, "img/original/witch.jpg", "Action-Attack", 0, 0, PLAY.kingdom],
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
        this.played = []
        this.discard = [];
        this.treasure = 0;
        this.actions = 1;
        this.buys = 1;

        dlog(`Player(${index})`);
    }
    makeStartingDeck() {
        dlog(`makeDeck(${this.name})`);
        // makes a starter deck
        let deck = [];
        deck.push(...makeCards(7, CARDS.Copper));
        deck.push(...makeCards(3, CARDS.Estate));
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
        console.dir(this.deck)
        while (n > 0) {
            if (this.deck.length > 0) { // if you can, draw
                console.log('deck exists')
                dlog(`drew ${this.deck[this.deck.length-1].name}`)
                this.hand.push(this.deck.pop()) 
            } else if (this.discard.length > 0) { // if you need to shuffle, shuffle
                console.log('shuffling your deck, hang on.', this.discard.length, 'cards in discard pile')
                console.log(this.name)
                console.dir(this.discard)
                this.deck = this.discard.splice(0)
                console.dir(this.deck)
                this.deck = this.shuffle(this.deck, `${this.name}'s deck`)
                console.dir(this.deck)
                this.hand.push(this.deck.pop()) 
            }
            if (!this.deck && !this.discard) { // if you are out of cards, don't draw
                dlog(`out of cards`)
                break;
            }
            n--
        }
    }
    gain(cardName) {
        for (let type in SUPPLY) {
            console.log('type', type, 'cardName', cardName, 'SUPPLY[type][cardName]', SUPPLY[type][cardName])
                if (SUPPLY[type][cardName]) {                                       // if there is one left
                    console.log('type', type, 'cardName', cardName, 'SUPPLY[type][cardName]', SUPPLY[type][cardName])
                    SUPPLY[type][cardName]--;                                       // remove it from the supply
                    this.discard.push(new Card(...(CARDS[cardName])));              // add it to current player's discard pile
                    console.dir(this.discard)
//TODO              if (!SUPPLY[type][card]) {stack.img.src= "empty-stack0.jpg"}    // if pile is now empty show an empty pile
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
            console.log('treasure amt', this.treasure, 'card.cost', card.cost, 'buys', this.buys)
            console.log(this.treasure >= card.cost && this.buys > 0)
            this.treasure -= card.cost;                     // pay the cost of the card
            this.buys--;                                    // decrement the number of buys you have
            this.gain(cardName);                            // gain the card
        }
    }


    takeTurn() {
        alert('it\'s your turn ' + this.name )
        dlog(`starting ${this.name}'s turn`);
        this.buys = 1;      //reset buys
        this.actions = 1;   // reset actions
        // action phase
        alert('starting action phase')
        PHASE = 'action'
        let promptString = 'Hand:'
        this.hand.forEach((card, i) => {
            promptString += `
            [${i}]: ${this.hand[i].name}`;
        }, this.hand)
        let input = parseInt(prompt(promptString))
        if (input) {
            this.hand[input].play()
        }




        // buy phase
        alert('starting buy phase');
        PHASE = 'buy';
        console.log(this);
        this.autoPlayTreasures();
        input = prompt(`You have ${this.treasure} treasure. What would you like to buy?`);
        console.log(input)
        if (!input) {
            input = prompt(`Try again! You have ${this.treasure} treasure. What would you like to buy?`);
        }
        if (input) {
            this.buy(input)
        }

        setTimeout(alert('Ending your turn'), 3000);
        // cleanup
        PHASE = 'cleanup';
        console.log('cleanup', 'initial discard')
        console.dir(this.discard)
        console.dir(this.played)
        this.discard = this.discard.concat(this.played.splice(0));      // played cards to discard
        this.played = [];                                               // empty played cards
        console.log('played cards have been discarded')
        console.dir(this.discard)
        this.discard = this.discard.concat(this.hand.splice(0));        // cards remaining in hand to discard
        console.log('cards left in hand have been discarded')
        console.dir(this.discard)
        this.hand = [];                                                 // empty hand
        TURN = ++TURN % NUM_PLAYERS                 // increment turn, mod by number of players to keep within bounds of player array
        console.log('TURN', TURN, 'NUM_PLAYERS', NUM_PLAYERS, 'MOD', TURN % NUM_PLAYERS)
        this.draw(5)                                // draw up to five cards
        dlog(`end of ${this.name}'s turn`)          // return to main loop


    }
}

// GLOBALS
const NUM_PLAYERS = 2 //parseInt(prompt("How many players?"));
const PLAYERS = [];
const SUPPLY = makeSupply();
var TURN = 0;
var PHASE = null;
var PAUSE = false;
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
                basic: {Copper: 106, Silver: 80, Gold: 60, Estate: 8, Duchy: 8, Province: 8, Curse: 10},
                kingdom: {Chapel: 10, Gardens: 10, Smithy: 10, Village: 10, Witch: 10},
                trash: []
            }
            return supply;
        case 3:
            alert('3-player support coming soon. Try 2 players.')
            break;
    }
}

PLAYERS.forEach(player => {
    //player.name = prompt(`Player ${player.index}, what is your name?`)
    console.log(this)
    PLAYERS[0].name = "FX";
    PLAYERS[1].name = "AI";
    player.makeStartingDeck();
    player.draw(5)
})

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
    players.forEach(function(player) {
        console.log(`checking ${player.name}'s score`)
        let cards = [];
        let score = 0;
        cards.concat(player.hand.splice(), player.deck.splice(), player.discard.splice())
        console.dir(cards)
        cards.forEach(function(card) {
            score += card.victory
        })
        if (player.score > highest.score) {
            highest.name = player.name;
            highest.score = player.score;
        }
    })
    alert('the player with the highest score was: ' + highest.name + ' with a score of ' + highest.score + '. Congratulations! Good game, and thank you for playing.')
    return highest
}
var f = PLAYERS[0];
var a = PLAYERS[1];
var s = SUPPLY

function mainLoop() {
    while(!gameOver()) {
        PLAYERS.forEach(function(player) {
            player.takeTurn();
        })
    };
}
mainLoop()

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