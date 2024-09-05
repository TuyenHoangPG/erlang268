

/*** BUTTON ***/
// fix button style for msie 10, 11
N.$add_classbutton_ie = function(button) {
    // msie 10
    if ($.browser.msie && $.browser.version == 10) {
        button.addClass("ie");
    }
    // msie 11
    else if($.browser.mozilla && $.browser.version == 11) {
        button.addClass("ie");
    }
}
