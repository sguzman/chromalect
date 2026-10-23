import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
const registry=JSON.parse(fs.readFileSync(
 "data/phonetics/external-speech-source-registry-v0.1.json","utf8"));
const script=fs.readFileSync("site/mandarin-speech-sources.js","utf8");
const html=fs.readFileSync("site/mandarin-speech-sources.html","utf8");
class Element{
 constructor(){this.children=[];this.textContent="";this.className="";this.href="";}
 appendChild(x){this.children.push(x);}
 replaceChildren(...x){this.children=x;}
}
function setup(source=registry){
 const names=["speech-source-status","speech-source-count","speech-source-list","speech-source-summary"];
 const nodes=Object.fromEntries(names.map(k=>[k,new Element()]));
 const document={getElementById:id=>nodes[id],createElement:()=>new Element()};
 vm.runInNewContext(script,{
  document,fetch:async()=>({ok:true,json:async()=>source}),
  Object,Error,Math,Set,Map,JSON
 });
 return nodes;
}
async function settle(ui){for(let i=0;i<55&&!ui["speech-source-list"].children.length&&
 !ui["speech-source-status"].textContent.includes("Unable");i++)
 await Promise.resolve();}
const ui=setup();await settle(ui);
assert.equal(ui["speech-source-list"].children.length,4);
assert.match(ui["speech-source-count"].textContent,/0 recordings acquired/);
assert.match(ui["speech-source-summary"].textContent,/no IPA approvals/);
assert.match(ui["speech-source-list"].children[0].children[0].textContent,/AISHELL-3/);
assert.match(ui["speech-source-list"].children[0].children[4].href,/openslr\.org\/93/);
assert.match(ui["speech-source-list"].children[2].children[3].textContent,/speaker identification/);
assert.match(ui["speech-source-list"].children[3].children[3].textContent,/Noncommercial/);
for(const change of [
 x=>{x.summary.recordingsDownloaded=1;},
 x=>{x.sources[0].acquisitionStatus="downloaded";},
 x=>{x.sources[1].declaredLicense="no-license";},
 x=>{x.sources[2].constraints=[];},
 x=>{x.sources[3].independentAcousticAnalysisStatus="complete";},
 x=>{x.provenance.copiedSourceRecordings=true;},
 x=>{x.acquisitionPolicy.noSpeakerIdentityInference=false;}
]){
 const bad=structuredClone(registry);change(bad);
 const blocked=setup(bad);await settle(blocked);
 assert.equal(blocked["speech-source-list"].children.length,0);
 assert.match(blocked["speech-source-status"].textContent,/Unable to validate/);
}
for(const id of ["speech-source-status","speech-source-count",
 "speech-source-list","speech-source-summary"])
 assert.match(html,new RegExp('id="'+id+'"'));
assert.ok(!script.includes("innerHTML"));
console.log("Four speech-source metadata cards and seven misleading-acquisition refusals verified.");
