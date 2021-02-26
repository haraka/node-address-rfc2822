
## 2.1.0 - 2021-02-26

- make parse accept an options object as second argument
- allow , character in display name, off by default #52

## 2.0.6 - 2020-11-17

- replace travis/appveyor CI tests with Github Actions
- test: when splitting lines, use os.EOL
- allow @ symbol in display name #47


## 2.0.5 - 2020-06-02

- update email-addresses to 3.1.0
- test framework: nodeunit -> mocha


## 2.0.4 - 2018-06-29

- throw a proper error object, not a string.


## 2.0.3 - 2018-03-01

- use es6 classes
- export the Address class #29


## 2.0.2 - 2018-02-24

- Fix a possible regexp backtracking DoS


## 2.0.1 - 2017-06-26

- trim the line in parse()


## 1.0.2 - 2016-06-16

- use email-addresses for parser
- updated for eslint 4 compat


## 1.0.1 - 2016-09-23

- use native to[lower|upper]Case functions vs regex
- remove node 0.12 testing
- remove node 0.10, 5, add node 6
- throw error on nothing to parse


## 1.0.0 - 2016-02-23

- Initial implementation
