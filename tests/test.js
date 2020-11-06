import { initDisplay, displayNavigation, displayAdsRequest } from '../assets/js/display.js';
import { analyzeAdsRequests } from '../assets/js/analyze-ads-requests.js';

initDisplay();
displayNavigation(document.location);

const fetchRequest = async function(url) {
  const response = await fetch(url);
  const json = await response.json();
  displayAdsRequest(analyzeAdsRequests(json));
};

fetchRequest('./request-anonymous.json');
fetchRequest('./request.json');
