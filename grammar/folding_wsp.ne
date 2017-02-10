@include "./core_rules.ne"

@{% var flatten = require('./flatten.js'); %}

FWS             ->   (WSP:* CRLF):? WSP:+ {% function(d) {return " "; } %}

ctext           ->  [!-'\*-\[\]-~]

ccontent        ->  ctext | quoted_pair | comment

comment         ->  "(" (FWS:? ccontent):* FWS:? ")" {% function (d) {
    // console.log("COMMENT:",_flatten(d));
    return flatten.str(d);
} %}

CFWS            ->  ((FWS:? comment):+ FWS:?) | FWS {% function(d) { return flatten.str(d); } %}

