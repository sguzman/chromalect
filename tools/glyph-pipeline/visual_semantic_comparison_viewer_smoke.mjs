// Source-aligned three-condition comparison, strict screening and identical
// geometry between monochrome, identity color and tentative semantic layers.
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
const grammar=fs.readFileSync("site/semantic-grammar.js","utf8");
const script=fs.readFileSync("site/visual-semantic-comparison.js","utf8");
const html=fs.readFileSync("site/visual-semantic-comparison.html","utf8");
const semantic=JSON.parse(fs.readFileSync("data/semantic/mandarin-1000-v0.1.json","utf8"));
const catalog=JSON.parse(fs.readFileSync("data/catalog/characters-0001-1000.json","utf8"));
const profile={schema:"chromalect.mandarin-character-profile.v1",catalog_count:1000,
 characters:catalog.characters.map(c=>({
  rank:c.rank,character:c.character,
  component_instances:[{component_id:"cmp-0001",form:c.character,color:"#aabbcc"}],
  geometry:{status:"source_aligned_visual_review_pending",
   svg:"glyphs/U+"+c.character.codePointAt(0).toString(16).toUpperCase().padStart(4,"0")+".svg"}
 }))};
class Node{
 constructor(tag){this.tag=tag;this.children=[];this.textContent="";this.value="";
  this.checked=false;this.disabled=false;this.attrs={};this.dataset={};
  this.style={setProperty:(name,value)=>{this.style[name]=value}};
  this.listeners={};}
 appendChild(el){this.children.push(el);return el;}
 replaceChildren(...arr){this.children=arr.flatMap(x=>x.tag==="fragment"?x.children:[x]);}
 addEventListener(name,fn){this.listeners[name]=fn;}
 setAttribute(name,val){this.attrs[name]=String(val);}
}
function start(glyphs=profile,meanings=semantic){
 const ids=["vsc-pick","vsc-back","vsc-forward","vsc-sense","vsc-reveal",
  "vsc-size","vsc-size-label","vsc-panels","vsc-source","vsc-status","vsc-count"];
 const nodes=Object.fromEntries(ids.map(id=>[id,new Node("div")]));
 nodes["vsc-size"].value="112";
 const document={
  getElementById:id=>nodes[id],createElement:tag=>new Node(tag),
  createDocumentFragment:()=>new Node("fragment"),
  querySelector:sel=>{
   assert.equal(sel,'script[src$="visual-semantic-comparison.js"]');
   return {src:"https://example.test/chromalect/visual-semantic-comparison.js"};
  },currentScript:null
 };
 const ctx={document,URL,Map,Set,Math,Array,Number,Object,Error,JSON,
  fetch:async url=>({ok:true,json:async()=>url.startsWith("profiles/")?glyphs:meanings})};
 ctx.globalThis=ctx;
 vm.runInNewContext(grammar,ctx);
 vm.runInNewContext(script,ctx);
 return nodes;
}
async function settle(nodes){
 for(let i=0;i<70&&!nodes["vsc-panels"].children.length&&
  !nodes["vsc-status"].textContent.startsWith("Cannot");i++)
  await Promise.resolve();
}
const ui=start();await settle(ui);
assert.equal(ui["vsc-panels"].children.length,3);
assert.equal(ui["vsc-pick"].children.length,1000);
assert.match(ui["vsc-count"].textContent,/0 approved lexical senses/);
const arms=ui["vsc-panels"].children;
assert.deepEqual(arms.map(x=>x.dataset.condition),["plain","identity","semantic"]);
const shape=x=>x.children.find(y=>y.className==="vsc-stage").children[0];
const ink=shape(arms[0]).children[0].style["--source-mask"];
const colored=shape(arms[1]).children[0].src;
const semanticColor=shape(arms[2]).children[0].src;
assert.match(ink,/glyphs\/U\+4E00\.svg/);
assert.equal(colored,semanticColor);
assert.ok(ink.includes(colored));
assert.match(ui["vsc-source"].children[1].textContent,/hidden/);
assert.equal(ui["vsc-source"].children[6].className,"vsc-component-legend");
assert.equal(ui["vsc-source"].children[6].children.length,1);
assert.equal(ui["vsc-source"].children[6].children[0].children[0].style["--swatch"],"#aabbcc");
assert.match(ui["vsc-source"].children[6].children[0].children[1].textContent,/cmp-0001/);
assert.match(arms[2].children[2].children[1].attrs["aria-label"],/Unverified/);
ui["vsc-reveal"].checked=true;ui["vsc-reveal"].listeners.change();
assert.match(ui["vsc-source"].children[1].textContent,/one; a, an/);
ui["vsc-size"].value="40";ui["vsc-size"].listeners.input();
assert.equal(shape(ui["vsc-panels"].children[0]).style["--study-size"],"40px");
assert.equal(shape(ui["vsc-panels"].children[2]).style["--study-size"],"40px");
// Deferred characters must abstain; no arbitrary emoji fallback.
ui["vsc-pick"].value="2";ui["vsc-pick"].listeners.change();
assert.equal(ui["vsc-sense"].disabled,true);
assert.match(ui["vsc-panels"].children[2].children[2].children[1].textContent,/abstains/);
assert.match(ui["vsc-count"].textContent,/pictogram deferred/);
ui["vsc-forward"].listeners.click();
assert.match(ui["vsc-count"].textContent,/3 \/ 1,000/);
ui["vsc-back"].listeners.click();
assert.match(ui["vsc-count"].textContent,/2 \/ 1,000/);
ui["vsc-pick"].value="82";ui["vsc-pick"].listeners.change();
assert.equal(ui["vsc-sense"].children.length,2);
assert.match(ui["vsc-sense"].children[0].textContent,/clouds/);
assert.match(ui["vsc-sense"].children[1].textContent,/say/);
const originalCue=ui["vsc-panels"].children[2].children[2].children[1].attrs["aria-label"];
ui["vsc-sense"].value="1";ui["vsc-sense"].listeners.change();
const alternativeCue=ui["vsc-panels"].children[2].children[2].children[1].attrs["aria-label"];
assert.notEqual(originalCue,alternativeCue);
assert.match(alternativeCue,/say/);
assert.equal(shape(ui["vsc-panels"].children[1]).children[0].src,
 shape(ui["vsc-panels"].children[2]).children[0].src);
function refuse(change){
 const a=structuredClone(profile),b=structuredClone(semantic);
 change(a,b);return start(a,b);
}
for(const mutate of [
 (a,b)=>{a.characters[0].character="二";},
 (a,b)=>{a.characters[0].geometry.status="verified";},
 (a,b)=>{a.characters[0].geometry.svg="../unsafe.svg";},
 (a,b)=>{a.characters[0].geometry.svg="glyphs/U+4E8C.svg";},
 (a,b)=>{b.summary.productionVerifiedCharacters=1;},
 (a,b)=>{b.characters[0].rank=123;},
 (a,b)=>{b.characters[0].screening.candidates[0].review="approved";},
 (a,b)=>{b.summary.pictogramCandidateCharacters=900;}
]){
 const bad=refuse(mutate);await settle(bad);
 assert.equal(bad["vsc-panels"].children.length,0);
 assert.match(bad["vsc-status"].textContent,/Cannot verify/);
}
for(const id of ["vsc-pick","vsc-back","vsc-forward","vsc-sense",
 "vsc-reveal","vsc-size","vsc-size-label","vsc-panels",
 "vsc-source","vsc-status","vsc-count"])
 assert.match(html,new RegExp('id="'+id+'"'));
assert.ok(!script.includes("innerHTML"));
console.log("1,000 source ranks, matched geometry in three visual conditions, provisional semantics and eight fail-closed cases checked.");
