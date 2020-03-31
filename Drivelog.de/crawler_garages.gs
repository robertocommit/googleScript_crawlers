var website_root = 'https://www.drivelog.de/werkstatt-suche?address=';
var spreadsheet = SpreadsheetApp.openByUrl("YOUR_SHEET_URL");
var sheet_garages = spreadsheet.getSheetByName("Garages");
var sheet_data = spreadsheet.getSheetByName("Data");
var last_row_urls = get_FirstEmptyRow(sheet_garages, 'A:A');
var last_row_managed = get_FirstEmptyRow(sheet_garages, 'B:B');
var number_result_tag_open = '<div class="results-counter">';
var number_result_tag_close = '</span>';
var garages_url_tag_open = 'id="service-search-results-list';
var garages_url_tag_close = '<script type="x-template" id="tpl_service_search_bar">';
var href_tag_open = 'href="';
var href_tag_close = '"';
var wrong_url_values = ['Bewertungen', 'vereinbaren'];
var text_url = '&distance=25&rating=0&sortBy=default&listDisplay=true&withAutomaticCalculation=true&serviceType=WORKSHOP&showMiniMap=false&calcId=0&calcServiceId=0&calcBrandId=0&optionsMain=&optionsAdditionalArray=&simpleBar=true&classicIntro=false';
/***********************************************************************************************************************/
function crawler_garages() {
  var last_city_row = getLastCityRow(sheet_garages, 'B:B');
  var city_name = sheet_garages.getRange(last_city_row, 1).getValue();
  var latitude = sheet_garages.getRange(last_city_row, 3).getValue();
  var longitude = sheet_garages.getRange(last_city_row, 4).getValue();
  var number_result =  sheet_garages.getRange(last_city_row, 5).getValue();
  if (number_result == "") {
    var website = website_root + city_name + ',%20Germany&addressLongitude=' + longitude + '&addressLatitude=' + latitude + text_url + '&dataFrom=0&dataTo=24&pageNumber=1';
    var html = String(UrlFetchApp.fetch(website, {'followRedirects' : true}).getContentText());
    var number_result = extract_info_from_HTML(html, number_result_tag_open, number_result_tag_close).replace(/<\/?[^>]+(>|$)/g, " ").replace('.', '') ;
    sheet_garages.getRange(last_city_row, 5).setValue(number_result); 
  }
  var page_number = sheet_garages.getRange(last_city_row, 6).getValue();
  var last_data_from = sheet_garages.getRange(last_city_row, 7).getValue();
  var last_data_to = sheet_garages.getRange(last_city_row, 8).getValue();
  if (last_data_to == "") {
    page_number = 1;
    last_data_from = 0;
    last_data_to = 24;
  }
  else {
    page_number = page_number + 1;
    last_data_from = last_data_to + 1;
    last_data_to = last_data_to + 24;
  }
  var website = website_root + city_name + ',%20Germany&addressLongitude=' + longitude + '&addressLatitude=' + latitude + text_url + '&dataFrom=' + last_data_from + '&dataTo=' + last_data_to + '&pageNumber=' + page_number;
  var html = String(UrlFetchApp.fetch(website, {'followRedirects' : false}).getContentText());
  var temp_html = html.substring(html.indexOf(garages_url_tag_open), html.length);
  temp_html = temp_html.substring(0, temp_html.indexOf(garages_url_tag_close));
  var html_split = temp_html.split(href_tag_open);
  var last_row_data = get_FirstEmptyRow(sheet_data, 'A:A') + 1;
  var array_data = remove_dimension_2d_array(sheet_data.getRange(2, 1, last_row_data).getValues());
  var array_urls = [];
  for (var i = 1; i < html_split.length; i++) {
    var html_split_temp = html_split[i].substring(0, html_split[i].indexOf(href_tag_close));
    if (html_split_temp.indexOf(wrong_url_values[0]) == -1 && html_split_temp.indexOf(wrong_url_values[1]) == -1) {
      if (array_data.indexOf(html_split_temp) == -1) {
        array_urls.push(html_split_temp);
      }
    }
  }
  array_urls = array_urls.filter(function(item, pos) {
    return array_urls.indexOf(item) == pos;
  })
  sheet_garages.getRange(last_city_row, 6).setValue(page_number);
  sheet_garages.getRange(last_city_row, 7).setValue(last_data_from);
  sheet_garages.getRange(last_city_row, 8).setValue(last_data_to);
  sheet_garages.getRange(last_city_row, 9).setValue(String(Utilities.formatDate(new Date(), spreadsheet.getSpreadsheetTimeZone(), "dd/MM HH:mm")));
  for (var i = 0; i < array_urls.length; i++) {
    sheet_data.getRange(i + last_row_data, 1).setValue(array_urls[i]);
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
function getLastCityRow(sheet, column) {
  var column = sheet.getRange(column);
  var values = column.getValues();
  var iterator = 0;
  while ( values[iterator][0] != 0 ) {
    iterator++;
  }
  return iterator + 1;
}
/***********************************************************************************************************************/
function get_FirstEmptyRow(sheet, column) {
  sheet.appendRow([null]);
  var column = sheet.getRange(column);
  var values = column.getValues();
  var iterator = 0;
  while ( values[iterator][0] != "" ) {
    iterator++;
  }
  return iterator;
}
/****************************************************************************************************************************/
function remove_dimension_2d_array(array) {
  var newArr = [];
  for(var i = 0; i < array.length; i++) {
    newArr = newArr.concat(array[i]);
  }
  return newArr;
}
