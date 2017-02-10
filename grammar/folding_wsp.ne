@include "./core_rules.ne"

@{% var _flatten = require('./flatten.js').flatten; %}

FWS             ->   (WSP:* CRLF):? WSP:+ {% function(d) {return " "; } %}

ctext           ->  [!-'\*-\[\]-~]

ccontent        ->  ctext | quoted_pair | comment

comment         ->  "(" (FWS:? ccontent):* FWS:? ")" {% function (d) {
    console.log("COMMENT:",_flatten(d));
    return _flatten(d);
} %}

CFWS            ->  ((FWS:? comment):+ FWS:?) | FWS {% function(d) {console.log("CFWS",_flatten); return _flatten(d); } %}

