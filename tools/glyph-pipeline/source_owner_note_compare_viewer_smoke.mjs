import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const sources={
 "glyphs/research/heldout-identification-target-v0.1/index-v0.1.json":
  read("site/glyphs/research/heldout-identification-target-v0.1/index-v0.1.json"),
 "glyphs/research/heldout-warning-v0.1/index-v0.1.json":
  read("site/glyphs/research/heldout-warning-v0.1/index-v0.1.json"),
 "semantic-group-hue-fivefold-heldout-v0.1.json":
  read("site/semantic-group-hue-fivefold-heldout-v0.1.json"),
 "palettes/mandarin-component-identity-v0.6.json":
  read("palettes/mandarin-component-identity-v0.6.json"),
 "glyphs/research/owner-complement-locators-v0.1/index-v0.1.json":
  read("site/glyphs/research/owner-complement-locators-v0.1/index-v0.1.json")
};
const paths=["site/heldout-blind-color-core.js",
 "site/heldout-component-identification-core.js",
 "site/component-owner-adjudication-core.js",
 "site/component-owner-compare-core.js"];
const scripts=paths.map(p=>fs.readFileSync(p,"utf8"));
const viewer=fs.readFileSync("site/component-owner-compare.js","utf8");
function syntheticExports(){
 const ctx={URL,Map,Set};ctx.globalThis=ctx;
 for(const script of scripts)vm.runInNewContext(script,ctx);
 const warnings=ctx.ChromalectBlindColorRehearsal.validateSource(
  sources["glyphs/research/heldout-warning-v0.1/index-v0.1.json"],
  sources["semantic-group-hue-fivefold-heldout-v0.1.json"],
  sources["palettes/mandarin-component-identity-v0.6.json"]);
 const manifest=sources["glyphs/research/heldout-identification-target-v0.1/index-v0.1.json"];
 const targets=ctx.ChromalectComponentIdentificationRehearsal.validateSource(manifest,warnings);
 const note=(idx,state)=>new Map([[targets[idx].id,{
  judgment:state,evidenceURL:"https://example.org/independent-source",
  technicalRationale:"External component source geometry needs technical verification before acceptance."
 }]]);
 const exportOne=(i,j)=>ctx.ChromalectOwnerAdjudication.exportNotes(
  targets,note(i,j),"2026-10-23T00:00:00.000Z");
 return [exportOne(0,"provisional_support"),exportOne(0,"provisional_conflict")];
}
class Element{
 constructor(){this.value="";this.textContent="";this.disabled=false;this.children=[];this.events={};}
 addEventListener(name,fn){this.events[name]=fn;}
 appendChild(c){this.children.push(c);return c;}
 replaceChildren(...items){this.children=items;}
}
function setup(data=sources){
 const ids=["oc-status","oc-first","oc-second","oc-compare","oc-summary","oc-table","oc-json"];
 const nodes=Object.fromEntries(ids.map(id=>[id,new Element()]));
 nodes["oc-compare"].disabled=true;
 const document={getElementById:id=>nodes[id],createElement:()=>new Element()};
 const fetch=async path=>{
  assert.ok(path in data,"Only five pinned source manifests fetched");
  return {ok:true,json:async()=>data[path]};
 };
 const ctx={document,fetch,URL,Map,Set,Date};ctx.globalThis=ctx;
 for(const script of [...scripts,viewer])vm.runInNewContext(script,ctx);
 return nodes;
}
async function settle(nodes){
 for(let i=0;i<40&&nodes["oc-compare"].disabled&&
 !nodes["oc-status"].textContent.startsWith("Cannot");i++)
  await Promise.resolve();
}
const v=setup();await settle(v);
assert.equal(v["oc-compare"].disabled,false);
const [a,b]=syntheticExports();
v["oc-first"].value=JSON.stringify(a);
v["oc-second"].value=JSON.stringify(b);
v["oc-compare"].events.click();
assert.equal(v["oc-table"].children.length,49);
assert.match(v["oc-status"].textContent,/Sanitized provisional/);
assert.match(v["oc-summary"].textContent,/1 disagreements/);
const report=JSON.parse(v["oc-json"].value);
assert.equal(report.summary.conflictingProvisionalJudgments,1);
assert.equal(report.summary.sourceOwnerCertifications,0);
assert.ok(!v["oc-json"].value.includes("https://example.org/independent-source"));
assert.ok(!v["oc-json"].value.includes("External component source geometry"));
v["oc-second"].value=JSON.stringify({...b,session:{...b.session,sourceOwnerCertifications:1}});
v["oc-compare"].events.click();
assert.match(v["oc-status"].textContent,/Comparison rejected/);
assert.equal(v["oc-table"].children.length,0);
assert.equal(v["oc-json"].value,"");
v["oc-second"].value="{invalid";
v["oc-compare"].events.click();
assert.match(v["oc-status"].textContent,/Comparison rejected/);
assert.equal(v["oc-table"].children.length,0);
const poisoned=structuredClone(sources);
poisoned["glyphs/research/owner-complement-locators-v0.1/index-v0.1.json"]
 .summary.independentlyApprovedOwners=1;
const bad=setup(poisoned);await settle(bad);
assert.equal(bad["oc-compare"].disabled,true);
assert.match(bad["oc-status"].textContent,/Cannot validate source manifests/);
const html=fs.readFileSync("site/component-owner-compare.html","utf8");
for(const id of ["oc-status","oc-first","oc-second","oc-compare","oc-summary","oc-table","oc-json"])
 assert.ok(html.includes('id="'+id+'"'));
assert.ok(!viewer.includes("innerHTML"));
assert.ok(!viewer.includes("localStorage"));
assert.ok(!viewer.includes("sessionStorage"));
console.log("Local comparison UI: 49 source pairs, conflicting judgments, no evidence-text leakage, invalid-input clear, poisoned-manifest refusal.");
