var spreadsheet = SpreadsheetApp.openByUrl('YOUR_SHEET_URL');
var sheet = spreadsheet.getSheetByName("Products");

function update_sitemap() {
  Functions.sitemap_parser(sheet, 'http://www.urbanara.de/category-sitemap.xml', '<loc>', '</loc>');
}

function extract_info() {
  var fields = {
    "id": ['"id": "', '"'],
    "name": ['"name": "', '"'],
    "price": ['"price": "','.'],
    "brand": ['"brand": "', '"'],
    "category": ['"category": "', '"'],
    "in_stock": ['button cart-button', '/>'],
  };
  Functions.crawl(sheet, fields);
}

function clean_info() {
  var fields = {
    "name": [['&auml;', 'ä'], ['&Auml;', 'Ä'], ['&uuml;', 'ü'], ['&Uuml;', 'Ü'], ['&ouml;', 'ö'], ['&Ouml;', 'Ö'], ['&szlig;', 'ß']],
    "in_stock":  [['" value="', ''], ['"', ''], ['In den warenkorb', '1'], ['/', '0']],
  };
  Functions.clean(sheet, fields);
}
