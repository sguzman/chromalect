import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
const report=JSON.parse(fs.readFileSync(
 "site/semantic-group-hue-fivefold-heldout-v0.1.json","utf8"));
const script=fs.readFileSync("site/semantic-group-hue-heldout.js","utf8"),
 html=fs.readFileSync("site/semantic-group-hue-heldout.html","utf8");
class Element{
 constructor(){this.children=[];this.className="";this.textContent="";}
 appendChild(x){this.children.push(x);return x;}
 replaceChildren(...xs){this.children=xs;}
}
function start(data=report){
 const ids=["ho-status","ho-summary","ho-table","ho-folds"];
 const ui=Object.fromEntries(ids.map(id=>[id,new Element()]));
 const ctx={
  document:{getElementById:id=>ui[id],createElement:()=>new Element()},
  fetch:async()=>({ok:true,json:async()=>data}),
  Set,Array,Object,Number,Math,Error,JSON
 };
 vm.runInNewContext(script,ctx);
 return ui;
}
async function settle(ui){
 for(let i=0;i<50&&!ui["ho-table"].children.length&&
 !ui["ho-status"].textContent.includes("Unable");i++)await Promise.resolve();
}
const ui=start();await settle(ui);
assert.equal(ui["ho-table"].children.length,6,ui["ho-status"].textContent);
assert.match(ui["ho-summary"].textContent,/five disjoint 200-character cohorts/);
assert.match(ui["ho-summary"].textContent,/original v0\.6/);
assert.match(ui["ho-summary"].textContent,/initial grouped hues/);
assert.match(ui["ho-status"].textContent,/All five disjoint held-out cohorts/);
assert.equal(ui["ho-table"].children[0].children.length,7);
assert.equal(ui["ho-table"].children[0].children[0].textContent,"1");
assert.equal(ui["ho-table"].children[0].children[1].textContent,"200");
assert.equal(ui["ho-table"].children[5].className,"ho-total");
assert.equal(ui["ho-table"].children[5].children[0].textContent,"Total");
assert.equal(ui["ho-table"].children[5].children[3].textContent,"26");
assert.equal(ui["ho-table"].children[5].children[4].textContent,"76");
assert.equal(ui["ho-folds"].children.length,2);
assert.match(ui["ho-folds"].children[1].textContent,/component identities can recur/);
for(const change of [
 d=>{d.schema="approved semantic tests";},
 d=>{d.provenance.originalPaletteRecolored=true;},
 d=>{d.provenance.independentVisionTrialConducted=true;},
 d=>{d.summary.verifiedSemanticFamilies=8;},
 d=>{d.summary.crossFoldHeldOutTotals.activeClosePairs=25;},
 d=>{d.folds[0].train.characters=799;},
 d=>{d.folds[0].excludedFromOptimizer[0]=9999;},
 d=>{d.folds[0].excludedFromOptimizer.pop();},
 d=>{d.folds[2].excludedFromOptimizer[0]=d.folds[1].excludedFromOptimizer[0];},
 d=>{d.folds[0].test.optimizedClosePairs=5000;},
 d=>{d.folds[0].independentlyReviewed=true;},
 d=>{d.summary.crossFoldTrainingTotals.optimizedClosePairs++;}
]){
 const copy=structuredClone(report);change(copy);
 const refused=start(copy);await settle(refused);
 assert.equal(refused["ho-table"].children.length,0);
 assert.match(refused["ho-status"].textContent,/Unable to validate/);
}
for(const id of ["ho-status","ho-summary","ho-table","ho-folds"])
 assert.match(html,new RegExp('id="'+id+'"'));
assert.ok(!script.includes("innerHTML"));
console.log("Five-fold strict rank disjointness, all-1000 held-out glyph source-pair totals, 12 machine-evidence rejection cases.");
