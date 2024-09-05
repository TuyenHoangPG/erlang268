

/*** GET CHILD ELEMENT INFO ***/

/*
* 'triggerID' is the id of element that trigger the event, in this case
* it specify the id of a formbuilder submit or save button.
* It's neccessary to passing button id to queue_event to be able to
* check preload of the event and disable mouse and keyboard actions while the event running
*/
N.$form_builder_get_child_element_info =  function(triggerID, dialogsObj, postbackInfo){

    // find all element in root ( depth = 1)
    var searchEles = $(dialogsObj).children();
    var results = [];
    for(var i = 0; i < searchEles.length; i++) {
        var panel = $(searchEles[i]).find(".form_builder_element_panel_child");
        var description = $(searchEles[i]).find(".form_builder_description").text();
        // init info to push server
        if(panel.length) {
            var info = {
                id: searchEles[i].id,
                height: $(searchEles[i]).height(),
                width: $(searchEles[i]).width(),
                tag: searchEles[i].tagName,
                description: description,
                element_tag: searchEles[i].$element_tag
            };
            results.push(info);
        }

    }
    // push server
    Nitrogen.$queue_event(triggerID, postbackInfo,  "get_child_element_info=" + JSON.stringify(results));

}


/*** DRAG AND DROP ***/

N.$form_builder_draggable = function (dragObj, dragOptions, dragTag, placeHolderSize) {
    dragObj.$drag_tag = dragTag;
    dragObj.$disable_draggable = dragOptions.disable_draggable ;
    dragOptions.appendTo = 'body';
    dragOptions.helper =  function() {
        //debugger;
        return "<div class=\"ui-state-highlight-form-builder-draggable\" style=\"width: " +  placeHolderSize.width + "px; height: " + placeHolderSize.height + "px; \" ></div>";
    };
    dragOptions.revert =  "invalid";
    dragOptions.zIndex = 99999;

    jQuery(dragObj).draggable(dragOptions);
}


N.$form_builder_sortable_placeholder = function(sortBlock, sortOptions, sortPostbackInfo) {
    var n = Nitrogen.$lookup(Nitrogen.$current_id);
    sortOptions.receive =  function(event, ui){
        if(ui.item[0].$disable_draggable){
            $(ui.item[0]).draggable("disable")
        }
        var dragItem = ui.item[0].$drag_tag;
        $(ui.helper[0]).addClass("clone_form_builder_draggable");
        n.$queue_event(this.id, sortPostbackInfo, "drag_item=" + dragItem);
    };

    sortOptions.update = function (event, ui) {
    };
    // object move between floating windows
    sortOptions.appendTo = 'body';
    jQuery(sortBlock).sortable(sortOptions);
}
