function makeSupply(n) {

    switch(n) {
        case 2:
            let supply = {
                basic: {Copper: 106, Silver: 80, Gold: 60, Estate: 8, Duchy: 8, Province: 8, Curse: 10},
                kingdom: {Chapel: 10, Gardens: 10, Smithy: 10, Village: 10, Witch: 10},
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
    module.exports.makeSupply = makeSupply;
}
