var SocialGraph = {
    v: new Object(),
    refresh: function (id) {
        SocialGraph.v[id].renderer.run();
    },
    initialize: function (id, nodesize) {
        if (VivaGraphZoom.zoomInt)VivaGraphZoom.zoomInt = 0;
        SocialGraph.v[id] = new Object();
        SocialGraph.v[id].graph = Viva.Graph.graph();
        SocialGraph.v[id].graphics = Viva.Graph.View.svgGraphics();
        SocialGraph.v[id].nodeSize = nodesize;
    },
    addLayout: function (id, layout) {
        SocialGraph.v[id].layout = Viva.Graph.Layout.forceDirected(SocialGraph.v[id].graph, layout);
        SocialGraph.v[id].renderer = Viva.Graph.View.renderer(SocialGraph.v[id].graph,
            {graphics: SocialGraph.v[id].graphics,
                layout: SocialGraph.v[id].layout,
                container: document.getElementById(id)});
        SocialGraph.v[id].renderer.run();

        SocialGraph.v[id].graphics.node(function (node) {
            var opacity = node.data.opacity;
            if (opacity == undefined) opacity = "1.0";

            var zoom = node.data.zoom;
            console.log(zoom);
            if (zoom == undefined) zoom = 1;

            var ui = Viva.Graph.svg('image')
                .attr('style', 'cursor:pointer;opacity:' + opacity + ';filter: alpha(opacity=' + opacity + ')')
                .attr('width', SocialGraph.v[id].nodeSize * zoom)
                .attr('fill-opacity', opacity)
                .attr('height', SocialGraph.v[id].nodeSize * zoom)
                .link(node.data.img);
            $(ui).dblclick(
                function () {
                    var wrap = $("#" + id).parent();
                    console.log(node.data.val);
                    wrap.find("input[type=hidden]").val(node.data.val);
                    wrap.find("input[type=button]").click();
                }).mouseover(
                function () {
                    SocialGraph.v[id].graph.forEachLinkedNode(node.id,
                        function (node, link) {
                            if (link && link.ui) {
                                link.ui.highlight(true);
                            }
                        });
                }).mouseout(
                function () {
                    SocialGraph.v[id].graph.forEachLinkedNode(node.id,
                        function (node, link) {
                            if (link && link.ui) {
                                link.ui.highlight(false);
                            }
                        });
                });
            return ui;
        }).placeNode(function (nodeUI, pos) {
                nodeUI.attr('x', pos.x - SocialGraph.v[id].nodeSize / 2).attr('y', pos.y - SocialGraph.v[id].nodeSize / 2);
            });
        var defs = SocialGraph.v[id].graphics.getSvgRoot().append('defs');

        var geom = Viva.Graph.geom();
        SocialGraph.v[id].graphics.link(function (link) {
            var linkPath = Viva.Graph.svg('path')
                .attr('stroke', '#999')
                .attr('style', 'opacity:0.5');
            linkPath.highlight = function (flag) {
                return flag ? linkPath.attr("stroke", '#fc8800')
                    .attr("stroke-width", "1.2px")
                    .attr('style', 'opacity:1') :
                    linkPath.attr("stroke", 'gray')
                        .attr("stroke-width", "1.0px")
                        .attr('style', 'opacity:0.5');
            };
            return linkPath;
        }).placeLink(function (linkUI, fromPos, toPos) {
                var toNodeSize = SocialGraph.v[id].nodeSize,
                    fromNodeSize = SocialGraph.v[id].nodeSize;

                var from = geom.intersectRect(
                    fromPos.x - fromNodeSize / 2, // left
                    fromPos.y - fromNodeSize / 2, // top
                    fromPos.x + fromNodeSize / 2, // right
                    fromPos.y + fromNodeSize / 2, // bottom
                    fromPos.x, fromPos.y, toPos.x, toPos.y)
                    || fromPos; // if no intersection found - return center of the node

                var to = geom.intersectRect(
                    toPos.x - toNodeSize / 2 - 1, // left
                    toPos.y - toNodeSize / 2 - 1, // top
                    toPos.x + toNodeSize / 2 + 1, // right
                    toPos.y + toNodeSize / 2 + 1, // bottom
                    toPos.x, toPos.y, fromPos.x, fromPos.y)
                    || toPos; // if no intersection found - return center of the node

                var dx = toPos.x - fromPos.x,
                    dy = toPos.y - fromPos.y,
                    theta = Math.atan2(dy, dx),
                    d90 = Math.PI / 2,
                    dtxs = to.x,
                    dtys = to.y;

                var data = "M" + from.x + "," + from.y + "L" + to.x + "," + to.y + "M" + dtxs + "," + dtys +  "l" + (2 * Math.cos(d90 - theta) - 5 * Math.cos(theta)) + "," + (-2 * Math.sin(d90 - theta) - 5 * Math.sin(theta)) + "L" + (dtxs - 2 * Math.cos(d90 - theta) - 5 * Math.cos(theta)) + "," + (dtys + 2 * Math.sin(d90 - theta) - 5 * Math.sin(theta)) + "z";
                linkUI.attr("d", data);
            });
    },
    addData: function (id, graphdata) {
        var nodelen = graphdata.nodes.length;
        for (var i = 0; i < nodelen; i++) {
            var node = graphdata.nodes[i];
            SocialGraph.v[id].graph.addNode(node.name, {img: node.img, val: node.val, opacity: node.opacity, zoom: node.zoom});
        }
        var linklen = graphdata.links.length;
        for (var i = 0; i < linklen; i++) {
            var link = graphdata.links[i];
            SocialGraph.v[id].graph.addLink(link.source, link.target);
        }
    }
};