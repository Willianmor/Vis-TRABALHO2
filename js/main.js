import { TimeSeries} from './timeSeries.js'
import {showMessage, sortByDate, fillOptionsSelect, formattedDate, globalValues} from './utils.js'

window.changeAno = function changeAno(selectObject) {
    console.log(selectObject.value);
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

async function loadFilterAno(year, data_origin) {
  let parseDate = globalValues.parseDate;
  let data_filter = await data_origin.filter( d =>  new Date(parseDate(d.properties.date)).getFullYear() == year);

  $('#date_ini').html(formattedDate(new Date(parseDate(data_filter[0].properties.date))));
  $('#date_fin').html(formattedDate(new Date(parseDate(data_filter[data_filter.length-1].properties.date))));
  // Atualizar as variables globales
  globalValues.filtro_date_ini = new Date(parseDate(data_filter[0].properties.date)).getTime();
  globalValues.filtro_date_fin = new Date(parseDate(data_filter[data_filter.length-1].properties.date)).getTime();
  
  return data_filter;
}

// ----------------------- Main --------------------------
// Load by default bar-chart
async function main() {
    
    let desmatamento_geojson = '../assets/dataset/deter_amz_full.geojson';

    // Load Data
    [dataGeo, dataDesmatamento] = await loadData(desmatamento_geojson);
    // Load Slect-Filtro by year
    let parseDate = globalValues.parseDate;
    let optionAnos = new Set(d3.map(dataDesmatamento, d => new Date(parseDate(d.properties.date)).getFullYear()));
    fillOptionsSelect('filtro_estados', optionAnos);

    let data_filter = await loadFilterAno("2019", dataDesmatamento);

    // Time series
    let timeSeries = new TimeSeries();
    await timeSeries.setData(data_filter);
    timeSeries.updateChart();
    
    timeSeries.createMapa(data_filter, dataGeo);
    timeSeries.createBarVertical();
    timeSeries.createPieChart();

    showMessage('div.render_data', 1500); 
}
// ------ Global Variables ----
let dataGeo = null;
let dataDesmatamento = null;
main();

