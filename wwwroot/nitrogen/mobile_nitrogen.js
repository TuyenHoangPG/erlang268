/*
Usage:
  var n = new Nitrogen({
    url: "http://nitrogenserver/web/module",
    div: enclosingDiv
  });

  n.IFrame(div, url);
  n.Inline(div, url);
  n.Windex(div, url);
*/

function Nitrogen(o) {
  // Set the id, and associate with the global Nitrogen object...
  if (o.id) {
    this.id = o.id
  } else {
    this.id = "o" + Math.floor(Math.random()*999999999);
  }
  eval(Nitrogen.$NString + "." + this.id + " = this;");

  // Set the originating URL...
  if (o.url) {
    this.$url = o.url;
  } else {
    this.$url = document.location.href;
  }

  // Set some initial properties.
  if (o.div) {
    this.$div = o.div;
  } else {
    this.$div = document;
  }

  // Clear the dom_state...
  this.$dom_state = "";
  this.$comet_is_running = false;
  this.$simulateSlowConnection = false;
  this.$simulateDelay = 0;
}

var N = Nitrogen;
N.$NString = "Nitrogen";
N.$current_id = "";
N.$current_path = "";
N.$event_queue = new Array();
N.$event_is_running = false;

/*** DEFINE SPECIAL EVENTS ***/
$.event.special.destroyed = {
  remove: function(o) {
    if (o.handler) {
      o.handler()
    }
  }
};

/*** PUBLIC METHODS ***/

function obj(path) {
  return Nitrogen.obj(path);
}

function is_obj_existing(path) {
  return Nitrogen.is_obj_existing(path);
}

N.Page = function(o) {
  var n = new Nitrogen(o);
  n.$do_event = n.$do_xhr_event;
  n.$do_comet = n.$do_xhr_comet;
  return n;
}

N.Inline = function(o) {
  var n = new Nitrogen(o);
  if (o.windex) {
    n.$do_event = n.$do_windex_event;
    n.$do_comet = n.$do_windex_comet;
    n.$url = Nitrogen.$add_param(n.$url, "windex", "true");
  } else {
    n.$do_event = n.$do_xhr_event;
    n.$do_comet = n.$do_xhr_comet;
  }

  var url = Nitrogen.$add_param(n.$url, "object_id", n.id);
  Nitrogen.$load_script(url);
  return n;
}


/*** PRIVATE METHODS ***/

N.$lookup = function(id) {
  return eval(Nitrogen.$NString + "." + id + ";");
}

N.$set_dom_state = function(s) {
  var n = Nitrogen.$lookup(Nitrogen.$current_id);
  n.$set_dom_state(s);
}

N.prototype.$set_dom_state = function(s) {
  this.$dom_state = s;
}

N.$get_dom_state = function() {
  var n = Nitrogen.$lookup(Nitrogen.$current_id);
  return n.$get_dom_state();
}

N.prototype.$get_dom_state = function() {
  return this.$dom_state;
}

N.prototype.$urlencode = function(str) {
    return encodeURIComponent(str).replace(/%20/g, '+').replace(/\*/g, '%2A');
}


/*** EVENT QUEUE ***/

N.$queue_event = function(triggerID, postbackInfo, extraParams) {
  var n = Nitrogen.$lookup(Nitrogen.$current_id);
  n.$queue_event(triggerID, postbackInfo, extraParams);
}

N.prototype.$queue_event = function(triggerID, postbackInfo, extraParams) {
  // Put an event on the event_queue.
  Nitrogen.$event_queue.push({
    n : this,
    triggerID    : this.obj(triggerID).id,
    postbackInfo : postbackInfo,
    extraParams  : extraParams
  });
}


N.$event_loop = function() {
  // Make it loop.
  setTimeout(Nitrogen.$NString + ".$event_loop();", 1);

  // If something is running, or the queue is empty, then just return.
  if (Nitrogen.$event_is_running) { return; }
  if (Nitrogen.$event_queue.length == 0) {
    return;
  } else {
    // Get and exect the event.
    var o = Nitrogen.$event_queue.shift();
    o.n.$do_event(o.triggerID, o.postbackInfo, o.extraParams);
  }
}

/*** MISC ***/

N.$return_false = function(value, args) {
  return false;
}

// Enter key or Tab key
N.$is_enter_key = function(event) {
  return (event && (event.keyCode == 13 || event.keyCode == 9));
}

N.$go_next = function(controlID) {
  var o = Nitrogen.obj(controlID);
  if (o.focus) { o.focus(); }
  if (o.select) { o.select(); }
  if (o.click) { o.click(); }
}

N.$disable_selection = function(element) {
  element.onselectstart = function() {
    return false;
  };
  element.onmousedown = function() {
    return false;
  };
  element.unselectable = "on";
  element.style.MozUserSelect = "none";
  element.style.cursor = "default";
  element.style.WebkitTouchCallout = "none";
  element.style.UserSelect = "none";
  element.style.WebkitUserSelect = "none";
  element.style.MsUserSelect = "none";
}

N.$set_value = function(element, value) {
  if (!element.id) { element = obj(element); }

  // see also N.$update(). there is histrically difference but very similar.

  var tagName = element.tagName;
  var type = element.type;

  // TODO 2014/09/10 Binh: we don't need to encode html in js anymore (we did it it erlang code)
//  // HTMLエスケープ
//  var htmlEncodeTags = ["H1", "H2", "H3", "H4", "LABEL", "SPAN", "P", "A"];
//  if( tagName && jQuery.inArray(tagName.toUpperCase(), htmlEncodeTags)>-1 ) {
//      value = Nitrogen.$encodeHTML(value);
//  }

  // need to use raw value for these element (because they don't need encoding, we did encode in erlang)
  var htmlDecodeTags = ["INPUT", "TEXTAREA"];
  if( tagName && jQuery.inArray(tagName.toUpperCase(), htmlDecodeTags)>-1 ) {
    value = Nitrogen.$decodeHTML(value);
  }

  if( tagName && type && (
      tagName.match( /^INPUT$/i ) &&
      ( type   .match( /^CHECKBOX$/i  ) ||
      type   .match( /^RADIO$/i  ) ) )
  )
  {
    element.checked = ((value == 'on' || value == 'true' || value ===true) ? "checked" : "");
  }
  else if (element.value !== undefined) { element.value = value; }
  else this.$update(element, value);
}

N.$encodeHTML = function(val) {
  if(val == "" || val == undefined) return "";
  return $("<pre/>").text(val).html();
};

N.$decodeHTML = function(val) {
  if(val == "" || val == undefined) return "";
  return $('<textarea/>').html(val).val();
};

N.$add_param = function(url, key, value) {
  // Create the key=value line to add.
  // Sometimes, the user will pass a bunch of params in the key field.
  var s = "";
  if (key) { s = key; }
  if (key && value) { s = key + "=" + value; }

  // Return the updated url...
  var parts = url.split("?");
  if (parts.length == 1) { return url + "?" + s; }
  if (parts.length > 1) { return url + "&" + s; }
}

N.$load_script = function(url) {
  var head = document.getElementsByTagName('head')[0];
  var script = document.createElement('script');
  script.type= 'text/javascript';
  script.src= url;
  head.appendChild(script);
}

/*** CHECK INCLUDE FILES ***/

N.$check_include_files = function(files){
  // 全てのロードされたJS, CSSを取得
  var allLoadedFiles;

  var urlAttr;

  // チェックしたいのJS, CSSファイルのフールパス
  var fullPath;

  // 読み込まれていないjs, cssファイルを纏める
  var lackFiles = $.map( files, function( val, i ) {
    fullPath = window.location.origin + val;

    // チェックしたいファイルはJSファイルの場合
    if(val.match(/\.js$/)) {
      allLoadedFiles = document.scripts;
      urlAttr = "src";
    }
    // チェックしたいファイルはCSSファイルの場合
    else {
      allLoadedFiles = document.styleSheets;
      urlAttr = "href";
    }

    // js, cssファイルが読み込まれているかどうかをチェック関数
    var check = function(){
      for(var j = 0; j < allLoadedFiles.length; j++) {
        // 読み込まれたら、trueを返します
        if(fullPath == allLoadedFiles[j][urlAttr]) {
          return true;
        }
      }

      // 読み込まれてない場合、falseを返します
      return false
    }

    // 読み込まれてる場合、結果に纏めない
    if(check()) {
      return null;
    }
    // 読み込まれてない場合、結果に纏めます
    else {
      return val;
    }
  });

  if(lackFiles.length != 0) {
    console.log("Not Found :" + lackFiles + ". Please check element require js, css files.");
  }

}

/*** Others ***/

/* Use binary search algorithm to search for key in an array.
 * Return true if array includes key, otherwise false
 */
N.$binsearch = function(array, key) {
  if (typeof(array) === 'undefined' || !array.length) return false;

  var upper_bound = array.length - 1;
  var lower_bound = 0;
  var low;
  var high;

  while (lower_bound <= upper_bound) {
    mid = parseInt((lower_bound + upper_bound) / 2);
    var item = array[mid];
    if (item.constructor===Array) {
      low  = item[0];
      high = item[1];
    } else {
      low  = item;
      high = item;
    }
    if (key < low) {
      upper_bound = mid - 1;
    } else if (key > high) {
      lower_bound = mid + 1;
    } else {
      return true;
    }
  }

  return false;
};


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


/*** AJAX METHODS ***/

N.prototype.$do_xhr_event = function(triggerID, postbackInfo, extraParams) {
  // Flag to prevent firing multiple postbacks at the same time...
  Nitrogen.$event_is_running = true;
  // Run validation...
  var s = this.$validate_and_serialize(triggerID);

  if (s == null) {
    Nitrogen.$event_is_running = false;
    return;
  }

  // Build params...
  var params =
    "domState=" + this.$dom_state +
    "&postbackInfo=" + postbackInfo +
    "&" + s +
    "&" + extraParams;

  var target = jQuery("#" + triggerID);
  var preload = target.is("a") || target.is(":button");
  if(preload) {
      // Disable mouse event
      jQuery("body").addClass("disable-during-postback");
      //Disable keyboard events
      jQuery(document).on('keydown', function(objEvent) {
          objEvent.preventDefault();
          return false;
      });
      // Disable accesskey
      var akEls = document.querySelectorAll('[accesskey]');
      Array.prototype.forEach.call(akEls, function (el, i) {
          // Temporarily replace the accesskey attribute with another attribute (data-disable-accesskey)
          el.setAttribute('data-disable-accesskey', el.getAttribute('accesskey'));
          el.removeAttribute('accesskey');
      });
  }
  var url = this.$url;
  var post = function() {
    jQuery.ajax({
      url: url,
      type:'post',
      data: params,
      dataType: 'text',
      success: function(data, textStatus) {
        if(preload) {
          // Enable mouse click and keyboard events
          jQuery("body").removeClass("disable-during-postback");
          jQuery(document).off('keydown');
          // Enable accesskey
          var akEls = document.querySelectorAll('[data-disable-accesskey]');
          Array.prototype.forEach.call(akEls, function (el, i) {
            el.setAttribute('accesskey', el.getAttribute('data-disable-accesskey'));
            el.removeAttribute('data-disable-accesskey');
          });
        }
        Nitrogen.$event_is_running = false;
        eval(data);
      },
      error: function(xmlHttpRequest, textStatus, errorThrown) {
        if(preload) {
          // Enable mouse click and keyboard events
          jQuery("body").removeClass("disable-during-postback");
          jQuery(document).off('keydown');
          // Enable accesskey
          var akEls = document.querySelectorAll('[data-disable-accesskey]');
          Array.prototype.forEach.call(akEls, function (el, i) {
            el.setAttribute('accesskey', el.getAttribute('data-disable-accesskey'));
            el.removeAttribute('data-disable-accesskey');
          });
        }
        Nitrogen.$event_is_running = false;
        eval(xmlHttpRequest.responseText);
      }
    });
  };
  if (preload && N.$simulateSlowConnection && N.$simulateDelay > 0) {
    target.oneTime(N.$simulateDelay, post);
  } else {
    post();
  }
}

N.$register_spinner = function(postbackInfo, spinnerids) {
    $.each(spinnerids, function(i, id) {
        // クエリ文字列からオブジェクトに変換する関数
        query_to_hash = function(str) {
          var j, q;
          q = str.replace(/\?/, "").split("&");
          j = {};
          $.each(q, function(i, arr) {
            arr = arr.split('=');
            return j[arr[0]] = decodeURIComponent(arr[1]);
          });
          return j;
        }

        // リクエストを送ろうとする時に、spinnerを表示する
        $(document).ajaxSend(function(event, xhr, options) {
            // 本リクエストがpostbackに関連するかpostbackInfoでチェックする
            if(postbackInfo == query_to_hash(options.data).postbackInfo || postbackInfo == 'all') {
                if($('#'+id+'').length) {
                    $('#'+id+'').show();
                }
            }
        });

        // リクエストを終わろうとする時に、spinnerを非表示する
        $(document).ajaxComplete(function(event, xhr, options) {
            // 本リクエストがpostbackに関連するかpostbackInfoでチェックする
            if(postbackInfo == query_to_hash(options.data).postbackInfo || postbackInfo == 'all') {
                if($('#'+id+'').length) {
                    $('#'+id+'').hide();
                }
            }
        });
    });
}

N.$comet_start = function(postbackInfo) {
  N.$comet_done = false;
  var n = Nitrogen.$lookup(Nitrogen.$current_id);
  n.$comet_start(postbackInfo);
}

N.$comet_stop =  function() {
    N.$comet_done = true;
}

N.prototype.$comet_start = function(postbackInfo) {
  this.$do_comet(postbackInfo);
}

N.prototype.$do_xhr_comet = function(postbackInfo) {
  if (this.$comet_is_running) return;
  this.$comet_is_running = true;

  // Get params...
  var params =
    "postbackInfo=" + postbackInfo +
    "&domState=" + this.$dom_state;

  var n = this;
  var url = this.$url;
  $.ajax({
    url: url,
    type:'post',
    data: params,
    dataType: 'text',
    success: function(data, textStatus) {
      eval(data);
      n.$comet_is_running = false;
      if(!N.$comet_done) {
        N.$comet_done = false;
        setTimeout("Nitrogen." + n.id + ".$comet_start('" + postbackInfo + "');", 0);
      }
    },
    error: function(xmlHttpRequest, textStatus, errorThrown) {
      n.$comet_is_running = false;
      setTimeout("Nitrogen." + n.id + ".$comet_start('" + postbackInfo + "');", 5000);
    }
  });
}

/*** DYNAMIC UPDATING ***/

N.$update = function(el, html) {
  var element = jQuery(el);
  var tagName = element.attr('tagName');
  var type = element.attr('type'   );
  if(tagName && type && (
      tagName.match( /^INPUT$/i ) &&
      ( type   .match( /^TEXT$/i  ) ||
      type   .match( /^RADIO$/i ) )) )
  {
    element.attr('value', html);
  }
  else if(tagName && type && (
      tagName.match( /^INPUT$/i ) &&
      type   .match( /^CHECKBOX$/i  ) ) )
  {
    element.attr('checked', (html == 'on' || html == 'true') ? "checked" : "");
  }
  else
  {
    element.html(html).change();
  }
}

N.prototype.$update = function(html) {
  jQuery(this.$div).html(html);
}

N.$insert_top = function(el, html) {
  jQuery(el).prepend(html).change();
}

N.$insert_bottom = function(el, html) {
  jQuery(el).append(html).change();
}

N.$replace = function(el, html) {
  jQuery(el).replaceWith(html);
}


/*** SERIALIZATION ***/

N.prototype.$get_elements_to_serialize = function() {
    var tagnames = ["input", "button", "select", "textarea", "checkbox"];
    var a = new Array();
    for (var i=0; i<tagnames.length; i++) {
        var l = this.$div.getElementsByTagName(tagnames[i]);
        for (var j=0; j<l.length; j++) {
            var elementName = l[j].name;

            if (l[j].id.match(/^[0-9]+_.+$/)) {
                // jqgrid input element: pass
                continue;
            }

            //

            if (elementName != "domState" && elementName != "postbackInfo") {
                a = a.concat(l[j]);
            }
        }
    }

    // SPAN element which has 'inputable' class is handled as a input element.
    $(".inputable").each(function () {
        if((this.tagName === "SPAN") === false)
            return;

        var el = document.createElement('input');
        el.type = 'text';
        el.name = this.id;
        el.value = this.innerHTML;

        a = a.concat(el);
    });

    return a;
}


/*** PATH LOOKUPS ***/

N.obj = function(path) {
    var n = Nitrogen.$lookup(Nitrogen.$current_id);
    return n.obj(path);
}

N.prototype.obj = function(path) {
    path = N.$normalize_partial_path(path);

    // Try the easy option...
    var el = document.getElementById(path);
    if (el) { return el; }

    // Not found, so scan recursively...
    var obj = Nitrogen.$scan_elements(path, this.$div.childNodes);
    if(obj==null)
        console.log("ERROR: '"+path+"' is not found!");
    return obj;
}

N.is_obj_existing = function(path) {
    var n = Nitrogen.$lookup(Nitrogen.$current_id);
    return n.is_obj_existing(path);
}

N.prototype.is_obj_existing = function(path) {
    path = N.$normalize_partial_path(path);

    // Try the easy option...
    var el = document.getElementById(path);
    if (el) { return el; }

    // Not found, so scan recursively...
    var obj = Nitrogen.$scan_elements(path, this.$div.childNodes);
    return obj != null;
}

N.$normalize_partial_path = function(path) {
    var oldparts = Nitrogen.$current_path.split(".");
    var newparts = path.split(".");
    var a = new Array();
    for (var i=0; i<newparts.length; i++) {
        var part = newparts[i];
        if (part == "me") { a = oldparts; }
        else if (part == "parent") { a.pop(); }
        else { a.push(part); }
    }

    return a.join("__");
}

N.$scan_elements = function(path, elements) {
    if (!elements) { return; }

    for (var i=0; i<elements.length; i++) {
        var t = elements[i].id;
        if (t == undefined) { continue; }
        var pos = t.indexOf(path);
        if (pos == -1) { continue; }

        if(pos != 0) {
            // path is relative
            pos = t.indexOf("__"+path);
            if (pos == -1) { continue; }

            // skip jqgrid internal elements
            if (t.match(/^(gbox_|gview_|load_|lui_|cb_|rs_)/)) { continue; }
        }

        if(t.match(new RegExp(path+"$"))) { return elements[i]; }
    }

    for (var i=0; i<elements.length; i++) {
        var el = Nitrogen.$scan_elements(path, elements[i].childNodes)
        if (el) { return el; }
    }

    return null;
}


/*** EVENT WIRING ***/

N.$observe_event = function(el, type, func) {
    jQuery(el).bind(type, func);
}


/*** VALIDATION ***/

// Halfwidth Katakana variants （U+FF65 ~ U+FF9F) (65381, 65439)
N.is_halfwidth_kana = function(text) {
    for (var i=0; i<text.length; i++) {
        var charCode = text.charCodeAt(i);
        if (charCode < 65381 || charCode > 65439) {
            return false;
        }
    }
    return true;
}

// Full width Katakana U+30A0 ~ U+30FF ( 12448 ~ 12543 ) and  U+31F0 ~ U+31FF ( 12784 ~ 12799 )
N.is_fullwidth_kana = function(text) {
    for (var i=0; i<text.length; i++) {
        var charCode = text.charCodeAt(i);
        if (charCode < 12448 || (charCode > 12543 && charCode < 12784) || charCode > 12799) {
            return false;
        }
    }
    return true;
}

// Hiragana U+3041 ~ U+309F ( 12353 ~ 12447 )
N.is_hiragana = function(text) {
    for (var i=0; i<text.length; i++) {
        var charCode = text.charCodeAt(i);
        if (charCode < 12353 || charCode > 12447) {
            return false;
        }
    }
    return true;
}

// All characters marked as W(ide), F(ullwidth) and A(mbiguous) are fullwidth characters.
N.is_fullwidth_character = function(text) {
    var valid_code_array = (new FullwidthUnicode()).codes();
    for (var i=0; i<text.length; i++) {
        var charCode = text.charCodeAt(i);
        if (!N.$binsearch(valid_code_array, charCode)) {
            return false;
        }
    }
    return true;
}
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


/*** CHART_JS ***/



N.$chartJsInit = function(Id, dataSet, chartjsOptions, chartType){
    var chartTypeName = chartType;
    // Generate chart
    generate_chart(Id, dataSet, chartTypeName);

    // Generate a appropriate chart based on chartType and the given rawData
    function generate_chart(chartContainerID, rawData, chartType){

        var options = chartjsOptions;
        var data = rawData;

        //Create a chart
        create_chart(chartContainerID, chartType, data, options);
    }

    // to create a chart
    function create_chart(chartContainerID, chartType, chartInputData, chartOptions){
        var chartConfig = get_chart_config(chartType, chartInputData, chartOptions);
        var ctx = document.getElementById(chartContainerID).getContext("2d");
        new Chart(ctx, chartConfig);
    }

    // the configuration of chart as chartjs format
    function get_chart_config(chartType, chartInputData, chartOptions){
        var config = {
            type: chartType,
            data: chartInputData,
            options: chartOptions
        };

        return config;
    }

}


Nitrogen.$event_loop();
Nitrogen.Page({id : 'page'});

// For Base URI
function baseURI() {
    if (N.$bu !== null && N.$bu !== "/") {
        return N.$bu + "/";
    }
    return "/";
}
