import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const paths=[
 "glyphs/research/heldout-identification-target-v0.1/index-v0.1.json",
 "glyphs/research/heldout-warning-v0.1/index-v0.1.json",
 "semantic-group-hue-fivefold-heldout-v0.1.json",
 "palettes/mandarin-component-identity-v0.6.json",
 "glyphs/research/owner-complement-locators-v0.1/index-v0.1.json"
];
const data=Object.fromEntries(paths.map(p=>[p,read(
 p.startsWith("palettes/")?p:"site/"+p)]));
const scripts=[
 "site/heldout-blind-color-core.js",
 "site/heldout-component-identification-core.js",
 "site/component-owner-adjudication-core.js",
 "site/source-owner-masked-preview.js"
].map(p=>fs.readFileSync(p,"utf8"));
const ids=["om-status","om-cohort","om-pair","om-size","om-count","om-meta",
 "om-grid","om-native","om-a","om-b","om-a-form","om-b-form"];
class Element{
 constructor(){
  this.value="";this.textContent="";this.src="";this.children=[];this.events={};
  this.disabled=false;this.style={setProperty:(name,value)=>{this.style[name]=value;}};
 }
 appendChild(x){this.children.push(x);return x;}
 replaceChildren(...nodes){this.children=nodes;}
 addEventListener(name,fn){this.events[name]=fn;}
}
function setup(sources=data,hash=""){
 const elements=Object.fromEntries(ids.map(id=>[id,new Element()]));
 elements["om-size"].value="96";
 elements["om-cohort"].value="all";
 elements["om-cohort"].disabled=true;elements["om-pair"].disabled=true;
 const fetched=[];
 const fetch=async p=>{
  fetched.push(p);
  assert.ok(paths.includes(p),"Only pinned public research manifests requested");
  return {ok:true,json:async()=>sources[p]};
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
assert.deepEqual(created.fetched,paths);
const originals=data[paths[0]].targets;
const complements=new Map(data[paths[4]].records.map(x=>[x.trialId,x]));
let primaryA=0,primaryB=0;
for(const t of originals){
 el["om-pair"].value=t.id;
 el["om-pair"].events.change();
 assert.equal(el["om-native"].textContent,t.character);
 const other=complements.get(t.id);
 assert.ok(other,"Complementary source region exists for every candidate");
 const srcs=[el["om-a"].src,el["om-b"].src];
 assert.ok(srcs.includes(t.locatorSVG)&&srcs.includes(other.complementarySVG));
 assert.notEqual(srcs[0],srcs[1]);
 const owner=t.offeredComponents.find(x=>x.id===t.machineAssignedOwner);
 const partner=t.offeredComponents.find(x=>x.id===t.otherOwner);
 assert.ok(owner&&partner);
 const captions=[el["om-a-form"].textContent,el["om-b-form"].textContent];
 assert.ok(captions.includes("Source component form: "+owner.form));
 assert.ok(captions.includes("Source component form: "+partner.form));
 assert.ok(!el["om-meta"].textContent.includes("cmp-"));
 assert.ok(!el["om-meta"].textContent.includes(t.machineAssignedOwner));
 assert.match(el["om-meta"].textContent,/0 independently adjudicated owners/);
 if(srcs[0]===t.locatorSVG)primaryA++;else primaryB++;
}
assert.equal(primaryA+primaryB,49);
assert.ok(primaryA>0&&primaryB>0,"Both presentation sides must be represented");
for(const [cohort,count] of [["introduced",23],["resolved",21],["retained",5],["all",49]]){
 el["om-cohort"].value=cohort;
 el["om-cohort"].events.change();
 assert.equal(el["om-pair"].children.length,count);
 assert.match(el["om-count"].textContent,new RegExp(count+" of 49"));
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
const goodFragment=setup(data,"#"+originals[21].id);await settle(goodFragment);
assert.equal(goodFragment.elements["om-pair"].value,originals[21].id);
const wrongFragment=setup(data,"#../invalid");await settle(wrongFragment);
assert.equal(wrongFragment.elements["om-pair"].value,originals[0].id);
const poisoned=structuredClone(data);
poisoned[paths[4]].records[0].complementarySHA256="invalid";
const bad=setup(poisoned);await settle(bad);
assert.equal(bad.elements["om-pair"].children.length,0);
assert.equal(bad.elements["om-cohort"].disabled,true);
assert.match(bad.elements["om-status"].textContent,/Source-region presentation unavailable/);
const html=fs.readFileSync("site/source-owner-masked-preview.html","utf8");
for(const id of ids)assert.ok(html.includes('id="'+id+'"'),id);
for(const warning of ["not a blinded expert-review instrument",
 "records no judgments","machine-assigned ownership information",
 "developer","96 CSS px"]){
 assert.ok(html.toLowerCase().includes(warning.toLowerCase()),warning);
}
const js=scripts.at(-1);
for(const forbidden of ["localStorage","sessionStorage","navigator.sendBeacon",
 "fetch(","document.cookie","innerHTML","XMLHttpRequest"]){
 if(forbidden==="fetch(")continue;
 assert.equal(js.includes(forbidden),false,forbidden);
}
assert.ok(!html.includes("<form"));
assert.ok(!html.includes('type="submit"'));
console.log("49 source-region presentations, 23/21/5 cohorts, eight matched CSS sizes, both mask sides, invalid-source refusal; no participant collection or certification.");
