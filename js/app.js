// class for cards
class Card {
    constructor(name, cost, buyable, imageUrl, type, treasureVal, ) {
        this.name = name;
        this.cost = cost;
        this.buyable = buyable
        this.imageUrl = imageUrl;
        this.type = type
        this.treasureVal = treasureVal

    }
}
// makes 0 to n cards, takes n and an array of arguments for the card constructor
function makeCards(n, card) {
    let output = [];
    for (n; n > 0; n--) {
        output.push(new Card(...card))
    }
    return output
}
// makes a starter deck of 10 cards
function makeDeck() {
    // makes a starter deck
    let deck = [];
    deck.push(...makeCards(7, cardsArr.copper))
    deck.push(...makeCards(3, cardsArr.estate))
    return deck
}
// shuffles an array into a new array. Randomness limited by Math.random(). 
// TODO: implement shuffling in place with Fisher-Yates or equivalent.
// TODO: implement using better RNG
function shuffle(cardsArr) {
    let shuffled = [];
    while (cardsArr.length > 0) {
        shuffled.push(cardsArr.splice(Math.floor(Math.random() * cardsArr.length), 1)[0]) // remember to de-reference splice
    }
    return shuffled
}

class Player {
    constructor(playerIndex) {
        this.playerIndex
        this.deck = shuffle(makeDeck());
        this.hand = [];
        this.played = []
        this.discard = [];
        this.treasure = 0;
        this.actions = 1;
        this.buys = 1;
    }
}

const NUM_PLAYERS = 2 //parseInt(prompt("How many players?"));
const PLAYERS = []
for (let i = NUM_PLAYERS; i > 0; i++) {
    PLAYERS.push(new Player(i))
}



var cardsArr = {
    copper: ["Copper", 0, true, "img/base/copper.jpg", "Treasure", 1],
    silver: ["Silver", 3, true, "img/base/silver.jpg", "Treasure", 2],
    gold:   ["Gold", 6, true, "img/base/gold.jpg", "Treasure", 3],

    estate: ["Estate", 2, true, "img/base/estate.jpg", "Victory", 0],
    duchy: ["Duchy", 5, true, "img/base/duchy.jpg", "Victory", 0],
    province: ["Province", 8, true, "img/base/province.jpg", "Victory", 0],
    curse: ["Curse", 0, true, "img/base/curse.jpg", "Victory", 0],

    chapel: ["Chapel", 2, true, "img/original/chapel.jpg", "Action", 0],
    gardens: ["Gardens", 4, true, "img/original/gardens.jpg", "Victory", 0],
    smithy: ["Smithy", 4, true, "img/original/smithy.jpg", "Action", 0],
    village: ["Village", 3, true, "img/original/village.jpg", "Action", 0], 
    witch: ["Witch", 5, true, "img/original/witch.jpg", "Action-Attack", 0],
}


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



function makeSupply(nPlayers) {
    if (nPlayers === 2) {
        let supply = {
            basic: {
                copper: makeCards(106, cardsArr.copper),
                silver: makeCards(80, cardsArr.silver),
                gold: makeCards(60, cardsArr.gold),
                estate: makeCards(8, cardsArr.estate),
                duchy: makeCards(8, cardsArr.duchy),
                province: makeCards(8, cardsArr.province),
                curse: makeCards(10, cardsArr.curse)
            },
            kingdom: {
                chapel: makeCards(10, cardsArr.chapel),
                gardens: makeCards(10, cardsArr.gardens),
                smithy: makeCards(10, cardsArr.smithy),
                village: makeCards(10, cardsArr.village),
                witch: makeCards(10, cardsArr.witch)
            },
            trash: []
        }

        return supply
    }
    
}



function renderStacks(supply) {
    let parent = document.getElementById('supply');
    while(parent.firstChild) {
        parent.removeChild(parent.firstChild)
    }
    let heading = document.createElement('h2')
    heading.textContent = "Basic Supply";
    parent.appendChild(heading)
    let i = 0;
    for (let card in supply.basic) {
        let stack = document.createElement('div');
        let img = document.createElement('img');
        stack.className = 'stack'
        img.className = 'stack__img b' + i++;
        img.id = supply.basic[card][0].name;
        if (supply.basic[card]) {
            console.log(supply.basic[card][0].name)
            img.alt = supply.basic[card][0].name;
            img.src = supply.basic[card][0].imageUrl;
        } else {
            img.alt = "empty stack";
            img.src = "./img/base/stack-empty0.jpg";
        }
        parent.appendChild(stack);
        stack.appendChild(img);
    }
    // kingdom
    heading = document.createElement('h2');
    heading.textContent = "Kingdom";
    parent.appendChild(heading);
    i = 0;
    for (let card in supply.kingdom) {
        let stack = document.createElement('div');
        let img = document.createElement('img');
        stack.className = 'stack'
        img.className = 'stack__img k' + i++;
        img.id = supply.kingdom[card][0].name;
        if (supply.kingdom[card]) {
            console.log(supply.kingdom[card][0].name);
            img.alt = supply.kingdom[card][0].name;
            img.src = supply.kingdom[card][0].imageUrl;
        } else {
            img.alt = "empty stack";
            img.src = "./img/base/stack-empty0.jpg";
        }
        parent.appendChild(stack);
        stack.appendChild(img);
    }
    // trash
    heading = document.createElement('h2')
    heading.textContent = "Trash"
    parent.appendChild(heading)

    let trash = document.createElement('div')
    let trashBackground = document.createElement('img')
    trash.className = "stack stack--trash";
    trashBackground.src = "./img/base/trash.jpg";
    trashBackground.className = "stack__img--trash";

    parent.appendChild(trash)
    trash.appendChild(trashBackground)
}

function renderHand(player) {
    let handArea = document.querySelector('.player-item__hand');
    while (handArea.firstChild) {
        handArea.remove(handArea.firstChild);
    }
    let heading = document.createElement('h3')
    heading.textContent = "Hand"
    handArea.appendChild(heading)
    player.hand.forEach((card, index) => {
        let cardImg = document.createElement('img');
        cardImg.src = card.imageUrl
        cardImg.className = `hand-card hand-card--${index} stack__img`
        cardImg.id = `${index}`
        handArea.appendChild(cardImg)
    })
}

function renderDeck(player) {
    let deckArea = document.querySelector('.player-item__deck')
    while (deckArea.firstChild) {
        deckArea.remove(deckArea.firstChild);
    }
    let heading = document.createElement('h3');
    heading.textContent = "Deck";
    deckArea.appendChild(heading)
    if (player.deck) {
        let stack = document.createElement('div');
        let img = document.createElement('img');
        stack.className = 'stack'
        img.className = 'stack__img';
        img.src = "./img/card-back.jpg";
        deckArea.appendChild(stack)
        stack.appendChild(img)
    }
}



function init() {
    p = new Player();
    s = makeSupply(2);

    renderStacks(s);
    p.draw(5)
}
init()
// 2 players  8 victory, 10 curse 
// 3 players  12 victory, 20 curse
// 4 players  12 victory, 30 curse
// 5 players  15 Provinces, 40 curse, 4 supply piles
// 6 players  18 Provinces, 50 curse, 4 supply piles


// Copper (2 players): 46 (optionally 106)
// Copper (3 players): 39 (optionally 99)
// Copper (4 players): 32 (optionally 92)
// Copper (5 players): 85
// Copper (6 players): 78
// Silver (2-4 players): 40 (optionally 80)
// Silver (5-6 players): 80
// Gold (2-4 players): 30 (optionally 60)
// Gold (5-6 players): 60
// Potion (if used): 16
// Platinum (if used): 12
// Kingdom cards used (Non-victory): 10
// Kingdom cards used (Victory, 2 players): 8
// Kingdom cards used (Victory, 3-6 players): 12
// Diadem: 0 in Supply, 1 not in Supply
// Spoils: 0 in Supply, 15 not in Supply
// https://boardgamegeek.com/thread/867734/how-many-treasure-cards-supply


function buyPhase(player, supply) {
    // attach event listeners to treasures in hand
    Array.from(document.querySelectorAll('.player-item__hand img')).forEach(card => {
        if (player.hand[card.id].type === "Treasure") {
            card.addEventListener('click', function treasureHandler(e) {
                console.log(e.target.id)
                let amount = player.hand[e.target.id].treasureVal;                  
                // push the card from hand into played
                player.played.push(player.hand.splice(e.target.id, 1)[0]);
                let temp = e.target.parentElement.removeChild(e.target);
                document.querySelector('.player-item__in-play').appendChild(temp);
                e.target.removeEventListener('click', treasureHandler);           // remove event listener
                player.treasure += amount                                       
            })
        }
    })

    Array.from(document.querySelectorAll('#supply .stack__img')).forEach(card => {
        if (cardsArr[card.id.toLowerCase()][2]) {
            card.addEventListener('click', function buyHandler(e) {
                let id = e.target.id.toLowerCase()
                console.log('click')
                if (player.treasure >= cardsArr[id][1]) {
                    player.gain(card.id, supply)
                }
            })
        } 
    })
}

