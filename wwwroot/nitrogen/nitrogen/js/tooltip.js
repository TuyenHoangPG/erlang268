

/*** TOOLTIP ***/
N.$tooltip = function(obj, options){
    var title = jQuery(obj).attr('title');

    if (typeof title === typeof undefined || title == false) {
        jQuery(obj).attr("title", "");
    }

    jQuery(obj).tooltip(options);
}

N.$tooltip_disable = function(obj, recursive) {
    var parent = jQuery(obj);
    if(recursive) {
        var children = parent.find('*');
        $.each(children, function(i, child) {
            if(jQuery(child).tooltip("instance")) {
                jQuery(child).tooltip("disable");
            }
        });
    }

    if(parent.tooltip("instance")) {
        parent.tooltip("disable");
    }
}

N.$tooltip_enable = function(obj, recursive) {
    var parent = jQuery(obj);
    if(recursive) {
        var children = parent.find('*');
        $.each(children, function(i, child) {
            if(jQuery(child).tooltip("instance")) {
                if (jQuery(child).attr('title') === undefined)
                    jQuery(child).attr('title', '');
                jQuery(child).tooltip("enable");
            }
        });
    }

    if(parent.tooltip("instance")) {
        if (parent.attr('title') === undefined)
            parent.attr('title', '');
        parent.tooltip("enable");
    }
}