// Source-ranked review queue for unadjudicated Mandarin *written* final remainders.
import assert from "node:assert/strict";
import fs from "node:fs";
import {pathToFileURL} from "node:url";
export const deriveUnadjudicatedFinalWorkqueue = function deriveUnadjudicatedFinalWorkqueue(source,simple,risks,letters){
 if(source.schema!=="chromalect.pronunciation-citations.v0"||source.tranche!=="0001-1000"||source.characters.length!==1000||
    simple.summary.simpleFinalOccurrences!==432||risks.summary.flaggedSourceReadings!==213||
    letters.summary.machineSourceSpellingRoundtrips!==1171||
    simple.source.upstreamBlobSHA!==source.source.blob_sha||
    risks.source.upstreamBlobSHA!==source.source.blob_sha||
    letters.source.upstreamBlobSHA!==source.source.blob_sha)
  throw Error("First-tranche source provenance or counts differ");
 const base=new Set(simple.records.map(x=>x.token));
 const full=new Map(letters.records.map(x=>[x.token,x]));
 if(base.size!==6||full.size!==33)throw Error("Wrong observed final inventory");
 const warningByTriple=new Map();
 for(const cohort of risks.records)for(const r of cohort.observedTokenTriples){
   const k=JSON.stringify([r.initial,r.final,r.tone]);
   if(warningByTriple.has(k))throw Error("Overlapping source warnings");
   warningByTriple.set(k,cohort.id);
 }
 const tally=new Map([...full.keys()].filter(x=>!base.has(x)).map(x=>
  [x,{token:x,sourceCitationUses:0,explicitContextCautionUses:0,
   warningFamilies:new Set(),firstSourceExamples:[]}]));
 let total=0, flagged=0;
 for(let i=0;i<source.characters.length;i++){
  const c=source.characters[i];
  if(c.rank!==i+1)throw Error("Unexpected source character rank");
  for(const reading of c.readings){
   total++;
   if(base.has(reading.final))continue;
   const row=tally.get(reading.final);
   if(!row)throw Error("Unregistered non-simple written final");
   row.sourceCitationUses++;
   const caution=warningByTriple.get(JSON.stringify([reading.initial,reading.final,reading.tone]));
   if(caution){row.explicitContextCautionUses++;row.warningFamilies.add(caution);flagged++;}
   if(row.firstSourceExamples.length<4)row.firstSourceExamples.push({
     rank:c.rank,character:c.character,pinyin:reading.display,
     initial:reading.initial,final:reading.final,tone:reading.tone,
     sourceWarning:caution??null});
  }
 }
 if(total!==1171||tally.size!==27||flagged!==101||
    [...tally.values()].reduce((n,x)=>n+x.sourceCitationUses,0)!==739)
   throw Error("Deferred final cohort count mismatch");
 const rows=[...tally.values()].sort((a,b)=>
  Number(b.explicitContextCautionUses>0)-Number(a.explicitContextCautionUses>0)||
  b.sourceCitationUses-a.sourceCitationUses||
  a.token.localeCompare(b.token,"en")).map((r,i)=>({
  reviewRank:i+1,token:r.token,sourceCitationUses:r.sourceCitationUses,
  explicitContextCautionUses:r.explicitContextCautionUses,
  observedWarningFamilies:[...r.warningFamilies].sort(),
  firstSourceExamples:r.firstSourceExamples,
  phonologicalSegmentation:"not_adjudicated",
  proposedIPAForm:null,
  independenceOfContrast:"unreviewed",
  humanDecodingResults:0,
  machineOnlyWrittenCodeAvailable:true
 }));
 return {schema:"chromalect.phonetics.unadjudicated-compound-final-review-queue.v0.1",
  status:"research_triage_only_no_proposed_ipa_segmentations_or_accepted_phonemes",
  sources:{firstThousandCitationReadings:"site/pronunciation-citations-0001-1000.json",
   sourceBlobSHA:source.source.blob_sha,
   provisionalSixSimpleFinals:"mandarin-simple-final-feature-candidates-v0.1.json",
   cautionIndex:"mandarin-final-spelling-context-gates-v0.1.json",
   arbitraryLetterControls:"written-final-symbol-control-v0.1.json",
   sourcePaletteChanged:false,
   outputDoesNotContainSentenceText:true,
   noVerifiedContextualPronunciations:true},
  method:"Prioritize spellings with a listed context caution, then order by descending observed source citation use, breaking ties by written token. This is review logistics, not phonetic importance.",
  limitations:[
   "All final spellings are literal Pinyin remainder tokens, not proven spoken rhyme/phoneme units.",
   "Source reading counts are usage within the pinned first 1,000 character citation tranche, not general Mandarin frequencies.",
   "The nine caution categories do not exhaust all possible contextual variants.",
   "No phonological features or IPA transcription are assigned by this queue."],
  summary:{sourceCharacters:1000,totalSourceCitationReadings:1171,
   compoundWrittenFinalCategories:27,compoundFinalSourceUses:739,
   contextCautionedCompoundUses:flagged,
   nonCautionedCompoundUses:739-flagged,
   independentFinalPhonologicalApprovals:0,
   approvedContextualPronunciations:0,
   humanDecodingTrials:0},
  records:rows};
};
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const get=p=>JSON.parse(fs.readFileSync(p,"utf8"));
 const text=JSON.stringify(deriveUnadjudicatedFinalWorkqueue(
  get("site/pronunciation-citations-0001-1000.json"),
  get("data/phonetics/mandarin-simple-final-feature-candidates-v0.1.json"),
  get("data/phonetics/mandarin-final-spelling-context-gates-v0.1.json"),
  get("data/phonetics/written-final-symbol-control-v0.1.json")),null,2)+"\n";
 const path="data/phonetics/unadjudicated-compound-final-review-queue-v0.1.json";
 if(process.argv.includes("--check"))assert.equal(fs.readFileSync(path,"utf8"),text);
 else if(process.argv.includes("--write"))fs.writeFileSync(path,text);
 else throw Error("Use --check or --write");
 console.log("Compound final research queue: 27 written forms, 739 source occurrences, 101 context cautions, zero sound approvals.");
}