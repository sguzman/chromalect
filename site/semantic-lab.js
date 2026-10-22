/* Illustrative semantic expression specimens, not a sourced sense inventory.
   These examples are excluded from production Mandarin semantic coverage. */
(() => {
  "use strict";

  // Reusable symbols; a pictogram is not reserved for one character or sense.
  const emoji = Object.freeze({
    mountain: "⛰️", water: "💧", fire: "🔥", book: "📖",
    brain: "🧠", eyes: "👀", volcano: "🌋", train: "🚆",
    pregnant: "🤰", baby: "👶", walker: "🚶", approval: "👍"
  });

  // Each example names a selected meaning, not a permanent character identity.
  // The symbol array has no fixed length and may be absent.
  const examples = [
    { written: "山", unit: "Illustrative character sense", meaning: "mountain",
      symbols: [emoji.mountain],
      note: "One familiar picture conveys this selected sense." },
    { written: "水", unit: "Illustrative character sense", meaning: "water",
      symbols: [emoji.water],
      note: "One symbol is sufficient for this example." },
    { written: "火", unit: "Illustrative character sense", meaning: "fire",
      symbols: [emoji.fire],
      note: "No additional pictograms are needed." },
    { written: "学", unit: "Illustrative character use", meaning: "learn / study",
      symbols: [emoji.book, emoji.brain],
      note: "The book-and-brain expression is a hypothesis, not a fixed emoji definition." },
    { written: "读", unit: "Illustrative character use", meaning: "read",
      symbols: [emoji.eyes, emoji.book],
      note: "The book pictogram is shared with another expression; symbols are reusable." },
    { written: "火山", unit: "Illustrative word sense", meaning: "volcano",
      symbols: [emoji.volcano],
      note: "A single conventional pictogram can be clearer than a literal character-by-character combination." },
    { written: "火车", unit: "Illustrative word sense", meaning: "train",
      symbols: [emoji.train],
      note: "The word-level meaning is not generated from its two characters." },
    { written: "生", unit: "Illustrative sense A of one character", meaning: "birth / being born",
      symbols: [emoji.pregnant, emoji.baby],
      note: "Only one selected usage of 生; other meanings need separate entries." },
    { written: "生", unit: "Illustrative sense B of one character", meaning: "raw / uncooked",
      symbols: null,
      note: "No sufficiently clear expression is proposed for this usage." },
    { written: "行", unit: "Illustrative selected sense", meaning: "walk / go",
      symbols: [emoji.walker],
      note: "Other uses and meanings of 行 are not represented by this selection." },
    { written: "好", unit: "Illustrative selected sense", meaning: "good",
      symbols: [emoji.approval],
      note: "Conventional pictogram meanings still require testing." }
  ];

  const grid = document.getElementById("semantic-specimens");
  const buttons = Array.from(document.querySelectorAll("[data-semantic-mode]"));
  const checkbox = document.getElementById("semantic-reveal");
  const status = document.getElementById("semantic-lab-status");
  if (!grid || !buttons.length || !checkbox || !status) return;
  let mode = "symbols";

  function node(tag, css, value) {
    const el = document.createElement(tag);
    if (css) el.className = css;
    if (value !== undefined) el.textContent = value;
    return el;
  }

  function expression(example) {
    const area = node("div", "semantic-expression");
    if (mode === "plain") return area;

    const tokens = example.symbols;
    if (Array.isArray(tokens) && tokens.length > 0) {
      area.setAttribute("role", "img");
      area.setAttribute("aria-label", "Illustrative emoji expression: " + tokens.join(" "));
      for (const token of tokens) {
        const symbol = node("span", "semantic-symbol", token);
        symbol.setAttribute("aria-hidden", "true");
        area.appendChild(symbol);
      }
    } else {
      area.appendChild(node("span", "semantic-abstain", "No clear emoji expression"));
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
      const meaning = node("p", "semantic-answer", "Written meaning: " + ex.meaning);
      meaning.hidden = !checkbox.checked;
      card.appendChild(meaning);
      card.appendChild(node("p", "semantic-annotation-note", ex.note));
      fragment.appendChild(card);
    }
    grid.replaceChildren(fragment);
    status.textContent = (mode === "symbols" ? "Mixed emoji expressions" : "Plain Chinese") +
      " · " + examples.length + " illustrative meanings" +
      (checkbox.checked ? " · written meanings shown" : " · written meanings hidden");
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
