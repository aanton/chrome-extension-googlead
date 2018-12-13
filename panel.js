var autoclear = true;

var log = function(message, wrap = 'div') {
  var logger = document.getElementById('log');
  logger.innerHTML += 
    '<' + wrap + '>' +
    (typeof message == 'object' ? JSON.stringify(message) : message) +
    '</' + wrap + '>\n';

  logger.scrollTo(0, logger.scrollHeight);
};

var run = function() {
  log('Extension loaded !');
  window.lastPageUrl = false;
  window.lastAdUnit = false;

  if (autoclear) {
    document.getElementById('clear').style = 'display:none';
  } else {
    document.getElementById('clear').addEventListener('click', function() {
      clear();
    }, false);
  }

  // https://developer.chrome.com/extensions/devtools_network
  chrome.devtools.network.onRequestFinished.addListener(
    function(request) {
      analyze(request);
  });

  chrome.devtools.network.onNavigated.addListener(
    function(url) {
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
}

var analyze = function(request) {
  if (! request.request.url.match(/ads\?/)) {
    return;
  }

  var iu = readQueryParameter(request.request.queryString, 'iu');
  var sz = readQueryParameter(request.request.queryString, 'sz');
  var scp = readQueryParameter(request.request.queryString, 'scp');
  var cust_params = readQueryParameter(request.request.queryString, 'cust_params');
  var npa = readQueryParameter(request.request.queryString, 'npa');

  if (! iu) {
    return;
  }

  var adUnit = iu.split('/').slice(0, -1).join('/');
  var slot = iu.split('/').slice(-1)[0];

  if (adUnit !== window.lastAdUnit) {
    window.lastAdUnit = adUnit;
    log(adUnit, 'h2');
    log(lastPageUrl);
  }

  log(slot + (npa == '1' ? ' NPA' : ''), 'h3');
  if (cust_params) log('&bullet; cust_params: ' + cust_params);
  if (scp) log('&bullet; scp: ' + scp);
  if (sz) log('&bullet; sz: ' + sz);
}

var readQueryParameter = function(query, name) {
  var found = query.find(function(parameter) {
    return parameter.name === name;
  });
  
  return found ? unescape(found.value) : false;
};

run();