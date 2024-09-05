

/*** WINDEX METHODS ***/

N.prototype.$do_windex_event = function(triggerID, postbackInfo, extraParams) {
    // Run validation...
    var s = this.$validate_and_serialize(triggerID);
    if (s == null) { return; }

    // Build params...
    var url = this.$url;
    url = Nitrogen.$add_param(url, "domState", this.$dom_state);
    url = Nitrogen.$add_param(url, "postbackInfo", postbackInfo);
    url = Nitrogen.$add_param(url, s);
    url = Nitrogen.$add_param(url, extraParams);
    Nitrogen.$load_script(url);
}


N.prototype.$do_windex_comet = function(postbackInfo) {
    alert("Comet is not yet supported via Windex.");
}
