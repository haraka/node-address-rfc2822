var parse = require('../index').parse;


var fs = require('fs');
var emails = JSON.parse(fs.readFileSync(__dirname + "/extra_emails.json", {encoding: 'utf8'}));

exports.extra_emails = {};

emails.tests.test.forEach(function (test) {
    exports.extra_emails[test['-id'] + ': ' + (test.address || 'blank')] = function (t) {
        t.expect(1);
        try {
            var parsed = parse(test.address || '')[0];
            t.ok(test.category != 'ISEMAIL_ERR');
        }
        catch (e) {
            if (test.category == 'ISEMAIL_DEPREC' || test.diagnosis == 'ISEMAIL_RFC5322_DOMLIT_OBSDTEXT') {
                console.warn("Test " + test['-id'] + " is a deprecated email format we don't support");
                t.ok(1);
            }
            else if (test.category == 'ISEMAIL_RFC5321') {
                console.warn("We do not support RFC5321 with this parser - see address-rfc2821 instead");
                t.ok(1);
            }
            else {
                if (test.category != 'ISEMAIL_ERR') console.log(e);
                t.equal(test.category, 'ISEMAIL_ERR');
            }
        }
        t.done();
    }
})
