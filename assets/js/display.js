const autoclear = true;

const contentEl = document.getElementById('content');
const clearEl = document.getElementById('clear');

const removeClearButton = function() {
  clearEl.style = 'display:none';
};

const handleClearButton = function(e) {
  e.preventDefaul();
  clearAll();
};

const clearAll = function() {
  contentEl.innerHTML = '';
};

const initDisplay = function() {
  if (autoclear) {
    return removeClearButton();
  }

  clearEl.addEventListener('click', handleClearButton);
};

const displayNavigation = function(url) {
  if (autoclear) {
    clearAll();
  }

  displayBlock(`<div class="navigation">Navigate to <span>${url}</span></div>`);
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

const displayBlock = function(message) {
  if (typeof message == 'object') {
    message = `<pre>${JSON.stringify(message, null, 2)}</pre>`;
  }

  contentEl.insertAdjacentHTML('beforeend', message);
  contentEl.scrollTo(0, contentEl.scrollHeight);
};

const formatParameters = function(str) {
  const params = str.split('&');
  params.sort();
  return params.join(' &#x2010; ');
};

export { initDisplay, displayNavigation, displayNormalAdRequest, displayMultipleAdsRequest };
