

/*** SERIALIZATION ***/

N.prototype.$get_elements_to_serialize = function() {
    var tagnames = ["input", "button", "select", "textarea", "checkbox"];
    var a = new Array();
    for (var i=0; i<tagnames.length; i++) {
        var l = this.$div.getElementsByTagName(tagnames[i]);
        for (var j=0; j<l.length; j++) {
            var elementName = l[j].name;

            if (l[j].id.match(/^[0-9]+_.+$/)) {
                // jqgrid input element: pass
                continue;
            }

            //

            if (elementName != "domState" && elementName != "postbackInfo") {
                a = a.concat(l[j]);
            }
        }
    }

    // SPAN element which has 'inputable' class is handled as a input element.
    $(".inputable").each(function () {
        if((this.tagName === "SPAN") === false)
            return;

        var el = document.createElement('input');
        el.type = 'text';
        el.name = this.id;
        el.value = this.innerHTML;

        a = a.concat(el);
    });

    return a;
}
