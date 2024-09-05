

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
