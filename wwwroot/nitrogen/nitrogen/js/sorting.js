

/*** SORTING ***/

N.$sortitem = function(sortItem, sortTag) {
    sortItem.$sort_tag = sortTag;
    sortItem.$drag_tag = sortTag;
}

N.$sortblock = function(sortBlock, sortOptions, sortPostbackInfo) {
    var n = Nitrogen.$lookup(Nitrogen.$current_id);
    sortOptions.update = function () {
        var sortItems = "";
        for (var i = 0; i < this.childNodes.length; i++) {
            var childNode = this.childNodes[i];
            if (sortItems != "") {
                sortItems += ",";
            }
            if (childNode.$sort_tag) {
                sortItems += childNode.$sort_tag;
            }
        }
        n.$queue_event(this.id, sortPostbackInfo, "sort_items=" + sortItems);
    };
    // object move between floating windows
    sortOptions.helper = 'clone';
    sortOptions.appendTo = 'body';
    jQuery(sortBlock).sortable(sortOptions);
}
