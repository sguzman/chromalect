import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
const source=fs.readFileSync("site/lexical-review.js","utf8");
const html=fs.readFileSync("site/lexical-review.html","utf8");
const queue=JSON.parse(fs.readFileSync("data/semantic/cedict-crossref/full-lexical-review-queue-v0.1.json","utf8"));
const catalog=JSON.parse(fs.readFileSync("data/catalog/characters-0001-1000.json","utf8"));
const profile={schema:"chromalect.mandarin-character-profile.v1",catalog_count:1000,
 characters:catalog.characters.map(r=>({rank:r.rank,character:r.character}))};
const ids=[
 "lexical-study-scope","lexical-study-count","lexical-study-start","lexical-study-export",
 "lexical-study-status","lexical-study-session","lexical-study-count-label",
 "lexical-study-progress","lexical-study-fill","lexical-study-character",
 "lexical-study-meaning","lexical-study-unihan","lexical-study-dictionary",
 "lexical-study-readings","lexical-study-complexity","lexical-study-reading",
 "lexical-study-reading-evidence",
 "lexical-study-form","lexical-study-decisions","lexical-study-rationale",
 "lexical-study-commit","lexical-study-after","lexical-study-prior","lexical-study-next"
];
class Element {
 constructor(tag="div"){
  this.tagName=tag;this.events={};this.attributes={};this.dataset={};this.textContent="";
  this.style={};this.value="";this.hidden=false;this.disabled=false;this.children=[];
 }
 addEventListener(type,fn){this.events[type]=fn;}
 setAttribute(k,v){this.attributes[k]=String(v);}
 appendChild(child){this.children.push(child);}
 click(){this.events.click?.();this.clicked=true;}
 remove(){this.removed=true;}
 replaceChildren(...children){this.children=[...children];}
}
const elements=Object.fromEntries(ids.map(x=>[x,new Element()]));
elements["lexical-study-scope"].value="all";
elements["lexical-study-count"].value="20";
elements["lexical-study-start"].disabled=true;
elements["lexical-study-export"].disabled=true;
elements["lexical-study-session"].hidden=true;
elements["lexical-study-after"].hidden=true;
elements["lexical-study-commit"].disabled=true;
const buttons=["supported","unsupported","uncertain"].map(v=>{
 const e=new Element("button");e.dataset.lexicalJudgment=v;return e;
});
let downloaded=null,blob=null,revoked=false;
const body=new Element("body");
const document={
 getElementById:id=>elements[id],
 querySelectorAll:selector=>{
  assert.equal(selector,"[data-lexical-judgment]");
  return buttons;
 },
 createElement:tag=>{
  const x=new Element(tag);
  if(tag==="a")downloaded=x;
  return x;
 },
 body
};
const sandbox={
 document,Blob,Date,Math,
 ChromalectLayers:{createGlyph:row=>{
   const glyph=new Element("div");glyph.className="glyph-wrap";glyph.textContent=row.character;return glyph;
 }},
 URL:{createObjectURL:b=>{blob=b;return "blob:local-test";},
   revokeObjectURL:url=>{assert.equal(url,"blob:local-test");revoked=true;}},
 fetch:async path=>{
  if(path==="semantic/full-lexical-review-queue-v0.1.json")return {ok:true,json:async()=>queue};
  if(path==="profiles/mandarin-1000-v1.json")return {ok:true,json:async()=>profile};
  throw new Error("Unexpected resource "+path);
 }
};
sandbox.globalThis=sandbox;
vm.runInNewContext(fs.readFileSync("site/dictionary-readings.js","utf8"),sandbox);
vm.runInNewContext(source,sandbox);
for(let i=0;i<12&&elements["lexical-study-start"].disabled;i++)await Promise.resolve();
assert.equal(elements["lexical-study-start"].disabled,false,"Versioned queue must load");
assert.match(elements["lexical-study-status"].textContent,/897 unapproved/);
elements["lexical-study-start"].click();
assert.equal(elements["lexical-study-session"].hidden,false);
assert.equal(elements["lexical-study-after"].hidden,true);
assert.equal(elements["lexical-study-prior"].textContent,"","Prior desk analysis must be blind initially");
assert.equal(elements["lexical-study-character"].children.length,1);
assert.equal(elements["lexical-study-character"].children[0].className,"glyph-wrap");
assert.ok(elements["lexical-study-character"].children[0].textContent);
assert.ok(elements["lexical-study-dictionary"].textContent);
assert.ok(elements["lexical-study-readings"].textContent);
assert.ok(elements["lexical-study-reading"].children.length>=3);
assert.ok(elements["lexical-study-reading-evidence"].children.length>=1);
assert.ok(elements["lexical-study-reading-evidence"].children[0].children[1].textContent);
assert.ok(!/emoji|🪓/.test(elements["lexical-study-dictionary"].textContent),
 "Dictionary excerpt should not expose a selected pictogram");
assert.equal(elements["lexical-study-progress"].attributes["aria-valuenow"],"0");
buttons[2].click();
assert.equal(elements["lexical-study-commit"].disabled,true,"Rationale is required");
elements["lexical-study-rationale"].value="The reference excerpt needs more contemporary usage evidence.";
elements["lexical-study-rationale"].events.input();
assert.equal(elements["lexical-study-commit"].disabled,true,
 "An explanation without a reading disposition cannot be locked");
elements["lexical-study-reading"].value="undetermined";
elements["lexical-study-reading"].events.change();
assert.equal(elements["lexical-study-commit"].disabled,false);
elements["lexical-study-commit"].click();
assert.equal(elements["lexical-study-form"].hidden,true);
assert.equal(elements["lexical-study-after"].hidden,false);
assert.ok(elements["lexical-study-prior"].textContent.length>5);
assert.equal(elements["lexical-study-progress"].attributes["aria-valuenow"],"1");
assert.equal(elements["lexical-study-fill"].style.width,"5.0%");
assert.equal(elements["lexical-study-export"].disabled,false);
// Session metadata must remain tied to the selection at start, not later filter edits.
elements["lexical-study-scope"].value="flagged";
elements["lexical-study-count"].value="all";
elements["lexical-study-export"].click();
assert.ok(blob instanceof Blob);
assert.equal(downloaded.download,"chromalect-lexical-source-review.json");
assert.equal(revoked,true);
const data=JSON.parse(await blob.text());
assert.equal(data.schema,"chromalect.lexical-review-observation-session.v0.3");
assert.equal(data.observations[0].readingSelection,"undetermined");
assert.equal(data.status,"local_preliminary_observations_not_independent_lexical_approval");
assert.equal(data.observations.length,1);
assert.equal(data.session.planned,20);
assert.equal(data.session.scope,"all");
assert.equal(data.session.requestedCount,"20");
assert.equal(data.observations[0].preliminaryJudgment,"uncertain");
assert.equal(data.source.queue,"full-lexical-review-queue-v0.1.json");
assert.equal(typeof data.observations[0].strictWholeTermMatchAtIntake,"boolean");
assert.equal(data.observations[0].lexicalApproval,"not_granted");
assert.equal(data.observations[0].emojiComprehensionApproval,"not_granted");
assert.equal(data.observations[0].productionVerified,false);
assert.ok(!("emojiExpression" in data.observations[0]));
assert.equal(data.observations[0].evidenceRationale,
 "The reference excerpt needs more contemporary usage evidence.");
elements["lexical-study-next"].click();
assert.equal(elements["lexical-study-form"].hidden,false);
assert.equal(elements["lexical-study-after"].hidden,true);
assert.equal(elements["lexical-study-prior"].textContent,"");
// Cohort filters must not exclude the apparently easy but unverified matches.
elements["lexical-study-scope"].value="matched";
elements["lexical-study-start"].click();
assert.equal(elements["lexical-study-session"].hidden,false);
assert.match(elements["lexical-study-status"].textContent,/Compare the lexical sources/);
elements["lexical-study-scope"].value="multiple_readings";
elements["lexical-study-start"].click();
assert.ok(elements["lexical-study-reading"].children.length>3);
elements["lexical-study-scope"].value="polysemy_high";
elements["lexical-study-start"].click();
assert.ok(elements["lexical-study-reading"].children.length>3);
assert.ok(elements["lexical-study-complexity"].textContent.includes("definition fragments"));
elements["lexical-study-scope"].value="flagged";
elements["lexical-study-start"].click();
assert.ok(elements["lexical-study-meaning"].textContent.length>0);
assert.match(html,/without first seeing the emoji/);
assert.match(html,/src="layers.js"/);
assert.match(html,/data-character-layer-controls/);
assert.match(html,/897 provisional meaning candidates/);
console.log("Lexical worksheet: reading-specific v0.3, 897 pending candidates, polysemy cohorts, rationale+reading gates, local-only export.");
