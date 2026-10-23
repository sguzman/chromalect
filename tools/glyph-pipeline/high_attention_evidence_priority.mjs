// Deterministic high-complexity reading evidence acquisition queue.
// No lexical approval is granted by automated prioritization.
import assert from "node:assert/strict";
import fs from "node:fs";
const d="data/semantic/cedict-crossref/";
const poly=JSON.parse(fs.readFileSync(d+"polysemy-triage-v0.1.json","utf8"));
const full=JSON.parse(fs.readFileSync(d+"full-lexical-review-queue-v0.1.json","utf8"));
const refs=JSON.parse(fs.readFileSync(d+"dictionary-reference-cues-v0.1.json","utf8"));
const build=function build(poly,full,refs){
 if(poly.summary.charactersAudited!==1000||full.counts.total!==897||refs.summary.dictionaryReferenceTokens!==469)
  throw new Error("Unverified inputs or mismatched source version");
 const byRank=new Map();
 for(const row of full.records){
  if(!byRank.has(row.rank))byRank.set(row.rank,[]);
  byRank.get(row.rank).push(row);
 }
 const references=new Map();
 for(const record of refs.records){
  references.set(record.rank,(references.get(record.rank)||0)+record.literalReferenceCues.length);
 }
 const rows=poly.records.filter(x=>x.triageTier==="higher").map(x=>{
  const candidates=byRank.get(x.rank)||[];
  const links=references.get(x.rank)||0;
  const isDeferred=x.experimentalMeaningCount===0;
  const anyMismatch=candidates.some(r=>!r.strictWholeTermMatch);
  const reasons=[
   "adjudicate_reading_specific_lexical_uses",
   ...(links===0?["obtain_external_context_without_source_internal_crossreference"]:
     ["verify_dictionary_crossreferences_against_independent_usage"]),
   ...(anyMismatch?["review_literal_gloss_discrepancy"]:[]),
   ...(isDeferred?["review_source_meaning_without_emoji_candidate"]:[])
  ];
  const classId=isDeferred&&links===0?0:
    links===0&&anyMismatch?1:links===0?2:
    anyMismatch?3:4;
  return {
   rank:x.rank,character:x.character,recordedReadings:x.dictionaryReadings,
   readingCount:x.dictionaryReadings.length,definitionFragmentCount:x.definitionFragmentCount,
   candidateCount:candidates.length,pictogramDeferred:isDeferred,
   dictionaryReferenceTokenCount:links,hasSourceInternalReferences:links>0,
   candidateLiteralMismatchCount:candidates.filter(r=>!r.strictWholeTermMatch).length,
   evidenceAcquisitionClass:classId,priorityReasons:reasons,
   independentContextVerification:"pending",
   independentLexicalApproval:false,independentEmojiApproval:false,productionVerified:false
  };
 });
 rows.sort((a,b)=>a.evidenceAcquisitionClass-b.evidenceAcquisitionClass||a.rank-b.rank);
 const noRef=rows.filter(r=>!r.hasSourceInternalReferences);
 const summary={
  highAttentionCharacters:rows.length,highAttentionDictionaryReadingEntries:rows.reduce((a,r)=>a+r.readingCount,0),
  highAttentionWithInternalReferences:rows.length-noRef.length,
  highAttentionWithoutInternalReferences:noRef.length,
  highAttentionReadingsWithoutInternalReferences:noRef.reduce((a,r)=>a+r.readingCount,0),
  highAttentionWithCandidateGlossMismatch:rows.filter(r=>r.candidateLiteralMismatchCount>0).length,
  highAttentionWithNoPictogramCandidate:rows.filter(r=>r.pictogramDeferred).length,
  highAttentionWithNeitherPictogramNorInternalReferences:rows.filter(r=>r.pictogramDeferred&&!r.hasSourceInternalReferences).length,
  sourcePriorityPacketsPrepared:rows.length,
  independentUsageContextsVerified:0,independentLexicalApproved:0,
  independentEmojiApproved:0,productionVerified:0
 };
 const expected=[142,319,78,64,140,31,22,5];
 const actual=[summary.highAttentionCharacters,summary.highAttentionDictionaryReadingEntries,summary.highAttentionWithInternalReferences,summary.highAttentionWithoutInternalReferences,summary.highAttentionReadingsWithoutInternalReferences,summary.highAttentionWithCandidateGlossMismatch,summary.highAttentionWithNoPictogramCandidate,summary.highAttentionWithNeitherPictogramNorInternalReferences];
 if(JSON.stringify(actual)!==JSON.stringify(expected))throw Error("High attention metrics drift "+actual);
 return {
  schema:"chromalect.semantic.high-attention-reading-evidence-priority.v0.1",
  status:"source_readiness_ranking_without_independent_usage_attestation",
  source:{polysemyTriage:"polysemy-triage-v0.1.json",
   candidateQueue:"full-lexical-review-queue-v0.1.json",
   internalReferences:"dictionary-reference-cues-v0.1.json",
   dictionaryRevision:"63c2569948629323b515833930fdd10f285401b6",
   dictionaryLicense:"CC BY-SA 4.0"},
  method:"Prioritize high-complexity records without a provisional emoji or explicit dictionary-internal written-form links; separately flag literal English-gloss discrepancies. All priority tiers still require independent usage evidence.",
  caveats:[
   "An absence of dictionary cross-reference tokens is not evidence that usage examples or lexical senses do not exist.",
   "A source-internal dictionary reference is not independently attested Mandarin usage.",
   "Evidence-acquisition groups are planning heuristics, not sense accuracy rankings or production approval criteria."
  ],
  summary,records:rows
 };
};
const report=build(poly,full,refs);
const path=d+"high-attention-evidence-priority-v0.1.json";
if(process.argv.includes("--check")){
 assert.deepEqual(JSON.parse(fs.readFileSync(path,"utf8")),report);
 console.log("High-attention reading priority: 142 character packets, 64 without internal reference tokens; approvals 0.");
}else{
 fs.writeFileSync(path,JSON.stringify(report,null,2)+"\n");
 console.log("Wrote "+path);
}
