export const readQueryParameter = function(query, name) {
  const found = query.find(parameter => parameter.name === name);
  return found ? unescape(found.value) : false;
};

export const readHeader = function(header, name) {
  const found = header.find(parameter => parameter.name === name);
  return found ? found.value : false;
};
