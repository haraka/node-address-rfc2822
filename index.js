'use strict'

const ea_lib = require('email-addresses')

/**
 * @param {string} line string to parse
 * @param {object|null} opts
 * @param {string|null} opts.startAt Start the parser at one of address, address-list, angle-addr, from, group, mailbox, mailbox-list, reply-to, sender. Default: address-list
 * @param {boolean|null} opts.atInDisplayName Allow the @ character in the display name of the email address. Default: true
 * @param {boolean|null} opts.allowCommaInDisplayName - Allow the , character in the display name of the email address. Default: false
 * @returns {Address[]}
 * @throws {Error} if input string is empty
 * @throws {Error} if no addresses are found
 */
exports.parse = function parse(line, opts = null) {
  if (!line) throw new Error('Nothing to parse')

  line = line.trim()

  const defaultOpts = {
    startAt: null,
    allowAtInDisplayName: true,
    allowCommaInDisplayName: false,
  }

  const { startAt, allowAtInDisplayName, allowCommaInDisplayName } =
    typeof opts === 'object'
      ? Object.assign({}, defaultOpts, opts)
      : Object.assign({}, defaultOpts, { startAt: opts })

  const addr = ea_lib({
    input: line,
    rfc6532: true, // unicode
    partial: false, // return failed parses
    simple: false, // simple AST
    strict: false, // turn off obs- features in the rfc
    rejectTLD: false, // domains require a "."
    startAt: startAt || null,
    atInDisplayName: allowAtInDisplayName,
    commaInDisplayName: allowCommaInDisplayName,
  })

  if (!addr || addr.length === 0) throw new Error('No results')

  return addr.addresses.map(map_addresses)
}

function map_addresses(adr) {
  if (adr.type === 'group') {
    return new Group(adr.name, adr.addresses.map(map_addresses))
  }
  let comments
  if (adr.parts.comments) {
    comments = adr.parts.comments
      .map((c) => c.tokens.trim())
      .join(' ')
      .trim()
    // if (comments.length) {
    //     comments = '(' + comments + ')';
    // }
  }
  let l = adr.local
  if (!adr.name && /:/.test(l)) l = `"${l}"`
  return new Address(adr.name, `${l}@${adr.domain}`, comments)
}

exports.parseFrom = function (line) {
  return exports.parse(line, 'from')
}

exports.parseSender = function (line) {
  return exports.parse(line, 'sender')
}

exports.parseReplyTo = function (line) {
  return exports.parse(line, 'reply-to')
}

class Group {
  constructor(display_name, addresses) {
    this.phrase = display_name
    this.addresses = addresses
  }

  format() {
    return `${this.phrase}:${this.addresses.map((a) => a.format()).join(',')}`
  }

  name() {
    let phrase = this.phrase

    if (!(phrase && phrase.length)) phrase = this.comment

    return _extract_name(phrase)
  }
}

class Address {
  constructor(phrase, address, comment) {
    this.phrase = phrase || ''
    this.address = address || ''
    this.comment = comment || ''
  }

  host() {
    const match = /.*@(.*)$/.exec(this.address)
    if (!match) return null
    return match[1]
  }

  user() {
    const match = /^(.*)@/.exec(this.address)
    if (!match) return null
    return match[1]
  }

  format() {
    const phrase = this.phrase
    const email = this.address
    let comment = this.comment

    const addr = []
    const atext = new RegExp("^[\\-\\w !#$%&'*+/=?^`{|}~]+$")

    if (phrase && phrase.length) {
      addr.push(
        atext.test(phrase.trim())
          ? phrase
          : _quote_no_esc(phrase)
            ? phrase
            : `"${phrase}"`,
      )

      if (email && email.length) {
        addr.push(`<${email}>`)
      }
    } else if (email && email.length) {
      addr.push(email)
    }

    if (comment && /\S/.test(comment)) {
      comment = comment.replace(/^\s*\(?/, '(').replace(/\)?\s*$/, ')')
    }

    if (comment && comment.length) {
      addr.push(comment)
    }

    return addr.join(' ')
  }

  name() {
    let phrase = this.phrase
    const addr = this.address

    if (!(phrase && phrase.length)) {
      phrase = this.comment
    }

    let name = _extract_name(phrase)

    // first.last@domain address
    if (name === '') {
      const match = /([^%.@_]+([._][^%.@_]+)+)[@%]/.exec(addr)
      if (match) {
        name = match[1].replace(/[._]+/g, ' ')
        name = _extract_name(name)
      }
    }

    if (name === '' && /\/g=/i.test(addr)) {
      // X400 style address
      let match = /\/g=([^/]*)/i.exec(addr)
      const f = match[1]
      match = /\/s=([^/]*)/i.exec(addr)
      const l = match[1]
      name = _extract_name(`${f} ${l}`)
    }

    return name
  }
}

exports.Address = Address

// This is because JS regexps have no equivalent of
// zero-width negative look-behind assertion for: /(?<!\\)"/
function _quote_no_esc(str) {
  if (/^"/.test(str)) return true
  let match
  while ((match = /^[\s\S]*?([\s\S])"/.exec(str))) {
    if (match[1] !== '\\') return true
    str = str.substr(match[0].length)
  }
  return false
}

exports.isAllLower = function (string) {
  return string === string.toLowerCase()
}

exports.isAllUpper = function (string) {
  return string === string.toUpperCase()
}

exports.nameCase = function (string) {
  return string
    .toLowerCase()
    .replace(/\b(\w+)/g, function (_, d1) {
      // Set the case of the name to first char upper rest lower
      return d1.charAt(0).toUpperCase() + d1.slice(1)
    })
    .replace(/\bMc(\w)/gi, function (_, d1) {
      // Scottish names such as 'McLeod'
      return `Mc${d1.toUpperCase()}`
    })
    .replace(/\bo'(\w)/gi, function (_, d1) {
      // Irish names such as 'O'Malley, O'Reilly'
      return `O'${d1.toUpperCase()}`
    })
    .replace(/\b(x*(ix)?v*(iv)?i*)\b/gi, function (_, d1) {
      // Roman numerals, eg 'Level III Support'
      return d1.toUpperCase()
    })
}

// given a comment, attempt to extract a person's name
function _extract_name(name) {
  // Using encodings, too hard. See Mail::Message::Field::Full.
  if (/=?.*?\?=/.test(name)) return ''

  // trim & condense whitespace
  name = name.trim().replace(/\s+/g, ' ')

  // Disregard numeric names (e.g. 123456.1234@compuserve.com)
  if (/^[\d ]+$/.test(name)) return ''

  // remove outermost parenthesis
  if (name.slice(0, 1) === '(' && name.slice(-1) === ')')
    name = name.slice(1, name.length - 1)

  // remove outer quotation marks
  if (name.slice(0, 1) === '"' && name.slice(-1) === '"')
    name = name.slice(1, name.length - 1)

  name = name
    .replace(/\([^)]*\)/g, '') // remove minimal embedded comments
    .replace(/\\/g, '') // remove all escapes

  // remove internal quotation marks
  if (name.slice(0, 1) === '"' && name.slice(-1) === '"')
    name = name.slice(1, name.length - 1)

  name = name
    .replace(/^([^\s]+) ?, ?(.*)$/, '$2 $1') // reverse "Last, First M." if applicable
    .replace(/,.*/, '')

  // Change casing only when the name contains only upper or only
  // lower cased characters.
  if (exports.isAllUpper(name) || exports.isAllLower(name)) {
    // console.log(`Changing case: ${name} to ${exports.nameCase(name)}`);
    name = exports.nameCase(name)
  }

  // some cleanup
  name = name
    .replace(/\[[^\]]*\]/g, '')
    .replace(/(^[\s'"]+|[\s'"]+$)/g, '')
    .replace(/\s{2,}/g, ' ')

  return name
}
