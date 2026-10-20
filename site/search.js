/* Mandarin profile exploration. No invented linguistic values or external requests. */
(() => {
  "use strict";

  const field = document.getElementById("character-search");
  const filter = document.getElementById("geometry-filter");
  const results = document.getElementById("search-results");
  const status = document.getElementById("search-status");
  if (!field || !filter || !results || !status) return;

  function normalize(text) {
    return String(text || "")
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase("en").replace(/\s+/g, "");
  }

  function matches(row, query) {
    if (!query) return true;
    if (query.startsWith("#") && String(row.rank) === query.slice(1)) return true;
    const pinyin = row.citation_readings.flatMap(reading => [
      reading.display,
      reading.initial.token + reading.final.token,
      reading.initial.token + reading.final.token + reading.tone.category
    ]);
    const fields = [row.character, String(row.rank), row.structure,
      ...row.component_instances.flatMap(part => [part.form, part.component_id]),
      ...pinyin
    ];
    return fields.some(value => normalize(value).includes(query));
  }

  function labeledSwatch(color, title, label) {
    const wrapper = document.createElement("span");
    wrapper.className = "search-token";
    const swatch = document.createElement("i");
    swatch.className = "palette-swatch";
    swatch.style.backgroundColor = color;
    swatch.setAttribute("aria-hidden", "true");
    const text = document.createElement("span");
    text.textContent = label;
    wrapper.title = title;
    wrapper.append(swatch, text);
    return wrapper;
  }

  function card(row) {
    const article = document.createElement("article");
    article.className = "search-card";
    const title = document.createElement("a");
    title.href = row.atlas_url;
    title.className = "search-character-link";
    const han = document.createElement("strong");
    han.lang = "zh-Hans";
    han.textContent = row.character;
    const rank = document.createElement("span");
    rank.className = "search-rank";
    rank.textContent = "#" + row.rank;
    title.append(han, rank);
    article.append(title);

    const reading = document.createElement("p");
    reading.className = "search-readings";
    reading.textContent = row.citation_readings.map(x => x.display).join(" · ");
    article.append(reading);

    const parts = document.createElement("div");
    parts.className = "search-components";
    parts.setAttribute("aria-label", "Component identities");
    const ids = new Set();
    for (const item of row.component_instances) {
      const key = item.component_id + ":" + item.form;
      if (ids.has(key)) continue;
      ids.add(key);
      parts.appendChild(labeledSwatch(item.color,
        item.form + " · " + item.component_id,
        item.form));
    }
    article.append(parts);

    const geometry = document.createElement("p");
    geometry.className = "hint";
    geometry.textContent = row.geometry.status === "source_aligned_visual_review_pending"
      ? "Source-aligned strokes · visual review pending"
      : "Stroke ownership unresolved · native-font fallback";
    article.append(geometry);
    if (row.source_diagnostics) {
      const reason = document.createElement("p");
      reason.className = "search-diagnostic";
      reason.textContent = "Source review: " +
        row.source_diagnostics.reason.replaceAll("_", " ");
      article.appendChild(reason);
      for (const asset of row.source_diagnostics.review_assets || []) {
        if (!/^(alternatives|unknown-components)\/U\+[0-9A-F]+\.svg$/.test(asset.href)) continue;
        const link = document.createElement("a");
        link.href = "glyphs/" + asset.href;
        link.className = "search-evidence-link";
        link.textContent = asset.kind === "documented_alternate_source_mapping"
          ? "Alternate source SVG"
          : "Partial source SVG";
        article.appendChild(link);
      }
    }
    return article;
  }

  let catalog = [];
  const limit = 80;

  function render() {
    const query = normalize(field.value.trim());
    const mode = filter.value;
    const matched = catalog.filter(row => {
      const mapped = row.geometry.status === "source_aligned_visual_review_pending";
      return (mode === "all" || (mode === "mapped" && mapped) ||
        (mode === "unmapped" && !mapped)) && matches(row, query);
    });
    results.replaceChildren();
    const fragment = document.createDocumentFragment();
    for (const row of matched.slice(0, limit)) fragment.appendChild(card(row));
    results.appendChild(fragment);
    status.textContent = matched.length + " matching characters" +
      (matched.length > limit ? " · showing first " + limit : "") +
      " · " + catalog.length + " cataloged";
  }
  field.addEventListener("input", render);
  filter.addEventListener("change", render);

  fetch("profiles/mandarin-1000-v1.json")
    .then(response => {
      if (!response.ok) throw new Error("Profile unavailable");
      return response.json();
    })
    .then(profile => {
      if (profile.schema !== "chromalect.mandarin-character-profile.v1" ||
          profile.ontology_profile !== "zh-cn-putonghua-simplified" ||
          profile.catalog_count !== 1000 ||
          !Array.isArray(profile.characters) ||
          profile.characters.length !== 1000) {
        throw new Error("Unsupported profile or incomplete catalog");
      }
      catalog = profile.characters;
      const params = new URLSearchParams(location.search);
      const query = params.get("q");
      if (query) field.value = query;
      render();
    })
    .catch(() => {
      status.textContent = "Search profile unavailable. The static character atlas remains usable.";
      const link = document.createElement("a");
      link.href = "characters/0001-0100.html";
      link.textContent = "Browse the static atlas";
      results.replaceChildren(link);
    });
})();
