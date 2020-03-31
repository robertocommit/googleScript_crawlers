var spreadsheet = SpreadsheetApp.openByUrl("YOUR_SHEET_URL");
var sheet_werkstatt = spreadsheet.getSheetByName("Werkstatt");
var sheet_data = spreadsheet.getSheetByName("Data");
var garages_url_tag_open = '<div class="pap-ss-main-list-table-logo" >';
var garages_url_tag_close = '">';
/***********************************************************************************************************************/
function crawler_wekstatt() {
  var last_row_data = getLastRow(sheet_data, 'A:A');
  var array_data = remove_dimension_2d_array(sheet_data.getRange(2, 1, last_row_data).getValues());
  var last_url_row = getLastRow(sheet_werkstatt, 'B:B');
  var url = sheet_werkstatt.getRange(last_url_row, 1).getValue();
  var html = String(UrlFetchApp.fetch(url, {'followRedirects' : false}).getContentText());
  var html_split = html.split(garages_url_tag_open);
  var array_urls = [];
  for (var i = 1; i < html_split.length; i++) {
    var html_split_temp = html_split[i].substring(0, html_split[i].indexOf(garages_url_tag_close)).replace('<a href="', '').trim();
    Logger.log(html_split_temp);
    if (array_data.indexOf(html_split_temp) == -1) {
      array_urls.push(html_split_temp);
    }
  }
  array_urls = array_urls.filter(function(item, pos) {
    return array_urls.indexOf(item) == pos;
  })
  sheet_werkstatt.getRange(last_url_row, 2).setValue(String(Utilities.formatDate(new Date(), spreadsheet.getSpreadsheetTimeZone(), "dd/MM HH:mm")));
  for (var i = 0; i < array_urls.length; i++) {
    sheet_data.getRange(i + last_row_data, 1).setValue(array_urls[i]);
  }
}
/***********************************************************************************************************************/
function getLastRow(sheet, column) {
  var column = sheet.getRange(column);
  var values = column.getValues();
  var iterator = 0;
  while ( values[iterator][0] != 0 ) {
    iterator++;
  }
  return iterator + 1;
}
/****************************************************************************************************************************/
function remove_dimension_2d_array(array) {
  var newArr = [];
  for(var i = 0; i < array.length; i++) {
    newArr = newArr.concat(array[i]);
  }
  return newArr;
}
