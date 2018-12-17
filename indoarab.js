const rp = require('request-promise');
const cheerio = require('cheerio');

const indoarab = function(url) {
    return rp(url)
    .then(function(body) {
        var $ = cheerio.load(body);
        var myRows = [];
        var headersText = [];
        var $headers = $("th");
        
        // Loop through grabbing everything
        var $rows = $("tbody tr").each(function(index) {
          $cells = $(this).find("td");
          myRows[index] = {};
        
          $cells.each(function(cellIndex) {
            // Set the header text
            if(headersText[cellIndex] === undefined) {
              headersText[cellIndex] = $($headers[cellIndex]).text();
            }
           
            // Update the row object with the header/cell combo
            if (cellIndex === 0){
                myRows[index][headersText[cellIndex]] = $(this).text();
            } else if (cellIndex === 1){
               arabic = $(this).text();
               myRows[index][headersText[cellIndex]] = arabic;
            }
            
           
          });    
        });
        
        
        var myObj = {
            "Indonesia-Arab": myRows
        };

     

     return myObj;
    })
    .catch(function(err) {
     console.log(err);
    });

}

module.exports = indoarab;
