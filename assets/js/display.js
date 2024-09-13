let networkId = '';

if (chrome.storage && chrome.storage.local) {
  const options = await chrome.storage.local.get(null);
  console.log('Initial options:', options);

  networkId = options.networkId ?? '';
  document.body.classList.toggle('hide-gdpr-consent', options.hideGdprConsent ?? true);
  document.body.classList.toggle('hide-ppid', options.hidePpid ?? true);
  document.body.classList.toggle('hide-global-targetings', options.hideGlobalTargetings ?? false);
  document.body.classList.toggle('hide-slots-targetings', options.hideSlotsTargetings ?? false);

  chrome.storage.onChanged.addListener((changes) => {
    console.log('Update options', changes)

    if (changes.networkId?.newValue !== undefined) {
      networkId = changes.networkId.newValue;
    }

    if (changes.hideGdprConsent?.newValue !== undefined) {
      document.body.classList.toggle('hide-gdpr-consent', changes.hideGdprConsent.newValue);
    }

    if (changes.hidePpid?.newValue !== undefined) {
      document.body.classList.toggle('hide-ppid', changes.hidePpid.newValue);
    }

    if (changes.hideGlobalTargetings?.newValue !== undefined) {
      document.body.classList.toggle('hide-global-targetings', changes.hideGlobalTargetings.newValue);
    }

    if (changes.hideSlotsTargetings?.newValue !== undefined) {
      document.body.classList.toggle('hide-slots-targetings', changes.hideSlotsTargetings.newValue);
    }
  });
}

const autoclear = true;

const contentEl = document.getElementById('content');
const optionsEl = document.getElementById('options');
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
  optionsEl.addEventListener('click', () => chrome.runtime.openOptionsPage());

  if (autoclear) removeClearButton();
  clearEl.addEventListener('click', handleClearButton);

  configureListenerForShortenedValues();
};

const configureListenerForShortenedValues = function() {
  document.addEventListener('click', (e) => {
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

  const isUnfill = data.every(_data => _data.isUnfill)

  const html = `
<div class="block-ads multiple-ads ${isAnonymous ? 'anonymous' : ''} ${isUnfill ? 'unfill' : ''}">
  <h2>Request for ${data.length} ${label} (${datetime})</h2>
  ${getGdprHtml(data[0])}
  <div class="ppid">&bullet; ppid: ${data[0].ppid}</div>
  ${data[0].globalTargetings ? `<div class="global-targetings">&bullet; globalTargetings: ${formatParameters(data[0].globalTargetings)}</div>` : ''}
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
  ${data.slotTargetings ? `<div class="slots-targetings">&bullet; slotTargetings: ${formatParameters(data.slotTargetings)}</div>` : ''}
  <div>
    &bullet; creativeId: ${formatCreativeId(data.creativeId)}
    &bullet; lineitemId: ${formatLineItemId(data.lineitemId)}
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

const formatLineItemId = function(value) {
  if (!networkId) return value;
  if (value === '-1' || value === '-2') return value;

  const url = `https://admanager.google.com/${networkId}#delivery/line_item/detail/line_item_id=${value}&li_tab=settings`;
  return `<a href="${url}" target="_blank">${value}</a>`
}

const formatCreativeId = function(value) {
  if (!networkId) return value;
  if (value === '-1' || value === '-2') return value;

  const url = `https://admanager.google.com/${networkId}#creatives/creative/detail/creative_id=${value}`;
  return `<a href="${url}" target="_blank">${value}</a>`
}

export { initDisplay, displayNavigation, displayAdsRequest };
