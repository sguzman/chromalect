import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
const html=fs.readFileSync("site/context-evidence.html","utf8");
const source=fs.readFileSync("site/context-evidence.js","utf8");
const report=JSON.parse(fs.readFileSync("data/semantic/cedict-crossref/tatoeba-sentence-id-index-v0.1.json","utf8"));
const ids=["candidate-query","candidate-scope","candidate-status","candidate-stats","candidate-rows","candidate-prev","candidate-next"];
class Element{
 constructor(){this.children=[];this.value="";this.textContent="";this.disabled=false;this.events={};}
 addEventListener(event,fn){this.events[event]=fn;}
 replaceChildren(...children){this.children=children;}
 appendChild(child){this.children.push(child);}
 click(){this.events.click?.();}
}
const nodes=Object.fromEntries(ids.map(id=>[id,new Element()]));
nodes["candidate-scope"].value="all";
const sandbox={document:{getElementById:id=>nodes[id],createElement:()=>new Element()},fetch:async()=>({ok:true,json:async()=>report})};
vm.runInNewContext(source,sandbox);
for(let i=0;i<30&&!nodes["candidate-rows"].children.length;i++)await Promise.resolve();
assert.equal(nodes["candidate-rows"].children.length,18);
assert.match(nodes["candidate-stats"].textContent,/142 matching character/);
assert.equal(nodes["candidate-prev"].disabled,true);
assert.equal(nodes["candidate-next"].disabled,false);
nodes["candidate-scope"].value="without";
nodes["candidate-scope"].events.change();
assert.equal(nodes["candidate-rows"].children.length,1);
assert.equal(nodes["candidate-rows"].children[0].children[0].children[0].textContent,"刨");
nodes["candidate-scope"].value="all";
nodes["candidate-query"].value="127";
nodes["candidate-query"].events.input();
assert.equal(nodes["candidate-rows"].children.length,1);
const card=nodes["candidate-rows"].children[0];
assert.equal(card.children[0].children[0].textContent,"长");
assert.equal(card.children[2].children.length,3);
assert.ok(card.children[2].children.every(li=>li.children[0].href.startsWith("https://tatoeba.org/en/sentences/show/")));
assert.ok(html.includes('id="candidate-query"')&&html.includes('id="candidate-rows"'));
assert.ok(!source.includes("innerHTML"));
console.log("Corpus candidate browser: 142 characters, 423 unapproved ID associations, safe source links.");
