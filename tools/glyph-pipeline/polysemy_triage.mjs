// Reproducible first-1000 dictionary complexity triage.
// Reading variants and English gloss fragments are NOT verified distinct senses.
import assert from "node:assert/strict";
import fs from "node:fs";
const base="data/semantic/";
const path=base+"cedict-crossref/";
const blocks=["0001-0200","0201-0400","0401-0600","0601-0800","0801-1000"];
const ledger=JSON.parse(fs.readFileSync(base+"mandarin-1000-v0.1.json","utf8"));
const source=blocks.flatMap(n=>JSON.parse(fs.readFileSync(path+"dictionary-excerpts-"+n+".json","utf8")).records);
assert.equal(source.length,1000);
const entries=source.map((r,i)=>{
 const e=ledger.characters[i];
 assert.equal(r.rank,i+1);
 assert.equal(r.character,e.character);
 const count=e.screening.candidates.filter(x=>x.expression).length;
 const segments=r.excerpt.split(";").map(x=>x.trim()).filter(Boolean).length;
 const readings=r.readings.length;
 const reasons=[];
 if(readings>1)reasons.push("multiple_pronunciations");
 if(segments>=8)reasons.push("many_definition_fragments");
 if(count===0)reasons.push("pictogram_deferred");
 if(count===1&&(readings>1||segments>=8))
  reasons.push("single_meaning_selected_despite_multiple_dictionary_cues");
 const tier=readings>1&&segments>=8?"higher":
  readings>1||segments>=8?"targeted":count===0?"deferred":"baseline";
 return {rank:r.rank,character:r.character,sourcePath:r.sourcePath,
  sourceBlobSha:r.sourceBlobSha,dictionaryReadings:r.readings,
  definitionFragmentCount:segments,experimentalMeaningCount:count,
  triageTier:tier,reasons,manualSenseReview:"pending",independentLexicalApproval:false};
});
const summary={
 charactersAudited:1000,
 charsWithMultipleDictionaryReadings:entries.filter(x=>x.dictionaryReadings.length>1).length,
 charsWithEightOrMoreDefinitionFragments:entries.filter(x=>x.definitionFragmentCount>=8).length,
 charsWithOneCandidateDespiteMultipleCues:entries.filter(x=>x.reasons.includes("single_meaning_selected_despite_multiple_dictionary_cues")).length,
 charsWithNoEmojiCandidate:entries.filter(x=>x.experimentalMeaningCount===0).length,
 higherPriority:entries.filter(x=>x.triageTier==="higher").length,
 targetedPriority:entries.filter(x=>x.triageTier==="targeted").length,
 deferredOnly:entries.filter(x=>x.triageTier==="deferred").length,
 baseline:entries.filter(x=>x.triageTier==="baseline").length,
 independentLexicalApproved:0,independentEmojiApproved:0,productionVerified:0
};
const result={
 schema:"chromalect.semantic.polysemy-screening-triage.v0.1",
 status:"automated_dictionary_complexity_inventory_not_sense_validation",
 source:{dictionaryBlocks:blocks.map(x=>"dictionary-excerpts-"+x+".json"),
  dictionaryRevision:"63c2569948629323b515833930fdd10f285401b6",
  license:"CC BY-SA 4.0",emojiLedger:"../mandarin-1000-v0.1.json"},
 caveats:[
  "CC-CEDICT's separate readings, English semicolon fragments, and synonyms are not interchangeable with distinct Mandarin senses.",
  "A multiple-reading character does not necessarily need a separate emoji for each reading.",
  "Initial provisional meaning counts do not establish complete sense coverage.",
  "This is a queue for deeper lexical analysis, not an acceptance decision."
 ],
 summary,records:entries
};
assert.equal(summary.charsWithNoEmojiCandidate,119);
assert.equal(summary.charactersAudited,1000);
assert.equal(summary.higherPriority+summary.targetedPriority+
 summary.deferredOnly+summary.baseline,1000);
assert.equal(summary.independentLexicalApproved,0);
const target=path+"polysemy-triage-v0.1.json";
if(process.argv.includes("--check")){
 assert.deepEqual(JSON.parse(fs.readFileSync(target,"utf8")),result);
 console.log("Polysemy triage verified: 1000 records, "+
  summary.charsWithMultipleDictionaryReadings+" multi-reading; "+
  summary.higherPriority+" higher-priority combinations.");
}else{
 fs.writeFileSync(target,JSON.stringify(result,null,2)+"\n");
 console.log("Wrote "+target);
}