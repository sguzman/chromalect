// Six pedagogical Mandarin single-final *candidates*; no IPA or source-speech promotion.
import assert from "node:assert/strict";
import fs from "node:fs";
import {pathToFileURL} from "node:url";
export const deriveSimpleFinals = function deriveSimpleFinals(source,layers,warningIndex){
 if(source.schema!=="chromalect.pronunciation-citations.v0"||source.tranche!=="0001-1000"||source.characters.length!==1000)throw Error("Unexpected source");
 if(layers.schema!=="chromalect.presentation-layers.v0"||warningIndex.schema!=="chromalect.phonetics.mandarin-final-spelling-context-gates.v0.1")throw Error("Versioned source mismatch");
 if(warningIndex.summary.flaggedSourceReadings!==213||warningIndex.summary.flaggedDistinctWrittenTriples!==108||
  warningIndex.summary.independentlyAdjudicatedFinalPhonemes!==0)throw Error("Source warning coverage is not valid");
 const specs=[
  ["a","open","central","unrounded"],["o","mid","back","rounded"],
  ["e","mid","back","unrounded"],["i","close","front","unrounded"],
  ["u","close","back","rounded"],["ü","close","front","rounded"]
 ];
 const simple=new Set(specs.map(x=>x[0]));
 const riskByTriple=new Map();
 for(const item of warningIndex.records)for(const t of item.observedTokenTriples){
  const key=JSON.stringify([t.initial,t.final,t.tone]);
  if(riskByTriple.has(key))throw Error("Source final warnings overlap");
  riskByTriple.set(key,item.id);
 }
 const count=new Map(specs.map(x=>[x[0],0])),atRisk=new Map(specs.map(x=>[x[0],0])),
 samples=new Map(specs.map(x=>[x[0],[]]));
 let readings=0;
 for(let i=0;i<source.characters.length;i++){
  const char=source.characters[i];
  if(char.rank!==i+1)throw Error("Incorrect source rank");
  for(const r of char.readings){
   readings++;
   if(!simple.has(r.final))continue;
   count.set(r.final,count.get(r.final)+1);
   if(riskByTriple.has(JSON.stringify([r.initial,r.final,r.tone])))
    atRisk.set(r.final,atRisk.get(r.final)+1);
   const list=samples.get(r.final);
   if(list.length<3)list.push({rank:char.rank,character:char.character,display:r.display,
    initial:r.initial,final:r.final,tone:r.tone});
  }
 }
 if(readings!==1171||[...count.values()].reduce((a,b)=>a+b,0)!==432||
    [...atRisk.values()].reduce((a,b)=>a+b,0)!==112)
  throw Error("First-tranche simple final source cohort changed");
 const records=specs.map(([token,height,backness,rounding])=>{
  if(!Object.hasOwn(layers.palette_domains.final.tokens,token))throw Error("Missing literal published final token");
  return {token,workingHeight:height,workingBackness:backness,workingRounding:rounding,
   observedSourceCitationReadings:count.get(token),
   sourceSpellingContextCautions:atRisk.get(token),
   firstSourceExamples:samples.get(token),
   articulatoryFeatureStatus:"provisional_pedagogical_candidate_not_independently_adjudicated",
   acceptedAsIPAOrContextualPhone:false};
 });
 if(new Set(records.map(x=>[x.workingHeight,x.workingBackness,x.workingRounding].join("|"))).size!==6)
  throw Error("Working six-final feature code is not injective");
 return {schema:"chromalect.phonetics.mandarin-simple-final-feature-candidates.v0.1",
  status:"six_pedagogical_written_final_feature_hypotheses_not_ipa_or_context_approval",
  source:{citationTranche:"site/pronunciation-citations-0001-1000.json",
    finalSpellingPalette:"site/layers-v0.1.json",
    contextWarnings:"mandarin-final-spelling-context-gates-v0.1.json",
    upstreamBlobSHA:source.source.blob_sha,
    references:[
     {publisher:"Hong Kong Polytechnic University — Mandarin Simple Finals",
      url:"https://www.polyu.edu.hk/bepth/introduction-to-phonetics/simple-finals/?sc_lang=en"},
     {publisher:"The Open University — Chinese 3 Finals",
      url:"https://www.open.edu/openlearn/mod/oucontent/view.php?id=108700&section=1.1"},
     {publisher:"LMU Munich — Mandarin Vowels",
      url:"https://www.phonetik.uni-muenchen.de/studium/skripten/languagedemos/Demos/mandarin.html"}
    ],
    noSoundRecordingsCopied:true,noSourceGlossesCopied:true,
    paletteChanged:false,sourceCharacterStrokesChanged:false},
  limitations:[
   "The six feature tuples are coarse working descriptions from pedagogical vowel categories, not accepted IPA or validated phonemic features.",
   "Context-sensitive written i/u/o realizations are separately flagged and must not inherit the default candidate tuple as an actual measured sound.",
   "Even unflagged source spellings do not establish an independently verified phonetic or lexical interpretation.",
   "This limited six-token vowel study does not cover the other twenty-seven source final remainder spellings."
  ],
  summary:{distinctSimpleFinalLabels:6,allSourceFinalLabels:33,
    sourceCitationReadings:1171,simpleFinalOccurrences:432,
    flaggedSimpleFinalOccurrences:112,unflaggedSimpleFinalOccurrences:320,
    uniqueWorkingFeatureTuples:6,
    independentIPAApprovalCount:0,humanVowelFeatureDecodingTrials:0,learningOutcomeEvidence:0},
  records};
};
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const get=p=>JSON.parse(fs.readFileSync(p,"utf8"));
 const result=JSON.stringify(deriveSimpleFinals(
  get("site/pronunciation-citations-0001-1000.json"),
  get("site/layers-v0.1.json"),
  get("data/phonetics/mandarin-final-spelling-context-gates-v0.1.json")),null,2)+"\n";
 const path="data/phonetics/mandarin-simple-final-feature-candidates-v0.1.json";
 if(process.argv.includes("--check"))assert.equal(fs.readFileSync(path,"utf8"),result);
 else if(process.argv.includes("--write"))fs.writeFileSync(path,result);
 else throw Error("Use --write or --check");
 console.log("Six coarse written-final feature candidates: 432 source uses, 112 exception flags, 0 IPA approvals.");
}