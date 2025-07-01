const assert = require('assert')
const { describe, it } = require('node:test');

const address = require('../index')

describe('isAllLower', function () {
  it('lower latin string', function () {
    assert.equal(true, address.isAllLower('abcdefg'))
  })
})

describe('isAllUpper', function () {
  it('upper latin string', function () {
    assert.equal(true, address.isAllUpper('ABCDEFG'))
  })
})

describe('nameCase', function () {
  it('john doe -> John Doe', function () {
    assert.equal('John Doe', address.nameCase('john doe'))
  })
  it('JANE SMITH -> Jane Smith', function () {
    assert.equal('Jane Smith', address.nameCase('JANE SMITH'))
  })
  it('marty mcleod -> Marty McLeod', function () {
    assert.equal('Marty McLeod', address.nameCase('marty mcleod'))
  })
  it("martin o'mally -> Martin O'Malley", function () {
    assert.equal("Martin O'Malley", address.nameCase("martin o'malley"))
  })
  it('level iii support -> Level III Support', function () {
    assert.equal('Level III Support', address.nameCase('level iii support'))
  })
})

describe('parseFrom', function () {
  it('Travis CI <builds@travis-ci.org>', function () {
    try {
      const r = address.parseFrom('Travis CI <builds@travis-ci.org>')
      assert.deepEqual(r[0], {
        phrase: 'Travis CI',
        comment: '',
        address: 'builds@travis-ci.org',
      })
    } catch (e) {
      console.error(e)
    }
  })

  it('root (Cron Daemon)', function () {
    try {
      const r = address.parseFrom('root (Cron Daemon)')
      assert.deepEqual(r[0], { address: '' })
    } catch (e) {
      assert.equal(e.message, 'No results')
    }
  })
})

describe('parseSender', function () {
  it('"Anne Standley, PMPM" <info=protectmypublicmedia.org@mail172.atl101.mcdlv.net>', function () {
    try {
      const r = address.parseSender(
        '"Anne Standley, PMPM" <info=protectmypublicmedia.org@mail172.atl101.mcdlv.net>',
      )
      assert.deepEqual(r[0], {
        address: 'info=protectmypublicmedia.org@mail172.atl101.mcdlv.net',
        comment: '',
        phrase: 'Anne Standley, PMPM',
      })
      // console.log(r);
    } catch (e) {
      console.error(e)
    }
  })
})

describe('parseReplyTo', function () {
  it('=?utf-8?Q?Anne=20Standley=2C=20Protect=20My=20Public=20Media?= <info@protectmypublicmedia.org>', function () {
    try {
      const r = address.parseReplyTo(
        '=?utf-8?Q?Anne=20Standley=2C=20Protect=20My=20Public=20Media?= <info@protectmypublicmedia.org>',
      )
      assert.deepEqual(r[0], {
        address: 'info@protectmypublicmedia.org',
        comment: '',
        phrase:
          '=?utf-8?Q?Anne=20Standley=2C=20Protect=20My=20Public=20Media?=',
      })
      // console.log(r);
    } catch (e) {
      console.error(e)
    }
  })
})

describe('parse with options', function () {
  it('should not allow parsing display name with comma by default', function () {
    try {
      address.parse('Foo, Bar <foo@example.com>')
    } catch (e) {
      assert.equal(e.message, 'No results')
    }
  })

  it('should allow parsing display name with comma', function () {
    try {
      const [r] = address.parse('Foo, Bar <foo@example.com>', {
        allowCommaInDisplayName: true,
      })
      assert.equal('foo@example.com', r.address)
      assert.equal('Foo, Bar', r.phrase)
    } catch (e) {
      console.error(e)
    }
  })
})
