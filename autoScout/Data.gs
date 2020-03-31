var root = 'https://www.zalando.it';
var spreadsheet = SpreadsheetApp.openByUrl('YOUR_SHEET_URL');
var sheet_category_pages = spreadsheet.getSheetByName("Category_Pages");
var sheet_products = spreadsheet.getSheetByName("Products");
/***********************************************************************************************************************/
function crawl_product_pages() {
  var last_row_urls = Functions.getFirstEmptyRow(sheet_category_pages, 1);
  var last_row_managed = Functions.getFirstEmptyRow(sheet_category_pages, 2);
  if (last_row_managed < last_row_urls) {
    for (var i = last_row_managed + 1; i <= last_row_urls; i++) {
      var website = sheet_category_pages.getRange(i, 1).getValue();
      var products = extract_urls(website);
      var time_extraction = String(Utilities.formatDate(new Date(), 'Etc/GMT', "dd/MM HH:mm"));  
      sheet_category_pages.getRange(i, 2).setValue(time_extraction);
      sheet_category_pages.getRange(i, 3).setValue(products);
    }
  }
}
/***********************************************************************************************************************/
function extract_urls(website) {
  var html = UrlFetchApp.fetch(website,{"followRedirects":false, "muteHttpExceptions":true}).getContentText();
  var html_splitted = html.split('catalogArticlesList_item">');
  var urls = new Array();
  for (var i = 1; i < html_splitted.length; i++) {
    var url = html_splitted[i].split('class="catalogArticlesList_imageBox')[0].replace('<a href="', '').replace(/"/g, '').trim();
    urls.push([root.concat(url)]);
  }
  if (urls.length < 1) {
    return 0;
  }
  var last_row_products = Functions.getFirstEmptyRow(sheet_products, 1);
  sheet_products.getRange(last_row_products + 1, 1, urls.length).setValues(urls);
  return urls.length; 
}
