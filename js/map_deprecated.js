'use strict';



function maps() {

    var scope = this;
    var exports = {};

    scope.margins = {top: 10, bottom: 70, left: 120, right: 5};
    scope.cw = 550;
    scope.ch = 500;
    scope.dt = [];
    scope.data = [];
    

    scope.svg = undefined;
    scope.mapMer = undefined;
    scope.projection = undefined;
    scope.path = undefined;

    scope.addZoom = undefined;
    scope.zoom = undefined;
    scope.map = undefined;
    scope.wz = undefined;
    scope.hz = undefined;

    scope.colormap = [];
    scope.colormin = undefined;
    scope.colormax = undefined;
    scope.colorscalemap = undefined;

    //Carregando dados
    scope.loadGeoJson = function(file)
    {
        d3.json(file, function(error, data)
        {   
            scope.data = data.features;
            //console.log("IMPRIME",scope.data);

            //console.log("Color Map" , scope.colormap) 
            //console.log("Name ID" ,   myApp.mapNomeID ) 

            scope.joinData();
            scope.buildMapMercator();
            scope.legend();
            scope.titulo();
            scope.appendLegend();
    });
    }

    //Import csv para definir a escala de cores
    /*scope.fileCSV = function(file) {

        d3.csv(file, function(error, data) {
    
            if (error) throw error;
    
            data.forEach(d => {
                d.Media_IFDM = +d.Media_IFDM;
            });

            //Definindo cores
            scope.colormin = Number.MAX_VALUE;
            scope.colormax = Number.MIN_VALUE;
    
            data.forEach(function(d) { 
                scope.colormap[d.Nome] = +d.Media_IFDM;
                myApp.mapNomeID[d.Nome] = +d.id; 
                if (scope.colormap[d.Nome] < scope.colormin) scope.colormin = scope.colormap[d.Nome]; 
                if (scope.colormap[d.Nome] > scope.colormax) scope.colormax = scope.colormap[d.Nome];
            });
            
            //Definindo escala de cores
            scope.colorscalemap = d3.scaleLinear().domain([scope.colormin,scope.colormax]).range(["rgb(237, 248, 233)","rgb(0,109,44)"])
        })  
        
    }*/
    
    /*scope.joinData = function()
    {
        scope.data.map(function(d){
            d.properties.value = scope.colormap[d.properties.name];  
        });

        let ids = scope.data.map(function(d) { return d.properties.id});
        scope.ids = ids
        //console.log("dados ID",scope.ids)
        //console.log("Estrutura do mapa",scope.data)
    }*/

    //SVG
    scope.appendSvg = function(div)
    {
        scope.svg = d3.select(div).append('svg')
        .attr('id', 'svgMap')
        .attr('width', scope.cw + scope.margins.left + scope.margins.right)
        .attr('height', scope.ch + scope.margins.top + scope.margins.bottom);
    }

    //Grupo
    scope.appendMapGroups = function()
    {
        scope.mapMer = scope.svg.append('g')
            .attr('class', 'map-area')
            .attr('width', scope.cw)
            .attr('height', scope.ch)
            .attr('transform', 'translate('+ scope.margins.left +','+ scope.margins.top +')' );
    }

    //Construção do mapa - projeção
    scope.buildMapMercator = function()
    {      
        //console.log("dados ID",scope.ids)   
        scope.projection = d3.geoMercator()
            .scale(8000)
            .rotate([0,0])
            .center([-42.8970,-22.3490])
            .translate([scope.cw / 2.4, scope.ch / 2]);

        scope.path = d3.geoPath()
            .projection(scope.projection);

        scope.mapMer.selectAll("path")
            .data(scope.data)
            .enter()
            .append("path")
            .attr("id", function(d,i) { return scope.ids[i]})
            .attr("d", scope.path)
            .style("stroke", "#fff")
            .style("stroke-width", "1")
            .style("fill", (d) => {return scope.colorscalemap(d.properties.value)});
    }
    
    //Legenda da seleção
    /*scope.appendLegend = function() {

        var data = ["Município selecionado"];
        scope.color = d3.scaleOrdinal().range([ "rgb(279, 155, 107)"]);
		
        var legend = scope.svg.selectAll('.legend')
            .data(data.slice())
            .enter().append('g')
            .attr('class', 'legend')
            .attr('transform', function(d, i) { return 'translate(0,' + i * 20 + ')'; });

        legend.append('rect')
            .attr('x', scope.cw + 100)
            .attr('y', scope.ch + 20)
            .attr('width', 18)
            .attr('height', 18)
            .style('fill', (d) => {return scope.color(d); })
            .style('stroke-width', '2px' )
            .style('stroke', '#fff');

        legend.append('text')
            .attr('x', scope.cw + 90)
            .attr('y', scope.ch + 30)
            .attr('dy', '.35em')
            .style('text-anchor', 'end')
            .text((d) => { return d });
	}*/


    //Legenda
    /*scope.legend = function (){
        // add a legend
		
		var legend = scope.svg.append("defs")
			.append("svg:linearGradient")
			.attr("id", "gradient")
			.attr("x1", "100%")
			.attr("y1", "0%")
			.attr("x2", "100%")
			.attr("y2", "100%")
			.attr("spreadMethod", "pad");

		legend.append("stop")
			.attr("offset", "0%")
			.attr("stop-color", "rgb(0,109,44)")
			.attr("stop-opacity", 1);
			
		legend.append("stop")
			.attr("offset", "100%")
			.attr("stop-color", "rgb(237, 248, 233)")
            .attr("stop-opacity", 1);
        
        //Título da barra de escala
        scope.svg.append('text')
			.attr('y', scope.ch + 40)
			.attr('x', 50)
			.attr('text-anchor', 'middle')
			.text('Média das Notas IFDM - 2005/2016')
			.attr("font-family", "Arial")
			.attr("font-size", "16px")
			.attr("fill", "black");
        
        //Barra de Escalas
		scope.svg.append("rect")
			.attr("x", 0 )
            .attr("height", scope.ch)
            .attr('width', 30)
            .style("fill", "url(#gradient)")
            .style('stroke-width', '1.5px' )
            .style('stroke', '#fff')
            .attr("transform", "translate(0,10)");

           

		var y = d3.scaleLinear().range([scope.ch, 0]).domain([scope.colormin, scope.colormax]);

        var yAxis = d3.axisRight(y);            

        scope.svg.append("g")
            .attr("class", "y axis")
			.attr("transform", "translate(41,10)")
			.call(yAxis)
    }*/
    
    scope.titulo = function()
	{
		var titulo = scope.svg.append('text')
			.attr('y', scope.ch + 70)
			.attr('x', scope.ch - 10)
			.attr('text-anchor', 'middle')
			.text('IFDM – Índice Firjan de desenvolvimento Municipal')
			.attr("font-family", "Arial")
			.attr("font-size", "16px")
			.attr("fill", "black");
	
		return titulo;
	}
    

    exports.run = function(div) {

        scope.dt=myApp.data03
        scope.datacsv = myApp.data02
        //console.log("scope.dt", scope.dt)
        
        var cht = scope.appendSvg(div);
        scope.appendMapGroups(cht); 

        scope.fileCSV(scope.datacsv);
        
        scope.loadGeoJson(scope.dt, scope);
    }

    return exports;


};