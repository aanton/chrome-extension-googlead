import { readQueryParameter, readHeader, formatParameters } from './utils.js';

const autoclear = true;

let lastPageUrl = false;
let lastAdUnit = false;

const loggerEl = document.getElementById('logger');
const clearEl = document.getElementById('clear');

const log = function(message, wrap = 'div') {
  const html = `
<${wrap}>
  ${typeof message == 'object' ? JSON.stringify(message) : message}
</${wrap}>
`;
  loggerEl.insertAdjacentHTML('beforeend', html);
  loggerEl.scrollTo(0, loggerEl.scrollHeight);
};

const clear = function() {
  loggerEl.innerHTML = '';
};

const hideClearButton = function() {
  clearEl.style = 'display:none';
};

const handleClearButton = function() {
  clear();
};

const init = function() {
  log('Extension loaded !');

  if (autoclear) {
    hideClearButton();
  } else {
    clearEl.addEventListener('click', handleClearButton);
  }

  // https://developer.chrome.com/extensions/devtools_network
  chrome.devtools.network.onRequestFinished.addListener(handleRequest);
  chrome.devtools.network.onNavigated.addListener(handleNavigation);
};

const handleNavigation = function(url) {
  lastPageUrl = url;
  lastAdUnit = false;

  if (autoclear) {
    clear();
  }
};

const handleRequest = function(request) {
  if (!request.request.url.match(/ads\?/)) {
    return;
  }

  if (request.response.status === 400 && request.response.statusText === 'Service Worker Fallback Required') {
    return;
  }

  let iu = readQueryParameter(request.request.queryString, 'iu');
  if (iu) {
    return analyzeSingleAdRequest(request);
  }

  iu = readQueryParameter(request.request.queryString, 'iu_parts');
  if (iu) {
    return analyzeMultipleAdRequest(request);
  }

  // log(request);
};

const analyzeSingleAdRequest = function(request) {
  const iu = readQueryParameter(request.request.queryString, 'iu');
  const sz = readQueryParameter(request.request.queryString, 'sz');
  const scp = readQueryParameter(request.request.queryString, 'scp');
  const cust_params = readQueryParameter(request.request.queryString, 'cust_params');
  const npa = readQueryParameter(request.request.queryString, 'npa');
  const creativeId = readHeader(request.response.headers, 'google-creative-id');
  const lineitemId = readHeader(request.response.headers, 'google-lineitem-id');

  const iuTokens = iu.split('/');
  const adUnit = iuTokens.slice(0, -1).join('/');
  const slot = iuTokens.slice(-1)[0];

  if (adUnit !== lastAdUnit) {
    lastAdUnit = adUnit;
    log(adUnit, 'h2');
    log(lastPageUrl);
  }

  log(slot + (npa == '1' ? ' NPA' : ''), 'h3');
  if (cust_params) log('&bullet; cust_params: ' + formatParameters(cust_params));
  if (scp) log('&bullet; scp: ' + formatParameters(scp));
  if (sz) log('&bullet; sz: ' + sz);
  if (creativeId || lineitemId) {
    log('&bullet; creative: ' + creativeId + ' &bull; lineitem: ' + lineitemId);
  }
};

const analyzeMultipleAdRequest = function(request) {
  const iu = readQueryParameter(request.request.queryString, 'iu_parts');
  let sz = readQueryParameter(request.request.queryString, 'prev_iu_szs');
  let scp = readQueryParameter(request.request.queryString, 'prev_scp');
  const cust_params = readQueryParameter(request.request.queryString, 'cust_params');
  const npa = readQueryParameter(request.request.queryString, 'npa');
  let creativeId = readHeader(request.response.headers, 'google-creative-id');
  let lineitemId = readHeader(request.response.headers, 'google-lineitem-id');

  sz = sz.split(',');
  scp = scp ? scp.split('|') : false;
  creativeId = creativeId ? creativeId.split(',') : [];
  lineitemId = lineitemId ? lineitemId.split(',') : [];

  const iuTokens = iu.split(',');
  const adUnit = iuTokens.slice(0, -1 * sz.length).join('/');
  const slots = iuTokens.slice(-1 * sz.length);

  if (adUnit !== lastAdUnit) {
    lastAdUnit = adUnit;
    log(adUnit, 'h2');
    log(lastPageUrl);
  }

  log('Single DFP request with slots ' + slots.join(',') + (npa == '1' ? ' NPA' : ''), 'h3');
  slots.forEach(function(slot, index) {
    log(slot, 'h3');
    if (cust_params) log('&bullet; cust_params: ' + formatParameters(cust_params));
    if (scp && scp[index]) log('&bullet; scp: ' + formatParameters(scp[index]));
    if (sz) log('&bullet; sz: ' + sz[index]);
    if (creativeId || lineitemId) {
      log('&bullet; creative: ' + creativeId[index] + ' &bull; lineitem: ' + lineitemId[index]);
    }
  });
};

init();
