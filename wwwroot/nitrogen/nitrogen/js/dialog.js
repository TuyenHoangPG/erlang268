

/*** DIALOG ***/

N.$dialog = function(dialogObj, dialogOptions) {
    jQuery(dialogObj).dialog(dialogOptions);
}

/*** DIALOG AND FLOATING WINDOW***/
// Remove the part focus to tabbable element by override function _focusTabbable()
// Because the scroll is initialized when you switch the dialog without giving the focus.
$.ui.dialog.prototype._focusTabbable = function() {
    var hasFocus = this._focusedElement;
    if ( !hasFocus ) {
        hasFocus = this.element.find( "[autofocus]" );
    }
    if ( !hasFocus.length ) {
        hasFocus = this.uiDialog;
    }
    hasFocus.eq( 0 ).focus();
};

// override _createWrapper() to fix problem of tabindex in dialog
$.ui.dialog.prototype._createWrapper = function() {
    this.uiDialog = $("<div>")
        .addClass( "ui-dialog ui-widget ui-widget-content ui-corner-all ui-front " +
        this.options.dialogClass )
        .hide()
        .attr({
            // Setting tabIndex makes the div focusable
            tabIndex: -1,
            role: "dialog"
        })
        .appendTo( this._appendTo() );

    this._on( this.uiDialog, {
        keydown: function( event ) {
            if ( this.options.closeOnEscape && !event.isDefaultPrevented() && event.keyCode &&
                event.keyCode === $.ui.keyCode.ESCAPE ) {
                event.preventDefault();
                this.close( event );
                return;
            }

            // prevent tabbing out of dialogs
            if ( event.keyCode !== $.ui.keyCode.TAB || event.isDefaultPrevented() ) {
                return;
            }
            var tabbables = this.uiDialog.find( ":tabbable" ),
                first = tabbables.filter( ":first" ),
                last = tabbables.filter( ":last");

            var sortedTabindexed = $
                .grep(tabbables, function(e) {
                    return $(e).attr("tabindex") > 0;
                })
                .sort(function(a, b) {
                    return $(a).attr("tabindex") - $(b).attr("tabindex")
                });

            var unTabindexed = $
                .grep(tabbables, function(e) {
                    return !($(e).attr("tabindex") > 0);
                });

            var currentTabIndex = $.inArray(event.target, sortedTabindexed);
            if(currentTabIndex > -1) {
                if ( ( event.target === $(sortedTabindexed[sortedTabindexed.length - 1])[0] || event.target === this.uiDialog[0] ) && !event.shiftKey ) {
                    this._delay(function() {
                        $(unTabindexed[0]).focus();
                    });
                    event.preventDefault();
                } else if ( ( event.target === $(sortedTabindexed[0])[0] || event.target === this.uiDialog[0] ) && event.shiftKey ) {
                    this._delay(function() {
                        $(unTabindexed[unTabindexed.length - 1]).focus();
                    });
                    event.preventDefault();
                } else {
                    this._delay(function() {
                        $(sortedTabindexed[currentTabIndex + 1]).focus();
                    });
                    event.preventDefault();
                }
            } else {
                if ( ( event.target === $(unTabindexed[unTabindexed.length - 1])[0] || event.target === this.uiDialog[0] ) && !event.shiftKey ) {
                    this._delay(function() {
                        if(sortedTabindexed.length > 0)
                            $(sortedTabindexed[0]).focus();
                        else
                            first.focus();
                    });
                    event.preventDefault();
                } else if ( ( event.target === $(unTabindexed[0])[0] || event.target === this.uiDialog[0] ) && event.shiftKey ) {
                    this._delay(function() {
                        if(sortedTabindexed.length > 0)
                            $(sortedTabindexed[sortedTabindexed.length - 1]).focus();
                        else
                            last.focus();
                    });
                    event.preventDefault();
                }
            }
        },
        mousedown: function( event ) {
            if ( this._moveToTop( event ) ) {
                this._focusTabbable();
            }
        }
    });

    // We assume that any existing aria-describedby attribute means
    // that the dialog content is marked up properly
    // otherwise we brute force the content as the description
    if ( !this.element.find( "[aria-describedby]" ).length ) {
        this.uiDialog.attr({
            "aria-describedby": this.element.uniqueId().attr( "id" )
        });
    }
};
