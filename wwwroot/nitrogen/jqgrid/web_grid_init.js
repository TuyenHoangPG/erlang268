/**
 * jqGridの初期化用のファイル
 *
 * 作成日: 2012/02/09
 * 作成者: Ohta
 *
 * copyright Murakumo, All Rights Reserved.
 **/

/*** デフォルト設定 ***/
jQuery.extend(jQuery.jgrid.defaults,
              {
                  caption: '',
                  rowNum: 10,
                  rowList: [10,20,50,100],
                  viewrecords: true,

                  loadonce: true,
                  altRows: true,
                  multiboxonly: true,

                  cmTemplate: {
                      sortable: true,
                      resizable: true
                  },

                  jsonReader: {
                      repeatitems: false,
                      id: "_grid_id_"
                  },

                  // multiselectオプションがtrueの場合に、ソートやページング後にも選択状態が継続されるようにするためのオプション
                  gridComplete: function() { WebGridExt.restoreSelection($(this)); },
                  onPaging: function() { WebGridExt.saveSelection($(this)); },
                  onSortCol: function() { WebGridExt.saveSelection($(this)); }
              });


/*** フォーマッタ登録 ***/
jQuery.extend($.fn.fmatter , {
    fmtDate: WebGridFormat.format.date,
    fmtTime: WebGridFormat.format.time,
    fmtTime1: WebGridFormat.format.time1,
    fmtDateTime: WebGridFormat.format.datetime,
    fmtDateTime1: WebGridFormat.format.datetime1,
    fmtCurrency: WebGridFormat.format.currency,
    fmtCurrencyWithSuffix: WebGridFormat.format.currency_with_suffix,
    fmtCurrencyWithPrefix: WebGridFormat.format.currency_with_prefix,
    fmtSuffix: WebGridFormat.format.suffix,
    fmtTextarea: WebGridFormat.format.textarea,
    fmtRadio: WebGridFormat.format.radio,
    fmtReal: WebGridFormat.format.real,
    fmtButton: WebGridFormat.format.button,
    htmlEscape: WebGridFormat.format.htmlEscape,
    decimal: WebGridFormat.format.decimal,
    fmtCheckbox: WebGridFormat.format.checkbox,
});

jQuery.extend($.fn.fmatter.fmtCurrency, {
    unformat: WebGridFormat.unformat.currency
});

jQuery.extend($.fn.fmatter.fmtRadio, {
    unformat: WebGridFormat.unformat.radio
});

jQuery.extend($.fn.fmatter.fmtReal, {
    unformat: WebGridFormat.unformat.real
});


/*** Override: jqgrid.utils.js ***/
JqGridUtils.getData = WebGridExt.getData;
JqGridUtils.getExpandingRow = WebGridExt.getExpandingRow;
