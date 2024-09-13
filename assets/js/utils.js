export const readQueryParameter = function(query, name) {
  const found = query.find(parameter => parameter.name === name);
  return found ? unescape(found.value) : false;
};

export const readHeader = function(header, name) {
  const found = header.find(parameter => parameter.name === name);
  return found ? found.value : false;
};

export const wait = function (ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const debounce = function (callback, wait) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => callback(...args), wait);
  };
};

export const parseJson = function (value) {
  if (!value) return {}

  try {
    return JSON.parse(value);
  } catch (e) {
    console.error('Invalid JSON', value);
  }

  return {};
}