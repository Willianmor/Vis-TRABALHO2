
export function getEstados() {
    return [];
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