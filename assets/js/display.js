const autoclear = true;

const contentEl = document.getElementById('content');
const clearEl = document.getElementById('clear');

const removeClearButton = function() {
  clearEl.style = 'display:none';
};

const handleClearButton = function(e) {
  e.preventDefaul();
  clearAll();
};

const clearAll = function() {
  contentEl.innerHTML = '';
};

export const initDisplay = function() {
  if (autoclear) {
    return removeClearButton();
  }

  clearEl.addEventListener('click', handleClearButton);
};

export const displayBlock = function(message) {
  if (typeof message == 'object') {
    message = `<pre>${JSON.stringify(message, null, 2)}</pre>`;
  }

  contentEl.insertAdjacentHTML('beforeend', message);
  contentEl.scrollTo(0, contentEl.scrollHeight);
};

export const clearDisplayIfAutoclear = function() {
  if (autoclear) {
    clearAll();
  }
};
