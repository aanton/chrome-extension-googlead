import { initDisplay, displayNavigation, displayAdsRequest } from './display.js';
import { isAdsRequests, analyzeAdsRequests } from './analyze-ads-requests.js';

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

  if (isAdsRequests(request)) {
    displayAdsRequest(analyzeAdsRequests(request));
    return;
  }
};

init();
