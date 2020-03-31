function main_scraper(country, sheet_name, keyword, uule, iterations) {
  var spreadsheet = SpreadsheetApp.openByUrl('YOUR_SHEET_URL');
  var sheet_city = spreadsheet.getSheetByName(sheet_name);
  var sheet_historical_log = spreadsheet.getSheetByName('Historical_Log');
  var time_extraction = String(Utilities.formatDate(new Date(), 'Etc/GMT-2', "dd/MM/YYYY HH:mm:ss"));
  prepare_sheets(sheet_historical_log, sheet_city);
  scrape_google(sheet_city, country, uule, keyword, iterations, time_extraction);
  fill_logs(sheet_city, sheet_historical_log, keyword, time_extraction);
}

/**
Copy and paste values, delete old data and format columns
:param sheet_city: sheet of the city
:param sheet_historical_log: sheet contraining the historical data
**/
function prepare_sheets(sheet_historical_log, sheet_city) {
  var range_results_historical = sheet_historical_log.getRange('A1:F');
  range_results_historical.copyTo(sheet_historical_log.getRange('A1:F'), {contentsOnly: true}); 
  var range_results_city = sheet_city.getRange('F1:I');
  range_results_city.copyTo(sheet_city.getRange('F1:I'), {contentsOnly: true});
  sheet_city.getRange('A2:D').clear();
  sheet_city.getRange('A1:A').setNumberFormat('dd/MM/YYYY HH:mm:ss');
}

/**
Print on a Google Spreadsheet all the information crawled from a Google search page
:param sheet_city: sheet of the city
:param uule: code of the canonical location https://goo.gl/y7JTPP
:param keyword: keyword that will be searched on Google
:param iterations
:param time_extraction: keyword searched on Google
**/
function scrape_google(sheet_city, country, uule, keyword, iterations, time_extraction) {
  for (var r = 0; r < iterations; r++) {
    try {
      var times = new Array();
      var results =  new Array();
      var regex_results = /<li class="ads-ad(.*?)<\/li>/gi;
      var regex_link = /<cite class="_WGk">(.*?)<\/cite>/gi;
      var regex_html = /<(?:.|\n)*?>/gm;     
      var google_search_url = 'https://www.google.' + country + '/search?q=' + encodeURI(keyword) + '&adtest=on&uule=' + uule;
      var response = UrlFetchApp.fetch(google_search_url);
      var elems = response.getContentText().match(regex_results);
      var counter = 0;
      for(var i in elems) {
        try {
          var url = elems[i].match(regex_link)[0].replace(regex_html, '');
          results.push([time_extraction, counter + 1, keyword, url]);
          counter++;
        }
        catch (error) {}
      }
      var new_row = getFirstEmptyRow(sheet_city, 'A1:A') + 1;
      sheet_city.getRange(new_row, 1, results.length, results[0].length).setValues(results);
    }
    catch (error) {
      r--;
    }
  }
}

/**
Update the data with the latest values crawled from Google
:param sheet_city: sheet of the city
:param sheet_historical_log: sheet contraining the historical data
:param keyword: keyword searched on Google
:param time_extraction: time of the results crawled from Google
**/
function fill_logs(sheet_city, sheet_historical_log, keyword, time_extraction) {
  var all_urls = sheet_city.getRange('D2:D').getValues();
  var uniqueUrls = ArrayLib.unique(all_urls);
  fill_dashboard(sheet_city, time_extraction, uniqueUrls);
  fill_historical(sheet_city, sheet_historical_log, time_extraction, keyword, uniqueUrls);
}

/**
Update the table necessary to maintaine the dashboard updated
:param sheet_city: sheet of the city
:param time_extraction: time of the results crawled from Google
:param uniqueUrls: list of urls contained in Google's results
**/
function fill_dashboard(sheet_city, time_extraction, uniqueUrls) {
  var new_row = getFirstEmptyRow(sheet_city, 'F1:F');
  sheet_city.getRange(new_row + 1, 9, uniqueUrls.length, 1).setValues(uniqueUrls);
  var input_range = new Array();
  for (var i = 0; i < uniqueUrls.length; i++) {
    var data = new Array();
    data.push([time_extraction]);
    data.push(['=AVERAGEIF(D:D,I' + (new_row + 1 + i) + ',B:B)']);
    data.push(['=COUNTIF(D:D,I' + (new_row + 1 + i) + ')']);
    input_range.push(data);
  }
  sheet_city.getRange(new_row + 1, 6, input_range.length, input_range[0].length).setValues(input_range);
  delete_old_data(sheet_city);
}

/**
Delete oldest results from the table dashboard and add the latest in order to keep the dashboard up to date
:param sheet_city: sheet of the city
**/
function delete_old_data(sheet_city) {
  var oldest_data = sheet_city.getRange(2, 6).getValue();
  var first_last_row = identify_first_last_row(sheet_city, 'Crawl_Time', oldest_data);
  var last_row = sheet_city.getLastRow();
  var range = sheet_city.getRange(first_last_row[0] + first_last_row[1], 6, last_row, 4).getValues();
  sheet_city.getRange('F2:I').clear();
  sheet_city.getRange(2, 6, range.length, range[0].length).setValues(range);
}

/**
Update the sheet containing all the data crawler from Google
:param sheet_city: sheet of the city
:param sheet_historical_log: sheet with the historical data
:param time_extraction: time of the results crawled from Google
:param keyword: keyword searched on Google
:param uniqueUrls: list of urls contained in Google's results
**/
function fill_historical(sheet_city, sheet_historical_log, time_extraction, keyword, uniqueUrls) {
  var new_row = getFirstEmptyRow(sheet_historical_log, 'A1:A');
  sheet_historical_log.getRange(new_row + 1, 6, uniqueUrls.length, 1).setValues(uniqueUrls);
  var sheet_name = sheet_city.getName();
  var input_range = new Array();
  for (var i = 0; i < uniqueUrls.length; i++) {
    var data = new Array();
    data.push([time_extraction], [sheet_name], [keyword]);
    data.push(['=AVERAGEIF(' + sheet_name + '!D:D,F' + (new_row + 1 + i) + ',' + sheet_name+ '!B:B)']);
    data.push(['=COUNTIF(' + sheet_name + '!D:D,F' + (new_row + 1 + i) + ')']);
    input_range.push(data);
  }
  sheet_historical_log.getRange(new_row + 1, 1, input_range.length, input_range[0].length).setValues(input_range);
}
