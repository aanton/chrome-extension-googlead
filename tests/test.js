import { initDisplay, displayNavigation, displayMultipleAdsRequest } from '../assets/js/display.js';
import { analyzeMultipleAdsRequest } from '../assets/js/analyzeMultipleAdsRequest.js';

initDisplay();
displayNavigation(document.location);

const fetchRequest = async function(url) {
  const response = await fetch(url);
  const json = await response.json();
  displayMultipleAdsRequest(analyzeMultipleAdsRequest(json));
};

fetchRequest('./request-multiple-anonymous.json');
fetchRequest('./request-multiple.json');
