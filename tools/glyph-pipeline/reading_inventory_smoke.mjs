// Source-aligned reading-inventory UI and export-integrity regression tests.
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import {validateReadingInventory} from "./reading_inventory_validate.mjs";
const triage=JSON.parse(fs.readFileSync("data/semantic/cedict-crossref/polysemy-triage-v0.1.json","utf8"));
const pilot=JSON.parse(fs.readFileSync("data/semantic/cedict-crossref/external-dictionary-reconnaissance-v0.1.json","utf8"));
const names=["0001-0200","0201-0400","0401-0600","0601-0800","0801-1000"];
const blocks=names.map(n=>JSON.parse(fs.readFileSync(
 "data/semantic/cedict-crossref/dictionary-excerpts-"+n+".json","utf8")));
const catalog=JSON.parse(fs.readFileSync("data/catalog/characters-0001-1000.json","utf8"));
const profile={schema:"chromalect.mandarin-character-profile.v1",catalog_count:1000,
 characters:catalog.characters.map(x=>({rank:x.rank,character:x.character}))};
const html=fs.readFileSync("site/reading-inventory.html","utf8");
const source=fs.readFileSync("site/reading-inventory.js","utf8");
const ids=["reading-scope","reading-count","reading-start","reading-export",
 "reading-status","reading-session","reading-count-label","reading-progress",
 "reading-progress-fill","reading-glyph","reading-rank","reading-current",
 "reading-gloss","reading-references","reading-external-sources","reading-other","reading-full","reading-source-id",
 "reading-form","reading-usage","reading-unit","reading-example","reading-reference",
 "reading-rationale","reading-commit","reading-after","reading-next"];
class Element{
 constructor(tag="div"){this.tagName=tag;this.events={};this.attributes={};this.style={};
  this.value="";this.textContent="";this.hidden=false;this.disabled=false;this.children=[];}
 addEventListener(k,f){this.events[k]=f;}
 setAttribute(k,v){this.attributes[k]=String(v);}
 replaceChildren(...elements){this.children=[...elements];}
 appendChild(x){this.children.push(x);}
 click(){this.events.click?.();}
 remove(){}
}
const elements=Object.fromEntries(ids.map(id=>[id,new Element()]));
elements["reading-scope"].value="higher";
elements["reading-count"].value="20";
elements["reading-start"].disabled=true;
elements["reading-export"].disabled=true;
elements["reading-session"].hidden=true;
const body=new Element("body");
let payloadBlob;
const sandbox={
 document:{getElementById:id=>elements[id],createElement:tag=>new Element(tag),body},
 ChromalectLayers:{createGlyph:r=>{const glyph=new Element();glyph.textContent=r.character;return glyph;}},
 Blob,Math,Date,URL:{
  createObjectURL:x=>{payloadBlob=x;return "blob:test";},
  revokeObjectURL:x=>assert.equal(x,"blob:test")
 },
 fetch:async path=>{
  if(path==="semantic/polysemy-triage-v0.1.json")return {ok:true,json:async()=>triage};
  if(path==="semantic/external-dictionary-reconnaissance-v0.1.json")return {ok:true,json:async()=>pilot};
  for(let i=0;i<names.length;i++)if(path==="semantic/dictionary-excerpts-"+names[i]+".json")
   return {ok:true,json:async()=>blocks[i]};
  if(path==="profiles/mandarin-1000-v1.json")return {ok:true,json:async()=>profile};
  throw new Error("Unexpected fetch: "+path);
 }
};
sandbox.globalThis=sandbox;
vm.runInNewContext(fs.readFileSync("site/dictionary-readings.js","utf8"),sandbox);
vm.runInNewContext(fs.readFileSync("site/dictionary-reference-cues.js","utf8"),sandbox);
vm.runInNewContext(source,sandbox);
for(let i=0;i<20&&elements["reading-start"].disabled;i++)await Promise.resolve();
assert.equal(elements["reading-start"].disabled,false);
assert.match(elements["reading-status"].textContent,/1,393/);
elements["reading-start"].click();
assert.equal(elements["reading-session"].hidden,false);
assert.equal(elements["reading-progress"].attributes["aria-valuenow"],"0");
assert.ok(elements["reading-current"].textContent);
assert.ok(elements["reading-gloss"].textContent);
assert.ok(elements["reading-full"].textContent);
const sourceReferences=sandbox.ChromalectDictionaryReferences.scan(
 "related to 十天干[shi2 tian1 gan1] and 乙方[yi3 fang1]");
assert.equal(sourceReferences.length,2);
assert.equal(sourceReferences[0].sourceToken,"十天干[shi2 tian1 gan1]");
assert.ok(elements["reading-rank"].textContent.includes("higher"));
assert.equal(elements["reading-commit"].disabled,true);
elements["reading-usage"].value="undetermined";elements["reading-usage"].events.change();
elements["reading-unit"].value="undetermined";elements["reading-unit"].events.change();
elements["reading-rationale"].value="Pinned dictionary gloss is not sufficient to determine contemporary usage.";
elements["reading-rationale"].events.input();
assert.equal(elements["reading-commit"].disabled,false);
elements["reading-commit"].click();
assert.equal(elements["reading-form"].hidden,true);
assert.equal(elements["reading-after"].hidden,false);
assert.equal(elements["reading-progress-fill"].style.width,"5.0%");
elements["reading-scope"].value="unmapped";
elements["reading-count"].value="all";
elements["reading-export"].click();
assert.ok(payloadBlob instanceof Blob);
const session=JSON.parse(await payloadBlob.text());
assert.equal(session.session.scope,"higher");
assert.equal(session.session.requestedCount,"20");
assert.equal(session.observations.length,1);
assert.deepEqual(validateReadingInventory(session,triage,blocks),{
 characterEntries:1000,dictionaryReadingEntries:1393,localObservations:1,independentApprovals:0
});
const copy=x=>JSON.parse(JSON.stringify(x));
const wrong=copy(session);wrong.observations[0].reading="fictional1";
assert.throws(()=>validateReadingInventory(wrong,triage,blocks));
const swap=copy(session);swap.observations[0].dictionaryBlobSha="bad";
assert.throws(()=>validateReadingInventory(swap,triage,blocks));
const promoted=copy(session);promoted.observations[0].lexicalApproval="verified";
assert.throws(()=>validateReadingInventory(promoted,triage,blocks));
const violated=copy(session);violated.session.scope="unmapped";
assert.throws(()=>validateReadingInventory(violated,triage,blocks));
const duplicate=copy(session);duplicate.observations.push(copy(duplicate.observations[0]));duplicate.session.recorded=2;
assert.throws(()=>validateReadingInventory(duplicate,triage,blocks));
const blank=copy(session);blank.observations[0].evidenceRationale="short";
assert.throws(()=>validateReadingInventory(blank,triage,blocks));
elements["reading-next"].click();
assert.equal(elements["reading-after"].hidden,true);
assert.equal(elements["reading-form"].hidden,false);
assert.match(html,/173 reading entries for 119 characters/);
elements["reading-scope"].value="higher_no_links";
elements["reading-count"].value="all";
elements["reading-start"].click();
assert.equal(elements["reading-progress"].attributes["aria-valuemax"],"140");
assert.match(elements["reading-rank"].textContent,/higher/);
assert.match(html,/data-character-layer-controls/);
assert.match(html,/dictionary-readings.js/);
console.log("Reading inventory: 1,393 source entries, 319 high-attention entries, 173 no-pictogram entries, local-only v0.1 exports and tamper guards.");
