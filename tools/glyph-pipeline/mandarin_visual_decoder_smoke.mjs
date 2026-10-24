import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
const get=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const src=get("site/pronunciation-citations-0001-1000.json");
const finals=get("data/phonetics/written-final-symbol-control-v0.1.json");
const initials=get("data/phonetics/mandarin-initial-feature-candidates-v0.1.json");
const layers=get("site/layers-v0.1.json");
const audit=get("data/phonetics/mandarin-visual-citation-codec-audit-v0.1.json");
const script=fs.readFileSync("site/mandarin-visual-decoder.js","utf8");
const html=fs.readFileSync("site/mandarin-visual-decoder.html","utf8");
class Node {
 constructor(tag){this.tag=tag;this.children=[];this.textContent="";this.value="";
  this.events={};this.attributes={};this.className="";}
 appendChild(x){this.children.push(x);return x;}
 replaceChildren(...a){this.children=a;}
 setAttribute(k,v){this.attributes[k]=v;}
 addEventListener(k,f){this.events[k]=f;}
}
function setup(data=[src,finals,initials,layers,audit]){
 const ids=["vd-initial","vd-tone","vd-back","vd-clear","vd-pad","vd-sequence",
  "vd-status","vd-result","vd-evidence"];
 const els=Object.fromEntries(ids.map(x=>[x,new Node("div")]));
 const urls=["pronunciation-citations-0001-1000.json",
  "phonetics/written-final-symbol-control-v0.1.json",
  "phonetics/mandarin-initial-feature-candidates-v0.1.json",
  "layers-v0.1.json",
  "phonetics/mandarin-visual-citation-codec-audit-v0.1.json"];
 const document={getElementById:id=>els[id],createElement:t=>new Node(t),
  createElementNS:(_,t)=>new Node(t)};
 const context={document,fetch:async u=>({ok:true,json:async()=>data[urls.indexOf(u)]}),
  Map,Set,Number,Object,String,Array,JSON,Error};
 context.globalThis=context;
 vm.runInNewContext(script,context);
 return els;
}
async function settle(el){
 for(let i=0;i<70&&!el["vd-pad"].children.length&&
  !el["vd-status"].textContent.includes("Unable");i++)await Promise.resolve();
}
const ui=setup();await settle(ui);
assert.equal(ui["vd-pad"].children.length,9);
assert.equal(ui["vd-initial"].children.length,24);
assert.equal(ui["vd-tone"].children.length,5);
assert.match(ui["vd-result"].children[0].textContent,/yī/);
assert.equal(ui["vd-sequence"].children.length,1);
ui["vd-back"].events.click();
assert.match(ui["vd-status"].textContent,/No source-attested/);
ui["vd-pad"].children[3].events.click();
assert.match(ui["vd-result"].children[0].textContent,/yī/);
ui["vd-initial"].value="sh";ui["vd-initial"].events.change();
ui["vd-tone"].value="2";ui["vd-tone"].events.change();
assert.match(ui["vd-result"].children[0].textContent,/shí/);
ui["vd-clear"].events.click();
assert.equal(ui["vd-sequence"].children[0].tag,"span");
ui["vd-initial"].value="n";ui["vd-initial"].events.change();
ui["vd-tone"].value="1";ui["vd-tone"].events.change();
assert.match(ui["vd-status"].textContent,/No source-attested/);
const corrupted=structuredClone(audit);corrupted.counts.independentHumanVisualDecodings=1;
const reject=setup([src,finals,initials,layers,corrupted]);await settle(reject);
assert.match(reject["vd-status"].textContent,/Unable to validate/);
for(const id of ["initial","tone","back","clear","pad","sequence","status","result","evidence"])
 assert.ok(html.includes('id="vd-'+id+'"'));
assert.ok(!script.includes("innerHTML"));
console.log("Browser visual citation decoder: 24 initials, nine drawn primitives, five tones, genuine source triples, edit and reject paths.");
