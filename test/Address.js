const assert  = require('assert')

const address = require('../index')


describe('Address', function () {
    it('host', function (done) {
        const r = new address.Address(null, 'user@example.com');
        assert.equal(r.host(), 'example.com');
        done();
    })

    it('user', function (done) {
        const r = new address.Address(null, 'user@example.com');
        assert.equal(r.user(), 'user');
        done();
    })
})
