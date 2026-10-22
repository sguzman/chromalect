import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const grammarSource = fs.readFileSync("site/semantic-grammar.js", "utf8");
const labSource = fs.readFileSync("site/semantic-lab.js", "utf8");
const html = fs.readFileSync("site/semantic-lab.html", "utf8");
const data = JSON.parse(fs.readFileSync("site/semantic-grammar-v0.1.json", "utf8"));
const catalog = JSON.parse(fs.readFileSync("data/catalog/characters-0001-1000.json","utf8"));
const profile = {schema:"chromalect.mandarin-character-profile.v1",catalog_count:1000,
  characters:catalog.characters.map(x=>({rank:x.rank,character:x.character}))};

class Element {
  constructor(tag = "div") {
    this.tagName = tag;
    this.children = [];
    this.attributes = {};
    this.events = {};
    this.textContent = "";
    this.hidden = false;
    this.checked = false;
    this.dataset = {};
  }
  appendChild(child) { this.append(child); return child; }
  append(...children) { for (const child of children) this.children.push(child); }
  replaceChildren(child) { this.children = child.tagName === "#fragment" ? [...child.children] : [child]; }
  setAttribute(name, value) { this.attributes[name] = String(value); }
  addEventListener(name, listener) { this.events[name] = listener; }
}
const all = root => [root, ...root.children.flatMap(all)];
const descendants = (root, css) => all(root).filter(x => x.className === css);

async function execute() {
  const grid = new Element("div");
  const legend = new Element("div");
  const words = new Element("div");
  const outside = new Element("div");
  const abstract = new Element("div");
  const checkbox = new Element("input");
  const status = new Element("p");
  const buttons = ["symbols", "plain"].map(mode => {
    const button = new Element("button");
    button.dataset.semanticMode = mode;
    return button;
  });
  const ids = {
    "semantic-specimens": grid,
    "semantic-words": words,
    "semantic-outside": outside,
    "semantic-grammar-examples": abstract,
    "semantic-grammar-legend": legend,
    "semantic-reveal": checkbox,
    "semantic-lab-status": status
  };
  const document = {
    createElement: tag => new Element(tag),
    createDocumentFragment: () => new Element("#fragment"),
    getElementById: id => ids[id],
    querySelectorAll: selector => selector === "[data-semantic-mode]" ? buttons : []
  };
  const sandbox = {
    document,
    ChromalectLayers: {createGlyph: row => {
      const glyph=new Element("div");
      glyph.className="glyph-wrap";
      glyph.textContent=row.character;
      return glyph;
    }},
    fetch: async path => {
      if (path==="semantic-grammar-v0.1.json") return {ok:true,json:async()=>data};
      if (path==="profiles/mandarin-1000-v1.json") return {ok:true,json:async()=>profile};
      throw new Error("Unexpected resource "+path);
    }
  };
  sandbox.globalThis = sandbox;
  vm.runInNewContext(grammarSource, sandbox);
  vm.runInNewContext(labSource, sandbox);
  for (let i=0; i<16 && grid.children.length===0; i++) await Promise.resolve();
  return { grid, words, outside, abstract, legend, checkbox, status, buttons };
}

assert.match(html, /semantic-grammar\.js/);
assert.match(html, /semantic-grammar-legend/);
assert.match(html, /data-character-layer-controls/);
assert.match(html, /src="layers.js"/);
assert.match(html, /<details class="semantic-technical">/);
assert.doesNotMatch(html, /data-semantic-mode="single"|data-semantic-mode="compound"/);
const { grid, words, outside, abstract, legend, checkbox, status, buttons } = await execute();
assert.equal(grid.children.length, 7, "Mapped character samples only");
assert.equal(words.children.length, 2, "Word-level examples remain separate");
assert.equal(outside.children.length, 2, "Out-of-scope characters isolated");
assert.equal(abstract.children.length, 8, "Grammar-only experiments isolated");
assert.equal(grid.children.length + words.children.length + outside.children.length +
  abstract.children.length, data.specimens.length);
assert.equal(legend.children.length, data.operators.length);
assert.ok(grid.children.every(card => descendants(card,"glyph-wrap").length === 1));
assert.ok(words.children.every(card => descendants(card,"glyph-wrap").length === 2));
assert.ok(outside.children.every(card => descendants(card,"semantic-unmapped-glyph").length === 1));
assert.ok(outside.children.every(card => descendants(card,"glyph-wrap").length === 0));
const charCount = cardIndex => descendants(grid.children[cardIndex],"semantic-symbol").length;
assert.equal(charCount(0),1,"山 pictogram");
assert.equal(charCount(1),1,"水 pictogram");
assert.equal(charCount(2),1,"火 pictogram");
assert.equal(descendants(grid.children[4],"semantic-symbol").length,0,
  "Raw sense must abstain instead of inventing pictograms");
assert.equal(descendants(outside.children[0],"semantic-symbol").length,2,"学 remains grammar test");
assert.equal(descendants(abstract.children[7],"semantic-symbol").length,5);
assert.equal(descendants(abstract.children[4],"semantic-symbol").map(x=>x.textContent).join(""),
  "👤🍽️🍎");
assert.ok([grid,words,outside,abstract].every(group =>
  group.children.every(card => descendants(card,"semantic-operator").length === 0)));
assert.match(status.textContent,/7 mapped character examples/);
assert.match(html, /semantic-words/);
assert.match(html, /semantic-outside/);
assert.match(html, /semantic-grammar-examples/);
assert.match(html, /data-character-layer-controls/);
buttons[1].events.click();
assert.ok([grid,words,outside,abstract].every(group =>
  group.children.every(card => descendants(card,"semantic-symbol").length === 0)),
  "Hide emoji must work across all specimen groups");
buttons[0].events.click();
assert.equal(charCount(0),1);
checkbox.checked=true;
checkbox.events.change();
assert.ok([grid,words,outside,abstract].every(group =>
  group.children.every(card => descendants(card,"semantic-answer")[0].hidden === false)));
console.log("Semantic lab: 7 mapped glyphs, 2 words, 2 out-of-scope glyphs, 8 isolated grammar examples, emoji and meaning toggles.");
