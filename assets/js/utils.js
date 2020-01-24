export const readQueryParameter = function(query, name) {
  const found = query.find(function(parameter) {
    return parameter.name === name;
  });

  return found ? unescape(found.value) : false;
};

export const readHeader = function(header, name) {
  const found = header.find(function(parameter) {
    return parameter.name === name;
  });

  return found ? found.value : false;
};

export const formatParameters = function(str) {
  const params = str.split('&');
  params.sort();
  return params.join(' &#x2010; ');
};
