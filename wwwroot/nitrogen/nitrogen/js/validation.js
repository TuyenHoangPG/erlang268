

/*** VALIDATE AND SERIALIZE ***/

N.prototype.$validate_and_serialize = function(triggerID) {
  // Check validatation and build params...
  var s = "";
  var is_valid = true;
  var elements = this.$get_elements_to_serialize();
  for (var i=0; i<elements.length; i++) {
    element = elements[i];
    if (element.validator && (jQuery.inArray(triggerID, element.validator.triggers)>-1) && !element.validator.validate()) {
      is_valid = false;
    } else {
      if (element.type == "radio") {
        s += "&" + element.id + "=" + element.checked;
      }

      if(element.tagName=="INPUT" && element.type=="file") {
        s += "&" + encodeURIComponent(element.name) + "=" + encodeURIComponent(element.value);
      } else {
        s += "&" + jQuery(element).serialize();
      }
    }
  }

  // Return the params if valid. Otherwise, return null.
  if (is_valid) {
    return s;
  } else {
    return null;
  }
}

N.clearValidationMessage = function () {
  var n = Nitrogen.$lookup(Nitrogen.$current_id);
  var elements = n.$get_elements_to_serialize();
  for (var i=0; i<elements.length; i++) {
    element = elements[i];
    if (element.validator) element.validator.removeMessageAndFieldClass();
  }
}

N.clearValidationMessageWithId = function (parentID) {
    var elements = $(parentID).find('*').each(function(i, obj) {
        if(obj.validator) obj.validator.removeMessageAndFieldClass();
    });
}

// ANHLQ: added a parameter 'displayMode' to alternate between error message display methods (span or tooltip)
N.$createValidator = function (validMessage, onlyOnBlur, onlyOnSubmit, insertAfterNode, triggerID,
                               onInvalidFun, displayMode) {
  var validator = obj('me').validator;

  if(!validator){
    validator = new LiveValidation(
      obj('me'),
      {
        validMessage: validMessage,
        onlyOnBlur: onlyOnBlur,
        onlyOnSubmit: onlyOnSubmit,
        insertAfterWhatNode: insertAfterNode,
        displayMode: displayMode,
        onInvalid: function() {
          onInvalidFun();

          if (this.displayMode == "original")
            this.insertMessage(this.createMessageSpan());
          else if (this.displayMode == "tooltip")
            this.insertTooltip();

          this.addFieldClass();
        }
      }
    );
    validator.triggers = [];
  }
  if(!obj(triggerID)) throw "undefined validation trigger id " + triggerID;
  validator.triggers.push(obj(triggerID).id);
  obj('me').validator = validator;
  return validator;
}
