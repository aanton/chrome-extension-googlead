import { formatParameters } from './utils.js';
import { isNormalAdRequest, analyzeNormalAdRequest } from './analyzeNormalAdRequest.js';
import { isSingleAdsRequest, analyzeSingleAdsRequest } from './analyzeSingleAdsRequest.js';

const autoclear = true;

const contentEl = document.getElementById('content');
const clearEl = document.getElementById('clear');

const displayHtml = function(message) {
  const html = typeof message == 'object' ? `<pre>${JSON.stringify(message, null, 2)}</pre>` : message;
  contentEl.insertAdjacentHTML('beforeend', html);
  contentEl.scrollTo(0, contentEl.scrollHeight);
};

const clearHtml = function() {
  contentEl.innerHTML = '';
};

const hideClearButton = function() {
  clearEl.style = 'display:none';
};

const handleClearButton = function() {
  clearHtml();
};

const init = function() {
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
  if (autoclear) {
    clearHtml();
  }

  displayHtml(`<div>Navigate to ${url}</div>`);
};

const handleRequest = function(request) {
  if (!request.request.url.match(/ads\?/)) {
    return;
  }

  if (request.response.status === 400 && request.response.statusText === 'Service Worker Fallback Required') {
    return;
  }

  if (isNormalAdRequest(request)) {
    displayNormalAdRequest(analyzeNormalAdRequest(request));
    return;
  }

  if (isSingleAdsRequest(request)) {
    displaySingleAdsRequest(analyzeSingleAdsRequest(request));
    return;
  }

  // log(request);
};

const displayNormalAdRequest = function(data) {
  const html = `
<div>
  <h3>${data.adUnit} ${data.isAnonymous ? 'NPA' : ''}</h3>
  <div>&bullet; sizes: ${data.sizes}</div>
  ${data.globalTargetings ? `<div>&bullet; globalTargetings: ${formatParameters(data.globalTargetings)}</div>` : ''}
  ${data.slotTargetings ? `<div>&bullet; slotTargetings: ${formatParameters(data.slotTargetings)}</div>` : ''}
  <div>
    &bullet; creativeId: ${data.creativeId}
    &bullet; lineitemId: ${data.lineitemId}
  </div>
</div>
  `;

  displayHtml(html);
};

const displaySingleAdsRequest = function(data) {
  const adUnitPrefix = data[0].adUnitPrefix;
  const slots = data.map(_data => _data.slot).join(',');
  const isAnonymous = data[0].isAnonymous;

  displayHtml(`<h2>SingleRequest of ${adUnitPrefix} for ${slots} ${isAnonymous ? 'NPA' : ''}</h2>`);
  data.forEach(_data => displayNormalAdRequest(_data));
};

init();
