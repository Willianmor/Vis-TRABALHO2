import { Dados } from './dados.js'
import { Maps } from './maps.js'

window.loadMyData = function loadMyData(selectObject) {
    console.log('Load-Data');
    main();
  }

// ----------------------- Main --------------------------
// Load by default bar-chart
async function main() {
    let confsvg = {
      div: '#main', 
      width: 600, 
      height: 400, 
      top: 30, 
      left: 150, 
      bottom: 30, 
      right: 30
    };
    let myfile = '../assets/dataset/deter_amz_2015-01-01_2020-11-02/deter_amz.geojson';
    // Load data
    await dados.loadJSON(myfile);

    //console.log(dados.data.features.map(function(d) { return d.properties.gid}))
    let map = new Maps(confsvg);
    map.createAxisLabel('x', 'y');
    map.buildMapMercator(dados.data)
}


// ------ Global Variables ----
let dados = new Dados();