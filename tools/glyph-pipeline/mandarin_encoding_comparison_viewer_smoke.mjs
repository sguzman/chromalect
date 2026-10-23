import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
const get=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const sources=[
 get("site/pronunciation-citations-0001-1000.json"),
 get("data/phonetics/mandarin-encoding-comparison-cohorts-v0.1.json"),
 get("data/phonetics/mandarin-initial-feature-candidates-v0.1.json"),
 get("data/phonetics/mandarin-simple-final-feature-candidates-v0.1.json"),
 get("data/phonetics/mandarin-final-spelling-context-gates-v0.1.json"),
 get("data/phonetics/written-final-symbol-control-v0.1.json"),
 get("site/layers-v0.1.json")];
const script=fs.readFileSync("site/mandarin-encoding-comparison.js","utf8");
const html=fs.readFileSync("site/mandarin-encoding-comparison.html","utf8");
class Element{
 constructor(){this.children=[];this.textContent="";this.value="";this.checked=false;this.style={};this.events={};this.attributes={};this.className="";this.classList={add:x=>{this.className=x;}};}
 appendChild(x){this.children.push(x);}
 replaceChildren(...xs){this.children=xs;}
 addEventListener(type,fn){this.events[type]=fn;}
 setAttribute(key,v){this.attributes[key]=v;}
}
function setup(source=sources){
 const names=["comparison-rank","comparison-reading","comparison-prev","comparison-next",
  "comparison-color","comparison-ipa","comparison-status","comparison-count","comparison-source",
  "comparison-plain","comparison-letters","comparison-working"];
 const controls=Object.fromEntries(names.map(x=>[x,new Element()]));
 const namesByUrl=["pronunciation-citations-0001-1000.json",
  "phonetics/mandarin-encoding-comparison-cohorts-v0.1.json",
  "phonetics/mandarin-initial-feature-candidates-v0.1.json",
  "phonetics/mandarin-simple-final-feature-candidates-v0.1.json",
  "phonetics/mandarin-final-spelling-context-gates-v0.1.json",
  "phonetics/written-final-symbol-control-v0.1.json","layers-v0.1.json"];
 const doc={getElementById:id=>controls[id],createElement:()=>new Element(),createElementNS:()=>new Element()};
 vm.runInNewContext(script,{document:doc,fetch:async url=>({ok:true,json:async()=>source[namesByUrl.indexOf(url)]}),Map,Set,Number,String,Object,Math,Error});
 return controls;
}
async function settle(v){for(let i=0;i<60&&!v["comparison-plain"].children.length&&
 !v["comparison-status"].textContent.includes("Unable");i++)await Promise.resolve();}
const ui=setup();await settle(ui);
assert.equal(ui["comparison-plain"].children[0].textContent,"一");
assert.equal(ui["comparison-letters"].children[0].textContent,"一");
assert.equal(ui["comparison-working"].children[0].textContent,"一");
assert.equal(ui["comparison-letters"].children[3].attributes.role,"img");
assert.ok(ui["comparison-working"].children.some(x=>x.className==="comparison-vowel-svg"));
assert.match(ui["comparison-count"].textContent,/320 \/ 1,171/);
ui["comparison-rank"].value="4";ui["comparison-rank"].events.change();
assert.equal(ui["comparison-working"].children[0].textContent,"十");
assert.ok(ui["comparison-working"].children.some(x=>x.className==="comparison-withheld"));
assert.ok(!ui["comparison-working"].children.some(x=>x.className==="comparison-vowel-svg"));
assert.match(ui["comparison-count"].textContent,/112 \/ 1,171/);
ui["comparison-rank"].value="3";ui["comparison-rank"].events.change();
assert.equal(ui["comparison-working"].children[0].textContent,"二");
assert.ok(ui["comparison-working"].children.some(x=>x.className==="comparison-withheld"));
assert.match(ui["comparison-count"].textContent,/739 \/ 1,171/);
ui["comparison-rank"].value="1";ui["comparison-rank"].events.change();
ui["comparison-color"].checked=true;ui["comparison-color"].events.change();
assert.equal(ui["comparison-letters"].children[3].style.color,sources[6].palette_domains.final.tokens["i"]);
ui["comparison-rank"].value="4";ui["comparison-rank"].events.change();
ui["comparison-ipa"].checked=true;ui["comparison-ipa"].events.change();
assert.ok(ui["comparison-working"].children.some(x=>x.className==="comparison-ipa"&&x.textContent.includes("ʂ")));
ui["comparison-rank"].value="1";ui["comparison-rank"].events.change();
assert.ok(ui["comparison-working"].children.some(x=>x.className==="comparison-ipa"&&x.textContent.includes("No standalone consonant IPA")));
const tampered=structuredClone(sources);
tampered[1].summary.humanSymbolDecodingTrials=1;
const rejected=setup(tampered);await settle(rejected);
assert.equal(rejected["comparison-plain"].children.length,0);
assert.match(rejected["comparison-status"].textContent,/Unable to verify/);
for(const id of ["comparison-rank","comparison-reading","comparison-prev","comparison-next",
 "comparison-color","comparison-ipa","comparison-status","comparison-count","comparison-source",
 "comparison-plain","comparison-letters","comparison-working"])
 assert.match(html,new RegExp('id="'+id+'"'));
assert.ok(!script.includes("innerHTML"));
console.log("Mandarin citation comparisons: three distinct source cohorts, original glyphs unchanged, no phonemic approvals.");
