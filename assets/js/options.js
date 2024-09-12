// This script is used in the Options page

const optionsFormElement = document.getElementById('options-form');
const statusElement = document.getElementById('status');

const saveOptions = function(e) {
  e.preventDefault();

  chrome.storage.local.set(
    {
      networkId: optionsFormElement.networkId.value,
    },
    () => {
      statusElement.textContent = 'Options saved';
      statusElement.style.display = 'block';

      setTimeout(() => {
        statusElement.textContent = '';
        statusElement.style.display = 'none';
      }, 1000);
    }
  );
}

const restoreOptions = function(e) {
  chrome.storage.local.get(
    ['networkId'],
    (data) => {
      optionsFormElement.networkId.value = data.networkId ?? '';
    }
  );
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);
