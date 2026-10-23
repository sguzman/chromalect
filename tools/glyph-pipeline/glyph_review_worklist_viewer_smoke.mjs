import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
const js=fs.readFileSync("site/glyph-review-worklist.js","utf8");
const html=fs.readFileSync("site/glyph-review-worklist.html","utf8");
const priorities=["automatic_geometry_flag","documented_source_alternative",
 "secondary_chinese_source","subglyph_geometry_reconciliation",
 "standard_multicomponent","atomic_or_single_component"];
const dataset={
 schema:"chromalect.glyph-independent-review-worklist.v0.1",
 status:"build_derived_source_review_priority_not_independent_visual_certification",
 provenance:{paletteVersion:"mandarin-component-identity@0.6.0"},
 summary:{catalogCharacters:1000,mappedSourceGlyphs:1000,reviewTiers:Object.fromEntries(priorities.map(k=>[k,0])),
 independentlyVisuallyCertified:0,independentlyLinguisticallyCertified:0,eligibleLearningStudyItems:0},
 records:[]
};
for(let i=1;i<=1000;i++){
 const tier=i<5?"automatic_geometry_flag":"standard_multicomponent";
 dataset.summary.reviewTiers[tier]++;
 dataset.records.push({rank:i,character:String.fromCodePoint(0x4e00+i),
  svg:(0x4e00+i).toString(16)+".svg",reviewTier:tier,reviewPriority:priorities.indexOf(tier),
  decomposition:"⿰亻也",componentIds:["cmp-0001","cmp-0002"],strokeCount:5,
  sourceAlignmentMethod:"direct_source_decomposition_ownership",
  automaticGeometryFlags:tier==="automatic_geometry_flag"?["nearby_component_colors"]:[],
  independentVisualReview:"pending",independentLinguisticReview:"pending",eligibleForLearningStudy:false});
}
class Element{
 constructor(){this.children=[];this.value="";this.textContent="";this.events={};this.style={};this.attributes={};}
 replaceChildren(...parts){this.children=parts;}
 appendChild(x){this.children.push(x);}
 addEventListener(event,fn){this.events[event]=fn;}
}
function setup(d=dataset){
 const names=["audit-tier","audit-query","audit-results","audit-count","audit-status","audit-summary"];
 const nodes=Object.fromEntries(names.map(n=>[n,new Element()]));
 const doc={getElementById:n=>nodes[n],createElement:()=>new Element()};
 vm.runInNewContext(js,{document:doc,fetch:async()=>({ok:true,json:async()=>d}),Object,Set,Number,Math});
 return nodes;
}
async function settle(s){for(let n=0;n<35&&!s["audit-results"].children.length&&!s["audit-status"].textContent.includes("Unable");n++)await Promise.resolve();}
const view=setup();await settle(view);
assert.equal(view["audit-results"].children.length,48);
assert.match(view["audit-summary"].textContent,/approvals: zero/);
assert.match(view["audit-results"].children[0].children[2].textContent,/Source:/);
assert.equal(view["audit-results"].children[0].children[1].children[1].children[0].src,
 "glyphs/"+dataset.records[0].svg);
view["audit-tier"].value="automatic_geometry_flag";view["audit-tier"].events.change();
assert.equal(view["audit-results"].children.length,4);
assert.match(view["audit-count"].textContent,/4 matching/);
const invalid=structuredClone(dataset);invalid.records[0].eligibleForLearningStudy=true;
const bad=setup(invalid);await settle(bad);
assert.equal(bad["audit-results"].children.length,0);
assert.match(bad["audit-status"].textContent,/Unable to validate/);
for(const id of ["audit-tier","audit-query","audit-count","audit-status","audit-summary","audit-results"])
 assert.match(html,new RegExp('id="'+id+'"'));
assert.ok(!js.includes("innerHTML"));
console.log("First-tranche glyph-review browser: 1,000 pending items, scoped search and nonapproval gates.");
