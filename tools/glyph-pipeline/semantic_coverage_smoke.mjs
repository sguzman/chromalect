// Browser-like smoke checks for the actual semantic coverage UI (no browser dependency).
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
const grammarSource=fs.readFileSync("site/semantic-grammar.js","utf8");
const script=fs.readFileSync("site/semantic-coverage.js","utf8");
const html=fs.readFileSync("site/semantic-coverage.html","utf8");
const data=JSON.parse(fs.readFileSync("data/semantic/mandarin-1000-v0.1.json","utf8"));
const lexical=JSON.parse(fs.readFileSync("data/semantic/cedict-crossref/manifest-v0.1.json","utf8"));
const readiness=JSON.parse(fs.readFileSync("data/semantic/cedict-crossref/lexical-review-readiness-v0.1.json","utf8"));
const audit=JSON.parse(fs.readFileSync("data/semantic/cedict-crossref/strict-gloss-index-v0.1.json","utf8"));
const review=JSON.parse(fs.readFileSync("data/semantic/cedict-crossref/sense-review-queue-v0.1.json","utf8"));
const visibility=JSON.parse(fs.readFileSync("data/semantic/cedict-crossref/emoji-visibility-audit-v0.1.json","utf8"));
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
  "semantic-lookup","semantic-filter","semantic-lexical-filter","semantic-action-filter","semantic-visual-filter","semantic-layer-character",
  "semantic-prev","semantic-next","semantic-page-label",
  "semantic-source-count","semantic-source-percent",
  "semantic-screened-count","semantic-screened-percent",
  "semantic-candidate-count","semantic-candidate-percent",
  "semantic-verified-count","semantic-progress","semantic-progress-fill",
  "semantic-stage-screened","semantic-stage-dictionary","semantic-stage-boundary",
  "semantic-stage-desk","semantic-desk-progress","semantic-desk-fill",
  "semantic-stage-readiness","semantic-readiness-progress","semantic-readiness-fill",
  "semantic-boundary-progress","semantic-boundary-fill",
  "semantic-stage-lexical","semantic-stage-emoji",
  "semantic-stage-visibility","semantic-visibility-progress","semantic-visibility-fill","semantic-visibility-note",
  "semantic-dictionary-progress","semantic-dictionary-fill",
  "semantic-lexical-progress","semantic-lexical-fill",
  "semantic-emoji-progress","semantic-emoji-fill","semantic-crossref-note"
]) ids[id]=new Element();
ids["semantic-filter"].value="all";
ids["semantic-lexical-filter"].value="all";
ids["semantic-action-filter"].value="all";
ids["semantic-visual-filter"].value="all";
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
    if(path==="semantic/lexical-crossref-v0.1.json")return {ok:true,json:async()=>lexical};
    if(path==="semantic/strict-gloss-index-v0.1.json")return {ok:true,json:async()=>audit};
    if(path==="semantic/sense-review-queue-v0.1.json")return {ok:true,json:async()=>review};
    if(path==="semantic/emoji-visibility-audit-v0.1.json")return {ok:true,json:async()=>visibility};
    if(path==="semantic/lexical-review-readiness-v0.1.json")return {ok:true,json:async()=>readiness};
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
assert.equal(ids["semantic-screened-count"].textContent,"1000 / 1000");
assert.equal(ids["semantic-candidate-count"].textContent,data.summary.pictogramCandidateCharacters+" / 1000");
assert.equal(ids["semantic-verified-count"].textContent,"0.0%");
assert.equal(ids["semantic-progress-fill"].style.width,"100.0%");
assert.equal(ids["semantic-progress"].attrs["aria-valuenow"],"1000");
assert.equal(ids["semantic-stage-screened"].textContent,"1000 / 1000 (100.0%)");
assert.equal(ids["semantic-stage-dictionary"].textContent,lexical.metrics.crossReferenced+" / 1000 ("+(lexical.metrics.crossReferenced/10).toFixed(1)+"%)");
assert.equal(ids["semantic-stage-lexical"].textContent,"0 / 1000 (0.0%)");
assert.equal(ids["semantic-stage-desk"].textContent,review.counts.deskAnalyzedTotal+" / 248 (100.0%) · not approval");
assert.equal(ids["semantic-desk-fill"].style.width,"100.0%");
assert.equal(ids["semantic-desk-progress"].attrs["aria-valuenow"],"248");
assert.equal(ids["semantic-stage-readiness"].textContent,"897 / 897 (100.0%) · awaiting independent approval");
assert.equal(ids["semantic-readiness-fill"].style.width,"100.0%");
assert.equal(ids["semantic-readiness-progress"].attrs["aria-valuenow"],"897");
assert.equal(ids["semantic-stage-emoji"].textContent,"0 / 1000 (0.0%)");
assert.equal(ids["semantic-stage-visibility"].textContent,"897 / 897 (100.0%) · research only");
assert.equal(ids["semantic-visibility-fill"].style.width,"100.0%");
assert.match(ids["semantic-visibility-note"].textContent,/266 action cues/);
assert.equal(ids["semantic-dictionary-fill"].style.width,(lexical.metrics.crossReferenced/10).toFixed(1)+"%");
assert.equal(ids["semantic-stage-boundary"].textContent,"1000 / 1000 (100.0%)");
assert.equal(ids["semantic-boundary-fill"].style.width,"100.0%");
assert.equal(ids["semantic-boundary-progress"].attrs["aria-valuenow"],"1000");
assert.equal(ids["semantic-lexical-fill"].style.width,"0.0%");
assert.equal(ids["semantic-emoji-fill"].style.width,"0.0%");
assert.ok(ids["semantic-crossref-note"].textContent.includes("649 of 897"));
assert.ok(ids["semantic-crossref-note"].textContent.includes("248 need sense alignment"));
const flatten=x=>[x,...x.children.flatMap(flatten)];
assert.ok(flatten(cards[0]).some(x=>x.className==="semantic-emoji" && x.textContent==="1️⃣"));
assert.ok(flatten(cards[0]).some(x=>x.className==="semantic-dictionary-note" &&
  x.textContent.includes("headword located")));
assert.ok(!flatten(cards[38]).some(x=>x.className==="semantic-source" &&
  x.textContent.includes("Production verified")));
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
assert.match(ids["semantic-coverage-status"].textContent,new RegExp(data.summary.deferredCharacters+" characters match"));
ids["semantic-filter"].value="candidate";
ids["semantic-filter"].events.change();
assert.match(ids["semantic-coverage-status"].textContent,new RegExp(data.summary.pictogramCandidateCharacters+" characters match"));
ids["semantic-next"].events.click();
assert.match(ids["semantic-page-label"].textContent,new RegExp("Page 2 of "+Math.ceil(data.summary.pictogramCandidateCharacters/40)));
ids["semantic-filter"].value="all";
ids["semantic-filter"].events.change();
ids["semantic-lexical-filter"].value="needs-review";
ids["semantic-lexical-filter"].events.change();
assert.match(ids["semantic-coverage-status"].textContent,/248 characters match/);
ids["semantic-lexical-filter"].value="desk-analyzed";
ids["semantic-lexical-filter"].events.change();
assert.match(ids["semantic-coverage-status"].textContent,/248 characters match/);
assert.ok(flatten(ids["semantic-coverage-rows"].children[0])
  .some(x=>x.className==="semantic-review-detail" &&
    x.textContent.includes("Preliminary desk analysis")));
ids["semantic-lexical-filter"].value="desk-pending";
ids["semantic-lexical-filter"].events.change();
assert.match(ids["semantic-coverage-status"].textContent,/0 characters match/);
ids["semantic-lexical-filter"].value="high-priority";
ids["semantic-lexical-filter"].events.change();
assert.match(ids["semantic-coverage-status"].textContent,/15 characters match/);
assert.ok(flatten(ids["semantic-coverage-rows"].children[0]).some(x=>x.className==="semantic-review-note"));
ids["semantic-lexical-filter"].value="medium-priority";
ids["semantic-lexical-filter"].events.change();
assert.match(ids["semantic-coverage-status"].textContent,/11 characters match/);
ids["semantic-lexical-filter"].value="unclassified-priority";
ids["semantic-lexical-filter"].events.change();
assert.match(ids["semantic-coverage-status"].textContent,/222 characters match/);
ids["semantic-lexical-filter"].value="substring-only";
ids["semantic-lexical-filter"].events.change();
assert.match(ids["semantic-coverage-status"].textContent,/7 characters match/);
ids["semantic-lexical-filter"].value="whole-match";
ids["semantic-lexical-filter"].events.change();
assert.match(ids["semantic-coverage-status"].textContent,/638 characters match/);
ids["semantic-lexical-filter"].value="crossref";
ids["semantic-lexical-filter"].events.change();
assert.match(ids["semantic-coverage-status"].textContent,new RegExp(lexical.metrics.crossReferenced+" characters match"));
ids["semantic-lexical-filter"].value="not-crossref";
ids["semantic-lexical-filter"].events.change();
assert.match(ids["semantic-coverage-status"].textContent,new RegExp((1000-lexical.metrics.crossReferenced)+" characters match"));
ids["semantic-lexical-filter"].value="all";
ids["semantic-lexical-filter"].events.change();
for(const [action,expected] of [
  ["inspect_context",161],["reassess_or_defer",69],
  ["redesign_verb_cue",9],["redesign_pictogram",8],
  ["inspect_existing_alternative",1]
]){
  ids["semantic-action-filter"].value=action;
  ids["semantic-action-filter"].events.change();
  assert.match(ids["semantic-coverage-status"].textContent,
    new RegExp(expected+" characters match"),"Action filter "+action);
}
ids["semantic-action-filter"].value="all";
ids["semantic-action-filter"].events.change();
for(const [kind,count] of [
  ["single-icon",875],["multiple-icons",22],["event-role",280],
  ["single-event",266],["mixed-role",337],["association",21],["same-character-collision",1]
]){
 ids["semantic-visual-filter"].value=kind;
 ids["semantic-visual-filter"].events.change();
 const expected=kind==="single-icon" ? 859 : count;
 assert.match(ids["semantic-coverage-status"].textContent,new RegExp(expected+" characters match"));
}
ids["semantic-visual-filter"].value="all";
ids["semantic-visual-filter"].events.change();
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
assert.match(html,/id="semantic-readiness-progress"/);
assert.equal(data.summary.pendingScreening,0);
assert.equal(data.initialScreeningReview.experimentalExpressionCount,897);
assert.match(html,/data-character-layer-controls/);
assert.match(html,/src="layers.js"/);
assert.match(html,/id="semantic-lexical-filter"/);
assert.match(html,/id="semantic-action-filter"/);
assert.match(html,/id="semantic-visual-filter"/);
assert.match(html,/value="mixed-role"/);
assert.match(html,/id="semantic-visibility-progress"/);
assert.match(html,/id="semantic-desk-progress"/);
assert.match(html,/id="semantic-boundary-progress"/);
assert.match(html,/value="substring-only"/);
assert.match(html,/value="high-priority"/);
assert.match(html,/id="semantic-layer-character" checked/);
assert.match(html,/semantic\/mandarin-1000-v0.1\.json|semantic-coverage\.js/);
console.log("Semantic coverage UI: data loaded, progress percentages, 40-card pagination, emoji-only rendering, filters and visibility toggles.");
