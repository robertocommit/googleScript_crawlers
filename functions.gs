function sitemap_parser(sheet, website_sitemap, first_tag_split, second_tag_split) {
  sheet.clear();
  var urls = extract_XML(website_sitemap, first_tag_split, second_tag_split);
  print_array(sheet, urls, 2, 1);
}
//////////////////////////////////////////////////////////////////////////////////////////////////////
function extract_XML(website, first_tag_split, second_tag_split) {
  var xml = UrlFetchApp.fetch(website).getContentText();
  var xml_split = xml.split(first_tag_split);
  var urls = [];
  for (var i = 1; i < xml_split.length; i++) {
    urls.push(xml_split[i].substring(0, xml_split[i].indexOf(second_tag_split)));
  }
  return urls;
}
//////////////////////////////////////////////////////////////////////////////////////////////////////
function print_array(sheet, array, row, column) {
  var toAddArray = [];
  for (var i = 0; i < array.length; ++i){
    toAddArray.push([array[i]]);
  }
  sheet.getRange(row, column, array.length, 1).setValues(toAddArray);
}
