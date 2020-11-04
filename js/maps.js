// https://www.d3-graph-gallery.com/graph/bubblemap_basic.html
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

    async render(myfile) {
        // Map and projection
        let projection = d3.geoMercator()
        .rotate([0,0])
        .center([-57.82134,-5.15357])                // GPS of location to zoom on
        .scale(8000)                       // This is like the zoom
        .translate([ this.config.width/2, this.config.height/2 ])

        // Load external data and boot "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"
        d3.json(myfile, function(data){

            // Filter data
            //data.features = data.features.filter( function(d){return d.properties.name=="France"} )

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
        }.bind(this));
        
    }

}