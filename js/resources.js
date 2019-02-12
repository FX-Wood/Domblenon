const PLAY = {
    treasure: function(player) {
        player.treasure += this.treasureVal;
    },
    victory: function(player) {
        // do nothing
    },
    artisan: function() {
        UI.gainSelector(1, false 
            , 'gain one card costing up to 5 (Artisan)'
            , function artisanSupplyFilter(card) {
                if (card.cost <= 5) {
                    return true;
                } else {
                    return false
                }
            }
            , function(gainSuccess) {
                setTimeout( 
                    function() {
                        if (gainSuccess) {
                            console.log('gain success')
                            UI.exit.setAttribute('disabled', 'disabled')
                            UI.handBar.funcBtn.setAttribute('disabled', 'disabled')
                            UI.handBar.title.textContent = "Hand: put a card from your hand on top of your deck (Artisan)"
                            UI.renderHand("active--action" // style
                            , function(card) {             // filter
                                if (card) {
                                    return true
                                } else 
                                return false
                            }
                            , function(e) {               // listener
                                console.log('click', 'putting on top of your deck')
                                let player = PLAYERS[TURN]
                                player.deck.push(player.hand.splice(e.target.id, 1)[0])
                                UI.renderHand()
                                UI.renderDeck()
                                UI.renderHandBar()
                                UI.exit.removeAttribute('disabled')
                            })
                        }
                    }
                , 1)
            }
            , PLAYERS[TURN]
            , "hand"
        )
    },
    chapel: function(player) {
        // trash up to 4 cards
        UI.trashSelector("Chapel", 4, true) // upToN bool is true
    },
    councilRoom: function(player) {
        player.draw(4)
        player.buys++
        PLAYERS.forEach(person => {
            if (TURN !== person.index) {
                person.draw(1)
            }
        })
    },
    festival: function(player) {
        player.actions += 2;
        player.buys++;
        player.treasure += 2;
    },
    laboratory: function(player) {
        player.draw(2);
        player.actions++;
    },
    market: function(player) {
        player.draw(1);
        player.actions++;
        player.buys++;
        player.treasure++;
    },
    mine: function(player) {
        UI.trashSelector("Remodel", 1, false // name, 1 to trash, cancelable = false
            , function mineFilter(card) {
                if (card.type === "Treasure") {
                    return true
                } else {
                    return false
                }
            }   // filter is set to any card
            , function mineResult(trashSuccess, trashCost) { // result
                UI.gainSelector(1, false
                    , `gain a card costing up to ${trashCost + 3} (Mine)` 
                    , function mineGainFilter(card) {
                        // console.log("running remodel Gain Filter")
                        // console.log("cost", card.cost, "trashed+2", trashCost)
                        if (card.cost <= trashCost + 3 && card.type === "Treasure") {
                            return true;
                        } else {
                            return false;
                        }
                    }
                    , function(gainSuccess) {
                        console.log('Congrats! you gained a treasure with mine')
                    }
                )
            }
        )
    },
    moneylender: function(player) {
        console.log('PLAY.moneylender')
        UI.trashSelector("Moneylender", 1, true // name, 1 to trash, cancelable = true
            , function moneylenderFilter(card) {
                if (card.name === "Copper") {
                    return true
                } else {
                    return false
                }
            }
            , function moneylenderResult(trashSuccess) {
                if (trashSuccess) {
                    PLAYERS[TURN].treasure += 3;
                }
            }
        )
    },
    remodel: function(player) {
        UI.trashSelector("Remodel", 1, false // name, 1 to trash, cancelable = false
            , undefined   // filter is set to any card
            , function remodelResult(trashSuccess, trashCost) { // result
                UI.gainSelector(1, false
                    , `gain a card costing up to ${trashCost + 2} (Remodel)` 
                    , function remodelGainFilter(card) {
                        // console.log("running remodel Gain Filter")
                        // console.log("cost", card.cost, "trashed+2", trashCost)
                        if (card.cost <= trashCost + 2) {
                            return true;
                        } else {
                            return false;
                        }
                    }
                    , function(gainSuccess) {
                        console.log('Congrats! you gained a card with remodel')
                    }
                )
            }
        )
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
    workshop: function(player) {
        UI.gainSelector(1, false
            , "gain a card costing up to 4 (Workshop)"
            , function(card) {
                if (card.cost <= 4) {
                    return true
                } else {
                    return false
                }
            }
            , function(success) {
                console.log('gained a card with workshop')
            }
        )
    },
    village: function(player) {
        console.log('clicked this: ', this)
        console.log('player', player)
        player.draw(1);               // + 1 cards
        player.actions += 2;          // + 2 actions
    }
}

const CARDS = {
            // name, cost, buyable, imageUrl, type, treasureVal, victoryVal, playMethod
    Copper: ["Copper", 0, true, "img/base/copper.jpg", "Treasure", 1, 0, PLAY.treasure],
    Silver: ["Silver", 3, true, "img/base/silver.jpg", "Treasure", 2, 0, PLAY.treasure],
    Gold:   ["Gold", 6, true, "img/base/gold.jpg", "Treasure", 3, 0, PLAY.treasure],

    Estate: ["Estate", 2, true, "img/base/estate.jpg", "Victory", 0, 1, PLAY.victory],
    Duchy: ["Duchy", 5, true, "img/base/duchy.jpg", "Victory", 0, 3, PLAY.victory],
    Province: ["Province", 8, true, "img/base/province.jpg", "Victory", 0, 8, PLAY.victory],
    Curse: ["Curse", 0, true, "img/base/curse.jpg", "Victory", 0, -1, PLAY.victory],

    Artisan: ["Artisan", 6, true, "img/original/artisan.jpg", "Action", 0, 0, PLAY.artisan],
    Chapel: ["Chapel", 2, true, "img/original/chapel.jpg", "Action", 0, 0, PLAY.chapel],
    CouncilRoom: ["Council Room", 5, true, "img/original/council-room.jpg", "Action", 0, 0, PLAY.councilRoom],
    Festival: ["Festival", 5, true, "img/original/festival.jpg", "Action", 0, 0, PLAY.festival],
    Gardens: ["Gardens", 4, true, "img/original/gardens.jpg", "Victory", 0, 0, PLAY.kingdom],
    Laboratory: ["Laboratory", 5, true, "img/original/laboratory.jpg", "Action", 0, 0, PLAY.laboratory],
    Mine: ["Mine", 5, true, "img/original/mine.jpg", "Action", 0, 0, PLAY.mine],
    Market: ["Market", 5, true, "img/original/market.jpg", "Action", 0, 0, PLAY.market],
    Moneylender: ["Moneylender", 4, true, "img/original/moneylender.jpg", "Action", 0, 0, PLAY.moneylender],
    Remodel: ["Remodel", 4, true, "img/original/remodel.jpg", "Action", 0, 0, PLAY.remodel],
    Smithy: ["Smithy", 4, true, "img/original/smithy.jpg", "Action", 0, 0, PLAY.smithy],
    Village: ["Village", 3, true, "img/original/village.jpg", "Action", 0, 0, PLAY.village], 
    Witch: ["Witch", 5, true, "img/original/witch.jpg", "Action-Attack", 0, 0, PLAY.witch],
    Workshop: ["Workshop", 3, true, "img/original/workshop.jpg", "Action", 0, 0, PLAY.workshop],
    Empty: ["Empty", null, false, "img/stack-empty0.jpg", null, null, null, null],
    CardBack: ["CardBack", null, false, "img/card-back.jpg", null, null, null, null]
}

function makeSupply(n) {
    switch(n) {
        case 2:
            let supply = {
                basic: {Copper: 106, Silver: 80, Gold: 60, Estate: 8, Duchy: 8, Province: 8, Curse: 10},
                kingdom: {},
                trash: []
            }
            for (let card in CARDS) {
                if (card !== "Copper" && card!== "Silver" && card !== "Gold" && card !== "Estate" && card !== "Duchy" && card !== "Province" && card !== "Curse" && card !== "Empty" && card !== "CardBack")
                supply.kingdom[card] = 10
            }
            //console.log('making supply', supply)
            return supply;
        case 3:
            alert('3-player support coming soon. Try 2 players.')
            break;
    }
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    exports.PLAY = PLAY;
    exports.CARDS = CARDS;
    exports.makeSupply = makeSupply;
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