'use strict';

function lineChart() {

    var scope = this;
    var exports = {};

    scope.margins = {top: 10, bottom: 110, left: 40, right: 15};
    scope.margins2 = {top: 330, right: 15, bottom: 30, left: 40}
    
    scope.cw = 350;
    scope.ch = 280;
    scope.ch2 = 40;

    scope.xScale = undefined;
    scope.x2Scale = undefined;
    
    scope.yScale = undefined;
    scope.y2Scale = undefined;

    scope.xAxis = undefined;
    scope.x2Axis = undefined;

    scope.zoom = undefined;
    scope.brush = undefined;

    scope.allowLegend = true;

    scope.appendSvg = function(div) {
        
        var node = d3.select(div).append('svg')
            .attr('width', scope.cw + scope.margins.left + scope.margins.right)
            .attr('height', scope.ch + scope.margins.top + scope.margins.bottom);

        return node;
    }

    scope.appendFocus = function(svg) {

        var focus = svg.append('g')
            .attr('width', scope.cw)
            .attr('height', scope.ch)
            .attr('class', 'focus')
            .attr('transform', 'translate(' + scope.margins.left + ',' + scope.margins.top + ')');
        
            return focus;
        
    }

    scope.appendContext = function(svg) {

        var context = svg.append('g')
            .attr('width', scope.cw)
            .attr('height', scope.ch2)
            .attr('class', 'context')
            .attr('transform', 'translate(' + scope.margins2.left + ',' + scope.margins2.top + ')');
        
        return context;
    }

    scope.createFirstAxis = function(svg, data) {
        
        scope.xScale = d3.scaleTime()
            .domain(d3.extent(data, function(d) {
                return new Date(d.timestamp); }))
            .range([0, scope.cw]).nice();
            
        scope.yScale = d3.scaleLinear()
            .domain(d3.extent([0, d3.max(data, function(d) {
                return parseFloat(d.temperature); })]))
            .range([scope.ch,0]).nice();
            
        scope.xAxisGroup = svg.append('g')
            .attr('class', 'xAxis')
            .attr('transform', 'translate('+ scope.margins.left +','+ (scope.ch + scope.margins.top) +')');
            
        scope.yAxisGroup = svg.append('g')
            .attr('class', 'yAxis')
            .attr('transform', 'translate('+ scope.margins.left +','+ scope.margins.top +')');

        scope.xAxis = d3.axisBottom(scope.xScale)
            .tickSize(-(scope.ch))
            .tickPadding(10);
        
        scope.yAxis = d3.axisLeft(scope.yScale)
            .tickSize(-(scope.cw))
            .tickPadding(10);
    
        scope.xAxisGroup.call(scope.xAxis)
            
        scope.yAxisGroup.call(scope.yAxis)
            .append('text')
            .attr('class', 'axisLabel')
            .attr('y', -28)//-28
            .attr('x', -0.4*scope.ch)//-170
            .attr('transform', 'rotate(-90)')
            .text('Temperature (°C)');
            
    }

    scope.createSecondAxis = function(svg) {
        
        scope.x2Scale = d3.scaleTime()
            .domain(scope.xScale.domain())
            .range([0, scope.cw]).nice();
            
        scope.y2Scale = d3.scaleLinear()
            .domain(scope.yScale.domain())
            .range([scope.ch2,0]).nice();
            
        scope.x2AxisGroup = svg.append('g')
            .attr('class', 'xAxis')
            .attr('transform', 'translate('+ scope.margins2.left +','+ (scope.ch2 + scope.margins2.top) +')');

        scope.x2Axis = d3.axisBottom(scope.x2Scale)
    
        scope.x2AxisGroup.call(scope.x2Axis)

            
    }

    scope.appendFirstLines = function(svg, nested, colorScale) {
        
        var lineGenerator = d3.line()
                .x(function(d) { return scope.xScale(d.timestamp); } )
                .y(function(d) { return scope.yScale(d.temperature); } );
            
        svg.selectAll('.line-path').data(nested)
            .enter().append('path')
            .attr('class', 'line-path')
            .attr('d', function(d) { return lineGenerator(d.values); })
            .attr('stroke', function(d) { return colorScale(d.key)});
    }

    scope.appendSecondLines = function(svg, nested, colorScale) {
        
        var lineGenerator = d3.line()
                .x(function(d) { return scope.x2Scale(d.timestamp); } )
                .y(function(d) { return scope.y2Scale(d.temperature); } );
            
        svg.selectAll('.line-path').data(nested)
            .enter().append('path')
            .attr('class', 'line-path')
            .attr('d', function(d) { return lineGenerator(d.values); })
            .attr('stroke', function(d) { return colorScale(d.key)});
    }

    scope.appendLegend = function(svg, nested, colorScale) {

        var legend = svg.selectAll('.legend').data(nested)
            .enter().append('g')
            .attr('class', 'legend')
            .attr('transform', function(d, i) { return 'translate(0,' + i * 12 + ')'; });
    
        legend.append('rect')
            .attr('x', scope.cw - 10)
            .attr('y', scope.ch/2 + 55)
            .attr('width', 8)
            .attr('height', 8)
            .attr('fill', function(d) { return colorScale(d.key); });
    
        legend.append('text')
            .attr('x', scope.cw - 2 - 10)
            .attr('y', scope.ch/2 + 55 + 5)
            .attr('dy', '.35em')
            .style('text-anchor', 'end')
            .style('font-size', '10px')
            .text(function(d) { return d.key; });
    
    }

    scope.addZoom = function(svg, focus, ctx) {

        function zoomed() {
            if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'brush') return; // ignore zoom-by-brush

            var t = d3.event.transform;
            var nScaleX2 = t.rescaleX(scope.x2Scale);
            var xAxisGroup = svg.select('.xAxis')
            
            scope.xScale.domain(nScaleX2.domain());

            var lineGenerator = d3.line()
                .x(function(d) { return scope.xScale(d.timestamp); } )
                .y(function(d) { return scope.yScale(d.temperature); } );
            
            focus.selectAll('.line-path')
                .attr('d', function(d) { return lineGenerator(d.values); });        
            
            xAxisGroup.call(scope.xAxis);

            ctx.select('.brush').call(scope.brush.move, scope.xScale.range().map(t.invertX, t));

        }

        scope.zoom = d3.zoom()
            .scaleExtent([1, Infinity])
            .translateExtent([[0,0],[scope.xScale.range()[1], 
               scope.yScale.range()[0]]])
            .extent([[0,0],[scope.xScale.range()[1], 
                scope.yScale.range()[0]]])
            .on('zoom', zoomed);

        svg.append('rect')
            .attr('class', 'zoom')
            .attr('width', scope.cw)
            .attr('height', scope.ch)
            .attr('transform', 'translate('+ scope.margins.left +','+ (scope.ch+scope.margins.top) +')')
            .call(scope.zoom);
    }

    scope.addBrush = function(svg, focus, ctx) {
        
        function brushed() {
            if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'zoom') return; // ignore brush-by-zoom
            if (!d3.event.selection) return; // Ignore empty selections.
            
            var t = d3.event.transform;
            var s = d3.event.selection || scope.x2Scale.range();
            var xAxisGroup = svg.select('.xAxis')

            scope.xScale.domain(s.map(scope.x2Scale.invert, scope.x2Scale));
            
            var lineGenerator = d3.line()
                .x(function(d) { return scope.xScale(d.timestamp); } )
                .y(function(d) { return scope.yScale(d.temperature); } );
            
            focus.selectAll('.line-path')
                .attr('d', function(d) { return lineGenerator(d.values); });   
                
            xAxisGroup.call(scope.xAxis);
            
            svg.select('.zoom').call(scope.zoom.transform, d3.zoomIdentity
                .scale(scope.cw / (s[1] - s[0]))
                .translate(-s[0], 0));

        }

        scope.brush = d3.brushX()
            .extent([[0,0], [scope.xScale.range()[1], 
                scope.y2Scale.range()[0]]])
            
            .on('brush end', brushed);
        
        ctx.append('g')
            .attr('class', 'brush')
            .call(scope.brush)
            .call(scope.brush.move, scope.xScale.range());

    }

    scope.fileCSV = function(file, svg, focus, ctx) {

        d3.csv(file, function(error, data) {
    
            if (error) throw error;
    
            data.forEach(d => {
                d.temperature = +d.temperature;
                d.timestamp = new Date(d.timestamp);
            });
            
            const nested = d3.nest()  
                .key(function(d) { return d.city; })
                .entries(data);
            //console.log(nested);
            
            const colorScale = d3.scaleOrdinal(d3.schemeCategory10)
                .domain(nested.map(function(d) { return d.key; }));
    
            scope.createFirstAxis(svg, data);
            scope.createSecondAxis(svg);
            scope.appendFirstLines(focus, nested, colorScale);
            scope.appendSecondLines(ctx, nested, colorScale);
            if (scope.allowLegend)
                scope.appendLegend(focus, nested, colorScale);
            scope.addBrush(svg, focus, ctx);
        
        })
        
    }
    
    //------------- exported API -----------------------------------
    exports.run = function(div, data) {
        
        scope.div = div;

        var svg = scope.appendSvg(div);
        var focus = scope.appendFocus(svg);
        var context = scope.appendContext(svg);

        scope.fileCSV(data, svg, focus, context);
    }

    return exports;

};
