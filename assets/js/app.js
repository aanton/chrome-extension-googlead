import { initDisplay, displayNavigation, displayAdsRequest } from './display.js';
import { isAdsRequest, analyzeAdsRequest, isBasicAdRequest, analyzeBasicAdRequest } from './analyze.js';

const init = function() {
  initDisplay();

  // https://developer.chrome.com/docs/extensions/reference/api/devtools/network
  chrome.devtools.network.onRequestFinished.addListener(handleRequest);
  chrome.devtools.network.onNavigated.addListener(handleNavigation);
};

const handleNavigation = function(url) {
  displayNavigation(url);
};

const handleRequest = async function(request) {
  if (!request.request.url.match(/ads\?/)) {
    return;
  }

  if (request.response.status === 400 && request.response.statusText === 'Service Worker Fallback Required') {
    return;
  }

  if (isAdsRequest(request)) {
    displayAdsRequest(await analyzeAdsRequest(request));
    return;
  }

  if (isBasicAdRequest(request)) {
    displayAdsRequest([analyzeBasicAdRequest(request)]);
    return;
  }
};

init();
