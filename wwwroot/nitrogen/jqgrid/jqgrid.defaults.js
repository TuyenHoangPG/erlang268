/**
 * グリッドのデフォルト設定
 */
jQuery.extend(jQuery.jgrid.defaults,
              {
                  caption: '',
                  height: 'auto',
                  viewsortcols: [true,'vertical',true],
                  treeGridModel: 'adjacency',
                  jsonReader: {
                      repeatitems: false
                  }
              }
             );
