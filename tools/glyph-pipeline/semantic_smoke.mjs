// Zero-dependency semantic-lab DOM smoke and variable-length-expression regression.
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const source = fs.readFileSync("site/semantic-lab.js", "utf8");
const html = fs.readFileSync("site/semantic-lab.html", "utf8");

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
  replaceChildren(child) {
    this.children = child.tagName === "#fragment" ? [...child.children] : [child];
  }
  setAttribute(name, value) { this.attributes[name] = String(value); }
  addEventListener(name, listener) { this.events[name] = listener; }
}
const elements = root => [root, ...root.children.flatMap(elements)];
const descendants = (root, className) =>
  elements(root).filter(x => x.className === className);

function execute(script) {
  const grid = new Element("div");
  const checkbox = new Element("input");
  const status = new Element("p");
  const buttons = ["symbols", "plain"].map(mode => {
    const button = new Element("button");
    button.dataset.semanticMode = mode;
    return button;
  });
  const ids = {
    "semantic-specimens": grid,
    "semantic-reveal": checkbox,
    "semantic-lab-status": status
  };
  const document = {
    createElement: tag => new Element(tag),
    createDocumentFragment: () => new Element("#fragment"),
    getElementById: id => ids[id],
    querySelectorAll: selector => selector === "[data-semantic-mode]" ? buttons : []
  };
  vm.runInNewContext(script, { document });
  return { grid, checkbox, status, buttons };
}

assert.match(html, /data-semantic-mode="symbols"/);
assert.match(html, /data-semantic-mode="plain"/);
assert.doesNotMatch(html, /data-semantic-mode="single"|data-semantic-mode="compound"/);
const { grid, checkbox, buttons, status } = execute(source);
assert.equal(grid.children.length, 11, "Expected all illustrative senses");
const symbolCount = index => descendants(grid.children[index], "semantic-symbol").length;
assert.equal(symbolCount(0), 1, "山 must retain a one-symbol expression");
assert.equal(symbolCount(3), 2, "学 must render a multi-symbol expression");
assert.equal(symbolCount(4), 2, "读 must render a second composite expression");
assert.equal(symbolCount(8), 0, "Unencoded meanings must not receive invented icons");
assert.match(status.textContent, /Mixed emoji expressions/);
buttons[1].events.click();
assert.ok(grid.children.every(card => descendants(card, "semantic-symbol").length === 0),
  "Plain mode must remove all pictogram annotations");
buttons[0].events.click();
assert.equal(symbolCount(0), 1);
assert.equal(symbolCount(3), 2);
checkbox.checked = true;
checkbox.events.change();
assert.ok(grid.children.every(card => descendants(card, "semantic-answer")[0].hidden === false),
  "Written meaning reveal must be independent of symbol length and mode");

// Extend a test-only expression beyond three tokens: no production claim or artificial cap.
const fixture = source.replace(
  "symbols: [emoji.book, emoji.brain]",
  "symbols: [emoji.book, emoji.brain, emoji.book, emoji.brain]"
);
assert.notEqual(fixture, source, "Four-symbol regression fixture was not installed");
const longer = execute(fixture);
assert.equal(descendants(longer.grid.children[3], "semantic-symbol").length, 4,
  "Renderer must not truncate emoji expressions at three");
console.log("Semantic smoke: mixed one-/multi-symbol view, reusable symbols, Off toggle, meaning reveal, and unbounded expression length.");
