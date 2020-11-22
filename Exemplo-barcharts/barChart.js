'use strict';

function barChart() {
    
    var scope = this;
    var exports = {};

    scope.margins = {top: 10, bottom: 30, left: 25, right: 15};
    scope.cw = 350;
    scope.ch = 350;
    
    scope.div        = undefined;
    scope.x0Scale    = undefined;
    scope.x1Scale    = undefined;
    scope.yScale     = undefined;
    scope.x0Axis     = undefined;
    scope.yAxis      = undefined;

    scope.barWidth   = undefined;
    scope.barPadding = undefined;

    scope.colorScale = undefined;

    scope.data       = undefined;

    scope.allowLegend = false;

    scope.appendSvg = function(div) {
    
        var node = d3.select(div).append('svg')
            .attr('width', scope.cw + scope.margins.left + scope.margins.right)
            .attr('height', scope.ch + scope.margins.top + scope.margins.bottom);

        return node;
    }

    scope.appendChartGroup = function(svg) {
        
        var chart = svg.append('g')
            .attr('width', scope.cw)
            .attr('height', scope.ch)
            .attr('transform', 'translate('+ scope.margins.left +','+ scope.margins.top +')' );

        return chart;
    }

    scope.createAxes = function(svg, data, ageNames) {
        
        var padding = 80;

        scope.x0Scale = d3.scaleBand()
            .domain(data.map(function(d) { return d.State; }))
            //.range([0, scope.cw - padding])
            .range([0, scope.cw])
            .round(true);

        scope.barWidth = scope.x0Scale.bandwidth() / ageNames.length;
        scope.barPadding = scope.barWidth * 0.3;

        scope.x1Scale = d3.scaleBand()
            .domain(ageNames)
            .range([scope.barPadding, scope.x0Scale.bandwidth() - scope.barPadding]);
            //.range([0, scope.x0Scale.bandwidth()])

        scope.yScale = d3.scaleLinear()
            .domain(d3.extent([0, d3.max(data, function(d) { 
                return d3.max(d.ages, function(d) { 
                    return d.value; 
                });
            })]))
            .range([scope.ch,0]).nice();
    
        var x0AxisGroup = svg.append('g')
            .attr('class', 'xAxis')
            .attr('transform', 'translate('+ scope.margins.left +','+ (scope.ch + scope.margins.top) +')');

        var yAxisGroup = svg.append('g')
            .attr('class', 'yAxis')
            .attr('transform', 'translate('+ scope.margins.left +','+ scope.margins.top +')');
    
        scope.x0Axis = d3.axisBottom(scope.x0Scale)
            //.tickSize(-(scope.cw))
            .tickSize(10)
            .tickPadding(10);

        scope.yAxis = d3.axisLeft(scope.yScale)
            //.tickSize(-(scope.cw - padding))
            .tickSize(-(scope.cw))
            .tickPadding(2)
            .tickFormat(d3.format('.2s'));

        x0AxisGroup.call(scope.x0Axis)
            //.append('text')
            //.attr('class', 'axisLabel')
            //.attr('y', 30)
            //.attr('x', scope.ch/2 + padding)
            //.text('Cities');

        yAxisGroup.call(scope.yAxis)
            .append('text')
            .attr('class', 'axisLabel')
            .attr('y', 20) //-28
            .attr('x', 0)//-170
            .attr('transform', 'rotate(-90)')
            .text('Population');
    }

    scope.appendBars = function(svg, data) {

        var state = svg.append('g')
            .style('clip-path', 'url(#clip)')
            .selectAll('g')
            .data(data)
            .enter().append('g')
                .attr('class', 'barGroup')
                .attr('transform', function(d) { return "translate(" + scope.x0Scale(d.State) + ",0)"; });
        
        state.selectAll('rect')
            .data(function(d) { return d.ages.map((d1)=>{return {"state":d.State,"name":d1.name, "value":d1.value};}); })  
            .enter().append('rect')
            .attr('class', 'bar')
            .attr('width', scope.x1Scale.bandwidth())
            .attr('x', function(d) { return scope.x1Scale(d.name); })
            .attr('y', function(d) { return scope.yScale(d.value); })
            .attr('height', function(d) { return scope.ch - scope.yScale(d.value); })
            .style('fill', function(d) { return scope.colorScale(d.name); });
    
        var addDataIdentification = function() {
        
            state.selectAll('text')
                .data(function(d) { return d.ages; })
                .enter().append('text')
                .attr('x', function(d) { return scope.x1Scale(d.name) + scope.x1Scale.bandwidth()/2; } )
                .attr('y', function(d) { return scope.yScale(d.value) -5; })
                .attr('fill', 'black')
                .attr('font-size', '7px')
                .attr('text-anchor', 'middle')
                .text(function(d) { return d.value; });
        }
        
            //addDataIdentification();
    }

    scope.appendLegend = function(svg, ageNames) {

        var legend = svg.selectAll('.legend')
            .data(ageNames.slice().reverse())
            .enter().append('g')
            .attr('class', 'legend')
            .attr('transform', function(d, i) { return 'translate(0,' + i * 20 + ')'; });
    
        legend.append('rect')
            .attr('x', scope.cw)
            .attr('y', 9)
            .attr('width', 18)
            .attr('height', 18)
            .style('fill', scope.colorScale);
    
        legend.append('text')
            .attr('x', scope.cw - 2)
            .attr('y', 9 + 9)
            .attr('dy', '.35em')
            .style('text-anchor', 'end')
            .text(function(d) { return d; });
    
    }

    scope.addZoom = function(svg, ageNames) {
    
        function zoomed() {
    
            var t = d3.event.transform;
    
            scope.x0Scale.range([0, scope.cw].map(d => t.applyX(d)));
            
            scope.barWidth = scope.x0Scale.bandwidth() / ageNames.length;
            scope.barPadding = scope.barWidth * 0.3;
            
            scope.x1Scale.range([scope.barPadding, scope.x0Scale.bandwidth() - scope.barPadding]);
    
            svg.selectAll('.barGroup').attr('transform', function(d) { return 'translate(' + scope.x0Scale(d.State) + ',0)'; });
            svg.selectAll('.bar').attr('x', function(d) { return scope.x1Scale(d.name); }).attr('width', scope.x1Scale.bandwidth());
    
            svg.select(".xAxis").call(scope.x0Axis);
            
        }
    
        scope.zoom = d3.zoom()
            .scaleExtent([1, 8])
            .translateExtent([[0, 0], [scope.cw, scope.ch]])
            .extent([[0, 0], [scope.cw, scope.ch]])
            .on('zoom', () => { zoomed()});
    
        svg.call(scope.zoom);
        
    }

    scope.addBrush = function(svg, ageNames) {

        function brushed() {
            if (!d3.event.sourceEvent) return; // Only transition after input.
            if (!d3.event.selection) return; // Ignore empty selections.
    
            var s = d3.event.selection;
            var x0 =s[0];
            var x1 = s[1];
    
           var color = function (d) {
                //console.log("Color", d);
                const pos = scope.x0Scale(d.state) + (scope.x1Scale(d.name) + scope.x1Scale.bandwidth()/2); 
                if ( pos >= x0 && pos <= x1 && (x1-x0) >= 1)
                    { return 'yellowgreen'; }
                else 
                    { return scope.colorScale(d.name); }    
            }; 
            
            svg.selectAll('.bar')
                // .attr('width', scope.x1Scale.bandwidth())
                .style('fill', color);
    
        }
    
        scope.brush = d3.brushX()
            .extent([[0,0], [scope.x0Scale.range()[1], 
                scope.yScale.range()[0]]])
            .on('brush', brushed);
        
        svg.append('g').attr('class', 'brush');
    
        svg.select('.brush').call(scope.brush);
    
    }

    scope.fileCSV = function(file, svg, cht) {

        d3.csv(file, function(error, data) {
            if (error) throw error;
            //console.log(data)
    
        var ageNames = d3.keys(data[0])
            .filter(function(key) { return key !== 'State'; });
        
        console.log(ageNames);
    
        data.forEach(function(d) {
            d.ages = ageNames.map(function(name) {
                    return { name:name, value:+d[name] }; });       
        });
        console.log(data)
    
        scope.colorScale = d3.scaleOrdinal()
            .range(['#edf8b1', '#c7e9b4', '#7fcdbb', '#41b6c4', '#1d91c0', '#225ea8', '#0c2c84'])
        
        scope.addZoom(svg, ageNames);
        scope.createAxes(svg, data, ageNames);
        scope.appendBars(cht, data);
        if (scope.allowLegend)
            scope.appendLegend(svg, ageNames);
    
        scope.addBrush(cht, ageNames);
    
        });
        
    }

    //------------- exported API -----------------------------------

    exports.run = function(div, data) {
        
        scope.div = div;
        //scope.callback = callback;

        var svg = scope.appendSvg(div);
        var cht = scope.appendChartGroup(svg); 

        scope.fileCSV(data, svg, cht);
    }

    return exports;

};