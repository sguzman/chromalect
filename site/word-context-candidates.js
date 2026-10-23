// Read-only corpus word-substring matches. No contextual pronunciation is inferred.
(() => {
"use strict";
const $=id=>document.getElementById(id);
if(["word-query","word-scope","word-status","word-stats","word-results"].some(id=>!$(id)))return;
let entries=[],contributorMap=new Map(),liveAuditMap=new Map();
function render(){
 const q=$("word-query").value.trim(),scope=$("word-scope").value;
 const shown=entries.filter(r=>(scope==="all"||(scope==="with"?r.sentenceIds.length>0:r.sentenceIds.length===0))&&
  (!q||r.writtenWordLead.includes(q)||r.character.includes(q)||String(r.rank)===q||r.sentenceIds.includes(q)));
 $("word-results").replaceChildren();
 for(const r of shown){
  const card=document.createElement("article"),title=document.createElement("h2"),
   pronunciation=document.createElement("p"),counts=document.createElement("p"),source=document.createElement("a"),
   list=document.createElement("ul");
  card.className="word-card";title.textContent=r.writtenWordLead;
  pronunciation.className="word-meta";
  pronunciation.textContent="Publisher heading: "+r.dictionaryHeadingReading+" · no sentence reading verified";
  counts.className="word-meta";
  counts.textContent=r.rawMatchingSentenceCount+" literal matches · "+r.sentenceIds.length+" selected IDs · 0 approved senses";
  source.href=r.publisherSourceURL;source.rel="noopener noreferrer";source.target="_blank";
  source.textContent="Publisher dictionary entry";
  list.className="word-links";
  for(const id of r.sentenceIds){
   const li=document.createElement("li"),a=document.createElement("a");
   a.href="https://tatoeba.org/en/sentences/show/"+id;
   a.target="_blank";a.rel="noopener noreferrer";a.textContent="Tatoeba sentence #"+id;
   const attribution=contributorMap.get(id);
   if(!attribution)throw Error("Missing contributor attribution for source ID");
   const by=document.createElement("span");by.className="word-meta";
   const live=liveAuditMap.get(id);
   if(!live)throw Error("Missing live license observation for source ID");
   by.textContent=" · contributor: "+attribution.contributor+
    " · "+live.observedLiveLicense+" observed 2026-10-23"+
    " · source text unchanged · quotation clearance and pronunciation pending";
   li.appendChild(a);li.appendChild(by);list.appendChild(li);
  }
  if(!r.sentenceIds.length){
   const note=document.createElement("p");note.className="word-meta";
   note.textContent="No corpus match in this snapshot; dictionary lead remains unadjudicated.";
   card.appendChild(note);
  }
  card.appendChild(title);card.appendChild(pronunciation);card.appendChild(counts);card.appendChild(source);card.appendChild(list);
  $("word-results").appendChild(card);
 }
 $("word-stats").textContent=shown.length+" word leads · "+shown.reduce((n,r)=>n+r.sentenceIds.length,0)+" selected source IDs in view";
 $("word-status").textContent="Literal text matches only; reading and sense approvals: 0.";
}
async function load(){
 try{
  const [leadResponse,matchResponse,creditResponse,auditResponse]=await Promise.all([
   fetch("semantic/dictionary-word-surface-leads-v0.1.json"),
   fetch("semantic/tatoeba-word-surface-id-index-v0.1.json"),
   fetch("semantic/tatoeba-word-candidate-attribution-v0.1.json"),
   fetch("semantic/tatoeba-live-word-record-audit-summary-v0.1.json")]);
  if(!leadResponse.ok||!matchResponse.ok||!creditResponse.ok||!auditResponse.ok)throw Error("Missing source data");
  const [source,match,credits,audit]=await Promise.all([
   leadResponse.json(),matchResponse.json(),creditResponse.json(),auditResponse.json()]);
  if(source.schema!=="chromalect.semantic.dictionary-word-surface-leads.v0.1"||
     source.status!=="publisher_dictionary_word_leads_not_independent_usage_attestations"||
     source.leads.length!==8||
     match.schema!=="chromalect.semantic.tatoeba-word-surface-id-index.v0.1"||
     match.status!=="literal_multi_character_substrings_not_verified_word_or_reading_attestations"||
     match.summary.wordLeads!==8||match.summary.rawWordSubstringMatches!==213||
     match.summary.selectedWordSentenceAssociations!==27||
     match.summary.uniqueSentenceIds!==27||match.summary.contextualPronunciationVerifications!==0||
     match.summary.independentLexicalApprovals!==0||match.summary.independentPictogramApprovals!==0||
     match.summary.productionVerified!==0||match.records.length!==8)
   throw Error("Source identity or approval invariants failed");
  if(credits.schema!=="chromalect.semantic.tatoeba-word-candidate-attribution.v0.1"||
     credits.status!=="retrieved_corpus_contributor_metadata_not_individual_license_or_linguistic_approval"||
     credits.summary.selectedCorpusSentenceIDs!==27||
     credits.summary.distinctPublicCorpusContributors!==20||
     credits.summary.individuallyCheckedSentenceLicenses!==0||
     credits.summary.independentContextualPronunciationsVerified!==0||
     credits.summary.independentlyAdjudicatedLexicalSenses!==0||
     credits.summary.approvedPictograms!==0||credits.records.length!==27||
     credits.records.some(x=>!/^\d+$/.test(x.sentenceId)||!x.contributor||
       x.individualLicenseStatus!=="pending_live_record_check"||
       x.wordBoundaryVerified!==false||x.readingVerified!==false||
       x.lexicalSenseApproved!==false||x.sourceTextCopied!==false))
   throw Error("Contributor provenance or individual licensing state differs from pinned source");
  if(audit.schema!=="chromalect.semantic.tatoeba-live-word-record-audit-summary.v0.1"||
     audit.status!=="observed_live_api_source_integrity_not_rights_or_lexical_adjudication"||
     audit.checkedUTCDate!=="2026-10-23"||audit.summary.liveRecordsRead!==27||
     audit.summary.missingOrUnreachable!==0||audit.summary.CC_BY_2_0_FR_LicenseLabels!==27||
     audit.summary.ownerMatchesSnapshot!==27||audit.summary.textMatchesSnapshot!==27||
     audit.summary.containsTargetWordSurface!==27||
     audit.summary.reuseRightsAdjudicated!==0||
     audit.summary.independentlyVerifiedReadings!==0||
     audit.summary.approvedLexicalSenses!==0||
     audit.summary.productionApprovals!==0||audit.records.length!==27)
   throw Error("Live per-sentence API observation ledger invalid");
  const sources=new Map(source.leads.map(x=>[x.id,x])),seen=new Set(),ids=new Set();
  entries=match.records.map(r=>{
   const lead=sources.get(r.leadId);
   if(!lead||seen.has(r.leadId)||r.writtenWordLead!==lead.surfaceWord||r.rank!==lead.rank||
      r.observedStatus!=="literal_substring_candidate_only"||
      r.independentWordBoundaryVerified!==false||
      r.independentContextualReadingVerified!==false||
      r.independentLexicalSenseVerified!==false||r.approvedPictogram!==false||
      !Array.isArray(r.sentenceIds)||r.sentenceIds.length>5||
      r.sentenceIds.some(id=>typeof id!=="string"||!/^\d+$/.test(id))||
      r.sentenceIds.length>r.rawMatchingSentenceCount)
    throw Error("Unapproved word evidence was changed");
   seen.add(r.leadId);r.sentenceIds.forEach(id=>ids.add(id));
   return {...r,character:lead.character,publisherSourceURL:lead.publisherSourceURL,
    dictionaryHeadingReading:lead.dictionaryHeadingReading};
  });
  if(seen.size!==8||ids.size!==27)throw Error("Wrong source ID cardinality");
  contributorMap=new Map();
  for(const credit of credits.records){
   if(!ids.has(credit.sentenceId)||contributorMap.has(credit.sentenceId)||
      !match.records.some(r=>r.leadId===credit.leadId&&r.sentenceIds.includes(credit.sentenceId))||
      credit.sourceURL!=="https://tatoeba.org/en/sentences/show/"+credit.sentenceId)
     throw Error("Contributor record does not match corpus source ID");
   contributorMap.set(credit.sentenceId,credit);
  }
  if(contributorMap.size!==27)throw Error("Contributor record cardinality mismatch");
  liveAuditMap=new Map();
  for(const record of audit.records){
   if(!ids.has(record.sentenceId)||liveAuditMap.has(record.sentenceId)||
      record.leadId!==contributorMap.get(record.sentenceId)?.leadId||
      record.observedLiveLicense!=="CC BY 2.0 FR"||
      record.matchedPinnedContributor!==true||record.matchedPinnedSentenceTextSHA256!==true||
      record.preservedDictionaryWordSurface!==true||record.liveLanguageWasMandarin!==true||
      record.sourceMarkedUnapproved!==false||record.individualLicenseLabelObserved!==true||
      record.reuseRightsAdjudicated!==false||record.independentReadingVerification!==false||
      record.independentLexicalSenseApproval!==false)
    throw Error("Live corpus source status does not match pinned attribution and nonapproval");
   liveAuditMap.set(record.sentenceId,record);
  }
  if(liveAuditMap.size!==27)throw Error("Incomplete per-sentence live source verification");
  render();
 }catch(error){entries=[];$("word-status").textContent="Unable to validate word-source records: "+error.message;}
}
$("word-query").addEventListener("input",render);
$("word-scope").addEventListener("change",render);
load();
})();