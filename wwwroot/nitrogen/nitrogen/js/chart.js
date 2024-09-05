

/*** CHART_JS ***/



N.$chartJsInit = function(Id, dataSet, chartjsOptions, chartType){
    var chartTypeName = chartType;
    // Generate chart
    generate_chart(Id, dataSet, chartTypeName);

    // Generate a appropriate chart based on chartType and the given rawData
    function generate_chart(chartContainerID, rawData, chartType){

        var options = chartjsOptions;
        var data = rawData;

        //Create a chart
        create_chart(chartContainerID, chartType, data, options);
    }

    // to create a chart
    function create_chart(chartContainerID, chartType, chartInputData, chartOptions){
        var chartConfig = get_chart_config(chartType, chartInputData, chartOptions);
        var ctx = document.getElementById(chartContainerID).getContext("2d");
        new Chart(ctx, chartConfig);
    }

    // the configuration of chart as chartjs format
    function get_chart_config(chartType, chartInputData, chartOptions){
        var config = {
            type: chartType,
            data: chartInputData,
            options: chartOptions
        };

        return config;
    }

}
