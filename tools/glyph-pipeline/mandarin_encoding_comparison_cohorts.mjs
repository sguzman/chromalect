// Deterministic visual-experiment cohorts. Never treat a source feature as approved phonetic data.
import assert from "node:assert/strict";
import fs from "node:fs";
import {pathToFileURL} from "node:url";
export const buildEncodingCohorts = function buildEncodingCohorts(source,simple,warning,letterCodes){
 if(source.schema!=="chromalect.pronunciation-citations.v0"||source.tranche!=="0001-1000"||
    source.characters.length!==1000||simple.summary.simpleFinalOccurrences!==432||
    warning.summary.flaggedSourceReadings!==213||
    letterCodes.summary.machineSourceSpellingRoundtrips!==1171||
    simple.source.upstreamBlobSHA!==source.source.blob_sha||
    warning.source.upstreamBlobSHA!==source.source.blob_sha||
    letterCodes.source.upstreamBlobSHA!==source.source.blob_sha)throw Error("Unpinned source evidence");
 const candidates=new Map(simple.records.map(r=>[r.token,r]));
 const ids=new Map(letterCodes.records.map(r=>[r.token,r]));
 const caution=new Set();
 for(const item of warning.records)for(const t of item.observedTokenTriples){
   const key=JSON.stringify([t.initial,t.final,t.tone]);
   if(caution.has(key))throw Error("Duplicate caution label");
   caution.add(key);
 }
 if(caution.size!==108||candidates.size!==6||ids.size!==33)throw Error("Source codebook mismatch");
 const states=[
  {key:"working_candidate_without_listed_context_flag",description:"Simple-final candidate exists; no listed context flag, but its phonetic interpretation remains unapproved."},
  {key:"working_candidate_withheld_context_warning",description:"Simple-final candidate exists but this spelling-context occurrence is explicitly flagged; withhold the vowel-feature marker."},
  {key:"no_simple_final_feature_candidate",description:"Written remainder is one of the other 27 tokens; no vowel-feature assignment is proposed."}
 ];
 const counts=new Map(states.map(x=>[x.key,0]));
 const samples=new Map(states.map(x=>[x.key,[]]));
 const finals=new Map();
 let seen=0;
 for(let i=0;i<source.characters.length;i++){
  const c=source.characters[i];
  if(c.rank!==i+1)throw Error("First-tranche rank mismatch");
  for(const r of c.readings){
   seen++;
   if(!ids.has(r.final)||ids.get(r.final).machineSpellingRoundtrip!==true)throw Error("No reversible letter code for a source reading");
   const has=candidates.has(r.final),warn=caution.has(JSON.stringify([r.initial,r.final,r.tone]));
   const state=!has?"no_simple_final_feature_candidate":
    warn?"working_candidate_withheld_context_warning":"working_candidate_without_listed_context_flag";
   counts.set(state,counts.get(state)+1);
   if(samples.get(state).length<4)samples.get(state).push({rank:c.rank,character:c.character,display:r.display,initial:r.initial,final:r.final,tone:r.tone});
   const tally=finals.get(r.final)??{total:0,unflagged:0,flagged:0,featureCandidate:has};
   tally.total++;tally[warn?"flagged":"unflagged"]++;
   finals.set(r.final,tally);
  }
 }
 if(seen!==1171||counts.get(states[0].key)!==320||counts.get(states[1].key)!==112||
    counts.get(states[2].key)!==739||
    [...finals.values()].filter(x=>x.featureCandidate).length!==6)throw Error("Source reading partitions changed");
 return {
  schema:"chromalect.phonetics.mandarin-encoding-comparison-cohorts.v0.1",
  status:"source_attested_visual_research_cohorts_not_approved_sound_encoding_or_learning",
  sources:{citations:"site/pronunciation-citations-0001-1000.json",
   sourceBlobSHA:source.source.blob_sha,
   workingSimpleFinals:"mandarin-simple-final-feature-candidates-v0.1.json",
   spellingCautions:"mandarin-final-spelling-context-gates-v0.1.json",
   arbitrarySpellingShapes:"written-final-symbol-control-v0.1.json",
   componentPaletteChanged:false,citationSpellingChanged:false,glyphStrokesChanged:false},
  summary:{sourceCharacters:1000,citationReadings:seen,distinctWrittenFinals:33,
   letterCodeBaselineReadings:seen,workingSimpleFinalSpellingReadings:432,
   unflaggedWorkingFeatureCandidates:320,withheldWorkingFeatureCandidates:112,
   noWorkingVowelFeatureCandidate:739,
   totalCautionFlaggedReadings:213,
   independentlyVerifiedSpokenDecodings:0,humanSymbolDecodingTrials:0,measuredLearningBenefits:0},
  limitations:["Unflagged feature candidates remain unapproved phonetic hypotheses.","Additional contextual caution categories may exist outside the flagged 213 source readings.","A comparison interface is not evidence of human comprehension.","The orthographic arbitrary-letter control is not an IPA or phoneme encoder."],
  states:states.map(x=>({...x,sourceReadingCount:counts.get(x.key),earliestSourceExamples:samples.get(x.key)})),
  writtenFinalTally:[...finals].sort(([a],[b])=>a.localeCompare(b,"en")).map(([token,tally])=>({token,...tally}))
 };
};
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const get=p=>JSON.parse(fs.readFileSync(p,"utf8"));
 const result=JSON.stringify(buildEncodingCohorts(
  get("site/pronunciation-citations-0001-1000.json"),
  get("data/phonetics/mandarin-simple-final-feature-candidates-v0.1.json"),
  get("data/phonetics/mandarin-final-spelling-context-gates-v0.1.json"),
  get("data/phonetics/written-final-symbol-control-v0.1.json")),null,2)+"\n";
 const out="data/phonetics/mandarin-encoding-comparison-cohorts-v0.1.json";
 if(process.argv.includes("--check"))assert.equal(fs.readFileSync(out,"utf8"),result);
 else if(process.argv.includes("--write"))fs.writeFileSync(out,result);
 else throw Error("Use --write or --check");
 console.log("Citation visual comparisons: 320 working-feature candidates; 112 withheld; 739 without feature proposals; no speech approvals.");
}