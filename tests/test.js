import { initDisplay, displayNavigation, displayAdsRequest } from '../assets/js/display.js';
import { analyzeAdsRequest, analyzeBasicAdRequest, isAdsRequest, isBasicAdRequest } from '../assets/js/analyze.js';
import { wait } from '../assets/js/utils.js';

initDisplay();
displayNavigation(document.location);

const fetchRequest = async function(url) {
  const response = await fetch(url);
  const json = await response.json();

  if (isAdsRequest(json)) {
    displayAdsRequest(await analyzeAdsRequest(json));
    return;
  }

  if (isBasicAdRequest(json)) {
    displayAdsRequest([analyzeBasicAdRequest(json)]);
    return;
  }
};

fetchRequest('./request.json');
wait(2000).then(() => fetchRequest('./request-anonymous.json'));
wait(4000).then(() => fetchRequest('./request-unfill.json'));
wait(6000).then(() => fetchRequest('./request-basic.json'));
wait(8000).then(() => fetchRequest('./request-basic-unfill.json'));
