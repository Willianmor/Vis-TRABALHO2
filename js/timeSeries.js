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

          this.xScale = null;
          this.yScale = null;
          this.xAxis = null;
          this.yAxis = null

          this.createSvg();
    }

    createSvg() {
        this.svg = d3.select(confTimeSeries.div)
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

        // this.data = await d3.csv("https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/3_TwoNumOrdered_comma.csv", d => {
        //     return {
        //         cx : d3.timeParse("%Y-%m-%d")(d.date), cy : d.value
        //     }});

        //this.data = this.data.slice(0, 1000);
        //console.log(this.data);
    }

    initializeAxis() {
        // Add X axis --> it is a date format
        this.xScale = d3.scaleTime()
            .domain(d3.extent(this.data, d => d.cx))
            .range([this.config.left, this.config.width - this.config.right]);
        this.xAxis = this.svg.append("g")
            .attr("transform", `translate(0,${this.config.height - this.config.bottom})`)
            .call(d3.axisBottom(this.xScale));

        // Add Y axis
        this.yScale = d3.scaleLinear()
            .domain([0, d3.max(this.data, d => d.cy)])
            .range([this.config.height - this.config.bottom, this.config.top]);
        this.yAxis = this.svg.append("g")
            .attr("transform", `translate(${this.config.left},0)`)
            .call(d3.axisLeft(this.yScale));
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