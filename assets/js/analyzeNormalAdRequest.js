import { readQueryParameter, readHeader } from './utils.js';

export const isNormalAdRequest = function(request) {
  return !!readQueryParameter(request.request.queryString, 'iu');
};

export const analyzeNormalAdRequest = function(request) {
  const adUnit = readQueryParameter(request.request.queryString, 'iu');
  const tokens = adUnit.split('/');
  const adUnitPrefix = tokens.slice(0, -1).join('/');
  const slot = tokens.slice(-1)[0];

  const sizes = readQueryParameter(request.request.queryString, 'sz');
  const slotTargetings = readQueryParameter(request.request.queryString, 'scp');
  const globalTargetings = readQueryParameter(request.request.queryString, 'cust_params');
  const isAnonymous = readQueryParameter(request.request.queryString, 'npa') === '1';
  const creativeId = readHeader(request.response.headers, 'google-creative-id');
  const lineitemId = readHeader(request.response.headers, 'google-lineitem-id');

  let gdpr = readQueryParameter(request.request.queryString, 'gdpr');
  gdpr = gdpr !== false ? gdpr : undefined;
  const gdprConsent = readQueryParameter(request.request.queryString, 'gdpr_consent') || undefined;

  return {
    adUnit,
    adUnitPrefix,
    slot,
    sizes,
    slotTargetings,
    globalTargetings,
    isAnonymous,
    creativeId,
    lineitemId,
    gdpr,
    gdprConsent,
  };
};
