import { initDisplay, displayNavigation, displayAdsRequest } from './display.js';
import { isAdsRequest, analyzeAdsRequest, isBasicAdRequest, analyzeBasicAdRequest } from './analyze.js';
import { removeSlotsOverlay, showSlotsOverlay } from './overlay.js';
import { waitForCondition } from './utils.js';

let pendingAsyncRequests = 0;

let showOverlay = false;

if (chrome.storage && chrome.storage.local) {
  const options = await chrome.storage.local.get(null);

  showOverlay = options.showOverlay ?? false;

  chrome.storage.onChanged.addListener((changes) => {
    if (changes.showOverlay?.newValue !== undefined) {
      showOverlay = changes.showOverlay.newValue;

      if (!showOverlay) executeRemoveOverlaysScript();
    }
  });
}

const init = function() {
  initDisplay();

  // https://developer.chrome.com/docs/extensions/reference/api/devtools/network
  chrome.devtools.network.onRequestFinished.addListener(handleRequest);
  chrome.devtools.network.onNavigated.addListener(handleNavigation);

  // Comment next line to avoid running the overlay script on current page
  executeShowOverlaysScript();
};

const handleNavigation = async function (url) {
  waitForCondition(() => pendingAsyncRequests === 0).finally(() => {
    displayNavigation(url);
    executeShowOverlaysScript();
  });
};

const handleRequest = async function(request) {
  if (!request.request.url.match(/ads\?/)) {
    return;
  }

  if (request.response.status === 400 && request.response.statusText === 'Service Worker Fallback Required') {
    return;
  }

  if (isAdsRequest(request)) {
    pendingAsyncRequests++;
    const data = await analyzeAdsRequest(request);
    pendingAsyncRequests--;

    displayAdsRequest(data);
    return;
  }

  if (isBasicAdRequest(request)) {
    displayAdsRequest([analyzeBasicAdRequest(request)]);
    return;
  }
};

const executeShowOverlaysScript = function() {
  if (!showOverlay) return;

  chrome.scripting.executeScript(
    {
      function: showSlotsOverlay,
      target: { tabId: chrome.devtools.inspectedWindow.tabId },
      world: 'MAIN',
    }
  );
};

const executeRemoveOverlaysScript = function() {
  chrome.scripting.executeScript(
    {
      function: removeSlotsOverlay,
      target: { tabId: chrome.devtools.inspectedWindow.tabId },
      world: 'MAIN',
    }
  );
};

init();
