// Source-table options, not certified IPA: compare three reported conventions
// with the project's own working feature candidates without promoting either.
import assert from "node:assert/strict";
import fs from "node:fs";
import {pathToFileURL} from "node:url";
const read=x=>JSON.parse(fs.readFileSync(x,"utf8"));
const file="data/phonetics/mandarin-pinyin-ipa-source-disagreement-v0.1.json";
export function validate(report,initials,finals,citations){
 assert.equal(report.schema,"chromalect.phonetics.mandarin-pinyin-ipa-source-disagreement.v0.1");
 assert.equal(report.status,
  "diction_guide_reports_multiple_ipa_conventions_not_a_single_certified_phonemic_inventory");
 assert.equal(report.source.author,"Hana J. Cai");
 assert.equal(report.source.year,2020);
 assert.equal(report.source.university,"Indiana University Jacobs School of Music");
 assert.equal(report.source.sourceURI,
  "https://scholarworks.iu.edu/iuswrrest/api/core/bitstreams/9dc66f3c-a3fb-4221-a9a6-815a1c4811a0/content");
 assert.deepEqual(report.source.table2PDFPagesOneBased,[34,35]);
 assert.deepEqual(report.source.table3PDFPagesOneBased,[36,37,38]);
 assert.equal(report.source.originalTableImagesRedistributed,false);
 assert.equal(report.source.authorialExplanatoryTextCopied,false);
 assert.equal(report.scope.glyphOrPaletteChanged,false);
 assert.equal(report.scope.y_w_empty_onsets_not_phonemes,true);
 assert.equal(report.scope.writtenLetterNotGuaranteedPhone,true);
 assert.equal(initials.schema,"chromalect.phonetics.mandarin-initial-feature-candidates.v0.1");
 assert.equal(initials.statistics.conventionalInitialTokens,21);
 assert.equal(initials.statistics.orthographicConventions,3);
 assert.equal(initials.statistics.independentlyVerifiedPhonemicContrasts,0);
 assert.equal(finals.schema,"chromalect.phonetics.mandarin-simple-final-feature-candidates.v0.1");
 assert.equal(finals.summary.distinctSimpleFinalLabels,6);
 assert.equal(finals.summary.sourceCitationReadings,1171);
 assert.equal(finals.summary.independentIPAApprovalCount,0);
 assert.equal(citations.schema,"chromalect.pronunciation-citations.v0");
 assert.equal(citations.characters.length,1000);
 const originalInitials=new Map(initials.tokens.filter(x=>
  x.category==="conventional_pinyin_initial").map(x=>[x.token,x]));
 const orthographic=initials.tokens.filter(x=>x.category!==
  "conventional_pinyin_initial").map(x=>x.token).sort();
 assert.deepEqual(orthographic,["w","y","∅"]);
 assert.equal(report.initials.length,21);
 assert.equal(originalInitials.size,21);
 const actualInitials=new Set();
 for(const row of report.initials){
  assert.ok(originalInitials.has(row.pinyinInitial),"Unknown source initial: "+row.pinyinInitial);
  assert.ok(!actualInitials.has(row.pinyinInitial));
  actualInitials.add(row.pinyinInitial);
  const feature=originalInitials.get(row.pinyinInitial);
  assert.equal(row.originalWorkingCandidate,feature.workingIPACandidate);
  assert.equal(row.literalAgreementWithLin,row.originalWorkingCandidate===row.linReportedIPA);
  assert.equal(row.disagreementsBetweenReports,
   new Set([row.linReportedIPA,row.meiReportedIPA,row.caiSuggestedIPA]).size>1);
  assert.ok([25,26].includes(row.publishedTablePrintedPage));
  assert.equal(row.pinyinConsonantal,true);
  assert.equal(row.sourceApproval,"published_comparison_only_not_phonemic_adjudication");
  for(const f of ["linReportedIPA","meiReportedIPA","caiSuggestedIPA"]){
   assert.ok(typeof row[f]==="string"&&row[f].length>0);
  }
  if(row.pinyinInitial==="t"){
   assert.equal(row.meiReportedIPA,"ts");
   assert.match(row.reportedMeiErrorFlag,/likely error/);
  }else assert.ok(!Object.hasOwn(row,"reportedMeiErrorFlag"));
 }
 assert.deepEqual(actualInitials,new Set(originalInitials.keys()));
 const finLabels=new Set(finals.records.map(r=>r.token));
 assert.equal(finLabels.size,6);
 assert.equal(report.simples.length,6);
 const finSeen=new Set();
 for(const row of report.simples){
  assert.ok(finLabels.has(row.writtenFinal)&&!finSeen.has(row.writtenFinal));
  finSeen.add(row.writtenFinal);
  assert.equal(row.sourceComparisonNotDefaultAcousticTarget,true);
  assert.equal(row.literalAgreementAllColumns,
   row.linReportedIPA===row.meiReportedIPA&&row.meiReportedIPA===row.caiSuggestedIPA);
  assert.ok([27,28,29].includes(row.publishedTablePrintedPage));
  assert.ok(Array.isArray(row.contextualQualifier));
  for(const f of ["linReportedIPA","meiReportedIPA","caiSuggestedIPA"])
   assert.ok(typeof row[f]==="string"&&row[f].length>0);
 }
 assert.deepEqual(finSeen,finLabels);
 assert.equal(report.counts.originalConsonantalInitials,21);
 assert.equal(report.counts.sourceReportedInitialComparisons,21);
 assert.equal(report.counts.initialSourceDisagreementRows,
  report.initials.filter(x=>x.disagreementsBetweenReports).length);
 assert.equal(report.counts.sourceWorkingInitialExactLinMatches,
  report.initials.filter(x=>x.literalAgreementWithLin).length);
 assert.equal(report.counts.originalOnsetSpellingConventionsExcluded,3);
 assert.equal(report.counts.originalWrittenFinals,33);
 assert.equal(report.counts.simpleFinalComparisonRows,6);
 assert.equal(report.counts.simpleFinalAllColumnsMatch,
  report.simples.filter(x=>x.literalAgreementAllColumns).length);
 assert.equal(report.counts.unaddressedComplexWrittenFinals,27);
 assert.equal(report.counts.sourceCitationReadings,1171);
 for(const name of ["independentPhonemicContrastApprovals",
   "acousticallyValidatedPhoneMappings","thirdPartyContextualPronunciationApprovals",
   "humanDecodingTrials"])assert.equal(report.counts[name],0);
 assert.equal(report.counts.initialSourceDisagreementRows,16);
 assert.equal(report.counts.sourceWorkingInitialExactLinMatches,19);
 assert.equal(report.counts.simpleFinalAllColumnsMatch,4);
 const workingInitials=new Set(initials.tokens.map(x=>x.token));
 let attestations=0;
 for(const c of citations.characters){
  for(const r of c.readings){
   assert.ok(workingInitials.has(r.initial));
   attestations++;
  }
 }
 assert.equal(attestations,1171);
 return {initials:report.initials.length,simples:report.simples.length,
  initialDisagreements:report.counts.initialSourceDisagreementRows};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const counts=validate(read(file),
  read("data/phonetics/mandarin-initial-feature-candidates-v0.1.json"),
  read("data/phonetics/mandarin-simple-final-feature-candidates-v0.1.json"),
  read("site/pronunciation-citations-0001-1000.json"));
 assert.ok(process.argv.includes("--check"),"Use --check");
 console.log("IU source-cited IPA comparison verified: "+counts.initials+
  " initials, "+counts.simples+" simple finals, "+counts.initialDisagreements+
  " initial table disagreements; zero phonemic approvals.");
}
