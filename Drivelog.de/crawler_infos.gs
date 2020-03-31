var spreadsheet = SpreadsheetApp.openByUrl("YOUR_SHEET_URL");
var sheet_data = spreadsheet.getSheetByName("Data");
var last_row_urls = getFirstEmptyRow('A:A');
var last_row_managed = getFirstEmptyRow('N:N');
var name_tag_open = '<h1 id="serviceProviderName" class="name">';
var name_tag_close = '</h1>'
var telephone_tag_open = '<span class="data phone" itemprop="telephone" >';
var telephone_tag_close = '</span>';
var street_tag_open = '<span itemprop="streetAddress" >';
var street_tag_close = '</span>';
var postal_tag_open = '<span itemprop="postalCode" >';
var postal_tag_close = '</span>';
var locality_tag_open = '<span id="serviceProviderLocation" itemprop="addressLocality" >';
var locality_tag_close = '</span>';
var review_tag_open = '<meta itemprop="ratingValue" content="';
var review_tag_close = '"';
var number_review_tag_open = '<meta itemprop="reviewCount" content="';
var number_review_tag_close = '"';
var opening_tag_open = '<!-- opening hours -->';
var opening_tag_close = '<!-- payment options -->';
var payment_tag_open = '<!-- payment options -->';
var payment_tag_close = 'certificates';
var car_tag_open = '<table class="services" id="_serviceprovider_view_drivelog_WAR_papportlet_brands">';
var car_tag_close = '</tr>';
var service_tag_open = '<table id="subServices" class="sp-services">';
var service_tag_close = '<!-- add empty cells -->';
var car_type_customer_service_tag_open = '<!-- car types and custom services -->';
var car_type_customer_service_tag_close = '<!-- for other types -->';
/***********************************************************************************************************************/
function crawler_infos() {
  if (last_row_managed < last_row_urls) {
    var start_time = new Date().getTime();
    for (var i = last_row_managed + 1; i <= last_row_urls; i++) {
      var website = sheet_data.getRange(i, 1).getValue();
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
  var time_extraction = String(Utilities.formatDate(new Date(), spreadsheet.getSpreadsheetTimeZone(), "dd/MM HH:mm"));
  try {
    var html = String(UrlFetchApp.fetch(website, {'followRedirects' : true}).getContentText());
    try {var name = extract_info_from_HTML(html, name_tag_open, name_tag_close);} catch (error) {var name = '/'} 
    try {var telephone = extract_info_from_HTML(html, telephone_tag_open, telephone_tag_close).replace(/ /g, "").replace(/\//g, "");} catch (error) {var telephone = '/'};
    try {var street = extract_info_from_HTML(html, street_tag_open, street_tag_close);} catch (error) {var street = '/'};
    try {var postal = extract_info_from_HTML(html, postal_tag_open, postal_tag_close);} catch (error) {var postal = '/'};
    try {var locality = extract_info_from_HTML(html, locality_tag_open, locality_tag_close);} catch (error) {var locality = '/'};
    try {var review = extract_info_from_HTML(html, review_tag_open, review_tag_close).replace('.', ',');} catch (error) {var review = '/'};
    try {var number_review = extract_info_from_HTML(html, number_review_tag_open, number_review_tag_close);} catch (error) {var number_review = '/'};
    try {var opening = extract_info_from_HTML(html, opening_tag_open, opening_tag_close);} catch (error) {var opening = '/'};
    try {var payment = extract_info_from_HTML(html, payment_tag_open, payment_tag_close);} catch (error) {var payment = '/'};
    try {var car = extract_info_from_HTML(html, car_tag_open, car_tag_close);} catch (error) {var car = '/'};
    try {var service = extract_info_from_HTML(html, service_tag_open, service_tag_close);} catch (error) {var service = '/'};
    try {var car_type_customer_service = extract_info_from_HTML(html, car_type_customer_service_tag_open, car_type_customer_service_tag_close);} catch (error) {var car_type_customer_service = '/'};    
    print_array(row, clean_info([name, telephone, street, postal, locality, review, number_review, opening, payment, car, service, car_type_customer_service, time_extraction]));
  }
  catch (error) {
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
    sheet_data.getRange(last_row_managed, 2 + i).setValue(array_results[i]).setNumberFormat("@").setHorizontalAlignment("center");
  }
}
/***********************************************************************************************************************/
function getFirstEmptyRow(column) {
  sheet_data.appendRow([null]);
  var column = sheet_data.getRange(column);
  var values = column.getValues();
  var iterator = 0;
  while ( values[iterator][0] != "" ) {
    iterator++;
  }
  return iterator;
}
