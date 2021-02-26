[![Build Status][ci-img]][ci-url]
[![Win Build status][ci-win-img]][ci-win-url]
[![Code Climate][clim-img]][clim-url]
[![Coverage Status][cov-img]][cov-url]


address-rfc2822
==================

Parser for RFC 2822 & 5322 (Header) format email addresses.

This module parses RFC 2822 headers containing addresses such as From, To, CC, and BCC headers.

It is almost a direct port of the perl module Mail::Address and I'm grateful to the original authors of that module for the clean code and the tests.

Installation
------------

`npm install address-rfc2822`

Usage
-----

```js
const addrparser = require('address-rfc2822');

const addresses = addrparser.parse("Matt Sergeant <helpme+npm@gmail.com>");
const address = addresses[0];

console.log(`Email address: ${address.address}`);
console.log(`Email name: ${address.name()}`);
console.log(`Reformatted: ${address.format()}`);
console.log(`User part: ${address.user()}`);
console.log(`Host part: ${address.host()}`);

```


More Info
-------
- [RFC 2822](https://tools.ietf.org/html/rfc2822)
- [RFC 5322](https://tools.ietf.org/html/rfc5322)


License
-------

This module is MIT licensed.



[ci-img]: https://github.com/haraka/node-address-rfc2822/workflows/Unix%20Tests/badge.svg
[ci-url]: https://github.com/haraka/node-address-rfc2822/actions?query=workflow%3A%22Unix+Tests%22
[ci-win-img]: https://github.com/haraka/node-address-rfc2822/workflows/Tests%20-%20Windows/badge.svg
[ci-win-url]: https://github.com/haraka/node-address-rfc2822/actions?query=workflow%3A%22Tests+-+Windows%22
[cov-img]: https://codecov.io/github/haraka/node-address-rfc2822/coverage.svg
[cov-url]: https://codecov.io/github/haraka/node-address-rfc2822?branch=master
[clim-img]: https://codeclimate.com/github/haraka/haraka-plugin-template/badges/gpa.svg
[clim-url]: https://codeclimate.com/github/haraka/haraka-plugin-template
