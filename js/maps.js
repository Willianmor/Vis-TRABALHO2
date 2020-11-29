// https://www.d3-graph-gallery.com/graph/bubblemap_basic.html
// https://codepen.io/ssz360/pen/jOPMwme
//uncomment  ctr+k+u
//comment  ctr+k+c

import {showMessage, getCoresDesmatamento, sortByDate, filterByState, globalValues} from './utils.js'

let confsvg = {
    div: '#main', 
    width: 600, 
    height: 600, 
    top: 30, 
    left: 10, 
    bottom: 30, 
    right: 30
};

export class Maps {
    constructor() {
        this.config = confsvg;
        this.svg = null;

        this.x0 = null;
        this.y0 = null;
        this.xScale = null;
        this.yScale = null;
        this.xAxis = null;
        this.yAxis = null;

        this.center_map = [-57.82134,-5.15357];
        this.scale = 1500;
        this.projection = null;
        this.path = null;
        this.data = null;
        this.dataGeo = null;
        this.zoom =null;

        // Test Brush
        this.brush = null;
        this.idleTimeout;
        this.idleDelay = 350;
        this.colorStrokeBase = '#b8b8b8';

        this.createSvg();
    }

    initData(data, dataGeo) {
        this.data = data;
        this.dataGeo = dataGeo;
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

    async loadData(myfile) {
        showMessage('div.load_data', 1500);
        let [dataGeo, dataDesmatamento] = await Promise.all([
                d3.json('../assets/dataset/EstadosBR_IBGE_LLWGS84.geojson'),
                d3.json(myfile),
                ])
                
        this.data = dataDesmatamento.features;
        sortByDate(this.data);
        this.dataGeo = dataGeo;
    }
    async setData(data) {
        this.data = data
    }

    render() {
        // Map and projection
        let projection = d3.geoMercator()
                            .rotate([0,0])
                            .center(this.center_map)      // GPS of location to zoom on
                            .scale(this.scale)                       // This is like the zoom
                            .translate([ this.config.width/2, this.config.height/2 ])
        this.path = d3.geoPath()
                    .projection(projection);
        
        // Draw the map
        this.svg.append("g")
                .selectAll("path")
                .data(this.dataGeo.features)
                .enter().append("path")
                    .attr("fill", "#b8b8b8")
                    .attr("d", this.path)
                    .style("stroke", "black")
                    .style("opacity", .3);

        // Add data de quemadas
        // Filter data
        //let data_filter = this.data.filter( d =>  d.properties.uf=="MT" );
        this.svg.selectAll("myPath")
                .data(this.data)
                .enter()
                .append("path")
                    .attr('class','desmatamento')
                    .attr("fill", "#b8b8b8")
                    .attr("d", this.path)
                    .style("stroke", this.colorStrokeBase)
                    .style("stroke-width", 3)
                    .style("opacity", .7);
        
        this.svg.call(d3.zoom()
            .scaleExtent([0.5, 18])
            //.translateExtent([[0,0], [this.config.width, this.config.height]])
            //.extent([[0, 0], [this.config.width, this.config.height]])
            .on('zoom', function(event) {
                this.svg.selectAll("path")
                        .attr("transform", event.transform);
                //console.log('zoom:', d3.event.transform);
            }.bind(this)));

        this.svg.exit().remove();
    }

    updateMapa() {
        let parseDate = d3.timeParse("%Y/%m/%d");
        let cors_dematamento = globalValues.cor_desmatamento;
        let color  = (d) => {
            if (
                new Date(parseDate(d.properties.date)).getTime() > globalValues.filtro_date_ini &&
                new Date(parseDate(d.properties.date)).getTime() < globalValues.filtro_date_fin && 
                filterByState(d.properties.uf, globalValues.filtro_estado)
            ) {
                if(d.properties.classname===globalValues.class_quemadas[0])
                    return cors_dematamento[0];
                if(d.properties.classname===globalValues.class_quemadas[1])
                    return cors_dematamento[1];
                if(d.properties.classname===globalValues.class_quemadas[2])
                    return cors_dematamento[2];
                if(d.properties.classname===globalValues.class_quemadas[3])
                    return cors_dematamento[3];
                if(d.properties.classname===globalValues.class_quemadas[4])
                    return cors_dematamento[4];
                if(d.properties.classname===globalValues.class_quemadas[5])
                    return cors_dematamento[5];
                if(d.properties.classname===globalValues.class_quemadas[6])
                    return cors_dematamento[6];
                else{
                    return this.colorStrokeBase;
                }
            }else {
                return this.colorStrokeBase;
            }
        }

        this.svg.selectAll('.desmatamento')
            .style('stroke', color);
    }

}