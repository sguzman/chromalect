// Reproducible contrast-control candidates from source citation labels.
// Source-orthographic matches are not validated spoken minimal pairs.
import assert from "node:assert/strict";
import fs from "node:fs";
import {pathToFileURL} from "node:url";
export const buildContrastIndex = function buildContrastIndex(citations){
 const ensure=(condition,message)=>{if(!condition)throw Error(message)};
 ensure(citations.schema==="chromalect.pronunciation-citations.v0"&&citations.tranche==="0001-1000"&&citations.characters.length===1000,"Unexpected citation source");
 const byTriple=new Map();
 for(let i=0;i<citations.characters.length;i++){
  const item=citations.characters[i];
  ensure(item.rank===i+1&&Array.isArray(item.readings),"Source rank or reading malformed");
  for(const r of item.readings){
   ensure(typeof r.initial==="string"&&typeof r.final==="string"&&Number.isInteger(r.tone)&&r.tone>=0&&r.tone<=4&&typeof r.display==="string","Missing written citation labels");
   const key=JSON.stringify([r.initial,r.final,r.tone]);
   if(!byTriple.has(key))byTriple.set(key,{rank:item.rank,character:item.character,display:r.display,
    initial:r.initial,final:r.final,tone:r.tone});
  }
 }
 ensure(byTriple.size===673,"Observed source syllable count drift");
 const all=[...byTriple.values()],records=[],groups=new Map();
 const add=(type,left,right,qualifier)=>{
  const record={id:type+"-"+String(records.length+1).padStart(4,"0"),type,left,right,
   qualifier,independentPhonemicContrastVerified:false,
   contextualPronunciationVerified:false,
   contrastLearningEffectMeasured:false};
  records.push(record);
 };
 for(const r of all){
  const k=JSON.stringify([r.initial,r.final]);
  if(!groups.has(k))groups.set(k,[]);
  groups.get(k).push(r);
 }
 for(const group of groups.values()){
  group.sort((a,b)=>a.tone-b.tone);
  for(let i=0;i<group.length;i++)for(let j=i+1;j<group.length;j++)
   add("tone_label",group[i],group[j],"same source written initial and final; listed citation tone labels differ");
 }
 const aspiration=[["b","p"],["d","t"],["g","k"],["j","q"],["zh","ch"],["z","c"]];
 const aspirationsByPair={};
 for(const [a,b] of aspiration){
  let matches=0;
  for(const r of all.filter(x=>x.initial===a)){
   const other=byTriple.get(JSON.stringify([b,r.final,r.tone]));
   if(other){
    add("working_aspiration_pair",r,other,"same written final and source tone; initial spelling pair is a provisional aspiration contrast");
    matches++;
   }
  }
  aspirationsByPair[a+"/"+b]=matches;
 }
 const byInitialTone=new Map();
 for(const r of all){
  const k=JSON.stringify([r.initial,r.tone]);
  if(!byInitialTone.has(k))byInitialTone.set(k,[]);
  byInitialTone.get(k).push(r);
 }
 const editOne=(a,b)=>{
  const left=[...a],right=[...b];
  return left.length===right.length&&left.filter((c,i)=>c!==right[i]).length===1;
 };
 for(const group of byInitialTone.values()){
  let winner=null,best=Infinity;
  for(let i=0;i<group.length;i++)for(let j=i+1;j<group.length;j++){
   const a=group[i],b=group[j];
   if(!editOne(a.final,b.final))continue;
   const score=a.rank+b.rank;
   if(score<best||score===best&&(!winner||a.rank<winner[0].rank||
      a.rank===winner[0].rank&&b.rank<winner[1].rank)){winner=[a,b];best=score;}
  }
  if(winner)add("one_letter_written_final",winner[0],winner[1],
   "same written initial and citation tone; final spellings differ by one Unicode code point, not necessarily one phoneme");
 }
 const counts={
  tone_label:records.filter(r=>r.type==="tone_label").length,
  working_aspiration_pair:records.filter(r=>r.type==="working_aspiration_pair").length,
  one_letter_written_final:records.filter(r=>r.type==="one_letter_written_final").length
 };
 ensure(counts.tone_label===533&&counts.working_aspiration_pair===89&&counts.one_letter_written_final===88,
  "Source-contrast control counts changed");
 ensure(records.length===710&&new Set(records.map(r=>r.id)).size===710,"Contrast record collision");
 return {
  schema:"chromalect.phonetics.citation-orthographic-contrast-controls.v0.1",
  status:"source_attested_written_token_experiment_candidates_not_confirmed_phonetic_minimal_pairs",
  source:{tranche:"site/pronunciation-citations-0001-1000.json",
   upstreamRepository:citations.source.repository,upstreamBlobSHA:citations.source.blob_sha,
   upstreamLicense:citations.source.license,sourceTextIsOnlyListedCitationReadings:true,
   externalPronunciationVerification:false},
  interpretation:{
   tone_label:"Same initial/final written tokens; different original source citation tone labels.",
   working_aspiration_pair:"Same written final and citation tone; one of six conventional Pinyin aspiration-pair spellings.",
   one_letter_written_final:"Single Unicode codepoint difference in written final, with same written initial and tone; not automatically a single sound contrast.",
   selectedFinalPairRule:"At most one lowest-rank-sum written final contrast per observed initial/tone group.",
   candidatePairsAreValidatedSpokenMinimalPairs:false,
   independentLearningOutcomeClaims:false
  },
  summary:{sourceCitationCharacters:1000,sourceCitationReadings:1171,distinctAttestedTriples:673,
   candidatePairs:records.length,byType:counts,aspirationPairCoverage:aspirationsByPair,
   independentlyVerifiedPhoneticPairs:0,
   approvedContextualPronunciationComparisons:0,
   humanListeningOrDecodingTrials:0},
  records
 };
};
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const source=JSON.parse(fs.readFileSync("site/pronunciation-citations-0001-1000.json","utf8"));
 const result=JSON.stringify(buildContrastIndex(source),null,2)+"\n";
 const target="data/phonetics/citation-orthographic-contrast-controls-v0.1.json";
 if(process.argv.includes("--check"))assert.equal(fs.readFileSync(target,"utf8"),result);
 else if(process.argv.includes("--write"))fs.writeFileSync(target,result);
 else throw Error("Use --check or --write");
 console.log("Source spelling contrast research: 533 tone-label pairs, 89 aspiration-category pairs, 88 one-letter final pairs; zero phonetic approvals.");
}