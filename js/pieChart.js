import {getCoresDesmatamento} from './utils.js';

let configBarVertical = {
    div: '#pie_clase_desmatamento', 
    width: 400, 
    height: 300, 
    top: 10, 
    left: 30, 
    bottom: 30, 
    right: 0
};

export class PieChart {
    constructor() {
          this.config = configBarVertical;
          this.svg = null;
          this.data = null;

          this.class_quemadas = null;

          this.createSvg();
    }

    createSvg() {
        this.svg = d3.select(this.config.div)
        .append("svg")
            .attr("viewBox", [-this.config.width / 2 +30, -this.config.height / 2 -10, this.config.width, this.config.height])
            .attr("font-family", "sans-serif")
            .attr("font-size", 12)
            .attr("text-anchor", "middle");
  }

  async setData(data) {
    if (this.class_quemadas == null){
        this.class_quemadas = await new Set(d3.map(data, d => d.properties.classname));
        this.class_quemadas = Array.from(this.class_quemadas);
    }
    let data_ = {};
    // Prencher o dictionario data_ com keys
    for (let i=0; i< this.class_quemadas.length; i++) {
            data_[this.class_quemadas[i]] = 0.0;
    }
    // Prencher o dictionario data_ com values
    for (let i=0; i< data.length; i++) {
        let my_key = data[i].properties.classname;
        data_[my_key] += data[i].properties.areatotalk;
    }
    // Preencher o this.data
    this.data = [];
    for (let i=0; i< this.class_quemadas.length; i++) {
          this.data.push({
                name: this.class_quemadas[i],
                value: +data_[this.class_quemadas[i]]
          })
    }
  }

  appendLegend() {

	let color = d3.scaleOrdinal()
        .domain(this.data.map(d => d.name))
        .range(getCoresDesmatamento())
	
	let legend = this.svg.selectAll('.legend').data(this.data)
		.enter().append('g')
		.attr('class', 'legend')
		.attr('transform', (d, i) => 'translate(0,' + i * 12 + ')');

	legend.append('rect')
		.attr('x', this.config.width/2 +10 +5)
		.attr('y', -this.config.width/2 + 50 - 5)
		.attr('width', 8)
		.attr('height', 8)
		.attr('fill', d => color(d.name));

	legend.append('text')
		.attr('x', this.config.width/2 +10)
		.attr('y', -this.config.width/2 + 50)
		.attr('dy', '.35em')
		.style('text-anchor', 'end')
		.style('font-size', '10px')
		.text(d => d.name); 
 }

  updateChart() {
    // set the color scale
    let color = d3.scaleOrdinal()
        .domain(this.data.map(d => d.name))
        .range(getCoresDesmatamento())
        //.range(d3.quantize(t => d3.interpolateSpectral(t * 0.8 + 0.1), this.data.length).reverse())
    //console.log(d3.quantize(t => d3.interpolateSpectral(t * 0.8 + 0.1), this.data.length).reverse())

    let arc = d3.arc()
        .innerRadius(0)
        .outerRadius(Math.min(this.config.width, this.config.height) / 2.5 - 1);
    
    let arcLabel = d3.arc().innerRadius(Math.min(this.config.width, this.config.height) / 2.5 * 0.8).
                            outerRadius(Math.min(this.config.width, this.config.height) / 2.5 * 0.8);
    
    let pie = d3.pie()
        .sort(null)
        .value(d => d.value);
    let arcs = pie(this.data);

    // Pie Chart
    this.svg.append("g")
        .attr("stroke", "white")
        .selectAll("path")
            .data(arcs)
            .join("path")
            .attr('class', 'mypie')
            .attr("fill", d => color(d.data.name))
            .attr("d", arc)
            .append("title")
            .text(d => `${d.data.name}: ${d.data.value.toLocaleString()}`);
    // Labels
    this.svg.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 12)
        .attr("text-anchor", "middle")
        .selectAll("text")
        .data(arcs)
        .join("text")
        .attr("transform", d => `translate(${arcLabel.centroid(d)})`)
        // .call(text => text.append("tspan")
        //     .attr("y", "-0.4em")
        //     .attr("font-weight", "bold")
        //     .text(d => d.data.name))
        .call(text => text.filter(d => (d.endAngle - d.startAngle) > 0.25).append("tspan")
            .attr("x", 0)
            .attr("y", "0.7em")
            .attr("fill-opacity", 0.7)
            .text(d => d.data.value.toLocaleString()));
    
    this.appendLegend()
    // let u = this.svg.selectAll("text")
    //     .data(arcs)

    // u.enter()
    //     .append("text")
    //     .merge(u)
    //     .attr("transform", d => `translate(${arcLabel.centroid(d)})`)
    //     .call(text => text.append("tspan")
    //         .attr("y", "-0.4em")
    //         .attr("font-weight", "bold")
    //         .text(d => d.data.name))
    //     .call(text => text.filter(d => (d.endAngle - d.startAngle) > 0.25).append("tspan")
    //         .attr("x", 0)
    //         .attr("y", "0.7em")
    //         .attr("fill-opacity", 0.7)
    //         .text(d => d.data.value.toLocaleString()));
    // u.exit().remove()
  }

}