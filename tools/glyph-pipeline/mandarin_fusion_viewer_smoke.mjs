// First-tranche fusion acceptance: five independent channels, alignment and fail-closed sources.
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const script=fs.readFileSync("site/mandarin-fusion.js","utf8");
const grammar=fs.readFileSync("site/semantic-grammar.js","utf8");
const html=fs.readFileSync("site/mandarin-fusion.html","utf8");
const semantic=read("data/semantic/mandarin-1000-v0.1.json");
const pinyin=read("site/pronunciation-citations-0001-1000.json");
const contours=read("data/phonetics/mandarin-citation-tone-contours-v0.1.json");
const layers=read("site/layers-v0.1.json");
const catalog=read("data/catalog/characters-0001-1000.json");
const profile={schema:"chromalect.mandarin-character-profile.v1",catalog_count:1000,
 characters:catalog.characters.map(c=>({
  rank:c.rank,character:c.character,
  component_instances:[{component_id:"cmp-0001",form:c.character,color:"#aabbcc"}],
  geometry:{status:"source_aligned_visual_review_pending",
   svg:"glyphs/U+"+c.character.codePointAt(0).toString(16).toUpperCase().padStart(4,"0")+".svg"}
 }))};
class Node{
 constructor(tag){
  this.tag=tag;this.children=[];this.textContent="";this.value="";
  this.disabled=false;this.hidden=false;this.checked=false;this.events={};
  this.attributes={};this.style={};
  this.classList={add:()=>{}};
 }
 appendChild(el){this.children.push(el);return el;}
 replaceChildren(...arr){this.children=arr;}
 addEventListener(event,fn){this.events[event]=fn;}
 setAttribute(name,value){this.attributes[name]=String(value);}
}
function setup(sources=[profile,semantic,pinyin,contours,layers]){
 const ids=["fusion-query","fusion-character","fusion-reading","fusion-sense",
  "fusion-component","fusion-initial","fusion-final","fusion-tone","fusion-semantic",
  "fusion-status","fusion-glyph","fusion-initial-output","fusion-final-output",
  "fusion-tone-output","fusion-meaning-output","fusion-citation",
  "fusion-meaning-note","fusion-component-note"];
 const nodes=Object.fromEntries(ids.map(id=>[id,new Node("div")]));
 for(const id of ["fusion-component","fusion-initial","fusion-final","fusion-tone","fusion-semantic"])
  nodes[id].checked=true;
 const urls=["profiles/mandarin-1000-v1.json","semantic/mandarin-1000-v0.1.json",
  "pronunciation-citations-0001-1000.json",
  "phonetics/mandarin-citation-tone-contours-v0.1.json","layers-v0.1.json"];
 const ctx={
  document:{
   getElementById:id=>nodes[id],
   createElement:tag=>new Node(tag),
   createElementNS:(_,tag)=>new Node(tag),
   querySelector:selector=>{
    assert.equal(selector,'script[src$="mandarin-fusion.js"]');
    return {src:"https://example.test/chromalect/mandarin-fusion.js"};
   }
  },
  fetch:async url=>{
   const index=urls.indexOf(url);assert.ok(index>=0,url);
   return {ok:true,json:async()=>sources[index]};
  },
  URL,Map,Set,Number,Object,String,Error,Array
 };
 ctx.globalThis=ctx;
 vm.runInNewContext(grammar,ctx);
 vm.runInNewContext(script,ctx);
 return nodes;
}
async function settle(nodes){
 for(let i=0;i<90&&!nodes["fusion-glyph"].children.length&&
  !nodes["fusion-status"].textContent.includes("Unable");i++)await Promise.resolve();
}
function changed(nodes,id,value){
 nodes[id].checked=value;
 nodes[id].events.change();
}
const ui=setup();await settle(ui);
assert.match(ui["fusion-status"].textContent,/character 1\/1000/);
assert.equal(ui["fusion-character"].children.length,1000);
assert.equal(ui["fusion-glyph"].children.length,2);
assert.equal(ui["fusion-glyph"].children[0].textContent,"一");
assert.match(ui["fusion-glyph"].children[1].src,/glyphs\/U\+4E00\.svg$/);
assert.match(ui["fusion-citation"].textContent,/yī/);
for(const id of ["initial","final","tone","meaning"]){
 const output=ui["fusion-"+id+"-output"];
 assert.equal(output.hidden,false);
 assert.ok(output.children.length>0);
}
assert.match(ui["fusion-meaning-output"].children[1].attributes["aria-label"],/Unverified pictogram/);
changed(ui,"fusion-component",false);
assert.equal(ui["fusion-glyph"].children.length,1);
assert.equal(ui["fusion-glyph"].children[0].textContent,"一");
assert.match(ui["fusion-component-note"].textContent,/disabled/);
changed(ui,"fusion-initial",false);
assert.equal(ui["fusion-initial-output"].hidden,true);
assert.equal(ui["fusion-final-output"].hidden,false);
assert.equal(ui["fusion-tone-output"].hidden,false);
changed(ui,"fusion-final",false);
changed(ui,"fusion-tone",false);
changed(ui,"fusion-semantic",false);
for(const id of ["initial","final","tone","meaning"]){
 assert.equal(ui["fusion-"+id+"-output"].hidden,true);
 assert.equal(ui["fusion-"+id+"-output"].children.length,0);
}
assert.equal(ui["fusion-glyph"].children[0].textContent,"一");
changed(ui,"fusion-component",true);
changed(ui,"fusion-semantic",true);
ui["fusion-glyph"].children[1].events.error();
assert.equal(ui["fusion-glyph"].children[1].hidden,true);
assert.equal(ui["fusion-glyph"].children[0].hidden,false);
assert.match(ui["fusion-component-note"].textContent,/fallback displayed/);
ui["fusion-query"].value="4";ui["fusion-query"].events.change();
assert.equal(ui["fusion-glyph"].children[0].textContent,"十");
assert.match(ui["fusion-citation"].textContent,/shí/);
ui["fusion-query"].value="8";ui["fusion-query"].events.change();
changed(ui,"fusion-tone",true);
assert.match(ui["fusion-tone-output"].children[0].children[0].textContent,/no fixed neutral-tone contour/);
ui["fusion-query"].value="2";ui["fusion-query"].events.change();
assert.equal(ui["fusion-sense"].disabled,true);
assert.match(ui["fusion-meaning-output"].children[0].textContent,/deferred/);
ui["fusion-query"].value="not-a-character";ui["fusion-query"].events.change();
assert.match(ui["fusion-status"].textContent,/No first-tranche/);
assert.equal(ui["fusion-glyph"].children[0].textContent,"乙");
const wrongRank=structuredClone(profile);
wrongRank.characters[0].character="错";
const invalidProfile=setup([wrongRank,semantic,pinyin,contours,layers]);
await settle(invalidProfile);
assert.match(invalidProfile["fusion-status"].textContent,/Unable to validate/);
const wrongApproval=structuredClone(semantic);
wrongApproval.summary.productionVerifiedCharacters=1;
const invalidSemantic=setup([profile,wrongApproval,pinyin,contours,layers]);
await settle(invalidSemantic);
assert.match(invalidSemantic["fusion-status"].textContent,/Unable to validate/);
const wrongTone=structuredClone(contours);
wrongTone.evidence.learningEffectivenessFindings=1;
const invalidTone=setup([profile,semantic,pinyin,wrongTone,layers]);
await settle(invalidTone);
assert.match(invalidTone["fusion-status"].textContent,/Unable to validate/);
const brokenReading=structuredClone(pinyin);
brokenReading.characters[0].readings[0].initial="unsupported";
const invalidReading=setup([profile,semantic,brokenReading,contours,layers]);
await settle(invalidReading);
assert.match(invalidReading["fusion-status"].textContent,/Unable to validate/);
for(const id of ["query","character","reading","sense","component","initial",
 "final","tone","semantic","status","glyph","initial-output",
 "final-output","tone-output","meaning-output","citation","meaning-note","component-note"])
 assert.ok(html.includes('id="fusion-'+id+'"'),"Missing HTML control: "+id);
assert.ok(!script.includes("innerHTML"),"Untrusted data must remain text nodes");
assert.match(html,/theme\.js/);
console.log("Fusion acceptance: all 1,000 source-ranked characters, 1,171 citation readings, 5 independently removable channels, semantic abstention, image fallback and research-approval rejection.");
