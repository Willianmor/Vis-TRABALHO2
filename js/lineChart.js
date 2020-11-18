export class lineChart{
    constructor(config) {
        this.config = config;

        this.svg = null;
        this.margins = null;
  
        this.xScale = undefined;
        this.x2Scale = undefined;
        
        this.yScale = undefined;
        this.y2Scale = undefined;

        this.xAxis = undefined;
        this.x2Axis = undefined;

        this.zoom = undefined;
        this.brush = undefined;

        this.allowLegend = true;
        this.nested = true;
        this.colorScale = undefined;

    }

    createSvg() {
        this.svg = d3.select(this.config.div)
            .append("svg")
            .attr('id', 'svg')
            .attr('x', 10)
            .attr('y', 10)
            .attr('width', this.config.width + this.config.left + this.config.right)
            .attr('height', this.config.height + this.config.top + this.config.bottom)
            .attr('class', 'card');
    }

    appendFocus() {

        this.focus = this.svg.append('g')
            .attr('width', this.config.width)
            .attr('height', this.config.height)
            .attr('class', 'focus')
            .attr('transform', 'translate(' + this.config.left + ',' + this.config.top + ')');
        
            return this.focus;
        
    }

    appendContext(){

        this.context = this.svg.append('g')
            .attr('width', this.config.width)
            .attr('height', this.config.height2)
            .attr('class', 'context')
            .attr('transform', 'translate(' + this.config.left + ',' + this.config.top2 + ')');
        
        return this.context;
    }

   createFirstAxis () {
        
        this.xScale = d3.scaleTime()
            .domain(d3.extent(data, function(d) {
                return new Date(d.timestamp); }))
            .range([0, this.config.width]).nice();
            
        this.yScale = d3.scaleLinear()
            .domain(d3.extent([0, d3.max(data, function(d) {
                return parseFloat(d.temperature); })]))
            .range([this.config.height,0]).nice();
            
        this.xAxisGroup = this.svg.append('g')
            .attr('class', 'xAxis')
            .attr('transform', 'translate('+ this.config.left +','+ (this.config.height + this.config.top) +')');
            
        this.yAxisGroup = this.svg.append('g')
            .attr('class', 'yAxis')
            .attr('transform', 'translate('+ this.config.left +','+ this.config.top +')');

        this.xAxis = d3.axisBottom(this.xScale)
            .tickSize(-(this.config.height))
            .tickPadding(10);
        
        this.yAxis = d3.axisLeft(this.yScale)
            .tickSize(-(this.config.width))
            .tickPadding(10);
    
        this.xAxisGroup.call(this.xAxis)
            
        this.yAxisGroup.call(this.yAxis)
            .append('text')
            .attr('class', 'axisLabel')
            .attr('y', -28)//-28
            .attr('x', -0.4*this.config.height)//-170
            .attr('transform', 'rotate(-90)')
            .text('Temperature (°C)');
            
    }

    createSecondAxis () {
        
        this.x2Scale = d3.scaleTime()
            .domain(this.xScale.domain())
            .range([0, this.config.width]).nice();
            
        this.y2Scale = d3.scaleLinear()
            .domain(this.yScale.domain())
            .range([this.config.height2,0]).nice();
            
        this.x2AxisGroup = svg.append('g')
            .attr('class', 'xAxis')
            .attr('transform', 'translate('+ this.config.left2 +','+ (this.config.height2 + this.config.top2) +')');

        this.x2Axis = d3.axisBottom(this.x2Scale)
    
        this.x2AxisGroup.call(this.x2Axis)

            
    }

    appendFirstLines () {
        
        var lineGenerator = d3.line()
                .x(function(d) { return this.xScale(d.timestamp); } )
                .y(function(d) { return this.yScale(d.temperature); } );
            
        this.svg.selectAll('.line-path').data(this.nested)
            .enter().append('path')
            .attr('class', 'line-path')
            .attr('d', function(d) { return lineGenerator(d.values); })
            .attr('stroke', function(d) { return this.colorScale(d.key)});
    }

    appendSecondLines() {
        
        var lineGenerator = d3.line()
                .x(function(d) { return this.x2Scale(d.timestamp); } )
                .y(function(d) { return this.y2Scale(d.temperature); } );
            
        this.svg.selectAll('.line-path').data(this.nested)
            .enter().append('path')
            .attr('class', 'line-path')
            .attr('d', function(d) { return lineGenerator(d.values); })
            .attr('stroke', function(d) { return this.colorScale(d.key)});
    }

    appendLegend () {

        var legend = this.svg.selectAll('.legend').data(this.nested)
            .enter().append('g')
            .attr('class', 'legend')
            .attr('transform', function(d, i) { return 'translate(0,' + i * 12 + ')'; });
    
        legend.append('rect')
            .attr('x', this.config.width - 10)
            .attr('y', this.config.height/2 + 55)
            .attr('width', 8)
            .attr('height', 8)
            .attr('fill', function(d) { return colorScale(d.key); });
    
        legend.append('text')
            .attr('x', this.config.width - 2 - 10)
            .attr('y', this.config.height/2 + 55 + 5)
            .attr('dy', '.35em')
            .style('text-anchor', 'end')
            .style('font-size', '10px')
            .text(function(d) { return d.key; });
    
    }

    addZoom () {

        function zoomed() {
            if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'brush') return; // ignore zoom-by-brush

            var t = d3.event.transform;
            var nScaleX2 = t.rescaleX(this.x2Scale);
            var xAxisGroup = svg.select('.xAxis')
            
            this.xScale.domain(nScaleX2.domain());

            var lineGenerator = d3.line()
                .x(function(d) { return this.xScale(d.timestamp); } )
                .y(function(d) { return this.yScale(d.temperature); } );
            
            focus.selectAll('.line-path')
                .attr('d', function(d) { return lineGenerator(d.values); });        
            
            xAxisGroup.call(this.xAxis);

            ctx.select('.brush').call(this.brush.move, this.xScale.range().map(t.invertX, t));

        }

        this.zoom = d3.zoom()
            .scaleExtent([1, Infinity])
            .translateExtent([[0,0],[this.xScale.range()[1], 
               this.yScale.range()[0]]])
            .extent([[0,0],[this.xScale.range()[1], 
                this.yScale.range()[0]]])
            .on('zoom', zoomed);

        this.svg.append('rect')
            .attr('class', 'zoom')
            .attr('width', this.config.width)
            .attr('height', this.config.height)
            .attr('transform', 'translate('+ this.config.left +','+ (this.config.height+this.config.top) +')')
            .call(this.zoom);
    }

    addBrush() {
        
        function brushed() {
            if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'zoom') return; // ignore brush-by-zoom
            if (!d3.event.selection) return; // Ignore empty selections.
            
            var t = d3.event.transform;
            var s = d3.event.selection || this.x2Scale.range();
            var xAxisGroup = svg.select('.xAxis')

            this.xScale.domain(s.map(this.x2Scale.invert, this.x2Scale));
            
            var lineGenerator = d3.line()
                .x(function(d) { return this.xScale(d.timestamp); } )
                .y(function(d) { return this.yScale(d.temperature); } );
            
            focus.selectAll('.line-path')
                .attr('d', function(d) { return lineGenerator(d.values); });   
                
            xAxisGroup.call(this.xAxis);
            
            svg.select('.zoom').call(this.zoom.transform, d3.zoomIdentity
                .scale(this.config.width / (s[1] - s[0]))
                .translate(-s[0], 0));

        }

        this.brush = d3.brushX()
            .extent([[0,0], [this.xScale.range()[1], 
                this.y2Scale.range()[0]]])
            
            .on('brush end', brushed);
        
        ctx.append('g')
            .attr('class', 'brush')
            .call(this.brush)
            .call(this.brush.move, this.xScale.range());

    }

    
    // scope.fileCSV = function(file, svg, focus, ctx) {

    //     d3.csv(file, function(error, data) {
    
    //         if (error) throw error;
    
    //         data.forEach(d => {
    //             d.temperature = +d.temperature;
    //             d.timestamp = new Date(d.timestamp);
    //         });
            
    //         const nested = d3.nest()  
    //             .key(function(d) { return d.city; })
    //             .entries(data);
    //         console.log(nested);
            
    //         const colorScale = d3.scaleOrdinal(d3.schemeCategory10)
    //             .domain(nested.map(function(d) { return d.key; }));
    
    //         scope.createFirstAxis(svg, data);
    //         scope.createSecondAxis(svg);
    //         scope.appendFirstLines(focus, nested, colorScale);
    //         scope.appendSecondLines(ctx, nested, colorScale);
    //         if (scope.allowLegend)
    //             scope.appendLegend(focus, nested, colorScale);
    //         scope.addBrush(svg, focus, ctx);
        
    //     })
        
    // }
    
    // ------------- exported API -----------------------------------
    // exports.run = function(div, data) {
        
    //     scope.div = div;

    //     var svg = scope.appendSvg(div);
    //     var focus = scope.appendFocus(svg);
    //     var context = scope.appendContext(svg);

    //     scope.fileCSV(data, svg, focus, context);
    // }

    // return exports;

}
