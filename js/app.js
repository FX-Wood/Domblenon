// GLOBALS
const NUM_PLAYERS = 2 //parseInt(prompt("How many players?"));
const PLAYERS = [];
const SUPPLY = makeSupply(NUM_PLAYERS);
var TURN = 0;
var PHASE = null;
var DONE = false;
const UI = {
    clear: function(parent) {
        while (parent.firstChild) {
            parent.removeChild(parent.firstChild)
        }
        return parent
    },
    renderTitle: function() {
        console.log('Rendering title', PLAYERS[TURN].name);
        UI.title.textContent = `${PLAYERS[TURN].name}: ${PHASE} phase`;
    },
    renderSupply: function() {
        console.log('Rendering supply', SUPPLY)
        let uiBasic = UI.clear(UI.basicSupply);
        let uiKingdom = UI.clear(UI.kingdomSupply);
        for (supplyType in SUPPLY) {
            for (stack in SUPPLY[supplyType]) {
                if (SUPPLY[supplyType][stack] && supplyType !== "trash") {
                    let card = new Card(...CARDS[stack]);
                    let renderStyle = PHASE === "buy"? "supply active--buy" : "supply";
                    let renderHook = supplyType === "basic"? uiBasic : uiKingdom
                    card.render(renderHook, card.name, renderStyle)
                    .addEventListener('click', e => {
                        console.log('trying to buy', e.target)
                        if (PLAYERS[TURN].buy(card.name)) {
                            UI.discard.scrollIntoView({behavior: "smooth", block: "end"})
                            UI.renderDiscard()
                            UI.renderSupply() 
                        }
                    })
                } else if (supplyType !== "trash") {
                    console.log(stack + " is out!")
                    let card = new Card(...CARDS["Empty"]);
                    card.render(supplyType === "basic"? uiBasic : uiKingdom, card.name, "supply");
                }
            }
        }
    },
    renderPlayed() {
        console.log('Rendering played', PLAYERS[TURN].name, PLAYERS[TURN].played)
        let player = PLAYERS[TURN]
        UI.clear(UI.played)
        // render played
        player.played.forEach((card, id) => {
            card.render(UI.played, id, "played")
        },this);
    },
    renderHandBar() {
        console.log('rendering hand bar')
        UI.clear(UI.handBar)
        // title
        let title = document.createElement('h3');
        title.id = "hand-title";
        title.className = "card-bar__title--hand";
        title.textContent = "Cards in hand";
        UI.handBar.appendChild(title)
        // autoplay treasures button
        // scroll to top button 
        let btn = document.createElement('button')
        UI.handBarBtn = btn;
        btn.id = "hand-btn"
        btn.className = "card-bar__btn"
        btn.textContent = "SCROLL TO TOP";
        
        UI.handBar.appendChild(btn)
        btn.addEventListener('click', e => {
            UI.title.scrollIntoView({behavior: "smooth", block: "center"})
        })
        if (PHASE === "buy") {
            let autoPlayBtn = document.createElement('button');
            autoPlayBtn.textContent = 'AUTOPLAY TREASURES';
            autoPlayBtn.className = "card-bar__btn";
            UI.handBar.appendChild(autoPlayBtn);
            autoPlayBtn.addEventListener('click', e => {
                if (PLAYERS[TURN].autoPlayTreasures()) {
                    UI.supply.scrollIntoView({behavior: "smooth", block: "start"})
                    UI.renderPlayed()
                    UI.renderHand()
                }
            });
        }
    },
    renderHand(style) {
        console.log('Rendering hand', PLAYERS[TURN].name, PLAYERS[TURN].hand)
        UI.clear(UI.hand)

        PLAYERS[TURN].hand.forEach((card, id) => {
            let cardNode = card.render(UI.hand, id, "hand " + style)
            cardNode.addEventListener('click', UI.playListener) 
        }, this);
    },
    renderDeck: function() {
        console.log('Rendering deck', PLAYERS[TURN].name, PLAYERS[TURN].deck.length)
        UI.clear(UI.deck);
        if (PLAYERS[TURN].deck.length > 0) {
            new Card(...CARDS["CardBack"]).render(UI.deck, "CardBack", "deck")
        } else {
            new Card(...CARDS["Empty"]).render(UI.deck, "Empty", "deck")
        }
    },
    renderDiscard() {
        console.log('Rendering discard', PLAYERS[TURN].name, PLAYERS[TURN].discard)
        UI.clear(UI.discard)
        if (PLAYERS[TURN].discard) {
            PLAYERS[TURN].discard.forEach((card, id) => {
                card.render(UI.discard, id, "discard")
            })
        }
    },
    renderTrash() {
        console.log('Rendering trash', SUPPLY[trash])
        UI.clear(UI.trash);
        if (SUPPLY.trash) {
            SUPPLY.trash.forEach((card, id) => {
                card.render(UI.trash, id, "trash")
            })
        }
    },
    playListener(e) {
        console.log('click', e.target)
        let player = PLAYERS[TURN];
        let success = false;
        switch(PHASE) {
            case "action":
                success = player.playAction(e.target.id)
                break;
            case "buy":
                success = player.playTreasure(e.target.id)
                break;
        }
        if (success) {
            UI.renderHand()
            UI.renderPlayed()
        }
    },
    renderTrashSelector: function(n, upToN, message) {
        // n: (int) number to trash,
        // upToN: (bool) true =>'trash up to n cards' false => 'trash n cards, 
        // message: (str) the triggering card or event
        UI.handBarTitle.textContent = `Cards in hand: trash ${upToN? "up to ": "no fewer than"}${n} cards. (${message})`
        UI.handBarBtn.textContent = "EXIT " + message.toUpperCase() + " TRASH SELECTION"
        UI.hand.scrollIntoView({behavior: "smooth", block: "center"}); // bring ui focus to player's hand
        if (n) {
            console.log('else')
            setTimeout(() => { // must set a timeout or render after playing card will clear listener
                UI.renderHand("active--trash")
                Array.from(UI.hand.children).forEach(child => { 
                    child.firstChild.classList.toggle('active')   
                    child.firstChild.addEventListener('click', e => {
                        e.stopPropagation()
                        if (PLAYERS[TURN].trashCard(e.target.id)) {
                            UI.renderHand("active--trash")
                            UI.renderTrash()
                            UI.renderTrashSelector(--n, upToN, message)
                        }
                    }, {once: true});
                });
            }, 100)
        }
        if (!n || upToN) { // if the number of trashes is 0 or trash is optional
            if (!UI.handBarBtn.dataset.trashSelector) {
                UI.handBarBtn.dataset.trashSelector = true;
                console.log('adding event listener to chapel exit button')
                UI.handBarBtn.addEventListener('click', e => {
                    console.log("clicked", e.target, "trying to end trash selection");
                    e.stopImmediatePropagation();
                    e.preventDefault();
                    UI.handBarBtn.dataset.trashSelector = false;
                    UI.handBarTitle.textContent = 'Cards in hand';
                    UI.handBarBtn.textContent = `AUTOPLAY TREASURES`;
                    switch (PHASE) {
                        case "action": 
                            PLAYERS[TURN].actionPhase();
                            UI.renderHand("active--action");
                            break;
                        case "buy":
                            PLAYERS[TURN].buyPhase();
                            UI.renderSupply()
                            break;
                        case "cleanup":
                            PLAYERS[TURN].cleanupPhase();
                    }
                }, {once: true})
            }
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

        UI.handBar = document.getElementById('hand-bar');
        UI.handBarTitle = document.getElementById('hand-title');
        UI.handBarBtn = document.getElementById('hand-btn');
        UI.hand = document.getElementById('hand');


        UI.played = document.getElementById('played');

        UI.deckTitle = document.getElementById('deck-title')
        UI.deck = document.getElementById('deck');

        UI.discard = document.getElementById('discard');
        UI.trash = document.getElementById('trash')
    PLAYERS.forEach(player => {
        // player.name = prompt(`Player ${player.index}, what is your name?`)
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
    }

    render(hook, id, state) {

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
    chapel: function(player) {
        // trash up to 4 cards
        UI.renderTrashSelector(4, true, "Chapel") // upToN bool is true
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
        });
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

    Chapel: ["Chapel", 2, true, "img/original/chapel.jpg", "Action", 0, 0, PLAY.chapel],
    Gardens: ["Gardens", 4, true, "img/original/gardens.jpg", "Victory", 0, 0, PLAY.kingdom],
    Smithy: ["Smithy", 4, true, "img/original/smithy.jpg", "Action", 0, 0, PLAY.smithy],
    Village: ["Village", 3, true, "img/original/village.jpg", "Action", 0, 0, PLAY.village], 
    Witch: ["Witch", 5, true, "img/original/witch.jpg", "Action-Attack", 0, 0, PLAY.witch],
    Empty: ["Empty", null, false, "img/stack-empty0.jpg", null, null, null, null],
    CardBack: ["CardBack", null, false, "img/card-back.jpg", null, null, null, null]
}

// makes 0 to n cards, takes n and an array of arguments for the card constructor
function makeCards(n, card) {
    console.log(`makeCards(${n}, ${card[0]})`);
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
    console.log(`global.shuffle(${nameStr ? nameStr : "cards" })`);
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
    }
    makeStartingDeck() {
        console.log(`making ${this.name}'s deck`);
        // makes a starter deck
        let deck = [];
        deck.push(...makeCards(7, CARDS.Copper));
        deck.push(...makeCards(3, CARDS.Estate));
        return this.deck = this.shuffle(deck, "starting-deck");
    }
    shuffle(cardsArr, nameStr) {
        // console.log(`${this.name}.shuffle(${this.name}.${nameStr ? nameStr : "cards" })`);
        let shuffled = [];
        while (cardsArr.length > 0) {
            shuffled.push(cardsArr.splice(Math.floor(Math.random() * cardsArr.length), 1)[0]); // remember to de-reference splice
        }
        return shuffled;
    }
    draw(n) {
        console.log(`${this.name} drew ${n} from ${this.name}'s deck`)
        while (n > 0) {
            if (this.deck.length > 0) { // if you can, draw
                console.log(`drew ${this.deck[this.deck.length-1].name}`)
                this.hand.push(this.deck.pop()) 
            } else if (this.discard.length > 0) { // if you need to shuffle, shuffle
                console.log('shuffling your deck, hang on.', this.discard.length, 'cards in discard pile')

                this.deck = this.discard.splice(0)
                this.deck = this.shuffle(this.deck, `${this.name}'s deck`)
                this.hand.push(this.deck.pop()) 
            }
            if (!this.deck && !this.discard) { // if you are out of cards, don't draw
                console.log(`out of cards`)
                break;
            }
            n--
        }
        UI.renderDeck()
    }
    gain(cardName) {
        console.log(`gaining ${cardName}`);
            let type = SUPPLY.basic[cardName]? "basic" : "kingdom";
            if (SUPPLY[type][cardName]) {                                       // if there is one left
                SUPPLY[type][cardName]--;                                       // remove it from the supply
                this.discard.push(new Card(...(CARDS[cardName])));              // add it to current player's discard pile
                return true;
            }
        console.log(`no ${cardName} in supply`)
        return false;
        }
    autoPlayTreasures() {
        console.log('autoplaying treasure');
        let player = PLAYERS[TURN];
        if (PHASE === 'buy') {
            let count = 0;
            for(let i = 0; i < player.hand.length; i++) {
                if (player.hand[i].type === "Treasure") {
                    if (player.playTreasure(i)) {
                        i--
                        count++
                    }
                }
            }
            console.log(`You played ${count || "no"} treasures`)
            return count? true : false
        } else {
            console.log('not in buy phase');
            return false;
        }
    }
    buy(cardName) {
        let card = new Card(...(CARDS[cardName]));
        if (PHASE === 'buy') {
            if (SUPPLY.basic[cardName] || SUPPLY.kingdom[cardName]) {
                if (this.buys > 0) {  // if you have enough treasure and enough buys:
                    if (this.treasure >= card.cost) {
                        console.log(`you purchased ${cardName} and have ${this.treasure} treasure and ${this.buys} buys remaining`)
                        this.treasure -= card.cost;                     // pay the cost of the card
                        this.buys--;                                    // decrement the number of buys you have
                        this.gain(cardName);                            // gain the card
                        return true
                    } else {
                        console.log('not enough treasure')
                    }
                } else {
                    console.log('not enough buys')
                }
            } else {PLAYERS[TURN].discard
                console.log('none left in supply')
            }
        } else {
            console.log('not in buy phase')
        }
        return false
    }
    playAction(i) {
        console.log(`playing ${this.hand[i].name}`)
        if (PHASE === "action") {
            if (this.hand[i].type.includes("Action")) {
                if (this.actions) {
                    this.hand[i].play(this)
                    this.played.push(this.hand.splice(i, 1)[0])
                    this.actions--
                    console.log('success!')
                    return true
                } else {
                    console.log('not enough actions')
                }
            } else {
                console.log('not an action card')
            }
        } else {
            console.log('not action phase')
        }
        return false
    }
    playTreasure(i) {
        console.log(`playing ${this.hand[i].name}`)
        if (PHASE === "buy") {
            if (this.hand[i].type.includes("Treasure")) {
                this.hand[i].play(this)
                this.played.push(this.hand.splice(i, 1)[0])
                console.log('success!')
                return true
            } else {
                console.log("not a treasure card")
            }
        } else {
            console.log('not in buy phase')
        }
        return false
    }
    trashCard(i) {
        console.log(`trashing ${this.hand[i].name}`)
        if (this.hand[i]) {
            SUPPLY.trash.push(this.hand.splice(i, 1)[0]);
            console.log('success!')
            return true
        } else {
            console.log('that card doesn\'t exist!')
        }
        return false
    }
    actionPhase() {
        UI.renderHandBar()
        if (PHASE !== 'action') { // if switching phases
            console.log(`starting ${this.name}'s action phase`)
            PHASE = 'action';
            UI.renderTitle()
            UI.exit.textContent = 'DONE WITH ACTION PHASE'
            UI.exit.addEventListener('click',e => {
                this.buyPhase();
                UI.hand.scrollIntoView({behavior: "smooth", block: "center"})
            }, {once: true})
            UI.renderHand("active--action");
            UI.renderSupply()
        } else {                // if returning to action phase
            console.log(`returning to ${this.name}'s action phase`)
            UI.renderHand("active--action")
        }
    }
    buyPhase() {
        console.log(`${PHASE === 'buy'? "returning to" : ''} ${this.name}'s buy phase`)
        if (PHASE !== 'buy') {
            PHASE = 'buy';
            UI.renderHandBar()
            UI.renderTitle()
            UI.exit.addEventListener('click', e => {this.cleanupPhase()}, {once: true});
            UI.exit.textContent = "DONE WITH BUY PHASE";
            UI.renderSupply()
        } else {
            console.log(`returning to ${this.name}'s buy phase`)
        }
    }
    cleanupPhase() {
        UI.renderHandBar()
        console.log(`Cleaning up ${this.name}'s turn`)
        // cleanup
        PHASE = 'cleanup';
        UI.renderTitle()
        // clear ui
        UI.clear(UI.hand)              // clears ui hand
        UI.clear(UI.played)            // clears ui area for cards in play
        UI.clear(UI.kingdomSupply)     // clears ui of supply cards
        UI.clear(UI.basicSupply)       // clears ui of supply cards
        this.discard = this.discard.concat(this.played.splice(0));      // played cards to discard
        this.played = [];                                               // empty played cards
        this.discard = this.discard.concat(this.hand.splice(0));        // cards remaining in hand to discard
        this.hand = [];                                                 // empty hand
        this.draw(5)                                // draw up to five cards
        this.treasure = 0;
        TURN = ++TURN % NUM_PLAYERS                 // increment turn, mod by number of players to keep within bounds of player array
        console.log(`end of ${this.name}'s turn`)
        if (gameOver()) {
            scoreGame()
        } else {
            PLAYERS[TURN].startTurn();
        }
    }
    startTurn() {
        UI.renderHandBar()
        console.log(`starting ${this.name}'s turn`);
        alert('it\'s your turn ' + this.name )
        this.buys = 1;          // reset buys
        this.actions = 1;       // reset actions
        this.actionPhase()
        UI.renderDeck()
        UI.renderDiscard()
    }
}


console.log(`NUM_PLAYERS: ${NUM_PLAYERS}`);
console.log(`PLAYERS: ${PLAYERS.map(player => {return 'player 0: ' + player.name})}`);
console.log(`SUPPLY: ${Object.keys(SUPPLY).reduce((acc, key) => {return acc.concat(Object.entries(SUPPLY[key]).map(entry => entry.reduce((acc, next)=> {return next + ' ' + acc})))}, [])}`)
for (let i = 0; i < NUM_PLAYERS; i++) {
    PLAYERS.push(new Player(i));
}


function gameOver() {
    let count = 2;
    for (let type in SUPPLY) {
        // console.log("type: ", type, "SUPPLY: ", SUPPLY);
        if (!Array.isArray(SUPPLY[type])) {     // filter out the trash array, we just want to check the supply piles
            for (let card in SUPPLY[type]) {
                // console.log("card: ", card, "type: ", SUPPLY[type])
                if (type !== "trash" && !SUPPLY[type][card]){
                    console.log(`the ${SUPPLY[type][card]} pile is empty. `)
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
