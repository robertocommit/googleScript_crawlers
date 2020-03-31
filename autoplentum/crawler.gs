var spreadsheet = SpreadsheetApp.openByUrl("YOUR_SHEET_URL");
var sheet = spreadsheet.getSheetByName("Data");

var last_row_urls = getFirstEmptyRow(sheet, 'A:A');
var last_row_managed = getFirstEmptyRow(sheet, 'J:J');

var start_tag_name = '<h1 itemprop="name">';
var end_tag_name = '</h1>';
var start_tag_adress = '<span itemprop="streetAddress">';
var end_tag_adress = '</span>';
var start_tag_postal_code = '<span itemprop="postalCode">'; 
var end_tag_postal_code = '</span>'
var start_tag_city = '<span itemprop="addressLocality">';
var end_tag_city = '</span>';
var start_tag_telephone = 'itemprop="telephone">'
var end_tag_telephone = '</div>';
var start_tag_review = 'itemtype="http://schema.org/Rating"><span>';
var end_tag_review = '</span>';
var start_tag_number_reviews = '<a href="#reviews">Erfahrungen (';
var end_tag_number_reviews = ')</a><';
var start_tag_website = 'ow" href="';
var end_tag_website = '"><div';
var start_tag_additional_info = '<div class="columns additional-info small-12 medium-5">'
var end_tag_additional_info = '</section>'

/***********************************************************************************************************************/
function run_crawler() {
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
    var html = String(UrlFetchApp.fetch(website).getContentText());
    var time_extraction = String(Utilities.formatDate(new Date(), spreadsheet.getSpreadsheetTimeZone(), "dd/MM HH:mm"));  
    try {var name = extract_info_from_HTML(html, start_tag_name, end_tag_name);}catch (error) {var name = '/';}
    try {var telephone = extract_info_from_HTML(html, start_tag_telephone, end_tag_telephone).replace(/ /g, "").replace(/\//g, "");} catch (error) {var telephone = '/';}
    try {var address = extract_info_from_HTML(html, start_tag_adress, end_tag_adress);}catch (error) {var address = '/';}
    try {var postal_code = extract_info_from_HTML(html, start_tag_postal_code, end_tag_postal_code);} catch (error) {var postal_code = '/';}
    try {var city = extract_info_from_HTML(html, start_tag_city, end_tag_city);}catch (error) {var city = '/';}
    try {var review = extract_info_from_HTML(html, start_tag_review, end_tag_review).replace(' von 5', '');} catch (error) {var review = '/';}
    try {var number_reviews = extract_info_from_HTML(html, start_tag_number_reviews, end_tag_number_reviews);} catch (error) {var number_reviews = '/';}
    try {var additional_infos = extract_info_from_HTML(html, start_tag_additional_info, end_tag_additional_info);} catch (error) {var additional_infos = '/';}
    print_array(row, clean_info([name, telephone, address, postal_code, city, review, number_reviews, additional_infos, time_extraction]));
  }
  catch (error) {
    var time_extraction = String(Utilities.formatDate(new Date(), spreadsheet.getSpreadsheetTimeZone(), "dd/MM HH:mm"));  
    print_array(row, [404, 404, 404, 404, 404, 404, 404, 404, time_extraction]);
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
function clean_info(array) {
  var array_temp = [];
  for (var i = 0; i < array.length; i++) {
    array_temp.push(array[i].replace(/(\r\n|\n|\r)/gm," ").replace(/<\/?[^>]+(>|$)/g, " ").replace(/\t+/g, " ").replace(/\s\s+/g, ' ').replace(/&amp;/g, '&').trim());
  }
  return array_temp;
}
/***********************************************************************************************************************/
function print_array(last_row_managed, array_results) {
  for (var i = 0; i < array_results.length; i++){
    sheet.getRange(last_row_managed, 2 + i).setValue(array_results[i]).setNumberFormat("@").setHorizontalAlignment("center");
  }
}
