// Two reproducible Tatoeba source-ID cohorts. Written-form matches NEVER imply a pronunciation or sense.
(() => {
"use strict";
const $=id=>document.getElementById(id);
const required=["candidate-query","candidate-scope","candidate-cohort","candidate-status","candidate-stats","candidate-rows","candidate-prev","candidate-next"];
if(required.some(id=>!$(id)))return;
const LIMIT=18;
let cohorts=new Map(),escalation=null,page=0;
const modes={
 early:{title:"First three source matches",associations:423,unique:363,max:3},
 hashed:{title:"Whole-corpus hash sample",associations:701,unique:690,max:5},
 combined:{title:"Combined source-ID sets",associations:1087,unique:1015,max:8}
};
function fail(message){throw new Error(message);}
function numericSourceId(s){return typeof s==="string"&&/^\d+$/.test(s);}
function checkRows(data,kind){
 const early=kind==="early";
 const summary=data.summary;
 const expected=early?{
  schema:"chromalect.semantic.tatoeba-sentence-id-index.v0.1",
  status:"real_corpus_surface_character_candidates_unadjudicated",
  count:423,unique:363,max:3
 }:{
  schema:"chromalect.semantic.tatoeba-hash-sample-source-id-index.v0.1",
  status:"hash_sampled_corpus_surface_form_candidates_unadjudicated",
  count:701,unique:690,max:5
 };
 if(data.schema!==expected.schema||data.status!==expected.status||
    summary.characterSentenceAssociations!==expected.count||summary.uniqueSentenceIds!==expected.unique||
    summary.contextualReadingsVerified!==0||
    (early?(summary.independentlyApprovedLexicalSenses!==0||summary.approvedEmojiMappings!==0):
      (summary.lexicalSenseApprovals!==0||summary.pictogramApprovals!==0))||
    summary.productionVerified!==0||
    !Array.isArray(data.records)||data.records.length!==142)
  fail("Invalid or misrepresented "+kind+" cohort");
 const seen=new Set(),unique=new Set();
 let associations=0;
 const out=new Map();
 for(const row of data.records){
  const ids=row.sentenceIds;
  if(!Number.isInteger(row.rank)||row.rank<1||seen.has(row.rank)||
     typeof row.character!=="string"||[...row.character].length!==1||
     !Array.isArray(ids)||ids.length>expected.max||new Set(ids).size!==ids.length||
     ids.some(id=>!numericSourceId(id))||
     (early?(row.readingInContext!=="unverified"||row.lexicalStatus!=="not_approved"):
      (row.independentReadingApproval!==false||row.lexicalSenseApproval!==false)))
    fail("Malformed or incorrectly approved "+kind+" candidate");
  seen.add(row.rank);associations+=ids.length;
  for(const id of ids)unique.add(id);
  out.set(row.rank,{rank:row.rank,character:row.character,sentenceIds:ids});
 }
 if(seen.size!==142||associations!==expected.count||unique.size!==expected.unique)
  fail("Source-ID cohort integrity failure");
 return out;
}
function combine(early,hashed){
 if(early.size!==hashed.size||early.size!==142)fail("Incompatible cohort ranks");
 const both=new Map();let common=0;
 for(const [rank,e] of early){
  const h=hashed.get(rank);
  if(!h||e.character!==h.character)fail("Cohort source character mismatch");
  const ids=[...e.sentenceIds];
  for(const id of h.sentenceIds){
   if(ids.includes(id))common++;
   else ids.push(id);
  }
  both.set(rank,{rank,character:e.character,sentenceIds:ids,
   origins:new Map(ids.map(id=>[id,
    [e.sentenceIds.includes(id)?"First-three":null,h.sentenceIds.includes(id)?"Hash":null].filter(Boolean).join(" + ")]))});
 }
 const all=new Set([...both.values()].flatMap(r=>r.sentenceIds));
 const associations=[...both.values()].reduce((n,r)=>n+r.sentenceIds.length,0);
 if(common!==37||associations!==1087||all.size!==1015)fail("Cohort overlap differs from pinned research ledger");
 return both;
}
function show(){
 if(cohorts.size!==3)return;
 const chosen=$("candidate-cohort").value;
 if(!modes[chosen])return;
 const data=cohorts.get(chosen);
 const query=$("candidate-query").value.trim(),scope=$("candidate-scope").value;
 const matching=[...data.values()].filter(r=>
  (scope==="all"||(scope==="with"?r.sentenceIds.length>0:r.sentenceIds.length===0))&&
  (!query||r.character.includes(query)||String(r.rank)===query||r.sentenceIds.includes(query)));
 const pages=Math.max(1,Math.ceil(matching.length/LIMIT));
 page=Math.min(page,pages-1);
 $("candidate-rows").replaceChildren();
 for(const r of matching.slice(page*LIMIT,(page+1)*LIMIT)){
  const card=document.createElement("article"),heading=document.createElement("div"),
   char=document.createElement("strong"),rank=document.createElement("span"),
   note=document.createElement("p"),list=document.createElement("ul");
  card.className="context-card";heading.className="context-top";
  char.className="context-glyph";char.textContent=r.character;
  rank.className="context-small";rank.textContent="Rank "+r.rank;
  heading.appendChild(char);heading.appendChild(rank);card.appendChild(heading);
  note.className="context-small";
  note.textContent=r.sentenceIds.length+" surface match ID(s) · 0 verified readings · 0 approved senses";
  card.appendChild(note);list.className="context-links";
  if(!r.sentenceIds.length){
   const empty=document.createElement("p");empty.className="context-small";
   empty.textContent="No corpus candidate ID in the selected sample. This does not imply an unattested character or reading.";
   if(escalation?.rank===r.rank){
    const lead=document.createElement("p");
    lead.className="context-small";
    lead.textContent="Publisher dictionary research leads (not corpus sentence attestations; no approved senses):";
    card.appendChild(lead);
    const sources=document.createElement("ul");sources.className="context-links";
    for(const entry of escalation.sourcePages){
     const li=document.createElement("li"),a=document.createElement("a");
     a.href=entry.url;
     a.target="_blank";a.rel="noopener noreferrer";
     a.textContent=entry.publisher+" · "+entry.displayedPinyinLabels.join(", ");
     li.appendChild(a);sources.appendChild(li);
    }
    card.appendChild(sources);
   }
   card.appendChild(empty);
  }
  for(const id of r.sentenceIds){
   const li=document.createElement("li"),anchor=document.createElement("a");
   anchor.href="https://tatoeba.org/en/sentences/show/"+id;
   anchor.target="_blank";anchor.rel="noopener noreferrer";
   anchor.textContent="Tatoeba sentence #"+id;
   li.appendChild(anchor);
   if(chosen==="combined"){
    const provenance=document.createElement("span");
    provenance.className="context-small";
    provenance.textContent=" · "+r.origins.get(id);
    li.appendChild(provenance);
   }
   list.appendChild(li);
  }
  card.appendChild(list);$("candidate-rows").appendChild(card);
 }
 $("candidate-prev").disabled=page===0;
 $("candidate-next").disabled=page>=pages-1;
 $("candidate-stats").textContent=matching.length+" matching character(s) · page "+(page+1)+" of "+pages;
 $("candidate-status").textContent=modes[chosen].title+": "+modes[chosen].associations+
  " character/sentence associations, "+modes[chosen].unique+" distinct source IDs. Every contextual reading remains unverified.";
}
async function load(){
 try{
  const inputs=[
   ["early","semantic/tatoeba-sentence-id-index-v0.1.json"],
   ["hashed","semantic/tatoeba-hash-sample-source-id-index-v0.1.json"],
   ["escalation","semantic/unmatched-corpus-character-source-escalation-v0.1.json"]
  ];
  const responses=await Promise.all(inputs.map(x=>fetch(x[1])));
  if(responses.some(x=>!x.ok))fail("Required research cohort unavailable");
  const data=await Promise.all(responses.map(r=>r.json()));
  const early=checkRows(data[0],"early"),hashed=checkRows(data[1],"hashed");
  const lead=data[2];
  if(lead.schema!=="chromalect.semantic.unmatched-corpus-character-source-escalation.v0.1"||
     lead.status!=="publisher_dictionary_source_leads_only_no_corpus_attestation"||
     lead.summary.unmatchedHighAttentionCharacters!==1||
     lead.summary.externalPublisherPagesInspected!==4||
     lead.summary.independentlyVerifiedContextualPronunciations!==0||
     lead.summary.independentlyApprovedLexicalSenses!==0||
     lead.summary.independentlyApprovedPictograms!==0||
     lead.summary.productionSemanticApprovals!==0||
     lead.records.length!==1||
     lead.records[0].rank!==821||lead.records[0].character!=="刨"||
     lead.records[0].independentLexicalApproval!==false||
     lead.records[0].approvedEmojiMapping!==false||
     lead.records[0].productionVerified!==false||
     lead.records[0].sourcePages.length!==4||
     lead.records[0].sourcePages.some(x=>
       !/^https:\/\/(?:zdic\.net\/hans\/|dict\.(?:concised|mini)\.moe\.edu\.tw\/)/.test(x.url)||
       !Array.isArray(x.displayedPinyinLabels)||!x.displayedPinyinLabels.length))
     fail("External dictionary escalation failed source and nonapproval checks");
  escalation=lead.records[0];
  if(data[0].source.uncompressedTSVSha256!==data[1].source.uncompressedTSVSha256)
   fail("Incompatible pinned source snapshots");
  cohorts=new Map([["early",early],["hashed",hashed],["combined",combine(early,hashed)]]);
  show();
 }catch(error){
  $("candidate-status").textContent="Unable to validate corpus ID cohorts: "+error.message;
 }
}
$("candidate-query").addEventListener("input",()=>{page=0;show();});
$("candidate-scope").addEventListener("change",()=>{page=0;show();});
$("candidate-cohort").addEventListener("change",()=>{page=0;show();});
$("candidate-prev").addEventListener("click",()=>{if(page>0){page--;show();}});
$("candidate-next").addEventListener("click",()=>{page++;show();});
load();
})();