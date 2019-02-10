var assert = require('chai').assert


var makeSupply = require('../js/resources.js').makeSupply

describe('makeSupply()', function() {
    var supply = makeSupply(2);
    it('should return an object', function() {
        assert.typeOf(supply, "object", "not an object")
    })
    it('should have three keys', function() {
        assert.hasAllKeys(supply, ["basic", "kingdom", "trash"], "does not have three keys")
    })
})

var CARDS = require('../js/resources.js').CARDS
describe("CARDS", function() {
    it('should be an object', function() {
        assert.typeOf(CARDS, "object", "not an object")
    })
    for (let card in CARDS) {
        it(`${card} should be an array with length 8`, function() {
            assert.typeOf(CARDS[card], "array", `${card} not an array`)
            assert.lengthOf(CARDS[card], 8, `${card} has only ${CARDS[card].length} elements`)
            assert.typeOf(CARDS[card][0], 'string', `${card} name field is not a string` )
        })
    }

})