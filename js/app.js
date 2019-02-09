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
        UI.headBtn.addEventListener('click', e => {
            UI.hand.scrollIntoView({behavior: "smooth", block: "center", inline: "start"})
        })
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
                        console.log('trying to buy', e.target);
                        if (PLAYERS[TURN].buy(card.name)) {
                            UI.discard.scrollIntoView({behavior: "smooth", block: "end", inline: "start"});
                            UI.renderHandBar();
                            UI.renderDiscard();
                            UI.renderSupply();
                        }
                    })
                } else if (supplyType !== "trash") {
                    console.log(stack + " is out!");
                    let card = new Card(...CARDS["Empty"]);
                    card.render(supplyType === "basic"? uiBasic : uiKingdom, card.name, "supply");
                }
            }
        }
    },
    renderPlayed() {
        console.log('Rendering played', PLAYERS[TURN].name, PLAYERS[TURN].played);
        let player = PLAYERS[TURN]
        UI.clear(UI.played);
        // render played
        player.played.forEach((card, id) => {
            card.render(UI.played, id, "played");
        },this);
    },
    renderHandBar() {
        let p = PLAYERS[TURN];
        console.log('rendering hand bar');
        UI.clear(UI.handBar.container);
        // title
        let title = document.createElement('h3');
        title.id = "hand-title";
        title.className = "card-bar__title--hand";
        title.textContent = `Cards in hand: ${p.hand.length} -- actions: ${p.actions} -- treasure: ${p.treasure} -- buys: ${p.buys}`;
        UI.handBar.container.appendChild(title);
        UI.handBar.title = title;
        // scroll to top button 
        let scrollBtn = document.createElement('button')
        scrollBtn.className = "card-bar__btn";
        scrollBtn.id = "hand-scrollBtn";
        scrollBtn.textContent = "SCROLL TO TOP";
        scrollBtn.addEventListener('click', e => {UI.title.scrollIntoView({behavior: "smooth", block: "start", inline: "start"})})
        UI.handBar.container.appendChild(scrollBtn);
        UI.handBar.scrollBtn = scrollBtn;
        // function button e.g. autoplay treasures or exit trash selection
        let funcBtn = document.createElement('button');
        funcBtn.id = "hand-funcBtn";
        funcBtn.className = "card-bar__btn";
        funcBtn.textContent = "AUTOPLAY TREASURE";
        funcBtn.setAttribute("disabled", "disabled");
        UI.handBar.funcBtn = funcBtn;
        UI.handBar.container.appendChild(funcBtn);
        if (PHASE === "buy") {
            funcBtn.removeAttribute("disabled");
            funcBtn.addEventListener('click', e => {
                if (PLAYERS[TURN].autoPlayTreasures()) {
                    UI.supply.scrollIntoView({behavior: "smooth", block: "start", inline: "start"})
                    UI.renderPlayed()
                    UI.renderHand()
                }
            });
        }
    },
    // todo: implement filter functionality
    renderHand(style, filter, clickHandler=UI.playListener) {
        console.log('Rendering hand for', PLAYERS[TURN].name, PLAYERS[TURN].hand)
        // style: (str) css modifier flag e.g. "active--trash". Used for indicating which cards are clickable.
        // filter: (callback) function that returns true or false based on card properties e.g. "type === 'Treasure'"
        if (PHASE === "buy") {
            if (typeof style === 'undefined') { style = "active--treasure" }
            if (typeof filter === 'undefined') {
                filter = function(card) {
                    if (card.type.includes("Treasure")){
                        //console.log('default filter: treasure', card);
                        return true;
                    }
                    return false;
                }
            }
        }
        if (PHASE === "action") {
            if (typeof style === 'undefined') {style = "active--action";} 
            if (typeof filter === 'undefined') {
                filter = function(card) {
                    if (card.type.includes("Action")) {
                        //console.log('default filter: action', card)
                        return true
                    }
                    return false;
                }
            }
        }
        UI.clear(UI.hand);
        PLAYERS[TURN].hand.forEach((card, id) => {
            //console.log(filter(card), filter(card) ? "hand" + style : "hand")
            let cardNode = card.render(UI.hand, id, filter(card) ? "hand " + style : "hand")
            //console.log('filter: ', filter(card), card)
            if (filter(card)) {
                cardNode.firstChild.addEventListener('click', clickHandler) 
            }
        })
    },
    renderDeck() {
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
            UI.renderHandBar()
            UI.renderHand()
            UI.renderPlayed()
        }
    },
    gainSelector: function(cardName, n, upToN, filter, result, player=PLAYERS[TURN], where="discard") {

    },
    trashSelector: function(cardName, n, upToN, filter, result, player=PLAYERS[TURN], where="hand") {
        // cardName: (str) the triggering card or event
        // n: (int) number to trash,
        // upToN: (bool) true =>'trash up to n cards' false => 'trash n cards, 
        // filter: (function) callback that takes one card arg and returns true or false. Defaults to true, which is all cards in selected pool.
        // result: (function) callback to execute if trash is successful.
        // player: (Player object) the selecting player. defaults to current player.
        // where: (array of cards) where to select trash from. defaults to hand. 
        if (typeof filter === 'undefined') {filter = function(card) {return true}}
        if (where === "hand") {
            console.log('in hand')
            UI.handBar.title.textContent = `Cards in hand: trash ${upToN ? "up to ": "no fewer than"}${n} cards. (${cardName})`
            UI.handBar.funcBtn.textContent = "EXIT " + cardName.toUpperCase() + " TRASH SELECTION";
            UI.handBar.funcBtn.setAttribute('disabled', 'disabled');
            UI.exit.setAttribute('disabled', 'disabled');
            setTimeout(function() { // need to set a timeout because on a successfully played card the UI will refresh, removing trash listener and styles
                if (!n | upToN) {
                    console.log('in block0')
                    UI.handBar.funcBtn.removeAttribute('disabled')
                    UI.handBar.funcBtn.addEventListener('click', e => {
                        console.log('click', e.target)
                        UI.exit.removeAttribute('disabled');
                        UI.renderHandBar()
                        UI.renderHand()
                    });
                }
                // if the trash is not optional, we need to make sure we don't trap the user if they have no viable trash, 
                // e.g. if their hand is empty
                if (!upToN) {
                    console.log('in block1')
                    let filterFail = true;
                    player.hand.forEach(card => {
                        if (filter(card)) {
                            console.log(card, 'failed trash filter')
                            filterFail = false;
                        }
                    });
                    if (filterFail) {
                        UI.handBarBtn.removeAttribute('disabled')
                        console.log('canceling trash selection, no viable trash')
                        UI.handBarBtn.click();
                    }
                }
                UI.renderHand("active--trash", filter, function(e) {
                    let trashSuccess = player.trashCard(e.target.id)
                    if (typeof result !== 'undefined') {
                        result(trashSuccess);
                    }
                    if (trashSuccess) {
                        n--;
                        if (n > 0) {
                            console.log(this)
                            console.log(cardName, n, upToN, filter, result, player, where)
                            UI.trashSelector(cardName, n, upToN, filter, result, player, where)
                        } else {
                            UI.handBar.funcBtn.click();
                        } 
                    }
                })
            }, 1) // any amount of time should work
        }
    }
}
document.addEventListener('DOMContentLoaded', function init() {
        UI.box = document.getElementById('app');
        UI.title = document.getElementById('title');
        UI.headBtn = document.getElementById('scroll-down')
        UI.exit =  document.getElementById('exit');

        UI.supply = document.getElementById('supply');
        UI.basicSupply = document.getElementById('supply-basic');
        UI.kingdomSupply = document.getElementById('supply-kingdom');

        UI.hand = document.getElementById('hand');
        UI.handBar = {
            container: document.getElementById('hand-bar'),
            title: document.getElementById('hand-title'),
            funcBtn: document.getElementById('hand-funcBtn'),
            scrollBtn: document.getElementById('hand-scrollBtn')
        }
        UI.played = document.getElementById('played');

        UI.deckTitle = document.getElementById('deck-title')
        UI.deck = document.getElementById('deck');

        UI.discard = document.getElementById('discard');
        UI.trash = document.getElementById('trash')
    PLAYERS.forEach(player => {
        // player.name = prompt(`Player ${player.index}, what is your name?`)
        PLAYERS[0].name = "ME";
        PLAYERS[1].name = "ME2";
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
        if (this.deck.length === 0) {
            UI.renderDeck()
        }
        if (this.discard.length === 0) {
            UI.renderDiscard()
        }
    }
    gain(cardName) {
        console.log(`gaining ${cardName}`);
            let type = SUPPLY.basic[cardName]? "basic" : "kingdom";
            if (SUPPLY[type][cardName]) {                                       // if there is one left
                SUPPLY[type][cardName]--;                                       // remove it from the supply
                this.discard.unshift(new Card(...(CARDS[cardName])));              // add it to current player's discard pile
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
            count? UI.renderHandBar() : null;
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
                    let card = this.hand.splice(i, 1)[0]
                    this.played.push(card)
                    card.play(this)
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
                UI.hand.scrollIntoView({behavior: "smooth", block: "center", inline: "start"})
            }, {once: true})
            UI.renderHand();
            UI.renderSupply()
        } else {                // if returning to action phase
            console.log(`returning to ${this.name}'s action phase`)
            UI.renderHand()
            UI.renderHandBar()
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
            console.log(`returning to ${this.name}'s buy phase`);
            UI.renderHand()
            UI.renderHandBar()
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
var me1 = PLAYERS[0];
var me2 = PLAYERS[1];
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

// default filter for cards
function defaultHandFilter(card) {
    console.log("filtering", card)
    if (PHASE === "buy") {
        if (card.type.includes("Treasure")){
            console.log('treasure')
            return true
        }
    }   else if (PHASE === "action") {
        if (card.type.includes("Action")) {
            console.log('action')
            return true
        } else {
        }
    }
    console.log('fail filter')
    return false
}