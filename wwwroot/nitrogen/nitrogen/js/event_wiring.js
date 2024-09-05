

/*** EVENT WIRING ***/

N.$observe_event = function(el, type, func) {
    jQuery(el).bind(type, func);
}
