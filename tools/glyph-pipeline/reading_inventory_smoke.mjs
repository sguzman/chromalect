// Source-aligned reading-inventory UI and export-integrity regression tests.
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import {validateReadingInventory} from "./reading_inventory_validate.mjs";
const triage=JSON.parse(fs.readFileSync("data/semantic/cedict-crossref/polysemy-triage-v0.1.json","utf8"));
const pilot=JSON.parse(fs.readFileSync("data/semantic/cedict-crossref/external-dictionary-reconnaissance-v0.1.json","utf8"));
const discrepancy=JSON.parse(fs.readFileSync("data/semantic/cedict-crossref/external-dictionary-discrepancy-v0.1.json","utf8"));
const pageChecks=JSON.parse(fs.readFileSync("data/semantic/cedict-crossref/publisher-page-provenance-v0.2.json","utf8"));
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
 "reading-form","reading-usage","reading-unit","reading-evidence-kind","reading-evidence-id","reading-evidence-url","reading-evidence-credit","reading-evidence-rights","reading-example","reading-reference",
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
elements["reading-evidence-kind"].value="none";
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
  if(path==="semantic/external-dictionary-discrepancy-v0.1.json")return {ok:true,json:async()=>discrepancy};
  if(path==="semantic/publisher-page-provenance-v0.2.json")return {ok:true,json:async()=>pageChecks};
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
// Changing setup controls cannot discard locked observations before export.
elements["reading-start"].click();
assert.match(elements["reading-status"].textContent,/not discarded/);
assert.equal(elements["reading-progress"].attributes["aria-valuenow"],"1");
elements["reading-export"].click();
assert.ok(payloadBlob instanceof Blob);
const session=JSON.parse(await payloadBlob.text());
assert.equal(session.session.scope,"higher");
assert.equal(session.session.requestedCount,"20");
assert.equal(session.observations.length,1);
assert.equal(session.schema,"chromalect.reading-inventory-observation-session.v0.2");
assert.equal(session.observations[0].contextEvidence,null);
assert.deepEqual(validateReadingInventory(session,triage,blocks),{
 characterEntries:1000,dictionaryReadingEntries:1393,localObservations:1,independentApprovals:0
});
const copy=x=>JSON.parse(JSON.stringify(x));
const sampled=copy(session);
sampled.observations[0].usageExample="测试上下文";
sampled.observations[0].contextEvidence={sourceKind:"tatoeba",
 sourceRecordId:"123456789",sourceUrl:"https://tatoeba.org/en/sentences/show/123456789",
 contributorAttribution:"Synthetic fixture author",reuseDisposition:"cc_by_2_0_fr"};
assert.equal(validateReadingInventory(sampled,triage,blocks).localObservations,1);
const noCitation=copy(sampled);noCitation.observations[0].contextEvidence=null;
assert.throws(()=>validateReadingInventory(noCitation,triage,blocks));
const rights=copy(sampled);rights.observations[0].contextEvidence.reuseDisposition="link_only";
assert.throws(()=>validateReadingInventory(rights,triage,blocks));
const spoof=copy(sampled);spoof.observations[0].contextEvidence.sourceUrl="https://example.org/en/sentences/show/123456789";
assert.throws(()=>validateReadingInventory(spoof,triage,blocks));
const injected=copy(sampled);injected.observations[0].contextEvidence.independentLexicalApproval=true;
assert.throws(()=>validateReadingInventory(injected,triage,blocks));
const credentials=copy(sampled);credentials.observations[0].contextEvidence.sourceUrl=
 "https://example:password@tatoeba.org/en/sentences/show/123456789";
assert.throws(()=>validateReadingInventory(credentials,triage,blocks));
const wrongId=copy(sampled);wrongId.observations[0].contextEvidence.sourceRecordId="123456788";
assert.throws(()=>validateReadingInventory(wrongId,triage,blocks));
const v1=copy(session);v1.schema="chromalect.reading-inventory-observation-session.v0.1";
delete v1.observations[0].contextEvidence;
assert.equal(validateReadingInventory(v1,triage,blocks).localObservations,1);

const wrong=copy(session);wrong.observations[0].reading="fictional1";
assert.throws(()=>validateReadingInventory(wrong,triage,blocks));
const swap=copy(session);swap.observations[0].dictionaryBlobSha="bad";
assert.throws(()=>validateReadingInventory(swap,triage,blocks));
const promoted=copy(session);promoted.observations[0].lexicalApproval="verified";
assert.throws(()=>validateReadingInventory(promoted,triage,blocks));
const violated=copy(session);violated.session.scope="baseline"; // Exclusive of the high-attention tier.
assert.throws(()=>validateReadingInventory(violated,triage,blocks));
const duplicate=copy(session);duplicate.observations.push(copy(duplicate.observations[0]));duplicate.session.recorded=2;
assert.throws(()=>validateReadingInventory(duplicate,triage,blocks));
const blank=copy(session);blank.observations[0].evidenceRationale="short";
assert.throws(()=>validateReadingInventory(blank,triage,blocks));
elements["reading-next"].click();
assert.equal(elements["reading-after"].hidden,true);
assert.equal(elements["reading-form"].hidden,false);
// The UI requires source identification, contributor credit and confirmed reuse before copying context.
const val=(id,value,event="input")=>{elements[id].value=value;elements[id].events[event]?.();};
val("reading-usage","undetermined","change");
val("reading-unit","undetermined","change");
val("reading-rationale","No reading in this synthetic fixture has independently accepted usage.");
val("reading-evidence-kind","tatoeba","change");
val("reading-evidence-id","123456789");
val("reading-evidence-url","https://tatoeba.org/en/sentences/show/123456789");
val("reading-evidence-credit","Synthetic test contributor");
val("reading-evidence-rights","link_only","change");
val("reading-example","非实证测试文字");
assert.equal(elements["reading-commit"].disabled,true,"Link-only source cannot redistribute quoted text");
val("reading-evidence-rights","cc_by_2_0_fr","change");
assert.equal(elements["reading-commit"].disabled,false);
elements["reading-commit"].click();
elements["reading-export"].click();
const cited=JSON.parse(await payloadBlob.text());
assert.equal(cited.observations.length,2);
assert.equal(cited.observations[1].contextEvidence.sourceRecordId,"123456789");
assert.equal(cited.observations[1].contextEvidence.reuseDisposition,"cc_by_2_0_fr");
assert.equal(validateReadingInventory(cited,triage,blocks).localObservations,2);
assert.match(html,/173 reading entries for 119 characters/);
elements["reading-scope"].value="higher_no_links";
elements["reading-count"].value="all";
elements["reading-start"].click();
assert.equal(elements["reading-progress"].attributes["aria-valuemax"],"140");
assert.match(elements["reading-rank"].textContent,/higher/);
assert.match(html,/data-character-layer-controls/);
assert.match(html,/dictionary-readings.js/);
assert.equal(pageChecks.entries.length,27);
assert.equal(pageChecks.summary.highAttentionCharactersRepresented,23);
assert.ok(source.includes("No lexical approval."));
assert.ok(source.includes("page not checked in the current provenance registry"));
console.log("Reading inventory: 1,393 source entries, 319 high-attention entries, 173 no-pictogram entries, local-only v0.1 exports and tamper guards.");
