// Validate explicitly exported local observations against pinned character-reading evidence.
// Integrity does not establish independent lexical verification or approval.
import assert from "node:assert/strict";
import fs from "node:fs";
import {pathToFileURL} from "node:url";

const revision="63c2569948629323b515833930fdd10f285401b6";
const names=["0001-0200","0201-0400","0401-0600","0601-0800","0801-1000"];
const categories=new Set(["ordinary","specialized","historical","proper_name","graphic","undetermined"]);
const units=new Set(["standalone","in_word","both","undetermined"]);
const scopes=new Set(["higher","higher_no_links","all","multiple","unmapped","targeted","deferred","baseline"]);

function sections(record){
 const markers=[],str=record.excerpt;let from=0;
 for(const reading of record.readings){
  const index=str.indexOf(reading+": ",from);
  assert.ok(index>=0);
  if(!markers.length)assert.equal(index,0);
  else assert.match(str.slice(Math.max(0,index-20),index),/;\s{2,}$/);
  markers.push({reading,index,start:index+reading.length+2});
  from=index+reading.length+2;
 }
 return markers.map((m,i)=>({
  reading:m.reading,
  gloss:str.slice(m.start,i+1<markers.length?markers[i+1].index:str.length)
   .trim().replace(/;\s*$/,"").trim()
 }));
}
export function validateReadingInventory(session,triage,dictionaryBlocks){
 assert.ok(["chromalect.reading-inventory-observation-session.v0.1",
 "chromalect.reading-inventory-observation-session.v0.2"].includes(session.schema));
 const v2=session.schema.endsWith(".v0.2");
 assert.equal(session.status,"local_source_first_reading_hypotheses_not_independent_approval");
 assert.equal(session.source?.dictionaryRevision,revision);
 assert.equal(session.source?.dictionaryLicense,"CC BY-SA 4.0");
 assert.deepEqual(session.source?.dictionaryBlocks,names.map(n=>"dictionary-excerpts-"+n+".json"));
 assert.equal(session.source?.polysemyTriage,"polysemy-triage-v0.1.json");
 assert.equal(session.session?.localOnly,true);
 assert.ok(scopes.has(session.session.scope));
 assert.ok(["20","50","all"].includes(session.session.requestedCount));
 assert.ok(typeof session.session.exportedAt==="string"&&!Number.isNaN(Date.parse(session.session.exportedAt)));
 assert.equal(triage.schema,"chromalect.semantic.polysemy-screening-triage.v0.1");
 assert.equal(triage.summary.charactersAudited,1000);
 assert.equal(triage.summary.independentLexicalApproved,0);
 assert.equal(triage.summary.independentEmojiApproved,0);
 assert.equal(triage.summary.productionVerified,0);
 assert.equal(dictionaryBlocks.length,5);
 const dictionary=dictionaryBlocks.flatMap((block,i)=>{
  assert.equal(block.schema,"chromalect.semantic.dictionary-excerpt-block.v0.1");
  assert.equal(block.license,"CC BY-SA 4.0");
  assert.equal(block.sourceCommit,revision);
  assert.ok(block.records.length>0);
  return block.records;
 });
 assert.equal(dictionary.length,1000);
 const candidates=new Map(),eligible=new Set(),tierCounts={higher:0,targeted:0,deferred:0,baseline:0};
 for(let i=0;i<1000;i++){
  const r=dictionary[i],t=triage.records[i];
  assert.equal(r.rank,i+1);assert.equal(t.rank,r.rank);
  assert.equal(t.character,r.character);
  assert.equal(t.sourcePath,r.sourcePath);
  assert.equal(t.sourceBlobSha,r.sourceBlobSha);
  assert.deepEqual(t.dictionaryReadings,r.readings);
  assert.equal(t.independentLexicalApproval,false);
  assert.equal(t.manualSenseReview,"pending");
  for(const {reading,gloss} of sections(r)){
   const key=r.rank+"|"+reading;
   assert.ok(!candidates.has(key));
   const item={r,t,gloss};
   candidates.set(key,item);tierCounts[t.triageTier]++;
   const scope=session.session.scope;
   const hasAnySourceReferences=sections(r).some(section=>
    /([\p{Script=Han}]+(?:\|[\p{Script=Han}]+)?)\[[A-Za-z0-9 ]+\]/u.test(section.gloss));
   if(scope==="all"||scope===t.triageTier||
    (scope==="higher_no_links"&&t.triageTier==="higher"&&!hasAnySourceReferences)||
    (scope==="multiple"&&r.readings.length>1)||
    (scope==="unmapped"&&t.experimentalMeaningCount===0))
    eligible.add(key);
  }
 }
 assert.equal(candidates.size,1393);
 assert.equal(tierCounts.higher,319);
 assert.ok(Array.isArray(session.observations)&&session.observations.length>0);
 assert.equal(session.session.recorded,session.observations.length);
 const max=session.session.requestedCount==="all"?eligible.size:
  Math.min(eligible.size,Number(session.session.requestedCount));
 assert.equal(session.session.planned,max);
 assert.ok(session.observations.length<=max);
 const seen=new Set();
 for(const o of session.observations){
  const key=o.rank+"|"+o.reading;
  assert.ok(eligible.has(key),"Reading is outside selected research cohort");
  assert.ok(!seen.has(key),"Duplicate reading observation");
  seen.add(key);
  const {r,t,gloss}=candidates.get(key);
  assert.equal(o.character,r.character);
  assert.equal(o.dictionarySource,r.sourcePath);
  assert.equal(o.dictionaryBlobSha,r.sourceBlobSha);
  assert.equal(o.pinnedSourceGloss,gloss);
  assert.equal(o.priorityAtIntake,t.triageTier);
  assert.ok(categories.has(o.preliminaryUsageCategory));
  assert.ok(units.has(o.preliminaryContextualUnit));
  assert.ok(typeof o.usageExample==="string"&&o.usageExample.length<=500);
  if(v2){
   if(o.contextEvidence===null){
    assert.equal(o.usageExample,"","Unattributed context cannot be exported");
   }else{
    const e=o.contextEvidence;
    assert.ok(e&&typeof e==="object"&&!Array.isArray(e));
    assert.deepEqual(Object.keys(e).sort(),
     ["sourceKind","sourceRecordId","sourceUrl","contributorAttribution","reuseDisposition"].sort(),
     "Context metadata must contain only the declared, nonapproval fields");
    assert.ok(["tatoeba","corpus","dictionary"].includes(e.sourceKind));
    assert.ok(typeof e.sourceRecordId==="string"&&e.sourceRecordId.length>0&&e.sourceRecordId.length<=120);
    assert.ok(typeof e.sourceUrl==="string"&&e.sourceUrl.length<=1000);
    const parsed=new URL(e.sourceUrl);
    assert.equal(parsed.protocol,"https:");
    assert.equal(parsed.username,"");assert.equal(parsed.password,"");
    assert.equal(parsed.hash,"");
    assert.ok(parsed.hostname.length>0);
    assert.ok(typeof e.contributorAttribution==="string"&&e.contributorAttribution.trim().length>0&&e.contributorAttribution.length<=250);
    assert.ok(["link_only","cc_by_2_0_fr","cc0_1_0","other_cleared"].includes(e.reuseDisposition));
    if(e.reuseDisposition==="link_only")assert.equal(o.usageExample,"");
    if(e.sourceKind==="tatoeba"){
     assert.match(e.sourceRecordId,/^\d+$/);
     assert.equal(parsed.hostname,"tatoeba.org");
     assert.match(parsed.pathname,/^\/(?:en|eng)\/sentences\/show\/\d+\/?$/);
     assert.equal(parsed.pathname.split("/")[4],e.sourceRecordId);
     assert.equal(parsed.search,"");assert.equal(parsed.hash,"");
     assert.notEqual(e.reuseDisposition,"other_cleared");
    }
   }
  }
  assert.ok(typeof o.independentEvidenceReference==="string"&&o.independentEvidenceReference.length<=1000);
  assert.ok(typeof o.evidenceRationale==="string"&&o.evidenceRationale.trim().length>=12&&o.evidenceRationale.length<=15000);
  assert.equal(o.lexicalApproval,"not_granted");
  assert.equal(o.emojiComprehensionApproval,"not_granted");
  assert.equal(o.productionVerified,false);
  assert.ok(!("emoji" in o)&&!("emojiExpression" in o));
 }
 return {characterEntries:1000,dictionaryReadingEntries:1393,
  localObservations:session.observations.length,independentApprovals:0};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const filename=process.argv[2];
 if(!filename)throw new Error("Supply an explicitly exported local reading-inventory JSON file");
 const session=JSON.parse(fs.readFileSync(filename,"utf8"));
 const dir="data/semantic/cedict-crossref/";
 const triage=JSON.parse(fs.readFileSync(dir+"polysemy-triage-v0.1.json","utf8"));
 const blocks=names.map(n=>JSON.parse(fs.readFileSync(dir+"dictionary-excerpts-"+n+".json","utf8")));
 const result=validateReadingInventory(session,triage,blocks);
 console.log("Source-aligned local reading observations: "+result.localObservations+
  ". Independent approvals: "+result.independentApprovals+".");
}
