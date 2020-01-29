import { formatParameters } from './utils.js';
import { initDisplay, displayBlock, clearDisplayIfAutoclear } from './display.js';
import { isNormalAdRequest, analyzeNormalAdRequest } from './analyzeNormalAdRequest.js';
import { isMultipleAdsRequest, analyzeMultipleAdsRequest } from './analyzeMultipleAdsRequest.js';

const init = function() {
  initDisplay();

  // https://developer.chrome.com/extensions/devtools_network
  chrome.devtools.network.onRequestFinished.addListener(handleRequest);
  chrome.devtools.network.onNavigated.addListener(handleNavigation);
};

const handleNavigation = function(url) {
  clearDisplayIfAutoclear();
  displayBlock(`<div class="navigation">Navigate to <span>${url}</span></div>`);
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

  if (isMultipleAdsRequest(request)) {
    displayMultipleAdsRequest(analyzeMultipleAdsRequest(request));
    return;
  }

  // displayBlock(request);
};

const displayNormalAdRequest = function(data) {
  const isAnonymous = data.isAnonymous;

  const html = `
<div class="block-ads normal-ad ${isAnonymous ? 'anonymous' : ''}">
  ${getSlotHtml(data)}
</div>
  `;
  displayBlock(html);
};

const displayMultipleAdsRequest = function(data) {
  const adUnitPrefix = data[0].adUnitPrefix;
  const slots = data.map(_data => _data.slot).join(',');
  const isAnonymous = data[0].isAnonymous;

  const html = `
<div class="block-ads multiple-ads ${isAnonymous ? 'anonymous' : ''}">
  <h2>SRA ${adUnitPrefix} for ${slots}</h2>
  ${data.map(_data => getSlotHtml(_data)).join('')}
</div>
  `;
  displayBlock(html);
};

const getSlotHtml = function(data) {
  return `
<div class="slot">
  <h3>${data.adUnit}</h3>
  <div>&bullet; sizes: ${data.sizes}</div>
  ${data.globalTargetings ? `<div>&bullet; globalTargetings: ${formatParameters(data.globalTargetings)}</div>` : ''}
  ${data.slotTargetings ? `<div>&bullet; slotTargetings: ${formatParameters(data.slotTargetings)}</div>` : ''}
  <div>
    &bullet; creativeId: ${data.creativeId}
    &bullet; lineitemId: ${data.lineitemId}
  </div>
</div>
  `;
};

init();
