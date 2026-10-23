// Derive review-only first-tranche glyph audit worklist from final generated SVG mappings.
// No source-aligned machine check can self-award independent visual or linguistic approval.
import assert from "node:assert/strict";
import fs from "node:fs";
import {pathToFileURL} from "node:url";
const base="site/glyphs/";
const validMethods=new Set([
 "curated_direct_source_ownership","direct_source_decomposition_ownership",
 "source_subglyph_geometry_correspondence",
 "hanzivg_group_and_indexed_geometry_correspondence",
 "cross_variant_structural_comparison_with_chinese_geometry_gate",
 "animcjk_zhhans_documented_alternative_and_geometry",
 "animcjk_zhhans_source_stroke_ownership_and_geometry"
]);
function classify(mapping,review){
 if(review.geometry_review_flags.length)return {key:"automatic_geometry_flag",priority:0};
 if(mapping.source_selected_catalog_alternative!==undefined||
    mapping.alignment_method==="animcjk_zhhans_documented_alternative_and_geometry")
  return {key:"documented_source_alternative",priority:1};
 if(mapping.ownership_provenance||mapping.alignment_method.startsWith("hanzivg_")||
    mapping.alignment_method.startsWith("animcjk_")||
    mapping.alignment_method.startsWith("cross_variant_"))
  return {key:"secondary_chinese_source",priority:2};
 if(mapping.alignment_method==="source_subglyph_geometry_correspondence")
  return {key:"subglyph_geometry_reconciliation",priority:3};
 if(mapping.components.length>1)return {key:"standard_multicomponent",priority:4};
 return {key:"atomic_or_single_component",priority:5};
}
export function deriveReviewWorklist(catalog,mappings,report,coverage){
 assert.equal(catalog.tranche,"0001-1000");
 assert.equal(catalog.schema,"chromalect.character-tranche.v1"); // see live source contract
 assert.equal(mappings.schema,"chromalect.component-stroke-mappings.v1");
 assert.equal(mappings.palette_ref,"mandarin-component-identity@0.6.0");
 assert.equal(report.schema,"chromalect.geometry-review.v1");
 assert.equal(coverage.schema,"chromalect.glyph-coverage.v1");
 assert.equal(coverage.palette,"mandarin-component-identity@0.6.0");
 assert.equal(catalog.characters.length,coverage.catalog_size);
 assert.equal(coverage.source_aligned_catalog_glyphs,coverage.catalog_size);
 assert.equal(coverage.unmapped_count,0);
 assert.equal(report.review_flags_are_certifications,false);
 assert.equal(report.independently_certified_count,0);
 assert.equal(mappings.glyph_count,mappings.glyphs.length);
 assert.equal(report.total_glyphs,report.glyphs.length);
 assert.equal(report.total_glyphs,mappings.glyph_count);
 const byMapping=new Map(),byReview=new Map();
 for(const r of mappings.glyphs){
  assert.ok(typeof r.character==="string"&&[...r.character].length===1);
  assert.ok(!byMapping.has(r.character),"Duplicate glyph source mapping");
  assert.equal(r.independently_visually_certified,false);
  assert.ok(validMethods.has(r.alignment_method),"Unexpected source alignment method");
  byMapping.set(r.character,r);
 }
 for(const r of report.glyphs){
  assert.ok(!byReview.has(r.character),"Duplicate source review report row");
  assert.equal(r.independently_visually_reviewed,false);
  assert.ok(Array.isArray(r.geometry_review_flags));
  assert.ok(Array.isArray(r.component_color_pairs_below_0_07_oklab));
  byReview.set(r.character,r);
 }
 const rows=[];
 for(let index=0;index<catalog.characters.length;index++){
  const source=catalog.characters[index],mapping=byMapping.get(source.character),
   review=byReview.get(source.character);
  assert.equal(source.rank,index+1);
  assert.ok(mapping&&review,"No source-aligned mapping and review for catalog character");
  assert.equal(mapping.character,review.character);
  assert.equal(mapping.decomposition,review.decomposition);
  assert.equal(mapping.source_path_owner_ids.length,review.stroke_count);
  assert.deepEqual(mapping.components.map(x=>x.component_id),review.component_ids);
  assert.ok(mapping.components.length>=1);
  assert.ok(mapping.source_path_owner_ids.length>=1);
  const owned=new Set(mapping.components.map(x=>x.component_id));
  assert.ok(mapping.source_path_owner_ids.every(x=>owned.has(x)));
  assert.ok(mapping.components.every(x=>/^#[0-9a-f]{6}$/i.test(x.hex)&&/^cmp-\d{4}$/.test(x.component_id)));
  assert.ok(typeof mapping.svg==="string"&&/^[^/\\]+\.svg$/u.test(mapping.svg));
  const triage=classify(mapping,review);
  rows.push({rank:source.rank,character:source.character,svg:mapping.svg,
   decomposition:mapping.decomposition,componentIds:mapping.components.map(x=>x.component_id),
   strokeCount:review.stroke_count,sourceAlignmentMethod:mapping.alignment_method,
   sourceCategory:mapping.assignment_status,
   sourceOwnershipProvider:mapping.ownership_provenance?.provider??null,
   automaticGeometryFlags:review.geometry_review_flags,
   closeColorPairs:review.component_color_pairs_below_0_07_oklab.length,
   reviewTier:triage.key,reviewPriority:triage.priority,
   independentVisualReview:"pending",independentLinguisticReview:"pending",
   eligibleForLearningStudy:false});
 }
 rows.sort((a,b)=>a.reviewPriority-b.reviewPriority||a.rank-b.rank);
 const keys=["automatic_geometry_flag","documented_source_alternative",
  "secondary_chinese_source","subglyph_geometry_reconciliation",
  "standard_multicomponent","atomic_or_single_component"];
 const count=Object.fromEntries(keys.map(key=>[key,rows.filter(x=>x.reviewTier===key).length]));
 assert.equal(Object.values(count).reduce((a,b)=>a+b,0),coverage.catalog_size);
 return {schema:"chromalect.glyph-independent-review-worklist.v0.1",
  status:"build_derived_source_review_priority_not_independent_visual_certification",
  provenance:{sourceCatalog:"data/catalog/characters-0001-1000.json",
   builtManifest:"site/glyphs/mappings.json",builtGeometryReview:"site/glyphs/review/report.json",
   builtCoverage:"site/glyphs/coverage.json",paletteVersion:mappings.palette_ref,
   svgSourcePathsCopied:false,rawSourceGeometryCopied:false},
  warnings:["No item in this worklist is independently visually or linguistically certified.",
    "Source-aligned mapping and automatic warning flags are only machine checks.",
    "A candidate source alternative remains pending until independent inspection.",
    "This index does not imply eligibility for educational participant testing."],
  summary:{catalogCharacters:coverage.catalog_size,mappedSourceGlyphs:rows.length,
    sourceMappedAtomic:coverage.source_aligned_atomic,
    sourceMappedMulticomponent:coverage.source_aligned_multicomponent,
    reviewTiers:count,independentlyVisuallyCertified:0,
    independentlyLinguisticallyCertified:0,eligibleLearningStudyItems:0},
  records:rows};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const catalog=JSON.parse(fs.readFileSync("data/catalog/characters-0001-1000.json","utf8"));
 const mapping=JSON.parse(fs.readFileSync(base+"mappings.json","utf8"));
 const report=JSON.parse(fs.readFileSync(base+"review/report.json","utf8"));
 const coverage=JSON.parse(fs.readFileSync(base+"coverage.json","utf8"));
 const result=deriveReviewWorklist(catalog,mapping,report,coverage);
 const target=base+"review/independent-review-worklist-v0.1.json";
 const payload=JSON.stringify(result,null,2)+"\n";
 if(process.argv.includes("--write"))fs.writeFileSync(target,payload);
 else if(process.argv.includes("--check"))assert.equal(fs.readFileSync(target,"utf8"),payload);
 else throw Error("Use --write or --check");
 console.log("First-tranche visual-review worklist:",JSON.stringify(result.summary));
}