import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
const read=x=>JSON.parse(fs.readFileSync(x,"utf8"));
const model=read("data/phonetics/zhao-li-2009-34-unit-reference-model-v0.1.json");
const palette=read("site/layers-v0.1.json");
const audit=read("data/phonetics/zhao-li-visual-feature-grammar-audit-v0.1.json");
const page=fs.readFileSync("site/mandarin-model-feature-grammar.html","utf8");
const script=fs.readFileSync("site/mandarin-model-feature-grammar.js","utf8");
class Element{
 constructor(tag){
  this.tag=tag;this.textContent="";this.value="";
  this.children=[];this.events={};this.attributes={};this.className="";
 }
 appendChild(x){this.children.push(x);return x;}
 replaceChildren(...nodes){this.children=nodes;}
 setAttribute(k,v){this.attributes[k]=String(v);}
 addEventListener(k,f){this.events[k]=f;}
}
function mount(sources=[model,palette,audit]){
 const ids=["mfg-onset","mfg-v1","mfg-v2","mfg-v3","mfg-coda","mfg-tone",
  "mfg-status","mfg-glyphs","mfg-decoded","mfg-evidence"];
 const ui=Object.fromEntries(ids.map(id=>[id,new Element("div")]));
 const paths=["phonetics/zhao-li-2009-34-unit-reference-model-v0.1.json",
  "layers-v0.1.json",
  "phonetics/zhao-li-visual-feature-grammar-audit-v0.1.json"];
 const ctx={
  document:{getElementById:id=>ui[id],createElement:x=>new Element(x),
   createElementNS:(_,x)=>new Element(x)},
  fetch:async x=>{
   const i=paths.indexOf(x);assert.ok(i>=0,x);
   return {ok:true,json:async()=>sources[i]};
  },
  JSON,Array,Set,Map,Object,String,Error
 };
 vm.runInNewContext(script,ctx);
 return ui;
}
async function settle(ui){
 for(let i=0;i<90&&!ui["mfg-glyphs"].children.length&&
  !ui["mfg-status"].textContent.includes("Unable");i++)await Promise.resolve();
}
const ui=mount();await settle(ui);
assert.equal(ui["mfg-onset"].children.length,22);
assert.equal(ui["mfg-v1"].children.length,12);
assert.equal(ui["mfg-v2"].children.length,13);
assert.equal(ui["mfg-v3"].children.length,13);
assert.equal(ui["mfg-coda"].children.length,3);
assert.equal(ui["mfg-tone"].children.length,5);
assert.equal(ui["mfg-glyphs"].children.length,6);
assert.match(ui["mfg-status"].textContent,/Strict feature round-trip succeeded/);
assert.match(ui["mfg-decoded"].textContent,/m a\/T1/);
assert.equal(ui["mfg-glyphs"].children[0].children[1].tag,"svg");
assert.equal(ui["mfg-glyphs"].children[1].children[1].tag,"svg");
assert.equal(ui["mfg-glyphs"].children[5].children[1].textContent,"—");
ui["mfg-v3"].value="u";ui["mfg-v3"].events.change();
assert.match(ui["mfg-status"].textContent,/V₃ requires V₂/);
assert.equal(ui["mfg-glyphs"].children.length,0);
ui["mfg-v2"].value="i";ui["mfg-v2"].events.change();
assert.match(ui["mfg-status"].textContent,/Strict feature round-trip succeeded/);
ui["mfg-coda"].value="N";ui["mfg-coda"].events.change();
ui["mfg-tone"].value="2";ui["mfg-tone"].events.change();
assert.match(ui["mfg-decoded"].textContent,/m a i u N\/T2/);
assert.equal(ui["mfg-glyphs"].children[4].children[1].tag,"svg");
assert.equal(ui["mfg-glyphs"].children[5].children[1].textContent,"↗");
ui["mfg-onset"].value="";ui["mfg-onset"].events.change();
assert.match(ui["mfg-status"].textContent,/Strict feature round-trip succeeded/);
ui["mfg-v1"].value="~";ui["mfg-v1"].events.change();
assert.equal(ui["mfg-glyphs"].children[1].children[1].tag,"svg");
assert.match(ui["mfg-evidence"].textContent,/No first-tranche phonemic analysis/);
const wrong=structuredClone(audit);wrong.counts.humanVisualSymbolDecodingResults=1;
const deny=mount([model,palette,wrong]);await settle(deny);
assert.match(deny["mfg-status"].textContent,/Unable to validate/);
assert.equal(deny["mfg-glyphs"].children.length,0);
const expanded=structuredClone(model);
expanded.phonologicalUnits.find(x=>x.sourceToken==="a").articulatoryPlace="back";
const collision=mount([expanded,palette,audit]);await settle(collision);
assert.match(collision["mfg-status"].textContent,/Unable to validate/);
assert.equal(collision["mfg-glyphs"].children.length,0);
for(const id of ["onset","v1","v2","v3","coda","tone","status",
 "glyphs","decoded","evidence"])assert.ok(page.includes('id="mfg-'+id+'"'));
assert.ok(!script.includes("innerHTML")&&!script.includes("localStorage")&&
 !script.includes("sendBeacon"));
console.log("CVVVCT feature viewer: 34 source-model units, six visibly occupied slots, zero automatic Pinyin mapping, invalid and approval statuses rejected.");
