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
