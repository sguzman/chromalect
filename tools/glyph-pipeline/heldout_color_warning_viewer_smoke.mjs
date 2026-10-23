import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
const manifest=JSON.parse(fs.readFileSync(
 "site/glyphs/research/heldout-warning-v0.1/index-v0.1.json","utf8"));
const palette=JSON.parse(fs.readFileSync(
 "palettes/mandarin-component-identity-v0.6.json","utf8"));
const folds=JSON.parse(fs.readFileSync(
 "site/semantic-group-hue-fivefold-heldout-v0.1.json","utf8"));
const semantics=JSON.parse(fs.readFileSync("site/semantic/mandarin-1000-v0.1.json","utf8"));
const grammarSource=fs.readFileSync("site/semantic-grammar.js","utf8");
const contrastSource=fs.readFileSync("site/reference-contrast.js","utf8");
const script=fs.readFileSync("site/heldout-color-warning-review.js","utf8");
const html=fs.readFileSync("site/heldout-color-warning-review.html","utf8");
class Element {
 constructor(){this.children=[];this.events={};this.attrs={};
  this.className="";this.textContent="";this.value="";
  this.checked=false;this.disabled=false;
  this.style={setProperty:(k,v)=>{this.style[k]=v}};}
 appendChild(x){this.children.push(x);return x;}
 replaceChildren(...xs){this.children=xs;}
 addEventListener(event,handler){this.events[event]=handler;}
 setAttribute(k,v){this.attrs[k]=v;}
}
function boot(data=manifest,original=palette,study=folds,semantic=semantics){
 const ids=["hv-status","hv-summary","hv-filter","hv-order","hv-search",
  "hv-size","hv-size-label","hv-gray","hv-surface","hv-select",
  "hv-prev","hv-next","hv-gallery","hv-pairs","hv-count",
  "hv-show-meaning","hv-sense","hv-reveal","hv-semantic"];
 const ui=Object.fromEntries(ids.map(id=>[id,new Element()]));
 ui["hv-filter"].value="all";ui["hv-order"].value="severity";
 ui["hv-size"].value="112";ui["hv-surface"].value="theme";
 const ctx={document:{getElementById:id=>ui[id],
  createElement:()=>new Element()},
  fetch:async path=>({ok:true,json:async()=>
   path.startsWith("glyphs/research/")?data:
   path.startsWith("palettes/")?original:
   path.startsWith("semantic/")?semantic:study}),
  Set,Map,Math,Number,Object,Array,Error,JSON};
 ctx.globalThis=ctx;
 vm.runInNewContext(grammarSource,ctx);
 vm.runInNewContext(contrastSource,ctx);
 vm.runInNewContext(script,ctx);return ui;
}
async function settled(ui){
 for(let i=0;i<70&&!ui["hv-gallery"].children.length&&
 !ui["hv-status"].textContent.includes("Unable");i++)await Promise.resolve();
}
const ui=boot();await settled(ui);
assert.equal(ui["hv-gallery"].children.length,2,ui["hv-status"].textContent);
assert.equal(ui["hv-select"].children.length,manifest.summary.flaggedGlyphs);
assert.match(ui["hv-status"].textContent,/publishing pipeline/);
assert.match(ui["hv-summary"].textContent,/23 new warnings/);
assert.match(ui["hv-summary"].textContent,/21 resolved/);
assert.match(ui["hv-summary"].textContent,/5 retained/);
assert.equal(ui["hv-gallery"].children[0].children[1].children[0].src,
 manifest.glyphs.find(r=>r.severity==="introduced").originalSVG);
assert.equal(ui["hv-gallery"].children[1].children[1].children[0].src,
 manifest.glyphs.find(r=>r.severity==="introduced").heldoutSVG);
assert.match(ui["hv-pairs"].children[1].textContent,/source stroke paths/);
assert.match(ui["hv-pairs"].children[2].children[0].textContent,/source luminance [0-9.]+:1/);
assert.match(ui["hv-pairs"].children[2].children[0].textContent,/fold luminance [0-9.]+:1/);
assert.match(ui["hv-semantic"].children[0].textContent,/held constant across both/);
ui["hv-show-meaning"].checked=true;ui["hv-show-meaning"].events.change();
assert.equal(ui["hv-gallery"].children[0].children[1].children.length,2);
assert.equal(ui["hv-gallery"].children[1].children[1].children.length,2);
const originalMeaning=ui["hv-gallery"].children[0].children[1].children[1];
const foldMeaning=ui["hv-gallery"].children[1].children[1].children[1];
assert.equal(originalMeaning.children.length,foldMeaning.children.length);
assert.equal(originalMeaning.textContent,foldMeaning.textContent);
assert.equal(originalMeaning.attrs["aria-label"],foldMeaning.attrs["aria-label"]);
ui["hv-reveal"].checked=true;ui["hv-reveal"].events.change();
assert.match(ui["hv-semantic"].children[2].textContent,/0 approved/);
ui["hv-show-meaning"].checked=false;ui["hv-show-meaning"].events.change();
assert.equal(ui["hv-gallery"].children[0].children[1].children.length,1);
ui["hv-filter"].value="introduced";ui["hv-filter"].events.change();
assert.equal(ui["hv-gallery"].children.length,2);
assert.equal(ui["hv-select"].children.length,23);
ui["hv-filter"].value="resolved";ui["hv-filter"].events.change();
assert.ok(ui["hv-select"].children.length>0);
ui["hv-filter"].value="all";ui["hv-filter"].events.change();
for(const order of ["distance","rank","severity"]){
 ui["hv-order"].value=order;ui["hv-order"].events.change();
 assert.equal(ui["hv-gallery"].children.length,2);
}
ui["hv-gray"].checked=true;ui["hv-gray"].events.change();
assert.equal(ui["hv-gallery"].children[0].children[1].children[0].style.filter,"grayscale(1)");
assert.equal(ui["hv-gallery"].children[1].children[1].children[0].style.filter,"grayscale(1)");
ui["hv-surface"].value="black";ui["hv-surface"].events.change();
assert.equal(ui["hv-gallery"].children[0].children[1].style["--hv-surface"],"#000");
assert.equal(ui["hv-gallery"].children[1].children[1].style["--hv-surface"],"#000");
ui["hv-size"].value="48";ui["hv-size"].events.input();
assert.equal(ui["hv-gallery"].children[0].children[1].children[0].width,48);
ui["hv-search"].value="cmp-9999";ui["hv-search"].events.input();
assert.equal(ui["hv-gallery"].children.length,0);
assert.match(ui["hv-count"].textContent,/0 source-review glyphs match/);
ui["hv-search"].value="";ui["hv-search"].events.input();
assert.equal(ui["hv-gallery"].children.length,2);
for(const edit of [
 d=>{d.provenance.sourceGlyphsOverwritten=true;},
 d=>{d.provenance.excludedGlyphsUsedForTraining=true;},
 d=>{d.provenance.humanVisualAssessments=1;},
 d=>{d.summary.foldOptimizedWarnings=27;},
 d=>{d.summary.newlyFlaggedGlyphs=22;},
 d=>{d.glyphs[0].sourceGeometryIdentical=false;},
 d=>{d.glyphs[0].visualReview="approved";},
 d=>{d.glyphs[0].heldoutSVG="../external.svg";},
 d=>{d.glyphs[0].pairs[0].semanticsApproved=true;},
 d=>{d.glyphs[0].pairs[0].foldOptimizedDeltaOk=NaN;},
 d=>{d.glyphs[0].pairs[0].componentA.id="cmp-9999";},
 d=>{d.glyphs[0].rank=2000;},
 d=>{d.glyphs[0].pairs[0].componentA.sourceHex="#000000";},
 d=>{d.glyphs[0].foldIndex=(d.glyphs[0].foldIndex+1)%5;},
 d=>{d.glyphs[0].pairs[0].componentA.foldOptimizedHex="#000000";}
]){
 const damaged=structuredClone(manifest);
 edit(damaged);const blocked=boot(damaged);await settled(blocked);
 assert.equal(blocked["hv-gallery"].children.length,0);
 assert.match(blocked["hv-status"].textContent,/Unable to verify/);
}
for(const id of ["hv-status","hv-summary","hv-filter","hv-order","hv-search",
 "hv-size","hv-size-label","hv-gray","hv-surface","hv-select","hv-prev","hv-next",
 "hv-gallery","hv-pairs","hv-count",
 "hv-show-meaning","hv-sense","hv-reveal","hv-semantic"])
 assert.match(html,new RegExp('id="'+id+'"'));
assert.ok(!script.includes("innerHTML"));
console.log("Source-identical held-out review SVGs; 23 new-warning glyphs and 15 false-source/approval refusals.");
