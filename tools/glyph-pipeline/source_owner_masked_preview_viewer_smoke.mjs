import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
const manifest=JSON.parse(fs.readFileSync(
 "site/glyphs/research/owner-masked-stimuli-v0.1/index-v0.1.json","utf8"));
const indexPath="glyphs/research/owner-masked-stimuli-v0.1/index-v0.1.json";
const scripts=["site/source-owner-masked-preview-core.js",
 "site/source-owner-masked-preview.js"].map(p=>fs.readFileSync(p,"utf8"));
const ids=["om-status","om-cohort","om-pair","om-size","om-count","om-meta",
 "om-grid","om-native","om-a","om-b","om-a-form","om-b-form",
 "om-prev","om-next","om-position"];
class Element{
 constructor(){
  this.value="";this.textContent="";this.src="";this.children=[];this.events={};
  this.disabled=false;this.style={setProperty:(name,value)=>{this.style[name]=value;}};
 }
 appendChild(x){this.children.push(x);return x;}
 replaceChildren(...nodes){this.children=nodes;}
 addEventListener(name,fn){this.events[name]=fn;}
}
function setup(source=manifest,hash=""){
 const elements=Object.fromEntries(ids.map(id=>[id,new Element()]));
 elements["om-size"].value="96";
 elements["om-cohort"].value="all";
 elements["om-cohort"].disabled=true;elements["om-pair"].disabled=true;
 elements["om-prev"].disabled=true;elements["om-next"].disabled=true;
 const fetched=[];
 const fetch=async p=>{
  fetched.push(p);
  assert.equal(p,indexPath,"Browser rehearsal must not fetch original owner-key manifests");
  return {ok:true,json:async()=>source};
 };
 const document={getElementById:id=>elements[id],createElement:()=>new Element()};
 const ctx={document,fetch,URL,Map,Set,Number,Error,location:{hash}};
 ctx.globalThis=ctx;
 for(const script of scripts)vm.runInNewContext(script,ctx);
 return {elements,fetched};
}
async function settle(d){
 const p=d.elements;
 for(let i=0;i<45&&!p["om-pair"].children.length&&
  !p["om-status"].textContent.startsWith("Source-region presentation unavailable");i++)
  await Promise.resolve();
}
const created=setup();await settle(created);
const el=created.elements;
assert.equal(el["om-pair"].children.length,49);
assert.equal(el["om-cohort"].disabled,false);
assert.equal(el["om-pair"].disabled,false);
assert.equal(el["om-grid"].style["--om-glyph-size"],"96px");
assert.deepEqual(created.fetched,[indexPath]);
assert.equal(el["om-prev"].disabled,true);
assert.equal(el["om-next"].disabled,false);
assert.match(el["om-position"].textContent,/1 of 49/);
el["om-next"].events.click();
assert.equal(el["om-pair"].value,manifest.records[1].id);
assert.match(el["om-position"].textContent,/2 of 49/);
el["om-prev"].events.click();
assert.equal(el["om-pair"].value,manifest.records[0].id);
assert.equal(el["om-prev"].disabled,true);
for(const t of manifest.records){
 el["om-pair"].value=t.id;
 el["om-pair"].events.change();
 assert.equal(el["om-native"].textContent,t.character);
 assert.equal(el["om-a"].src,t.candidates[0].svg);
 assert.equal(el["om-b"].src,t.candidates[1].svg);
 assert.notEqual(el["om-a"].src,el["om-b"].src);
 assert.equal(el["om-a-form"].textContent,
  "Source component form: "+t.candidates[0].form);
 assert.equal(el["om-b-form"].textContent,
  "Source component form: "+t.candidates[1].form);
 assert.ok(!el["om-meta"].textContent.includes("cmp-"));
 assert.match(el["om-meta"].textContent,/0 independently adjudicated owners/);
 assert.match(el["om-a"].src,/owner-masked-stimuli-v0[.]1/);
}
for(const [cohort,count] of [["introduced",23],["resolved",21],["retained",5],["all",49]]){
 el["om-cohort"].value=cohort;el["om-cohort"].events.change();
 assert.equal(el["om-pair"].children.length,count);
 assert.match(el["om-count"].textContent,new RegExp(count+" of 49"));
 assert.match(el["om-position"].textContent,
  new RegExp("[0-9]+ of "+count));
 for(let i=0;i<count;i++)el["om-prev"].events.click();
 assert.equal(el["om-pair"].value,el["om-pair"].children[0].value);
 assert.equal(el["om-prev"].disabled,true);
 for(let i=1;i<count;i++)el["om-next"].events.click();
 assert.equal(el["om-pair"].value,el["om-pair"].children[count-1].value);
 assert.equal(el["om-next"].disabled,true);
 const last=el["om-pair"].value;
 el["om-next"].events.click();
 assert.equal(el["om-pair"].value,last,"Navigation cannot exceed cohort");
 el["om-prev"].events.click();
 assert.equal(el["om-pair"].value,el["om-pair"].children[count-2].value);
}
el["om-cohort"].value="not-a-cohort";el["om-cohort"].events.change();
assert.equal(el["om-cohort"].value,"all");
assert.equal(el["om-pair"].children.length,49);
assert.match(el["om-status"].textContent,/Cohort rejected/);
for(const s of [16,24,32,48,64,96,128,160]){
 el["om-size"].value=String(s);el["om-size"].events.change();
 assert.equal(el["om-grid"].style["--om-glyph-size"],s+"px");
}
el["om-size"].value="400";el["om-size"].events.change();
assert.match(el["om-status"].textContent,/Size rejected/);
assert.equal(el["om-grid"].style["--om-glyph-size"],"160px");
const anchored=setup(manifest,"#"+manifest.records[21].id);await settle(anchored);
assert.equal(anchored.elements["om-pair"].value,manifest.records[21].id);
const ignored=setup(manifest,"#../invalid");await settle(ignored);
assert.equal(ignored.elements["om-pair"].value,manifest.records[0].id);
const corrupted=structuredClone(manifest);
corrupted.records[0].candidates[0].componentId="cmp-0001";
const bad=setup(corrupted);await settle(bad);
assert.equal(bad.elements["om-pair"].children.length,0);
assert.equal(bad.elements["om-cohort"].disabled,true);
assert.equal(bad.elements["om-prev"].disabled,true);
assert.equal(bad.elements["om-next"].disabled,true);
assert.match(bad.elements["om-status"].textContent,/Source-region presentation unavailable/);
const html=fs.readFileSync("site/source-owner-masked-preview.html","utf8");
for(const id of ids)assert.ok(html.includes('id="'+id+'"'),id);
for(const expected of ["not a blinded expert-review instrument",
 "records no judgments","original public source manifests",
 "96 CSS px","source-owner-masked-preview-core.js"]){
 assert.ok(html.toLowerCase().includes(expected.toLowerCase()),expected);
}
const js=scripts.at(-1);
for(const forbidden of ["localStorage","sessionStorage","navigator.sendBeacon",
 "document.cookie","innerHTML","XMLHttpRequest","machineAssignedOwner",
 "otherOwner","heldout-identification-target-v0.1/index-v0.1.json"]){
 assert.equal(js.includes(forbidden),false,forbidden);
}
assert.ok(!html.includes("<form"));
assert.ok(!html.includes('type="submit"'));
console.log("Key-reduced masked rehearsal: one isolated manifest fetch, 49 pairs, 23/21/5 cohorts, eight CSS sizes, no owner-key data consumption, no collected responses.");
