

/*** PATH LOOKUPS ***/

N.obj = function(path) {
    var n = Nitrogen.$lookup(Nitrogen.$current_id);
    return n.obj(path);
}

N.prototype.obj = function(path) {
    path = N.$normalize_partial_path(path);

    // Try the easy option...
    var el = document.getElementById(path);
    if (el) { return el; }

    // Not found, so scan recursively...
    var obj = Nitrogen.$scan_elements(path, this.$div.childNodes);
    if(obj==null)
        console.log("ERROR: '"+path+"' is not found!");
    return obj;
}

N.is_obj_existing = function(path) {
    var n = Nitrogen.$lookup(Nitrogen.$current_id);
    return n.is_obj_existing(path);
}

N.prototype.is_obj_existing = function(path) {
    path = N.$normalize_partial_path(path);

    // Try the easy option...
    var el = document.getElementById(path);
    if (el) { return el; }

    // Not found, so scan recursively...
    var obj = Nitrogen.$scan_elements(path, this.$div.childNodes);
    return obj != null;
}

N.$normalize_partial_path = function(path) {
    var oldparts = Nitrogen.$current_path.split(".");
    var newparts = path.split(".");
    var a = new Array();
    for (var i=0; i<newparts.length; i++) {
        var part = newparts[i];
        if (part == "me") { a = oldparts; }
        else if (part == "parent") { a.pop(); }
        else { a.push(part); }
    }

    return a.join("__");
}

N.$scan_elements = function(path, elements) {
    if (!elements) { return; }

    for (var i=0; i<elements.length; i++) {
        var t = elements[i].id;
        if (t == undefined) { continue; }
        var pos = t.indexOf(path);
        if (pos == -1) { continue; }

        if(pos != 0) {
            // path is relative
            pos = t.indexOf("__"+path);
            if (pos == -1) { continue; }

            // skip jqgrid internal elements
            if (t.match(/^(gbox_|gview_|load_|lui_|cb_|rs_)/)) { continue; }
        }

        if(t.match(new RegExp(path+"$"))) { return elements[i]; }
    }

    for (var i=0; i<elements.length; i++) {
        var el = Nitrogen.$scan_elements(path, elements[i].childNodes)
        if (el) { return el; }
    }

    return null;
}
