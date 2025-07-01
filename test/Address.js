const assert = require('node:assert/strict')
const { describe, it } = require('node:test');

const address = require('../index')

describe('Address', function () {
  it('host', function () {
    const r = new address.Address(null, 'user@example.com')
    assert.equal(r.host(), 'example.com')
  })

  it('host, email missing domain', function () {
    const r = new address.Address(null, 'user')
    assert.equal(r.host(), null)
  })

  it('user', function () {
    const r = new address.Address(null, 'user@example.com')
    assert.equal(r.user(), 'user')
  })

  it('host, user missing domain', function () {
    const r = new address.Address(null, 'user')
    assert.equal(r.user(), null)
  })
})
