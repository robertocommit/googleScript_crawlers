var spreadsheet = SpreadsheetApp.openByUrl("YOUR_SHEET_URL");
var sheet_garages= spreadsheet.getSheetByName("Garages");
var last_row_latitude = getFirstEmptyRow(sheet_garages, 'C:C');
var last_row_urls = getFirstEmptyRow(sheet_garages, 'A:A');
function main_geo() {
  for (var i = last_row_latitude + 1; i <= last_row_urls; i++) {
    var city = sheet_garages.getRange(i, 1).getValue();
    var response = Maps.newGeocoder().geocode(city + ', Germany');
    for (var q = 0; q < response.results.length; q++) {
      sheet_garages.getRange(i, 3).setValue(response.results[q].geometry.location.lat);
      sheet_garages.getRange(i, 4).setValue(response.results[q].geometry.location.lng);
    }
  }
}
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
