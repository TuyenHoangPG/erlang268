

/*** IMAGE CAPTION ***/
N.$image_caption = function(imageObj,options) {
    jQuery(imageObj).mosaic(options);
    var img = jQuery(imageObj).children(".mosaic-backdrop").find('>img');

    // After Chrome updating its rendering engine to be less detectant of quick DOM-changes,
    // this script may yield 0 width and height if repeated several times in quick succession.
    $(img).load(function() {
        jQuery(imageObj).width(img[0].width);
        jQuery(imageObj).height(img[0].height);
    });
}

/*** CONTEXT MENU ***/
N.$context_menu = function(targetId, postbackInfo, items) {
    var targetSelector = "[id$='" + targetId + "']";
    $.contextMenu({
        selector: targetSelector,
        callback: function(key, options) {
            Nitrogen.$queue_event(targetId, postbackInfo, "action=" + key);
        },
        items: items
    });

    // remove DOM of context menu if target DOM is removed
    $( targetSelector ).bind("destroyed", function () {
        $.contextMenu( 'destroy', targetSelector );
    });
}
