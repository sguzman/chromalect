import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
const get=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const sources=[
 get("site/pronunciation-citations-0001-1000.json"),get("site/layers-v0.1.json"),
 get("data/phonetics/mandarin-initial-feature-candidates-v0.1.json"),
 get("data/phonetics/mandarin-citation-tone-contours-v0.1.json"),
 get("data/phonetics/citation-syllable-orthographic-codec-audit-v0.1.json"),
 get("data/phonetics/written-final-symbol-control-v0.1.json")];
const js=fs.readFileSync("site/mandarin-citation-cell.js","utf8");
const html=fs.readFileSync("site/mandarin-citation-cell.html","utf8");
class Element{
 constructor(){this.children=[];this.value="";this.textContent="";this.checked=false;this.events={};this.style={};this.attributes={};this.classList={add:()=>{}};}
 appendChild(x){this.children.push(x);}
 replaceChildren(...items){this.children=items;}
 addEventListener(type,fn){this.events[type]=fn;}
 setAttribute(name,value){this.attributes[name]=value;}
}
function setup(data=sources){
 const ids=["cell-query","cell-reading","cell-color","cell-initial","cell-final","cell-tone",
 "cell-final-symbols","cell-initial-symbols","cell-status","cell-code","cell-native","cell-top","cell-side","cell-bottom","cell-source"];
 const els=Object.fromEntries(ids.map(id=>[id,new Element()]));
 for(const id of ["cell-initial","cell-final","cell-tone"])els[id].checked=true;
 const urls=["pronunciation-citations-0001-1000.json","layers-v0.1.json",
  "phonetics/mandarin-initial-feature-candidates-v0.1.json",
  "phonetics/mandarin-citation-tone-contours-v0.1.json",
  "phonetics/citation-syllable-orthographic-codec-audit-v0.1.json",
  "phonetics/written-final-symbol-control-v0.1.json"];
 const doc={getElementById:id=>els[id],createElement:()=>new Element(),
  createElementNS:()=>new Element()};
 vm.runInNewContext(js,{document:doc,fetch:async url=>({ok:true,json:async()=>data[urls.indexOf(url)]}),
 Map,Set,Number,Object,String,Error});
 return els;
}
async function settle(v){for(let i=0;i<35&&!v["cell-native"].textContent&&
 !v["cell-status"].textContent.includes("Unable");i++)await Promise.resolve();}
const view=setup();await settle(view);
assert.equal(view["cell-native"].textContent,"一");
assert.match(view["cell-status"].textContent,/1,171 source readings/);
assert.equal(view["cell-side"].children.length,1);
view["cell-initial-symbols"].checked=true;view["cell-initial-symbols"].events.change();
assert.match(view["cell-side"].children[0].children[1].textContent,/No consonant shape/);
view["cell-query"].value="4";view["cell-query"].events.change();
assert.equal(view["cell-native"].textContent,"十");
assert.equal(view["cell-side"].children[0].children[1].attributes.role,"img");
assert.equal(view["cell-side"].children[0].children[1].children.length,2);
assert.match(view["cell-side"].children[0].children[1].attributes["aria-label"],/sh provisional/);
view["cell-initial-symbols"].checked=false;view["cell-initial-symbols"].events.change();
view["cell-query"].value="1";view["cell-query"].events.change();
assert.equal(view["cell-bottom"].children.length,1);
view["cell-final-symbols"].checked=true;view["cell-final-symbols"].events.change();
assert.equal(view["cell-bottom"].children[0].children[1].attributes.role,"img");
assert.equal(view["cell-bottom"].children[0].children[1].children.length,1);
view["cell-final-symbols"].checked=false;view["cell-final-symbols"].events.change();
assert.equal(view["cell-top"].children.length,1);
assert.match(view["cell-code"].textContent,/yī/);

view["cell-initial"].checked=false;view["cell-initial"].events.change();
assert.equal(view["cell-side"].children.length,0);
view["cell-initial"].checked=true;
view["cell-color"].checked=true;view["cell-color"].events.change();
assert.equal(view["cell-side"].children.length,1);
assert.equal(view["cell-side"].children[0].style.borderColor,sources[1].palette_domains.initial.tokens["y"]);
assert.equal(view["cell-native"].textContent,"一");
view["cell-query"].value="3";view["cell-query"].events.change();
assert.equal(view["cell-native"].textContent,"二");
view["cell-query"].value="8";view["cell-query"].events.change();
assert.equal(view["cell-native"].textContent,"卜");
const neutral=view["cell-top"].children[0].children[0];
assert.match(neutral.children[0].textContent,/no fixed neutral contour/);
const invalidSymbols=structuredClone(sources);
invalidSymbols[5].records[0].independentPhonologicalInterpretationApproved=true;
const invalidControl=setup(invalidSymbols);await settle(invalidControl);
assert.match(invalidControl["cell-status"].textContent,/Unable to validate/);
const invalid=structuredClone(sources);invalid[4].counts.humanDecodingTrials=1;
const rejected=setup(invalid);await settle(rejected);
assert.equal(rejected["cell-native"].textContent,"");
assert.match(rejected["cell-status"].textContent,/Unable to validate/);
for(const id of ["cell-reading","cell-query","cell-initial","cell-final","cell-final-symbols","cell-tone","cell-color",
 "cell-initial-symbols","cell-status","cell-code","cell-native","cell-top","cell-side","cell-bottom","cell-source"])
 assert.match(html,new RegExp('id="'+id+'"'));
assert.ok(!js.includes("innerHTML"));
console.log("Unmodified native glyph with independently removable initial/final/tone annotations; zero claimed study outcomes.");
