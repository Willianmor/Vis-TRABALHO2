// https://www.d3-graph-gallery.com/graph/bubblemap_basic.html
export class Maps {
    constructor(config) {
        this.config = config;

        this.svg = null;
        this.margins = null;

        this.x0 = null;
        this.y0 = null;
        this.xScale = null;
        this.yScale = null;
        this.xAxis = null;
        this.yAxis = null;

        this.projection = null;
        this.path = null;
        this.data = null;
        this.zoom =null;

        // Test Brush
        this.brush = null;
        this.idleTimeout;
        this.idleDelay = 350;

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

    
    // LEER: https://stackoverflow.com/questions/33087405/using-queue-to-load-multiple-files-and-assign-to-globals
    async render(myfile) {
        // Map and projection
        let projection = d3.geoMercator()
        .rotate([0,0])
        .center([-57.82134,-5.15357])                // GPS of location to zoom on
        .scale(8000)                       // This is like the zoom
        .translate([ this.config.width/2, this.config.height/2 ])

        // Load external data and boot "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"
        await d3.json(myfile, function(data){

            // Filter data
            //data.features = data.features.filter( function(d){return d.properties.name=="France"} )
            this.data = data.features;
            // Draw the map
            this.svg.append("g")
                .selectAll("path")
                .data(data.features)
                .enter()
                .append("path")
                .attr("fill", "#b8b8b8")
                .attr("d", d3.geoPath()
                    .projection(projection)
                )
                .style("stroke", "black")
                .style("opacity", .3)
            
            // zoomed()
            
        }.bind(this));

        

        //zoom  ctr+k+u
        // var g = this.svg
        // this.zoom = d3.zoom()
        //     .scaleExtent([1, 10])
        //     .on('zoom', function() {
        //         g.append("g")
        //             .selectAll('path')
        //                 .attr('transform', d3.event.transform);
        //                 console.log("chegou")
        //         g.append("g")
        //             .selectAll("d")
        //                 .attr('transform', d3.event.transform);
        //                 console.log("chegou2")
        // });

        // this.svg.call(this.zoom);


        // //zoom map ctrl+k+c
        // function zoomed(){  
                        
        //     this.svg.append("g")
        //     .selectAll("path")
        //     .data(data.features)
        //     .enter()
        //     .append("path")
        //     .attr("transform", d3.event.transform);
        //     console.log(d3.event.transform);
        // } 
    
        // this.zoom = d3.zoom()
        //     .scaleExtent([1, 8])
        //     .translateExtent([[0,0], [this.config.width, this.config.height]])
        //     .extent([[0, 0], [this.config.width, this.config.height]])
        //     .on("zoom", zoomed);
        
        // this.svg.append("g")
        //     .attr('class','zoom')
        //     .attr("width", this.config.width)
        //     .attr("height", this.config.height)
        //     .call(this.zoom);

        // console.log("chegou")
        //bibliografias:
        //https://bl.ocks.org/d3noob/c056543aff74a0ac45bef099ee6f5ff4
        //https://stackoverflow.com/questions/35357164/d3-zoom-cannot-read-property-apply-of-undefined/35357269
        //importante: https://stackoverflow.com/questions/21550534/set-d3-zoom-scaleextent-to-positive-values

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