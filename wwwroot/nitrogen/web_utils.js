/**
 * JavaScriptのユーティリティ関数をまとめたモジュール
 *
 * 作成日: 2012/02/09
 * 作成者: Ohta
 *
 * copyright Murakumo, All Rights Reserved.
 **/

/**** WebUtilsモジュール ****/
(function () {
    WebUtils = {
        /*** PUBLIC ***/
        // srcElem要素の入力文字数がn文字になった場合に、
        // destElemに自動でフォーカスを移すイベントを設定する
        focusIfInputLengthIsN: function(destElem, srcElem, n) {
            var $input = $(srcElem);
            var $dest = $(destElem);
            $input.keyup(function (e) {
                var ignores = {9:true, 16:true}; // TAB(9) & DLE(16)

                if(ignores[e.keyCode] != true && $input.val().length == n) {
                    $dest.focus();
                }
            })
        },

        // 文字列内の全角数字を半角数字に変換する
        digitZenToHan: function(str) {
            var map = {
                "０":"0", "１":"1", "２":"2",
                "３":"3", "４":"4", "５":"5",
                "６":"6", "７":"7", "８":"8",
                "９":"9"
            };
            return convertByMapping(str, map);
        },

        // 文字列内の全角数字とピリオド(ドット)を半角に変換する
        digitDotZenToHan: function(str) {
            return convertByMapping(WebUtils.digitZenToHan(str), {"．":"."});
        },

        // 文字列内の全角数字とハイフン系文字を半角に変換する
        digitHyphenZenToHan: function(str) {
            return convertByMapping(WebUtils.digitZenToHan(str),
                                    {"ー":"-",
                                     "－":"-",
                                     "─":"-"});
        },

        // elem:select関数で作成された選択系要素の選択項目を初期値(一番最初の項目)に戻す
        clearSelection: function(elem) {
            switch(elem.tagName) {
            case 'SELECT':
                clearPulldownSelection(elem);
                break;

            case 'DIV':
                if($(':first-child', elem).get(0).className.match('.*select_radio.*')) {
                    clearRadioSelection(elem);
                } else {
                    clearCheckSelection(elem);
                }
                break;
            default:
                throw('Unexpected Element Passed');
            }
        },

        // classNameにマッチする要素群の値を更新する
        // N番目にマッチした要素の値には values[N%values.length] が使用される
        updateValuesByClass: function (className, values) {
            var i = 0;
            $('.'+className).each(function () {
                var val = values[i % values.length];
                this.value = val;
                i++;
            });
        },

        // 'yyyy/mm/dd'形式の日付文字列を整数値に変換する
        dateStrToInt: function (dateStr) {
            var rlt = dateStr.match(/^([0-9]{1,4})[/]([0-9]{1,2})[/]([0-9]{1,2})$/);
            if(!rlt)
                return false;
            return new Date(parseInt(rlt[1], 10), parseInt(rlt[2], 10), parseInt(rlt[3], 10)).getTime();
        },

        // 日付系の入力チェック用の関数を生成して返す
        // 日付チェックの場合は '2001/02/29' のような閏年で存在しないような日付もチェックする
        makeDateFormatCheckFn: function (type) {
            var checkdate = function (match_rlt) {
                if(!match_rlt)
                    return false;

                var year = parseInt(match_rlt[1], 10);
                var month = parseInt(match_rlt[2], 10) - 1;
                var day = parseInt(match_rlt[3], 10);
                var date = new Date(year, month, day);
                return date.getFullYear()===year && date.getMonth()===month && date.getDate() === day;
            };

            return function(value, args) {
                switch(type) {
                case 'date':
                    // yyyy/mm/dd
                    return checkdate(value.match(/^([0-9]{1,4})[/]([0-9]{1,2})[/]([0-9]{1,2})$/));

                case 'time':
                    // hh:MM
                    return value.match(/^(2[0-3]|[0-1]?[0-9]):[0-5]?[0-9]$/);

                case 'datetime':
                    // yyyy/mm/dd hh:MM
                    return checkdate(value.match(/^([0-9]{1,4})[/]([0-9]{1,2})[/]([0-9]{1,2}) (2[0-3]|[0-1]?[0-9]):[0-5]?[0-9]$/));
                default:
                    throw('Unexpected type passed');
                }
            }
         },

         // 日付文字列のバリデート関数
         isValidDateFormat: function (dateStr) { return WebUtils.makeDateFormatCheckFn('date')(dateStr); },

         // 選択したのアップロードファイルのサイズを取得し、hidden要素の値にセットする
         setFileSizeToHidden: function (uploadElem, hiddenElem) {
             var $file = $(uploadElem)[0].files[0];
             if ($file === undefined || $file === null) $(hiddenElem).val("");
             else $(hiddenElem).val($file.size);
         }
    };

    /*** PRIVATE ***/
    // マッピング表に従って、入力文字列内の文字を置換する
    var convertByMapping = function(str, map) {
        var newStr = "";
        for(var i=0; i < str.length; i++) {
            newStr += map[str[i]] ? map[str[i]] : str[i];
        }
        return newStr;
    }

    // WebUtils.clearSelectionの補助関数: プルダウンリストの選択を初期化する
    var clearPulldownSelection = function (elem) {
        $(elem).val($(':first-child', elem).val());
    }

    // WebUtils.clearSelectionの補助関数: ラジオボタングループの選択を初期化する
    var clearRadioSelection = function (elem) {
        var first_value = $('input', $(':first-child', elem)).val();
        $('input', elem).val([first_value]);
    }

    // WebUtils.clearSelectionの補助関数: チェックボックスグループの選択を初期化する
    var clearCheckSelection = function (elem) {
        $('input', elem).val([]);
    }
})();


var SCRM = {
    download: function(path)
    {
        $("#__download_frame").remove();
        var iframe = $("<iframe id='__download_frame' class='not_display'></iframe>").attr("src",path);
        $('body').append(iframe);
    },
    enable_elem_wait_loading:function()
    {
        if($(".ui-jqgrid .loading:visible,.loading_panel:visible").size()>0)
        {
            setTimeout(function(){SCRM.enable_elem_wait_loading();},100);
        }
        else
        {
            N._enable_elems();
        }
    },
    dialog:function()
    {
        setTimeout(function (){$(document).unbind('mousedown.dialog-overlay').unbind('mouseup.dialog-overlay');},100);
    },
    integer_rang_validate: function(v1, v2)
    {
        if( SCRM.empty_or_undefind(v1) || SCRM.empty_or_undefind(v2) )
        {
            // 片方、もしくは両方値なしならtrue
            return true;
        }
        if( !v1.match(/[^0-9]+/) && !v2.match(/[^0-9]+/) )
        {
            // 比較
            return Number(v1) <= Number(v2);
        }
        else
        {
            // 数値じゃなければfalse(他のvalidateで数値判定する)
            return true;
        }
    },
    empty_or_undefind : function(v)
    {
        return v=="" || v == undefined;
    }
};


