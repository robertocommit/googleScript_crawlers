//Constant variables
var spreadsheet = SpreadsheetApp.openByUrl("YOUR_SHEET_URL");
var sheet = spreadsheet.getSheetByName("Category");

var last_row_urls = getFirstEmptyRow(sheet, 'A:A');
var last_row_managed = getFirstEmptyRow(sheet, 'B:B');

var items_in_a_page = 48;

var url_page_number = '?FIT=';

var start_tag_number_pages = 'Pagina 1 di';
var end_tag_numer_pages = '<!--ItemFilter2 END-->';

var tag_count_number_products = '<div class="price">';
var tag_count_number_products_discount = "<span class='price__old' >";
var tag_count_number_product_5_stars = '-star5';
var tag_count_new_product = 'badge__top badge__top--new';
var tag_count_number_subcategories_2 = 'class="category-header_menu_level2';
var tag_count_number_subcategories_3 = 'class="category-header_menu_level3';

var tag_category_description = 'estar-section-seo';

var tag_discount_start = 'Risparmio: ';
var tag_discount_end = '%';

/***********************************************************************************************************************/
function run_crawler_category() {
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
  
  var new_website = website + '?FIT=0&IPP=100000';
  var html = String(UrlFetchApp.fetch(new_website, {'followRedirects' : false}).getContentText());
  var number_pages = 1;
  
  if (html.indexOf(start_tag_number_pages) != -1) {
    number_pages = parseInt(extract_info_from_HTML(html, start_tag_number_pages, end_tag_numer_pages).replace(/<\/?[^>]+(>|$)/g, "").trim());
  }
  
  var number_products = occurrences(html, tag_count_number_products);
  var number_products_discount = occurrences(html, tag_count_number_products_discount);
  number_products = number_products - number_products_discount;
  var number_products_5_stars = occurrences(html, tag_count_number_product_5_stars) / 2;
  var number_products_new = occurrences(html, tag_count_new_product);
  var number_subcategoreis = occurrences(html, tag_count_number_subcategories_2) + occurrences(html, tag_count_number_subcategories_3) - 1;
  
  var description = false;
  if (html.indexOf(tag_category_description) > -1) {
    description = true;
  }
    
  
  var max_discount = 0;
  var temp_html = html;
  while (temp_html.indexOf(tag_discount_start) > 0) {
    var index_tag_start = temp_html.indexOf(tag_discount_start);
    var length_html = temp_html.length;
    temp_html = temp_html.substring(index_tag_start + tag_discount_start.length, length_html);
    var index_tag_end = temp_html.indexOf(tag_discount_end);    
    var temp_max_discount = parseInt(temp_html.substring(0, index_tag_end).trim());
    if (temp_max_discount > max_discount) {
      max_discount = temp_max_discount;
    }
  }
  
  var time_extraction = String(Utilities.formatDate(new Date(), spreadsheet.getSpreadsheetTimeZone(), "dd/MM HH:mm"));
  print_array(row, [time_extraction, number_pages, number_products, number_products_discount, number_products_new, number_products_5_stars, max_discount, number_subcategoreis, description]);
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
