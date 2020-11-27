
export function getEstados() {
    return [];
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
    let parseDate = d3.timeParse("%Y/%m/%d");
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