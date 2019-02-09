const PLAY = {
    treasure: function(player) {
        player.treasure += this.treasureVal;
    },
    victory: function(player) {
        // do nothing
    },
    chapel: function(player) {
        // trash up to 4 cards
        UI.trashSelector("Chapel", 4, true) // upToN bool is true
    },
    festival: function(player) {
        player.actions += 2;
        player.buys++;
        player.treasure++;
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
    moneylender: function(player) {
        console.log('PLAY.moneylender')
        UI.trashSelector("Moneylender"
            , 1 // n of cards to trash
            , true // optional?
            , function(card) { // only coppers may be trashed
                
                if (card.name === "Copper") {
                    return true
                } else {
                    return false
                }
            }
            , function(trashSuccess) {
                if (trashSuccess) {
                    PLAYERS[TURN].treasure += 3;
                }
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

    Chapel: ["Chapel", 2, true, "img/original/chapel.jpg", "Action", 0, 0, PLAY.chapel],
    Festival: ["Festival", 5, true, "img/original/festival.jpg", "Action", 0, 0, PLAY.festival],
    Gardens: ["Gardens", 4, true, "img/original/gardens.jpg", "Victory", 0, 0, PLAY.kingdom],
    Laboratory: ["Laboratory", 5, true, "img/original/laboratory.jpg", "Action", 0, 0, PLAY.laboratory],
    Market: ["Market", 5, true, "img/original/market.jpg", "Action", 0, 0, PLAY.market],
    Moneylender: ["Moneylender", 4, true, "img/original/moneylender.jpg", "Action", 0, 0, PLAY.moneylender],
    Remodel: ["Remodel", 4, true, "img/original/remodel.jpg", "Action", 0, 0, PLAY.remodel],
    Smithy: ["Smithy", 4, true, "img/original/smithy.jpg", "Action", 0, 0, PLAY.smithy],
    Village: ["Village", 3, true, "img/original/village.jpg", "Action", 0, 0, PLAY.village], 
    Witch: ["Witch", 5, true, "img/original/witch.jpg", "Action-Attack", 0, 0, PLAY.witch],
    Empty: ["Empty", null, false, "img/stack-empty0.jpg", null, null, null, null],
    CardBack: ["CardBack", null, false, "img/card-back.jpg", null, null, null, null]
}



function makeSupply(n) {

    switch(n) {
        case 2:
            let supply = {
                basic: {Copper: 106, Silver: 80, Gold: 60, Estate: 8, Duchy: 8, Province: 8, Curse: 10},
                kingdom: {Chapel: 10, Festival: 10, Gardens: 10, Laboratory: 10, Market: 10, Smithy: 10, Village: 10, Witch: 10},
                trash: []
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
