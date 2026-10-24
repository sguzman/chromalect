// Reversible visual feature grammar for Zhao–Li's external 34-unit research model.
// NOT a Pinyin-to-IPA converter, validated phoneme inventory, or human decoding test.
import assert from "node:assert/strict";
import fs from "node:fs";
import {pathToFileURL} from "node:url";
export const schema="chromalect.phonetics.zhao-li-visual-feature-code.v0.1";
const own=(obj,key)=>Object.prototype.hasOwnProperty.call(obj,key);
function fields(value,allowed){
 assert.ok(value!==null&&typeof value==="object"&&!Array.isArray(value));
 assert.deepEqual(Object.keys(value).sort(),[...allowed].sort(),
  "Visual feature tokens require only the declared source properties");
}
function key(v,kind){
 return kind==="vowel"?
  JSON.stringify(["v",v.articulatoryPlace,v.articulatoryHeight,v.rounding]):
  JSON.stringify(["c",v.articulatoryPlace,v.manner,v.voicingAspiration]);
}
const example=(onset,vowels,coda,tone)=>({onset,vowels,coda,tone});
export function createFeatureVisualGrammar(model,tonePalette){
 assert.equal(model.schema,"chromalect.phonetics.zhao-li-2009-source-34-unit-model.v0.1");
 assert.equal(model.status,
  "transcribed_external_34_unit_feature_model_not_adopted_or_independently_phonetically_adjudicated");
 assert.equal(model.representation.template,"CVVVCT");
 assert.equal(model.representation.inventoryStatus,"external_proposal_not_project_frozen");
 assert.equal(model.phonologicalUnits.length,34);
 assert.equal(model.summary.distinctModelSymbols,34);
 assert.equal(model.summary.sourceVowelUnits,12);
 assert.equal(model.summary.sourceConsonantUnits,22);
 assert.equal(model.summary.acceptedProjectPhonemeContrasts,0);
 assert.equal(model.summary.independentlyVerifiedRealizations,0);
 assert.equal(model.summary.permittedAutomaticPinyinToIPAAssignments,0);
 assert.equal(model.summary.learnerStudies,0);
 assert.equal(tonePalette.schema,"chromalect.presentation-layers.v0");
 const tones=tonePalette.palette_domains.tone.symbols;
 assert.deepEqual(tones,{"0":"·","1":"—","2":"↗","3":"⌄","4":"↘"});
 const byToken=new Map(),byKey=new Map();
 for(const item of model.phonologicalUnits){
  assert.ok(["vowel","consonant"].includes(item.segmentClass));
  assert.equal(item.sourceInventoried,true);
  assert.equal(item.independentlyAcousticallyVerifiedByChromalect,false);
  assert.ok(typeof item.sourceToken==="string"&&item.sourceToken.length>0);
  const tokenKey=key(item,item.segmentClass);
  assert.ok(!byToken.has(item.sourceToken),"Duplicate model unit token");
  assert.ok(!byKey.has(tokenKey),"Feature collision among source model units");
  byToken.set(item.sourceToken,item);
  byKey.set(tokenKey,item.sourceToken);
 }
 assert.equal(byToken.size,34);
 assert.equal(byKey.size,34);
 assert.equal([...byToken.values()].filter(x=>x.segmentClass==="vowel").length,12);
 const onsets=[...byToken.values()].filter(x=>
  x.segmentClass==="consonant"&&x.sourceToken!=="N").map(x=>x.sourceToken);
 assert.equal(onsets.length,21);
 const codas=["n","N"];
 for(const c of codas){
  const unit=byToken.get(c);
  assert.equal(unit.segmentClass,"consonant");
  assert.equal(unit.manner,"nasal");
 }
 function sourceInput(input){
  fields(input,["onset","vowels","coda","tone"]);
  assert.ok(input.onset===null||onsets.includes(input.onset),
   "Onset must be one of 21 externally modeled consonants or null");
  assert.ok(Array.isArray(input.vowels));
  assert.ok(input.vowels.length>=1&&input.vowels.length<=3);
  assert.ok(input.vowels.every(token=>byToken.get(token)?.segmentClass==="vowel"),
   "Vowel slots require 1–3 published vowel model tokens");
  assert.ok(input.coda===null||codas.includes(input.coda),
   "Coda restricted to externally modeled n or N");
  assert.ok(Number.isInteger(input.tone)&&input.tone>=0&&input.tone<=4,
   "Tone category requires one source tone symbol");
 }
 function encode(input){
  sourceInput(input);
  const codedUnit=token=>{
   if(token===null)return null;
   const r=byToken.get(token);
   return r.segmentClass==="vowel"?
    {segmentClass:"vowel",place:r.articulatoryPlace,
     height:r.articulatoryHeight,rounding:r.rounding}:
    {segmentClass:"consonant",place:r.articulatoryPlace,
     manner:r.manner,voicingAspiration:r.voicingAspiration};
  };
  return {schema,sourceModel:"zhao_li_2009_34_unit_CVVVCT",
   onset:codedUnit(input.onset),
   vowels:input.vowels.map(codedUnit),
   coda:codedUnit(input.coda),
   tone:{kind:"citation_category",symbol:tones[String(input.tone)]}};
 }
 function decode(encoded){
  fields(encoded,["schema","sourceModel","onset","vowels","coda","tone"]);
  assert.equal(encoded.schema,schema);
  assert.equal(encoded.sourceModel,"zhao_li_2009_34_unit_CVVVCT");
  function read(item,expected){
   if(item===null)return null;
   assert.ok(typeof item==="object"&&!Array.isArray(item));
   if(expected==="vowel"){
    fields(item,["segmentClass","place","height","rounding"]);
    assert.equal(item.segmentClass,"vowel");
    const token=byKey.get(JSON.stringify(["v",item.place,item.height,item.rounding]));
    assert.ok(token!==undefined,"Unknown published vowel feature combination");
    return token;
   }
   fields(item,["segmentClass","place","manner","voicingAspiration"]);
   assert.equal(item.segmentClass,"consonant");
   const token=byKey.get(JSON.stringify(["c",item.place,item.manner,item.voicingAspiration]));
   assert.ok(token!==undefined,"Unknown published consonant feature combination");
   return token;
  }
  const onset=read(encoded.onset,"consonant");
  assert.ok(onset===null||onsets.includes(onset),"Invalid model onset");
  assert.ok(Array.isArray(encoded.vowels)&&encoded.vowels.length>=1&&
   encoded.vowels.length<=3,"Invalid CVVVCT vowel occupancy");
  const vowels=encoded.vowels.map(v=>read(v,"vowel"));
  const coda=read(encoded.coda,"consonant");
  assert.ok(coda===null||codas.includes(coda),"Invalid model coda");
  fields(encoded.tone,["kind","symbol"]);
  assert.equal(encoded.tone.kind,"citation_category");
  const tone=Object.keys(tones).find(x=>tones[x]===encoded.tone.symbol);
  assert.ok(tone!==undefined,"Invalid independent source tone contour");
  return example(onset,vowels,coda,Number(tone));
 }
 return {encode,decode,sourceUnitCount:byToken.size,onsetCount:onsets.length,
  vowelCount:12,codaTokens:codas,modelUnits:[...byToken.keys()]};
}
export function audit(model,palette){
 const grammar=createFeatureVisualGrammar(model,palette);
 let isolatedUnits=0,roundTrips=0;
 for(const token of grammar.modelUnits){
  const candidate=token==="n"||token==="N"?
   example(null,["a"],token,2):
   model.phonologicalUnits.find(x=>x.sourceToken===token)?.segmentClass==="vowel"?
    example(null,[token],null,1):
    example(token,["a"],null,1);
  const wire=JSON.parse(JSON.stringify(grammar.encode(candidate)));
  assert.deepEqual(grammar.decode(wire),candidate);
  isolatedUnits++;
 }
 const exampleInputs=[
  example("m",["a"],null,1),
  example("m",["a"],null,3),
  example("p",["a"],null,1),
  example("P",["a"],null,1),
  example("n",["i"],null,3),
  example(null,["i","a"],"n",4),
  example("q",["i","o","u"],"N",2),
  example("s",["~"],null,1),
  example("S",["^"],null,1)
 ];
 for(const candidate of exampleInputs){
  assert.deepEqual(grammar.decode(JSON.parse(JSON.stringify(grammar.encode(candidate)))),candidate);
  roundTrips++;
 }
 const evidence={
  schema:"chromalect.phonetics.zhao-li-model-visual-grammar-audit.v0.1",
  status:"machine_reversible_external_phonological_model_features_not_verified_speech_or_human_reading",
  source:{model:"data/phonetics/zhao-li-2009-34-unit-reference-model-v0.1.json",
   tonePalette:"site/layers-v0.1.json",
   paperDOI:"10.3758/BRM.41.2.575",
   actualCitationPronunciationCorpusMapped:false,
   projectPaletteModified:false,sourceGlyphGeometryModified:false},
  grammar:{sourceSlots:"CVVVCT",onset:"0 or 1 of 21 source modeled consonant initials",
   vowel:"1 to 3 ordered source modeled vowel feature tuples",
   coda:"none, n or N, reconstructed from nasal features",
   tone:"five distinct original citation tone symbols",
   soundModelTokensPersistInEncodedCode:false,
   sourceSpellingRequiredForDecoding:false,
   caseSensitiveOriginalSourceUnits:true,
   unknownFeatureCombinationsRejected:true,
   realWorldSyllablePhonotacticsVerified:false},
  counts:{totalModelUnits:34,sourceVowelUnits:12,sourceConsonantUnits:22,
   verifiedOnsetCodes:21,codaNasalCategories:2,
   unitIsolationMachineRoundTrips:isolatedUnits,
   modelSequenceDemonstrationRoundTrips:roundTrips,
   featureCodeCollisions:0,machineRoundTripFailures:0,
   firstTrancheContextualIPARealizations:0,
   independentlyCertifiedPhonemeMappings:0,
   humanVisualSymbolDecodingResults:0,
   learningOutcomeMeasurements:0},
  samples:exampleInputs.map(input=>({
   originalModelSequence:input,decodedByFeatures:grammar.decode(grammar.encode(input)),
   originalTokenLettersNotStoredInsideVisualUnits:true,
   corpusAttestationClaimed:false
  }))
 };
 return evidence;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const get=p=>JSON.parse(fs.readFileSync(p,"utf8"));
 const expected=JSON.stringify(audit(
  get("data/phonetics/zhao-li-2009-34-unit-reference-model-v0.1.json"),
  get("site/layers-v0.1.json")),null,2)+"\n";
 const target="data/phonetics/zhao-li-visual-feature-grammar-audit-v0.1.json";
 if(process.argv.includes("--write"))fs.writeFileSync(target,expected);
 else if(process.argv.includes("--check"))assert.equal(fs.readFileSync(target,"utf8"),expected);
 else throw Error("Use --check or --write");
 console.log("Source-model feature grammar: 34/34 segment units machine-reversible, CVVVCT slots, zero phonological approvals.");
}
