const assert  = require('assert')

const address = require('../index');

describe('isAllLower', function () {
    it('lower latin string', function (done) {
        assert.equal(true, address.isAllLower('abcdefg'));
        done();
    })
})

describe('isAllUpper', function () {
    it('upper latin string', function (done) {
        assert.equal(true, address.isAllUpper('ABCDEFG'));
        done();
    })
})

describe('nameCase', function () {
    it('john doe -> John Doe', function (done) {
        assert.equal('John Doe', address.nameCase('john doe'));
        done();
    })
    it('JANE SMITH -> Jane Smith' , function (done) {
        assert.equal('Jane Smith', address.nameCase('JANE SMITH'));
        done();
    })
    it('marty mcleod -> Marty McLeod', function (done) {
        assert.equal('Marty McLeod', address.nameCase('marty mcleod'));
        done();
    })
    it('martin o\'mally -> Martin O\'Malley', function (done) {
        assert.equal("Martin O'Malley", address.nameCase("martin o'malley"));
        done();
    })
    it('level iii support -> Level III Support', function (done) {
        assert.equal("Level III Support", address.nameCase("level iii support"));
        done();
    })
})

describe('parseFrom', function () {
    it('Travis CI <builds@travis-ci.org>', function (done) {
        try {
            const r = address.parseFrom('Travis CI <builds@travis-ci.org>');
            assert.equal(r[0].address, 'builds@travis-ci.org');
            // console.log(r);
        }
        catch (e) {
            console.error(e);
        }
        done();
    })
    it('root (Cron Daemon)', function (done) {
        try {
            const r = address.parseFrom('root (Cron Daemon)');
            assert.equal(r[0].address, '');
            // console.log(r);
        }
        catch (e) {
            assert.equal(e.message, 'No results');
        }
        done();
    })
})

describe('parseSender', function () {
    it('"Anne Standley, PMPM" <info=protectmypublicmedia.org@mail172.atl101.mcdlv.net>', function (done) {
        try {
            const r = address.parseSender('"Anne Standley, PMPM" <info=protectmypublicmedia.org@mail172.atl101.mcdlv.net>');
            assert.equal(r[0].address, 'info=protectmypublicmedia.org@mail172.atl101.mcdlv.net');
            // console.log(r);
        }
        catch (e) {
            console.error(e);
        }
        done();
    })
})

describe('parseReplyTo', function () {
    it('=?utf-8?Q?Anne=20Standley=2C=20Protect=20My=20Public=20Media?= <info@protectmypublicmedia.org>', function (done) {
        try {
            const r = address.parseReplyTo('=?utf-8?Q?Anne=20Standley=2C=20Protect=20My=20Public=20Media?= <info@protectmypublicmedia.org>');
            assert.equal(r[0].address, 'info@protectmypublicmedia.org');
            // console.log(r);
        }
        catch (e) {
            console.error(e);
        }
        done();
    })
})

describe('parse with options', function () {
    it('should not allow parsing display name with comma by default', function (done) {
        try {
            address.parse('Foo, Bar <foo@example.com>');
        }
        catch (e) {
            assert.equal(e.message, 'No results');
        }
        done();
    })

    it('should allow parsing display name with comma', function (done) {
        try {
            const [r] = address.parse('Foo, Bar <foo@example.com>', { allowCommaInDisplayName: true });
            assert.equal('foo@example.com', r.address);
            assert.equal('Foo, Bar', r.phrase);
        }
        catch (e) {
            console.error(e);
        }
        done();
    })
})
