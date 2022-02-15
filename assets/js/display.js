const autoclear = true;

const contentEl = document.getElementById('content');
const clearEl = document.getElementById('clear');

const removeClearButton = function() {
  clearEl.style = 'display:none';
};

const handleClearButton = function(e) {
  e.preventDefault();
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

const displayAdsRequest = function(data) {
  const isAnonymous = data[0].isAnonymous;
  const label = data.length === 1 ? 'slot' : 'slots';
  const datetime = new Date().toLocaleString();

  const html = `
<div class="block-ads multiple-ads ${isAnonymous ? 'anonymous' : ''}">
  <h2>Request for ${data.length} ${label} (${datetime})</h2>
  ${getGdprHtml(data[0])}
  ${data.map(_data => getSlotHtml(_data, true)).join('')}
</div>
  `;
  displayBlock(html);
};

const getSlotHtml = function(data, isMultipleRequest) {
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
  ${!isMultipleRequest ? getGdprHtml(data) : ''}
</div>
  `;
};

const getGdprHtml = function(data) {
  return `
<div class="gdpr">
${data.isNPA ? '&bullet; NPA' : ''}
&bullet; gdpr: ${data.gdpr}<br />
&bullet; gdpr_consent: ${data.gdprConsent}<br />
&bullet; ppid: ${data.ppid}
</div>
  `;
}

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

export { initDisplay, displayNavigation, displayAdsRequest };
