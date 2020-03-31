var spreadsheet = SpreadsheetApp.openByUrl('YOUR_SHEET_URL');
var sheet = spreadsheet.getSheetByName("Data");
var alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'K', 'L', 'M', 'N', 'O', 'P', 'R', 'S', 'T', 'V', 'X', 'Y'];
//Lettere Q e Z assenti
function crawl() {
  for (var s = 0; s < alphabet.length; s++) {
    var companies = new Array
    var url = 'http://www.borsaitaliana.it/borsa/azioni/listino-a-z.html?initial=' + alphabet[s];
    var html = UrlFetchApp.fetch(url).getContentText();
    var pages = (html.match(/&page=/g) || []).length;
    companies.push(html.match(/\/borsa\/\azioni\/scheda(.*?)lang=it/gi));
    for (var i = 2; i < pages + 1; i++) {
      html = UrlFetchApp.fetch(url + '&page=' + i).getContentText();
      companies.push(html.match(/\/borsa\/\azioni\/scheda(.*?)lang=it/gi));
    }
    var websites = new Array();
    for (var i = 0; i < companies.length; i++) {
      for (var r = 0; r < companies[i].length; r++) {
        if (websites.indexOf(companies[i][r]) == -1) {
          websites.push([companies[i][r]]);
        }
      }
    }
    var websites = ArrayLib.unique(websites);
    var letters = new Array();
    for (var i = 0; i < websites.length; i++) {
      letters.push([alphabet[s]]);
    }
    var new_row = sheet.getLastRow() + 1;
    sheet.getRange(new_row, 1, websites.length, 1).setValues(letters);
    sheet.getRange(new_row, 2, websites.length, 1).setValues(websites);
  }
}
