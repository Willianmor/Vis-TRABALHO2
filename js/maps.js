// https://www.d3-graph-gallery.com/graph/bubblemap_basic.html
// https://codepen.io/ssz360/pen/jOPMwme
//uncomment  ctr+k+u
//comment  ctr+k+c

import {showMessage, fillOptionsSelect, sortByDate} from './utils.js'

export class Maps {
    constructor(config) {
        this.config = config;
        this.svg = null;

        this.x0 = null;
        this.y0 = null;
        this.xScale = null;
        this.yScale = null;
        this.xAxis = null;
        this.yAxis = null;

        this.center_map = [-57.82134,-5.15357];
        this.scale = 1000;
        this.projection = null;
        this.path = null;
        this.data = null;
        this.dataGeo = null;
        this.zoom =null;

        // Test Brush
        this.brush = null;
        this.idleTimeout;
        this.idleDelay = 350;

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
            .attr('class', 'card');
    }

    // LEER: https://stackoverflow.com/questions/33087405/using-queue-to-load-multiple-files-and-assign-to-globals
    async render_deprecated(myfile) {
        // Map and projection
        let center_map = [-57.82134,-5.15357]
        let projection = d3.geoMercator()
                            .rotate([0,0])
                            .center(center_map)      // GPS of location to zoom on
                            .scale(2000)                       // This is like the zoom
                            .translate([ this.config.width/2, this.config.height/2 ])
        this.path = d3.geoPath()
                    .projection(projection);

        this.x0 = [-7.5, -9];
        this.y0 = [ -75,-74];
        this.scale_acum = 1.2;

        this.xScale = d3.scaleLinear().domain(this.x0).range([0, this.config.width]);
        this.yScale = d3.scaleLinear().domain(this.y0).range([this.config.height, 0]);
        // LIMITES MAP: Y [ -75,-74] , X [-7.5, -9]
        // this.brush = d3.brush().on("end", function() {
        //     let s = d3.event.selection;
        //     if (!s) {
        //         if (!this.idleTimeout) return this.idleTimeout = setTimeout(function() {
        //             this.idleTimeout = null; // necesario
        //         }.bind(this), this.idleDelay);
        //         this.xScale.domain(this.x0);
        //         this.yScale.domain(this.y0);

        //         // this.zoom();
        //         let t = this.svg.transition().duration(750);
        //         this.svg.selectAll("path").transition(t)
        //         .attr("transform", "scale(1.0)");
        //     } else {
        //         this.xScale.domain([s[0][0], s[1][0]].map(this.xScale.invert, this.xScale));
        //         this.yScale.domain([s[1][1], s[0][1]].map(this.yScale.invert, this.yScale));
        //         this.svg.select(".brush").call(this.brush.move, null);

        //         // this.zoom();
        //         let t = this.svg.transition().duration(750);
        //         // distancia base
        //         let dist_base = dist(0,0, this.config.width, this.config.height);
        //         let dist_brush = dist(s[0][0], s[1][1], s[1][0], s[0][1]);
        //         let scale_ = dist_brush*1.0 / dist_base;
        //         let real_scale = 1.0 / scale_;
        //         let cx_ = s[0][0] + (s[1][0]-s[0][0])/2.0;
        //         let cy_ = s[1][1] + (s[0][1]-s[1][1])/2.0;

        //         let offsetX = cx_ + this.config.width/2;
        //         let offsetY = cy_ + this.config.height/2;
        //         this.scale_acum = real_scale;
        //         // set center
        //         // translate, acumular -s e escala
        //         this.svg.selectAll("path").transition(t)
        //         .attr("transform", 
        //         `translate(${offsetX}, ${offsetY}) 
        //         scale(${this.scale_acum}) 
        //         translate(${-offsetX}, ${-offsetY})`);
                
        //         // translate(${-s[0][0] + this.config.left}, ${-s[1][1] + this.config.top}) scale(${real_scale})
        //         console.log('2:', real_scale);//.map(this.xScale.invert, this.xScale));  translate(${this.config.width/2 - cx_}, ${this.config.height/2 - cy_}) 
        //     }
            
        // }.bind(this)
        // );

        this.svg.call(d3.zoom()
                .scaleExtent([0.5, 18])
                //.translateExtent([[0,0], [this.config.width, this.config.height]])
                //.extent([[0, 0], [this.config.width, this.config.height]])
                .on('zoom', function() {
                    this.svg.selectAll("path")
                            .attr("transform", d3.event.transform);
                    //console.log('zoom:', d3.event.transform);
                }.bind(this)));


        // Load external data and boot "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"
        await d3.json(myfile, function(data){

            // Filter data
            //data.features = data.features.filter( function(d){return d.properties.uf=="AM"} )
            this.data = data;
            // Draw the map
            this.svg.append("g")
                .selectAll("path")
                .data(data.features)
                .enter()
                .append("path")
                .attr("fill", "#b8b8b8")
                .attr("d", this.path)
                .style("stroke", "red")
                .style("opacity", .3);

            // this.svg.append("g")
            //         .attr("class", "brush")
            //         .call(this.brush);
            this.svg.exit().remove();

            console.log('termino?', this.data);
        }.bind(this));

        

        // await d3.json('../assets/dataset/EstadosBR_IBGE_LLWGS84.geojson', function(data){

        //     // Filter data
        //     //this.data = data;
        //     //data.features = data.features.filter( function(d){return d.properties.ESTADO=="RR"} )
        //     // Draw the map
        //     this.svg.append("g")
        //         .selectAll("path")
        //         .data(data.features)
        //         .enter()
        //         .append("path")
        //         .attr("fill", "#b8b8b8")
        //         .attr("d", this.path)
        //         .style("stroke", "black")
        //         .style("opacity", .3);
        //     this.svg.exit().remove()
        // }.bind(this));


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
        let data_filter = this.data.filter( d =>  d.properties.uf=="AM" );
        this.svg.selectAll("myPath")
                .data(data_filter)
                .enter()
                .append("path")
                    .attr("fill", "#b8b8b8")
                    .attr("d", this.path)
                    .style("stroke", "red")
                    .style("opacity", .3);
            
        this.svg.exit().remove();

        showMessage('div.render_data', 1500); 

    }

    loadFilters() {
        let optionsStates = new Set(d3.map(this.data, d => d.properties.uf));
        fillOptionsSelect('filtro_estados', optionsStates);
    }

    // Test
    test_brush() {
        // criar data
        let random = d3.randomNormal(0, 0.2),
            sqrt3 = Math.sqrt(3),
            points0 = d3.range(300).map(function() { return [random() + sqrt3, random() + 1, 0]; }),
            points1 = d3.range(300).map(function() { return [random() - sqrt3, random() + 1, 1]; }),
            points2 = d3.range(300).map(function() { return [random(), random() - 1, 2]; }),
            points = d3.merge([points0, points1, points2]);

        let k = this.config.height / this.config.width;
        this.x0 = [-4.5, 4.5];
        this.y0 = [-4.5 * k, 4.5 * k];
        console.log(this.x0, this.y0);
        this.xScale = d3.scaleLinear().domain(this.x0).range([0, this.config.width]);
        this.yScale = d3.scaleLinear().domain(this.y0).range([this.config.height, 0]);
        let z = d3.scaleOrdinal(d3.schemeCategory10);

        console.log('1:',this.xScale);

        this.xAxis = d3.axisTop(this.xScale).ticks(12);
        this.yAxis = d3.axisRight(this.yScale).ticks(12 * this.config.height / this.config.width);

        this.brush = d3.brush().on("end", function() {
            let s = d3.event.selection;
            if (!s) {
                if (!this.idleTimeout) return this.idleTimeout = setTimeout(function() {
                    this.idleTimeout = null; // necesario
                }.bind(this), this.idleDelay);
                this.xScale.domain(this.x0);
                this.yScale.domain(this.y0);
            } else {
                console.log('2:', this.xScale);

                this.xScale.domain([s[0][0], s[1][0]].map(this.xScale.invert, this.xScale));
                this.yScale.domain([s[1][1], s[0][1]].map(this.yScale.invert, this.yScale));
                this.svg.select(".brush").call(this.brush.move, null);
            }
            // this.zoom();
            let t = this.svg.transition().duration(750);
            this.svg.select(".axis--x").transition(t).call(this.xAxis);
            this.svg.select(".axis--y").transition(t).call(this.yAxis);
            this.svg.selectAll("circle").transition(t)
                .attr("cx", d => this.xScale(d[0]))
                .attr("cy", d => this.yScale(d[1]));
        }.bind(this)
        );

        this.svg.selectAll("circle")
            .data(points)
            .enter().append("circle")
                .attr("cx", d => this.xScale(d[0]))
                .attr("cy", d => this.yScale(d[1]))
                .attr("r", 2.5)
                .attr("fill", d => z(d[2]));
        this.svg.append("g")
                .attr("class", "axis axis--x")
                .attr("transform", "translate(0," + (this.config.height - 10) + ")")
                .call(this.xAxis);

        this.svg.append("g")
            .attr("class", "axis axis--y")
            .attr("transform", "translate(10,0)")
            .call(this.yAxis);

        this.svg.selectAll(".domain")
            .style("display", "none");

        this.svg.append("g")
            .attr("class", "brush")
            .call(this.brush);

    }



}