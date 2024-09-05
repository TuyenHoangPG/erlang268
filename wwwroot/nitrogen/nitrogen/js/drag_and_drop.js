

/*** DRAG AND DROP ***/

N.$draggable = function (dragObj, dragOptions, dragTag) {
    dragObj.$drag_tag = dragTag;
    dragObj.$disable_draggable = dragOptions.disable_draggable ;
    dragOptions.appendTo = 'body';
    var help;
    var notRoot = false;
    dragOptions.zIndex = 99999;
    if (dragOptions.helper != 'clone') {
        dragOptions.helper = function () {
            help = $(this).clone();
            return help;
        };
    }
    dragOptions.start = function (event, ui) {
        if (dragOptions.helper != 'clone') {
            $(this).css('opacity', '0');
            if(dragOptions.notRoot) {
                notRoot = dragOptions.notRoot;
            }
        }
    }
    dragOptions.stop = function (event, ui) {
        if (dragOptions.helper != 'clone') {
            if (!dragOptions.revert) {
                // cancel remove helper
                var inst = $(this).data("ui-draggable");
                inst.cancelHelperRemoval = true;

                // make the clone as new draggable
                dragOptions.notRoot = true;
                $(help).css('z-index', 99999);
                $(help)[0].$drag_tag = dragTag;
                $(help).draggable(dragOptions);

                // remove the old helper but skip the root element
                if(!notRoot) {
                    $(this).removeAttr('id');
                    $(this).draggable('disable');
                } else {
                    $(this).remove();
                }

                $(this).bind('destroyed', function () {
                    $(help).remove();
                });

            } else {
                $(this).css('opacity', '1');
            }
        }
    }
    jQuery(dragObj).draggable(dragOptions);
}

N.$droppable = function(dropObj, dropOptions, dropPostbackInfo) {
    var n = Nitrogen.$lookup(Nitrogen.$current_id);
    dropOptions.drop = function(ev, ui) {
        if(ui.draggable[0].$disable_draggable){
            $(ui.draggable[0]).draggable("disable")
        }
        var dragItem = ui.draggable[0].$drag_tag;
        n.$queue_event(this.id, dropPostbackInfo, "drag_item=" + dragItem);
    }
    jQuery(dropObj).droppable(dropOptions);
}
