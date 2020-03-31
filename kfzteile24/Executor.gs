function execute_crawler(id) {
  var spreadsheet = SpreadsheetApp.openById(id);
  var sheet_input = spreadsheet.getSheetByName('Input');
  var sheet_output = spreadsheet.getSheetByName('Output');
  var last_row_urls = getFirstEmptyRow(sheet_input, 1);
  var last_row_managed = getFirstEmptyRow(sheet_input, 6);
  if (last_row_managed < last_row_urls) {
    for (var i = last_row_managed + 1; i <= last_row_urls; i++) {
      var inputs = sheet_input.getRange(i, 1, 1, 4).getValues();
      var time_extraction = String(Utilities.formatDate(new Date(), 'Etc/GMT', "dd/MM HH:mm"));
      sheet_input.getRange(i, 5).setValue(time_extraction);
      var results = crawl(inputs[0][0], inputs[0][1], inputs[0][2], inputs[0][3]);
      var new_row_output = getFirstEmptyRow(sheet_output, 1) + 1;
      try {
        sheet_output.getRange(new_row_output, 1, results.length, results[0].length).setValues(results);
        sheet_input.getRange(i, 6).setValue('OK'); 
      }
      catch (error) {
        sheet_input.getRange(i, 6).setValue('KO');   
      }
    }
  }
}

function getFirstEmptyRow(sheet, column) {
  sheet.appendRow([null]);
  var last_row = sheet.getLastRow() + 1;
  var column = sheet.getRange(1, column, last_row);
  var values = column.getValues();
  var iterator = 0;
  while (values[iterator][0] != "") {
    iterator++;
  }
  sheet.deleteRow(last_row);
  return iterator;
}
