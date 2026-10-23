// Zero-dependency smoke checks for the actual shared navigation JavaScript.
// Runs in Node with a tiny document surface, not a browser test harness.
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const source = fs.readFileSync("site/navigation.js", "utf8");

class Element {
  constructor(tag) {
    this.tagName = tag.toLowerCase();
    this.children = [];
    this.attributes = {};
    this.className = "";
    this.classList = {
      add: (...names) => {
        this.className = [...new Set([...this.className.split(/\s+/).filter(Boolean), ...names])].join(" ");
      }
    };
  }
  append(...elements) {
    for (const el of elements) {
      if (el.parent) el.parent.children = el.parent.children.filter(x => x !== el);
      el.parent = this;
      this.children.push(el);
    }
  }
  appendChild(el) { this.append(el); return el; }
  replaceChildren(...elements) { this.children = []; this.append(...elements); }
  setAttribute(key, value) { this.attributes[key] = String(value); }
  addEventListener(name, callback) { (this.events ||= {})[name] = callback; }
}

function find(root, test) {
  if (test(root)) return root;
  for (const child of root.children) {
    const hit = find(child, test);
    if (hit) return hit;
  }
  return null;
}
function collect(root, test) {
  return [ ...(test(root) ? [root] : []),
    ...root.children.flatMap(x => collect(x, test)) ];
}

function buildPage(route, authored, rootPath = "/chromalect/") {
  const main = new Element("main");
  main.className = "wrap";
  const body = new Element("body");
  const legacy = authored ? new Element("header") : null;
  if (legacy) {
    legacy.className = "wrap";
    body.appendChild(legacy);
  }
  body.appendChild(main);
  body.insertBefore = (el, ref) => {
    const at = body.children.indexOf(ref);
    if (at < 0) throw new Error("Reference element not in body");
    if (el.parent) el.parent.children = el.parent.children.filter(x => x !== el);
    body.children.splice(at, 0, el);
    el.parent = body;
  };
  const theme = new Element("fieldset");
  theme.id = "chromalect-appearance";
  if (legacy) legacy.append(theme);
  else main.append(theme);
  const doc = {
    readyState: "complete",
    currentScript: { src: "https://example.test" + rootPath + "navigation.js" },
    title: route.startsWith("glyphs/") ? "Native geometry comparison · Chromalect" : "Chromalect",
    body,
    createElement: tag => new Element(tag),
    getElementById: id => find(body, x => x.id === id),
    querySelector: selector => {
      if (selector === "header.wrap") return legacy;
      if (selector === "main") return main;
      throw new Error("Unknown document query: " + selector);
    },
    addEventListener: () => {}
  };
  const location = new URL("https://example.test" + rootPath + route);
  vm.runInNewContext(source, { document: doc, location, URL });
  const nav = find(body, e => e.id === "chromalect-global-nav");
  assert.ok(nav, "Missing shared navigation on " + route);
  const header = find(body, e => e.className.includes("site-header"));
  assert.ok(header, "Missing persistent header");
  assert.ok(find(header, e => e.id === "chromalect-appearance"),
    "Theme control lost while replacing navigation");
  assert.equal(body.children[0], header, "Navigation must be above the page content");
  const anchors = collect(nav, e => e.tagName === "a");
  assert.equal(anchors.length, 27, "Expected stable primary and grouped navigation links");
  for (const link of anchors) {
    if (!link.href.startsWith("https://github.com")) {
      assert.ok(link.href.startsWith("https://example.test" + rootPath),
        "Nested page navigation escaped the Pages site root: " + link.href);
    }
  }
  const search = find(header, e => e.className === "site-quick-search");
  assert.equal(search.action, "https://example.test" + rootPath + "search.html");
  const page = find(header, e => e.className === "site-location-current");
  assert.ok(page && page.textContent, "Missing current-page breadcrumb");
  return { nav, header, anchors, page };
}

const home = buildPage("index.html", true);
const atlas = buildPage("characters/0701-0800.html", true);
const report = buildPage("glyphs/review/index.html", false);
const deep = buildPage("glyphs/by-component/cmp-0001.html", false);
const root = buildPage("search.html", true, "/");
const semantics = buildPage("semantic-lab.html", true);
const semanticBrowser = buildPage("semantic-coverage.html", true);
const comprehension = buildPage("emoji-comprehension.html", true);
const lexical = buildPage("lexical-review.html", true);
const readings = buildPage("reading-inventory.html", true);

const destinations = list => list.map(a => a.href).sort();
assert.deepEqual(destinations(home.anchors), destinations(atlas.anchors));
assert.deepEqual(destinations(home.anchors), destinations(report.anchors));
assert.deepEqual(destinations(home.anchors), destinations(deep.anchors));
assert.deepEqual(destinations(home.anchors), destinations(semantics.anchors));
assert.deepEqual(destinations(home.anchors), destinations(comprehension.anchors));
assert.deepEqual(destinations(home.anchors), destinations(lexical.anchors));
assert.deepEqual(destinations(home.anchors), destinations(readings.anchors));
assert.equal(collect(lexical.nav,e=>e.tagName==="summary"&&e.className.includes("is-active")).length,1);
assert.equal(collect(readings.nav,e=>e.tagName==="summary"&&e.className.includes("is-active")).length,1);
assert.ok(readings.anchors.some(a=>a.href.endsWith("/reading-inventory.html")));
assert.equal(collect(comprehension.nav,e=>e.tagName==="summary"&&e.className.includes("is-active")).length,1);
assert.equal(collect(semantics.nav, e => e.tagName === "summary" &&
  e.className.includes("is-active")).length, 1,
  "Semantic experiment must highlight Research & evidence menu");
assert.match(atlas.page.textContent, /701.800/);
assert.equal(collect(report.nav, e => e.tagName === "summary" &&
  e.className.includes("is-active")).length, 1, "Evidence menu must highlight active location");
assert.equal(collect(deep.nav, e => e.tagName === "a" &&
  e.className.includes("is-active")).length, 1, "Nested by-component route must highlight Components");
assert.equal(root.anchors[0].href, "https://example.test/index.html");

console.log("Navigation smoke: same 27 destinations across home, reading research, atlas and nested generated pages; active state correct.");
