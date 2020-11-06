import { readQueryParameter, readHeader } from './utils.js';

export const isAdsRequests = function (request) {
  return !!readQueryParameter(request.request.queryString, 'iu_parts');
};

export const analyzeAdsRequests = function (request) {
  let sizes = readQueryParameter(request.request.queryString, 'prev_iu_szs').split(',');
  const count = sizes.length;

  const adUnitsRaw = readQueryParameter(request.request.queryString, 'iu_parts');
  const tokens = adUnitsRaw.split(',');
  const adUnitPrefix = tokens.slice(0, -1 * count).join('/');
  const slots = tokens.slice(-1 * count);

  let slotTargetings = readQueryParameter(request.request.queryString, 'prev_scp');
  const globalTargetings = readQueryParameter(request.request.queryString, 'cust_params');
  const isNPA = readQueryParameter(request.request.queryString, 'npa') === '1';
  let creativeId = readHeader(request.response.headers, 'google-creative-id');
  let lineitemId = readHeader(request.response.headers, 'google-lineitem-id');

  slotTargetings = slotTargetings ? slotTargetings.split('|') : false;
  creativeId = creativeId ? creativeId.split(',') : [];
  lineitemId = lineitemId ? lineitemId.split(',') : [];

  const gdpr = readQueryParameter(request.request.queryString, 'gdpr') || undefined;
  const gdprConsent = readQueryParameter(request.request.queryString, 'gdpr_consent') || undefined;

  const isAnonymous = isNPA || !gdprConsent;

  return slots.map((slot, index) => {
    const adUnit = `${adUnitPrefix}/${slot}`;

    return {
      adUnit,
      adUnitPrefix,
      slot,
      sizes: sizes[index],
      slotTargetings: slotTargetings[index] || '',
      globalTargetings: globalTargetings || '',
      isNPA,
      isAnonymous,
      creativeId: creativeId[index],
      lineitemId: lineitemId[index],
      gdpr,
      gdprConsent,
    };
  });
};