/**
 * jqGridのカスタムフォーマッタ/アンフォーマッタ定義用のモジュール
 * ※ 現状、カスタム編集要素やカスタムルール用の関数もこの中で定義されている
 *
 * 作成日: 2012/02/09
 * 作成者: Ohta
 *
 * copyright Murakumo, All Rights Reserved.
 **/

/**** WebGridFormatモジュール ****/
(function () {
    WebGridFormat = {
        /*** PUBLIC ***/
        /** format **/
        format: {
            // 日付(in#datetime()): [[yyyy,mm,dd], [hh,MM,ss]] => 'yyyy/mm/dd'
            date: function (cellvalue, options, rowObject) {
                // 日付(in#datetime()): undefined => ''
                if(cellvalue === undefined) {
                    return "";

                // 日付(in#datetime()): [[yyyy,mm,dd], [hh,MM,ss]] => 'yyyy/mm/dd'
                } else {
                    if(typeof(cellvalue) != 'object') return $.escapeHTML(cellvalue);

                    try{
                        var date = cellvalue[0];
                        var dateStr = date[0] + "/" + pad0(date[1], 2) + "/" + pad0(date[2], 2);

                        var check = new Date( date[0], date[1], date[2]);
                        if(!isNaN(check)) {
                            return $.escapeHTML(dateStr);
                        }else{
                            return $.escapeHTML(cellvalue)
                        }
                    }catch(err) {
                        return $.escapeHTML(cellvalue);
                    }
                }
            },

            // 時間(in#datetime()): [[yyyy,mm,dd], [hh,MM,ss]] => 'hh:MM'
            time: function (cellvalue, options, rowObject) {
                if(cellvalue === undefined) return "";

                if(typeof(cellvalue) != 'object') return $.escapeHTML(cellvalue);

                try{
                    var time = cellvalue[1];
                    var timeStr = pad0(time[0], 2) + ":" + pad0(time[1], 2);

                    var check = new Date(1990, 6, 1, time[0],time[1] );
                    if(!isNaN(check)) {
                        return $.escapeHTML(timeStr);
                    }else{
                        return $.escapeHTML(cellvalue)
                    }
                }catch(err) {
                    return $.escapeHTML(cellvalue);
                }
            },

            // 時間(in#datetime()): [[yyyy,mm,dd], [hh,MM,ss]] => 'hh:MM:ss'
            time1: function (cellvalue, options, rowObject) {
                if(cellvalue === undefined) return "";

                if(typeof(cellvalue) != 'object') return $.escapeHTML(cellvalue);

                try {
                    var time = cellvalue[1];
                    var timeStr = pad0(time[0], 2) + ":" + pad0(time[1], 2) + ":" + pad0(time[2], 2);
                    var check = new Date(1990, 6, 1, time[0],time[1], time[2]);
                    if(!isNaN(check)) {
                        return $.escapeHTML(timeStr);
                    }else{
                        return $.escapeHTML(cellvalue)
                    }
                }catch(err) {
                    return $.escapeHTML(cellvalue);
                }
            },

            // 日時(in#datetime()): [[yyyy,mm,dd], [hh,MM,ss]] => 'yyyy/mm/dd hh:MM'
            datetime: function (cellvalue, options, rowObject) {
                if(cellvalue === undefined) return "";

                if(typeof(cellvalue) != 'object') return $.escapeHTML(cellvalue);

                try {

                    var date = cellvalue[0];
                    var dateStr = date[0] + "/" + pad0(date[1], 2) + "/" + pad0(date[2], 2);

                    var time = cellvalue[1];
                    var timeStr = pad0(time[0], 2) + ":" + pad0(time[1], 2);

                    var check = new Date(date[0], date[1], date[2], time[0],time[1]);
                    if(!isNaN(check)) {
                        return $.escapeHTML(dateStr + " " + timeStr);
                    }else{
                        return $.escapeHTML(cellvalue);
                    }

                }catch(err) {
                    return $.escapeHTML(cellvalue);
                }
            },

            // 日時(in#datetime()): [[yyyy,mm,dd], [hh,MM,ss]] => 'yyyy/mm/dd hh:MM:ss'
            datetime1: function (cellvalue, options, rowObject) {
                if(cellvalue === undefined) return "";

                if(typeof(cellvalue) != 'object') $.escapeHTML(cellvalue);
                try{
                    var date = cellvalue[0];
                    var dateStr = date[0] + "/" + pad0(date[1], 2) + "/" + pad0(date[2], 2);

                    var time = cellvalue[1];
                    var timeStr = pad0(time[0], 2) + ":" + pad0(time[1], 2) + ":" + pad0(time[2], 2);

                    var check = new Date(date[0], date[1], date[2], time[0],time[1], time[2]);

                    if(!isNaN(check)) {
                        return $.escapeHTML(dateStr + " " + timeStr);
                    }else{
                        return $.escapeHTML(cellvalue)
                    }
                }catch(err) {
                    return $.escapeHTML(cellvalue);
                }
            },

            // 通貨(in#mp_real()): [real,point] => 三桁カンマ区切りの整数
            // ※ 小数点以下表示は未対応(ドル等)
            currency: function (cellvalue, options, rowObject) {
                // 通貨(in#mp_real()):: undefined => ''
                if(cellvalue === undefined) {
                    return "";

                // 通貨(in#mp_real()): [real,point] => 三桁カンマ区切りの整数
                } else {
                    if(typeof(cellvalue) != 'object')
                        return $.escapeHTML(addFigure(cellvalue));

                    var real = cellvalue[0];
                    var prec = cellvalue[1];

                    return addFigure(Math.ceil(real / Math.pow(10,prec)).toString());
                }
            },

            // 通貨(in#mp_real()): [real,point] => 三桁カンマ区切りの整数プラスサフィックス
            // ※ 小数点以下表示は未対応(ドル等)
            currency_with_suffix: function (cellvalue, options, rowObject) {
                // 通貨(in#mp_real()):: undefined => ''
                if(cellvalue === undefined)
                    return "";

                // プラスサフィックスを取得する
                var suffix = $.escapeHTML(options.colModel.formatoptions.suffix);

                if(typeof(cellvalue) != 'object')
                    return $.escapeHTML(addFigure(cellvalue)) + suffix;

                // 通貨(in#mp_real()): [real,point] => 三桁カンマ区切りの整数
                var real = cellvalue[0];
                var prec = cellvalue[1];

                return addFigure(Math.ceil(real / Math.pow(10,prec)).toString()) + suffix;
            },

            // 通貨(in#mp_real()): [real,point] => 接頭辞プラス三桁カンマ区切りの整数
            // ※ 小数点以下表示は未対応(ドル等)
            currency_with_prefix: function (cellvalue, options, rowObject) {
                // 通貨(in#mp_real()):: undefined => ''
                if(cellvalue === undefined)
                    return "";

                // プラス接頭辞を取得する
                var prefix = $.escapeHTML(options.colModel.formatoptions.prefix);

                if(typeof(cellvalue) != 'object')
                    return prefix + $.escapeHTML(addFigure(cellvalue));

                // 通貨(in#mp_real()): [real,point] => 三桁カンマ区切りの整数
                var real = cellvalue[0];
                var prec = cellvalue[1];

                return prefix + addFigure(Math.ceil(real / Math.pow(10,prec)).toString());
            },

            // セルの文字列プラスサフィックス
            suffix: function (cellvalue, options, rowObject) {
                var suffix = options.colModel.formatoptions.suffix;
                return $.escapeHTML(addFigure(cellvalue + suffix));
            },

            // 実数(in#mp_real()): [real,point] => 三桁カンマ区切りの小数
            // TODO this function does not work correctly with negative number
            // TODO for example, with input is [-6, 1], it returns -6.-1, that is wrong
            real: function(cellvalue, options, rowObject) {
                if(typeof(cellvalue) != 'object') {
                    var nums = cellvalue.split(".");
                    if(nums.length == 1) {
                        return $.escapeHTML(addFigure(nums[0]));
                    } else {
                        return $.escapeHTML(addFigure(nums[0]) + "." + strrev(addFigure(strrev(nums[1]))));
                    }
                }

                var real = cellvalue[0];
                var prec = cellvalue[1];

                if(prec==0) {
                    return $.escapeHTML(addFigure(real));
                } else {
                    var integerPart = Math.floor(real / Math.pow(10,prec)).toString();
                    var decimalPart = pad0((real % Math.pow(10,prec)).toString(), prec);
                    return addFigure(integerPart) + "." + strrev(addFigure(strrev(decimalPart)));
                }
            },

            // ボタン(in#colModel.formatoptions.{value,onclick}):
            button: function(cellvalue, options, rowObject) {
                var value = $.escapeHTML(options.colModel.formatoptions.value).replace(/'/g, "&#39;");
                var onclick = options.colModel.formatoptions.onclick;

                var html = "<input type='button' class='button', value='" + value + "' onclick=\""+onclick+"; return;\"/>";

                return html;
            },

            // テキストエリア(in#string()):
            textarea: function(cellvalue, options, rowObject) {
                var $textarea = $("<div style='width:99%'><textarea readonly='true' style='padding-right:10px; width:95%; background-color:lightgray' /></div>");
                cellvalue = $.escapeHTML(cellvalue);
                $("textarea", $textarea).append(cellvalue);
                return $textarea.html();
            },

            checkbox: function(cellvalue, options, rowObject) {
                var checkbox = "<input type='checkbox' ";

                if(cellvalue == true)
                    checkbox += "checked ";
                else
                    checkbox += "unchecked ";

                // OnChangeイベントが定義されたら、セットする
                if(options.colModel.formatoptions != undefined)
                    if(options.colModel.formatoptions.onchange != undefined)
                        checkbox += "onchange=\"" + options.colModel.formatoptions.onchange + "\"";

                checkbox += " />";

                return checkbox;
            },

            // htmlエスケープ
            htmlEscape: function(cellvalue, options, rowObject) {
                return $.escapeHTML(cellvalue);
            },

            // 整数値は3桁区切り、小数部はそのままにするフォーマット（カンマとドットを区別するために.の後ろに半角スペースを入れている）
            // 例)123456789.123456789 → 123,456,789. 123456789
            decimal: function(cellvalue, options, rowObject) {
                if(cellvalue === undefined) return "";
                if(typeof(cellvalue) != 'object') {
                    // 小数部と整数部をわける
                    var nums = cellvalue.split(".");
                    var seisu = integer(String(nums[0]));

                    // check seisu is -xxx.xxx
                    var kigou = "";
                    if(seisu.slice(0,1)=="-" && nums.length > 1)
                    {
                        kigou="-";
                        seisu = seisu.slice(1);
                    };
                    // check seisu is +xxx or +xxx.xxx
                    if(seisu.slice(0,1)=="+"){
                        seisu = seisu.slice(1);
                    };

                    // make result
                    if(nums.length == 1) {
                        return kigou + $.escapeHTML(addFigure(seisu));
                    } else {
                        var syousu= reverse(String( integer(reverse(nums[1])) ));
                        if(syousu=="0") kigou="";

                        // 小数部がすべて0なら1つにする
                        if(!syousu.match(/[^0]+/)){
                            return kigou + $.escapeHTML(addFigure(seisu)) + ". 0";
                        } else{
                            return kigou + $.escapeHTML(addFigure(seisu) + ". " + syousu);
                        }
                    };
                } else {
                    return $.escapeHTML(cellvalue);
                }
            },

            // ラジオボタン(in#colModel.editoptions.group, boolean()):
            radio: function(cellvalue, options, rowObject) {
                var radioHtml = "<input type='radio' name='" +
                    $.escapeHTML(options.colModel.formatoptions.group) + "' ";

                // OnChangeイベントが定義されたら、セットする
                var onchange = options.colModel.formatoptions.onchange;
                if(onchange)
                    radioHtml += "onchange=\"" + onchange + "\"";

                var onclick = options.colModel.formatoptions.onclick;
                if(onclick)
                    radioHtml += "onclick=\"" + onclick + "\"";

                if(cellvalue)
                    radioHtml += "checked='checked'";

                radioHtml += " />";

                return radioHtml;
            }
        },

        /** unformat **/
        unformat: {
            // 通貨: カンマを取り除く
            currency: function (cellvalue, options, cell) {
                return cellvalue.replace(/,/g, "");
            },

            // 実数: カンマを取り除く
            real: function (cellvalue, options, cell) {
                return cellvalue.replace(/,/g,'');
            },

            // ラジオボタン: チェック有無を取り出す
            radio: function (cellvalue, options, cell) {
                return $('input', cell).is(':checked');
            }
        },

        /** custom edit: start (create input element) **/
        editStart: {
            // タイムピッカー: colModel.editoptions.extoptsでカスタマイズ可能
            timepicker: function (value, options) {
                var el = document.createElement('input');
                el.type = 'text';
                el.value = value;

                setTimeout(function() {
                    $('#'+options.id).timepicker(options.extopts);
                },
                250);

                return el;
            },

            // ラジオボタン
            radio: function (value, options) {
                var el = document.createElement('input');
                el.type = 'radio';
                el.name = options.group;
                el.value = "on";
                el.checked = value;
                return el;
            }
        },

        /** custom edit: end (retrieve value from input element) **/
        editEnd: {
            // タイムピッカー
            timepicker: function (elem, operation, value) {
                if(operation != 'get')
                    throw("Unsupported operation '"+operation+"'");
                return $(elem).val();
            },

            // ラジオボタン: 選択有無を取得する
            radio: function (elem, operation, value) {
                if(operation != 'get')
                    throw("Unsupported operation '"+operation+"'");
                return $(elem).is(':checked');
            }
        },

        /** custom rule **/
        rule: {
            // 時間: 'hh:MM'形式
            time: function (value, colname) {
                if(value.length == 0)
                    return [true, ""];

                if(value.match(/^([0-1]?[0-9]|2[0-3]):([0-5]?[0-9])$/))
                    return [true, ""];

                return [false, WebMessage.GRID.RULE.INVALID_TIME];
            },

            // 電話番号: ハイフンの有無の両方の形式を許容する
            telLoose: function (value, colname) {
                if(value.length === 0)
                    return [true, ""];

                if(value.match(/^([0-9]{2,4}-[0-9]{2,4}-[0-9]{4}|[0-9]{10,11})$/))
                    return [true, ""];

                return [false, WebMessage.GRID.RULE.INVALID_TEL];
            },

            // 長さチェック用のルール関数を生成する
            makeLength: function (length) {
                return function (value, colname) {
                    if(value.length == 0 || value.length == length)
                        return [true, ""];

                    return [false, WebMessage.GRID.RULE.INVALID_LENGTH.replace('%1', length)];
                }
            }
        }
    };

    /*** PRIVATE ***/
    // objの文字列表現がn文字に満たない場合は、左側をchでパディングする
    var strpad = function (obj, n, ch) {
        var s = obj.toString();
        for(var i=s.length; i < n; i++) {
            s = ch + s;
        }
        return s;
    }

    // objの文字列表現がn文字に満たない場合は、左側を'0'でパディングする
    var pad0 = function (obj, n) {
        return strpad(obj, n, '0');
    }

    // 数字文字列を三桁ごとにカンマで区切る
    var addFigure = function (str) {
        var num = new String(str).replace(/,/g, "");
        while(num != (num = num.replace(/^(-?\d+)(\d{3})/, "$1,$2")));
        return num;
    }

    // 文字列を反転する
    var strrev = function(s) {
        var rv = "";
        for (var i = 0, n = s.length; i < n; i++)
            rv += s[n - i - 1];
        return rv;
    }
})();

/*HTMLエスケープ*/
(function($){
    $.escapeHTML = function(val) {
        if(val == "" || val == undefined) return "";
        return $("<pre/>").text(val).html();
    };
})(jQuery);

function reverse(str)
{
    var res="";
    for(var i=0;i<str.length;i++)
    {
       var c=str.charAt(i);
       res=c+res;
    }
    return res;
}

// convert string -> integer
function integer(str){
    var check = false;
    var  res="";
    for(var i=0;i<str.length;i++)
    {
       var c=str.charAt(i);
       if(c != "0" && c != "-" && c != "+")check= true;
       if(c == "0" && check == false)res;
       else res=res+c;
    }
    if(res=="")return "0";
    else if(res=="-")return "-0";
    else if(res=="+")return "+0";
    else return res;
}
