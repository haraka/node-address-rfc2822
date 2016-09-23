var address = require('../index');

exports.isAllLower = {
    'lower latin string' : function (test) {
        test.expect(1);
        test.equal(true, address.isAllLower('abcdefg'));
        test.done();
    },
}

exports.isAllUpper = {
    'upper latin string' : function (test) {
        test.expect(1);
        test.equal(true, address.isAllUpper('ABCDEFG'));
        test.done();
    }
}

exports.nameCase = {
    'john doe -> John Doe' : function (test) {
        test.expect(1);
        test.equal('John Doe', address.nameCase('john doe'));
        test.done();
    },
    'JANE SMITH -> Jane Smith' : function (test) {
        test.expect(1);
        test.equal('Jane Smith', address.nameCase('JANE SMITH'));
        test.done();
    },
    'marty mcleod -> Marty McLeod': function (test) {
        test.expect(1);
        test.equal('Marty McLeod', address.nameCase('marty mcleod'));
        test.done();
    },
    'martin o\'mally -> Martin O\'Malley': function (test) {
        test.expect(1);
        test.equal("Martin O'Malley", address.nameCase("martin o'malley"));
        test.done();
    },
    'level iii support -> Level III Support': function (test) {
        test.expect(1);
        test.equal("Level III Support", address.nameCase("level iii support"));
        test.done();
    }
}