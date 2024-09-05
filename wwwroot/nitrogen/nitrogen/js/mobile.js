/** mobile_loader **/
N.$mobile_loader_show = function(options) {
    var theme = options.theme || $.mobile.loader.prototype.options.theme,
        msgText = options.text || $.mobile.loader.prototype.options.text,
        textVisible = options.textVisible || $.mobile.loader.prototype.options.textVisible,
        textonly = options.textonly,
        html = options.html || "";
    $.mobile.loading( "show", {
            text: msgText,
            textVisible: textVisible,
            theme: theme,
            textonly: textonly,
            html: html.replace("\\", "")
    });
};

N.$mobile_loader_hide = function() {
    $.mobile.loading( "hide" );
};

/*** mobile_collapsible ***/

N.$mobile_collapsible = function(collapsibleObj, collapsiblePostbackInfo) {
    $( document ).on( "pagecreate", function() {
        var n = Nitrogen.$lookup(Nitrogen.$current_id);
        if(collapsiblePostbackInfo != "nopostback"){
            jQuery(collapsibleObj).on("collapsibleexpand", function( event, ui ) {
                n.$queue_event(this.id, collapsiblePostbackInfo);
            });

            jQuery(collapsibleObj).on("collapsiblecollapse", function( event, ui ) {
                n.$queue_event(this.id, collapsiblePostbackInfo);
            });
        }
    });
};

N.$mobile_slider = function(sliderObj, sliderPostbackInfo, postbackTrigger) {
    var n = Nitrogen.$lookup(Nitrogen.$current_id);
    if(postbackTrigger == "start"){
        $(document).on('slidestart', '#' + sliderObj.id, function(event, ui){
            var slideId = '#' + sliderObj.id + "_a";
            n.$queue_event(this.id, sliderPostbackInfo, "value=" + $(slideId).val());
        });
    } else if(postbackTrigger == "stop"){
        $(document).on('slidestop', '#' + sliderObj.id, function(event, ui){
            var slideId = '#' + sliderObj.id + "_a";
            n.$queue_event(this.id, sliderPostbackInfo, "value=" + $(slideId).val());
        });
    }
}

N.$mobile_slider_range = function(sliderObj, sliderPostbackInfo, postbackTrigger) {
    var n = Nitrogen.$lookup(Nitrogen.$current_id);
    if(postbackTrigger == "start"){
        $(document).on('slidestart', '#' + sliderObj.id, function(event, ui){
            var slideIdFirst = '#' + sliderObj.id + "_a";
            var slideIdSecond = '#' + sliderObj.id + "_b";
            var values = [$(slideIdFirst).val(), $(slideIdSecond).val()];
            n.$queue_event(this.id, sliderPostbackInfo, "values=" + values);
        });
    } else if(postbackTrigger == "stop"){
        $(document).on('slidestop', '#' + sliderObj.id, function(event, ui){
            var slideIdFirst = '#' + sliderObj.id + "_a";
            var slideIdSecond = '#' + sliderObj.id + "_b";
            var values = [$(slideIdFirst).val(), $(slideIdSecond).val()];
            n.$queue_event(this.id, sliderPostbackInfo, "values=" + values);
        });
    }
}

N.$mobile_popup_open = function(popupObj, popupOption, positionToObj) {
    if(positionToObj) {
        popupOption.positionTo = "#" +positionToObj.id;
    }
    jQuery(popupObj).popup("open", popupOption);
}

N.$mobile_popup_close = function(popupObj) {
    jQuery(popupObj).popup("close");
}

N.$mobile_textbox_keyenter = function(textboxObj, postbackInfo) {
    var n = Nitrogen.$lookup(Nitrogen.$current_id);
    $(document).on("keypress", "#" + textboxObj.id, function(event) {
        if (event.which == 13) {
            n.$queue_event(textboxObj.id, postbackInfo);
        }
    });
}

N.$mobile_textbox_keyenter_next = function(textboxObj, idNext) {
    var n = Nitrogen.$lookup(Nitrogen.$current_id);
    $(document).on("keypress", "#" + textboxObj.id, function(event) {
        if (event.which == 13) {
            var o = Nitrogen.obj(idNext);
            if (o.focus) { o.focus(); }
            if (o.select) { o.select(); }
            if (o.click) { o.click(); }
        }
    });
}

N.$mobile_textbox_keyenter_postback_next = function(textboxObj, postbackInfo, idNext) {
    var n = Nitrogen.$lookup(Nitrogen.$current_id);
    $(document).on("keypress", "#" + textboxObj.id, function(event) {
        if (event.which == 13) {
            n.$queue_event(textboxObj.id, postbackInfo);
            var o = Nitrogen.obj(idNext);
            if (o.focus) { o.focus(); }
            if (o.select) { o.select(); }
            if (o.click) { o.click(); }
        }
    });
}

// To set value of a link's href option
// Parameters
// targetId - a partial id of an element inside html page
// elementId - the id of the link element
N.$set_mobile_link_href = function(elementId, targetId) {
    fullId = obj(targetId) === null ? targetId : obj(targetId).id;
    eleLink = obj(elementId);

    jQuery(eleLink).prop('href', "#" + fullId);
}

// To disable mobile slider
// whatever it's rangeslider or slider
N.$disable_mobile_slider = function(sliderID) {
    sliderEle = $(obj(sliderID));
    if (sliderEle.prop("data-role") === "rangeslider") {
        sliderEle.find("input[data-type='range']").rangeslider("disable" );
    } else {
        sliderEle.find("input[data-type='range']").slider("disable");
    }
}

// To enable mobile slider
// whatever it's rangeslider or slider
N.$enable_mobile_slider = function(sliderID) {
    sliderEle = $(obj(sliderID));
    if (sliderEle.prop("data-role") === "rangeslider") {
        sliderEle.find("input[data-type='range']").rangeslider("enable" );
    } else {
        sliderEle.find("input[data-type='range']").slider("enable" );
    }
}

// call #method-refresh of widgets
N.$refresh_mobile_element = function(eleObj, widgetType) {
    switch(widgetType) {
        case "button":
            jQuery(eleObj).button("refresh");
            break;
        case "checkbox":
            jQuery(eleObj).checkboxradio("refresh");
            break;
        case "radio":
            jQuery(eleObj).checkboxradio("refresh");
            break;
        case "radiogroup":
            $('#' + eleObj.id + ' :input').each(function(index, element) {
                $(element).checkboxradio("refresh");
            });
            break;
        case "flipswitch":
            jQuery(eleObj).flipswitch("refresh");
            break;
        case "rangeslider":
            jQuery(eleObj).rangeslider("refresh");
            break;
        case "slider":
            $('#' + eleObj.id + ' :input').each(function(index, element) {
                $(element).slider("refresh");
            });
            break;
        case "selectmenu":
            jQuery(eleObj).selectmenu("refresh");
            break;
        case "textarea":
            jQuery(eleObj).textinput("refresh");
            break;
        case "collapsible_set":
            jQuery(eleObj).collapsibleset("refresh");
            break;
        case "filter":
            $( "ul[data-input='#"+eleObj.id+"']" ).filterable("refresh");
            break;
        case "list":
            jQuery(eleObj).listview("refresh");
            break;
        case "toolbar":
            jQuery(eleObj).toolbar("refresh");
            break;
        case "table":
            jQuery(eleObj).table("rebuild");
            break;
        default:
            throw("type undefined: " + widgetType);
    }
}
