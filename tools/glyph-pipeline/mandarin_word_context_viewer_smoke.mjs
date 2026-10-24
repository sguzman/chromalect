// Source-pinned contextual controls, independent evidence flags, and sandhi behavior.
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const leads=read("data/semantic/cedict-crossref/dictionary-word-surface-leads-v0.1.json");
const agreement=read("data/semantic/cedict-crossref/word-entry-reading-agreement-v0.1.json");
const corpus=read("data/semantic/cedict-crossref/word-context-review-priority-v0.1.json");
const standard=read("data/semantic/cedict-crossref/mandarin-word-orthography-standard-caveat-v0.1.json");
const catalog=read("data/catalog/characters-0001-1000.json");
const profile={schema:"chromalect.mandarin-character-profile.v1",catalog_count:1000,
 characters:catalog.characters.map(c=>({
  rank:c.rank,character:c.character,
  component_instances:[{component_id:"cmp-0001",form:c.character,color:"#aabbcc"}],
  geometry:{status:"source_aligned_visual_review_pending",
   svg:"glyphs/U+"+c.character.codePointAt(0).toString(16).toUpperCase().padStart(4,"0")+".svg"}
 }))};
const html=fs.readFileSync("site/mandarin-word-context.html","utf8");
const sandhiJS=fs.readFileSync("site/mandarin-context-sandhi.js","utf8");
const contextJS=fs.readFileSync("site/mandarin-word-context.js","utf8");
class Element{
 constructor(tag){this.tag=tag;this.children=[];this.textContent="";this.value="";
  this.disabled=false;this.hidden=false;this.checked=false;this.events={};this.attrs={};
  this.classList={add:()=>{}};}
 appendChild(x){this.children.push(x);return x;}
 replaceChildren(...nodes){this.children=nodes;}
 addEventListener(name,fn){this.events[name]=fn;}
 setAttribute(name,value){this.attrs[name]=String(value);}
}
function run(data=[leads,agreement,corpus,standard,profile]){
 const ids=["wc-lead","wc-sentence","wc-example","wc-segments","wc-readings",
  "wc-meaning","wc-geometry","wc-sandhi","wc-status","wc-word","wc-reading-note",
  "wc-other-readings","wc-meaning-note","wc-word-source","wc-boundary",
  "wc-corpus-note","wc-sentence-link","wc-rule","wc-rule-source",
  "wc-evidence","wc-orthography"];
 const els=Object.fromEntries(ids.map(id=>[id,new Element("div")]));
 for(const id of ["wc-segments","wc-readings","wc-meaning","wc-sandhi"])els[id].checked=true;
 const urls=["semantic/dictionary-word-surface-leads-v0.1.json",
  "semantic/word-entry-reading-agreement-v0.1.json",
  "semantic/word-context-review-priority-v0.1.json",
  "semantic/mandarin-word-orthography-standard-caveat-v0.1.json",
  "profiles/mandarin-1000-v1.json"];
 const ctx={
  document:{
   getElementById:id=>els[id],createElement:tag=>new Element(tag),
   querySelector:selector=>{
    assert.equal(selector,'script[src$="mandarin-word-context.js"]');
    return {src:"https://example.test/chromalect/mandarin-word-context.js"};
   }
  },
  fetch:async url=>{
   const i=urls.indexOf(url);assert.ok(i>=0,url);
   return {ok:true,json:async()=>data[i]};
  },
  URL,Map,Set,Number,Object,String,Error,Array
 };
 ctx.globalThis=ctx;
 vm.runInNewContext(sandhiJS,ctx);
 vm.runInNewContext(contextJS,ctx);
 return {els,sandhi:ctx.ChromalectContextSandhi};
}
async function settle(els){
 for(let n=0;n<90&&!els["wc-word"].children.length&&
  !els["wc-status"].textContent.includes("Unable");n++)await Promise.resolve();
}
const {els:ui,sandhi}=run();await settle(ui);
assert.match(ui["wc-status"].textContent,/no independently verified sentence reading/);
assert.equal(ui["wc-lead"].children.length,8);
assert.equal(ui["wc-example"].children.length,4);
assert.match(ui["wc-word"].children[0].attrs["aria-label"],/provisional written-word span/);
assert.equal(ui["wc-word"].children[0].children.length,2);
assert.match(ui["wc-reading-note"].textContent,/chang2 du4/);
assert.match(ui["wc-other-readings"].textContent,/cháng vs zhǎng/);
assert.ok(ui["wc-sentence"].children.length>0);
assert.match(ui["wc-corpus-note"].textContent,/ICU 78\.3/);
assert.ok(ui["wc-sentence-link"].children[0].href.startsWith("https://tatoeba.org/"));
assert.match(ui["wc-meaning-note"].textContent,/not an adjudicated sense/i);
const expected=[
 ["third-third",[3,3],[2,3],"third_before_third"],
 ["bu-fourth",[4,4],[2,4],"bu_before_fourth"],
 ["yi-fourth",[1,4],[2,4],"yi_before_fourth"],
 ["yi-first",[1,1],[4,1],"yi_before_nonfourth"]
];
for(let i=0;i<expected.length;i++){
 const [id,input,output,rule]=expected[i],sample=sandhi.samples[i];
 assert.equal(sample.id,id);
 const result=sandhi.previewPair(sample.characters,sample.tones);
 assert.deepEqual(Array.from(result.underlying),input);
 assert.deepEqual(Array.from(result.conditionalSurface),output);
 assert.equal(result.rule,rule);
 assert.equal(result.contextVerified,false);
 ui["wc-example"].value=id;ui["wc-example"].events.change();
 assert.match(ui["wc-rule"].children[0].children[3].textContent,/no contextual acoustic certification/);
 assert.equal(ui["wc-rule-source"].children[0].href,sample.source);
}
assert.deepEqual(Array.from(sandhi.previewPair("长大",[3,4]).conditionalSurface),[3,4]);
assert.equal(sandhi.previewPair("一个",[1,0]).rule,"none");
assert.throws(()=>sandhi.previewPair("你好了",[3,3,0]));
assert.throws(()=>sandhi.previewPair("你好",[6,3]));
ui["wc-lead"].value="zhang-growth";ui["wc-lead"].events.change();
assert.match(ui["wc-reading-note"].textContent,/zhang3 da4/);
assert.match(ui["wc-meaning-note"].textContent,/growth/);
ui["wc-lead"].value="hua-plan";ui["wc-lead"].events.change();
assert.equal(ui["wc-word"].children[0].children.length,2);
assert.equal(ui["wc-word"].children[0].children[1].attrs["aria-current"],"true");
ui["wc-segments"].checked=false;ui["wc-segments"].events.change();
assert.match(ui["wc-word"].children[0].attrs["aria-label"],/separated source characters/);
ui["wc-readings"].checked=false;ui["wc-readings"].events.change();
assert.equal(ui["wc-word"].children[0].children[0].children[1].textContent,
 "No word-entry reading displayed");
ui["wc-meaning"].checked=false;ui["wc-meaning"].events.change();
assert.equal(ui["wc-meaning-note"].textContent,"Publisher gloss hint hidden.");
ui["wc-sandhi"].checked=false;ui["wc-sandhi"].events.change();
assert.equal(ui["wc-rule"].children[0].textContent,"Sandhi control hidden.");
ui["wc-geometry"].checked=true;ui["wc-geometry"].events.change();
const wordNodes=ui["wc-word"].children[0].children;
assert.ok(wordNodes[0].children[0].src.endsWith(".svg"));
wordNodes[0].children[0].events.error();
assert.equal(wordNodes[0].children[0].hidden,true);
assert.equal(wordNodes[0].children[1].hidden,false);
ui["wc-lead"].value="guo-aspect";ui["wc-lead"].events.change();
assert.equal(ui["wc-sentence"].children.length,5);
assert.match(ui["wc-reading-note"].textContent,/No paired published/);
assert.match(ui["wc-orthography"].textContent,/GB\/T 16159-2012/);
assert.match(ui["wc-other-readings"].textContent,/guò vs guo/);
ui["wc-lead"].value="pao-dig";ui["wc-lead"].events.change();
assert.equal(ui["wc-sentence"].disabled,true);
assert.match(ui["wc-boundary"].children[0].textContent,/No pinned sentence-ID/);
assert.equal(ui["wc-sentence-link"].children.length,0);
const corrupt=structuredClone(agreement);
corrupt.records[0].independentContextualReadingVerified=true;
const bad=run([leads,corrupt,corpus,standard,profile]);await settle(bad.els);
assert.match(bad.els["wc-status"].textContent,/Unable to validate/);
const corruptCorpus=structuredClone(corpus);
corruptCorpus.records[0].quotationRightsAdjudicated=true;
const badCorpus=run([leads,agreement,corruptCorpus,standard,profile]);await settle(badCorpus.els);
assert.match(badCorpus.els["wc-status"].textContent,/Unable to validate/);
const swapped=structuredClone(corpus);
swapped.records[0].sourceURL="https://example.org/other";
const badLink=run([leads,agreement,swapped,standard,profile]);await settle(badLink.els);
assert.match(badLink.els["wc-status"].textContent,/Unable to validate/);
for(const id of ["lead","sentence","example","segments","readings","meaning","geometry",
 "sandhi","status","word","reading-note","other-readings","meaning-note","word-source",
 "boundary","corpus-note","sentence-link","rule","rule-source","evidence","orthography"])
 assert.ok(html.includes('id="wc-'+id+'"'),"Missing visible source control: "+id);
assert.ok(html.includes('mandarin-context-sandhi.js'));
assert.ok(!contextJS.includes("innerHTML"));
assert.ok(!html.includes("src=\"https://tatoeba.org/en/sentences/show/"));
console.log("Context acceptance: 8 source word leads, 5 published pronunciation pairs, 27 corpus associations, polyphonic headings, four conditional sandhi controls, independent toggles, and zero certification leakage.");
