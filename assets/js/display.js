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
  if (autoclear) removeClearButton();
  clearEl.addEventListener('click', handleClearButton);

  configureListenerForShortenedValues();
};

const configureListenerForShortenedValues = function() {
  document.addEventListener('click', (e) => {
    console.log(e.target);
    const element = e.target;

    if (!element.classList.contains('shortened')) return;

    const content = element.textContent;
    element.textContent = element.dataset.value;
    element.dataset.value = content;
  })
}

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
  ${data[0].globalTargetings ? `<div>&bullet; globalTargetings: ${formatParameters(data[0].globalTargetings)}</div>` : ''}
  ${data.map(_data => getSlotHtml(_data)).join('')}
</div>
  `;
  displayBlock(html);
};

const getSlotHtml = function(data) {
  return `
<div class="slot ${data.isUnfill ? 'unfill' : ''}">
  <h3>${data.adUnit}</h3>
  <div>&bullet; sizes: ${data.sizes}</div>
  ${data.slotTargetings ? `<div>&bullet; slotTargetings: ${formatParameters(data.slotTargetings)}</div>` : ''}
  <div>
    &bullet; creativeId: ${data.creativeId}
    &bullet; lineitemId: ${data.lineitemId}
  </div>
</div>
  `;
};

const getGdprHtml = function(data) {
  return `
<div class="gdpr">
${data.isNPA ? '&bullet; NPA' : ''}
&bullet; gdpr: ${data.gdpr}<br />
&bullet; gdpr_consent: ${formatLongValue(data.gdprConsent)}<br />
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
  return params.map((param) => formatLongValue(param)).join(' &#x2010; ');
};

const formatLongValue = function(value, maxLength = 40) {
  if (!value || value.length <= maxLength) {
    return value;
  }

  return `<span class="shortened" data-value="${value}">${value.slice(0, 40)}...</span>`;
};

export { initDisplay, displayNavigation, displayAdsRequest };
