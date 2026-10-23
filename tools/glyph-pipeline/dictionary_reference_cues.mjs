// Reproduce CC-CEDICT's explicit written-form/pinyin cross-reference tokens.
// These are source-internal links, not independent usage attestations.
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
const dir="data/semantic/cedict-crossref/";
const names=["0001-0200","0201-0400","0401-0600","0601-0800","0801-1000"];
const sandbox={};sandbox.globalThis=sandbox;
vm.runInNewContext(fs.readFileSync("site/dictionary-readings.js","utf8"),sandbox);
vm.runInNewContext(fs.readFileSync("site/dictionary-reference-cues.js","utf8"),sandbox);
const triage=JSON.parse(fs.readFileSync(dir+"polysemy-triage-v0.1.json","utf8"));
const records=names.flatMap(n=>JSON.parse(
 fs.readFileSync(dir+"dictionary-excerpts-"+n+".json","utf8")).records);
const recordsWithLinks=[];
let instances=0,sections=0;const characters=new Set(),targets=new Set();
assert.equal(records.length,1000);
for(let i=0;i<records.length;i++){
 const r=records[i],p=triage.records[i];
 assert.equal(r.rank,i+1);assert.equal(p.rank,r.rank);assert.equal(p.character,r.character);
 for(const section of sandbox.ChromalectDictionaryReadings.split(r)){
  const links=sandbox.ChromalectDictionaryReferences.scan(section.gloss);
  if(!links.length)continue;
  instances+=links.length;sections++;characters.add(r.rank);
  for(const ref of links)targets.add(ref.written+"|"+ref.pinyin);
  recordsWithLinks.push({
   rank:r.rank,character:r.character,reading:section.reading,
   sourcePath:r.sourcePath,sourceBlobSha:r.sourceBlobSha,triageTier:p.triageTier,
   literalReferenceCues:links,
   independentLexicalReview:"pending",productionVerified:false
  });
 }
}
const summary={charactersAudited:records.length,dictionaryReadingsAudited:1393,
 dictionaryReferenceTokens:instances,readingsWithReferences:sections,
 charactersWithReferences:characters.size,distinctWrittenPronunciationTargets:targets.size,
 independentLexicalApproved:0,independentEmojiApproved:0,productionVerified:0};
assert.deepEqual([instances,sections,characters.size,targets.size],[469,349,314,342]);
const report={schema:"chromalect.semantic.pinned-dictionary-reference-cues.v0.1",
 status:"dictionary_crossreference_token_inventory_not_attested_word_usage",
 source:{dictionaryRevision:"63c2569948629323b515833930fdd10f285401b6",
 license:"CC BY-SA 4.0",readingsDataset:"dictionary-excerpts-0001-1000 (five blocks)",
 polysemyTriage:"polysemy-triage-v0.1.json"},
 summary,caveats:["Lexicographic cross-reference links are not necessarily usage examples, full words, high-frequency forms, or independent attestations.","Some written targets are single characters, aliases, surnames or radicals, and repeated links are retained as occurrences.","No mapping to the project's separate whole-word semantic layer is inferred from a source reference.","This inventory does not independently validate any reading, candidate meaning, emoji, or production assignment."],records:recordsWithLinks};
const target=dir+"dictionary-reference-cues-v0.1.json";
if(process.argv.includes("--check")){
 assert.deepEqual(JSON.parse(fs.readFileSync(target,"utf8")),report);
 console.log("Dictionary cross-reference token inventory verified: 469 tokens across 349 readings; no independent approvals.");
}else{
 fs.writeFileSync(target,JSON.stringify(report,null,2)+"\n");
 console.log("Wrote "+target);
}
