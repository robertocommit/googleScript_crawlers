var regex_html = /<(?:.|\n)*?>/gm;

function test_1() {
  var spreadsheet_id = 'YOUR_SPREADSHEET_ID';
  execute_crawler(spreadsheet_id);
}


function test_2() {
  Logger.log(crawl('ersatzteile-verschleissteile/bremsanlage/scheibenbremse/bremsscheibe', '1742AAV', '112138', 'Alfa Romeo'));
}

function crawl(category, hsn, ktypnr, brand) {
  var start_url = 'https://www.kfzteile24.de/' + category + '?ktypnr=' + ktypnr;
  var html = UrlFetchApp.fetch(start_url).getContentText("UTF-8");
  return extract_data(html, category, hsn, ktypnr, brand);
}


function extract_data(html, category, hsn, ktypnr, brand) {
  var car = get_car(html);
  return get_multiple_data(html, category, car, hsn, ktypnr, brand);
}


function get_multiple_data(html, category, car, hsn, ktypnr, brand) {
  var results = new Array();
  var html_split = html.split('<div class="art-name ">');
  for (var i = 1; i < html_split.length; i++) {
    var article_number = get_article_number(html_split[i]);
    var article_name = get_article_name(html_split[i]);
    var producer = get_producer(html_split[i]);
    var price = get_price(html_split[i]);
    var uvp = get_uvp(html_split[i]);
    var discount = get_rabatt(html_split[i]);
    var fitting = get_fitting(html_split[i]);
    results.push([hsn, ktypnr, car, brand, article_number, price, uvp, discount, fitting, article_name, producer, category]);
  }
  return results;
}


function get_car(html) {
  var index_start = html.indexOf('<div class="posRel inlineBlock">');
  var index_end = html.indexOf('<span class="bj">');
  return html.substring(index_start, index_end).replace(regex_html, '').replace(/&nbsp./g, '').trim();
}


function get_article_number(html) {
  var index_start = html.indexOf('<span id="selectableArtnr');
  var index_end = html.indexOf('<div class="art-logo min640">');
  return html.substring(index_start, index_end).replace(regex_html, '').replace(/&nbsp./g, '').trim();
}


function get_article_name(html) {
  var index_end = html.indexOf('</a>');
  return html.substring(0, index_end).replace(regex_html, '').replace(/&nbsp./g, '').trim();
}


function get_producer(html) {
  var index_start = html.indexOf('<img alt="') + '<img alt="'.length;
  var index_end = html.indexOf('" src="/im');
  return html.substring(index_start, index_end);
}


function get_price(html) {
  var index_start = html.indexOf('<span class="preis" >');
  var index_end = html.indexOf('<div class="art-preisInfo">');
  return html.substring(index_start, index_end).replace(regex_html, '').replace(/ &euro;/g, '').trim();
}


function get_fitting(html) {
  var index_start = html.indexOf('Einbauseite: ') + 'Einbauseite: '.length;
  var temp_html = html.substring(index_start)
  var index_end = temp_html.indexOf('<br');
  return temp_html.substring(0, index_end).trim();
}


function get_uvp(html) {
  var index_start = html.indexOf('<span>UVP: ') + '<span>UVP: '.length;
  var temp_html = html.substring(index_start)
  var index_end = temp_html.indexOf(' &euro;');
  var uvp = temp_html.substring(0, index_end).trim();
  if (uvp.length < 10) {
    return uvp;
  }
  else {
    return "";
  }
}


function get_rabatt(html) {
  var index_start = html.indexOf('Rabatt: <b>') + 'Rabatt: <b>'.length;
  var temp_html = html.substring(index_start)
  var index_end = temp_html.indexOf('</b>');
  var rabatt = temp_html.substring(0, index_end).trim()
  if (rabatt.length < 10) {
      return rabatt;
    }
  else {
    return "";
  }
}
