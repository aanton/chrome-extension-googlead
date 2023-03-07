import { readQueryParameter, readHeader } from './utils.js';

export const isAdsRequest = function (request) {
  return !!readQueryParameter(request.request.queryString, 'iu_parts');
};

export const analyzeAdsRequest = function (request) {
  const adUnitsCodes = readQueryParameter(request.request.queryString, 'enc_prev_ius').split(',');
  const adUnitsRaw = readQueryParameter(request.request.queryString, 'iu_parts').split(',');

  const adUnits = adUnitsCodes.map((code) => {
    return code
      .split('/')
      .filter(Boolean)
      .map((id) => adUnitsRaw[id])
      .join('/');
  });

  const sizes = readQueryParameter(request.request.queryString, 'prev_iu_szs').split(',');
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
  const ppid = readQueryParameter(request.request.queryString, 'ppid') || undefined;

  return adUnits.map((adUnit, index) => {
    return {
      adUnit,
      sizes: sizes[index],
      slotTargetings: slotTargetings[index] || '',
      globalTargetings: globalTargetings || '',
      isNPA,
      isAnonymous,
      ppid,
      creativeId: creativeId[index],
      lineitemId: lineitemId[index],
      gdpr,
      gdprConsent,
      isUnfill: lineitemId[index] === '-2',
    };
  });
};

export const isBasicAdRequest = function (request) {
  return !!readQueryParameter(request.request.queryString, 'iu');
};

export const analyzeBasicAdRequest = function (request) {
  const adUnit = readQueryParameter(request.request.queryString, 'iu');
  const sizes = readQueryParameter(request.request.queryString, 'sz');
  const slotTargetings = readQueryParameter(request.request.queryString, 'scp');
  const globalTargetings = readQueryParameter(request.request.queryString, 'cust_params');
  const isNPA = readQueryParameter(request.request.queryString, 'npa') === '1';
  const creativeId = readHeader(request.response.headers, 'google-creative-id');
  const lineitemId = readHeader(request.response.headers, 'google-lineitem-id');

  const gdpr = readQueryParameter(request.request.queryString, 'gdpr') || undefined;
  const gdprConsent = readQueryParameter(request.request.queryString, 'gdpr_consent') || undefined;

  const isAnonymous = isNPA || !gdprConsent;
  const ppid = readQueryParameter(request.request.queryString, 'ppid') || undefined;

  return {
    adUnit,
    sizes,
    slotTargetings,
    globalTargetings,
    isNPA,
    isAnonymous,
    ppid,
    creativeId: creativeId,
    lineitemId: lineitemId,
    gdpr,
    gdprConsent,
  };
};
