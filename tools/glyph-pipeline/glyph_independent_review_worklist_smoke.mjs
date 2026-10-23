import assert from "node:assert/strict";
import {deriveReviewWorklist} from "./glyph_independent_review_worklist.mjs";
const catalog={schema:"chromalect.character-tranche.v1",tranche:"0001-1000",characters:[
 {rank:1,character:"一"},{rank:2,character:"好"}]};
const color={form:"一",component_id:"cmp-0171",hex:"#AABBCC"};
const map={
 schema:"chromalect.component-stroke-mappings.v1",
 palette_ref:"mandarin-component-identity@0.6.0",glyph_count:2,glyphs:[
 {character:"一",decomposition:"一",svg:"4e00.svg",independently_visually_certified:false,
 components:[color],source_path_owner_ids:["cmp-0171"],sourceCategory:"source",
 alignment_method:"direct_source_decomposition_ownership",assignment_status:"source_derived_candidate"},
 {character:"好",decomposition:"⿰女子",svg:"597d.svg",independently_visually_certified:false,
 components:[{form:"女",component_id:"cmp-0014",hex:"#AABBCC"},{form:"子",component_id:"cmp-0015",hex:"#CCAABB"}],
 source_path_owner_ids:["cmp-0014","cmp-0015"],alignment_method:"hanzivg_group_and_indexed_geometry_correspondence",
 assignment_status:"hanzivg_group_alignment_candidate",
 ownership_provenance:{provider:"hanzivg",review_status:"pending_independent_visual_and_linguistic_review"}}
 ]};
const review={schema:"chromalect.geometry-review.v1",total_glyphs:2,
 review_flags_are_certifications:false,independently_certified_count:0,glyphs:[
 {character:"一",decomposition:"一",component_ids:["cmp-0171"],stroke_count:1,
 geometry_review_flags:[],component_color_pairs_below_0_07_oklab:[],independently_visually_reviewed:false},
 {character:"好",decomposition:"⿰女子",component_ids:["cmp-0014","cmp-0015"],stroke_count:2,
 geometry_review_flags:["nearby_component_colors"],component_color_pairs_below_0_07_oklab:[{oklab_distance:0.02}],
 independently_visually_reviewed:false}
]};
const coverage={schema:"chromalect.glyph-coverage.v1",palette:"mandarin-component-identity@0.6.0",
 catalog_size:2,source_aligned_catalog_glyphs:2,unmapped_count:0,
 source_aligned_atomic:1,source_aligned_multicomponent:1};
const test=(...args)=>deriveReviewWorklist(...args);
const valid=test(catalog,map,review,coverage);
assert.deepEqual(valid.records.map(x=>x.character),["好","一"]);
assert.equal(valid.summary.catalogCharacters,2);
assert.equal(valid.summary.reviewTiers.automatic_geometry_flag,1);
assert.equal(valid.summary.reviewTiers.atomic_or_single_component,1);
assert.equal(valid.summary.independentlyVisuallyCertified,0);
assert.equal(valid.summary.eligibleLearningStudyItems,0);
assert.ok(valid.records.every(x=>x.independentVisualReview==="pending"&&!x.eligibleForLearningStudy));
const reject=(sourceIndex,fn)=>{
 const copies=[catalog,map,review,coverage].map(x=>structuredClone(x));
 fn(copies[sourceIndex]);assert.throws(()=>test(...copies));
};
reject(1,d=>d.glyphs[0].independently_visually_certified=true);
reject(2,d=>d.glyphs[0].independently_visually_reviewed=true);
reject(1,d=>d.glyphs[0].source_path_owner_ids=["cmp-9999"]);
reject(1,d=>d.glyphs[1].alignment_method="unknown");
reject(2,d=>d.glyphs[1].component_ids=["cmp-0015","cmp-0014"]);
reject(3,d=>d.unmapped_count=1);
console.log("Build-generated independent visual review worklist: identities, warnings, priority, no approvals.");
