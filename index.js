"use strict";

exports.parse = function parse (line) {
    var phrase = [], comment = [], address = [], objs = [];
    var depth = 0;

    var tokens  = _tokenise(line);
    var next    = _find_next(0, tokens);

    // console.log("Tokens: ", tokens);

    for (var i = 0; i < tokens.length; i++) {
        var token = tokens[i];

        if (token.substr(0,1) === '(')   { comment.push(token) }
        else if (token === '<')          { depth++ }
        else if (token === '>' && depth) { depth-- }
        else if (token === ',' || token === ';') {
            if (depth) {
                console.warn("Unmatched '<>' in " + line);
            }
            var o = _complete(phrase, address, comment);
            if (o) {
                objs.push(o);
                phrase = [], comment = [], address = [];
            }
            depth = 0;
            next = _find_next(i+1, tokens);
        }
        else if (depth)        { address.push(token) }
        else if (next === '<') { phrase.push(token) }
        else if ( /^[.\@:;]$/.test(token) ||
                    address.length === 0  ||
                    /^[.\@:;]$/.test(address[address.length - 1]) ) 
        {
            address.push(token);
        }
        else {
            if (depth) {
                console.warn("Unmatched '<>' in " + line);
            }
            var o = _complete(phrase, address, comment);
            if (o) {
                objs.push(o);
                phrase = [], comment = [], address = [];
            }
            depth = 0;
            address.push(token);
        }
    }
    return objs;    
}

function _tokenise (line) {
    var words = []
    var snippet = '', field = '';
    var match;

    line = line.replace(/^\s+/, '');
    line = line.replace(/[\r\n]+/g, ' ');

    while (line !== '') {
        field = '';
        if (match = /^\s*\(/.exec(line)) {
            line = line.substr(match[0].length - 1);
            var depth = 0;

            PAREN:
            while(match = /^(\(([^\(\)\\]|\\.)*)/.exec(line)) {
                line = line.substr(match[0].length);
                field += match[1];
                depth++;

                while(match = /^(([^\(\)\\]|\\.)*\)\s*)/.exec(line)) {
                    line = line.substr(match[0].length);
                    field += match[1];
                    depth--;
                    if (!depth) {
                        break PAREN;
                    }
                    if (match = /^(([^\(\)\\]|\\.)+)/.exec(line)) {
                        line = line.substr(match[0].length);
                        field += match[1];
                    }
                }
            }

            if (depth) {
                console.warn("Unmatched () '" + field + "' '" + line + "'");
            }

            field = field.replace(/\s+$/, '');
            words.push(field);

            continue;
        }


        match = /^("(?:[^"\\]|\\.)*")\s*/.exec(line) ||
                /^(\[(?:[^\]\\]|\\.)*\])\s*/.exec(line) ||
                /^([^\s()<>\@,;:\\".[\]]+)\s*/.exec(line) ||
                /^([()<>\@,;:\\".[\]])\s*/.exec(line);
        if (match) {
            line = line.substr(match[0].length);
            words.push(match[1]);
            continue;
        }

        throw "Unrecognised line: " + line;
    }

    words.push(",");
    return words;
}

function _find_next (index, tokens) {
    while(index < tokens.length)
    {   
        var c = tokens[index];
        if (c === ',' || c === ';' || c === '<') {
            return c;
        }
        index++;
    }
    return "";
}

function _complete (phrase, address, comment) {
    if (phrase.length === 0 && comment.length === 0 && address.length === 0)
        return null;

    return new Address (phrase.join(' '), address.join(''), comment.join(' '));
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

// given a comment, attempt to extract a person's name
function _extract_name (name) {
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
    if( ! (/[A-Z]/.test(name) && /[a-z]/.test(name)) ) {
        // console.log("Changing case of: " + name);
        name = name.toLowerCase();
        // Set the case of the name to first char upper rest lower
        name = name.replace(/\b(\w+)/g, function (_, d1) { return d1.charAt(0).toUpperCase() + d1.slice(1) })  // Upcase first letter on name
                    .replace(/\bMc(\w)/gi, function (_, d1) { return 'Mc' + d1.toUpperCase() }) // Scottish names such as 'McLeod'
                    .replace(/\bo'(\w)/gi, function (_, d1) { return 'O\'' + d1.toUpperCase() }) // Irish names such as 'O'Malley, O'Reilly'
                    .replace(/\b(x*(ix)?v*(iv)?i*)\b/ig, function (_, d1) { return d1.toUpperCase() }) // Roman numerals, eg 'Level III Support'
        // console.log("Now: " + name);
    }

    // some cleanup
    name = name.replace(/\[[^\]]*\]/g, '')
                .replace(/(^[\s'"]+|[\s'"]+$)/g, '')
                .replace(/\s{2,}/g, ' ');

    return name;
}
