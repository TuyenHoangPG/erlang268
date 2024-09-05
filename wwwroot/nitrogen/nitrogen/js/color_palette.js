

/*** COLOR PALETTE ***/
N.$color_palette = function(controlObj, options) {
    jQuery(controlObj).simpleColorPicker(options);

    // clean up palette DOM in case of color palette is removed
    jQuery(controlObj).bind('destroyed', function (e) {
        var paletteId = controlObj.id + "_color-picker";
        $("#" + paletteId).remove();
    })
}
