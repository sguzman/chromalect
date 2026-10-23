import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
const get=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const data=[
 get("data/phonetics/mandarin-simple-final-feature-candidates-v0.1.json"),
 get("site/pronunciation-citations-0001-1000.json"),get("site/layers-v0.1.json"),
 get("data/phonetics/mandarin-final-spelling-context-gates-v0.1.json")];
const js=fs.readFileSync("site/mandarin-simple-final-features.js","utf8");
const html=fs.readFileSync("site/mandarin-simple-final-features.html","utf8");
class Element{
 constructor(){this.children=[];this.textContent="";this.checked=false;this.value="";this.style={};this.events={};this.attributes={};}
 replaceChildren(...items){this.children=items;}
 appendChild(item){this.children.push(item);}
 addEventListener(name,fn){this.events[name]=fn;}
 setAttribute(k,v){this.attributes[k]=v;}
}
function setup(sources=data){
 const names=["vowel-mode","vowel-color","vowel-grid","vowel-list","vowel-summary","vowel-status"];
 const els=Object.fromEntries(names.map(name=>[name,new Element()]));
 els["vowel-mode"].value="features";
 const urls=["phonetics/mandarin-simple-final-feature-candidates-v0.1.json",
  "pronunciation-citations-0001-1000.json","layers-v0.1.json",
  "phonetics/mandarin-final-spelling-context-gates-v0.1.json"];
 vm.runInNewContext(js,{document:{getElementById:k=>els[k],createElement:()=>new Element()},
  fetch:async url=>({ok:true,json:async()=>sources[urls.indexOf(url)]}),Set,Map,Number,Object,Math,Error});
 return els;
}
async function settle(v){for(let i=0;i<35&&!v["vowel-list"].children.length&&
 !v["vowel-status"].textContent.includes("Unable");i++)await Promise.resolve();}
const v=setup();await settle(v);
assert.equal(v["vowel-grid"].children.length,9);
assert.equal(v["vowel-list"].children.length,6);
assert.match(v["vowel-summary"].textContent,/432 source usages/);
assert.match(v["vowel-summary"].textContent,/112 flagged/);
assert.match(v["vowel-list"].children[3].children[1].textContent,/63 spelling-context warnings/);
v["vowel-mode"].value="pinyin";v["vowel-mode"].events.change();
assert.equal(v["vowel-grid"].children.length,9);
assert.ok(v["vowel-grid"].children.some(x=>x.children.some(c=>c.children?.some?.(z=>z.textContent==="ü"))));
v["vowel-color"].checked=true;v["vowel-color"].events.change();
assert.equal(v["vowel-list"].children.length,6);
const forged=structuredClone(data);forged[0].records[3].acceptedAsIPAOrContextualPhone=true;
const bad=setup(forged);await settle(bad);
assert.equal(bad["vowel-list"].children.length,0);
assert.match(bad["vowel-status"].textContent,/Unable to verify/);
for(const id of ["vowel-mode","vowel-color","vowel-grid","vowel-list","vowel-summary","vowel-status"])
 assert.match(html,new RegExp('id="'+id+'"'));
assert.ok(!js.includes("innerHTML"));
console.log("Vowel feature prototype: six source-simple spellings, 112 caution instances, no phonetic approval.");
