// Check transcription boundaries of Zhao & Li's published 34-unit research model.
// This freezes the SOURCE RECORD, not the project's phonemic analysis.
import assert from "node:assert/strict";
import fs from "node:fs";
import {pathToFileURL} from "node:url";
const path="data/phonetics/zhao-li-2009-34-unit-reference-model-v0.1.json";
const names={
 A:"ɑ",a:"a",E:"ɛ",e:"e",o:"o",Y:"ɤ","@":"ə",
 u:"u",y:"y",i:"i","~":"ɿ","^":"ʅ",
 t:"t",T:"tʰ",p:"p",P:"pʰ",k:"k",K:"kʰ",
 n:"n",m:"m",N:"ŋ",l:"l",s:"s",f:"f",X:"ɕ",
 r:"ʐ",S:"ʂ",x:"x",z:"ts",c:"tsʰ",
 j:"tɕ",q:"tɕʰ",Z:"tʂ",C:"tʂʰ"
};
const expectedSourceVowels=new Map([
 ["A","back|low|unrounded"],["a","central|low|unrounded"],
 ["E","front|mid-low|unrounded"],["e","front|mid|unrounded"],
 ["o","back|mid-high|rounded"],["Y","back|mid-high|unrounded"],
 ["@","central|mid-high|unrounded"],["u","back|high|rounded"],
 ["y","front|high|rounded"],["i","front|high|unrounded"],
 ["~","tip-front|high|unrounded"],["^","tip-back|high|unrounded"]
]);
const expectedConsonants=new Map([
 ["t","alveolar|stop|voiceless"],["T","alveolar|stop|voiceless_aspirated"],
 ["p","bilabial|stop|voiceless"],["P","bilabial|stop|voiceless_aspirated"],
 ["k","velar|stop|voiceless"],["K","velar|stop|voiceless_aspirated"],
 ["n","alveolar|nasal|voiced"],["m","bilabial|nasal|voiced"],
 ["N","velar|nasal|voiced"],["l","alveolar|lateral|voiced"],
 ["s","alveolar|fricative|voiceless"],["f","labiodental|fricative|voiceless"],
 ["X","palatoalveolar|fricative|voiceless"],["r","retroflex|fricative|voiced"],
 ["S","retroflex|fricative|voiceless"],["x","velar|fricative|voiceless"],
 ["z","alveolar|affricate|voiceless"],["c","alveolar|affricate|voiceless_aspirated"],
 ["j","palatoalveolar|affricate|voiceless"],
 ["q","palatoalveolar|affricate|voiceless_aspirated"],
 ["Z","retroflex|affricate|voiceless"],
 ["C","retroflex|affricate|voiceless_aspirated"]
]);
export function validate34(source,external,working){
 assert.equal(source.schema,"chromalect.phonetics.zhao-li-2009-source-34-unit-model.v0.1");
 assert.equal(source.status,
  "transcribed_external_34_unit_feature_model_not_adopted_or_independently_phonetically_adjudicated");
 assert.equal(source.source.doi,"10.3758/BRM.41.2.575");
 assert.deepEqual(source.source.authors,["Xiaowei Zhao","Ping Li"]);
 assert.equal(source.source.originalPDF,
  "https://link.springer.com/content/pdf/10.3758/BRM.41.2.575.pdf");
 assert.equal(source.source.tableOrFiguresReproduced,false);
 assert.equal(source.representation.template,"CVVVCT");
 assert.equal(source.representation.inventoryStatus,"external_proposal_not_project_frozen");
 assert.equal(source.representation.modelUnits,34);
 assert.equal(source.representation.modelVowelUnits,12);
 assert.equal(source.representation.modelConsonantUnits,22);
 assert.deepEqual(source.representation.nonstandardSourceApicals,["~","^"]);
 assert.equal(source.representation.standardIPAForAllUnits,false);
 assert.equal(external.schema,"chromalect.phonetics.zhao-li-2009-independent-pinyin-ipa-control.v0.1");
 assert.equal(external.summary.literalWorkingCandidateMatches,18);
 assert.equal(working.schema,"chromalect.phonetics.mandarin-initial-feature-candidates.v0.1");
 assert.equal(working.statistics.independentlyVerifiedPhonemicContrasts,0);
 const record=new Map();
 assert.equal(Object.keys(names).length,34);
 assert.equal(expectedSourceVowels.size,12);
 assert.equal(expectedConsonants.size,22);
 assert.equal(source.phonologicalUnits.length,34);
 for(const unit of source.phonologicalUnits){
  assert.ok(Object.hasOwn(names,unit.sourceToken));
  assert.ok(!record.has(unit.sourceToken),"Duplicated model unit");
  record.set(unit.sourceToken,unit);
  assert.equal(unit.notation,names[unit.sourceToken]);
  assert.equal(unit.sourceInventoried,true);
  assert.equal(unit.independentlyAcousticallyVerifiedByChromalect,false);
  if(expectedSourceVowels.has(unit.sourceToken)){
   assert.equal(unit.segmentClass,"vowel");
   assert.equal([unit.articulatoryPlace,unit.articulatoryHeight,unit.rounding].join("|"),
    expectedSourceVowels.get(unit.sourceToken));
   assert.equal(unit.standardIPA,!["~","^"].includes(unit.sourceToken));
  }else{
   assert.equal(unit.segmentClass,"consonant");
   assert.equal([unit.articulatoryPlace,unit.manner,unit.voicingAspiration].join("|"),
    expectedConsonants.get(unit.sourceToken));
   assert.equal(unit.standardIPA,true);
  }
 }
 assert.deepEqual(new Set(record.keys()),new Set(Object.keys(names)));
 assert.equal(source.summary.distinctModelSymbols,34);
 assert.equal(source.summary.sourceVowelUnits,12);
 assert.equal(source.summary.sourceConsonantUnits,22);
 assert.equal(source.summary.specialNonStandardApicalVowels,2);
 assert.equal(source.summary.workingInitialNotationMismatches,3);
 for(const k of ["acceptedProjectPhonemeContrasts",
  "independentlyVerifiedRealizations","permittedAutomaticPinyinToIPAAssignments",
  "learnerStudies"])assert.equal(source.summary[k],0);
 const differs=external.initials.filter(r=>
  r.zhaoLiIPA!==r.originalWorkingIPACandidate);
 assert.deepEqual(differs.map(r=>r.pinyinInitial),["zh","ch","r"]);
 assert.equal(record.get("r").notation,"ʐ");
 return {units:record.size,vowels:expectedSourceVowels.size,consonants:expectedConsonants.size};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 assert.ok(process.argv.includes("--check"),"Use --check");
 const get=x=>JSON.parse(fs.readFileSync(x,"utf8"));
 const r=validate34(get(path),
  get("data/phonetics/zhao-li-2009-independent-pinyin-ipa-control-v0.1.json"),
  get("data/phonetics/mandarin-initial-feature-candidates-v0.1.json"));
 console.log("External 34-unit IPA research model verified: "+r.vowels+
  " vowels, "+r.consonants+" consonants, 2 nonstandard apicals; no project phoneme freeze.");
}
