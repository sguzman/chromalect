/* Grammar-backed illustrative semantic expressions, not verified dictionary data. */
(() => {
  "use strict";
  const grammar = globalThis.ChromalectSemanticGrammar;
  const presenter = globalThis.ChromalectLayers;
  const grid = document.getElementById("semantic-specimens");
  const buttons = Array.from(document.querySelectorAll("[data-semantic-mode]"));
  const checkbox = document.getElementById("semantic-reveal");
  const status = document.getElementById("semantic-lab-status");
  const legend = document.getElementById("semantic-grammar-legend");
  if (!grammar || !presenter || !grid || !buttons.length || !checkbox || !status || !legend) return;
  let mode = "symbols";
  let examples = [];
  let profileRows = new Map();

  function node(tag, css, value) {
    const el = document.createElement(tag);
    if (css) el.className = css;
    if (value !== undefined) el.textContent = value;
    return el;
  }

  function expression(example) {
    const area = node("div", "semantic-expression");
    if (mode === "plain") return area;
    if (!example.expr) {
      area.appendChild(node("span", "semantic-abstain", "No clear emoji expression"));
      return area;
    }
    const tokens = grammar.emojiParts(example.expr);
    area.setAttribute("role", "img");
    area.setAttribute("aria-label", "Illustrative emoji expression: " + grammar.emojiDisplay(example.expr));
    for (const token of tokens) {
      const symbol = node("span", "semantic-symbol", token.text);
      symbol.setAttribute("aria-hidden", "true");
      area.appendChild(symbol);
    }
    return area;
  }

  function render() {
    const fragment = document.createDocumentFragment();
    for (const ex of examples) {
      const card = node("article", "semantic-specimen");
      card.appendChild(node("span", "semantic-kind",
        ex.written ? "Illustrative Mandarin meaning" : "Illustrative grammar example"));
      const main = node("div", "semantic-main");
      if (ex.written) {
        const written = node("div", "semantic-word-glyphs");
        for (const char of Array.from(ex.written)) {
          const row = profileRows.get(char);
          if (!row) throw new Error("Character missing from Mandarin profile");
          written.appendChild(presenter.createGlyph(row));
        }
        main.appendChild(written);
      }
      main.appendChild(expression(ex));
      card.appendChild(main);
      const meaning = node("p", "semantic-answer", "Written meaning: " + ex.meaning);
      meaning.hidden = !checkbox.checked;
      card.appendChild(meaning);
      card.appendChild(node("p", "semantic-annotation-note", ex.notes));
      fragment.appendChild(card);
    }
    grid.replaceChildren(fragment);
    status.textContent = (mode === "symbols" ? "Emoji expressions" : "Character presentation only") +
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

  async function load() {
    try {
      const [response, profileResponse] = await Promise.all([
        fetch("semantic-grammar-v0.1.json"),
        fetch("profiles/mandarin-1000-v1.json")
      ]);
      if (!response.ok || !profileResponse.ok) throw new Error("Unable to retrieve data");
      const [data,profile] = await Promise.all([response.json(),profileResponse.json()]);
      if (profile.schema !== "chromalect.mandarin-character-profile.v1" ||
          profile.catalog_count !== 1000 || !Array.isArray(profile.characters) ||
          profile.characters.length !== 1000) throw new Error("Unexpected Mandarin profile");
      profileRows = new Map(profile.characters.map(row=>[row.character,row]));
      if (data.schema !== "chromalect.semantic.grammar.v0.1" ||
          data.version !== grammar.version ||
          data.status !== "experimental_not_production_semantics" ||
          data.verifiedProductionCharacterCount !== 0 ||
          !Array.isArray(data.specimens) || !Array.isArray(data.operators)) {
        throw new Error("Unexpected semantic grammar version or verification status");
      }
      for (const ex of data.specimens) {
        if (ex.verification !== "illustrative" || typeof ex.meaning !== "string") {
          throw new Error("Unreviewed semantic data must remain illustrative");
        }
        if (ex.expr !== null) grammar.validate(ex.expr);
      }
      examples = data.specimens;
      const reference = document.createDocumentFragment();
      for (const entry of data.operators) {
        const block = node("div", "semantic-grammar-rule");
        block.appendChild(node("strong", "semantic-grammar-token", entry.display));
        block.appendChild(node("span", "", entry.interpretation));
        reference.appendChild(block);
      }
      legend.replaceChildren(reference);
      render();
    } catch (error) {
      status.textContent = "Semantic grammar examples could not be loaded.";
    }
  }
  load();
})();
