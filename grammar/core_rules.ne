
ALPHA          ->  [A-Za-z]

BIT            ->  [01]

CHAR           ->  [\x01-\x7F]

CR             ->  "\r"

LF             ->  "\n"

CRLF           ->  CR LF

CTL            ->  [\x00-\x1F\x7F]

DIGIT          ->  [\x30-\x39]

DQUOTE         ->  "\""

HEXDIG         ->  DIGIT | [A-F]

HTAB           ->  "\t"

LWSP           ->  (WSP | CRLF WSP):*

OCTET          ->  [\x00-\xFF]

SP             ->  " "

VCHAR          ->  [\x21-\x7E]

WSP            ->  SP | HTAB

quoted_pair     ->   "\"" (VCHAR | WSP)
