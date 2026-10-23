// Compact browser-oriented index derived from the full pinned polysemy triage.
import assert from "node:assert/strict";
import fs from "node:fs";
const dir="data/semantic/cedict-crossref/";
const source=JSON.parse(fs.readFileSync(dir+"polysemy-triage-v0.1.json","utf8"));
assert.equal(source.summary.charactersAudited,1000);
assert.equal(source.summary.independentLexicalApproved,0);
const output={
 schema:"chromalect.semantic.polysemy-review-index.v0.1",
 status:source.status,
 source:"polysemy-triage-v0.1.json",
 summary:source.summary,
 records:source.records.map(x=>({
  rank:x.rank,character:x.character,
  readingCount:x.dictionaryReadings.length,
  definitionFragmentCount:x.definitionFragmentCount,
  selectedMeaningCount:x.experimentalMeaningCount,
  triageTier:x.triageTier
 }))
};
assert.equal(output.records.length,1000);
const target=dir+"polysemy-review-index-v0.1.json";
if(process.argv.includes("--check")){
 assert.deepEqual(JSON.parse(fs.readFileSync(target,"utf8")),output);
 console.log("Polysemy review index: 1000 records, compact browser version verified.");
}else{
 fs.writeFileSync(target,JSON.stringify(output,null,2)+"\n");
 console.log("Updated "+target);
}