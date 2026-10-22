import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const grammarSource = fs.readFileSync("site/semantic-grammar.js", "utf8");
const labSource = fs.readFileSync("site/semantic-lab.js", "utf8");
const html = fs.readFileSync("site/semantic-lab.html", "utf8");
const data = JSON.parse(fs.readFileSync("site/semantic-grammar-v0.1.json", "utf8"));

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
  const checkbox = new Element("input");
  const status = new Element("p");
  const buttons = ["symbols", "plain"].map(mode => {
    const button = new Element("button");
    button.dataset.semanticMode = mode;
    return button;
  });
  const ids = {
    "semantic-specimens": grid,
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
    fetch: async path => {
      assert.equal(path, "semantic-grammar-v0.1.json");
      return {ok:true, json:async()=>data};
    }
  };
  sandbox.globalThis = sandbox;
  vm.runInNewContext(grammarSource, sandbox);
  vm.runInNewContext(labSource, sandbox);
  for (let i=0; i<8 && grid.children.length===0; i++) await Promise.resolve();
  return { grid, legend, checkbox, status, buttons };
}

assert.match(html, /semantic-grammar\.js/);
assert.match(html, /semantic-grammar-legend/);
assert.match(html, /<details class="semantic-technical">/);
assert.doesNotMatch(html, /data-semantic-mode="single"|data-semantic-mode="compound"/);
const { grid, legend, checkbox, status, buttons } = await execute();
assert.equal(grid.children.length, data.specimens.length);
assert.equal(legend.children.length, data.operators.length);
const index = id => data.specimens.findIndex(s=>s.id===id);
const symbolCount = id => descendants(grid.children[index(id)], "semantic-symbol").length;
assert.equal(symbolCount("mountain"), 1);
assert.equal(symbolCount("study"), 2);
assert.equal(symbolCount("read"), 2);
assert.equal(symbolCount("raw"), 0);
assert.equal(symbolCount("extended-mnemonic"), 5, "No arbitrary three-symbol truncation");
assert.equal(descendants(grid.children[index("eat-apple")], "semantic-symbol")
  .map(x=>x.textContent).join(""),"👤🍽️🍎");
assert.equal(descendants(grid.children[index("not-eat")], "semantic-symbol")
  .map(x=>x.textContent).join(""),"🚫🍽️");
assert.ok(grid.children.every(card=>descendants(card,"semantic-operator").length===0),
  "Public expressions must contain only emoji");
assert.match(status.textContent,/Emoji expressions/);
buttons[1].events.click();
assert.ok(grid.children.every(card=>descendants(card,"semantic-symbol").length===0),
  "Plain mode must remove pictographic annotations");
buttons[0].events.click();
assert.equal(symbolCount("mountain"),1);
assert.equal(symbolCount("extended-mnemonic"),5);
checkbox.checked = true;
checkbox.events.change();
assert.ok(grid.children.every(card=>descendants(card,"semantic-answer")[0].hidden===false),
  "Written meanings must reveal independently of grammar mode");
console.log("Semantic lab: versioned grammar data, mixed 1–5 emoji expressions, action roles, Off toggle and written-meaning reveal.");
