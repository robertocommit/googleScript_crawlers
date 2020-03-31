//Constant variables
var spreadsheet = SpreadsheetApp.openByUrl("YOUR_SHEET_URL");
var sheet = spreadsheet.getSheetByName("Product");

var last_row_urls = getFirstEmptyRow(sheet, 'A:A');
var last_row_managed = getFirstEmptyRow(sheet, 'B:B');

var tag_ean_start = 'Ean":"';
var tag_ean_end = '","Category';
var tag_brand_start = '_brand-wishlist">';
var tag_brand_end = '<a href';
var tag_price_start = 'class="price">';
var tag_price_end = ',';
var tag_price_discounted_start = 'class="price discount-alert">';
var tag_price_discounted_end = ',';
var tag_weight_start = '"Weight":';
var tag_weight_end = ',"ListName';
var tag_article_number_start = 'Codice articolo: ';
var tag_article_number_end = '</div>';
var tag_number_reviews_start = '<span itemprop="reviewcount">';
var tag_number_reviews_end = ' Recensioni';
var tag_in_stock_start = 'productDeliveryValue ';
var tag_in_stock_end = '"';
var tag_new_availability_start = 'http://schema.org/OutOfStock">';
var tag_new_availability_end = '</span>';
var tag_time_delivery_start = 'Tempi di consegna: ';
var tag_time_delivery_end = '</span>';
var tag_stars_1 = '--star1';
var tag_stars_2 = '--star2';
var tag_stars_3 = '--star3';
var tag_stars_4 = '--star4';
var tag_stars_5 = '--star5';
var tag_category_path_section_start = '"Path":"';
var tag_category_path_section_end = '|","Url"';
var tag_error = '<h1>Errore </h1>';
/***********************************************************************************************************************/

function run_crawler_product() {
  if (last_row_managed < last_row_urls) {
    var start_time = new Date().getTime();
    for (var i = last_row_managed + 1; i <= last_row_urls; i++) {
      var website = sheet.getRange(i, 1).getValue();
      extract_infos(i, website);
      var new_time = new Date().getTime();
      if ((new_time - start_time) > 240000) {
        break;
      }
    }
  }
}
/***********************************************************************************************************************/

function extract_infos(row, website) {
  try {
    var html = String(UrlFetchApp.fetch(website, {'followRedirects' : false}).getContentText());
    try {
      var temp_html = html.split(tag_ean_start)[1];
      var ean = temp_html.substring(0, temp_html.indexOf(tag_ean_end)).trim();
    }
    catch (error) {
      var ean = '/';
    }
    try {
      var brand = extract_info_from_HTML(html, tag_brand_start, tag_brand_end).trim();
    }
    catch (error) {
      var brand = '/';
    }
    try {
      var price = extract_info_from_HTML(html, tag_price_start, tag_price_end).trim();
    }
    catch (error) {
      var price = '/';
    }
    try {
      var price_discounted = extract_info_from_HTML(html, tag_price_discounted_start, tag_price_discounted_end).trim();
    }
    catch (error) {
      var price_discounted = '/';
    }
    try {
      var temp_html = html.split(tag_weight_start)[1];
      var weight = String(temp_html.substring(0, temp_html.indexOf(tag_weight_end)).trim());
    }
    catch (error) {
      var weight = '/';
    }
    try {
      var article_number = extract_info_from_HTML(html, tag_article_number_start, tag_article_number_end).trim();
    }
    catch (error) {
      var article_number = '/';
    }
    try {
      var number_reviews = extract_info_from_HTML(html, tag_number_reviews_start, tag_number_reviews_end).trim(); 
    }
    catch (error) {
      var number_reviews = '/';
    }
    try {
      var in_stock = extract_info_from_HTML(html, tag_in_stock_start, tag_in_stock_end).trim(); 
    }
    catch (error) {
      var in_stock = '/';
    }
    if (in_stock == 'inStock') {
      var delivery_time = extract_info_from_HTML(html, tag_time_delivery_start, tag_time_delivery_end).trim();
    }
    else {
      var delivery_time = extract_info_from_HTML(html, tag_new_availability_start, tag_new_availability_end).trim();
    }
    var number_stars = 0;
    if (html.indexOf(tag_stars_1) > -1) number_stars = 1;
    if (html.indexOf(tag_stars_2) > -1) number_stars = 2;
    if (html.indexOf(tag_stars_3) > -1) number_stars = 3;
    if (html.indexOf(tag_stars_4) > -1) number_stars = 4;
    if (html.indexOf(tag_stars_5) > -1) number_stars = 5;
    try {
      var temp_html = html.split(tag_category_path_section_start)[1];
      var category_path = temp_html.substring(0, temp_html.indexOf(tag_category_path_section_end));
    }
    catch (error) {
      var category_path = '/';
    }
    var time_extraction = String(Utilities.formatDate(new Date(), spreadsheet.getSpreadsheetTimeZone(), "dd/MM HH:mm"));
    print_array(row, [time_extraction, ean, brand, price, price_discounted, weight, article_number, number_reviews, in_stock, delivery_time, number_stars, category_path]);
  }
  catch (error) {
    var time_extraction = String(Utilities.formatDate(new Date(), spreadsheet.getSpreadsheetTimeZone(), "dd/MM HH:mm"));
    print_array(row, [time_extraction, 404]);
  }
}
/***********************************************************************************************************************/

function extract_info_from_HTML(html, tag_start, tag_end) {
  var html_split = html.split(tag_start);
  var index_1 = html_split[1].indexOf(tag_start);
  var index_2 = html_split[1].indexOf(tag_end);
  var info = html_split[1].substring(index_1, index_2);
  return info;
}
/***********************************************************************************************************************/

function getFirstEmptyRow(sheet, column) {
  sheet.appendRow([null]);
  var column = sheet.getRange(column);
  var values = column.getValues();
  var iterator = 0;
  while ( values[iterator][0] != "" ) {
    iterator++;
  }
  return iterator;
}
/***********************************************************************************************************************/

function print_array(last_row_managed, array_results) {
  for (var i = 0; i < array_results.length; i++){
    sheet.getRange(last_row_managed, 2 + i).setValue(array_results[i]).setNumberFormat("@").setHorizontalAlignment("center");
  }
}
/***********************************************************************************************************************/

function occurrences(string, subString, allowOverlapping) {
  string += "";
  subString += "";
  if (subString.length <= 0) return (string.length + 1);
  var n = 0;
  var pos = 0;
  var step = allowOverlapping ? 1 : subString.length;
  while (true) {
    pos = string.indexOf(subString, pos);
    if (pos >= 0) {
      ++n;
      pos += step;
    } else break;
  }
  return n;
}
