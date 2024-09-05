

/*** TABLE ***/

/* Table sorter: Add sorting function to table */
N.tablesort = function(obj, ops) {
    // Create a new parser called 'kana' to get the kana values of Kanji cell values.
    // This parser will be called when sort_by_kana attribute is not empty.
    // This kana values must stand in the column next to Kanji cell,
    // and pre-defined by users.
    jQuery.tablesorter.addParser({
        id: 'kana',
        is: function(s) {
            // Return false so this parser is not auto detected
            return false;
        },
        format: function(s, table, cell) {
            if (/^\w[\w\s]+/.test(s)) {
                return s;
            }
            var kana = jQuery(cell).next().text();
            var is_kana = N.is_fullwidth_kana(kana) || N.is_halfwidth_kana(kana);
            return ((kana != '') && is_kana)? kana : s;
        },
        type: 'text'
    })
    jQuery(obj).tablesorter(ops).change(function() {
        N.$sorter_update(obj);
    });
};
N.$sorter_update = function(obj) {
    jQuery(obj).trigger("update").trigger("applyWidgets");
    return false;
};

/* Table stripe: Add zebra style to table */
N.tablestripe = function(obj) {
    var table = jQuery(obj);
    var tbody = table.children('tbody');
    tbody.children('tr:even').addClass('even');
    tbody.children('tr:odd').addClass('odd');
    table.change(function() {
        N.$stripe_update(table);
    });
};
N.$stripe_update = function(table) {
    var tbody = table.children('tbody');
    tbody.children('tr:even').addClass('even');
    tbody.children('tr:odd').addClass('odd');
};
