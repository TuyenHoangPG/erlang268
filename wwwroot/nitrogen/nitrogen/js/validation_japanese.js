

/*** VALIDATION ***/

// Halfwidth Katakana variants （U+FF65 ~ U+FF9F) (65381, 65439)
N.is_halfwidth_kana = function(text) {
    for (var i=0; i<text.length; i++) {
        var charCode = text.charCodeAt(i);
        if (charCode < 65381 || charCode > 65439) {
            return false;
        }
    }
    return true;
}

// Full width Katakana U+30A0 ~ U+30FF ( 12448 ~ 12543 ) and  U+31F0 ~ U+31FF ( 12784 ~ 12799 )
N.is_fullwidth_kana = function(text) {
    for (var i=0; i<text.length; i++) {
        var charCode = text.charCodeAt(i);
        if (charCode < 12448 || (charCode > 12543 && charCode < 12784) || charCode > 12799) {
            return false;
        }
    }
    return true;
}

// Hiragana U+3041 ~ U+309F ( 12353 ~ 12447 )
N.is_hiragana = function(text) {
    for (var i=0; i<text.length; i++) {
        var charCode = text.charCodeAt(i);
        if (charCode < 12353 || charCode > 12447) {
            return false;
        }
    }
    return true;
}

// All characters marked as W(ide), F(ullwidth) and A(mbiguous) are fullwidth characters.
N.is_fullwidth_character = function(text) {
    var valid_code_array = (new FullwidthUnicode()).codes();
    for (var i=0; i<text.length; i++) {
        var charCode = text.charCodeAt(i);
        if (!N.$binsearch(valid_code_array, charCode)) {
            return false;
        }
    }
    return true;
}
