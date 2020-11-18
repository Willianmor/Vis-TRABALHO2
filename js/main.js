import { Dados } from './dados.js'
import { lineChart } from './lineChart.js';
import { Maps } from './maps.js'

window.loadMyData = function loadMyData(selectObject) {
    console.log('Load-Data');
    main();
  }

// ----------------------- Main --------------------------
// Load by default bar-chart
function main() {
    let confsvg = {
      div: '#main', 
      width: 600, 
      height: 400, 
      top: 30, 
      left: 10, 
      bottom: 30, 
      right: 30

      //Parametros necessários para construir o gráfico de linhas
      //height2:40,
      //top:10,
      //bottom:110,
      //left:40,
      //right:15,
      //top2:330,
      //right:15,
      //bottom2:30,
      //left2:40

      //Inserindo uma segunda margem abaixo para a barra de zoom.
      //scope.margins = {top: 10, bottom: 110, left: 40, right: 15};
      //scope.margins2 = {top: 330, right: 15, bottom: 30, left: 40}

    };
    let myfile = '../assets/dataset/deter_amz_2015-01-01_2020-11-02/deter_amz.geojson';

    //console.log(dados.data.features.map(function(d) { return d.properties.gid}))
    let map = new Maps(confsvg);

    //let bars = new lineChart(confsvg);
    
    //map.buildMapMercator(dados.data)
    map.render(myfile);
    //map.test_brush();
    console.log('Finish-render..')
}


// ------ Global Variables ----
//let dados = new Dados();