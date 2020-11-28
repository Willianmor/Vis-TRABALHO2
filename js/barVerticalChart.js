let configBarVertical = {
      div: '#bar_vertical_estados', 
      width: 400, 
      height: 300, 
      top: 30, 
      left: 50, 
      bottom: 10, 
      right: -20
  };

export class BarVertical {
      constructor() {
            this.config = configBarVertical;
            this.svg = null;
            this.data = null;

            this.xScale = null;
            this.yScale = null;
            this.xAxis = null;
            this.yAxis = null;
            this.tooltip = null;

            this.createSvg();
            this.createMargins();
            this. createAxisLabel('Estados', 'Area(km2)', '');
      }

      async setData(data){
            let states = await new Set(d3.map(data, d => d.properties.uf));
            states = Array.from(states);
            let data_ = {};
            // Prencher o dictionario data_ com keys
            for (let i=0; i< states.length; i++) {
                  data_[states[i]] = 0.0;
            }
            // Prencher o dictionario data_ com values
            for (let i=0; i< data.length; i++) {
                  let state_key = data[i].properties.uf;
                  data_[state_key] += data[i].properties.areatotalk;
            }
            // Preencher o this.data
            this.data = [];
            for (let i=0; i< states.length; i++) {
                  this.data.push({
                        cx: states[i],
                        cy: +data_[states[i]]
                  })
            }
            //console.log(this.data);
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

      createTooltip() {
            // Prep the tooltip bits, initial display is hidden
            this.tooltip = this.svg.append("g")
                  .attr("class", "tooltip")
                  .style("display", "none");
            
            this.tooltip.append("rect")
                  .attr("width", 60)
                  .attr("height", 20)
                  .attr("fill", "white")
                  .style("opacity", 0.5);

            this.tooltip.append("text")
                  .attr("x", 30)
                  .attr("dy", "1.2em")
                  .style("text-anchor", "middle")
                  .attr("font-size", "12px")
                  .attr("font-weight", "bold");
      }

      initializeAxis() {
            // Initialize the X axis
            this.xScale = d3.scaleBand()
                  .domain(d3.range(this.data.length))
                  .range([this.config.left, this.config.width - this.config.right])
                  .padding(0.1);
            this.xAxis = this.svg.append("g")
                  .attr("class", "myaxis")
                  .attr("transform", `translate(0,${this.config.height - this.config.bottom})`)

            // Initialize the Y axis
            this.yScale = d3.scaleLinear()
                  .domain([0, d3.max(this.data, d => d.cy)]).nice()
                  .range([this.config.height - this.config.bottom, this.config.top]);
            this.yAxis = this.svg.append("g")
                  .attr("class", "myaxis")
                  .attr("transform", `translate(${this.config.left},0)`);
      }

      createAxisLabel(xAxisLabel, yAxisLabel, title) {
            this.margins
              .append('text')
              .attr('class', 'axis-label')
              .attr('x', -10)
              .attr('y', -10)
              .attr('fill', 'black')
              .attr('text-anchor', 'middle')
              .text(yAxisLabel);
            
            this.margins
              .append('text')
              .attr('class', 'axis-label')
              .attr('y', (this.config.height - 5))
              .attr('x', (this.config.width - this.config.left - this.config.right) / 2)
              .attr('fill', 'black')
              .text(xAxisLabel);
              
            this.margins
              .append('text')
              .attr('class', 'title')
              .attr('y', -10)
              .attr('x', (this.config.width - this.config.left - this.config.right) / 2)
              .text(title);
      }

      updateChart(){
            let innerWidth = this.config.width - this.config.left - this.config.right;
            let innerHeight = this.config.height - this.config.top - this.config.bottom;

            // Update the X axis
            this.xScale.domain(d3.range(this.data.length))
            this.xAxis.call(d3.axisBottom(this.xScale)
                              .tickSize(-innerHeight)
                              .tickPadding(15))
                              .selectAll("text")  
                              .style("text-anchor", "end")
                              .attr("dx", "-.8em")
                              .attr("dy", ".15em")
                              .text(d => this.data[d].cx);

            // Update the Y axis
            this.yScale.domain([0, d3.max(this.data, d => d.cy)]);
            this.yAxis.transition().duration(1000).call(d3.axisLeft(this.yScale)
                                                            .tickSize(-innerWidth)
                                                            .tickPadding(10));

            //this.createTooltip();
            // Create the u variable
            let u = this.svg.selectAll("rect")
                  .data(this.data)

            u.enter()
                  .append("rect") // Adicione um novo rect para cada novo elemento
                  .attr('class', 'mybar')
                        .on("click", function(event, d) {
                              console.log(d); 
                              console.log(d3.pointer(event));
                        })
                        .on("mouseover", function(e, d) { 
                              let xPosition = d3.pointer(e)[0] - 5;
                              //let yPosition = d3.pointer(e)[1] - 5;
                              
                              this.svg.append("text")
                                    .attr('class', 'val') // add class to text label
                                    .style("text-anchor", "middle")
                                    .attr("font-size", "11px")
                                    .attr("font-weight", "bold")
                                    .attr('x', () => xPosition)
                                    .attr('y', () => this.yScale(d.cy) - 5)
                                    .text(() => d.cy.toLocaleString());
                        }.bind(this))
                        .on("mouseout", function(e, d){ 
                              //d3.select('.mybar').attr("opacity", 0.5); 
                              d3.selectAll('.val').remove();
                        }.bind(this))
                  .merge(u) // obter os elementos já existentes também
                  .transition() // e aplicar mudanças a todos eles
                  .duration(1500)
                        .attr("x", (d, i) => this.xScale(i))
                        .attr("y", d => this.yScale(d.cy))
                        .attr("width", this.xScale.bandwidth())
                        .attr("height", d => this.yScale(0) - this.yScale(d.cy))
                        .attr("fill", "#69b3a2")

            // Se houver menos grupo no novo conjunto de dados, excluo aqueles que não estão mais em uso
            u.exit().remove()
      }
}