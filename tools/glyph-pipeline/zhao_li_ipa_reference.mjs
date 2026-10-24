// Independent academic Pinyin-IPA table, not a frozen phonological standard.
// Values are source factual labels and never produced by synthesizing glyph data.
import assert from "node:assert/strict";
import fs from "node:fs";
import {pathToFileURL} from "node:url";
const table1=new Map([
 ["b","p"],["p","pʰ"],["m","m"],["f","f"],["d","t"],["t","tʰ"],
 ["n","n"],["l","l"],["g","k"],["k","kʰ"],["h","x"],
 ["j","tɕ"],["q","tɕʰ"],["x","ɕ"],["z","ts"],["c","tsʰ"],
 ["s","s"],["zh","tʂ"],["ch","tʂʰ"],["sh","ʂ"],["r","ʐ"]
]);
const vowel1=new Map(Object.entries({a:"a",o:"o",e:"ɤ",i:"i",u:"u","ü":"y"}));
export function validateZhaoLi(data,features,finals){
 assert.equal(data.schema,"chromalect.phonetics.zhao-li-2009-independent-pinyin-ipa-control.v0.1");
 assert.equal(data.status,"independently_published_research_model_not_frozen_standard_mandarin_phoneme_inventory");
 assert.equal(data.provenance.doi,"10.3758/BRM.41.2.575");
 assert.equal(data.provenance.year,2009);
 assert.equal(data.provenance.peerReviewedArticleURI,
  "https://link.springer.com/content/pdf/10.3758/BRM.41.2.575.pdf");
 assert.deepEqual(data.provenance.authors,["Xiaowei Zhao","Ping Li"]);
 assert.equal(data.provenance.originalPDFOrIllustrationsCopied,false);
 assert.equal(data.sourceWorkings.sourceGlyphsOrPaletteChanged,false);
 assert.equal(features.schema,"chromalect.phonetics.mandarin-initial-feature-candidates.v0.1");
 assert.equal(features.statistics.independentlyVerifiedPhonemicContrasts,0);
 assert.equal(finals.schema,"chromalect.phonetics.mandarin-simple-final-feature-candidates.v0.1");
 assert.equal(finals.summary.independentIPAApprovalCount,0);
 const original=new Map(features.tokens.filter(r=>
  r.category==="conventional_pinyin_initial").map(r=>[r.token,r]));
 const simple=new Map(finals.records.map(r=>[r.token,r]));
 assert.equal(original.size,21);assert.equal(simple.size,6);
 assert.equal(data.initials.length,21);assert.equal(data.simpleFinals.length,6);
 const seen=new Set(),differences=[];
 for(const r of data.initials){
  const o=original.get(r.pinyinInitial);
  assert.ok(o&&!seen.has(r.pinyinInitial),"Missing or repeated independent consonant");
  seen.add(r.pinyinInitial);
  assert.equal(r.zhaoLiIPA,table1.get(r.pinyinInitial),
   "Academic Pinyin IPA label deviates from source Table 1");
  assert.equal(r.originalWorkingIPACandidate,o.workingIPACandidate);
  assert.equal(r.identicalToWorkingNotation,r.zhaoLiIPA===r.originalWorkingIPACandidate);
  assert.equal(r.workingArticulatoryManner,o.manner);
  assert.equal(r.particularlyAnalysisSensitive,
   ["zh","ch","r"].includes(r.pinyinInitial));
  assert.equal(r.externalPhonemeApproved,false);
  assert.equal(r.independentlyMeasuredByChromalect,false);
  if(!r.identicalToWorkingNotation)differences.push(r.pinyinInitial);
 }
 assert.deepEqual(seen,new Set(original.keys()));
 assert.deepEqual(differences,["zh","ch","r"]);
 const seenFinal=new Set();
 for(const row of data.simpleFinals){
  const o=simple.get(row.writtenFinal);
  assert.ok(o&&!seenFinal.has(row.writtenFinal));
  seenFinal.add(row.writtenFinal);
  assert.equal(row.zhaoLiTable1IPA,vowel1.get(row.writtenFinal));
  assert.equal(row.originalCandidateHeight,o.workingHeight);
  assert.equal(row.originalCandidateBackness,o.workingBackness);
  assert.equal(row.originalCandidateRounding,o.workingRounding);
  assert.equal(row.sourceCitationContextsFlagged,o.sourceSpellingContextCautions);
  assert.equal(row.independentVowelPhonemeApproval,false);
  assert.equal(row.sourcePrintedPage,577);
 }
 assert.deepEqual(seenFinal,new Set(simple.keys()));
 assert.equal(data.summary.conventionalPinyinInitials,21);
 assert.equal(data.summary.externallyPublishedInitialIPAItems,21);
 assert.equal(data.summary.literalWorkingCandidateMatches,18);
 assert.equal(data.summary.differingWorkingCandidateIPAItems,3);
 assert.deepEqual(data.summary.differingInitials,["zh","ch","r"]);
 assert.equal(data.summary.independentSixSimpleFinalReferenceItems,6);
 assert.equal(data.summary.orthographicYAndWSeparatelyCountedAsConsonants,0);
 for(const key of ["independentlyFrozenPhonemicContrasts",
  "independentAcousticMeasurements","contextualIPAApprovals",
  "humanFeatureDecodingTrials"])assert.equal(data.summary[key],0);
 return {consonants:seen.size,vowels:seenFinal.size,differences};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 assert.ok(process.argv.includes("--check"));
 const get=x=>JSON.parse(fs.readFileSync(x,"utf8"));
 const r=validateZhaoLi(
  get("data/phonetics/zhao-li-2009-independent-pinyin-ipa-control-v0.1.json"),
  get("data/phonetics/mandarin-initial-feature-candidates-v0.1.json"),
  get("data/phonetics/mandarin-simple-final-feature-candidates-v0.1.json")
 );
 console.log("Zhao-Li Pinyin IPA: "+r.consonants+" initial references and "+
  r.vowels+" simple vowel references; "+r.differences.join(", ")+
  " differ from provisional codebook. Zero phonemic approvals.");
}
