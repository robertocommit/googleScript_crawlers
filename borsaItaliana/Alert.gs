var spreadsheet = SpreadsheetApp.openByUrl('YOUR_SHEET_URL');
var sheet = spreadsheet.getSheetByName("Alerts");
function myFunction() {
  var new_row = getFirstEmptyRow(sheet, 'I:I');
  for (var x = 1; x <= new_row; x++) {
    var quote = sheet.getRange(x, 9).getValue();
    sheet.getRange(1, 1).setValue('=GOOGLEFINANCE("' + quote + '";"price";DATE(2017;5;1);DATE(2017;6;25))')
    sheet.getRange('A1:K').copyTo(sheet.getRange('A1:K'),{contentsOnly:true});
    var new_row = getFirstEmptyRow(sheet, 'A:A');
    Logger.log(new_row);
    for (var i = 5; i < new_row; i++) {
      
      //C3=IF(B3 > B2; 1; 0)
      sheet.getRange(i, 3).setValue('=IF(B' + i + '> B' + (i - 1) + ';1;"")');
      
      //D3=IF(C2;IF(
      sheet.getRange(i, 4).setValue('=IF(C' + (i - 2) + ';IF(C' + (i - 1) + '= 1; 1;"");"")');
      
      //
      sheet.getRange(i, 5).setValue('=IF(D' + i + '= 1;(B' + i + '- B' + (i - 1) + ');"")');
    }
    sheet.getRange('F1').setValue('=SUM(E' + 5 + ':E' + 100 + ')');
    sheet.getRange('A1:K').copyTo(sheet.getRange('A1:K'),{contentsOnly:true});
    var result = sheet.getRange('F1').getValue();
    sheet.getRange(x, 10).setValue(result); 
    sheet.getRange('A:H').clear();
    Utilities.sleep(5090);
  }
}



function getFirstEmptyRow(sheet, column) {
  var column = sheet.getRange(column);
  var values = column.getValues(); // get all data in one call
  var ct = 0;
  while ( values[ct][0] != "" ) {
    ct++;
  }
  return (ct);
}
