[![Build Status][ci-img]][ci-url]
[![Dependencies][dep-img]][dep-url]
[![Coverage Status][cov-img]][cov-url]
[![Greenkeeper badge](https://badges.greenkeeper.io/haraka/node-address-rfc2822.svg)](https://greenkeeper.io/)


address-rfc2822
==================

Parser for RFC2822 (Header) format email addresses.

This module parses RFC2822 headers containing addresses such as From, To, CC, and Bcc headers.

The module uses the "nearley" parser, and should support all formats up to rfc6854, including
some obsolete formats.

Installation
------------

    npm install address-rfc2822

Usage
-----

    var addrparser = require('address-rfc2822');

    var addresses = addrparser.parse("Matt Sergeant <helpme+npm@gmail.com>");
    var address = addresses[0];

    console.log("Email address: " + address.address);
    console.log("Email name: " + address.name());
    console.log("Reformatted: " + address.format());
    console.log("User part: " + address.user());
    console.log("Host part: " + address.host());

The `parse()` function takes two parameters: `data` and `format`. The default
format is `"from"` to parse "From:" addresses. You can also parse the
`"sender"` address, and the `"reply_to"` address by passing those as the
second parameter:

    var addresses = addrparser.parse("test@example.com", "sender");

License
-------

This module is MIT licensed.


[ci-img]: https://travis-ci.org/haraka/node-address-rfc2822.svg?branch=master
[ci-url]: https://travis-ci.org/haraka/node-address-rfc2822
[dep-img]: https://david-dm.org/haraka/node-address-rfc2822.svg
[dep-url]: https://david-dm.org/haraka/node-address-rfc2822
[cov-img]: https://codecov.io/github/haraka/node-address-rfc2822/coverage.svg
[cov-url]: https://codecov.io/github/haraka/node-address-rfc2822?branch=master

