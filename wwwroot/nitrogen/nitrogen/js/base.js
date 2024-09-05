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
