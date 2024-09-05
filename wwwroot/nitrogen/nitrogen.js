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


/*** WINDEX METHODS ***/

N.prototype.$do_windex_event = function(triggerID, postbackInfo, extraParams) {
    // Run validation...
    var s = this.$validate_and_serialize(triggerID);
    if (s == null) { return; }

    // Build params...
    var url = this.$url;
    url = Nitrogen.$add_param(url, "domState", this.$dom_state);
    url = Nitrogen.$add_param(url, "postbackInfo", postbackInfo);
    url = Nitrogen.$add_param(url, s);
    url = Nitrogen.$add_param(url, extraParams);
    Nitrogen.$load_script(url);
}


N.prototype.$do_windex_comet = function(postbackInfo) {
    alert("Comet is not yet supported via Windex.");
}


/*** FILE UPLOAD ***/
N.$upload = function(form, maxSizePostbackInfo, maxSize, file) {
    // 出来れば、クライアント側で、ファイルサイズ制限を実施する
    if(maxSize && file.files && file.files[0] && file.files[0].size > maxSize) {
        Nitrogen.$queue_event(file.id, maxSizePostbackInfo);
    }
    // クライアント側で、ファイルサイズ制限を実施出来ない場合、ファイルをアップロード開始する
    // ファイルサイズ制限は後で、サーバー側で行われる
    else{
        var n = Nitrogen.$lookup(Nitrogen.$current_id);
        form.domState.value = n.$dom_state;
        form.action = n.$url;
        form.submit();
        form.reset();
    }
}

// prepare for upload element
N.$initialize_upload = function(fileInput) {
    fileInput.find('>input[type="file"]').width(
        fileInput.find('>div').width()
    );

    fileInput.find('>input[type="file"]').height(
        fileInput.find('>div').height()
    );

    // register event handler when file is selected
    fileInput.find('>input').change(function() {
        if(this.files.length == 0) {
            fileInput.find('>div>input')[0].value = '';
        } else {
            // get file name selected
            var filename;

            // if browser is chrome or webkit family, use file reader
            if ( $.browser.webkit ) {
                filename = this.files[0].name;
            } else { // if browser is not chrome or webkit family, use value from file element
                filename = this.value;
                if(filename.match(/fakepath/)) {
                    // update the file-path text using case-insensitive regex
                    filename = filename.replace(/C:\\fakepath\\/i, '');
                }
            }

            // set file name to input field to display
            fileInput.find('>div>input')[0].value = filename;
        }
    });
}


/*** GMAIL-STYLE UPLOAD ***/
N.$cancel_files = function(form) {
    if(typeof(form.$jqXHR)=="object") {
        var jqXHR=null;
        // cancel all pending files
        while(jqXHR=form.$jqXHR.shift()) {
            jqXHR.abort();
        }
    }
    if (jQuery(form).find('input[type="file"]').attr('disabled') !== undefined) {
        jQuery(form).find('input[type="file"]').removeAttr('disabled');
        jQuery(form).find('input[name="add"]').removeAttr('disabled');
    }
}

N.$send_pending_files = function(form,input, nofilePostbackInfo) {
    var file=null;
    if(typeof(form.$nitrogen_pending_files)=="object") {
        if(form.$nitrogen_pending_files.length == 0) {
            Nitrogen.$queue_event(input.id, nofilePostbackInfo);
        }

        // start upload all added file
        while(file=form.$nitrogen_pending_files.pop()) {
            // submit for upload
            var jqXHR = file.submit();
            // push req to queue for later cancel
            if(typeof(form.$jqXHR)=="undefined") form.$jqXHR = [];
            form.$jqXHR.push(jqXHR);
        }
    }
}

N.$attach_upload_handle_dragdrop = function(form,input,settings) {
    var thisNitro = this;
    if(typeof(settings)=="undefined")
        settings={};
    if(typeof(form.$nitrogen_pending_files)=="undefined")
        form.$nitrogen_pending_files = [];
    if(typeof(form.$totalSize)=="undefined")
        form.$totalSize = 0;

    var dropzone = jQuery(form).children(".upload_drop");
    var progressbar = "#" + input.id + "_progressbar";

    var browseButton = jQuery(form).find(".upload-button");
    Nitrogen.$add_classbutton_ie(browseButton);
    var uploadContentDiv = jQuery(form).find(".upload-content");
    uploadContentDiv.width(browseButton.width() + 24);
    jQuery(input).fileupload({
        dropZone:(settings.droppable ? dropzone : null),

        // このオプションを変更すると、以下の処理も修正しなくてはいけない
        singleFileUploads:true,
        sequentialUploads:true,
        url:thisNitro.$url,
        paramName:"file",
        formData: function() {
            return jQuery(form).serializeArray();
        },

        // アップロードが開始する時にコールバック関数を定義する
        start: function(e) {
            // アップロード途中のネットワーク接続チェックを開始する（for N.$checkNetworkConnection）
            Nitrogen.lastConnectionTime = new Date().getTime() / 1000;
            Nitrogen.intervalOneSecondCurrentTime = Nitrogen.lastConnectionTime;
            function createInterval(f, form, progressbar, intervalTime){
                Nitrogen.myPopup =  setInterval(function(){f(form,progressbar)}, intervalTime)
            }
            createInterval(Nitrogen.$checkNetworkConnection, form,progressbar, 1000);

            jQuery(form).find('input[type="file"]').attr('disabled', 'disabled');
            jQuery(form).find('input[name="add"]').attr('disabled', 'disabled');
            var listLength = form.$nitrogen_pending_files.length;
            Nitrogen.$queue_event(input.id, settings.upload_start_postback, "upload_pending_files_length=" + listLength);
            jQuery(form).children(".upload_progress").fadeIn().text("Uploading...");
            $(progressbar).show();
        },

        // アップロード進捗イベントのコールバック関数を定義する
        progress: function(e,data) {
            // 最後にアップロードが進捗した時間を取得する（for N.$checkNetworkConnection）
            Nitrogen.lastConnectionTime = new Date().getTime() / 1000;

            var prog = parseInt(data.loaded / data.total * 100,10);

            // progress bar
            jQuery(form).children(".upload_progress").text(prog + "% (" + data.loaded + "/" + data.total + " bytes)");
            $(progressbar).progressbar({ max: data.total, value: data.loaded});
        },

        // アップロードが失敗する時コールバック関数を定義する
        fail: function(e,data, options) {
            Nitrogen.$increment_pending_upload_counter(form,-1);

            if(data.errorThrown === 'abort'){
                // アップロード中のメッセージを非表示する
                Nitrogen.$upload_finished(form, data.files[0].id);
            }

            // 最後のファイルが終わった後、進捗バーを非表示
            clearInterval(N.myPopup);
            Nitrogen.$finish_all(form, progressbar);
        },

        // ファイルを選択し、アップロードキューに追加されたとたんのコールバック
        add: function(e,data) {
            // 選択されたファイルサイズがサイズ制限を越えた場合
            form.$totalSize += data.files[0].size;
            if (settings.totalMaxFileSize && form.$totalSize > settings.totalMaxFileSize) {
                // retains the list of files whose total size satisfies the condition
                form.$totalSize -= data.files[0].size;
                // push event total_max_size into queue
                Nitrogen.$queue_event(input.id, settings.total_max_size_postback);
                return;
            }

            if(settings.maxFileSize && data.files[0].size > settings.maxFileSize) {
                Nitrogen.$queue_event(input.id, settings.max_size_postback);
                form.$totalSize -= data.files[0].size;
                return;
            }

            if(settings.multiple) {

                Nitrogen.$increment_pending_upload_counter(form,1);
            } else {
                if(form.$nitrogen_pending_files.length==0){
                    Nitrogen.$increment_pending_upload_counter(form,1);
                } else{
                    form.$nitrogen_pending_files.pop();
                }
            }

            data.files[0].id=Nitrogen.$get_counter(form);

            // auto_uploadがセットされた場合
            if(settings.autoupload)
                data.submit();
            else
                form.$nitrogen_pending_files.push(data);

            var upload_droplist = jQuery(form).children(".upload_droplist");
            upload_droplist.children("li").remove();

            jQuery.each(form.$nitrogen_pending_files, function(i, data){
                // Let's add the visual list of pending files
                var f = data.files[0];
                jQuery(form).children(".upload_droplist")
                    .prepend(jQuery("<li></li>").attr("fileid",f.id).text(f.name));
            });

        },

        // アップロードが成功した後、サーバからのレスポンスが受けたコールバック
        done: function(e,data) {
            if(typeof data.result == "string") {
                // Good browsers will use XHR file transfers, and so this
                // will return a string
                var Postback = data.result;
            } else if(typeof data.result == "object") {
                // Crappy browsers (IE9 and below) will do the transfer
                // as with an iframe and return a document-type object
                var Postback = data.result[0].body.innerHTML;
            } else {
                // IE also has data.result as "undefined" on failure
                // So let's just treat it as an empty string
                var Postback = "";
            }

            // サーバのスクリプトを実行する
            jQuery.globalEval(Postback);
            // アップロード中のメッセージを非表示する
            Nitrogen.$upload_finished(form, data.files[0].id);

            // キュにあるファイル数をデクリメントする
            Nitrogen.$increment_pending_upload_counter(form,-1);

            // 最後のファイルが終わった後、進捗バーを非表示
            clearInterval(N.myPopup);
            Nitrogen.$finish_all(form, progressbar);
        }
    });
}

// アップロードが完了してないファイル数を取得する
N.$get_counter = function(form) {
    var counter = $(form).data("pending_uploads");
    if(typeof(counter)=="undefined") {
        counter=0;
    }
    return counter;
}


// 1秒ごとに取得した現在時間と、progress関数（サーバと接続して、アップロードが進む）が呼ばれるごとに取得した時間を比較して
// 30秒以上の差があれば、サーバと接続できていないと判断してアラートを表示する。
// サーバ側でも30秒でタイムアウトするように実装している。
 N.$checkNetworkConnection = function(form,progressbar) {
    Nitrogen.intervalOneSecondCurrentTime = new Date().getTime() / 1000;
    // disconnect after 30 sec will show error disconnection.
    if(Nitrogen.intervalOneSecondCurrentTime - Nitrogen.lastConnectionTime > 30){
        // 最後のファイルが終わった後、進捗バーを非表示にする
        $(form).data("pending_uploads",0); //to notify that upload finished(because network broken)
        Nitrogen.$finish_all(form,progressbar);
        clearInterval(N.myPopup);
    }
 }

// アップロードが完了してないファイル数を更新する
N.$increment_pending_upload_counter = function(form,incrementer) {
    var counter = Nitrogen.$get_counter(form);
    counter+=incrementer;
    $(form).data("pending_uploads",counter);
}

N.$finish_all = function(form, progressbar) {
    var counter = Nitrogen.$get_counter(form);
    // pendingファイル数は０になったら、upload_progressを非表示します
    if(counter==0) {
        jQuery(form).children(".upload_progress").fadeOut();
        Nitrogen.$alert_unfinished_files(form);
        $(progressbar).hide();
        if (jQuery(form).find('input[type="file"]').attr('disabled') !== undefined) {
            jQuery(form).find('input[type="file"]').removeAttr('disabled');
            jQuery(form).find('input[name="add"]').removeAttr('disabled');
        }
        // update totalsize
        form.$totalSize = 0;
    }
}

// アップロードファイルを完了マークを表示します
N.$upload_finished = function(form, id) {
    var li = jQuery(form).children(".upload_droplist").children("li[fileid=\"" + id + "\"]");
    li.css("text-decoration","line-through")
        .addClass("upload_successful")
        .fadeOut();
}

// アップロード失敗ファイルが有る場合、アラートで通知します
N.$alert_unfinished_files = function(form) {
    var files = $(form).find(".upload_droplist li:not(.upload_successful):visible");
    if(files.length > 0) {
        $(form).find(".upload_droplist li:not(.upload_successful)").css("color","red").fadeOut("slow");

        var filenames = $(files).get().map(function(f) { return $(f).text() }).join("\r\n");
        alert("There was an error uploading the following file(s):\r\n" + filenames + "\r\n\r\nThis is likely due to the file(s) being too large or a misconfiguration on the server");
    }
    if (jQuery(form).find('input[type="file"]').attr('disabled') !== undefined) {
        jQuery(form).find('input[type="file"]').removeAttr('disabled');
        jQuery(form).find('input[name="add"]').removeAttr('disabled');
    }
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


/*** IMAGE CAPTION ***/
N.$image_caption = function(imageObj,options) {
    jQuery(imageObj).mosaic(options);
    var img = jQuery(imageObj).children(".mosaic-backdrop").find('>img');

    // After Chrome updating its rendering engine to be less detectant of quick DOM-changes,
    // this script may yield 0 width and height if repeated several times in quick succession.
    $(img).load(function() {
        jQuery(imageObj).width(img[0].width);
        jQuery(imageObj).height(img[0].height);
    });
}

/*** CONTEXT MENU ***/
N.$context_menu = function(targetId, postbackInfo, items) {
    var targetSelector = "[id$='" + targetId + "']";
    $.contextMenu({
        selector: targetSelector,
        callback: function(key, options) {
            Nitrogen.$queue_event(targetId, postbackInfo, "action=" + key);
        },
        items: items
    });

    // remove DOM of context menu if target DOM is removed
    $( targetSelector ).bind("destroyed", function () {
        $.contextMenu( 'destroy', targetSelector );
    });
}


/*** COLOR PALETTE ***/
N.$color_palette = function(controlObj, options) {
    jQuery(controlObj).simpleColorPicker(options);

    // clean up palette DOM in case of color palette is removed
    jQuery(controlObj).bind('destroyed', function (e) {
        var paletteId = controlObj.id + "_color-picker";
        $("#" + paletteId).remove();
    })
}


/*** DATE PICKER ***/

N.$datepicker = function(pickerObj, pickerOptions) {
    //make datetime format conform to jquery-ui format
    //http://docs.jquery.com/UI/Datepicker/formatDate
    //http://trentrichardson.com/examples/timepicker/
    var mode='';
    if(pickerOptions!==undefined){
        if(pickerOptions.timeFormat!==undefined){
            mode='time';
            var timeFormat;
            if(pickerOptions.timeFormat.match(/M{2}/)){
                timeFormat = pickerOptions.timeFormat.replace("MM", "mm")
                pickerOptions.timeFormat = timeFormat;
            }else if(pickerOptions.timeFormat.match(/M{1}/)){
                timeFormat = pickerOptions.timeFormat.replace("M", "m")
                pickerOptions.timeFormat = timeFormat;
            }

            if(pickerOptions.timeFormat.match(/t/i)){
                pickerOptions.ampm=true;
            }
        }
        if(pickerOptions.dateFormat!=undefined){
            mode+='date';
            var dateFormat;
            if(pickerOptions.dateFormat.match(/y{4}/)){
                dateFormat = pickerOptions.dateFormat.replace("yyyy", "yy");
                pickerOptions.dateFormat = dateFormat;
            }else if(pickerOptions.dateFormat.match(/y{2}/)){
                dateFormat = pickerOptions.dateFormat.replace("yy", "y");
                pickerOptions.dateFormat = dateFormat;
            }
        }
    }
    if(mode === ''){
        jQuery(pickerObj).datepicker(pickerOptions);
    }else{
        if(mode === 'timedate'){
            jQuery(pickerObj).datetimepicker(pickerOptions);
        }else if(mode === 'time'){
            jQuery(pickerObj).timepicker(pickerOptions);
        }else{
            jQuery(pickerObj).datepicker(pickerOptions);
        }
    }
}

N.$date_range = function(from, to, changeMonthOption, changeYearOption, numberOfMonthsOption, formatOption) {
    // initialize date picker options
    pickerOptions = {};
    pickerOptions.changeMonth = changeMonthOption;
    pickerOptions.changeYear = changeYearOption;
    pickerOptions.numberOfMonths = numberOfMonthsOption;
    pickerOptions.dateFormat = formatOption;

    // set from, to picker options to the above options
    fromPickerOptions = jQuery.extend(true, {}, pickerOptions);
    toPickerOptions = jQuery.extend(true, {}, pickerOptions);

    // when select date on from date picker, limit date in to date picker
    fromPickerOptions.onClose = function( selectedDate ) {
        $( "#"+to ).datepicker( "option", "minDate", selectedDate );
    };

    // when select date on to date picker, limit date in from date picker
    toPickerOptions.onClose = function( selectedDate ) {
        $( "#"+from ).datepicker( "option", "maxDate", selectedDate );
    };

    // initialize from, to date picker
    Nitrogen.$datepicker(obj(from), fromPickerOptions);
    Nitrogen.$datepicker(obj(to), toPickerOptions);
};


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


/*** TAB ***/

N.$tabs = function(tabsObj, tabsOptions) {
    jQuery(tabsObj).tabs(tabsOptions);
}


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


/*** PROGRESSBAR ***/

N.$progressbar = function(progObj,progOptions){
    jQuery(progObj).progressbar(progOptions);
}


/*** TREEVIEW ***/

N.$treeview = function(treeObj,treeOptions){
    jQuery(treeObj).treeview(treeOptions);
}


/*** COLORPICKER ***/
N.$farbtastic = function(clrpickerObj,clrpickerOptions){
    jQuery(clrpickerObj).farbtastic(clrpickerOptions);
}


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


/*** MENU ***/

N.$menu = function(menuOptions) {
    jQuery('ul.sf-menu').superfish(menuOptions);
}


/*** SPLITTER ***/

N.$splitter = function(splitterObj, splitterOptions){
    jQuery(splitterObj).splitter(splitterOptions);
}


/*** TOOLTIP ***/
N.$tooltip = function(obj, options){
    var title = jQuery(obj).attr('title');

    if (typeof title === typeof undefined || title == false) {
        jQuery(obj).attr("title", "");
    }

    jQuery(obj).tooltip(options);
}

N.$tooltip_disable = function(obj, recursive) {
    var parent = jQuery(obj);
    if(recursive) {
        var children = parent.find('*');
        $.each(children, function(i, child) {
            if(jQuery(child).tooltip("instance")) {
                jQuery(child).tooltip("disable");
            }
        });
    }

    if(parent.tooltip("instance")) {
        parent.tooltip("disable");
    }
}

N.$tooltip_enable = function(obj, recursive) {
    var parent = jQuery(obj);
    if(recursive) {
        var children = parent.find('*');
        $.each(children, function(i, child) {
            if(jQuery(child).tooltip("instance")) {
                if (jQuery(child).attr('title') === undefined)
                    jQuery(child).attr('title', '');
                jQuery(child).tooltip("enable");
            }
        });
    }

    if(parent.tooltip("instance")) {
        if (parent.attr('title') === undefined)
            parent.attr('title', '');
        parent.tooltip("enable");
    }
}

/*** AUTOCOMPLETE TEXTBOX ***/
N.$autocomplete = function(path, autocompleteOptions, selectItemKey, searchTermKey, browsePostbackInfo, selectPostbackInfo) {
    // For floating window, to be displayed on the front.
    // Check whether #autocomplete_pull_down_menu exists, if it does not exist, add the div to the body.
    if ($("#autocomplete_pull_down_menu").length == 0) {
        $('body').append('<div id="autocomplete_pull_down_menu"></div>');
    }
    // Add the autocomple's pull down menu to #autocomplete_pull_down_menu.
    autocompleteOptions.appendTo ='#autocomplete_pull_down_menu';

    var n = Nitrogen.$lookup(Nitrogen.$current_id);
    jQuery.extend(autocompleteOptions, {
        select: function(ev, ui) {
            var item = (ui.item) && JSON.stringify(ui.item) || '';
            n.$queue_event(path.id, selectPostbackInfo, selectItemKey+"="+n.$urlencode(item));
        },
        source: function (request, response) {
            var params =
                "domState=" + Nitrogen.$get_dom_state() +
                "&postbackInfo=" + browsePostbackInfo +
                "&" + searchTermKey + "=" + encodeURIComponent(request.term);

            var post = function(){
                jQuery.ajax({
                    url: location.pathname,
                    type:'post',
                    data: params,
                    dataType: 'text',
                    success: function(data, textStatus){
                        response(JSON.parse(data));
                    },
                    error: function(xmlHttpRequest, textStatus, errorThrown){
                        eval(xmlHttpRequest.responseText);
                    }
                });
            };
            post();
        }
    });
    jQuery(path).autocomplete(autocompleteOptions);

    // For floating window, to be displayed on the front.
    $("#autocomplete_pull_down_menu > ul.ui-autocomplete").css("z-index", "150");
    // For floating window, The remains of the pull-down menu is displayed.
    // When you click the pull-down menu, and to remain to display the menu.
    $("#autocomplete_pull_down_menu > ul").mousedown(function(e) { e.stopPropagation(); });
    // If you click on the other elements , close the menu.
    $('body').live('mousedown', function() {
        if(jQuery(path).autocomplete( "instance" )) {
            jQuery(path).autocomplete( "close" );
        }
    });
}


/*** DRAG AND DROP ***/

N.$draggable = function (dragObj, dragOptions, dragTag) {
    dragObj.$drag_tag = dragTag;
    dragObj.$disable_draggable = dragOptions.disable_draggable ;
    dragOptions.appendTo = 'body';
    var help;
    var notRoot = false;
    dragOptions.zIndex = 99999;
    if (dragOptions.helper != 'clone') {
        dragOptions.helper = function () {
            help = $(this).clone();
            return help;
        };
    }
    dragOptions.start = function (event, ui) {
        if (dragOptions.helper != 'clone') {
            $(this).css('opacity', '0');
            if(dragOptions.notRoot) {
                notRoot = dragOptions.notRoot;
            }
        }
    }
    dragOptions.stop = function (event, ui) {
        if (dragOptions.helper != 'clone') {
            if (!dragOptions.revert) {
                // cancel remove helper
                var inst = $(this).data("ui-draggable");
                inst.cancelHelperRemoval = true;

                // make the clone as new draggable
                dragOptions.notRoot = true;
                $(help).css('z-index', 99999);
                $(help)[0].$drag_tag = dragTag;
                $(help).draggable(dragOptions);

                // remove the old helper but skip the root element
                if(!notRoot) {
                    $(this).removeAttr('id');
                    $(this).draggable('disable');
                } else {
                    $(this).remove();
                }

                $(this).bind('destroyed', function () {
                    $(help).remove();
                });

            } else {
                $(this).css('opacity', '1');
            }
        }
    }
    jQuery(dragObj).draggable(dragOptions);
}

N.$droppable = function(dropObj, dropOptions, dropPostbackInfo) {
    var n = Nitrogen.$lookup(Nitrogen.$current_id);
    dropOptions.drop = function(ev, ui) {
        if(ui.draggable[0].$disable_draggable){
            $(ui.draggable[0]).draggable("disable")
        }
        var dragItem = ui.draggable[0].$drag_tag;
        n.$queue_event(this.id, dropPostbackInfo, "drag_item=" + dragItem);
    }
    jQuery(dropObj).droppable(dropOptions);
}


/*** SORTING ***/

N.$sortitem = function(sortItem, sortTag) {
    sortItem.$sort_tag = sortTag;
    sortItem.$drag_tag = sortTag;
}

N.$sortblock = function(sortBlock, sortOptions, sortPostbackInfo) {
    var n = Nitrogen.$lookup(Nitrogen.$current_id);
    sortOptions.update = function () {
        var sortItems = "";
        for (var i = 0; i < this.childNodes.length; i++) {
            var childNode = this.childNodes[i];
            if (sortItems != "") {
                sortItems += ",";
            }
            if (childNode.$sort_tag) {
                sortItems += childNode.$sort_tag;
            }
        }
        n.$queue_event(this.id, sortPostbackInfo, "sort_items=" + sortItems);
    };
    // object move between floating windows
    sortOptions.helper = 'clone';
    sortOptions.appendTo = 'body';
    jQuery(sortBlock).sortable(sortOptions);
}


/*** TABLE ***/

/* Table sorter: Add sorting function to table */
N.tablesort = function(obj, ops) {
    // Create a new parser called 'kana' to get the kana values of Kanji cell values.
    // This parser will be called when sort_by_kana attribute is not empty.
    // This kana values must stand in the column next to Kanji cell,
    // and pre-defined by users.
    jQuery.tablesorter.addParser({
        id: 'kana',
        is: function(s) {
            // Return false so this parser is not auto detected
            return false;
        },
        format: function(s, table, cell) {
            if (/^\w[\w\s]+/.test(s)) {
                return s;
            }
            var kana = jQuery(cell).next().text();
            var is_kana = N.is_fullwidth_kana(kana) || N.is_halfwidth_kana(kana);
            return ((kana != '') && is_kana)? kana : s;
        },
        type: 'text'
    })
    jQuery(obj).tablesorter(ops).change(function() {
        N.$sorter_update(obj);
    });
};
N.$sorter_update = function(obj) {
    jQuery(obj).trigger("update").trigger("applyWidgets");
    return false;
};

/* Table stripe: Add zebra style to table */
N.tablestripe = function(obj) {
    var table = jQuery(obj);
    var tbody = table.children('tbody');
    tbody.children('tr:even').addClass('even');
    tbody.children('tr:odd').addClass('odd');
    table.change(function() {
        N.$stripe_update(table);
    });
};
N.$stripe_update = function(table) {
    var tbody = table.children('tbody');
    tbody.children('tr:even').addClass('even');
    tbody.children('tr:odd').addClass('odd');
};


/*** BUTTON ***/
// fix button style for msie 10, 11
N.$add_classbutton_ie = function(button) {
    // msie 10
    if ($.browser.msie && $.browser.version == 10) {
        button.addClass("ie");
    }
    // msie 11
    else if($.browser.mozilla && $.browser.version == 11) {
        button.addClass("ie");
    }
}


/*** GET CHILD ELEMENT INFO ***/

/*
* 'triggerID' is the id of element that trigger the event, in this case
* it specify the id of a formbuilder submit or save button.
* It's neccessary to passing button id to queue_event to be able to
* check preload of the event and disable mouse and keyboard actions while the event running
*/
N.$form_builder_get_child_element_info =  function(triggerID, dialogsObj, postbackInfo){

    // find all element in root ( depth = 1)
    var searchEles = $(dialogsObj).children();
    var results = [];
    for(var i = 0; i < searchEles.length; i++) {
        var panel = $(searchEles[i]).find(".form_builder_element_panel_child");
        var description = $(searchEles[i]).find(".form_builder_description").text();
        // init info to push server
        if(panel.length) {
            var info = {
                id: searchEles[i].id,
                height: $(searchEles[i]).height(),
                width: $(searchEles[i]).width(),
                tag: searchEles[i].tagName,
                description: description,
                element_tag: searchEles[i].$element_tag
            };
            results.push(info);
        }

    }
    // push server
    Nitrogen.$queue_event(triggerID, postbackInfo,  "get_child_element_info=" + JSON.stringify(results));

}


/*** DRAG AND DROP ***/

N.$form_builder_draggable = function (dragObj, dragOptions, dragTag, placeHolderSize) {
    dragObj.$drag_tag = dragTag;
    dragObj.$disable_draggable = dragOptions.disable_draggable ;
    dragOptions.appendTo = 'body';
    dragOptions.helper =  function() {
        //debugger;
        return "<div class=\"ui-state-highlight-form-builder-draggable\" style=\"width: " +  placeHolderSize.width + "px; height: " + placeHolderSize.height + "px; \" ></div>";
    };
    dragOptions.revert =  "invalid";
    dragOptions.zIndex = 99999;

    jQuery(dragObj).draggable(dragOptions);
}


N.$form_builder_sortable_placeholder = function(sortBlock, sortOptions, sortPostbackInfo) {
    var n = Nitrogen.$lookup(Nitrogen.$current_id);
    sortOptions.receive =  function(event, ui){
        if(ui.item[0].$disable_draggable){
            $(ui.item[0]).draggable("disable")
        }
        var dragItem = ui.item[0].$drag_tag;
        $(ui.helper[0]).addClass("clone_form_builder_draggable");
        n.$queue_event(this.id, sortPostbackInfo, "drag_item=" + dragItem);
    };

    sortOptions.update = function (event, ui) {
    };
    // object move between floating windows
    sortOptions.appendTo = 'body';
    jQuery(sortBlock).sortable(sortOptions);
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


/*** INCREMENTAL EVENT ***/
/*
 objでtypeイベントが発生するたびに、
 前回のlastInputと今回のinputを異なり、かつinputの長さがcharLength以上かどうかチェックします。
 charLength以上の場合、前回のsetTimeoutを消去し、新しくfunc(Postback, Action)をsetTimeoutで登録し直すことで
 一定時間(delayの値)の連続したtypeイベントでのfunc(Postback, Action)を無効にします。
*/
N.$incremental_event = function(obj, type, charLength, func, delay) {
    var
    lastFunc = null,
    lastInput = '';

    $(obj).on(type, function() {
        var input = $.trim($(this).val());

        if(lastInput !== input && input.length >= charLength){
            clearTimeout(lastFunc);
            lastFunc = setTimeout(func, delay);
        }
        lastInput = input;
    });
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
