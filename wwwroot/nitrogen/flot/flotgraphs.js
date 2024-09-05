var FlotGraph = 
{
    v:new Object(),
    initialize : function(Id, DataSet, ChoiceId, GraphOptions, Selection, Choice)
    {
        var i;
        var datasetlen = DataSet.length;
        var neededColors = DataSet.length;
        var usedColors = [];
        var assignedColors = [];
        for (i = 0; i < datasetlen; ++i) 
        {
            var sc = DataSet[i].color;
            if (sc != null) {
                --neededColors;
                if (typeof sc == "number") assignedColors.push(sc);
                else usedColors.push($.color.parse(DataSet[i].color));
            }
        }
        for (i = 0; i < assignedColors.length; ++i) 
        {
            neededColors = Math.max(neededColors, assignedColors[i] + 1);
        }

        var colors = []; 
        var variation = 0;
        
        i = 0;
        
        while (colors.length < neededColors) 
        {
            var c;
            if (options.colors.length == i)
                c = $.color.make(100, 100, 100);
            else
                c = $.color.parse(options.colors[i]);

            var sign = variation % 2 == 1 ? -1 : 1;
            c.scale('rgb', 1 + sign * Math.ceil(variation / 2) * 0.2)

            colors.push(c);

            ++i;
            if (i >= options.colors.length) 
            {
                i = 0;
                ++variation;
            }
        }
        // fill in the options
        var colori = 0, s;
        for (i = 0; i < datasetlen; ++i) {
            s = DataSet[i];

            if (s.color == null) {
                s.color = colors[colori].toString();
                ++colori;
            }
            else if (typeof s.color == "number")
                s.color = colors[s.color].toString();
        }
        
        // is shown choice

            var choiceStr = '';
            $.each(DataSet, function(key, val) {
                choiceStr = choiceStr + 
                    '<li>' + 
                       '<span class="flotgraph-color" style="background:' + val.color + ';"></span>' + 
                       '<input id="id' + ChoiceId + "_" + key +'" type="checkbox" checked="checked" name="' + key + '"/>' + 
                       '<label title="' + val.label + '" for="id' + ChoiceId + "_" + key + '">' + val.label+ '</label>' + 
                      '</li>';
            });
            var container = $("#" + Id);
            var choiceContainer = $("<div id=\"" + ChoiceId + "\"></div>");
            var graphContainer = $("<div id=\"" + Id + "_s\">　</div>");
            
            if(Choice){
                choiceContainer.append('<ul class="flotgraph-choice">' + choiceStr + '</ul>');
                container.append(choiceContainer);
                choiceContainer.find("input").click(function(e){FlotGraph.select(Id,ChoiceId,DataSet,Selection)});
            }
            var height = container.outerHeight() - choiceContainer.outerHeight();
            var width = container.outerWidth();
            
            // default size
            if(height <= 0) height = 300;
            
            container.prepend(graphContainer);
            graphContainer.height(height).width(width);
            
            var data = [];
            if(Choice){
                choiceContainer.find("input:checked")
                    .each(function(){
                            var key = $(this).attr("name");
                            if (key && DataSet[key]) data.push(DataSet[key]);
                        });
            }
            else{
            	data = DataSet;
            }
            
                
            if (data.length > 0) 
            {
                var plot = $.plot(graphContainer, data, GraphOptions);
                if(Selection != undefined)
                {
                    plot.setSelection({xaxis: Selection });
                }
            }
        
        FlotGraph.v[Id] = GraphOptions;
    },
    select:function(Id, ChoiceId, DataSet, Selection)
    {
        var data = [];
        var container = $("#" + Id); 
        var graphContainer = $("#" + Id + "_s");
        var choiceContainer = $("#" + ChoiceId);
        
        var checkedInput = choiceContainer.find("input:checked");
        if(checkedInput.size() == 1){checkedInput.prop("disabled",true);}
        else{choiceContainer.find("input").prop("disabled",false);}
        
        checkedInput.each(function(){
                    var key = $(this).attr("name");
                    if (key && DataSet[key]) data.push(DataSet[key]);
                });
        if (data.length >= 0)
        {
            var plot = $.plot(graphContainer, data, FlotGraph.v[Id]);
            if(Selection != undefined)
            {
                plot.setSelection({xaxis: Selection });
            }
        };
    },
    percentFormat:function(label, series) {
        return '<div style=\"font-size:8pt;text-align:center;padding:2px;color:white;\">'+label+'<br/>'
        +Math.round(series.percent)+'%</div>';
    },
    valueFormat:function(label, series) {
        return '<div style=\"font-size:8pt;text-align:center;padding:2px;color:white;\">'+label+'<br/>'
        +series.data[0][1]+'</div>';
    },
    percentAxis:function(v, axis) {
    	return v.toFixed(axis.tickDecimals) + "%";
    },
    dollerAxis:function(v, axis) {
    	return v.toFixed(axis.tickDecimals) + "$";
    },
    yenAxis:function(v, axis) {
    	return v.toFixed(axis.tickDecimals) + "円";
    }
}

