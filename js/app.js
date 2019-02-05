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
            player.played.push(player.hand.splice([i], 1)[0])
            player.treasure += this.treasureVal;
        }
    },
    victory: function(i) {
        // do nothing
    },
    kingdom: function(i) {
        // do nothing
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
    Smithy: ["Smithy", 4, true, "img/original/smithy.jpg", "Action", 0, 0, PLAY.kingdom],
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
        // buy phase
        alert('starting buy phase');
        PHASE = 'buy';
        console.log(this)
        this.autoPlayTreasures();
        this.buy(prompt(`You have ${this.treasure} treasure. What would you like to buy?`));
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
        this.buys = 1;                              //reset buys
        this.actions = 1;                           // reset actions
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
                    } else if (NUM_PLAYERS >4 && count > 3 ) {
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

// function takeTurn() {
//     dlog(`Player${0}`)
//     PHASE = "buy";


    

//     function startBuyPhase() {
        
//     }
// }

// start game
    // for each player
        // start turn
        // action phase
        // buy phase 
        // clean up



//     gain(card, supply) {
//         console.log('gain', card)
//         console.log(supply.basic[card])
//         if (supply.basic[card]) {
//             this.discard.push(supply.basic[card].pop())
//             this.treasure -= supply.basic[card].cost
//         } else if (supply.kingdom[card]) {
//             this.discard.push(supply.kingdom[card].pop())
//             this.treasure -= supply.kingdom[card].cost
//         }
//         renderStacks(supply)
//     }
//     draw(n) {
//         while (n > 0) {
//             if (!this.deck && !this.discard) {
//                 console.log("no cards left!")
//                 break;
//             } else if (!this.deck) {
//                 console.log('shuffling your deck, hang on.', this.discard.length, 'cards in discard pile')
//                 this.deck = shuffle(discard.splice())
//             }

//             console.log('drawing,', n, 'left')
//             this.hand.push(this.deck.pop()) 
//             n--
//         }
//         renderHand(this)
//         renderDeck(this)
//         return this.hand
//     }
//     discardRandom(n) {
//         if (this.hand) {
//             while (n > 0) {
//                 console.log('discarding,', n, 'left')
//                 this.discard.push(this.hand.splice(Math.floor(Math.random() * this.hand.length), 1)[0]) // discard random index of hand, remember to de-reference splice
//                 n--
//             }
//         }
//         renderHand(this)
//         return this.hand
//     }
//     discardSpecific(index) {
//         if(this.hand && this.hand[index]) {
//             discard.push(this.hand.splice(index, 1))
//         }
//         renderHand(this)
//         return this.hand
//     }

//     trashRandom() {

//     }
//     trashSpecific() {

//     }
// }



// function makeSupply(nPlayers) {
//     if (nPlayers === 2) {
//         let supply = {
//             basic: {
//                 copper: makeCards(106, cardsArr.copper),
//                 silver: makeCards(80, cardsArr.silver),
//                 gold: makeCards(60, cardsArr.gold),
//                 estate: makeCards(8, cardsArr.estate),
//                 duchy: makeCards(8, cardsArr.duchy),
//                 province: makeCards(8, cardsArr.province),
//                 curse: makeCards(10, cardsArr.curse)
//             },
//             kingdom: {
//                 chapel: makeCards(10, cardsArr.chapel),
//                 gardens: makeCards(10, cardsArr.gardens),
//                 smithy: makeCards(10, cardsArr.smithy),
//                 village: makeCards(10, cardsArr.village),
//                 witch: makeCards(10, cardsArr.witch)
//             },
//             trash: []
//         }

//         return supply
//     }
    
// }



// function renderStacks(supply) {
//     let parent = document.getElementById('supply');
//     while(parent.firstChild) {
//         parent.removeChild(parent.firstChild)
//     }
//     let heading = document.createElement('h2')
//     heading.textContent = "Basic Supply";
//     parent.appendChild(heading)
//     let i = 0;
//     for (let card in supply.basic) {
//         let stack = document.createElement('div');
//         let img = document.createElement('img');
//         stack.className = 'stack'
//         img.className = 'stack__img b' + i++;
//         img.id = supply.basic[card][0].name;
//         if (supply.basic[card]) {
//             console.log(supply.basic[card][0].name)
//             img.alt = supply.basic[card][0].name;
//             img.src = supply.basic[card][0].imageUrl;
//         } else {
//             img.alt = "empty stack";
//             img.src = "./img/base/stack-empty0.jpg";
//         }
//         parent.appendChild(stack);
//         stack.appendChild(img);
//     }
//     // kingdom
//     heading = document.createElement('h2');
//     heading.textContent = "Kingdom";
//     parent.appendChild(heading);
//     i = 0;
//     for (let card in supply.kingdom) {
//         let stack = document.createElement('div');
//         let img = document.createElement('img');
//         stack.className = 'stack'
//         img.className = 'stack__img k' + i++;
//         img.id = supply.kingdom[card][0].name;
//         if (supply.kingdom[card]) {
//             console.log(supply.kingdom[card][0].name);
//             img.alt = supply.kingdom[card][0].name;
//             img.src = supply.kingdom[card][0].imageUrl;
//         } else {
//             img.alt = "empty stack";
//             img.src = "./img/base/stack-empty0.jpg";
//         }
//         parent.appendChild(stack);
//         stack.appendChild(img);
//     }
//     // trash
//     heading = document.createElement('h2')
//     heading.textContent = "Trash"
//     parent.appendChild(heading)

//     let trash = document.createElement('div')
//     let trashBackground = document.createElement('img')
//     trash.className = "stack stack--trash";
//     trashBackground.src = "./img/base/trash.jpg";
//     trashBackground.className = "stack__img--trash";

//     parent.appendChild(trash)
//     trash.appendChild(trashBackground)
// }

// function renderHand(player) {
//     let handArea = document.querySelector('.player-item__hand');
//     while (handArea.firstChild) {
//         handArea.remove(handArea.firstChild);
//     }
//     let heading = document.createElement('h3')
//     heading.textContent = "Hand"
//     handArea.appendChild(heading)
//     player.hand.forEach((card, index) => {
//         let cardImg = document.createElement('img');
//         cardImg.src = card.imageUrl
//         cardImg.className = `hand-card hand-card--${index} stack__img`
//         cardImg.id = `${index}`
//         handArea.appendChild(cardImg)
//     })
// }

// function renderDeck(player) {
//     let deckArea = document.querySelector('.player-item__deck')
//     while (deckArea.firstChild) {
//         deckArea.remove(deckArea.firstChild);
//     }
//     let heading = document.createElement('h3');
//     heading.textContent = "Deck";
//     deckArea.appendChild(heading)
//     if (player.deck) {
//         let stack = document.createElement('div');
//         let img = document.createElement('img');
//         stack.className = 'stack'
//         img.className = 'stack__img';
//         img.src = "./img/card-back.jpg";
//         deckArea.appendChild(stack)
//         stack.appendChild(img)
//     }
// }



// function init() {
//     p = new Player();
//     s = makeSupply(2);

//     renderStacks(s);
//     p.draw(5)
// }
// init()
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


// function buyPhase(player, supply) {
//     // attach event listeners to treasures in hand
//     Array.from(document.querySelectorAll('.player-item__hand img')).forEach(card => {
//         if (player.hand[card.id].type === "Treasure") {
//             card.addEventListener('click', function treasureHandler(e) {
//                 console.log(e.target.id)
//                 let amount = player.hand[e.target.id].treasureVal;                  
//                 // push the card from hand into played
//                 player.played.push(player.hand.splice(e.target.id, 1)[0]);
//                 let temp = e.target.parentElement.removeChild(e.target);
//                 document.querySelector('.player-item__in-play').appendChild(temp);
//                 e.target.removeEventListener('click', treasureHandler);           // remove event listener
//                 player.treasure += amount                                       
//             })
//         }
//     })

//     Array.from(document.querySelectorAll('#supply .stack__img')).forEach(card => {
//         if (cardsArr[card.id.toLowerCase()][2]) {
//             card.addEventListener('click', function buyHandler(e) {
//                 let id = e.target.id.toLowerCase()
//                 console.log('click')
//                 if (player.treasure >= cardsArr[id][1]) {
//                     player.gain(card.id, supply)
//                 }
//             })
//         } 
//     })
// }