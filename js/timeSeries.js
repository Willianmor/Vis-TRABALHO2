let confTimeSeries = {
    div: '#time_series', 
    width: 600, 
    height: 100, 
    top: 10, 
    left: 30, 
    bottom: 30, 
    right: 0
};

export class TimeSeries {
    constructor(data) {
          this.data = null;
          this.config = confTimeSeries;

          this.svg = null;

          this.createSvg();
    }

    createSvg() {
        this.svg = d3.select(this.config.div)
            .append("svg")
            .attr('id', 'svg')
            .attr('x', 10)
            .attr('y', 10)
            .attr('width', this.config.width + this.config.left + this.config.right)
            .attr('height', this.config.height + this.config.top + this.config.bottom)
            .append('g')
            .attr("transform", `translate(${this.config.left},${this.config.top})`);
    }

    async setData(data) {
        let parseDate = d3.timeParse("%Y/%m/%d");
        this.data = await d3.map(data, function(d) {
            return {
                cx: parseDate(d.properties.date),
                cy: +d.properties.areatotalk,
            }
        });
    }

    updateChart(){
        // Add X axis --> it is a date format
        let x = d3.scaleTime()
            .domain(d3.extent(this.data, d => d.cx))
            .range([ 0, this.config.width ]);
        this.svg.append("g")
            .attr("transform", "translate(0," + this.config.height + ")")
            .call(d3.axisBottom(x));

        // Add Y axis
        var y = d3.scaleLinear()
            .domain([0, d3.max(this.data, d => +d.cy)])
            .range([ this.config.height, 0 ]);
        this.svg.append("g")
            .call(d3.axisLeft(y));

        // Add the area
        this.svg.append("path")
            .datum(this.data)
            .attr("fill", "#cce5df")
            .attr("stroke", "#69b3a2")
            .attr("stroke-width", 1.5)
            .attr("d", d3.area()
            .x(function(d) { return x(d.cx) })
            .y0(y(0))
            .y1(function(d) { return y(d.cy) })
        );
                
    }
}