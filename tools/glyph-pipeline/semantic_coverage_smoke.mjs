// Browser-like smoke checks for the actual semantic coverage UI (no browser dependency).
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
const grammarSource=fs.readFileSync("site/semantic-grammar.js","utf8");
const script=fs.readFileSync("site/semantic-coverage.js","utf8");
const html=fs.readFileSync("site/semantic-coverage.html","utf8");
const data=JSON.parse(fs.readFileSync("data/semantic/mandarin-1000-v0.1.json","utf8"));

class Element {
  constructor(tag="div"){
    this.tagName=tag;
    this.children=[];
    this.events={};
    this.attrs={};
    this.style={};
    this.textContent="";
    this.value="";
    this.checked=false;
    this.disabled=false;
    this.className="";
  }
  appendChild(x){this.append(x);return x;}
  append(...xs){this.children.push(...xs);}
  setAttribute(k,v){this.attrs[k]=String(v);}
  addEventListener(k,f){this.events[k]=f;}
  replaceChildren(x){this.children=x.tagName==="#fragment"?[...x.children]:[x];}
}
const ids={};
for(const id of [
  "semantic-coverage-rows","semantic-coverage-status",
  "semantic-lookup","semantic-filter","semantic-layer-character",
  "semantic-prev","semantic-next","semantic-page-label",
  "semantic-source-count","semantic-source-percent",
  "semantic-screened-count","semantic-screened-percent",
  "semantic-candidate-count","semantic-candidate-percent",
  "semantic-verified-count","semantic-progress","semantic-progress-fill"
]) ids[id]=new Element();
ids["semantic-filter"].value="all";
ids["semantic-layer-character"].checked=true;
const document={
  getElementById:id=>ids[id],
  createElement:tag=>new Element(tag),
  createDocumentFragment:()=>new Element("#fragment")
};
const vmContext={
  document,
  fetch:async path=>{
    assert.equal(path,"semantic/mandarin-1000-v0.1.json");
    return {ok:true,json:async()=>data};
  }
};
vmContext.globalThis=vmContext;
vm.runInNewContext(grammarSource,vmContext);
vm.runInNewContext(script,vmContext);
for(let n=0;n<12&&ids["semantic-coverage-rows"].children.length===0;n++)await Promise.resolve();
const cards=ids["semantic-coverage-rows"].children;
assert.equal(cards.length,40,"First page must limit DOM cards");
assert.equal(ids["semantic-source-count"].textContent,"1000 / 1000");
assert.equal(ids["semantic-screened-count"].textContent,"200 / 1000");
assert.equal(ids["semantic-candidate-count"].textContent,"140 / 1000");
assert.equal(ids["semantic-verified-count"].textContent,"0.0%");
assert.equal(ids["semantic-progress-fill"].style.width,"20.0%");
assert.equal(ids["semantic-progress"].attrs["aria-valuenow"],"200");
const flatten=x=>[x,...x.children.flatMap(flatten)];
assert.ok(flatten(cards[0]).some(x=>x.className==="semantic-emoji" && x.textContent==="1️⃣"));
assert.ok(flatten(cards[38]).some(x=>x.className==="semantic-emoji" && x.textContent==="⛰️"));
assert.ok(!flatten(cards[38]).some(x=>x.className==="semantic-emoji" && /▶|∼|⟨/.test(x.textContent)));
ids["semantic-layer-character"].checked=false;
ids["semantic-layer-character"].events.change();
assert.ok(ids["semantic-coverage-rows"].children.every(card=>
  !flatten(card).some(x=>x.className==="semantic-emoji")),"Off switch must hide character meaning icons");
ids["semantic-layer-character"].checked=true;
ids["semantic-layer-character"].events.change();
ids["semantic-filter"].value="deferred";
ids["semantic-filter"].events.change();
assert.match(ids["semantic-coverage-status"].textContent,/60 characters match/);
ids["semantic-filter"].value="candidate";
ids["semantic-filter"].events.change();
assert.match(ids["semantic-coverage-status"].textContent,/140 characters match/);
ids["semantic-next"].events.click();
assert.match(ids["semantic-page-label"].textContent,/Page 2 of 4/);
ids["semantic-lookup"].value="mountain";
ids["semantic-lookup"].events.input();
assert.match(ids["semantic-coverage-status"].textContent,/characters match/);
assert.match(html,/id="semantic-layer-word" disabled/);
assert.match(html,/id="semantic-layer-character" checked/);
assert.match(html,/semantic\/mandarin-1000-v0.1\.json|semantic-coverage\.js/);
console.log("Semantic coverage UI: data loaded, progress percentages, 40-card pagination, emoji-only rendering, filters and visibility toggles.");
