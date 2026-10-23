import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
const grammarSource=fs.readFileSync("site/semantic-grammar.js","utf8");
const semantic=JSON.parse(fs.readFileSync("data/semantic/mandarin-1000-v0.1.json","utf8"));
import {derivePilotGroupCounterfactual} from "./pilot_group_counterfactual.mjs";
import {deriveSourceGlyphCounterfactual} from "./source_glyph_counterfactual.mjs";
const source=JSON.parse(fs.readFileSync(
 "palettes/mandarin-component-identity-v0.6.json","utf8"));
const counterfactual=derivePilotGroupCounterfactual(source);
const c1=source.components[0],c41=source.components.find(c=>c.id==="cmp-0240");
const catalog={schema:"chromalect.character-tranche.v1",characters:[
 {rank:1,character:"一"},{rank:2,character:"二"}]};
const comp=c=>({form:c.shape,component_id:c.id,hex:c.color});
const manifest={
 schema:"chromalect.component-stroke-mappings.v1",
 palette_ref:"mandarin-component-identity@0.6.0",glyph_count:2,
 glyphs:[
  {character:"一",svg:"U+4E00.svg",unicode_codepoint:"U+4E00",
   independently_visually_certified:false,
   components:[comp(c1),comp(c41)],
   source_path_owner_ids:[c1.id,c41.id]},
  {character:"二",svg:"U+4E8C.svg",unicode_codepoint:"U+4E8C",
   independently_visually_certified:false,
   components:[comp(c41)],
   source_path_owner_ids:[c41.id]}
 ]};
const svg=items=>'<svg xmlns="http://www.w3.org/2000/svg">'+items.map((c,i)=>
 '<path d="M '+(i*20)+' 0 L 20 20 Z" fill="'+c.color+'" data-component="'+c.id+'"/>').join("")+'</svg>';
const fixtures={"U+4E00.svg":svg([c1,c41]),"U+4E8C.svg":svg([c41])};
const demo=deriveSourceGlyphCounterfactual(catalog,manifest,source,
 file=>fixtures[file],{expectedGlyphCount:2});
const output=structuredClone(demo.manifest);
output.summary.catalogGlyphs=1000;output.summary.untouchedGlyphs=999;
output.summary.generatedSourceManifestGlyphs=1007;
output.summary.excludedOutsideActiveTranche=7;
const research={
 schema:"chromalect.glyph.hint-hue-source-pair-risk.v0.1",
 status:"machine_computed_per_glyph_identity_proximity_not_human_discrimination",
 provenance:{palette:"mandarin-component-identity@0.6.0",cutoffDeltaOk:0.07,
  originalPaletteMutated:false,humanReviewPerformed:false,semanticFamilyApproval:false},
 summary:{catalogCharacters:1000,paletteIdentities:520,hypotheticalComponentIds:40,
  affectedGlyphs:1,originalClosePairs:26,proposedClosePairs:27,
  newlyClosePairs:1,retainedClosePairs:26,resolvedClosePairs:0,
  independentlyAcceptedSemanticFamilies:0,humanLegibilityTrials:0,
  affectedGlyphsWithNewClosePairs:1},
 glyphs:[{rank:1,character:"一",
  svg:"glyphs/research/hint-counterfactual-v0.1/U+4E00.svg",
  sourceSVG:"glyphs/U+4E00.svg",changedComponentIds:[c1.id],
  originalClosePairs:0,candidateClosePairs:1,introducedClosePairs:1,
  resolvedClosePairs:0,retainedClosePairs:0,
  sourceUniqueComponentPairs:1,sourceGeometryUnchanged:true,
  productionPaletteUnchanged:true,visualJudgment:"pending",
  lexicalInterpretation:"unapproved",
  reviewPairs:[{
   componentA:{id:c1.id,form:c1.shape,sourceHex:c1.color,
    candidateHex:counterfactual.groups.flatMap(g=>g.members).find(m=>m.componentId===c1.id).candidateHex},
   componentB:{id:c41.id,form:c41.shape,sourceHex:c41.color,candidateHex:c41.color},
   originalDeltaOk:0.215183,candidateDeltaOk:0.009194,
   changeDeltaOk:-0.205989,state:"introduced",
   originalSourceWarning:false,experimentalMeasurementOnly:true,perceptuallyVerified:false
  }]}
]};
const script=fs.readFileSync("site/hint-hue-glyph-comparison.js","utf8"),
 html=fs.readFileSync("site/hint-hue-glyph-comparison.html","utf8");
class Node{
 constructor(){this.children=[];this.value="";this.textContent="";
  this.className="";this.events={};this.disabled=false;this.attrs={};
  this.style={setProperty:(name,value)=>{this.style[name]=value}};}
 appendChild(x){this.children.push(x);return x;}
 replaceChildren(...xs){this.children=xs.flatMap(x=>x.kind==="fragment"?x.children:[x]);}
 addEventListener(k,f){this.events[k]=f;}
 setAttribute(k,v){this.attrs[k]=v;}
}
function start(g=output,a=counterfactual,p=source,hash="",m=semantic,r=research){
 const ids=["hg-query","hg-size","hg-size-label","hg-gray","hg-surface",
  "hg-select","hg-prev","hg-next","hg-show-meaning","hg-sense","hg-reveal",
  "hg-compare","hg-count","hg-status","hg-owner","hg-semantic",
  "hg-risk-filter","hg-risk-summary","hg-risk-pairs"];
 const ui=Object.fromEntries(ids.map(id=>[id,new Node()]));
 ui["hg-size"].value="112";ui["hg-surface"].value="theme";ui["hg-risk-filter"].value="all";
 const ctx={document:{getElementById:id=>ui[id],
  createElement:()=>new Node(),createDocumentFragment:()=>{const x=new Node();x.kind="fragment";return x;}},
  location:{hash},
  fetch:async path=>({ok:true,json:async()=>
   path.endsWith("/pair-risk-v0.1.json")?r:
   path.startsWith("glyphs/research/")?g:
   path.startsWith("palettes/")?p:
   path.startsWith("semantic/")?m:a}),
  Map,Set,Array,Object,Number,Math,Error,JSON
 };
 ctx.globalThis=ctx;
 vm.runInNewContext(grammarSource,ctx);
 vm.runInNewContext(script,ctx);
 return ui;
}
async function settle(x){
 for(let i=0;i<60&&!x["hg-compare"].children.length&&
 !x["hg-status"].textContent.includes("Unable");i++)await Promise.resolve();
}
const ui=start();await settle(ui);
assert.equal(ui["hg-compare"].children.length,2,ui["hg-status"].textContent);
assert.equal(ui["hg-select"].children.length,1);
assert.match(ui["hg-count"].textContent,/1 \/ 1 research-eligible glyphs/);
assert.match(ui["hg-status"].textContent,/Original SVGs and geometries verified/);
assert.match(ui["hg-status"].textContent,/7 additional source-manifest records are excluded/);
assert.match(ui["hg-risk-summary"].textContent,/27 in the hypothetical palette/);
assert.match(ui["hg-risk-pairs"].children[1].textContent,/1 newly close/);
assert.match(ui["hg-risk-pairs"].children[2].children[0].textContent,/introduced/);
ui["hg-risk-filter"].value="introduced";ui["hg-risk-filter"].events.change();
assert.equal(ui["hg-compare"].children.length,2);
ui["hg-risk-filter"].value="original_close";ui["hg-risk-filter"].events.change();
assert.equal(ui["hg-compare"].children.length,0);
ui["hg-risk-filter"].value="all";ui["hg-risk-filter"].events.change();
assert.equal(ui["hg-compare"].children.length,2);
assert.equal(ui["hg-compare"].children[0].children[1].children[0].src,
 "glyphs/U+4E00.svg");
assert.equal(ui["hg-compare"].children[1].children[1].children[0].src,
 "glyphs/research/hint-counterfactual-v0.1/U+4E00.svg");
assert.equal(ui["hg-owner"].children[2].children.length,1);
assert.equal(ui["hg-owner"].children[2].children[0].children[1].style["--hg-swatch"],
 c1.color);
assert.match(ui["hg-owner"].children[1].textContent,/source atlas remains unchanged/);
assert.match(ui["hg-semantic"].children[1].textContent,/label hidden until revealed/);
ui["hg-show-meaning"].checked=true;ui["hg-show-meaning"].events.change();
const originalCue=ui["hg-compare"].children[0].children[1].children[1];
const proposedCue=ui["hg-compare"].children[1].children[1].children[1];
assert.equal(originalCue.className,"hg-semantic-cue");
assert.equal(originalCue.children.length,proposedCue.children.length);
assert.ok(originalCue.children.length>0);
assert.equal(originalCue.attrs["aria-label"],proposedCue.attrs["aria-label"]);
ui["hg-reveal"].checked=true;ui["hg-reveal"].events.change();
assert.match(ui["hg-semantic"].children[1].textContent,/original source definition/);
ui["hg-show-meaning"].checked=false;ui["hg-show-meaning"].events.change();
assert.equal(ui["hg-compare"].children[0].children[1].children.length,1);
ui["hg-gray"].checked=true;ui["hg-gray"].events.change();
assert.equal(ui["hg-compare"].children[0].children[1].children[0].style.filter,"grayscale(1)");
assert.equal(ui["hg-compare"].children[1].children[1].children[0].style.filter,"grayscale(1)");
ui["hg-surface"].value="black";ui["hg-surface"].events.change();
assert.equal(ui["hg-compare"].children[0].children[1].style["--hg-background"],"#000000");
assert.equal(ui["hg-compare"].children[1].children[1].style["--hg-background"],"#000000");
ui["hg-size"].value="48";ui["hg-size"].events.input();
assert.equal(ui["hg-compare"].children[0].children[1].children[0].width,48);
ui["hg-query"].value="cmp-9999";ui["hg-query"].events.input();
assert.equal(ui["hg-compare"].children.length,0);
assert.match(ui["hg-count"].textContent,/0 matching/);
ui["hg-query"].value="cmp-0001";ui["hg-query"].events.input();
assert.equal(ui["hg-compare"].children.length,2);
for(const modify of [
 (g,a,p)=>{g.provenance.activeGlyphFilesOverwritten=true;},
 (g,a,p)=>{g.provenance.strokePathsChanged=true;},
 (g,a,p)=>{g.summary.humanComprehensionTrials=1;},
 (g,a,p)=>{g.summary.untouchedGlyphs=998;},
 (g,a,p)=>{g.glyphs[0].sourcePathsIdentical=false;},
 (g,a,p)=>{g.glyphs[0].changedComponentIds=["cmp-9999"];},
 (g,a,p)=>{g.glyphs[0].hypotheticalSVG="../outside.svg";},
 (g,a,p)=>{g.glyphs[0].sourceGeometrySHA256="not-a-digest";},
 (g,a,p)=>{g.glyphs[0].independentGlyphValidation="approved";},
 (g,a,p)=>{a.provenance.activeGlyphsRecolored=true;},
 (g,a,p)=>{a.groups[0].members[0].sourceHex="#ffffff";},
 (g,a,p)=>{p.components[0].color="#123456";},
 (g,a,p,m)=>{m.summary.productionVerifiedCharacters=1;},
 (g,a,p,m)=>{m.characters[0].rank=2;},
 (g,a,p,m)=>{m.characters[0].screening.candidates[0].review="approved";},
 (g,a,p,m,r)=>{r.provenance.humanReviewPerformed=true;},
 (g,a,p,m,r)=>{r.summary.newlyClosePairs=0;},
 (g,a,p,m,r)=>{r.glyphs[0].reviewPairs[0].componentA.candidateHex="#ffffff";},
 (g,a,p,m,r)=>{r.glyphs[0].visualJudgment="accepted";}
]){
 const g=structuredClone(output),a=structuredClone(counterfactual),p=structuredClone(source),
  m=structuredClone(semantic),r=structuredClone(research);
 modify(g,a,p,m,r);
 const invalid=start(g,a,p,"",m,r);await settle(invalid);
 assert.equal(invalid["hg-compare"].children.length,0);
 assert.match(invalid["hg-status"].textContent,/Unable to validate/);
}
for(const id of ["hg-query","hg-size","hg-size-label","hg-gray","hg-surface",
 "hg-select","hg-prev","hg-next","hg-show-meaning","hg-sense","hg-reveal",
 "hg-compare","hg-count","hg-status","hg-owner","hg-semantic",
 "hg-risk-filter","hg-risk-summary","hg-risk-pairs"])
 assert.match(html,new RegExp('id="'+id+'"'));
assert.ok(!script.includes("innerHTML"));
console.log("Exact original and counterfactual SVG URLs, shared display controls, and 19 fail-closed research guards.");
