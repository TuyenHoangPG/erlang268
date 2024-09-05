

/*** RICHTEXTEDITOR ***/
N.$richtexteditor_for_floating_window = function (richtexteditorOptions, objRichtexteditor, floatingWindowId) {

    richtexteditorOptions.setup = function (ed) {
        ed.on('init', function (args) {
            $("#" + objRichtexteditor.id + "_ifr").iframeTracker({
                blurCallback: function () {
                    //  when the iframe is clicked (like firing an XHR request)
                    // find all dialogs
                    $('.ui-dialog').each(function (i, obj) {
                        // check is floating window
                        if ($("#" + $(obj).attr('aria-describedby')).hasClass("floating_window")) {
                            var dialogId = $("[aria-describedby$='" + floatingWindowId + "']").attr('aria-describedby');
                            $("#" + dialogId).dialog("instance").moveToTop();
                        }
                    })

                }
            });
        });
    };
    local_richtexteditor_common(richtexteditorOptions, objRichtexteditor);
}


N.$richtexteditor = function(richtexteditorOptions, objRichtexteditor){
    local_richtexteditor_common(richtexteditorOptions, objRichtexteditor);
}

function local_richtexteditor_common(richtexteditorOptions, objRichtexteditor) {
    tinymce.init(richtexteditorOptions);
    // #rich_idをDOMから削除する時に、tinymce.remove関数を実行する
    var richId = "#" + objRichtexteditor.id;
    $(richId).on("remove", function () {
        tinymce.remove(richId);
    });

    // 親要素にsortableが設定された場合に、その親要素のsortstart, sortstopで
    // tinymceの解除と再設定をする
    // この操作をしないと、sortableでソート後に、コンテンツの内容が失われ、入力できなくなってしまうため
    if ($(richId).closest('.ui-sortable').length >= 1) {
        var richtextInSorting = false;
        sortId = "#" + $(richId).closest('.ui-sortable')[0].id;
        $(sortId).on({
            "sortstart" : function(event, ui) {
                // textareaにtinymceが適用されていることを判定
                if ($("#" + objRichtexteditor.id).prev().hasClass('mce-tinymce') &&
                    ui.item.find('#' + objRichtexteditor.id).length > 0) {
                    richtextInSorting = true;
                    tinyMCE.execCommand( 'mceRemoveEditor', false, objRichtexteditor.id);
                }
            },
            "sortstop" : function(event, ui) {
                if (richtextInSorting) {
                    tinyMCE.execCommand( 'mceAddEditor', false, objRichtexteditor.id);
                    richtextInSorting = false;
                }
            }
        });
    }
}
