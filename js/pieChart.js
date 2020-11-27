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
            .attr("viewBox", [-this.config.width / 2, -this.config.height / 2, this.config.width, this.config.height]);
  }

  async setData(data) {
    this.class_quemadas = await new Set(d3.map(data, d => d.properties.classname));
    this.class_quemadas = Array.from(this.class_quemadas);
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

  updateChart() {
    // set the color scale
    let color = d3.scaleOrdinal()
        .domain(this.data.map(d => d.name))
        .range(getCoresDesmatamento())
        //.range(d3.quantize(t => d3.interpolateSpectral(t * 0.8 + 0.1), this.data.length).reverse())
    //console.log(d3.quantize(t => d3.interpolateSpectral(t * 0.8 + 0.1), this.data.length).reverse())

    let arc = d3.arc()
        .innerRadius(0)
        .outerRadius(Math.min(this.config.width, this.config.height) / 2 - 1)
    // let arcLabel = {
    //     let radius = Math.min(width, height) / 2 * 0.8;
    //     return d3.arc().innerRadius(radius).outerRadius(radius);
    //   }
    let pie = d3.pie()
        .sort(null)
        .value(d => d.value);
    let arcs = pie(this.data);

    // Create the u variable
    // let u = this.svg.attr("stroke", "white")
    //         .selectAll("path")
    //         .data(arcs)
    // u.enter()
    //         .append("path") // Adicione um novo rect para cada novo elemento
    //         .merge(u) // obter os elementos já existentes também
    //         .transition() // e aplicar mudanças a todos eles
    //         .duration(1500)
    //         .attr("fill", d => color(d.data.name))
    //         .attr("d", arc)
    //         .append("title")
    //         .text(d => `${d.data.name}: ${d.data.value.toLocaleString()}`)
    // u.exit().remove()

    this.svg.append("g")
        .attr("stroke", "white")
        .selectAll("path")
            .data(arcs)
            .join("path")
            .attr("fill", d => color(d.data.name))
            .attr("d", arc)
            .append("title")
            .text(d => `${d.data.name}: ${d.data.value.toLocaleString()}`);
    
  }

}