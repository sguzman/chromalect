import assert from "node:assert/strict";
import fs from "node:fs";
const dir="data/semantic/cedict-crossref/";
const source=JSON.parse(fs.readFileSync(dir+"contextual-reading-evidence-workqueue-v0.1.json","utf8"));
const groups=JSON.parse(fs.readFileSync(dir+"contextual-pronunciation-search-groups-v0.1.json","utf8"));
const report={
 schema:"chromalect.semantic.contextual-evidence-readiness-summary.v0.1",
 status:"research_acquisition_planning_not_validated_contextual_evidence",
 source:{readingEvidenceWorkqueue:"contextual-reading-evidence-workqueue-v0.1.json",normalizedSearchGroups:"contextual-pronunciation-search-groups-v0.1.json"},
 highAttentionCharacters:source.summary.highAttentionCharacters,
 originalDictionaryReadingEntries:source.summary.readingEntryTasks,
 caseNormalizedSearchGroups:groups.summary.caseNormalizedPronunciationLabelGroups,
 capitalizationDuplicatesNotMergedSemantically:groups.summary.sourceEntriesSharingCaseNormalizedLabels,
 sourceTasksWithPublisherPageLinks:source.summary.readingTasksWithPublisherPageLinks,
 candidateSentenceIdsCollected:source.summary.tasksWithRetrievedSentences,
 independentlyVerifiedReadings:source.summary.independentContextualReadingVerifications,
 independentlyApprovedLexicalSenses:source.summary.independentLexicalSenseApprovals,
 independentlyApprovedPictograms:source.summary.emojiComprehensionApprovals,
 productionVerified:source.summary.productionSemanticApprovals
};
assert.equal(report.highAttentionCharacters,142);
assert.equal(report.originalDictionaryReadingEntries,319);
assert.equal(report.caseNormalizedSearchGroups,241);
assert.equal(report.capitalizationDuplicatesNotMergedSemantically,78);
assert.equal(report.sourceTasksWithPublisherPageLinks,50);
for(const key of ["candidateSentenceIdsCollected","independentlyVerifiedReadings","independentlyApprovedLexicalSenses","independentlyApprovedPictograms","productionVerified"])
 assert.equal(report[key],0);
const path=dir+"contextual-evidence-readiness-summary-v0.1.json";
if(process.argv.includes("--check")){
 assert.deepEqual(JSON.parse(fs.readFileSync(path,"utf8")),report);
 console.log("Research readiness summary: 319 pinned entries / 241 search groups / no approved contexts.");
}else{
 fs.writeFileSync(path,JSON.stringify(report,null,2)+"\n");
 console.log("Wrote "+path);
}
