"use strict";

var grammar = require("./lib/address_format");
var nearley = require("nearley");

exports.parse = function parse (line, type) {
    if (!line) throw "Nothing to parse";

    type = type || 'from';

    var p = new nearley.Parser(grammar.ParserRules, type);

    p.feed(line);

    var results = p.results[0];

    if (!results) throw "No results";

    return results.map(function (r) {
        // console.log("Parsed to: ", r);
        if (r.groups) {
            return new Group(r.display_name, r.groups.map(function (g) {
                return new Address(g.display_name, g.local_part + '@' + g.domain, g.comment);
            }));
        }
        var l = r.local_part;
        if (!r.display_name && /:/.test(l)) l = '"' + l + '"';
        return new Address(r.display_name, l + '@' + r.domain, r.comment);
    });
}

function Group (display_name, addresses) {
    this.phrase = display_name;
    this.addresses = addresses;
}

Group.prototype.format = function () {
    return this.phrase + ":" + this.addresses.map(function (a) { return a.format() }).join(',');
}

Group.prototype.name = function () {
    var phrase = this.phrase;

    if (!(phrase && phrase.length)) {
        phrase = this.comment;
    }

    var name = _extract_name(phrase);
    return name;
}

function Address (phrase, address, comment) {
    this.phrase  = phrase;
    this.address = address;
    this.comment = comment;
}

Address.prototype.host = function () {
    var match = /.*@(.*)$/.exec(this.address);
    if (!match) return null;
    return match[1];
}

Address.prototype.user = function () {
    var match = /^(.*)@/.exec(this.address);
    if (!match) return null;
    return match[1];
}

// This is because JS regexps have no equivalent of
// zero-width negative look-behind assertion for: /(?<!\\)"/
function _quote_no_esc (str) {
    if (/^"/.test(str)) return true;
    var match;
    while (match = /^[\s\S]*?([\s\S])"/.exec(str)) {
        if (match[1] !== '\\') {
            return true;
        }
        str = str.substr(match[0].length);
    }
    return false;
}

var atext = new RegExp('^(?:\\s*[\\-\\w !#$%&\'*+/=?^`{|}~]\\s*)+$');
Address.prototype.format = function () {
    var phrase = this.phrase;
    var email = this.address;
    var comment = this.comment;

    var addr = [];

    if (phrase && phrase.length) {
        addr.push(atext.test(phrase) ? phrase
                : _quote_no_esc(phrase) ? phrase
                : ('"' + phrase + '"'));

        if (email && email.length) {
            addr.push("<" + email + ">");
        }
    }
    else if (email && email.length) {
        addr.push(email);
    }

    if (comment && /\S/.test(comment)) {
        comment = comment.replace(/^\s*\(?/, '(')
                        .replace(/\)?\s*$/, ')');
    }

    if (comment && comment.length) {
        addr.push(comment);
    }

    return addr.join(' ');
}

Address.prototype.name = function () {
    var phrase = this.phrase;
    var addr = this.address;

    if (!(phrase && phrase.length)) {
        phrase = this.comment;
    }

    var name = _extract_name(phrase);

    // first.last@domain address
    if (name === '') {
        var match = /([^\%\.\@_]+([\._][^\%\.\@_]+)+)[\@\%]/.exec(addr);
        if (match) {
            name  = match[1].replace(/[\._]+/g, ' ');
            name  = _extract_name(name);
        }
    }

    if (name === '' && /\/g=/i.test(addr)) {    // X400 style address
        var match = /\/g=([^\/]*)/i.exec(addr);
        var f = match[1];
        match = /\/s=([^\/]*)/i.exec(addr);
        var l = match[1];
        name  = _extract_name(f + " " + l);
    }

    return name;
}

exports.isAllLower = function (string) {
    return string === string.toLowerCase();
}

exports.isAllUpper = function (string) {
    return string === string.toUpperCase();
}

exports.nameCase = function (string) {

    return string
        .toLowerCase()
        .replace(/\b(\w+)/g, function (_, d1) {
            // Set the case of the name to first char upper rest lower
            return d1.charAt(0).toUpperCase() + d1.slice(1);
        })
        .replace(/\bMc(\w)/gi, function (_, d1) {
            // Scottish names such as 'McLeod'
            return 'Mc' + d1.toUpperCase();
        })
        .replace(/\bo'(\w)/gi, function (_, d1) {
            // Irish names such as 'O'Malley, O'Reilly'
            return 'O\'' + d1.toUpperCase();
        })
        .replace(/\b(x*(ix)?v*(iv)?i*)\b/ig, function (_, d1) {
            // Roman numerals, eg 'Level III Support'
            return d1.toUpperCase();
        });
}

// given a comment, attempt to extract a person's name
function _extract_name (name) {
    if (name == null) {
        return '';
    }
    // Using encodings, too hard. See Mail::Message::Field::Full.
    if (/\=\?.*?\?\=/.test(name)) return '';

    // trim whitespace
    name = name.trim();
    name = name.replace(/\s+/, ' ');

    // Disregard numeric names (e.g. 123456.1234@compuserve.com)
    if (/^[\d ]+$/.test(name)) return '';

    name = name.replace(/^\((.*)\)$/, '$1') // remove outermost parenthesis
                .replace(/^"(.*)"$/, '$1')  // remove outer quotation marks
                .replace(/\(.*?\)/g, '')    // remove minimal embedded comments
                .replace(/\\/g, '')         // remove all escapes
                .replace(/^"(.*)"$/, '$1')  // remove internal quotation marks
                .replace(/^([^\s]+) ?, ?(.*)$/, '$2 $1') // reverse "Last, First M." if applicable
                .replace(/,.*/, '');

    // Change casing only when the name contains only upper or only
    // lower cased characters.
    if ( exports.isAllUpper(name) || exports.isAllLower(name) ) {
        // console.log("Changing case of: " + name);
        name = exports.nameCase(name);
        // console.log("Now: " + name);
    }

    // some cleanup
    name = name.replace(/\[[^\]]*\]/g, '')
                .replace(/(^[\s'"]+|[\s'"]+$)/g, '')
                .replace(/\s{2,}/g, ' ');

    return name;
}
