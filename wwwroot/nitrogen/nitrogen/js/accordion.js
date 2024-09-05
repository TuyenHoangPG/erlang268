

/*** ACCORDION ***/

N.$accordion = function(accordionObj, accordionOptions, accordionPostbackInfo) {
    var n = Nitrogen.$lookup(Nitrogen.$current_id);
    if(accordionPostbackInfo != "nopostback"){
        accordionOptions.activate = function(ev, ui) {
            n.$queue_event(this.id, accordionPostbackInfo);
        }
    }
    jQuery(accordionObj).accordion(accordionOptions);
}
