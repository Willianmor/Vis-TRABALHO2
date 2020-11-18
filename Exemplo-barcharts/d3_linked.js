'use strict';

var myApp = {};

myApp.data01    = undefined;
myApp.data02    = undefined;
myApp.data03    = undefined;
myApp.data04    = undefined;

myApp.chart01 = undefined;
myApp.chart02 = undefined;
myApp.chart03 = undefined;
myApp.chart04 = undefined;

myApp.run = function() {

    myApp.data01 = 'data1.csv';
    myApp.data02 = 'data2.csv';
    myApp.data03 = 'data-canvas-sense-your-city-one-week.csv';
    myApp.data04 = 'auto-mpg.csv';
    
    //myApp.chart01 = new barChart();
    //myApp.chart01.run("#chart01", myApp.data01);

    myApp.chart02 = new barChart();
    myApp.chart02.run("#chart02", myApp.data02);

    myApp.chart03 = new lineChart();
    myApp.chart03.run("#chart03", myApp.data03);

    myApp.chart04 = new scatterPlot();
    myApp.chart04.run("#chart04", myApp.data04);
}

window.onload = myApp.run;