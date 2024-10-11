import { debounce, parseJson } from "./utils.js";

const contentEl = document.getElementById('content');
const optionsEl = document.getElementById('options');
const clearEl = document.getElementById('clear');
const adunitFilterEl = document.querySelector('#adunitFilter input');
const adunitFilterStatusEl = document.querySelector('#adunitFilter span');

let networkId = '';
let featuredTargetings = [];
let preserveLog = false;
let amazonBidsJson = {};

if (chrome.storage && chrome.storage.local) {
  const options = await chrome.storage.local.get(null);
  console.log('Initial options:', options);

  networkId = options.networkId ?? '';
  featuredTargetings = (options.featuredTargetings ?? '').split(',').filter(Boolean);
  preserveLog = options.preserveLog ?? false;
  clearEl.classList.toggle('hide', !preserveLog);
  amazonBidsJson = parseJson(options.amazonBidsJson);
  document.body.classList.toggle('hide-gdpr-consent', options.hideGdprConsent ?? true);
  document.body.classList.toggle('hide-ppid', options.hidePpid ?? true);
  document.body.classList.toggle('hide-global-targetings', options.hideGlobalTargetings ?? false);
  document.body.classList.toggle('hide-slots-targetings', options.hideSlotsTargetings ?? false);
  document.body.classList.toggle('hide-slots-sizes', options.hideSlotsSizes ?? false);
  document.body.classList.toggle('hide-video', options.hideVideo ?? false);

  chrome.storage.onChanged.addListener((changes) => {
    console.log('Update options', changes)

    if (changes.networkId?.newValue !== undefined) {
      networkId = changes.networkId.newValue;
    }

    if (changes.featuredTargetings?.newValue !== undefined) {
      featuredTargetings = changes.featuredTargetings.newValue.split(',').filter(Boolean);
    }

    if (changes.preserveLog?.newValue !== undefined) {
      preserveLog = changes.preserveLog.newValue;
      clearEl.classList.toggle('hide', !preserveLog);
    }

    if (changes.amazonBidsJson?.newValue !== undefined) {
      amazonBidsJson = parseJson(changes.amazonBidsJson.newValue);
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

    if (changes.hideSlotsSizes?.newValue !== undefined) {
      document.body.classList.toggle('hide-slots-sizes', changes.hideSlotsSizes.newValue);
    }

    if (changes.hideVideo?.newValue !== undefined) {
      document.body.classList.toggle('hide-video', changes.hideVideo.newValue);
    }
  });
}

const handleClearButton = function(e) {
  e.preventDefault();
  clearAll();
};

const clearAll = function() {
  contentEl.innerHTML = '';
};

const initDisplay = function() {
  optionsEl.addEventListener('click', () => chrome.runtime.openOptionsPage());

  clearEl.addEventListener('click', handleClearButton);

  configureListenerForFilterAdunits();

  configureListenerForShortenedValues();
};

const configureListenerForFilterAdunits = function () {
  const handleInput = (e) => filterAdunits(e.target.value);
  adunitFilterEl.addEventListener('input', debounce(handleInput, 300));
};

const filterAdunits = function(filter) {
  document.querySelectorAll('.slot').forEach((slot) => {
    const slotNameEl = slot.querySelector('h3 span.adunit');

    const hide = filter && !slotNameEl.textContent.includes(filter);
    slotNameEl.closest('.slot').classList.toggle('hide', hide);
  });

  document.querySelectorAll('.block-ads').forEach((block) => {
    const hide = [...block.querySelectorAll('.slot:not(.hide)')].length === 0;
    block.classList.toggle('hide', hide);
  });

  const hiddenBlocks = document.querySelectorAll('.block-ads.hide');
  const hiddenSlots = document.querySelectorAll('.slot.hide');
  if (hiddenBlocks.length || hiddenSlots.length) {
    const message = `Hidden ${hiddenBlocks.length} requests & ${hiddenSlots.length} slots`;
    adunitFilterStatusEl.textContent = message;
  } else {
    adunitFilterStatusEl.textContent = '';
  }
}

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
  if (!preserveLog) clearAll();

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
  ${data[0].globalTargetings ? `<div class="global-targetings">&bullet; globalTargetings: ${formatTargetings(data[0].globalTargetings)}</div>` : ''}
  ${data.map(_data => getSlotHtml(_data)).join('')}
</div>
  `;
  displayBlock(html);

  if (adunitFilterEl.value) filterAdunits(adunitFilterEl.value);
};

const getSlotHtml = function(data) {
  return `
<div class="slot ${data.isUnfill ? 'unfill' : ''}">
  <h3>
    <span class="adunit">${data.adUnit}</span>
    ${getWinnerHtml(data)}
  </h3>
  <div class="slots-sizes">&bullet; sizes: ${formatSizes(data.sizes, data.sizeWinner)}</div>
  ${data.slotTargetings ? `<div class="slots-targetings">&bullet; slotTargetings: ${formatTargetings(data.slotTargetings)}</div>` : ''}
  ${getVideoHtml(data)}
  <div>
    &bullet; creative: ${formatCreativeId(data)}
    &bullet; lineitem: ${formatLineItemId(data)}
    ${data.orderId ? `&bullet; order: ${formatOrderId(data)}` : ''}
    ${data.advertiserId ? `&bullet; advertiser: ${formatAdvertiserId(data)}` : ''}
  </div>
</div>
  `;
};

const getWinnerHtml = function (data) {
  if (!data.advertiserWinner) return '';

  let bidInfo = '';
  if (data.advertiserWinner === 'amazon') {
    bidInfo = getAmazonWinnerHtml(data);
  } else if (data.advertiserWinner === 'prebid') {
    bidInfo = getPrebidWinnerHtml(data);
  }

  return `<span class="advertiser">${data.advertiserWinner} ${bidInfo}</span>`;
};

const getAmazonWinnerHtml = function (data) {
  const targetings = new URLSearchParams(data.slotTargetings);
  const price = getAmazonPrice(targetings.get('amznbid'));
  if (!price) return '';

  return `(${price})`;
}

const getAmazonPrice = function (bid) {
  bid = bid.replace(/^o_/, ''); // Remove prefix for outstream bids
  bid = bid.replace(/^v_/, ''); // Remove prefix for video bids
  bid = bid.replace(/^amp_/, ''); // Remove prefix for AMP bids
  return amazonBidsJson[bid] || '';
}

const getPrebidWinnerHtml = function (data) {
  const targetings = new URLSearchParams(data.slotTargetings);
  const bidder = targetings.get('hb_bidder');
  const price = targetings.get('hb_pb');
  if (!bidder || !price) return '';

  if (bidder === data.advertiserWinner) {
    return `(${price})`;
  }

  return `(${bidder}: ${price})`;
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

const getVideoHtml = function(data) {
  if (!data.video) return '';

  const html = Object.entries(data.video).map(([key, value]) => `${key}: ${value}`).join(' &bullet; ');
  return `<div class="video">&bullet; video: ${html}</div>`;
}

const displayBlock = function(message) {
  if (typeof message == 'object') {
    message = `<pre>${JSON.stringify(message, null, 2)}</pre>`;
  }

  contentEl.insertAdjacentHTML('beforeend', message);
  contentEl.scrollTo(0, contentEl.scrollHeight);
};

const formatSizes = function (sizes, sizeWinner) {
  const html = sizes
    .split('|')
    .map((size) => formatSize(size, sizeWinner))
    .join();

  const hasWinner = html.includes('<strong>');
  const winnerSizeNotFoundHtml =
    sizeWinner && !hasWinner ? ` (<strong>${sizeWinner.width}x${sizeWinner.height}</strong>)` : '';

  return html + winnerSizeNotFoundHtml;
};

const formatSize = function (size, sizeWinner) {
  const [width, height] = size.split('x');

  if (sizeWinner && Number(width) === sizeWinner.width && Number(height) === sizeWinner.height) {
    return `<strong>${width}x${height}</strong>`;
  }

  return `${width}x${height}`;
};

const formatTargetings = function (value) {
  const params = new URLSearchParams(value);
  params.sort();

  return '<ul>' + [...params.keys()].map((key) => formatTargeting(key, params.get(key))).join(' ') + '</ul>';
};

const formatTargeting = function (key, value) {
  if (key === 'amznbid') {
    const price = getAmazonPrice(value);
    value = price ? `${value} <span class="amazon-price">(${price})</span>` : value;
  } else {
    value = formatLongValue(value, 20);
  }

  return `<li ${featuredTargetings.includes(key) ? 'class="highlight"' : ''}>${key}=${value}</li>`;
};

const formatLongValue = function(value, maxLength = 40) {
  if (!value || value.length <= maxLength) {
    return value;
  }

  return `<span class="shortened" data-value="${value}">${value.slice(0, maxLength - 2)}&hellip;</span>`;
};

const formatLineItemId = function({ adUnit, lineitemId }) {
  if (!isValidNetwork(adUnit)) return lineitemId;
  if (lineitemId === '-1' || lineitemId === '-2') return lineitemId;

  const url = `https://admanager.google.com/${networkId}#delivery/line_item/detail/line_item_id=${lineitemId}&li_tab=settings`;
  return `<a href="${url}" target="_blank">${lineitemId}</a>`
}

const formatCreativeId = function({ adUnit, creativeId }) {
  if (!isValidNetwork(adUnit))  return creativeId;
  if (creativeId === '-1' || creativeId === '-2') return creativeId;

  const url = `https://admanager.google.com/${networkId}#creatives/creative/detail/creative_id=${creativeId}`;
  return `<a href="${url}" target="_blank">${creativeId}</a>`
}

const formatOrderId = function({ adUnit, orderId }) {
  if (!isValidNetwork(adUnit))  return orderId;
  if (!orderId) return orderId;

  const url = `https://admanager.google.com/${networkId}#delivery/order/order_overview/order_id=${orderId}`;
  return `<a href="${url}" target="_blank">${orderId}</a>`
}

const formatAdvertiserId = function({ adUnit, advertiserId }) {
  if (!isValidNetwork(adUnit))  return advertiserId;
  if (!advertiserId) return advertiserId;

  const url = `https://admanager.google.com/${networkId}#admin/company/detail/company_id=${advertiserId}`;
  return `<a href="${url}" target="_blank">${advertiserId}</a>`
}

const isValidNetwork = function (adUnit) {
  return networkId && adUnit.includes(networkId);
}

export { initDisplay, displayNavigation, displayAdsRequest };
