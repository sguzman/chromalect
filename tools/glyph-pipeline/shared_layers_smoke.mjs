// Shared layer presenter and preference smoke using the actual browser-side source.
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
const source=fs.readFileSync("site/layers.js","utf8");
const css=fs.readFileSync("site/style.css","utf8");
const installed=new Map();
class Element{
 constructor(tag="div"){
  this.tagName=tag;this.children=[];this.attributes={};this.events={};this.style={};
  this.style.setProperty=(key,value)=>{this.style[key]=value;};
  this.className="";this.value="";this.checked=false;this.disabled=false;
  this.classList={add:name=>{this.className+=(this.className?" ":"")+name;}};
 }
 append(...items){this.children.push(...items);}
 appendChild(x){this.append(x);return x;}
 replaceChildren(...items){this.children=[...items];}
 setAttribute(k,v){this.attributes[k]=String(v);}
 addEventListener(k,listener){this.events[k]=listener;}
 querySelectorAll(selector) {
  assert.equal(selector,'input[type="radio"]');
  const all=x=>[x,...x.children.flatMap(all)];
  return all(this).filter(x=>x.tagName==="input" && x.type==="radio");
 }
}
function launch(){
 const target=new Element("div");
 const doc={
  readyState:"complete",
  createElement:tag=>new Element(tag),
  querySelector:selector=>{
   if(selector===".controls")return null;
   if(selector==="[data-character-layer-controls]")return target;
   if(selector==='script[src$="layers.js"]')return {src:"https://example.test/chromalect/layers.js"};
   throw new Error(selector);
  }
 };
 const ctx={document:doc,URL,
  localStorage:{
   getItem:key=>installed.has(key)?installed.get(key):null,
   setItem:(key,value)=>{installed.set(key,value);}
  }
 };
 ctx.globalThis=ctx;
 vm.runInNewContext(source,ctx);
 return {target,api:ctx.ChromalectLayers,controls:target.children[0]};
}
const one=launch();
assert.equal(one.api.chosen("component"),"direct");
assert.equal(one.api.chosen("reading"),"direct");
assert.equal(one.api.chosen("tone"),"direct");
const radios=one.controls.querySelectorAll('input[type="radio"]');
assert.equal(radios.length,9);
assert.deepEqual(radios.filter(x=>x.checked).map(x=>x.name),
 ["component","reading","tone"]);
const row={
 character:"山",component_instances:[{component_id:"cmp-1",form:"山",color:"#AABBCC"}],
 citation_readings:[{display:"shān",initial:{token:"sh",hex:"#112233"},
  final:{token:"an",hex:"#445566"},tone:{symbol:"—",hex:"#778899",category:1}}],
 geometry:{status:"source_aligned_visual_review_pending",svg:"glyphs/U+5C71.svg"}
};
const glyph=one.api.createGlyph(row);
assert.equal(glyph.className,"glyph-wrap");
assert.match(glyph.style["--parts-gradient"],/#AABBCC/);
assert.equal(glyph.style["--onset-color"],"#112233");
assert.equal(glyph.style["--rime-color"],"#445566");
assert.equal(glyph.style["--tone-color"],"#778899");
assert.ok(glyph.children.some(x=>x.className==="glyph glyph-with-strokes"));
const g=glyph.children.find(x=>x.className==="glyph glyph-with-strokes");
assert.equal(g.children[0].src,"https://example.test/chromalect/glyphs/U+5C71.svg");
assert.ok(glyph.children.some(x=>x.className==="phonetics-marker"));
assert.ok(glyph.children.some(x=>x.className==="tone-marker"));
const control=radios.find(x=>x.name==="tone"&&x.value==="marker");
control.checked=true;control.events.change();
assert.equal(installed.get("chromalect-layer-v1-tone"),"marker");
const two=launch();
assert.equal(two.controls.querySelectorAll('input[type="radio"]').find(x=>x.name==="tone"&&x.checked).value,"marker");
assert.equal(two.controls.querySelectorAll('input[type="radio"]').find(x=>x.name==="reading"&&x.checked).value,"direct");
const unresolved={...row,geometry:{status:"unresolved_geometry",svg:null}};
const fallback=one.api.createGlyph(unresolved);
assert.ok(!fallback.children.some(x=>x.className.includes("glyph-with-strokes")));
assert.match(css,/body:has\(#component-direct:checked\) \.glyph-with-strokes/);
for(const page of ["site/search.html","site/semantic-coverage.html","site/semantic-lab.html"]){
 const html=fs.readFileSync(page,"utf8");
 assert.match(html,/src="layers.js"/);
 assert.match(html,/data-character-layer-controls/);
}
console.log("Shared layers: Direct by default, independent persisted toggles, Pinyin/tone frame, source SVG and fallback.");
