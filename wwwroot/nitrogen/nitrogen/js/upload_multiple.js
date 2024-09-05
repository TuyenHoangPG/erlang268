

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
