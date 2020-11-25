import { Maps } from './maps.js'
import { TimeSeries} from './timeSeries.js'
import {showMessage, sortByDate} from './utils.js'

window.loadMyData = function loadMyData(selectObject) {
    console.log('Load-Data');
    main();
}

async function loadData(myfile) {
  showMessage('div.load_data', 1500);
  let [dataGeo, dataDesmatamento] = await Promise.all([
          d3.json('../assets/dataset/EstadosBR_IBGE_LLWGS84.geojson'),
          d3.json(myfile),
          ])
  dataDesmatamento = dataDesmatamento.features;
  sortByDate(dataDesmatamento)
  return [dataGeo, dataDesmatamento];
}

// ----------------------- Main --------------------------
// Load by default bar-chart
async function main() {
    
    let desmatamento_geojson = '../assets/dataset/deter_amz_2015-01-01_2020-11-02/deter_amz.geojson';

    // Load Data
    let [dataGeo, dataDesmatamento] = await loadData(desmatamento_geojson);

    // Time series
    let timeSeries = new TimeSeries();
    await timeSeries.setData(dataDesmatamento);
    //timeSeries.initializeAxis();
    timeSeries.updateChart();
    

    timeSeries.createMapa(dataDesmatamento, dataGeo);
    timeSeries.createBarVertical();
}

main();

// ------ Global Variables ----
//let dados = new Dados();