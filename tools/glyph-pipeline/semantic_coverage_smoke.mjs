// Browser-like smoke checks for the actual semantic coverage UI (no browser dependency).
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
const grammarSource=fs.readFileSync("site/semantic-grammar.js","utf8");
const script=fs.readFileSync("site/semantic-coverage.js","utf8");
const html=fs.readFileSync("site/semantic-coverage.html","utf8");
const data=JSON.parse(fs.readFileSync("data/semantic/mandarin-1000-v0.1.json","utf8"));
const catalog=JSON.parse(fs.readFileSync("data/catalog/characters-0001-1000.json","utf8"));
const profile={schema:"chromalect.mandarin-character-profile.v1",catalog_count:1000,
  characters:catalog.characters.map(x=>({rank:x.rank,character:x.character}))};

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
  ChromalectLayers:{createGlyph:row=>{
    const glyph=new Element("div");
    glyph.className="glyph-wrap";
    glyph.textContent=row.character;
    return glyph;
  }},
  fetch:async path=>{
    if(path==="semantic/mandarin-1000-v0.1.json")return {ok:true,json:async()=>data};
    if(path==="profiles/mandarin-1000-v1.json")return {ok:true,json:async()=>profile};
    throw new Error("Unexpected resource: "+path);
  }
};
vmContext.globalThis=vmContext;
vm.runInNewContext(grammarSource,vmContext);
vm.runInNewContext(script,vmContext);
for(let n=0;n<18&&ids["semantic-coverage-rows"].children.length===0;n++)await Promise.resolve();
const cards=ids["semantic-coverage-rows"].children;
assert.equal(cards.length,40,"First page must limit DOM cards");
assert.ok(cards.every(card=>card.children.some(x=>x.className==="semantic-entry-top" &&
  x.children.some(child=>child.className==="glyph-wrap"))));
assert.equal(ids["semantic-source-count"].textContent,"1000 / 1000");
assert.equal(ids["semantic-screened-count"].textContent,"300 / 1000");
assert.equal(ids["semantic-candidate-count"].textContent,"216 / 1000");
assert.equal(ids["semantic-verified-count"].textContent,"0.0%");
assert.equal(ids["semantic-progress-fill"].style.width,"30.0%");
assert.equal(ids["semantic-progress"].attrs["aria-valuenow"],"300");
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
assert.match(ids["semantic-coverage-status"].textContent,/84 characters match/);
ids["semantic-filter"].value="candidate";
ids["semantic-filter"].events.change();
assert.match(ids["semantic-coverage-status"].textContent,/216 characters match/);
ids["semantic-next"].events.click();
assert.match(ids["semantic-page-label"].textContent,/Page 2 of 6/);
ids["semantic-filter"].value="all";
ids["semantic-filter"].events.change();
ids["semantic-lookup"].value="生";
ids["semantic-lookup"].events.input();
assert.equal(ids["semantic-coverage-rows"].children.length,1);
assert.equal(flatten(ids["semantic-coverage-rows"].children[0]).filter(x=>x.className==="semantic-emoji").length,2,
  "Polysemous 生 must show separate life and birth emoji cues");
ids["semantic-lookup"].value="乐";
ids["semantic-lookup"].events.input();
assert.equal(ids["semantic-coverage-rows"].children.length,1);
assert.equal(flatten(ids["semantic-coverage-rows"].children[0]).filter(x=>x.className==="semantic-emoji").length,2,
  "Polysemous 乐 must distinguish happy and music");
ids["semantic-lookup"].value="mountain";
ids["semantic-lookup"].events.input();
assert.match(ids["semantic-coverage-status"].textContent,/characters match/);
assert.match(html,/id="semantic-layer-word" disabled/);
assert.match(html,/data-character-layer-controls/);
assert.match(html,/src="layers.js"/);
assert.match(html,/id="semantic-layer-character" checked/);
assert.match(html,/semantic\/mandarin-1000-v0.1\.json|semantic-coverage\.js/);
console.log("Semantic coverage UI: data loaded, progress percentages, 40-card pagination, emoji-only rendering, filters and visibility toggles.");
