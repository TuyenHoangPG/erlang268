/**
 * jqGrid用のユーティリティ関数群を集めたモジュール
 */
(function () {
    JqGridUtils = {
        /*** PUBLIC ***/
        setRows: function(grid, rowid, data) {
            // 該当行は編集モードかどうか
            var isEditmode = WebGridExt.isEditmode(grid, rowid);

            //  該当行は編集モードの場合
            if(isEditmode) {
                // 行を編集後の状態を維持して、ビューモードに変更します
                grid.saveRow(rowid);

                // 行のデータをセットします
                // URL: http://www.trirand.com/jqgridwiki/doku.php?id=wiki:methods
                // Do not use this method when you are editing the row or cell.
                // This will set the content and overwrite the input elements.
                grid.jqGrid('setRowData', rowid, data);

                // 該当行を編集モードに戻します
                WebGridExt.editRows(grid, [rowid]);
            }
            //  該当行はビューモードの場合
            else {
                // 行のデータをセットします
                grid.jqGrid('setRowData', rowid, data);
            }

        },

        // 行をグリッドに削除する
        delRows: function(grid, rowid) {
            // 行をグリッドに削除する
            grid.jqGrid('delLocalRow', rowid);

            // 選択状態の維持データから該当行を抜ける
            WebGridExt.delSelection(grid, rowid);
        },

        // 行をグリッドに追加する
        addRows: function(grid, rowid, data, position) {
            var ids =grid.jqGrid('getDataIDs');

            // 行をグリッドに追加する
            var added_ids = grid.jqGrid('addRowData', rowid, data, position);

            if(ids.length == 0) {
                // reload grid
                grid.trigger("reloadGrid",[{page:1}]);
            } else {
                for (var i in ids)
                    if(!WebGridExt.isEditmode(grid, ids[i]))
                        return true;

                WebGridExt.editRows(grid, grid.jqGrid('getDataIDs'));
            }
        },

        // グリッドのデータを取得する (主に行データ)
        getData: function(grid, type) {
            switch(type) {
            case 'full':
                // 全パラメータ取得 (デバッグ用)
                return grid.jqGrid('getGridParam');

            case 'rows':
                // 全行取得
                return {ids: grid.jqGrid('getDataIDs'),
                        rows: grid.jqGrid('getRowData')};

            case 'selected_rows':
                // 選択行取得
                return {ids: (grid, true),
                        rows: getSelectedRow(grid, false)};
            default:
                throw "ERROR: Passed type('"+type+"') is undefined!";
            }
        },

        // update or add row in grid
        mapRow: function(grid, saverows, keycols) {
            // get all data in the grid
            var rows = WebGridExt.getData(grid, 'rows', false).rows;
            // init
            var addrows = [];
            var updaterows = [];
            var rowids = [];
            // loop row of saverows to make update rows
            for(var m =0; m < saverows.length; m++){
                // each row is empty -> break
                if(Object.keys(saverows[m]).length == 0) continue;
                // call function saveRowsub to check the same row
                var rowidsame = saveRowSub(rows, keycols, saverows[m]);
                // case row /= undefined
                if(rowidsame != undefined) {
                    // add rowid into list rowids
                    rowids = rowids.concat([rowidsame]);
                    // add row into updaterows
                    updaterows = updaterows.concat([saverows[m]]);
                }else {
                    // add row into addrows
                    addrows = addrows.concat([saverows[m]]);
                };
            };
            // init rows replace = [] to add rows
            var rowsreplace = [];
            // make data to replace
            for (var k=0; k<rows.length; k ++) {
                //init check
                var check = false;
                // loop rowids to find same id
                for(var l=0; l<rowids.length; l++){
                    if(k==rowids[l]){
                        check = true;
                        break;
                    }
                };
                // set replace row
                if(check == false) {
                    rowsreplace = rowsreplace.concat(rows[k]);
                }else {
                    rowsreplace = rowsreplace.concat(updaterows[l]);
                };
            };
            // update data to replace rows
            grid.jqGrid('setGridParam', {data: rowsreplace});
            // add rows into the bottom of grid
            grid.jqGrid('addRowData', undefined, addrows, 'last');
            // reload grid
            grid.trigger('reloadGrid');
        },

        // set properties for all checkboxes of grid
        checkAllCheckboxes: function(grid, colname, check) {

            // get all rows
            $total = WebGridExt.getData($(obj(grid)), 'rows', false).rows;

            // set checkbox for each row
            for(var i = 0; i < $total.length; i++) {
                $total[i][colname]=check;
            }

            // set data and reload grid
            $('table[id$='+ grid +'][class*="jqgrid"]').
                jqGrid('setGridParam', {data: $total}).
                    trigger('reloadGrid');
        },

        // set properties for all checkboxes of grid
        setCellValue: function(grid, rowid, colname, value) {

            // get all rows
            var total = WebGridExt.getData(grid, 'rows', false).rows;

            // set checkbox for each row
            total[rowid-1][colname]=value;

            // set data and reload grid
            grid.jqGrid('setGridParam', {data: total}).trigger('reloadGrid');
        },

        // jqGridが画面にPOSTするデータに、ポストバック情報やDOMステートを付与する
        readyPostdata: function(postdata, postbackInfo) {
            postdata.postbackInfo = postbackInfo;
            postdata.domState = Nitrogen.$get_dom_state();
            return postdata;
        },

        // インライン編集用のコールバック関数を生成して返す
        makeInlineEditingFun: function(grid, postbackInfo) {
            var lastsel;
            return function(id) {
                if(id && id!==lastsel){
                    grid.jqGrid('restoreRow',lastsel);
                    grid.jqGrid('editRow',id,true, undefined,
                                undefined,
                                postbackInfo=='undefined' ? 'clientArray' : undefined,
                                {domState:Nitrogen.$get_dom_state(), postbackInfo:postbackInfo},
                                function() { lastsel=null; },
                                undefined,
                                function () { lastsel=null; });

                    lastsel=id;
                }
            };
        },

        // 画面にポストバックを送信する
        sendPostback: function(postbackInfo, async, arg) {
            var params =
                "domState=" + Nitrogen.$get_dom_state() +
                "&postbackInfo=" + postbackInfo +
                "&gridArg=" + encodeURIComponent(JSON.stringify(arg));
            var ret=undefined;
            if(async) {
                Nitrogen.$queue_event("", postbackInfo, "gridArg="+encodeURIComponent(JSON.stringify(arg)));
            } else {
                var post = function(){
                    jQuery.ajax({
                        async: async,
                        url: location.pathname,
                        type:'post',
                        data: params,
                        dataType: 'text',
                        success: function(data, textStatus){
                            ret=eval(data);
                        },
                        error: function(xmlHttpRequest, textStatus, errorThrown){
                            eval(xmlHttpRequest.responseText);
                        }
                    });
                };
                post();
            }
            return ret;
        },

        // サブグリッド用: 展開中の行データの情報を取得する
        getExpandingRow: function(subgrid_id, rowid) {
            var grid_id = subgrid_id.replace(/_[^_]*$/, '');
            var grid = $(obj(grid_id));

            var row = grid.jqGrid('getRowData', rowid);
            row._subgrid_id = subgrid_id;
            return row;
        },

        // 多段ヘッダ設定関数
        gridInsertColumnGroupHeader: function (mygrid, spec) {
            mygrid.jqGrid('setGroupHeaders', {
                useColSpanStyle: true,
                groupHeaders: spec
            });
        },

        // 列のヘッダーを外す
        removeColHeader: function(grid_id) {
            $('div[id*="'+grid_id+'"]').children(".ui-jqgrid-hdiv").remove();
        }
    };

    /*** PRIVATE ***/
    // 選択されている行データ(or 行ID)を取得する
    var getSelectedRow = function(grid, only_key) {
        var rows = grid.jqGrid('getGridParam', 'selarrrow');
        if(rows.length==0) {
            var row = grid.jqGrid('getGridParam', 'selrow');
            if(row!=null)
                rows = [row];
        }

        if(only_key==true) {
            return rows;
        } else {
            var ary = new Array();
            for(var i in rows) {
                ary.push(grid.jqGrid('getRowData', rows[i]));
            }
            return ary;
        }
    };

    // function saveRowsub to check row same
    var saveRowSub = function(rows, keycols, row) {
        var rowidsame;
        // loop rows in grid
        for (var i =0; i < rows.length; i++) {
            var checksame = true;
            // check same row follow keycol
            for(var j=0; j <keycols.length; j++) {
                if(rows[i][keycols[j]] != row[keycols[j]]){
                    checksame = false;
                };
            };
            if(checksame == true) {
                rowidsame = i;
                break;
            }
        };
        // return row id
        return rowidsame;

    };

    // 多段ヘッダ用の補助関数
    // see http://stackoverflow.com/questions/2132172/disable-text-highlighting-on-double-click-in-jquery/2132230#2132230
    var gridDenySelectionOnDoubleClick = function ($el) {
        if ($.browser.mozilla) {//Firefox
            $el.css('MozUserSelect', 'none');
        } else if ($.browser.msie) {//IE
            $el.bind('selectstart', function () {
                    return false;
            });
        } else {//Opera, etc.
                $el.mousedown(function () {
                    return false;
                });
        }
    };
})();
