// This script is used in the Options page

const optionsForm = document.getElementById('options-form');
const saveButton = document.getElementById('save');

const saveOptions = function(e) {
  e.preventDefault();
  saveButton.disabled = true;

  // @todo Validate JSON
  if (!optionsForm.advertisersJson.value) {
    optionsForm.advertisersJson.value = '{}';
  }

  chrome.storage.local.set(
    {
      networkId: optionsForm.networkId.value,
      showOverlay: optionsForm.showOverlay.checked,
      featuredTargetings: optionsForm.featuredTargetings.value,
      preserveLog: optionsForm.preserveLog.checked,
      captureAdditionalInformation: optionsForm.captureAdditionalInformation.checked,
      advertisersJson: optionsForm.advertisersJson.value,
      amazonBidsJson: optionsForm.amazonBidsJson.value,
      hideGdprConsent: optionsForm.hideGdprConsent.checked,
      hidePpid: optionsForm.hidePpid.checked,
      hideGlobalTargetings: optionsForm.hideGlobalTargetings.checked,
      hideSlotsTargetings: optionsForm.hideSlotsTargetings.checked,
      hideSlotsSizes: optionsForm.hideSlotsSizes.checked,
    },
    () => {
      saveButton.textContent = 'Options saved';

      setTimeout(() => {
        saveButton.disabled = false;
        saveButton.textContent = 'Save';
      }, 1000);
    }
  );
}

const restoreOptions = function(e) {
  chrome.storage.local.get(
    null,
    (data) => {
      optionsForm.networkId.value = data.networkId ?? '';
      optionsForm.showOverlay.checked = data.showOverlay ?? false;
      optionsForm.featuredTargetings.value = data.featuredTargetings ?? '';
      optionsForm.preserveLog.checked = data.preserveLog ?? false;
      optionsForm.captureAdditionalInformation.checked = data.captureAdditionalInformation ?? false;
      optionsForm.advertisersJson.value = data.advertisersJson ?? '{}';
      optionsForm.amazonBidsJson.value = data.amazonBidsJson ?? '{}';
      optionsForm.hideGdprConsent.checked = data.hideGdprConsent ?? true;
      optionsForm.hidePpid.checked = data.hidePpid ?? true;
      optionsForm.hideGlobalTargetings.checked = data.hideGlobalTargetings ?? false;
      optionsForm.hideSlotsTargetings.checked = data.hideSlotsTargetings ?? false
      optionsForm.hideSlotsSizes.checked = data.hideSlotsSizes ?? false;
    }
  );
}

document.addEventListener('DOMContentLoaded', restoreOptions);
saveButton.addEventListener('click', saveOptions);
