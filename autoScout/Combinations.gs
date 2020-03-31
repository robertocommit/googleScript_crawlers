var spreadsheet = SpreadsheetApp.openByUrl('YOUR_SHEET_URL');
var sheet = spreadsheet.getSheetByName("Category");
function extract_info_category() {
  var fields = {
    "products": ['visitorSearchQuantity":"', '"'],
    "pages": ['data-pages="', '"'],
  };
  Functions.crawl(sheet, fields);
}
