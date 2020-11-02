export class Maps {
    constructor(config) {
        this.config = config;

        this.svg = null;
        this.margins = null;

        this.xScale = null;
        this.yScale = null;

        this.projection = null;
        this.path = null;
        this.ids = null;

        this.createSvg();
        this.createMargins();
        }

    createSvg() {
        this.svg = d3.select(this.config.div)
            .append("svg")
            .attr('id', 'svg')
            .attr('x', 10)
            .attr('y', 10)
            .attr('width', this.config.width + this.config.left + this.config.right)
            .attr('height', this.config.height + this.config.top + this.config.bottom);
    }

    createMargins() {
        this.margins = this.svg
            .append('g')
            .attr("transform", `translate(${this.config.left},${this.config.top})`)
    }

    createAxisLabel(xAxisLabel, yAxisLabel) {
        this.margins
          .append('text')
          .attr('class', 'axis-label')
          .attr('x', -(this.config.height - this.config.top - this.config.bottom) / 2)
          .attr('y', -(this.config.left) / 2)
          .attr('fill', 'black')
          .attr('transform', `rotate(-90)`)
          .attr('text-anchor', 'middle')
          .text(yAxisLabel);
        
        this.margins
          .append('text')
          .attr('class', 'axis-label')
          .attr('y', (this.config.height + 10))
          .attr('x', (this.config.width - this.config.left - this.config.right) / 2)
          .attr('fill', 'black')
          .text(xAxisLabel);
          
    }

    //Construção do mapa - projeção
    buildMapMercator(data_features) {      
        //console.log("dados ID",this.ids)   
        this.projection = d3.geoMercator()
            .scale(8000)
            .rotate([0,0])
            .center([-57.82134,-5.15357])
            .translate([this.config.width / 2.4, this.config.height / 2]);

        this.path = d3.geoPath()
            .projection(this.projection);

        this.ids = data_features.map(function(d) { return d.properties.gid})
        console.log(this.ids[0]);
        this.svg.selectAll("path")
            .data(data_features)
            .enter()
            .append("path")
            .attr("id", function(d,i) { return this.ids[i]})
            .attr("d", this.path)
            .style("stroke", "#fff")
            .style("stroke-width", "1");
            //.style("fill", (d) => {return this.colorscalemap(d.properties.value)});
    }

}