@include "./folding_wsp.ne"

@{% var flatten = require('./flatten.js'); %}

ALPHA          ->  [A-Za-z] {% id %}

CR             ->  "\r" {% id %}

LF             ->  "\n" {% id %}

CRLF           ->  CR LF {% function (d) { return "\r\n" } %}

CTL            ->  [\x00-\x1F\x7F] {% id %}

DIGIT          ->  [\x30-\x39] {% id %}

DQUOTE         ->  "\"" {% id %}

HTAB           ->  "\t" {% id %}

OCTET          ->  [\x00-\xFF] {% id %}

SP             ->  " " {% id %}

VCHAR          ->  [!-~] {% id %}

WSP            ->  SP | HTAB

quoted_pair     ->   "\\" [!-~ \t] {% function (d) { return "\\" + d[1] } %}

qtext           ->   [!#-\[\]-~] {% function (d) { return d[0] } %}

qcontent        ->   (qtext | quoted_pair)  {% function (d,l,r) {
    if (d[0] && d[0][0] == '"') return r; // No quotes allowed
    return flatten.str(d);
} %}

quoted_string   ->   CFWS:? "\"" (FWS:? qcontent):* FWS:? "\"" CFWS:? {% function (d,l,r) {
    var contents = d[2];
    return flatten.str(contents) + (d[3] && d[3][0] == " " ? " " : "");
} %}

atom            ->  CFWS:? [a-zA-Z0-9!#$%&'*+\-\/=?^_`{|}~]:+ CFWS:? {% function (d) { return d[1].join("") } %}

dot_atom_text   ->  [a-zA-Z0-9!#$%&'*+\-\/=?^_`{|}~]:+ ("." [a-zA-Z0-9!#$%&'*+\-\/=?^_`{|}~]:+):* {% function (d) {
    return flatten.str(d);
} %}

dot_atom        ->  CFWS:? dot_atom_text CFWS:? {% function (d) {
    // console.log("DA:", d[1]);
    return d[1]
} %}

word            ->  (atom | quoted_string)  {% function (d) { return flatten.str(d) } %}

phrase          ->  word:+ {% function (d) { return d[0].join(" ") } %}

unstructured    ->  (FWS:? [!-~]):* WSP:? {% function (d,l,r) { throw "Unimplemented" } %}

addr_spec       ->   local_part "@" domain {% function (d) {
    // console.log("Addr_spec: ", d);
    return {
        local_part: d[0][0],
        domain: d[2][0],
    };
}%}

local_part      ->   dot_atom {% id %} | quoted_string {% id %}

domain          ->   dot_atom {% id %} | domain_literal {% id %}

domain_literal  ->   CFWS:? "[" (FWS:? dtext):* FWS:? "]" CFWS:? {% function (d) {
    var contents = d[2];
    return "[" + flatten.str(contents) + (d[3] && d[3][0] == " " ? " " : "") + "]";
} %}

dtext           ->   [!-Z\^-~] {% id %}
                   
address         ->  mailbox {% id %} | group {% id %}

mailbox         ->  name_addr {% id %} | addr_spec {% id %}

name_addr       ->  display_name:? angle_addr {% function (d) {
    if (d[0]) {
        d[1].display_name = d[0];
    }
    return d[1];
}%}

angle_addr      ->  CFWS:? "<" addr_spec ">" CFWS:? {% function (d) {
    var c0 = flatten.str(d[0]).trim();
    var c1 = flatten.str(d[4]).trim();
    var ret = d[2];
    if (c0 && c1) {
        ret.comment = '(' + c0 + ' ' + c1 + ')';
    }
    else if (c0 || c1) {
        ret.comment = c0 || c1;
    }
    return ret;
}%}

group           ->  display_name ":" group_list:? ";" CFWS:? {% function (d,l,r) {
    throw "Unimplemented";
} %}

display_name    ->  phrase {% id %}

mailbox_list    ->  mailbox ("," mailbox):* {% function (d) {
    return flatten.obj(d).filter((c) => c != ",");
} %}

address_list    ->  address ("," address):* {% function (d) {
    return flatten.obj(d).filter((c) => c != ",");
} %}

group_list      ->  mailbox_list {% id %} | CFWS {% null %}

