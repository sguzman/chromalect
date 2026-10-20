/* Independent presentation-layer preferences for the Mandarin static atlas. */
(() => {
  "use strict";
  const version = "v1";
  const permitted = new Set(["off", "direct", "marker"]);
  const channels = ["component", "reading", "tone"];
  const storageKey = channel => "chromalect-layer-" + version + "-" + channel;

  function install() {
    const controls = document.querySelector(".controls");
    if (!controls) return;
    for (const channel of channels) {
      const inputs = [...controls.querySelectorAll('input[type="radio"]')]
        .filter(input => input.name === channel && permitted.has(input.value));
      if (inputs.length !== 3) continue;
      let saved;
      try { saved = localStorage.getItem(storageKey(channel)); }
      catch (_) { saved = null; }
      if (permitted.has(saved)) {
        const match = inputs.find(input => input.value === saved && !input.disabled);
        if (match) match.checked = true;
      }
      for (const input of inputs) {
        input.addEventListener("change", () => {
          if (!input.checked || input.disabled) return;
          try { localStorage.setItem(storageKey(channel), input.value); }
          catch (_) { /* Controls still work without storage permission. */ }
        });
      }
    }
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", install, {once:true});
  } else install();
})();
