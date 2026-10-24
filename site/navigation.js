/* A single site-wide navigation model for authored and Rust-generated pages.
   Loaded by theme.js so every page inherits the same links. */
(() => {
  "use strict";

  const script = document.currentScript;
  if (!script || !script.src) return;
  const root = new URL(".", script.src);
  const href = path => new URL(path, root).href;

  // All links resolve from the actual theme script's directory, not the
  // current page. Works on GitHub Pages project paths and deeply nested QA.
  const links = {
    home: { label: "Home", path: "index.html" },
    search: { label: "Search", path: "search.html" },
    atlas: { label: "Character atlas", path: "characters/0001-0100.html" },
    components: { label: "Components", path: "components.html" },
    glyphs: { label: "Colored glyphs", path: "glyphs/index.html" },
    ontology: { label: "Ontology", path: "ontology.html" },
    semanticCoverage: { label: "Mandarin semantic browser", path: "semantic-coverage.html" },
    semanticLab: { label: "Emoji grammar lab · experimental", path: "semantic-lab.html" },
    fusion: { label: "Integrated visual layers · experimental", path: "mandarin-fusion.html" },
    context: { label: "Mandarin word-context controls · experimental", path: "mandarin-word-context.html" },
    emojiComprehension: { label: "Blind emoji comprehension · experimental", path: "emoji-comprehension.html" },
    lexicalReview: { label: "Mandarin sense review worksheet · experimental", path: "lexical-review.html" },
    readingInventory: { label: "Mandarin reading inventory · experimental", path: "reading-inventory.html" },
    ownerAdjudication: { label: "Source-owner region notes · provisional", path: "component-owner-adjudication.html" },
    radicals: { label: "Modern radicals", path: "radicals.html" },
    kangxi: { label: "Kangxi radicals", path: "kangxi.html" },
    colors: { label: "Color registry · v0.6", path: "colors.html" },
    curated: { label: "12 curated stroke examples", path: "strokes.html" },
    directory: { label: "By-component glyph directory", path: "glyphs/by-component/index.html" },
    diagnostics: { label: "Source diagnostics", path: "glyphs/diagnostics.html" },
    comparisons: { label: "Native vs. source review", path: "glyphs/review/index.html" },
    alternatives: { label: "Alternative decompositions", path: "glyphs/alternatives/index.html" },
    unknown: { label: "Partial-source comparisons", path: "glyphs/unknown-components/index.html" },
    hierarchy: { label: "Hierarchical source evidence", path: "glyphs/hierarchical.html" },
    unmapped: { label: "Coverage status · 1,000/1,000", path: "glyphs/unmapped.html" },
    coverage: { label: "Coverage JSON", path: "glyphs/coverage.json" },
    mapping: { label: "Mapping manifest JSON", path: "glyphs/mappings.json" },
    palette: { label: "v0.6 palette JSON", path: "palettes/mandarin-component-identity-v0.6.json" },
    github: { label: "GitHub repository", path: "https://github.com/sguzman/chromalect", external: true },
    sources: { label: "Source and license notices", path: "https://github.com/sguzman/chromalect/blob/main/THIRD_PARTY_NOTICES.md", external: true }
  };

  function destination(item) {
    return item.external ? item.path : href(item.path);
  }

  const rel = (() => {
    const base = root.pathname;
    const path = location.pathname;
    return path.startsWith(base) ? decodeURIComponent(path.slice(base.length)) : "";
  })();

  function currentKey() {
    if (rel === "" || rel === "index.html") return "home";
    if (rel === "search.html") return "search";
    if (rel.startsWith("characters/")) return "atlas";
    if (rel === "components.html" || rel.startsWith("glyphs/by-component/")) return "components";
    if (rel === "ontology.html") return "ontology";
    if (rel === "semantic-coverage.html") return "semanticCoverage";
    if (rel === "semantic-lab.html") return "semanticLab";
    if (rel === "mandarin-fusion.html") return "fusion";
    if (rel === "mandarin-word-context.html") return "context";
    if (rel === "emoji-comprehension.html") return "emojiComprehension";
    if (rel === "lexical-review.html") return "lexicalReview";
    if (rel === "reading-inventory.html") return "readingInventory";
    if (rel === "component-owner-adjudication.html") return "ownerAdjudication";
    if (rel === "radicals.html") return "radicals";
    if (rel === "kangxi.html") return "kangxi";
    if (rel === "colors.html") return "colors";
    if (rel === "strokes.html") return "curated";
    if (rel.startsWith("glyphs/review/")) return "comparisons";
    if (rel.startsWith("glyphs/alternatives/")) return "alternatives";
    if (rel.startsWith("glyphs/unknown-components/")) return "unknown";
    if (rel === "glyphs/diagnostics.html") return "diagnostics";
    if (rel === "glyphs/unmapped.html") return "unmapped";
    if (rel === "glyphs/hierarchical.html") return "hierarchy";
    if (rel.startsWith("glyphs/")) return "glyphs";
    return "home";
  }
  const active = currentKey();
  const browseKeys = new Set(["radicals", "kangxi", "colors", "curated", "directory"]);
  const reviewKeys = new Set(["semanticCoverage", "semanticLab", "fusion", "context", "emojiComprehension", "lexicalReview", "readingInventory", "ownerAdjudication", "diagnostics", "comparisons", "alternatives",
    "unknown", "hierarchy", "unmapped"]);

  function element(tag, className, label) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (label !== undefined) node.textContent = label;
    return node;
  }

  function anchor(key, className) {
    const item = links[key];
    const a = element("a", className || "site-nav-link", item.label);
    a.href = destination(item);
    if (active === key) {
      a.classList.add("is-active");
      a.setAttribute("aria-current", "page");
    }
    if (item.external) a.rel = "noopener noreferrer";
    return a;
  }

  function dropdown(title, groups, keys) {
    const detail = element("details", "site-nav-menu");
    const summary = element("summary", "site-nav-link site-nav-toggle", title);
    if (keys.has(active)) {
      summary.classList.add("is-active");
      summary.setAttribute("aria-label", title + " (current section)");
    }
    detail.appendChild(summary);
    const panel = element("div", "site-nav-panel");
    for (const group of groups) {
      const section = element("section", "site-nav-group");
      section.appendChild(element("h2", null, group.title));
      for (const key of group.items) section.appendChild(anchor(key, "site-nav-entry"));
      panel.appendChild(section);
    }
    detail.appendChild(panel);
    detail.addEventListener("toggle", () => {
      if (detail.open) {
        document.querySelectorAll(".site-nav-menu").forEach(other => {
          if (other !== detail) other.open = false;
        });
      }
    });
    return detail;
  }

  function pageName() {
    if (active === "atlas") {
      const match = rel.match(/^characters\/(\d{4})-(\d{4})\.html$/);
      return match ? "Characters " + Number(match[1]) + "–" + Number(match[2]) : "Character atlas";
    }
    if (rel.startsWith("glyphs/") && !["glyphs/index.html", "glyphs/diagnostics.html",
      "glyphs/unmapped.html", "glyphs/hierarchical.html"].includes(rel)) {
      const title = document.title.replace(/\s*[·|–-]\s*Chromalect\s*$/i, "").trim();
      return title && title.length < 110 ? title : links[active].label;
    }
    return links[active].label;
  }

  function install() {
    if (document.getElementById("chromalect-global-nav")) return;
    const existing = document.querySelector("header.wrap");
    const theme = document.getElementById("chromalect-appearance");
    const header = existing || element("header", "wrap");
    header.classList.add("site-header");

    const top = element("div", "site-header-top");
    const brand = element("a", "site-brand");
    brand.href = href("index.html");
    brand.appendChild(element("strong", null, "CHROMALECT"));
    brand.appendChild(element("small", null, "Language, made visible"));
    top.appendChild(brand);

    const utilities = element("div", "site-header-utilities");
    const find = element("form", "site-quick-search");
    find.method = "get";
    find.action = href("search.html");
    find.setAttribute("role", "search");
    const label = element("label", "visually-hidden", "Find a Chinese character, Pinyin, or component");
    label.htmlFor = "global-character-search";
    const input = element("input");
    input.id = "global-character-search";
    input.type = "search";
    input.name = "q";
    input.placeholder = "Find character or Pinyin…";
    input.autocomplete = "off";
    const button = element("button", null, "Search");
    button.type = "submit";
    find.append(label, input, button);
    utilities.appendChild(find);
    if (theme) utilities.appendChild(theme);
    top.appendChild(utilities);

    const nav = element("nav", "site-global-nav");
    nav.id = "chromalect-global-nav";
    nav.setAttribute("aria-label", "Site-wide navigation");
    const primary = element("div", "site-nav-items");
    for (const key of ["home", "search", "atlas", "components", "glyphs", "ontology"]) {
      primary.appendChild(anchor(key));
    }
    primary.appendChild(dropdown("Browse", [
      { title: "Character references", items: ["radicals", "kangxi", "directory"] },
      { title: "Color and examples", items: ["colors", "curated", "palette"] }
    ], browseKeys));
    primary.appendChild(dropdown("Research & evidence", [
      { title: "Mandarin semantic research", items: ["semanticCoverage", "semanticLab", "fusion", "context", "lexicalReview", "readingInventory", "emojiComprehension"] },
      { title: "Inspect source alignment", items: ["comparisons", "diagnostics", "hierarchy", "ownerAdjudication"] },
      { title: "More investigations", items: ["alternatives", "unknown", "unmapped"] },
      { title: "Data and provenance", items: ["coverage", "mapping", "github", "sources"] }
    ], reviewKeys));
    nav.appendChild(primary);

    const path = element("div", "site-location");
    path.appendChild(element("span", null, "You are here"));
    path.appendChild(anchor("home", "site-location-home"));
    path.appendChild(element("span", "site-location-separator", "›"));
    const current = element("span", "site-location-current", pageName());
    current.setAttribute("aria-current", "location");
    path.appendChild(current);

    // Keep controls and their listeners alive, remove only duplicate menus.
    header.replaceChildren(top, nav, path);
    if (!existing) {
      const main = document.querySelector("main");
      document.body.insertBefore(header, main || document.body.firstChild);
    }

    document.addEventListener("click", event => {
      if (!nav.contains(event.target)) {
        nav.querySelectorAll("details[open]").forEach(item => { item.open = false; });
      }
    });
    document.addEventListener("keydown", event => {
      if (event.key === "Escape") {
        const opened = nav.querySelector("details[open]");
        if (opened) {
          opened.open = false;
          opened.querySelector("summary").focus();
        }
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", install, { once: true });
  } else {
    install();
  }
})();
