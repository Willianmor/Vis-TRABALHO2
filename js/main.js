import { Dados } from './dados.js'

window.loadMyData = function loadMyData(selectObject) {
    console.log('Load-Data');
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
    file = '../assets/dataset/'
    // Load data
    await dados.loadCSV(file);
  
}


// ------ Global Variables ----
let dados = new Dados();