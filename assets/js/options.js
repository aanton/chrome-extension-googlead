// This script is used in the Options page

const optionsFormElement = document.getElementById('options-form');
const statusElement = document.getElementById('status');

const saveOptions = function(e) {
  e.preventDefault();

  chrome.storage.local.set(
    {
      networkId: optionsFormElement.networkId.value,
      hideGdprConsent: optionsFormElement.hideGdprConsent.checked,
      hidePpid: optionsFormElement.hidePpid.checked,
      hideGlobalTargetings: optionsFormElement.hideGlobalTargetings.checked,
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
    ['networkId', 'hideGdprConsent', 'hidePpid', 'hideGlobalTargetings'],
    (data) => {
      optionsFormElement.networkId.value = data.networkId ?? '';
      optionsFormElement.hideGdprConsent.checked = data.hideGdprConsent ?? true;
      optionsFormElement.hidePpid.checked = data.hidePpid ?? true;
      optionsFormElement.hideGlobalTargetings.checked = data.hideGlobalTargetings ?? false;
    }
  );
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);
