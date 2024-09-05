

/*** AUTOCOMPLETE TEXTBOX ***/
N.$autocomplete = function(path, autocompleteOptions, selectItemKey, searchTermKey, browsePostbackInfo, selectPostbackInfo) {
    // For floating window, to be displayed on the front.
    // Check whether #autocomplete_pull_down_menu exists, if it does not exist, add the div to the body.
    if ($("#autocomplete_pull_down_menu").length == 0) {
        $('body').append('<div id="autocomplete_pull_down_menu"></div>');
    }
    // Add the autocomple's pull down menu to #autocomplete_pull_down_menu.
    autocompleteOptions.appendTo ='#autocomplete_pull_down_menu';

    var n = Nitrogen.$lookup(Nitrogen.$current_id);
    jQuery.extend(autocompleteOptions, {
        select: function(ev, ui) {
            var item = (ui.item) && JSON.stringify(ui.item) || '';
            n.$queue_event(path.id, selectPostbackInfo, selectItemKey+"="+n.$urlencode(item));
        },
        source: function (request, response) {
            var params =
                "domState=" + Nitrogen.$get_dom_state() +
                "&postbackInfo=" + browsePostbackInfo +
                "&" + searchTermKey + "=" + encodeURIComponent(request.term);

            var post = function(){
                jQuery.ajax({
                    url: location.pathname,
                    type:'post',
                    data: params,
                    dataType: 'text',
                    success: function(data, textStatus){
                        response(JSON.parse(data));
                    },
                    error: function(xmlHttpRequest, textStatus, errorThrown){
                        eval(xmlHttpRequest.responseText);
                    }
                });
            };
            post();
        }
    });
    jQuery(path).autocomplete(autocompleteOptions);

    // For floating window, to be displayed on the front.
    $("#autocomplete_pull_down_menu > ul.ui-autocomplete").css("z-index", "150");
    // For floating window, The remains of the pull-down menu is displayed.
    // When you click the pull-down menu, and to remain to display the menu.
    $("#autocomplete_pull_down_menu > ul").mousedown(function(e) { e.stopPropagation(); });
    // If you click on the other elements , close the menu.
    $('body').live('mousedown', function() {
        if(jQuery(path).autocomplete( "instance" )) {
            jQuery(path).autocomplete( "close" );
        }
    });
}
