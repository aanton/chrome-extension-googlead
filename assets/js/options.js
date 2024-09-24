// This script is used in the Options page

const optionsFormElement = document.getElementById('options-form');
const statusElement = document.getElementById('status');

const saveOptions = function(e) {
  e.preventDefault();

  // @todo Validate JSON
  if (!optionsFormElement.advertisersJson.value) {
    optionsFormElement.advertisersJson.value = '{}';
  }

  chrome.storage.local.set(
    {
      networkId: optionsFormElement.networkId.value,
      preserveLog: optionsFormElement.preserveLog.checked,
      captureAdditionalInformation: optionsFormElement.captureAdditionalInformation.checked,
      advertisersJson: optionsFormElement.advertisersJson.value,
      amazonBidsJson: optionsFormElement.amazonBidsJson.value,
      hideGdprConsent: optionsFormElement.hideGdprConsent.checked,
      hidePpid: optionsFormElement.hidePpid.checked,
      hideGlobalTargetings: optionsFormElement.hideGlobalTargetings.checked,
      hideSlotsTargetings: optionsFormElement.hideSlotsTargetings.checked,
      hideSlotsSizes: optionsFormElement.hideSlotsSizes.checked,
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
    null,
    (data) => {
      optionsFormElement.networkId.value = data.networkId ?? '';
      optionsFormElement.preserveLog.checked = data.preserveLog ?? false;
      optionsFormElement.captureAdditionalInformation.checked = data.captureAdditionalInformation ?? false;
      optionsFormElement.advertisersJson.value = data.advertisersJson ?? '{}';
      optionsFormElement.amazonBidsJson.value = data.amazonBidsJson ?? '{}';
      optionsFormElement.hideGdprConsent.checked = data.hideGdprConsent ?? true;
      optionsFormElement.hidePpid.checked = data.hidePpid ?? true;
      optionsFormElement.hideGlobalTargetings.checked = data.hideGlobalTargetings ?? false;
      optionsFormElement.hideSlotsTargetings.checked = data.hideSlotsTargetings ?? false
      optionsFormElement.hideSlotsSizes.checked = data.hideSlotsSizes ?? false;
    }
  );
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);
