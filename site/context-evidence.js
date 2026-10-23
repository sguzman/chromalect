// Bounded source-ID browser. Written-form matches are never pronunciation or lexical approvals.
(() => {
"use strict";
const $=id=>document.getElementById(id);
const required=["candidate-query","candidate-scope","candidate-status","candidate-stats","candidate-rows","candidate-prev","candidate-next"];
if(required.some(id=>!$(id)))return;
let entries=[],page=0;
const pageSize=18;
function render(){
 const query=$("candidate-query").value.trim(),scope=$("candidate-scope").value;
 const matching=entries.filter(r=>(scope==="all"||(scope==="with"?r.sentenceIds.length>0:r.sentenceIds.length===0))&&
  (!query||r.character.includes(query)||String(r.rank)===query||r.sentenceIds.includes(query)));
 const maxPage=Math.max(1,Math.ceil(matching.length/pageSize));
 page=Math.min(page,maxPage-1);
 $("candidate-rows").replaceChildren();
 for(const r of matching.slice(page*pageSize,(page+1)*pageSize)){
  const card=document.createElement("article"),heading=document.createElement("div"),
   character=document.createElement("strong"),rank=document.createElement("span"),
   note=document.createElement("p"),list=document.createElement("ul");
  card.className="context-card";heading.className="context-top";
  character.className="context-glyph";character.textContent=r.character;
  rank.className="context-small";rank.textContent="Rank "+r.rank;
  heading.appendChild(character);heading.appendChild(rank);card.appendChild(heading);
  note.className="context-small";note.textContent=r.sentenceIds.length+" surface matches; 0 verified readings; 0 approved senses";
  card.appendChild(note);list.className="context-links";
  if(!r.sentenceIds.length){
   const empty=document.createElement("p");empty.className="context-small";
   empty.textContent="No source match in this limited snapshot; absence does not indicate an unattested reading.";
   card.appendChild(empty);
  }
  for(const id of r.sentenceIds){
   const li=document.createElement("li"),a=document.createElement("a");
   a.href="https://tatoeba.org/en/sentences/show/"+id;
   a.target="_blank";a.rel="noopener noreferrer";
   a.textContent="Tatoeba sentence #"+id;
   li.appendChild(a);list.appendChild(li);
  }
  card.appendChild(list);$("candidate-rows").appendChild(card);
 }
 $("candidate-prev").disabled=page===0;
 $("candidate-next").disabled=page>=maxPage-1;
 $("candidate-stats").textContent=matching.length+" matching character(s) · page "+(page+1)+" of "+maxPage;
 $("candidate-status").textContent="Source identifiers only; readings, word boundaries and senses remain unverified.";
}
async function load(){
 try{
  const response=await fetch("semantic/tatoeba-sentence-id-index-v0.1.json");
  if(!response.ok)throw new Error("Source-ID index unavailable");
  const data=await response.json();
  if(data.schema!=="chromalect.semantic.tatoeba-sentence-id-index.v0.1"||
     data.status!=="real_corpus_surface_character_candidates_unadjudicated"||
     data.summary.characters!==142||data.summary.characterSentenceAssociations!==423||
     data.summary.uniqueSentenceIds!==363||data.summary.contextualReadingsVerified!==0||
     data.summary.independentlyApprovedLexicalSenses!==0||data.summary.approvedEmojiMappings!==0||
     data.summary.productionVerified!==0||!Array.isArray(data.records)||data.records.length!==142)
    throw new Error("Candidate identity or approval guards failed");
  const ranks=new Set(),unique=new Set();let associations=0;
  for(const r of data.records){
   if(!Number.isInteger(r.rank)||r.rank<1||ranks.has(r.rank)||
      typeof r.character!=="string"||[...r.character].length!==1||
      !Array.isArray(r.sentenceIds)||r.sentenceIds.length>3||
      r.sentenceIds.some(id=>typeof id!=="string"||!/^\d+$/.test(id))||
      r.readingInContext!=="unverified"||r.lexicalStatus!=="not_approved"||
      new Set(r.sentenceIds).size!==r.sentenceIds.length)
     throw new Error("Invalid or incorrectly approved source ID entry");
   ranks.add(r.rank);associations+=r.sentenceIds.length;
   for(const id of r.sentenceIds)unique.add(id);
  }
  if(associations!==423||unique.size!==363||ranks.size!==142)throw new Error("Source IDs missing");
  entries=data.records;render();
 }catch(error){$("candidate-status").textContent="Source ID data could not be validated: "+error.message;}
}
$("candidate-query").addEventListener("input",()=>{page=0;render();});
$("candidate-scope").addEventListener("change",()=>{page=0;render();});
$("candidate-prev").addEventListener("click",()=>{if(page>0){page--;render();}});
$("candidate-next").addEventListener("click",()=>{page++;render();});
load();
})();