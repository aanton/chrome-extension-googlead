import { initDisplay, displayNavigation, displayAdsRequest } from '../assets/js/display.js';
import { analyzeAdsRequest, analyzeBasicAdRequest, isAdsRequest, isBasicAdRequest } from '../assets/js/analyze.js';

initDisplay();
displayNavigation(document.location);

const fetchRequest = async function(url) {
  const response = await fetch(url);
  const json = await response.json();

  if (isAdsRequest(json)) {
    displayAdsRequest(analyzeAdsRequest(json));
    return;
  }

  if (isBasicAdRequest(json)) {
    displayAdsRequest([analyzeBasicAdRequest(json)]);
    return;
  }
};

fetchRequest('./request-anonymous.json');
fetchRequest('./request.json');
fetchRequest('./request-basic.json');
