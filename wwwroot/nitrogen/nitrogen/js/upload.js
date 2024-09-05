

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
