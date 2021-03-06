
export let globalValues = {
    filtro_estado: null,
    filtro_date_ini: null,
    filtro_date_fin: null,
    class_quemadas: ['DESMATAMENTO_CR', 'DEGRADACAO', 'DESMATAMENTO_VEG', 'CS_DESORDENADO', 'CS_GEOMETRICO', 'MINERACAO', 'CICATRIZ_DE_QUEIMADA'],
    cor_desmatamento: ['#FF0000', '#006400', '#8B4513', '#FFA500', '#FFF68F', '#CD8162', '#FFFF00'],
    parseDate: d3.timeParse("%Y-%m-%d"),
    timeSeries: null,
    mapa: null,
    bar:null,
    pie: null,
}

export function getCoresDesmatamento() {
    return ['#FF0000', '#006400', '#8B4513', '#FFA500', '#FFF68F', '#CD8162', '#FFFF00'];
}

export function showMessage(elementStr, delay) {
    $( elementStr ).fadeIn( 300 ).delay( delay ).fadeOut( 400 );
}

export function fillOptionsSelect(idElement, dataGrups){
    let count = $('#' + idElement + ' option').length;
    
    if (count<=0) {
      // add the options to the Select
      d3.select('#' + idElement)
        .selectAll('myOptions-'+idElement)
        .data(dataGrups)
        .enter()
        .append('option')
        .text(d => d) // text showed in the menu
        .attr("value", d => d) // corresponding value returned by the button
    }
    
}

export function sortByDate(arr) {
    let parseDate = globalValues.parseDate;
    let sorter = (a, b) => {
       return new Date(parseDate(a.properties.date)).getTime() - new Date(parseDate(b.properties.date)).getTime();
    }
    arr.sort(sorter);
 };

export function formattedDate(d = new Date) {
    let month = String(d.getMonth() + 1);
    let day = String(d.getDate());
    const year = String(d.getFullYear());

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return `${day}/${month}/${year}`;
}

export function filterByState(state_origen, state_consulta) {
    //console.log(state_origen, state_consulta)
    if (state_consulta==null) {
        return true; // nao tem estado para comparar, defaul apectar todo
    }
    if(state_origen==state_consulta){
        return true;
    }
    else{
        return false;
    }
}

export function checkFileExist(url) { 
    if (url.length === 0) { 
        console.log("Please enter File URL"); 
    } else { 
        let http = new XMLHttpRequest();
        http.open('HEAD', url, false); 
        http.send(); 
        if (http.status === 200) { 
            return true; 
        } else { 
            return false; 
        } 
    } 
} 