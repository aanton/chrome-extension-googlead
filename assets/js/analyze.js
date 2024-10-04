import { readQueryParameter, readHeader, parseJson } from './utils.js';

let captureAdditionalInformation = false;
let advertisersJson = {};

if (chrome.storage && chrome.storage.local) {
  const options = await chrome.storage.local.get(null);

  captureAdditionalInformation = options.captureAdditionalInformation ?? false;
  advertisersJson = parseJson(options.advertisersJson);

  chrome.storage.onChanged.addListener((changes) => {
    if (changes.captureAdditionalInformation?.newValue !== undefined) {
      captureAdditionalInformation = changes.captureAdditionalInformation.newValue;
    }

    if (changes.advertisersJson?.newValue !== undefined) {
      advertisersJson = parseJson(changes.advertisersJson.newValue);
    }
  });
}

export const isAdsRequest = function (request) {
  return !!readQueryParameter(request.request.queryString, 'iu_parts');
};

export const analyzeAdsRequest = async function (request) {
  const parsedContentResponse = await parseContentResponse(request);

  const adUnitsCodes = readQueryParameter(request.request.queryString, 'enc_prev_ius').split(',');
  const adUnitsRaw = readQueryParameter(request.request.queryString, 'iu_parts').split(',');

  const adUnits = adUnitsCodes.map((code) => {
    return '/' + code
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

  const video = null;

  return adUnits.map((adUnit, index) => {
    const orderId = parsedContentResponse[index]?.orderId;
    const advertiserId = parsedContentResponse[index]?.advertiserId;
    const sizeWinner = parsedContentResponse[index]?.size;

    const advertiserWinner = advertiserId && advertisersJson[advertiserId]
      ? advertisersJson[advertiserId]
      : null;

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
      orderId,
      advertiserId,
      advertiserWinner,
      sizeWinner,
      isUnfill: lineitemId[index] === '-2',
      gdpr,
      gdprConsent,
      video,
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

  const orderId = null;
  const advertiserId = null;
  const advertiserWinner = null;
  const sizeWinner = null;

  const gdpr = readQueryParameter(request.request.queryString, 'gdpr') || undefined;
  const gdprConsent = readQueryParameter(request.request.queryString, 'gdpr_consent') || undefined;

  const isAnonymous = isNPA || !gdprConsent;
  const ppid = readQueryParameter(request.request.queryString, 'ppid') || undefined;

  // https://support.google.com/admanager/answer/10655276?hl=en
  const video = {
    env: readQueryParameter(request.request.queryString, 'env') || undefined,
    // gdfp_req: readQueryParameter(request.request.queryString, 'gdfp_req'),
    output: readQueryParameter(request.request.queryString, 'output') || undefined,
    plcmt: readQueryParameter(request.request.queryString, 'plcmt') || undefined,
    // unviewed_position_start: readQueryParameter(request.request.queryString, 'unviewed_position_start'),
    vpa: readQueryParameter(request.request.queryString, 'vpa') || undefined,
    vpmute: readQueryParameter(request.request.queryString, 'vpmute') || undefined,
    vpos: readQueryParameter(request.request.queryString, 'vpos') || undefined,
  }

  return {
    adUnit,
    sizes,
    slotTargetings,
    globalTargetings,
    isNPA,
    isAnonymous,
    ppid,
    creativeId,
    lineitemId,
    orderId,
    advertiserId,
    advertiserWinner,
    sizeWinner,
    isUnfill: lineitemId === '-2',
    gdpr,
    gdprConsent,
    video: video.env ? video : null,
  };
};

const parseContentResponse = async function (request) {
  if (!captureAdditionalInformation) return Promise.resolve({});
  if (!request.getContent) return Promise.resolve({});

  return new Promise((resolve) => {
    request.getContent((content) => {
      if (!content) return resolve([]);
      if (!content.startsWith('{')) return resolve([]);

      const data = content
        .split('\n')
        .filter((line) => line.startsWith('{') && line.endsWith('}'))
        .map((line) => JSON.parse(line))
        .map((raw) => {
          return Object.values(raw).map((value) => {
            const advertiserId = Array.isArray(value[16]) ? value[16][0] : null;
            const orderId = Array.isArray(value[17]) ? value[17][0] : null;

            const width = value[6];
            const height = value[5];
            const size = width && height ? { width, height } : null;

            return {
              advertiserId,
              orderId,
              size,
            };
          });
        })
        .map((value) => value[0]);

      resolve(data);
    });
  });
};
