/* Visual-only semantic composition hypotheses. This is NOT a dictionary or
   a machine-readable sense inventory and must not populate the production atlas. */
(() => {
  "use strict";
  const examples = [
    { written: "山", unit: "Illustrative character sense", meaning: "mountain",
      single: "⛰️", compound: null,
      note: "One familiar image is more readable than a forced composition." },
    { written: "水", unit: "Illustrative character sense", meaning: "water",
      single: "💧", compound: null,
      note: "One clear pictogram; another icon would add clutter, not information." },
    { written: "火", unit: "Illustrative character sense", meaning: "fire",
      single: "🔥", compound: null,
      note: "Simple pictogram; no invented semantic grammar needed." },
    { written: "学", unit: "Illustrative character use", meaning: "learn / study",
      single: "🎓", compound: ["📖", "🧠"], relation: "association", separator: "+",
      note: "Does a book and a brain convey learning more reliably than a graduation emoji?" },
    { written: "火山", unit: "Illustrative word sense", meaning: "volcano",
      single: "🌋", compound: ["🔥", "⛰️"], relation: "association", separator: "+",
      note: "A familiar dedicated icon may outperform the literal two-part rebus." },
    { written: "火车", unit: "Illustrative word sense", meaning: "train",
      single: "🚆", compound: null,
      note: "Don't infer word meaning from the separate characters for fire and vehicle." },
    { written: "生", unit: "Illustrative sense A of one character", meaning: "birth / being born",
      single: "👶", compound: ["🤰", "👶"], relation: "transition", separator: "→",
      note: "This is one possible meaning of 生, not a permanent icon for the character." },
    { written: "生", unit: "Illustrative sense B of one character", meaning: "raw / uncooked",
      single: null, compound: null,
      note: "No obvious emoji unambiguously means raw; abstain rather than choose a misleading image." },
    { written: "行", unit: "Illustrative selected sense", meaning: "walk / go",
      single: "🚶", compound: null,
      note: "Other senses of 行 must have their own records; this annotation is not universal." },
    { written: "好", unit: "Illustrative selected sense", meaning: "good",
      single: "👍", compound: null,
      note: "Conventions are cultural; this should be evaluated rather than assumed." }
  ];

  const grid = document.getElementById("semantic-specimens");
  const buttons = Array.from(document.querySelectorAll("[data-semantic-mode]"));
  const checkbox = document.getElementById("semantic-reveal");
  const status = document.getElementById("semantic-lab-status");
  if (!grid || !buttons.length || !checkbox || !status) return;
  let mode = "single";

  function node(tag, css, value) {
    const el = document.createElement(tag);
    if (css) el.className = css;
    if (value !== undefined) el.textContent = value;
    return el;
  }

  function expression(example) {
    const area = node("div", "semantic-expression");
    let tokens = null;
    if (mode === "single" && example.single) tokens = [example.single];
    if (mode === "compound" && example.compound) tokens = example.compound;
    if (mode === "gloss") {
      area.appendChild(node("span", "semantic-gloss", example.meaning));
    } else if (tokens) {
      area.setAttribute("role", "img");
      area.setAttribute("aria-label", mode === "compound"
        ? tokens.join(" " + example.relation + " ") + " (illustrative symbol sequence)"
        : "Illustrative symbol for " + example.meaning);
      tokens.forEach((token, i) => {
        if (i !== 0) {
          const operator = node("span", "semantic-operator", example.separator || "+");
          operator.setAttribute("aria-hidden", "true");
          area.appendChild(operator);
        }
        const image = node("span", "semantic-symbol", token);
        image.setAttribute("aria-hidden", "true");
        area.appendChild(image);
      });
    } else if (mode !== "plain") {
      area.appendChild(node("span", "semantic-abstain",
        "No clear " + (mode === "compound" ? "composition" : "single pictogram") +
        " — use the gloss"));
    }
    return area;
  }

  function render() {
    const fragment = document.createDocumentFragment();
    for (const ex of examples) {
      const card = node("article", "semantic-specimen");
      card.appendChild(node("span", "semantic-kind", ex.unit));
      const main = node("div", "semantic-main");
      const written = node("strong", "semantic-hanzi", ex.written);
      written.lang = "zh-Hans";
      main.append(written, expression(ex));
      card.appendChild(main);
      const meaning = node("p", "semantic-answer", "Intended meaning: " + ex.meaning);
      meaning.hidden = !checkbox.checked;
      card.appendChild(meaning);
      card.appendChild(node("p", "semantic-annotation-note", ex.note));
      fragment.appendChild(card);
    }
    grid.replaceChildren(fragment);
    status.textContent = (mode === "single" ? "One-emoji" :
      mode === "compound" ? "Two-/three-symbol" :
      mode === "gloss" ? "Gloss-only" : "Plain-character") +
      " experiment · " + examples.length + " illustrative meanings" +
      (checkbox.checked ? " · intended meanings shown" : " · intended meanings hidden");
    for (const button of buttons) {
      button.setAttribute("aria-pressed", String(button.dataset.semanticMode === mode));
    }
  }
  for (const button of buttons) {
    button.addEventListener("click", () => {
      mode = button.dataset.semanticMode;
      render();
    });
  }
  checkbox.addEventListener("change", render);
  render();
})();
