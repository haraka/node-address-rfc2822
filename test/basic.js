
const assert = require('assert')
const fs     = require('fs')
const path   = require('path')

const parse  = require('../index').parse;

const raw_data = fs.readFileSync(path.join(__dirname, 'emails.txt'), "UTF-8");

const tests = raw_data.split(/\n\n/).map(function (rows) {
    const lines = rows.split(/\n/);
    // console.log(lines)
    if (lines[0] === '') lines.shift();
    return lines.filter(function (l) { return !/^#/.test(l) });
});

describe('basic parse', function () {

    tests.forEach(function (test) {

        const details = {};
        details.format = test[1];
        if (test[2]) details.name = test[2];

        it(test[0], function () {

            const parsed = parse(test[0]);
            // console.log("Parsed: ", parsed);

            for (const k in parsed) {
                assert.equal(parsed[0][k], details[k], `Test '${k}' for '${parsed[0][k]}' = '${details[k]}' from ${JSON.stringify(parsed)}`);
            }
        })
    })
})
