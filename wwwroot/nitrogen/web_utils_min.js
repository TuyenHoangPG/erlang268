(function(){WebUtils={focusIfInputLengthIsN:function(f,e,i){var h=$(e);var g=$(f);h.keyup(function(j){var k={9:true,16:true};if(k[j.keyCode]!=true&&h.val().length==i){g.focus()}})},digitZenToHan:function(f){var e={"０":"0","１":"1","２":"2","３":"3","４":"4","５":"5","６":"6","７":"7","８":"8","９":"9"};return c(f,e)},digitDotZenToHan:function(e){return c(WebUtils.digitZenToHan(e),{"．":"."})},digitHyphenZenToHan:function(e){return c(WebUtils.digitZenToHan(e),{"ー":"-","－":"-","─":"-"})},clearSelection:function(e){switch(e.tagName){case"SELECT":b(e);break;case"DIV":if($(":first-child",e).get(0).className.match(".*select_radio.*")){d(e)}else{a(e)}break;default:throw ("Unexpected Element Passed")}},updateValuesByClass:function(g,e){var f=0;$("."+g).each(function(){var h=e[f%e.length];this.value=h;f++})},dateStrToInt:function(e){var f=e.match(/^([0-9]{1,4})[/]([0-9]{1,2})[/]([0-9]{1,2})$/);if(!f){return false}return new Date(parseInt(f[1],10),parseInt(f[2],10),parseInt(f[3],10)).getTime()},makeDateFormatCheckFn:function(f){var e=function(i){if(!i){return false}var j=parseInt(i[1],10);var k=parseInt(i[2],10)-1;var g=parseInt(i[3],10);var h=new Date(j,k,g);return h.getFullYear()===j&&h.getMonth()===k&&h.getDate()===g};return function(h,g){switch(f){case"date":return e(h.match(/^([0-9]{1,4})[/]([0-9]{1,2})[/]([0-9]{1,2})$/));case"time":return h.match(/^(2[0-3]|[0-1]?[0-9]):[0-5]?[0-9]$/);case"datetime":return e(h.match(/^([0-9]{1,4})[/]([0-9]{1,2})[/]([0-9]{1,2}) (2[0-3]|[0-1]?[0-9]):[0-5]?[0-9]$/));default:throw ("Unexpected type passed")}}},isValidDateFormat:function(e){return WebUtils.makeDateFormatCheckFn("date")(e)},setFileSizeToHidden:function(g,f){var e=$(g)[0].files[0];if(e===undefined||e===null){$(f).val("")}else{$(f).val(e.size)}}};var c=function(h,g){var e="";for(var f=0;f<h.length;f++){e+=g[h[f]]?g[h[f]]:h[f]}return e};var b=function(e){$(e).val($(":first-child",e).val())};var d=function(f){var e=$("input",$(":first-child",f)).val();$("input",f).val([e])};var a=function(e){$("input",e).val([])}})();var SCRM={download:function(b){$("#__download_frame").remove();var a=$("<iframe id='__download_frame' class='not_display'></iframe>").attr("src",b);$("body").append(a)},enable_elem_wait_loading:function(){if($(".ui-jqgrid .loading:visible,.loading_panel:visible").size()>0){setTimeout(function(){SCRM.enable_elem_wait_loading()},100)}else{N._enable_elems()}},dialog:function(){setTimeout(function(){$(document).unbind("mousedown.dialog-overlay").unbind("mouseup.dialog-overlay")},100)},integer_rang_validate:function(b,a){if(SCRM.empty_or_undefind(b)||SCRM.empty_or_undefind(a)){return true}if(!b.match(/[^0-9]+/)&&!a.match(/[^0-9]+/)){return Number(b)<=Number(a)}else{return true}},empty_or_undefind:function(a){return a==""||a==undefined}};