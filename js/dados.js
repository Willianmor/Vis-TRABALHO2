const d3 = window.d3;

export class Dados {
  constructor() {
    this.data = [];

    this.load_data = false;
    this.slice = 360;
  }

  is_load() {
    return this.load_data;
  }

  async loadCSV(file) {
    this.data = await d3.csv(file, d => {
      return {
        cx: +d.horsepower,
        cy: +d.weight,
        cx_line: +d.year,
        name: d.Origin,
        col: 4
      }
    });
    this.load_data = true;
  }


  getData(ini=0, fin=30) {
    return this.data.slice(ini, fin);
  }
  
}