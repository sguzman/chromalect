import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
const get=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const sources=[
 get("data/phonetics/citation-orthographic-contrast-controls-v0.1.json"),
 get("site/pronunciation-citations-0001-1000.json"),
 get("data/phonetics/citation-syllable-orthographic-codec-audit-v0.1.json")];
const js=fs.readFileSync("site/mandarin-contrast-controls.js","utf8");
const html=fs.readFileSync("site/mandarin-contrast-controls.html","utf8");
class Element{
 constructor(){this.children=[];this.textContent="";this.value="";this.events={};this.style={};}
 appendChild(x){this.children.push(x);}
 replaceChildren(...x){this.children=x;}
 addEventListener(name,callback){this.events[name]=callback;}
}
function setup(values=sources){
 const ids=["contrast-type","contrast-search","contrast-status","contrast-summary",
  "contrast-count","contrast-results"];
 const nodes=Object.fromEntries(ids.map(id=>[id,new Element()]));
 nodes["contrast-type"].value="all";
 const doc={getElementById:id=>nodes[id],createElement:()=>new Element()};
 const urls=["phonetics/citation-orthographic-contrast-controls-v0.1.json",
  "pronunciation-citations-0001-1000.json",
  "phonetics/citation-syllable-orthographic-codec-audit-v0.1.json"];
 vm.runInNewContext(js,{document:doc,fetch:async url=>({ok:true,json:async()=>values[urls.indexOf(url)]}),
  Map,Set,Object,Math,Error});
 return nodes;
}
async function settle(s){for(let i=0;i<45&&!s["contrast-results"].children.length&&
 !s["contrast-status"].textContent.includes("Unable");i++)await Promise.resolve();}
const nodes=setup();await settle(nodes);
assert.equal(nodes["contrast-results"].children.length,50);
assert.match(nodes["contrast-summary"].textContent,/533 tone-label/);
assert.match(nodes["contrast-count"].textContent,/710 matching/);
assert.match(nodes["contrast-results"].children[0].children[0].textContent,/Citation tone-label/);
nodes["contrast-type"].value="working_aspiration_pair";nodes["contrast-type"].events.change();
assert.equal(nodes["contrast-results"].children.length,50);
assert.match(nodes["contrast-count"].textContent,/89 matching/);
nodes["contrast-type"].value="one_letter_written_final";nodes["contrast-type"].events.change();
assert.match(nodes["contrast-count"].textContent,/88 matching/);
nodes["contrast-search"].value="yī";nodes["contrast-search"].events.input();
assert.ok(nodes["contrast-results"].children.length>0);
const invalid=structuredClone(sources);invalid[0].records[0].independentPhonemicContrastVerified=true;
const bad=setup(invalid);await settle(bad);
assert.equal(bad["contrast-results"].children.length,0);
assert.match(bad["contrast-status"].textContent,/Unable to verify/);
for(const id of ["contrast-type","contrast-search","contrast-status","contrast-summary",
 "contrast-count","contrast-results"])assert.match(html,new RegExp('id="'+id+'"'));
assert.ok(!js.includes("innerHTML"));
console.log("Written citation contrast viewer: 710 provenance-matched candidates, no spoken-pair approvals.");
