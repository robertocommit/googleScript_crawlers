function identify_first_last_row(sheet, col_name, text) {
  var rows = sheet.getDataRange();  
  var numRows = rows.getNumRows();
  var column = get_column_number_by_name(sheet, col_name);
  var range = sheet.getRange(1, column, numRows, 1).getValues(); 
  range = remove_dimension_2d_array(range);
  var first_position = range.indexOf(text) + 1;
  var last_position = range.lastIndexOf(text) + 1;
  var num_rows = last_position - first_position + 1;
  return [first_position, num_rows];
}


function get_column_number_by_name(sheet, col_name) {
  var range = sheet.getRange(1, 1, 1, sheet.getMaxColumns());
  var values = range.getValues();
  for (var row in values) {
    for (var col in values[row]) {
      if (values[row][col] == col_name) {
        var col_num = parseInt(col) + 1;
        return col_num;
      }
    }
  }
}

function remove_dimension_2d_array(array) {
  var newArr = [];
  for(var i = 0; i < array.length; i++) {
    newArr = newArr.concat(array[i]);
  }
  return newArr;
}

function getFirstEmptyRow(sheet, range) {
  var column = sheet.getRange(range);
  var values = column.getValues(); // get all data in one call
  var ct = 0;
  while ( values[ct][0] != "" ) {
    ct++;
  }
  return ct;
}
