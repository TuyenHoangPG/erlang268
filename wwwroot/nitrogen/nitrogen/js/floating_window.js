

/*** FLOATING WINDOW ***/

N.$floating_window = function(dialogObj, dialogOptions, extendOptions) {
    if (extendOptions.containment != undefined && extendOptions.containment != '') {
        extendOptions.containment = obj(extendOptions.containment);
    } else {
        extendOptions.containment = 'body';
    }
    jQuery(dialogObj).dialog(dialogOptions).dialogExtend(extendOptions);
    // Scroll on the floating window so as not to affect the parent screen.
    jQuery(dialogObj).on('mousewheel wheel DOMMouseScroll MozMousePixelScroll', function(ev) {
        var $this = $(this),
            scrollTop = this.scrollTop,
            scrollHeight = this.scrollHeight,
            scrollWidth = this.scrollWidth,
            scrollLeft = this.scrollLeft,
            height = $this.height(),
            width = $this.width(),
            deltaX = ev.originalEvent.wheelDeltaX ? (ev.originalEvent.deltaX ? ev.originalEvent.deltaX : -ev.originalEvent.wheelDeltaX) : ev.originalEvent.deltaX * 30,
            deltaY = ev.originalEvent.wheelDeltaY ? (ev.originalEvent.deltaY ? ev.originalEvent.deltaY : -ev.originalEvent.wheelDeltaY) : ev.originalEvent.deltaY * 10,
            up = deltaY < 0,
            left = deltaX < 0;

        if (!up && deltaY > scrollHeight - height - scrollTop) {
            // Scrolling down, but this will take us past the bottom.
            $this.scrollTop(scrollHeight);
            return false;
        } else if (up && -deltaY > scrollTop) {
            // Scrolling up, but this will take us past the top.
            $this.scrollTop(0);
            return false;
        } else if (!left && deltaX > scrollWidth - width - scrollLeft) {
            // Scrolling right, but this will take us past the right.
            $this.scrollLeft(scrollWidth);
            return false;
        } else if (left && -deltaX > scrollLeft) {
            // Scrolling left, but this will take us past the left.
            $this.scrollLeft(0);
            return false;
        }
        return true;
    });
}

N.$set_dialog_index = function(dialogObj, index) {
    var floatingWindowAndzIndex = [];
    var floatingWindows = [];
    var floatingWindowzIndexs = [];

    function checkFloatingWindow(i, checkDialog) {
        // check is floating window
        if ($("#" + $(checkDialog).attr('aria-describedby')).hasClass("floating_window")) {
            floatingWindowAndzIndex.push({'zindex': $(checkDialog).zIndex(), 'floating_window': checkDialog});
        }
    }

    $('.ui-dialog').each(checkFloatingWindow)

    function sortByKey(array, key) {
        return array.sort(function (a, b) {
            var x = a[key];
            var y = b[key];
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        });
    }

    // sort list floating window follow list z index
    var floatingWindowAndzIndexSort = sortByKey(floatingWindowAndzIndex, 'zindex');

    function mapFloatingWindowAndzIndex(object) {
        floatingWindowzIndexs.push(object['zindex']);
        floatingWindows.push(object['floating_window']);
    }

    floatingWindowAndzIndexSort.forEach(mapFloatingWindowAndzIndex)

    // find dialog id
    var dialogId = $(dialogObj).attr('id');

    // get dialog by that id
    var dialog = $(dialogObj).closest($("[aria-describedby=" + dialogId + "]"));

    // current index
    var current = floatingWindows.indexOf(dialog[0]);

    // check if target floating window exist in list floating window then remove it
    if (current > -1) {
        floatingWindows.splice(current, 1);
    }

    // add target floating window in list floating window
    floatingWindows.splice(index, 0, dialog[0]);
    // check add index change ok
    if (floatingWindows.length == floatingWindowzIndexs.length) {
        floatingWindows.forEach(function (floatingWindow, j) {
            $(floatingWindow).zIndex(floatingWindowzIndexs[j])
        })
    } else {
        throw new DOMException("failed update index floating window")
    }
}

N.$get_floating_windows_state =  function(dialogsObj, postbackInfo){
    var result = {};
    // check list floating window with zIndex
    var checkList = [];

    // find all dialogs
    $('.ui-dialog').each(function(i, obj) {
        // check is floating window
        if ($("#" + $(obj).attr('aria-describedby')).hasClass("floating_window")) {
            // if dialog display
            if ($(obj).css('display') == 'block') {
                // foreach ids in dialogObj
                function findID(id) {
                    // if id dialog equal id dialogObj
                    if ($(obj).attr('aria-describedby').search(id) >= 0) {
                        dialogId = $("[aria-describedby$='" + id + "']").attr('aria-describedby');
                        var state = $("#" + dialogId).dialogExtend("state");

                        if (state == "normal") {
                            result[dialogId] = {
                                width: $(obj).width(),
                                height: $(obj).outerHeight(),
                                top: $(obj).offset().top,
                                left: $(obj).offset().left
                            }
                        } else {
                            var originalSize = $("#" + dialogId).dialogExtend("originalSize");
                            result[dialogId] = {
                                width: originalSize.size.width,
                                height: originalSize.size.height,
                                top: originalSize.position.top,
                                left: originalSize.position.left
                            }
                        }
                        // push floating window id and zindex then sort it
                        checkList.push({'zindex': $(obj).zIndex(), 'floating_window_id': dialogId});
                        result[dialogId].state = state;
                    }

                }

                //  in dialogObj
                function getInfo() {

                    dialogId = $(obj).attr('aria-describedby');
                    var state = $("#" + dialogId).dialogExtend("state");

                    if (state == "normal") {
                        result[dialogId] = {
                            width: $(obj).width(),
                            height: $(obj).outerHeight(),
                            top: $(obj).offset().top,
                            left: $(obj).offset().left
                        }
                    } else {
                        var originalSize = $("#" + dialogId).dialogExtend("originalSize");
                        result[dialogId] = {
                            width: originalSize.size.width,
                            height: originalSize.size.height,
                            top: originalSize.position.top,
                            left: originalSize.position.left
                        }
                    }
                    // push floating window id and zindex then sort it
                    checkList.push({'zindex': $(obj).zIndex(), 'floating_window_id': dialogId});
                    result[dialogId].state = state;

                }

                if (dialogsObj.length <= 0) {
                    getInfo();
                } else {
                    dialogsObj.forEach(findID);
                }

            }
        }
    });

    function sortByKey(array, key) {
        return array.sort(function (a, b) {
            var x = a[key];
            var y = b[key];
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        });
    }

    // sort list floating window id follow list z index
    var checkListSort = sortByKey(checkList, 'zindex');

    checkListSort.forEach(function (object, index) {
        result[object['floating_window_id']].index = index;
    });

    // post data in to api get_info_dialogs
    var params =
        "domState=" + Nitrogen.$get_dom_state() +
        "&postbackInfo=" + postbackInfo +
        "&get_info_floating_windows=" + JSON.stringify(result);

    var post = function(){
        jQuery.ajax({
            url: location.pathname,
            type:'post',
            data: params,
            dataType: 'text',
            success: function(data, textStatus){
                eval(data);
            },
            error: function(xmlHttpRequest, textStatus, errorThrown){
                eval(xmlHttpRequest.responseText);
            }
        });
    };
    post();
}

/*** FLOATING WINDOW X BUTTON ***/

N.$window_x_button = function(floatingId, postbackInfo) {
    var closeButton =
        $('div[aria-describedby$="'+floatingId+'"]').find("button.ui-dialog-titlebar-close");

    closeButton.unbind();

    closeButton.click(function() {
        Nitrogen.$queue_event(floatingId, postbackInfo);
    });
}
