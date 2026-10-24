// Regression-lock manually inspected GF 0014 name/relative-position cells.
// Checked against the scanned original, not a programmatic geometry certification.
import assert from "node:assert/strict";
import fs from "node:fs";
const load=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const catalog=load("palettes/gf0014-2009-records-v0.4.json");
const locator=load("data/research/gf0014-official-descriptive-row-locations-v0.1.json");
const proof=load("data/research/gf0014-descriptive-name-role-evidence-v0.1.json");
const officialNameRole=[
[4,"奥","head"],[10,"拜","side"],[20,"北","side"],[31,"曹","head"],
[35,"典","head"],[36,"曾","head"],[71,"黎","right_corner"],[74,"帝","head"],
[87,"段","side"],[101,"寿","head"],[119,"庚","core"],[151,"惠","head"],
[156,"即","side"],[160,"以","side"],[219,"临","right_corner"],[234,"留","head"],
[251,"囊","head"],[257,"鸟","reduced"],[262,"共","bottom"],[280,"乔","bottom"],
[304,"丧","head"],[308,"商","head"],[344,"衰","middle"],[346,"率","middle"],
[352,"益","head"],[388,"舞","head"],[393,"夜","lower_corner"],[423,"焉","bottom"],
[432,"养","head"],[493,"制","side"]
];
assert.equal(catalog.schema,"chromalect.GF0014-reference.v0");
assert.equal(catalog.counts.rows,514);
assert.equal(catalog.counts.non_glyph_description_rows,30);
assert.equal(catalog.status,"third-party transcription; not authoritative verified source");
assert.equal(locator.summary.matchingOrdinalAndGroupColumns,30);
assert.equal(locator.summary.independentlyApprovedDrawnForms,0);
assert.equal(proof.schema,"chromalect.gf0014.original-descriptive-form-name-role-evidence.v0.1");
assert.equal(proof.status,"original_scan_name_role_cell_visual_crosscheck_not_shape_or_geometry_approval");
assert.equal(proof.source.uri,"https://www.unicode.org/irg/docs/n2739-GF0014-2009.pdf");
assert.equal(proof.source.reviewDate,"2026-10-24");
assert.equal(proof.source.originalImagesAndTablesRedistributed,false);
const sourceMap=new Map(catalog.entries.map(x=>[x.source_ordinal,x]));
const locations=new Map(locator.records.map(x=>[x.sourceOrdinal,x]));
const descriptive=catalog.entries.filter(x=>x.form_type==="descriptive_nonfont_expression");
assert.equal(sourceMap.size,514);
assert.equal(descriptive.length,30);
assert.equal(officialNameRole.length,30);
assert.equal(proof.records.length,30);
assert.equal(Object.keys(proof.roles).length,8);
const actual=[];
for(let i=0;i<proof.records.length;i++){
 const row=proof.records[i],expected=officialNameRole[i];
 const original=sourceMap.get(row.sourceOrdinal);
 const loc=locations.get(row.sourceOrdinal);
 assert.ok(original&&loc);
 assert.deepEqual([row.sourceOrdinal,row.sourceHeadword,row.sourceComponentRole],expected);
 assert.equal(row.sourceGroup,original.source_group);
 assert.equal(row.sourceGroup,loc.sourceGroup);
 assert.equal(row.catalogComponentId,original.component_id);
 assert.equal(row.originalPDFPageOneBased,loc.pdfPageOneBased);
 assert.equal(row.originalStandardPrintedPage,loc.printedStandardPage);
 assert.equal(row.thirdPartyIDSExpression,original.form);
 assert.equal(row.independentTableCellNameAndRoleVisuallyRead,true);
 assert.equal(row.originalIllustratedComponentMatchedToIDS,false);
 assert.equal(row.strokeOutlineGeometryRecovered,false);
 assert.equal(row.independentHumanReviewerSignoff,false);
 assert.ok(Object.hasOwn(proof.roles,row.sourceComponentRole));
 actual.push(row.sourceOrdinal);
}
assert.deepEqual(actual,descriptive.map(x=>x.source_ordinal));
const counts=Object.fromEntries(Object.keys(proof.roles)
 .map(key=>[key,proof.records.filter(r=>r.sourceComponentRole===key).length]));
assert.deepEqual(counts,{head:14,side:6,core:1,right_corner:2,
 reduced:1,bottom:3,middle:2,lower_corner:1});
assert.deepEqual(proof.summary,{
 selectedThirdPartyDescriptiveForms:30,printedTableNameBaseMatched:30,
 printedSourceRelativeRolesRecorded:30,numericRowAndGroupIdentitiesConfirmed:30,
 fullDescriptionToExactDrawnGlyphEquivalenceApprovals:0,
 reproducibleOfficialComponentOutlineVectors:0,
 independentlyCertifiedSourceGeometry:0,
 independentHumanReviewerSignoffs:0,
 full514FormTranscriptionApprovals:0
});
assert.ok(!JSON.stringify(proof).includes("sourceGlyphGeometryApproved"));
console.log("Original GF0014 scan: 30/30 name anchors and positions recorded, 0/30 exact-shape or geometry approvals.");
