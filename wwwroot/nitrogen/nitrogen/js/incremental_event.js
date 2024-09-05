

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

