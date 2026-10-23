import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
const js=fs.readFileSync("site/glyph-review-intake.js","utf8");
const html=fs.readFileSync("site/glyph-review-intake.html","utf8");
const tiers=["automatic_geometry_flag","documented_source_alternative",
 "secondary_chinese_source","subglyph_geometry_reconciliation",
 "standard_multicomponent","atomic_or_single_component"];
const counts=[25,4,100,70,525,276];
const records=[];let rank=0;
tiers.forEach((tier,i)=>{for(let n=0;n<counts[i];n++){
 rank++;
 records.push({rank,character:String.fromCodePoint(0x4e00+rank),svg:rank.toString(16)+".svg",
  decomposition:"⿰亻也",strokeCount:5,componentIds:["cmp-0001","cmp-0002"],
  reviewTier:tier,reviewPriority:i,sourceAlignmentMethod:"direct_source_decomposition_ownership",
  automaticGeometryFlags:i===0?["nearby_component_colors"]:[],closeColorPairs:i===0?1:0,
  independentVisualReview:"pending",independentLinguisticReview:"pending",eligibleForLearningStudy:false});
}});
const source={schema:"chromalect.glyph-independent-review-worklist.v0.1",
 status:"build_derived_source_review_priority_not_independent_visual_certification",
 provenance:{paletteVersion:"mandarin-component-identity@0.6.0"},
 summary:{catalogCharacters:1000,mappedSourceGlyphs:1000,
  independentlyVisuallyCertified:0,independentlyLinguisticallyCertified:0,eligibleLearningStudyItems:0,
  reviewTiers:Object.fromEntries(tiers.map((tier,i)=>[tier,counts[i]]))},records};
class Element{
 constructor(){this.children=[];this.value="";this.textContent="";this.events={};}
 appendChild(x){this.children.push(x);}
 replaceChildren(...x){this.children=x;}
 addEventListener(name,fn){this.events[name]=fn;}
}
function setup(data=source){
 const ids=["inspection-target","inspection-native","inspection-svg","inspection-source",
 "inspection-tier","inspection-flags","inspection-geometry","inspection-ownership",
 "inspection-contrast","inspection-evidence","inspection-rationale",
 "inspection-save","inspection-export","inspection-output","inspection-status","inspection-count"];
 const nodes=Object.fromEntries(ids.map(id=>[id,new Element()]));
 for(const id of ["inspection-geometry","inspection-ownership","inspection-contrast"])
  nodes[id].value="undetermined";
 const doc={getElementById:id=>nodes[id],createElement:()=>new Element()};
 vm.runInNewContext(js,{document:doc,fetch:async()=>({ok:true,json:async()=>data}),
  Map,Set,Object,Number,String,URL,Date,Error});
 return nodes;
}
async function settle(x){for(let i=0;i<35&&!x["inspection-target"].children.length&&
 !x["inspection-status"].textContent.includes("Unable");i++)await Promise.resolve();}
const page=setup();await settle(page);
assert.equal(page["inspection-target"].children.length,1000);
assert.equal(page["inspection-native"].textContent,records[0].character);
assert.match(page["inspection-count"].textContent,/0 local drafts/);
page["inspection-geometry"].value="preliminary_concern";
page["inspection-rationale"].value="The outer left form appears out of alignment with the expected source ownership group.";
page["inspection-export"].events.click();
assert.match(page["inspection-status"].textContent,/Cannot export/);
page["inspection-evidence"].value="https://example.org/independent-reference";
page["inspection-export"].events.click();
const result=JSON.parse(page["inspection-output"].value);
assert.equal(result.session.recorded,1);
assert.equal(result.session.independentCertificationsAwarded,0);
assert.equal(result.observations[0].geometry,"preliminary_concern");
assert.equal(result.observations[0].visualReviewCertified,false);
assert.equal(result.observations[0].studyEligibilityApproved,false);
assert.equal(result.observations[0].componentIds.length,2);
assert.ok(!("sourceStrokePaths" in result.observations[0]));
page["inspection-target"].value="2";page["inspection-target"].events.change();
assert.equal(page["inspection-native"].textContent,records[1].character);
const altered=structuredClone(source);altered.summary.independentlyVisuallyCertified=1;
const invalid=setup(altered);await settle(invalid);
assert.match(invalid["inspection-status"].textContent,/Unable to validate/);
assert.equal(invalid["inspection-target"].children.length,0);
for(const id of ["inspection-target","inspection-native","inspection-svg","inspection-source",
 "inspection-tier","inspection-flags","inspection-geometry","inspection-ownership",
 "inspection-contrast","inspection-evidence","inspection-rationale",
 "inspection-save","inspection-export","inspection-output","inspection-status","inspection-count"])
 assert.ok(html.includes('id="'+id+'"'));
assert.ok(!js.includes("innerHTML"));
console.log("First-tranche glyph review intake: 1,000 pinned targets, provisional source-only export, no certifications.");
