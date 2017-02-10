"use strict";

// Flatten a "nearley" array into strings
function flatten (d) {
    if (!d) return '';
    var type = typeof d;
    if (type === 'string') {
        return d;
    }
    else if (type === 'object') {
        return d.map(function (c) { return flatten(c) }).join("");
    }
    else {
        throw "Other objects not supported: " + type;
    }
}

exports.flatten = flatten;
