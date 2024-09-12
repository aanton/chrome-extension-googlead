// This script is used in the Options page

const networkIdElement = document.getElementById('networkId');
const statusElement = document.getElementById('status');

const saveOptions = function(e) {
  e.preventDefault();

  chrome.storage.local.set(
    {
      networkId: networkIdElement.value,
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
      networkIdElement.value = data.networkId ?? '';
    }
  );
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);
