[![Build Status][ci-img]][ci-url]
[![Code Climate][clim-img]][clim-url]
[![Coverage Status][cov-img]][cov-url]

# address-rfc2822

Parser for RFC 2822 & 5322 (Header) format email addresses.

This module parses RFC 2822 headers containing addresses such as From, To, CC, and BCC headers.

It is almost a direct port of the perl module Mail::Address and I'm grateful to the original authors of that module for the clean code and the tests.

## Installation

`npm install address-rfc2822`

## Usage

<!-- prettier-ignore -->
```js
const addrparser = require('address-rfc2822')

const addresses = addrparser.parse('Matt Sergeant <helpme+npm@gmail.com>')
const address = addresses[0]

console.log(`Email address: ${address.address}`) // helpme+npm@gmail.com
console.log(`Email name: ${address.name()}`)     // Matt Sergeant
console.log(`Reformatted: ${address.format()}`)  // Matt Sergeant <helpme+npm@gmail.com>
console.log(`User part: ${address.user()}`)      // helpme+npm
console.log(`Host part: ${address.host()}`)      // gmail.com
```

## More Info

- [RFC 2822](https://tools.ietf.org/html/rfc2822)
- [RFC 5322](https://tools.ietf.org/html/rfc5322)

## License

This module is MIT licensed.

[ci-img]: https://github.com/haraka/node-address-rfc2822/actions/workflows/ci.yml/badge.svg
[ci-url]: https://github.com/haraka/node-address-rfc2822/actions/workflows/ci.yml
[cov-img]: https://codecov.io/github/haraka/node-address-rfc2822/coverage.svg
[cov-url]: https://codecov.io/github/haraka/node-address-rfc2822?branch=master
[clim-img]: https://codeclimate.com/github/haraka/haraka-plugin-template/badges/gpa.svg
[clim-url]: https://codeclimate.com/github/haraka/haraka-plugin-template
