// Read-only corpus word-substring matches. No contextual pronunciation is inferred.
(() => {
"use strict";
const $=id=>document.getElementById(id);
if(["word-query","word-scope","word-status","word-stats","word-results"].some(id=>!$(id)))return;
let entries=[];
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
   li.appendChild(a);list.appendChild(li);
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
  const [leadResponse,matchResponse]=await Promise.all([
   fetch("semantic/dictionary-word-surface-leads-v0.1.json"),
   fetch("semantic/tatoeba-word-surface-id-index-v0.1.json")]);
  if(!leadResponse.ok||!matchResponse.ok)throw Error("Missing source data");
  const [source,match]=await Promise.all([leadResponse.json(),matchResponse.json()]);
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
  render();
 }catch(error){entries=[];$("word-status").textContent="Unable to validate word-source records: "+error.message;}
}
$("word-query").addEventListener("input",render);
$("word-scope").addEventListener("change",render);
load();
})();