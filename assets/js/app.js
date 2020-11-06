import { initDisplay, displayNavigation, displayMultipleAdsRequest } from './display.js';
import { isMultipleAdsRequest, analyzeMultipleAdsRequest } from './analyzeMultipleAdsRequest.js';

const init = function() {
  initDisplay();

  // https://developer.chrome.com/extensions/devtools_network
  chrome.devtools.network.onRequestFinished.addListener(handleRequest);
  chrome.devtools.network.onNavigated.addListener(handleNavigation);
};

const handleNavigation = function(url) {
  displayNavigation(url);
};

const handleRequest = function(request) {
  if (!request.request.url.match(/ads\?/)) {
    return;
  }

  if (request.response.status === 400 && request.response.statusText === 'Service Worker Fallback Required') {
    return;
  }

  if (isMultipleAdsRequest(request)) {
    displayMultipleAdsRequest(analyzeMultipleAdsRequest(request));
    return;
  }
};

init();
