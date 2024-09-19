// This function is injected in the pages and must contain all the dependencies
// In the future it can be import dependencies & bundle them in a single file

export const showSlotsOverlay = function () {
  const STYLES = `
.__slot_overlay {
  position: absolute;
  box-sizing: border-box;
  z-index: 2;
  top: 0;
  left: 0;
  right: 0;
  min-height: 30px;
  width: 100%;
  line-height: 1;
  margin: 0 auto;
  padding: 5px 0;
  background-color: hsl(200, 75%, 85%);
  color: #000;
  font-size: 16px;
  font-weight: bold;
  text-align: center;
}

.__slot_overlay span {
  font-size: 12px;
  font-weight: normal;
  color: #333;
}
`;

  const injectStyles = () => {
    const uniqId = `__styles_overlay`;
    if (document.getElementById(uniqId)) return;

    const tag = document.createElement('style');
    tag.id = uniqId;
    tag.innerHTML = STYLES;

    document.head.appendChild(tag);
  };

  const createOverlay = (slot, size) => {
    const slotId = slot.getSlotElementId();

    const element = document.querySelector(`#${slotId} div[id^="google_ads"]`);
    if (!element) return null;

    const overlay = document.createElement('div');
    overlay.classList.add('__slot_overlay');

    element.querySelector('.__slot_overlay')?.remove();
    element.insertAdjacentElement('beforeEnd', overlay);

    // Make sure to set a style.position attribute to avoid miss aligning with absolute elements
    if (!element.style.position) element.style.position = 'relative';

    const { width, height } = size || getSize(element);
    overlay.innerHTML = `${slotId} <span>${width}x${height}</span>`;

    // @hack Force with but only if bigger than a minimum value
    if (width >= 100) overlay.style.width = `${width}px`;

    console.log(`Create overlay for ${slotId} (${width}x${height})`);
    return overlay;
  };

  const getSize = (element) => {
    const iframe = element.querySelector('iframe[id^="google_ads_iframe_"]');
    if (!iframe) return { width: 0, height: 0 };

    const width = iframe.clientWidth;
    const height = iframe.clientHeight;

    return { width, height };
  };

  window.googletag = window.googletag || {};
  window.googletag.cmd = window.googletag.cmd || [];
  window.googletag.cmd.push(() => {
    console.log('Running slots overlay');

    injectStyles();

    window.googletag
      .pubads()
      .getSlots()
      .forEach((slot) => {
        slot.getResponseInformation() && createOverlay(slot, null);
      });

    window.googletag.pubads().addEventListener('slotRenderEnded', (event) => {
      if (event.isEmpty) return;

      const size = { width: event.size[0], height: event.size[1] };
      createOverlay(event.slot, size);
    });
  });
};

export const removeSlotsOverlay = function () {
  document.querySelectorAll('.__slot_overlay').forEach((element) => element.remove());
}
