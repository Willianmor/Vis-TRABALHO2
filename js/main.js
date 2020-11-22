import { Maps } from './maps.js'
import { TimeSeries} from './timeSeries.js'

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
      left: 10, 
      bottom: 30, 
      right: 30
    };
    let desmatamento_geojson = '../assets/dataset/deter_amz_2015-01-01_2020-11-02/deter_amz.geojson';

    // Render Map
    let map = new Maps(confsvg);
    await map.loadData(desmatamento_geojson);
    map.render();
    map.loadFilters();

    // Time series
    let timeSeries = new TimeSeries();
    await timeSeries.setData(map.data);
    //timeSeries.initializeAxis();
    timeSeries.updateChart();

}

main();

// ------ Global Variables ----
//let dados = new Dados();