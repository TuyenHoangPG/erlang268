

/*** CONFIRM DIALOG ***/

N.$confirm_dialog = function(triggerid, title, body, width, height, yes, no, confirm_postback, cancel_postback) {
    $('<div></div>').appendTo('body')
        .html('<div><h6>'+body+'</h6></div>')
        .dialog({
            modal: true, title: title, zIndex: 10000, autoOpen: true,
            width: width, resizable: false,dialogClass:"confirm_dialog",
            height: height,
            buttons: [
                {
                    text: yes,
                    height: 30,
                    click: function() {
                        $( this ).dialog( "close" );
                        if(confirm_postback != 'undefined')
                            Nitrogen.$queue_event(triggerid, confirm_postback);
                    }
                },
                {
                    text: no,
                    height: 30,
                    click: function() {
                        $( this ).dialog( "close" );
                        if(cancel_postback != 'undefined')
                            Nitrogen.$queue_event(triggerid, cancel_postback);
                    }
                }
            ],
            close: function (event, ui) {
                $(this).remove();
            }
        });
}
