/* Site-only appearance controls. Linguistic palettes and SVG stroke fills are unaffected.
   Every HTML page already loads theme.js, so the shared navigation loads from
   the same site root even in deeply nested generated research galleries. */
(() => {
  const source = document.currentScript;
  if (!source || !source.src) return;
  const script = document.createElement("script");
  script.src = new URL("navigation.js", source.src).href;
  script.async = false;
  document.head.appendChild(script);
})();

(() => {
  "use strict";
  const key = "chromalect-theme";
  const choices = ["system", "light", "dark"];
  let selected = "system";
  try {
    const stored = localStorage.getItem(key);
    if (choices.includes(stored)) selected = stored;
  } catch (_) {
    // Storage is optional; System is always available.
  }
  const root = document.documentElement;
  root.dataset.theme = selected;

  function choose(mode) {
    if (!choices.includes(mode)) return;
    selected = mode;
    root.dataset.theme = mode;
    try {
      if (mode === "system") localStorage.removeItem(key);
      else localStorage.setItem(key, mode);
    } catch (_) {
      // Browsers with disabled storage still allow switching on this page.
    }
  }

  function install() {
    if (document.getElementById("chromalect-appearance")) return;
    const fieldset = document.createElement("fieldset");
    fieldset.id = "chromalect-appearance";
    fieldset.className = "appearance-controls";
    fieldset.setAttribute("aria-label", "Site color theme");
    const legend = document.createElement("legend");
    legend.textContent = "Theme";
    fieldset.appendChild(legend);
    for (const mode of choices) {
      const label = document.createElement("label");
      const input = document.createElement("input");
      input.type = "radio";
      input.name = "chromalect-appearance";
      input.value = mode;
      input.checked = selected === mode;
      input.addEventListener("change", () => {
        if (input.checked) choose(mode);
      });
      const span = document.createElement("span");
      span.textContent = mode[0].toUpperCase() + mode.slice(1);
      label.append(input, span);
      fieldset.append(label);
    }
    const brand = document.querySelector("header .brand");
    if (brand) {
      brand.appendChild(fieldset);
    } else {
      const content = document.querySelector("main.wrap") || document.body;
      content.insertBefore(fieldset, content.firstChild);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", install, { once: true });
  } else {
    install();
  }
})();
