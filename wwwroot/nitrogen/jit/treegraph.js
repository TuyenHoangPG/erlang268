$jit.Hypertree.Plot.NodeTypes.implement({
    'img' : {
        'render' : function(node, canvas) {
            var nconfig = this.node, img = new Image(), ctx = canvas.getCtx(),
                dim = node.getData('dim'), p = node.pos.getc();
            dim = nconfig.transform ? dim * (1 - p.squaredNorm()) : dim;
            p.$scale(node.scale);
            if (dim > 5) {
                this.nodeHelper.square.render('fill', p, dim, canvas);
                img.onload = function() {
                    ctx.drawImage(img, p.x - dim + 1, p.y - dim + 1,
                            dim * 2 - 2, dim * 2 - 2);
                };
                img.src = node.data.img;
            } else {
                this.nodeHelper.circle.render('fill', p, dim, canvas);
            }
        },
        'contains' : function(node, pos) {
            var dim = node.getData('dim'), npos = node.pos.getc().$scale(node.scale);
            return this.nodeHelper.square.contains(npos, pos, dim);
        }
    }
});

$jit.Hypertree.Plot.NodeTypes.implement({
    'img-selected' : {
        'render' : function(node, canvas) {
            var nconfig = this.node, img = new Image(), ctx = canvas.getCtx(),
                dim = node.getData('dim'), p = node.pos.getc();
            dim = nconfig.transform ? dim * (1 - p.squaredNorm()) : dim;
            p.$scale(node.scale);
            if (dim > 5) {
                var focusdim = dim + 10;
                this.nodeHelper.square.render('fill', p, focusdim, canvas);
                img.onload = function() {
                    ctx.drawImage(img, p.x - focusdim + 2, p.y
                            - focusdim + 2, focusdim * 2 - 4,
                            focusdim * 2 - 4);
                };
                img.src = node.data.img;
            } else {
                this.nodeHelper.circle.render('fill', p, dim, canvas);
            }
        },
        'contains' : function(node, pos) {
            var dim = node.getData('dim'), npos = node.pos.getc().$scale(node.scale);
            return this.nodeHelper.square.contains(npos, pos, dim);
        }
    }
});

function cData(id, name, size, value, img, parent_id) {
    var data = {
        "id" : id,
        "name" : name,
        "data" : {
            "$dim" : size,
            "value" : value,
            "img" : img
        }
    };
    if (parent_id != "") {
        data.adjacencies = [{"nodeTo" : parent_id}];
    }
    return data;
}

var TreeGraphCenter = {};

var TreeGraph = {
    options : {
        Node : {
            overridable : true,
            transform : true,
            color : "#999",
            type : "img"
        },
        Edge : {
            overridable : true,
            color : "#333",
            alpha : 0.5
        },
        Navigation : {
            enable : true,
            panning : false,
            zooming : 20
        },
        offset : 0.1,
        transition : $jit.Trans.Back.easeOut,
        duration : 1000
    },
    initialize : function(id, graphid, controllerid, data, focusNodes) {
        $("#" + id).width($("#" + graphid).outerWidth());
        var labelType, useGradients, nativeTextSupport, animate;
        var ht;
        var functionObj = {
            injectInto : graphid,
            onBeforePlotLine : function(adj) {},
            onBeforeCompute : function(node) {},
            onCreateLabel : function(domElement, node) {
                TreeGraph.createLabel(id, ht, domElement, node);
            },
            onPlaceLabel : function(domElement, node) {
                TreeGraph.placeLabel(domElement, node);
            },
            onBeforePlotNode : function(node) {
                TreeGraph.beforePlotNode(id, node);
            },
            onComplete : function() {
                TreeGraph.completed(id, ht);
            }
        };
        var treeobj = $.extend(TreeGraph.options, functionObj);
        if (data.length > 100) {
            treeobj.offset = 0;
        }

        ht = new $jit.Hypertree(treeobj);
        ht.loadJSON(data, 0);
        ht.refresh();
        ht.controller.onBeforeCompute(ht.graph.getNode(ht.root));
        ht.controller.onComplete();

        $("#" + controllerid).html("");
        var len = focusNodes.length;

        if (len == 0) {
            $("#" + controllerid).hide()
        } else {
            for ( var i = 0; i < len; i++) {
                var node = focusNodes[i];
                if (node.node.length > 0) {
                    var selectHTML = "<select>";
                    selectHTML += "<option value=\"" + id + "_root\"></option>";
                    for ( var index in node.node) {
                        var target = node.node[index];
                        selectHTML += "<option value=\"" + id + "_" + target.id + "\">"
                                + target.name + "</option>";
                    }
                    selectHTML += "</select>";

                    var select = $(selectHTML).change(function() {
                        TreeGraphCenter[id] = $(this).val();
                        ht.onClick($(this).val(), {
                            onComplete : function() {
                                var node = ht.graph.getClosestNodeToOrigin("current");
                                $("#" + id).find("input[type=hidden]").val(node.data.value);
                                $("#" + id).find("input.trg_focus").click();
                                ht.controller.onComplete();
                            }
                        });
                    });
                    var selectBlock = $("<span class=\"select-block\"></span>").append(
                        $("<span class=\"focus-label\">"
                                + node.label + "</span>")).append(
                        select);
                    $("#" + controllerid).append(selectBlock);
                }
            }
        }
    },
    createLabel : function(id, ht, domElement, node) {
        if (node.id == id + "_root") {
            domElement.innerHTML = "<span class=\"root-label\">" + node.name + "</span>";
        } else {
            domElement.innerHTML = "<img style=\"opacity: 0;\", src=\"/nitrogen/jit/transparent.png\"/>";
//            domElement.innerHTML = "　";
        }
        domElement.style.cursor = "pointer";
        domElement.onclick = function() {
            TreeGraphCenter[id] = node.id;
            ht.onClick(node.id, {
                onComplete : function() {
                    var node = ht.graph
                            .getClosestNodeToOrigin("current");
                    $("#" + id).find("input[type=hidden]").val(
                            node.data.value);
                    $("#" + id).find("input.trg_click").click();
                    ht.controller.onComplete();
                }
            });
        };
    },
    placeLabel : function(domElement, node) {
        var width = domElement.offsetWidth;
        var intX = parseInt(domElement.style.left);
        intX -= width / 2;
        domElement.style.left = intX + 'px';
    },
    beforePlotNode : function(id, node) {
        if (node.id == id + "_root") {
            if (node.data.img == "")
                node.setData("type", "circle");
            else
                node.setData("type", "img");
        } else {
            if (node.id == TreeGraphCenter[id])
                node.setData("type", "img-selected");
            else
                node.setData("type", "img");
        }
    },
    completed : function(id, ht) {}
};
