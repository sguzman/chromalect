// Local-only preliminary sentence-context research: no automatic linguistic approvals.
(() => {
"use strict";
const $=id=>document.getElementById(id);
const ids=["review-candidate","review-boundary","review-reading","review-sense",
 "review-evidence","review-rationale","review-source","review-heading","review-status",
 "review-link","review-save","review-export","review-output","review-count","review-triage"];
if(ids.some(id=>!$(id)))return;
const status=message=>{$("review-status").textContent=message;};
const files=[
 "dictionary-word-surface-leads-v0.1.json","tatoeba-word-surface-id-index-v0.1.json",
 "tatoeba-word-candidate-attribution-v0.1.json","tatoeba-live-word-record-audit-summary-v0.1.json",
 "tatoeba-word-sentence-text-fingerprints-v0.1.json","word-context-review-priority-v0.1.json"];
const defaults=()=>({wordBoundaryAssessment:"undetermined",readingAssessment:"undetermined",
 senseAssessment:"undetermined",independentEvidenceURL:"",evidenceRationale:""});
const formFields=["wordBoundaryAssessment","readingAssessment","senseAssessment",
 "independentEvidenceURL","evidenceRationale"];
const domFields=["review-boundary","review-reading","review-sense","review-evidence","review-rationale"];
let records=[],selection=null,snapshot="",drafts=new Map();

function current(){
 const fields=Object.fromEntries(domFields.map((id,i)=>[formFields[i],$(id).value.trim()]));
 return fields;
}
function select(key){
 selection=records.find(r=>r.key===key)||null;
 if(!selection)return;
 const form=drafts.get(key)||defaults();
 domFields.forEach((id,i)=>{$(id).value=form[formFields[i]];});
 $("review-source").textContent="Sentence #"+selection.sentenceId+
  " · contributor: "+selection.contributor+" · checked source text: SHA-256 "+selection.textSha256+
  " · observed CC BY 2.0 FR label · no reuse clearance";
 $("review-heading").textContent=selection.writtenWordLead+" · dictionary heading "+selection.dictionaryHeadingReading+
  " (not a verified contextual reading)";
 $("review-triage").textContent="Machine boundary triage: "+selection.reviewTier.replace(/_/g," ")+
  " · ICU "+selection.machineSourceVersion+
  " · paired published word reading: "+(selection.publishedWordReadingPair?"located":"not located")+
  " · no contextual reading or word boundary approved";
 $("review-link").href=selection.sourceURL;
 $("review-count").textContent=drafts.size+" local draft observations (0 approved)";
}
function save(){
 if(!selection)throw Error("Source record is not loaded");
 const values=current();
 const changed=Object.keys(values).some(k=>values[k]!==defaults()[k]);
 if(!changed){drafts.delete(selection.key);$("review-count").textContent=drafts.size+" local draft observations (0 approved)";return;}
 const assessed=["wordBoundaryAssessment","readingAssessment","senseAssessment"]
  .some(k=>values[k]!=="undetermined");
 if(assessed&&values.evidenceRationale.length<30)
  throw Error("A preliminary assessment requires at least 30 characters of rationale");
 if(assessed&&!values.independentEvidenceURL)
  throw Error("A preliminary assessment requires an independent evidence URL");
 if(values.independentEvidenceURL){
  const url=new URL(values.independentEvidenceURL);
  if(url.protocol!=="https:"||url.username||url.password||url.hash||
    url.href===selection.sourceURL||url.href===selection.publisherSourceURL)
   throw Error("Evidence must be a distinct HTTPS source without a fragment or credentials");
 }
 drafts.set(selection.key,values);
 $("review-count").textContent=drafts.size+" local draft observations (0 approved)";
}
function output(){
 save();
 if(!drafts.size)throw Error("Record an observation before exporting");
 const observations=records.filter(r=>drafts.has(r.key)).map(r=>({
  leadId:r.leadId,sentenceId:r.sentenceId,writtenWordLead:r.writtenWordLead,
  dictionaryHeadingReading:r.dictionaryHeadingReading,sourceURL:r.sourceURL,
  contributor:r.contributor,textSha256:r.textSha256,...drafts.get(r.key)
 }));
 return {schema:"chromalect.word-context-review-session.v0.1",
  status:"local_preliminary_sentence_context_observations_not_approval",
  source:{corpusSnapshotSHA256:snapshot,wordLeadIndex:files[0],
   sentenceIndex:files[1],contributorIndex:files[2],liveAudit:files[3],
   sentenceFingerprints:files[4]},
  session:{localOnly:true,exportedAt:new Date().toISOString(),recorded:observations.length},
  observations};
}
async function load(){
 try{
  const responses=await Promise.all(files.map(n=>fetch("semantic/"+n)));
  if(responses.some(r=>!r.ok))throw Error("Missing pinned source data");
  const [leads,matches,credits,live,hashes,priority]=await Promise.all(responses.map(r=>r.json()));
  if(leads.schema!=="chromalect.semantic.dictionary-word-surface-leads.v0.1"||
   matches.schema!=="chromalect.semantic.tatoeba-word-surface-id-index.v0.1"||
   credits.schema!=="chromalect.semantic.tatoeba-word-candidate-attribution.v0.1"||
   live.schema!=="chromalect.semantic.tatoeba-live-word-record-audit-summary.v0.1"||
   hashes.schema!=="chromalect.semantic.tatoeba-word-sentence-text-fingerprints.v0.1"||
   priority.schema!=="chromalect.semantic.word-context-review-priority.v0.1")
   throw Error("Unexpected source schema");
  snapshot=matches.source.uncompressedTSVSha256;
  if(!/^[a-f0-9]{64}$/.test(snapshot)||snapshot!==credits.source.snapshotSHA256||
    snapshot!==hashes.source.corpusSnapshotSha256||
    snapshot!==live.provenance.corpusSnapshotSHA256||
    matches.summary.selectedWordSentenceAssociations!==27||
    matches.summary.contextualPronunciationVerifications!==0||
    matches.summary.independentLexicalApprovals!==0||
    live.summary.liveRecordsRead!==27||
    live.summary.independentlyVerifiedReadings!==0||
    live.summary.approvedLexicalSenses!==0||
    live.summary.reuseRightsAdjudicated!==0||
    priority.status!=="source_aligned_research_triage_not_sentence_or_lexical_approval"||
    priority.source.corpusSnapshotSHA256!==snapshot||
    priority.source.sourceSentencesCopied!==false||
    priority.summary.sourceVerifiedAssociations!==27||
    priority.summary.boundary_crosses_token!==6||
    priority.summary.multi_token_match!==4||
    priority.summary.single_token_suggestion!==17||
    priority.summary.independentlyVerifiedWordBoundaries!==0||
    priority.summary.independentlyVerifiedContextualReadings!==0||
    priority.summary.independentlyApprovedLexicalSenses!==0||
    priority.summary.quotationClearanceGranted!==0)
   throw Error("Source provenance or approval status mismatch");
  const leadMap=new Map(leads.leads.map(x=>[x.id,x]));
  const creditMap=new Map(credits.records.map(x=>[x.sentenceId,x]));
  const liveMap=new Map(live.records.map(x=>[x.sentenceId,x]));
  const hashMap=new Map(hashes.records.map(x=>[x.sentenceId,x]));
  const found=new Set();
  for(const match of matches.records){
   const lead=leadMap.get(match.leadId);
   if(!lead||lead.surfaceWord!==match.writtenWordLead||
      match.independentWordBoundaryVerified!==false||
      match.independentContextualReadingVerified!==false||
      match.independentLexicalSenseVerified!==false)throw Error("Lead is not pending review");
   for(const id of match.sentenceIds){
    const credit=creditMap.get(id),check=liveMap.get(id),hash=hashMap.get(id),
     key=match.leadId+"|"+id;
    if(!credit||!check||!hash||found.has(key)||credit.leadId!==match.leadId||
      check.leadId!==match.leadId||check.matchedPinnedContributor!==true||
      check.matchedPinnedSentenceTextSHA256!==true||
      check.independentReadingVerification!==false||
      check.independentLexicalSenseApproval!==false||
      check.reuseRightsAdjudicated!==false||
      !/^[a-f0-9]{64}$/.test(hash.textSha256)||
      credit.sourceURL!=="https://tatoeba.org/en/sentences/show/"+id)
     throw Error("Incomplete source record for review");
    found.add(key);
    records.push({key,leadId:lead.id,sentenceId:id,writtenWordLead:lead.surfaceWord,
     dictionaryHeadingReading:lead.dictionaryHeadingReading,
     publisherSourceURL:lead.publisherSourceURL,sourceURL:credit.sourceURL,
     contributor:credit.contributor,textSha256:hash.textSha256});
   }
  }
  if(records.length!==27||found.size!==27)throw Error("Expected 27 distinct candidate records");
  if(!Array.isArray(priority.records)||priority.records.length!==27)
   throw Error("Research triage records not available");
  const order=new Map();
  const rank={boundary_crosses_token:0,multi_token_match:1,single_token_suggestion:2};
  for(const r of priority.records){
   const key=r.leadId+"|"+r.sentenceId;
   if(!found.has(key)||order.has(key)||!Object.hasOwn(rank,r.reviewTier)||
      r.wordBoundaryVerified!==false||r.contextualReadingVerified!==false||
      r.lexicalSenseApproved!==false||r.quotationRightsAdjudicated!==false)
    throw Error("Research triage cannot establish linguistic approval");
   const entry=records.find(x=>x.key===key);
   if(!entry||r.word!==entry.writtenWordLead||r.sourceURL!==entry.sourceURL||
      r.contributor!==entry.contributor||r.textSHA256!==entry.textSha256||
      typeof r.publishedWordReadingPair!=="boolean"||
      !/^[-.\d]+$/.test(r.machineSourceVersion))
    throw Error("Triage record must preserve the exact pinned provenance");
   Object.assign(entry,{reviewTier:r.reviewTier,machineSourceVersion:r.machineSourceVersion,
    publishedWordReadingPair:r.publishedWordReadingPair});
   order.set(key,true);
  }
  if(order.size!==27)throw Error("Incomplete research triage");
  records.sort((a,b)=>rank[a.reviewTier]-rank[b.reviewTier]||
   a.leadId.localeCompare(b.leadId,"en")||Number(a.sentenceId)-Number(b.sentenceId));

  $("review-candidate").replaceChildren();
  for(const r of records){
   const option=document.createElement("option");
   option.value=r.key;option.textContent=r.reviewTier.replace(/_/g," ")+" · "+r.writtenWordLead+" · sentence #"+r.sentenceId;
   $("review-candidate").appendChild(option);
  }
  $("review-candidate").value=records[0].key;
  select(records[0].key);
  status("27 pinned candidates available. Hypotheses are local and unapproved.");
 }catch(e){records=[];selection=null;status("Unable to validate source data: "+e.message);}
}
$("review-candidate").addEventListener("change",()=>{
 try{if(selection)save();select($("review-candidate").value);status("Local-only preliminary review.");}
 catch(e){status("Draft not saved: "+e.message);$("review-candidate").value=selection?.key||"";}
});
$("review-save").addEventListener("click",()=>{
 try{save();status("Preliminary observation stored in this page only. No source or approval changed.");}
 catch(e){status("Draft not saved: "+e.message);}
});
$("review-export").addEventListener("click",()=>{
 try{$("review-output").value=JSON.stringify(output(),null,2)+"\n";
 status("JSON prepared locally. Validate with the repository CLI before any separate review.");}
 catch(e){$("review-output").value="";status("Cannot export: "+e.message);}
});
load();
})();