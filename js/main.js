import { TimeSeries} from './timeSeries.js'
import {showMessage, sortByDate, fillOptionsSelect, formattedDate, globalValues} from './utils.js'

window.changeAno = async function changeAno(selectObject) {
    console.log(selectObject.value);

    showMessage('div.load_data', 1500);
    cleanSVGandGlobalValues();
    main(selectObject.value);
    // Load Data
    // let [_, dataDesmatamento] = await loadData(selectObject.value);

    // // Time series
    // globalValues.timeSeries.svg.remove();
    // globalValues.timeSeries.createSvg();
    // await globalValues.timeSeries.setData(dataDesmatamento);
    // globalValues.timeSeries.updateChart();
    

    showMessage('div.render_data', 1500); 
}

async function loadData2(myfile) {
  let [_, dataDesmatamento] = await loadData(myfile);
  return dataDesmatamento;
}

async function loadData(myfile) {
  let [dataGeo, dataDesmatamento] = await Promise.all([
          d3.json('../assets/dataset/EstadosBR_IBGE_LLWGS84.geojson'),
          d3.json(myfile),
          ])
  dataDesmatamento = dataDesmatamento.features;
  sortByDate(dataDesmatamento)
  return [dataGeo, dataDesmatamento];
}

function cleanSVGandGlobalValues() {
  //clear svg
  globalValues.timeSeries.clean();
  globalValues.pie.clean();
  globalValues.bar.clean();
  globalValues.mapa.clean();
  //timeSeries = null;
  $('#time_series').empty(); 

  //clear globalVariables
  globalValues.filtro_estado = null;
  globalValues.filtro_date_ini = null;
  globalValues.filtro_date_fin = null;
  globalValues.class_quemadas = null;
  globalValues.mapa = null;
  globalValues.bar =null;
  globalValues.pie = null;
  globalValues.timeSeries = null;
}

// ----------------------- Main --------------------------
// Load by default bar-chart
async function main(desmatamento_geojson) {
    showMessage('div.load_data', 1500);
    // Load Data
    let [dataGeo, dataDesmatamento] = await loadData(desmatamento_geojson);

    // Time series
    globalValues.timeSeries = new TimeSeries();
    await globalValues.timeSeries.setData(dataDesmatamento);
    globalValues.timeSeries.updateChart();
    
    globalValues.timeSeries.createMapa(dataDesmatamento, dataGeo);
    globalValues.timeSeries.createBarVertical();
    globalValues.timeSeries.createPieChart();

    showMessage('div.render_data', 1500); 
}
// ------ Global Variables ----
// Default 2020
main('../assets/dataset/deter_amz_2020.geojson');

