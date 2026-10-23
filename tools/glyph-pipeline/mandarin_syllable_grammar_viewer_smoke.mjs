import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
const files=[
 "site/pronunciation-citations-0001-1000.json","site/layers-v0.1.json",
 "data/phonetics/mandarin-initial-feature-candidates-v0.1.json",
 "data/phonetics/citation-syllable-orthographic-codec-audit-v0.1.json"];
const fixture=files.map(p=>JSON.parse(fs.readFileSync(p,"utf8")));
const js=fs.readFileSync("site/mandarin-syllable-grammar.js","utf8");
const html=fs.readFileSync("site/mandarin-syllable-grammar.html","utf8");
class Element{
 constructor(){this.children=[];this.value="";this.textContent="";this.className="";this.events={};this.style={};this.attributes={};}
 replaceChildren(...children){this.children=children;}
 appendChild(x){this.children.push(x);}
 addEventListener(name,fn){this.events[name]=fn;}
 setAttribute(name,value){this.attributes[name]=value;}
}
function setup(data=fixture){
 const ids=["syllable-query","syllable-tone","syllable-view","syllable-status",
  "syllable-count","syllable-results","syllable-summary"];
 const nodes=Object.fromEntries(ids.map(x=>[x,new Element()]));
 nodes["syllable-tone"].value="all";nodes["syllable-view"].value="tokens";
 const doc={getElementById:id=>nodes[id],createElement:()=>new Element()};
 const fetch=async url=>({ok:true,json:async()=>data[
   ["pronunciation-citations-0001-1000.json","layers-v0.1.json",
    "phonetics/mandarin-initial-feature-candidates-v0.1.json",
    "phonetics/citation-syllable-orthographic-codec-audit-v0.1.json"].indexOf(url)]});
 vm.runInNewContext(js,{document:doc,fetch,Map,Set,Object,Math,String,Error});
 return nodes;
}
async function settle(s){for(let i=0;i<35&&!s["syllable-results"].children.length&&
 !s["syllable-status"].textContent.includes("Unable");i++)await Promise.resolve();}
const state=setup();await settle(state);
assert.match(state["syllable-summary"].textContent,/673 distinct observed/);
assert.equal(state["syllable-results"].children.length,60);
assert.match(state["syllable-count"].textContent,/1171 matching/);
assert.match(state["syllable-results"].children[0].children[1].children[0].children[0].textContent,/Initial/);
state["syllable-view"].value="colors";state["syllable-view"].events.change();
assert.ok(state["syllable-results"].children[0].children[1].children[0].children.some(x=>x.className==="syllable-chip"));
state["syllable-view"].value="plain";state["syllable-view"].events.change();
assert.match(state["syllable-results"].children[0].children[1].textContent,/Plain citation/);
state["syllable-query"].value="yī";state["syllable-query"].events.input();
assert.ok(state["syllable-results"].children.length>0);
assert.match(state["syllable-results"].children[0].children[0].textContent,/yī/);
state["syllable-query"].value="";state["syllable-tone"].value="0";state["syllable-tone"].events.change();
assert.match(state["syllable-count"].textContent,/matching of 1,171/);
const mutated=structuredClone(fixture);mutated[3].counts.exactRoundTrips=1170;
const invalid=setup(mutated);await settle(invalid);
assert.equal(invalid["syllable-results"].children.length,0);
assert.match(invalid["syllable-status"].textContent,/Unable to validate/);
for(const id of ["syllable-query","syllable-tone","syllable-view","syllable-status",
 "syllable-count","syllable-results","syllable-summary"])
 assert.match(html,new RegExp('id="'+id+'"'));
assert.ok(!js.includes("innerHTML"));
console.log("Structured Pinyin citation browser: all 1,171 entries, three presentation modes, failure-closed source audit.");
