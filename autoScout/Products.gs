function extract_info_products(sheet) {
  var spreadsheet = SpreadsheetApp.openById('YOUR_SHEET_ID');
  var sheet = spreadsheet.getSheetByName("URLs");
  var fields = {
    'title': ['<h2 class="pe-vehicle-data__title">', '</h2>'],
    'priceRangeLow': ['<h3 id="priceRangeLow" class="pe-price-indicator__label">€ ', '</h3>'],
    'priceRangeMid': ['<h3 id="priceRangeMid" class="pe-price-indicator__label pe-price-indicator__label--focused">', '</h3>'],
    'priceRangeHigh': ['<h3 id="priceRangeHigh" class="pe-price-indicator__label">€ ', '</h3>']
  };
  Functions.crawl(sheet, fields);
}

function test() {
  var spreadsheet = SpreadsheetApp.openById('1rPgX7H6LaGfmMqU-Up5FePDrRsxJglnjmj0E_IfbTYc');
  var sheet = spreadsheet.getSheetByName("URLs");
  var fields = {
    'title': ['<h2 class="pe-vehicle-data__title">', '</h2>']
  };
  Functions.crawl(sheet, fields); 
}


