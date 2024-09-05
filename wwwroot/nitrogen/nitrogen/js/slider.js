

/*** SLIDER ***/

N.$slider = function(sliderObj, sliderOptions) {
    jQuery(sliderObj).slider(sliderOptions);
    // #datepicker_textboxのカレンダーの上につまみが表示されるためzindexを調整しました
    $('.ui-slider .ui-slider-handle').css('z-index', '1');
}

N.$registerSliderPostback = function(sliderObj, sliderPostbackInfo, postbackTrigger) {
    var n = Nitrogen.$lookup(Nitrogen.$current_id);
    if(postbackTrigger == "change"){
        jQuery(sliderObj).bind('slidechange', function(event, ui) {
            var value = ui.value;
            n.$queue_event(this.id, sliderPostbackInfo, "value=" + value);
        });
    }else if(postbackTrigger == "start"){
        jQuery(sliderObj).bind('slidestart', function(event, ui) {
            var value = ui.value;
            n.$queue_event(this.id, sliderPostbackInfo, "value=" + value);
        });
    }else if(postbackTrigger == "stop"){
        jQuery(sliderObj).bind('slidestop', function(event, ui) {
            var value = ui.value;
            n.$queue_event(this.id, sliderPostbackInfo, "value=" + value);
        });
    }else if(postbackTrigger == "slide"){
        jQuery(sliderObj).bind('slide', function(event, ui) {
            var value = ui.value;
            n.$queue_event(this.id, sliderPostbackInfo, "value=" + value);
        });
    }else if(postbackTrigger == "range_slide") {
      jQuery(sliderObj).bind('slide', function(event, ui) {
            var values = ui.values;
            n.$queue_event(this.id, sliderPostbackInfo, "value=" + values);
      });
    }else if(postbackTrigger == "range_start") {
      jQuery(sliderObj).bind('slidestart', function(event, ui) {
            var values = ui.values;
            n.$queue_event(this.id, sliderPostbackInfo, "value=" + values);
      });
    }else if(postbackTrigger == "range_stop") {
      jQuery(sliderObj).bind('slidestop', function(event, ui) {
            var values = ui.values;
            n.$queue_event(this.id, sliderPostbackInfo, "value=" + values);
      });
    }else if(postbackTrigger == "range_change") {
      jQuery(sliderObj).bind('slidechange', function(event, ui) {
            var values = ui.values;
            n.$queue_event(this.id, sliderPostbackInfo, "value=" + values);
      });
    }
}
