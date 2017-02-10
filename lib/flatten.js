"use strict";

// Flatten a "nearley" array into strings
function flatten_str (d) {
    if (!d) return '';
    var type = typeof d;
    if (type === 'string') {
        return d;
    }
    else if (type === 'object' && Array.isArray(d)) {
        return d.map(function (c) { return flatten_str(c) }).join("");
    }
    else {
        throw "Other objects not supported: " + type;
    }
}

// Flatten a "nearley" nested array into array of objects
function flatten_obj (d) {
    if (!d) return [];
    var type = typeof d;
    if (type === 'string') {
        return [d];
    }
    else if (type === 'object' && Array.isArray(d)) {
        var ret = [];
        for (var i=0; i<d.length; i++) {
            ret = ret.concat(flatten_obj(d[i]));
        }
        return ret;
    }
    else if (type === 'object') {
        return [d];
    }
    else {
        throw "Other objects not supported: " + type;
    }
}

exports.str = flatten_str;
exports.obj = flatten_obj;
