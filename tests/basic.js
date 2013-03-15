var parse = require("../index").parse;

function _check(test, line, details) {
    test.expect(Object.keys(details).length);
    var parsed = parse(line)[0];
    // console.log("Parsed: ", parsed);
    for (var k in details) {
        test.equal(parsed[k](), details[k], "Test '" + k + "' for '" + parsed[k]() + "' = '" + details[k] + "' from " + JSON.stringify(parsed));
    }
    test.done();
}

var raw_data = require('fs').readFileSync(__dirname + '/emails.txt', "UTF-8");

var tests = raw_data.split(/\n\n/).map(function (rows) {
    var test = rows.split(/\n/);
    if (test[0] === '') test.shift();
    return test;
});

exports.basic = {};
tests.forEach(function (test) {
    var details = {};
    details.format = test[1];
    if (test[2]) {
        details.name = test[2];
    }
    exports.basic[test[0]] = function (t) {
        _check(t, test[0], details);
    }
})

