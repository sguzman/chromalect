import assert from "node:assert/strict";
import fs from "node:fs";
const d="data/semantic/cedict-crossref/";
const report=JSON.parse(fs.readFileSync(d+"publisher-reading-label-comparison-v0.1.json","utf8"));
assert.equal(report.schema,"chromalect.semantic.publisher-reading-label-comparison.v0.1");
assert.equal(report.status,"mechanical_pinyin_display_comparison_not_lexical_adjudication");
assert.deepEqual(report.summary,{checkedCharacters:23,checkedExternalPages:27,
 matchingProminentLabelSets:21,publisherAdditionalLabelSets:2,
 publisherMissingPinnedLabelSets:0,independentLexicalApproved:0,
 emojiComprehensionApproved:0,productionVerified:0});
const uncommon=report.records.filter(x=>x.alignment!=="same_displayed_reading_labels");
assert.deepEqual(uncommon.map(x=>x.character),["过","齐"]);
assert.deepEqual(uncommon[0].publisherOnlyLabels,["guō"]);
assert.deepEqual(uncommon[1].publisherOnlyLabels,["jì","zhāi","zī"]);
for(const r of report.records){
 assert.equal(r.lexicalApproval,false);
 assert.equal(r.productionVerified,false);
 assert.ok(r.sourceUrls.length>0);
 assert.ok(r.pinnedNormalizedLabels.length>0);
 assert.ok(r.publisherProminentLabels.length>0);
 assert.equal(r.pinnedOnlyLabels.length,0);
}
assert.equal(new Set(report.records.map(x=>x.rank)).size,23);
console.log("Publisher Pinyin comparison: 23 characters; 21 matching label sets; 2 source-only reading expansions; 0 approvals.");
