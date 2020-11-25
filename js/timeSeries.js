import { BarVertical } from './barVerticalChart.js';
import { Maps } from './maps.js';
import {formattedDate, fillOptionsSelect, showMessage} from './utils.js'

let confTimeSeries = {
    div: '#time_series', 
    width: 1000, 
    height: 70, 
    top: 10, 
    left: 30, 
    bottom: 30, 
    right: 0
};

// LEER: D3 6.0 migration guide
// https://observablehq.com/@d3/d3v6-migration-guide
export class TimeSeries {
    constructor() {
          this.data = null;
          this.config = confTimeSeries;

          this.svg = null;

          this.data_origin = null;
          this.bar_vertical_states = null;
          this.mapa = new Maps();

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
        this.data_origin = data;

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
        
        let parseDate = d3.timeParse("%Y/%m/%d");
        // Brush
        let brush = d3.brushX()
            .extent([
                [0, 0],
                [this.config.width, this.config.height]
            ]).on("end", function(event) { // 'brush end'
                if (!event.sourceEvent) return; // Only transition after input.
                if (!event.selection) return; // Ignore empty selections.
                
                let s = event.selection;
                let s_selection = s.map(x.invert, x);

                let filter_date = this.data_origin.filter( d =>  new Date(parseDate(d.properties.date)).getTime() > new Date(s_selection[0]).getTime() &&
                                                    new Date(parseDate(d.properties.date)).getTime() < new Date(s_selection[1]).getTime() );
                
                $('#date_ini').html(formattedDate(new Date(s_selection[0])));
                $('#date_fin').html(formattedDate(new Date(s_selection[1])));

                this.updateBarVertical(filter_date);
                this.updateMapa(s_selection);
            }.bind(this));
        this.svg.append("g")
                .attr("class", "brush")
                .call(brush);
                
    }

    loadFilters() {
        let parseDate = d3.timeParse("%Y/%m/%d");
        let optionAnos = new Set(d3.map(this.data_origin, d => new Date(parseDate(d.properties.date)).getFullYear()));
        fillOptionsSelect('filtro_estados', optionAnos);

        // let test = new Set(d3.map(this.data, d => d.properties.classname));
        $('#date_ini').html(formattedDate(new Date(parseDate(this.data_origin[0].properties.date))));
        $('#date_fin').html(formattedDate(new Date(parseDate(this.data_origin[this.data_origin.length-1].properties.date))));
        showMessage('div.render_data', 1500); 
    }

    // ================================== Mapa ================================
    createMapa(dataDesmatamento, dataGeo) {
        this.mapa.initData(dataDesmatamento, dataGeo);
        this.mapa.render();
        this.loadFilters();
    }

    updateMapa(s_selection) {
        //this.mapa.setData(filter_date);
        this.mapa.updateMapa(s_selection);
    }

    // ================================== Bar-Vertical Chart (Filtro Estados) ================================
    async createBarVertical() {
        this.bar_vertical_states = new BarVertical();
        await this.bar_vertical_states.setData(this.data_origin);
        this.bar_vertical_states.initializeAxis();
        this.bar_vertical_states.updateChart();
    }
    async updateBarVertical(filter_date) {
        await this.bar_vertical_states.setData(filter_date);
        this.bar_vertical_states.updateChart();
        // console.log(filter_date);
    }
}