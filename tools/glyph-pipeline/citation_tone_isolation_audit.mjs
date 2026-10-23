// Independent citation-tone source/count isolation, without initial/final phonetic assignment.
import assert from "node:assert/strict";
import fs from "node:fs";
import {pathToFileURL} from "node:url";
export const deriveCitationToneIsolation = function deriveCitationToneIsolation(citations,reference,colors){
 if(citations.schema!=="chromalect.pronunciation-citations.v0"||citations.tranche!=="0001-1000"||
   citations.characters.length!==1000||reference.schema!=="chromalect.phonetics.mandarin-citation-tone-contours.v0.1"||
   reference.status!=="idealized_pedagogical_citation_pitch_contours_not_acoustic_or_contextual_measurements"||
   reference.scope.sourceAlignedCitationReadings!==1171||
   colors.schema!=="chromalect.presentation-layers.v0"||
   Object.values(reference.evidence).some(x=>x!==0))
  throw Error("First-tranche citation tone source or review status changed");
 const counts=Object.fromEntries(["0","1","2","3","4"].map(x=>[x,0]));
 const examples={};
 let total=0;
 for(let i=0;i<citations.characters.length;i++){
  const c=citations.characters[i];
  if(c.rank!==i+1)throw Error("Citation ranking changed");
  for(const reading of c.readings){
   const k=String(reading.tone);
   if(!(k in counts)||!Object.hasOwn(colors.palette_domains.tone.tokens,k))
    throw Error("Unknown original source tone label");
   counts[k]++;total++;
   if(!examples[k])examples[k]={rank:c.rank,character:c.character,display:reading.display};
  }
 }
 const contours=new Set();
 if(reference.tones.length!==5||total!==1171)throw Error("Expected five source tone labels");
 const records=reference.tones.map((t,i)=>{
  const k=String(i);
  if(t.token!==k||colors.palette_domains.tone.symbols[k]!==t.symbol||
     !examples[k]||!t.firstSourceExample||
     (i===0&&t.levels!==null))
   throw Error("Tone reference and source do not match");
  const src=citations.characters[t.firstSourceExample.rank-1];
  if(src?.character!==t.firstSourceExample.character||
     !src.readings.some(r=>r.tone===i&&r.display===t.firstSourceExample.pinyin))
   throw Error("Tone exemplar is not in original pinned source");
  if(i>0){
   if(!Array.isArray(t.levels)||t.levels.length<2||!t.levels.every(x=>Number.isInteger(x)&&x>=1&&x<=5))
    throw Error("Malformed idealized Chao pitch levels");
   const sig=t.levels.join(",");
   if(contours.has(sig))throw Error("Duplicated idealized pitch shape");
   contours.add(sig);
  }
  return {token:k,name:t.name,sourceCitationOccurrences:counts[k],
   idealizedLevels:t.levels,citationToneSymbol:t.symbol,
   firstSourceExample:examples[k],
   independentlyAcousticallyCalibrated:false,
   contextualSandhiApproved:false,
   humanPerceptionAccuracy:null};
 });
 if(contours.size!==4||records.reduce((n,x)=>n+x.sourceCitationOccurrences,0)!==1171)
  throw Error("Unverified source tone inventory");
 return {schema:"chromalect.phonetics.citation-tone-isolation-audit.v0.1",
   status:"source_citation_labels_and_distinct_idealized_pitches_not_automatic_perceptual_or_contextual_validation",
   sources:{citationTranche:"site/pronunciation-citations-0001-1000.json",
    sourceBlobSHA:citations.source.blob_sha,
    toneControl:"mandarin-citation-tone-contours-v0.1.json",
    referencePalette:"site/layers-v0.1.json",
    originalInitialsAndFinalsUnchanged:true,sourceColorsUnchanged:true},
   separation:{
    tonalChannelUsesOnlySourceToneLabel:true,
    noInitialFeatureClassificationRequired:true,
    noFinalFeatureClassificationRequired:true,
    neutralToneHasNoFixedContextFreeContour:true,
    ChaoScaleIsRelativeNotHertz:true,
    pairwiseDistinctIdealizedFourNonNeutralContours:contours.size===4,
    supportsHumanAcousticEquivalenceClaims:false},
   summary:{sourceCitationCharacters:1000,sourceCitationReadings:1171,
    toneCategories:5,relativeContourSequences:4,undefinedNeutralContourCategories:1,
    sourceToneCounts:counts,
    machineDistinctContourShapes:4,
    independentPhoneticToneCertifications:0,contextualToneApprovals:0,
    humanToneDiscriminationTrials:0,learningStudyEvidence:0},
   records};
};
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const get=p=>JSON.parse(fs.readFileSync(p,"utf8"));
 const data=JSON.stringify(deriveCitationToneIsolation(
  get("site/pronunciation-citations-0001-1000.json"),
  get("data/phonetics/mandarin-citation-tone-contours-v0.1.json"),
  get("site/layers-v0.1.json")),null,2)+"\n";
 const dest="data/phonetics/citation-tone-isolation-audit-v0.1.json";
 if(process.argv.includes("--write"))fs.writeFileSync(dest,data);
 else if(process.argv.includes("--check"))assert.equal(fs.readFileSync(dest,"utf8"),data);
 else throw Error("Use --check or --write");
 console.log("Tone source isolation: 1,171 labels across T0–T4; four distinct idealized contours; neutral has no fixed contour; zero acoustic approvals.");
}