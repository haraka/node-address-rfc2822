const assert = require('node:assert/strict')
const fs = require('fs')
const path = require('path')

const parse = require('../index').parse

const raw_data = fs.readFileSync(path.join(__dirname, 'emails.txt'), 'UTF-8')
const EOLRE = new RegExp(require('os').EOL)

const tests = raw_data.split(/\n\n/).map((rows) => {
  const lines = rows.split(EOLRE)
  // console.log(lines)
  if (lines[0] === '') lines.shift()
  return lines.filter((l) => {
    return !/^#/.test(l)
  })
})

describe('parse', function () {
  it('throws on empty line', function () {
    assert.throws(
      () => {
        parse('')
      },
      { message: 'Nothing to parse' },
    )
  })

  tests.forEach(function (test) {
    it(test[0], function () {
      const details = {}
      details.format = test[1]
      if (test[2]) details.name = test[2]

      const parsed = parse(test[0])[0]
      // console.log(`Parsed: ${parsed}`);

      for (const k in details) {
        assert.equal(
          parsed[k](),
          details[k],
          `Test '${k}' for '${parsed[k]()}' = '${details[k]}' from ${JSON.stringify(parsed)}`,
        )
      }
    })
  })
})
