@include "./core_rules.ne"

FWS             ->   (WSP:* CRLF):? WSP:+ {% function(d) {return " "; } %}

ctext           ->  [!-'\*-\[\]~]

ccontent        ->  ctext | quoted_pair | comment

comment         ->  "(" (FWS:? ccontent):* FWS:? ")"

CFWS            ->  ((FWS:? comment):+ FWS:?) | FWS {% function(d) {return null; } %}

