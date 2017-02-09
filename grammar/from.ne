@include "./address_format.ne"

from -> mailbox_list | address_list {% function (d) {
    if (d[0]) {
        console.log("D0:",d[0]);
    }
    return d[0] || d[1];
} %}
