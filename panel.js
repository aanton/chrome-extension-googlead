var autoclear = true;

var log = function(message, wrap = 'div') {
  var logger = document.getElementById('log');
  logger.innerHTML +=
    '<' + wrap + '>' + (typeof message == 'object' ? JSON.stringify(message) : message) + '</' + wrap + '>\n';

  logger.scrollTo(0, logger.scrollHeight);
};

var run = function() {
  log('Extension loaded !');
  window.lastPageUrl = false;
  window.lastAdUnit = false;

  if (autoclear) {
    document.getElementById('clear').style = 'display:none';
  } else {
    document.getElementById('clear').addEventListener(
      'click',
      function() {
        clear();
      },
      false
    );
  }

  // https://developer.chrome.com/extensions/devtools_network
  chrome.devtools.network.onRequestFinished.addListener(function(request) {
    analyze(request);
  });

  chrome.devtools.network.onNavigated.addListener(function(url) {
    lastPageUrl = url;
    lastAdUnit = false;
    if (autoclear) {
      clear();
    }
  });
};

var clear = function() {
  var logger = document.getElementById('log');
  logger.innerHTML = '';
};

var analyze = function(request) {
  if (!request.request.url.match(/ads\?/)) {
    return;
  }

  if (request.response.status === 400 && request.response.statusText === 'Service Worker Fallback Required') {
    return;
  }

  var iu = readQueryParameter(request.request.queryString, 'iu');
  if (iu) {
    return analyzeSingleAdRequest(request);
  }

  var iu = readQueryParameter(request.request.queryString, 'iu_parts');
  if (iu) {
    return analyzeMultipleAdRequest(request);
  }

  // log(request);
};

var analyzeSingleAdRequest = function(request) {
  var iu = readQueryParameter(request.request.queryString, 'iu');
  var sz = readQueryParameter(request.request.queryString, 'sz');
  var scp = readQueryParameter(request.request.queryString, 'scp');
  var cust_params = readQueryParameter(request.request.queryString, 'cust_params');
  var npa = readQueryParameter(request.request.queryString, 'npa');
  var creativeId = readHeader(request.response.headers, 'google-creative-id');
  var lineitemId = readHeader(request.response.headers, 'google-lineitem-id');

  var adUnit = iu
    .split('/')
    .slice(0, -1)
    .join('/');
  var slot = iu.split('/').slice(-1)[0];

  if (adUnit !== window.lastAdUnit) {
    window.lastAdUnit = adUnit;
    log(adUnit, 'h2');
    log(lastPageUrl);
  }

  log(slot + (npa == '1' ? ' NPA' : ''), 'h3');
  if (cust_params) log('&bullet; cust_params: ' + formatParameters(cust_params));
  if (scp) log('&bullet; scp: ' + formatParameters(scp));
  if (sz) log('&bullet; sz: ' + sz);
  if (creativeId || lineitemId) log('&bullet; creative: ' + creativeId + ' &bull; lineitem: ' + lineitemId);
};

var analyzeMultipleAdRequest = function(request) {
  var iu = readQueryParameter(request.request.queryString, 'iu_parts');
  var sz = readQueryParameter(request.request.queryString, 'prev_iu_szs');
  var scp = readQueryParameter(request.request.queryString, 'prev_scp');
  var cust_params = readQueryParameter(request.request.queryString, 'cust_params');
  var npa = readQueryParameter(request.request.queryString, 'npa');
  var creativeId = readHeader(request.response.headers, 'google-creative-id');
  var lineitemId = readHeader(request.response.headers, 'google-lineitem-id');

  sz = sz.split(',');
  var adUnit = iu
    .split(',')
    .slice(0, -1 * sz.length)
    .join('/');
  var slots = iu.split(',').slice(-1 * sz.length);
  scp = scp ? scp.split('|') : false;
  creativeId = creativeId ? creativeId.split(',') : [];
  lineitemId = lineitemId ? lineitemId.split(',') : [];

  if (adUnit !== window.lastAdUnit) {
    window.lastAdUnit = adUnit;
    log(adUnit, 'h2');
    log(lastPageUrl);
  }

  log('Single DFP request with slots ' + slots.join(',') + (npa == '1' ? ' NPA' : ''), 'h3');
  slots.forEach(function(slot, index) {
    log(slot, 'h3');
    if (cust_params) log('&bullet; cust_params: ' + formatParameters(cust_params));
    if (scp && scp[index]) log('&bullet; scp: ' + formatParameters(scp[index]));
    if (sz) log('&bullet; sz: ' + sz[index]);
    if (creativeId || lineitemId)
      log('&bullet; creative: ' + creativeId[index] + ' &bull; lineitem: ' + lineitemId[index]);
  });
};

var readQueryParameter = function(query, name) {
  var found = query.find(function(parameter) {
    return parameter.name === name;
  });

  return found ? unescape(found.value) : false;
};

var readHeader = function(header, name) {
  var found = header.find(function(parameter) {
    return parameter.name === name;
  });

  return found ? found.value : false;
};

var formatParameters = function(str) {
  var params = str.split('&');
  params.sort();
  return params.join(' &#x2010; ');
};

run();
