/**
 * jqGrid拡張用の関数群
 *
 * 作成日: 2011/11/24
 * 作成者: Ohta
 *
 * copyright Murakumo, All Rights Reserved.
 **/

/**** WebGridExtモジュール ****/
(function () {
    WebGridExt = {
        /*** PUBLIC ***/
        /** メソッド: 常時行編集可能用 **/
        // 編集モード用関数: 読み込み時に実行する
        onLoad: function(grid) {
            $('.jqgcell_error_message').remove();   // バリデーションメッセージをクリア
            WebGridExt.editRows(grid, grid.jqGrid('getDataIDs'));  // 編集モードに移行
        },

        // 編集モード用関数: グリッドのページを変わる時に実行する
        onPaging: function(pgButton, grid) {
            var curPage = grid.getGridParam('page');
            var lastPage = grid.getGridParam('lastpage');

            // if first page and user click first or prev
            if(curPage==1 && (pgButton==pagerButton(grid, 'first') || pgButton==pagerButton(grid, 'prev'))) {
                return;
            }
            // if last page and user click last or next
            if(curPage==lastPage && (pgButton==pagerButton(grid, 'last') || pgButton==pagerButton(grid, 'next'))) {
                return;
            }
            WebGridExt.beforeRedraw(grid);
        },

        // 編集モード用関数: グリッドの再描画処理を始める前に実行する
        beforeRedraw: function(grid) {
            // 不正な入力行がないかどうかを確認する
            if(validateAllRowsAndConfirm(grid)==false)
                return 'stop';
            return '';
        },

        // 編集モード用関数: 行データ取得前に実行する
        beforeGetRows: function(grid, ids) {
            // 取得対象行のデータが正しいかどうかを確認する。
            // 正しくない場合は、バリデーションメッセージを表示し、処理が中断される。
            if(validateRowsWithNoConfirm(grid, ids, true)==false)
                throw 'no error throw';  // NOTE: 大域脱出用の仕組みとして例外を利用(望ましくはない)
        },

        // 編集モードを再度有効にする
        // ※ 行追加時等に使用 (差分行のみを編集モードにする)
        reEnableAlwaysEditMode: function(grid) {
            if(isAlwaysEditMode(grid))
                WebGridExt.editRows(grid, grid.jqGrid('getDataIDs'));
        },

        /** メソッド: 複雑なセル作成補助用 **/
        // 複合セル用のテンプレートオプションを返す
        getCustomCellTemplate: function() {
            return {
                edittype: 'custom',
                editoptions: {
                    custom_element: compoundElem,
                    custom_value: compoundValue
                },
                formatter: compoundFormatter,
                unformat: compoundUnformatter
            };
        },

        // 複合セル用のバリデータ(ルール)を生成する
        genCustomCellValidator: function(options) {
            return function(value, colname) {
                for(var key in options) {
                    if(key in value) {
                        var ret = validateCell(key, value[key], options[key]);
                        if(ret[0]==false) {
                            return ret;
                        }
                    }
                }
                return [true, ""];
            };
        },

        /** メソッド: 行の取得、更新、追加、削除系 **/
        // changeイベントが発生したセル(要素)を引数にとり、そのセルを含む行全体のデータを取得する
        getRowDataOnChange: function (elem, otherGrids) {
            var grid = $(elem).closest('table.ui-jqgrid-btable');
            var rowid = $(elem).closest('tr').attr('id');
            var colid = elem.id.substr(rowid.length+1);

            WebGridExt.beforeGetRows(grid, [rowid]);
            var row = grid.jqGrid('getLocalRow', rowid);
            row[colid] = elem.value;

            // 他のグリッドの全行データを設定されてない場合、選択行だけを返す
            if((otherGrids == undefined)||(otherGrids == null)||(otherGrids == []))
                return {ids:[rowid], rows:[row]};
            // 他のグリッドの全行データを設定されてる場合、選択行とそのグリッドの全行データを返す
            else {
                // 他のグリッドのデータを持つアレーを初期化
                var otherGridsData = new Array();

                // 他のグリッドを一つずつデータを取得する
                for (var i=0;i<otherGrids.length;i++) {
                    otherGridsData[i] = {};

                    // グリッドIDをセットする
                    otherGridsData[i]["grid"] = otherGrids[i];

                    // グリッドの全行データを画面から取得し、返却オブジェクトにセットする
                    otherGridsData[i]["data"] = JqGridUtils.getData($(obj(otherGrids[i])), 'rows');
                }
                return {ids:[rowid], rows:[row], other_grids:otherGridsData};
            }
        },

        // サブグリッド使用時に、展開中の(親)行データを取得するための関数
        // ※ grid_utils.jsのget_expanding_row関数を上書きするための関数
        getExpandingRow: function(subgrid_id, rowid) {
            var grid_id = subgrid_id.replace(/_[^_]*$/, '');
            var grid = $(obj(grid_id));

            WebGridExt.beforeGetRows(grid, [rowid]);
            var row = grid.jqGrid('getRowData', rowid);
            row._subgrid_id = subgrid_id;
            return row;
        },

        // グリッドの行データ取得用の関数
        // ※ grid_utils.jsのgrid_get_data関数を上書きするための関数でもある
        getData: function(grid, type, nocheck) {
            // 必要であれば、データ取得前に対象行のバリデーションを行う
            if(!(nocheck===true)) {
                var ids;
                if(type=='selected_rows')
                    ids = getSelectedRow(grid, true);
                else
                    ids = grid.jqGrid('getDataIDs');

                WebGridExt.beforeGetRows(grid, ids);
            }

            // 行データ取得
            if(type=='rows')
                return {ids: getAllLocalRowId(grid), rows: getAllRows(grid)};
            else if(type=='selected_rows')
                return {ids: getSelectedRow(grid, true), rows: getSelectedRow(grid, false)};

            throw "ERROR: Passed type('"+type+"') is undefined!";
        },

        // 条件に一致した行のデータを更新する
        // XXX: 現状'setRowData'の制約上、非表示列のデータは更新されない
        updateRowsByFieldMatch: function(grid, condFields, rowdata) {
            var table = WebGridExt.getData(grid, 'rows');
            var ids = table['ids'];
            var rows = table['rows'];

            for(var i=0; i < ids.length; i++) {
                var row = rows[i];
                var isMatch = true;
                for(var key in condFields) {
                    if(condFields[key] != row[key]) {
                        isMatch=false;
                        break;
                    }
                }

                if(isMatch)
                    grid.jqGrid('setRowData', ids[i], rowdata);
            }
        },

        // グループの末尾への行追加する
        addRowToGroupTail: function(grid, groupField, group, rowid, rowdata) {
            var table = WebGridExt.getData(grid, 'rows', true);
            var ids = table['ids'];
            var rows = table['rows'];
            var lastrowid = undefined;

            for(var i=0; i < ids.length; i++) {
                var row = rows[i];
                if(group == row[groupField]) {
                    lastrowid = ids[i];
                }
            }

            // グループ末尾に追加
            if(lastrowid)
                grid.jqGrid('addRowData', rowid, rowdata, 'after', lastrowid);
        },

        // 条件に一致する行を削除する
        deleteMatchedRows: function(grid, condFields) {
            var table = WebGridExt.getData(grid, 'rows');
            var ids = table['ids'];
            var rows = table['rows'];

            for(var i=0; i < ids.length; i++) {
                var row = rows[i];
                var is_match = true;
                for(var key in condFields) {
                    if(condFields[key] != row[key]) {
                        is_match=false;
                        break;
                    }
                }

                if(is_match) {
                    grid.jqGrid('delLocalRow', row._id_);
                }
            }
        },

        /** メソッド: 複数選択モードの際の行選択保持機能用(ページング ＆ ソート時) ***/
        // 保持されている行選択をクリアする
        clearSelection: function(grid) {
            setSelection(grid, {});
        },

        // ページングやソートの際に、以前の行選択状態を復元する
        // ※ multiselectオプションがtrueの場合のみ有効
        restoreSelection: function(grid) {
            if(isMultiselectEnabled(grid) === false)
                return;

            var sels = getSelection(grid);

            var ids = grid.jqGrid('getDataIDs');
            for(var i in ids)
                if(sels[ids[i]])
                    grid.setSelection(ids[i], false);
        },

        // ページングやソートの前に、行選択状態を保存する
        // ※ multiselectオプションがtrueの場合のみ有効
        saveSelection: function(grid) {
            if(isMultiselectEnabled(grid) === false)
                return;

            var sels = getSelection(grid);

            // 表示行の選択を一旦全解除する
            var ids = grid.jqGrid('getDataIDs');
            for(var i in ids)
                delete sels[ids[i]];

            // 選択されているもののみを改めて登録する
            var selectedIds = grid.getGridParam('selarrrow');
            for(var i in selectedIds)
                sels[selectedIds[i]] = true;

            setSelection(grid, sels);
        },

        // 選択状態の維持データから該当行を抜ける
        delSelection: function(grid, rowid) {
            if(isMultiselectEnabled(grid) === false)
                return;

            // 現在維持される選択状態を取得する
            var sels = getSelection(grid);

            // 選択状態の維持データから該当行を抜ける
            delete sels[rowid];

            // 選択状態の維持データから該当行を抜けた後選択状態を保存する
            setSelection(grid, sels);
        },

        /** メソッド: その他、ユーティリティメソッド **/
        // グリッドのバリデーションを任意のタイミングで実行するための関数
        doValidate: function(grid) {
            var ids = grid.jqGrid('getDataIDs');
            if(validateRowsWithNoConfirm(grid, ids, true)==false)
                throw 'no error throw';  // NOTE: 大域脱出用の仕組みとして例外を利用(望ましくはない)
        },

        // 引数で指定された行(複数)を編集モードにする
        editRows: function(grid, ids, changeFocus) {
            // NOTE: 最終的に先頭行にフォーカスが当たるように逆順で走査する
            for(var i=ids.length-1; i >= 0; i--)
                grid.jqGrid('editRow', ids[i], false, undefined, undefined, 'clientArray',
                            undefined, undefined, undefined, undefined, changeFocus);

            // 入力要素disableオプションを処理する
            handleDisableOptions(grid, ids);

            // 初期表示時は左端にスクロールをあてる
            $("#gview_"+grid.attr('id')+" > div.ui-jqgrid-bdiv").scrollLeft(0);
        },

        /** メソッド: 常時行編集可能用 **/
        // 行が編集モードになっているかを判定する
        isEditmode: function (grid, rowid) {
            return $("tr#"+rowid, grid).attr("editable")=="1";
        }
    }

    /*** PRIVATE ***/
    // ページナビゲーターボタンの表示文字列を作成する
    var pagerButton = function(grid, pos) {
        return pos + "_" + grid.attr('id') + "__pager";
    };

    // グリッドが編集モードになっているかを判定する
    var isAlwaysEditMode = function (grid) {
        var ids = grid.jqGrid('getDataIDs');
        if(ids.length == 0 || ids.length == 1)
            return true;
        for (var i in ids)
            if(WebGridExt.isEditmode(grid, ids[i]))
                return true;
        return false;
    };

    // editRowsの補助関数:
    // 一部のカラムやセルの入力要素をdisableにするオプションが指定されている場合、それを処理する
    var handleDisableOptions = function (grid, ids) {
        // 特定のカラムの特定セルの入力要素だけdisableにするための処理
        var flags = grid.jqGrid('getGridParam', 'editDisableFlag');
        if(flags && isEmptyObject(flags) == false) {
            for(var i = 0; i < ids.length; i++) {
                var id = ids[i];
                var row = grid.jqGrid('getLocalRow', id);

                for(var flag_col in flags) {
                    if(row[flag_col] === true || row[flag_col] === "true") {
                        var target_col = flags[flag_col];
                        var elemid = id+"_"+target_col;
                        $('#'+elemid).attr('disabled', 'disabled');
                    }
                }
            }
        }

        // 特定のカラムの入力要素だけdisableにするための処理
        var disables = grid.jqGrid('getGridParam', 'editDisable');
        if(disables && disables.length > 0) {
            for(var i = 0; i < ids.length; i++) {
                var id = ids[i];
                for(var j = 0; j < disables.length; j++) {
                    var col = disables[j];
                    var elemid = id+"_"+col;
                    $('#'+elemid).attr('disabled', 'disabled');
                }
            }
        }
    };

    // 引数で指定された行(複数)の入力チェックを行う
    var validateRows = function(grid, ids, restoreAnyway, changeFocus) {
        var invalidRows = new Array;
        var validRows = new Array;
        var date = new Date();

        for (var i in ids) {
            if(WebGridExt.isEditmode(grid, ids[i]) == false)
                continue;

            if(grid.jqGrid('saveRow', ids[i], undefined, 'clientArray') == false) {
                invalidRows.push(ids[i]);
            } else {
                validRows.push(ids[i]);
            }
        }

        if(restoreAnyway || invalidRows.length > 0) {
            var ids = [];
            for(var i in validRows) {
                var id = validRows[i];
                ids.push(id);
            }
            WebGridExt.editRows(grid, ids, changeFocus);
        }

        return invalidRows.length==0;
    };

    // 全行のバリデーション、および不正行検出時の確認ダイアログの表示を行う
    var validateAllRowsAndConfirm = function(grid) {
        return validateRowsAndConfirm(grid, grid.jqGrid('getDataIDs'));
    };

    // 指定行のバリデーション、および不正行検出時の確認ダイアログの表示を行う
    var validateRowsAndConfirm = function(grid, ids, restoreAnyway) {
        if(validateRows(grid, ids, restoreAnyway))
            return true;
        return window.confirm(WebMessage.GRID.CONFIRM.CONTINUE);
    };

    // 指定行のバリデーションを行う
    var validateRowsWithNoConfirm = function(grid, ids, restoreAnyway) {
        if(validateRows(grid, ids, restoreAnyway, false))
            return true;
        return false;
    };

    /** メソッド: 複雑なセル作成用 **/
    // 複合セル内の要素(テンプレート)からキー名を取得する関数
    // キー名はelement.classNameの中に'k_XXX'形式でエンコードされている (XXX部分がキー名)
    var getTemplateElementKey = function (element) {
        if(element.className.match(/(^| )k_([^ ]+)($| )/))
            return RegExp.$2;
        return false;
    };

    // 複合セル用のフォーマッタ
    var compoundFormatter = function (cellvalue, options, rowObject) {
        if(options['colModel']['editable']==true)
            return $.escapeHTML(JSON.stringify(cellvalue));
        return embodyTemplate(options['colModel']['formatoptions']['template'], cellvalue).innerHTML;
    };

    // 複合セル用のアンフォーマッタ
    var compoundUnformatter = function (cellvalue, options, cell) {
        if(options['colModel']['editable']==true)
            return JSON.parse(cellvalue);
        return collectKeyValue(cellvalue);
    };

    // 複合セル用の入力要素生成関数
    var compoundElem = function(value, options) {
        var html = embodyTemplate(options['template'], value);

        var onEdit = options['onEdit'];
        if(onEdit)
            onEdit(html, value, options);

        return html;
    };

    // 複合セル用の入力値取得関数
    var compoundValue = function(elem, operation, value) {
        if(operation != 'get')
            throw("Error: operation '"+operation+"' isn't supported!");
        return collectKeyValue(elem);
    };

    // 複合セルからキーと値のペアを取得する
    var collectKeyValue = function(el) {
        var kvs = {};
        $("._template", el).each(function () {
            key = getTemplateElementKey(this);
            if(this.value) {
                kvs[key] = this.value.replace(/^\s*(.*?)\s*$/, "$1");
            } else {
                kvs[key] = this.innerHTML.replace(/^\s*(.*?)\s*$/, "$1");
            }
        });
        return kvs;
    };

    // 複合セル用のテンプレート(HTML)とキー・バリューのペア(オブジェクト)を受け取り、
    // 実際の複合セルを生成する。
    // (テンプレート名で、キーに一致する要素が対応する値で置換される)
    var embodyTemplate = function(template, kvs) {
        var root = document.createElement("div");
        root.innerHTML = "<div>"+template+"</div>";

        $('._template', root).each(function() {
            this.id=''; // XXX: IDの重複を避けるための応急処置

            if(! this.className)
                return;

            var tag = this.tagName;
            var key = getTemplateElementKey(this);
            if(tag=="SPAN") {
                this.innerHTML = kvs[key];
            } else if(tag=="INPUT") {
                this.setAttribute('value', kvs[key]);
            }
        });
        return root;
    };

    /** メソッド: 複合セルバリデーション関数 **/
    // 複合セルのバリデーションを行う
    var validateCell = function (key, value, options) {
        var map = {
            'required': {
                fn: validateRequired,
                msg: WebMessage.GRID.RULE.INVALID_REQUIRED
            },
            'integer': {
                fn: validateInteger,
                msg: WebMessage.GRID.RULE.INVALID_INTEGER
            },
            'date': {
                fn: validateDate,
                msg: WebMessage.GRID.RULE.INVALID_DATE
            }
        };

        for(var i in options) {
            var vtype = options[i];
            if(map[vtype].fn(value)==false)
                return [false, map[vtype].msg];
        }

        return [true, ""];
    };

    // 必須バリデーション
    var validateRequired = function(value) {
        return value.length > 0;
    };

    // 整数バリデーション
    var validateInteger = function(value) {
        return value.match(/^[0-9]*$/) != null;
    };

    // 日付バリデーション
    var validateDate = function(value) {
        if(!value.match(/^0*(\d+)\/0*(\d+)\/0*(\d+)$/))
            return false;

        var ds = value.split("/");
        if(ds.length != 3)
            return false;

        var h = parseInt(RegExp.$1);
        var m = parseInt(RegExp.$2)-1;
        var d = parseInt(RegExp.$3);
        var dd = new Date(h,m,d);
        return dd.getFullYear()==h && dd.getMonth()==m && dd.getDate()==d;
    };

    /** メソッド: 行取得関連 **/
    // 選択されている行データ(or 行ID)を取得する
    var getSelectedRow = function(grid, onlyKey) {
        var rows = [];
        if(isMultiselectEnabled(grid)===false) {
            // 複数選択モードではない場合: 普通に選択行を取得する
            rows = grid.jqGrid('getGridParam', 'selarrrow');

            if(rows.length==0) {
                var row = grid.jqGrid('getGridParam', 'selrow');
                if(row!=null)
                    rows = [row];
            }
        } else {
            // 複数選択モードの場合: 本モジュールが独自に管理している(非表示部分も含めた)選択行を取得する
            WebGridExt.saveSelection(grid);
            for(var rowid in getSelection(grid))
                rows.push(rowid);
        }

        if(onlyKey==true) {
            return rows;
        } else {
            var ary = new Array();
            for(var i in rows) {
                ary.push(normalizeLocalRow(grid.jqGrid('getLocalRow', rows[i])));
            }
            return ary;
        }
    };

    // 表示・非表示を含む、全ての行のIDを取得する
    var getAllLocalRowId = function(grid) {
        return jQuery.map(getAllRows(grid), function (row) {
            return row['_id_'];
        });
    };

    // 表示・非表示を含む、全ての行のデータを取得する
    var getAllRows = function (grid) {
        return grid.jqGrid('getGridParam', 'data');
    };

    // jqGridのgetLocalRowメソッドが返すデータの形式を、
    // getRowDataメソッドが返す形式に合わせるための関数
    var normalizeLocalRow = function(row) {
        var nrow = {};
        for(var i in row) {
            if(typeof(row[i]) == 'object')
                nrow[i] = row[i];
            else if(typeof(row[i]) == 'string')
                nrow[i] = row[i];
            else if(row[i] === null || row[i] === undefined)
                nrow[i] = "";
            else
                nrow[i] = JSON.stringify(row[i]);

        }
        return nrow;
    };

    /** メソッド: 複数選択モードの際の行選択保持機能用(ページング ＆ ソート時) ***/
    // (非表示行も含めて)選択されている行の集合({RowId: true}のマップ)を取得する
    // ※ multiselectオプションがtrueの場合のみ、空以外が返ることを想定
    var getSelection = function(grid) {
        var sels = grid.data('ext_selections');
        return sels ? sels : {};
    };

    // 選択されている行の集合({RowId: true}のマップ)を保存する
    // ※ multiselectオプションがtrueの場合のみ、空以外が保存されることを想定
    var setSelection = function(grid, selections) {
        grid.data('ext_selections', selections);
    };

    /** メソッド: その他、ユーティリティメソッド **/
    // オブジェクトが空かどうかを判定する
    var isEmptyObject = function(obj) {
        for(var x in obj)
            return false;
        return true;
    };

    var isMultiselectEnabled = function(grid) {
        return grid.getGridParam('multiselect') === true;
    };
})();
