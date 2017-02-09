@include "./folding_wsp.ne"

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

quoted_pair     ->   "\\" (VCHAR | WSP) {% function (d) { return d[0][1] } %}

qtext           ->   [!#-\[\]-~] {% function (d) { return d[0] } %}

qcontent        ->   (qtext | quoted_pair)  {% function (d) { return d[0] || d[1] } %}

quoted_string   ->   CFWS:? "\"" (FWS:? qcontent):* FWS:? "\"" CFWS:? {% function (d) {
    var contents = d[2];
    var out = contents.map((c) => {
        if (c[0] == " ") return " " + c[1].join("");
        return c[1].join("")
    });
    return out.join("") + (d[3][0] == " " ? " " : "");
} %}

atext           ->   [a-zA-Z0-9!#$%&'*+\-\/=?^_`{|}~]:+ {% function (d) {
    console.log("ATEXT:", d)
    return d[0].join("")
} %}

atom            ->  CFWS:? atext CFWS:? {% function (d) { return d[1] } %}

dot_atom_text   ->  (atext ("." atext):*) {% function (d) {
    return _do(d[0]);
    function _do (d) {
        var str = d.shift();

        if (d[0][0]) {
            str += ".";
            return str + _do([d[0][0][1],[]]);
        }

        return str;
    }
} %}

dot_atom        ->  CFWS:? dot_atom_text CFWS:? {% function (d) { return d[1] } %}

word            ->  (atom | quoted_string)  {% function (d) { return d[0] || d[1] } %}

phrase          ->  word:+ {% function (d) { return d[0].join("") } %}

unstructured    ->  (FWS:? VCHAR):* WSP:?

addr_spec       ->   local_part "@" domain {% function (d) {
    return {
        local_part: d[0][0],
        domain: d[2][0],
    };
}%}

local_part      ->   (dot_atom {% id %} | quoted_string {% id %})

domain          ->   (dot_atom {% id %} | domain_literal {% id %})

domain_literal  ->   CFWS:? "[" (FWS:? dtext):* FWS:? "]" CFWS:? {% function (d) {
    return "[" + 
        d[2].map((c) => c[1]).join("") +
        "]"
} %}

dtext           ->   [!-Z\^-~] {% id %}
                   
address         ->  mailbox | group {% function (d) { return d[0] || d[1] } %}

mailbox         ->  name_addr | addr_spec {% function (d) { return d[0] || d[1] } %}

name_addr       ->  display_name:? angle_addr {% function (d) {
    if (d[0]) {
        d[1].display_name = d[0];
    }
    return d[1];
}%}

angle_addr      ->  CFWS:? "<" addr_spec ">" CFWS:? {% function (d) {
    return d[2];
}%}

group           ->  display_name ":" group_list:? ";" CFWS:?

display_name    ->  phrase {% function (d) { return d[0]} %}

mailbox_list    ->  mailbox ("," mailbox):* {% function (d) {
    var list = [d[0][0]];
    if (d[1] && d[1][0] && d[1][0][0]) {
        // console.log("CONCAT: ", d[1]);
        list = list.concat(d[1].map((c) => c[1][0] || c[1]));
    }

    return list;
} %}

address_list    ->  address ("," address):* {% function (d) {
    var list = [d[0][0][0]];
    // console.log("LIST:", list);
    if (d[1] && d[1][0] && d[1][0][0]) {
        // console.log("CONCAT: ", d[0][1][0][1]);
        list = list.concat(d[1].map((c) => c[1][0]));
    }

    return list;
} %}

group_list      ->  mailbox_list {% id %} | CFWS {% null %}

