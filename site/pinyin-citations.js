// Browser for source-pinned citation Pinyin spelling; never contextual or phonemic approval.
(() => {
"use strict";
const $=id=>document.getElementById(id);
const ids=["pinyin-query","pinyin-tone","pinyin-stats","pinyin-results","pinyin-status"];
if(ids.some(id=>!$(id)))return;
let entries=[],palette=null;
function render(){
 const q=$("pinyin-query").value.trim().toLowerCase(),tone=$("pinyin-tone").value;
 const shown=entries.filter(r=>(tone==="all"||String(r.tone)===tone)&&
  (!q||r.character.includes(q)||r.display.toLowerCase().includes(q)||
   String(r.rank)===q||r.initial.toLowerCase()===q||r.final.toLowerCase()===q));
 const limit=60;
 $("pinyin-results").replaceChildren();
 for(const r of shown.slice(0,limit)){
  const article=document.createElement("article"),heading=document.createElement("h2"),
   details=document.createElement("p"),colors=document.createElement("div"),source=document.createElement("p");
  article.className="pinyin-card";heading.textContent=r.character+" · "+r.display;
  details.className="pinyin-meta";
  details.textContent="Rank "+r.rank+" · written initial "+r.initial+" · spelling remainder "+r.final+
   " · citation tone "+r.tone+(r.orthographic_glide?" · y/w orthographic glide":"");
  colors.className="pinyin-colors";
  for(const [label,value,color] of [
   ["Initial",r.initial,palette.initial.tokens[r.initial]],
   ["Final",r.final,palette.final.tokens[r.final]],
   ["Tone",String(r.tone),palette.tone.tokens[String(r.tone)]]]){
   const item=document.createElement("span"),chip=document.createElement("i");
   item.textContent=label+" "+value+" ";chip.className="pinyin-chip";
   chip.style.backgroundColor=color;chip.setAttribute("aria-hidden","true");
   item.appendChild(chip);colors.appendChild(item);
  }
  source.className="pinyin-meta";source.textContent="Listed source reading, not word-context pronunciation or IPA";
  article.appendChild(heading);article.appendChild(details);
  article.appendChild(colors);article.appendChild(source);
  $("pinyin-results").appendChild(article);
 }
 $("pinyin-stats").textContent=shown.length+" matching citation readings · displaying "+Math.min(shown.length,limit)+"; 0 contextual reading approvals";
}
async function load(){
 try{
  const responses=await Promise.all([
   fetch("pronunciation-citations-0001-1000.json"),
   fetch("layers-v0.1.json"),
   fetch("phonetics/pinyin-citation-orthography-audit-v0.1.json")]);
  if(responses.some(r=>!r.ok))throw Error("One or more pinned public research inputs are unavailable");
  const [citations,layers,audit]=await Promise.all(responses.map(r=>r.json()));
  if(citations.schema!=="chromalect.pronunciation-citations.v0"||
     citations.tranche!=="0001-1000"||citations.characters.length!==1000||
     layers.schema!=="chromalect.presentation-layers.v0"||
     audit.schema!=="chromalect.phonetics.pinyin-citation-orthography-audit.v0.1"||
     audit.status!=="reversible_pinyin_spelling_baseline_not_phonemic_or_contextual_reading_verification"||
     audit.counts.characters!==1000||audit.counts.citationReadings!==1171||
     audit.counts.roundTripMatches!==1171||audit.counts.roundTripFailures!==0||
     audit.counts.contextualPronunciationApprovals!==0||
     audit.counts.verifiedPhonemicContrasts!==0||
     audit.counts.learningStudyResults!==0)
   throw Error("Source identity or nonapproval metadata failed");
  palette=layers.palette_domains;
  if(Object.keys(palette.initial.tokens).length!==24||
     Object.keys(palette.final.tokens).length!==33||
     Object.keys(palette.tone.tokens).length!==5)throw Error("Palette domain mismatch");
  let neutral=0,glides=0;
  entries=citations.characters.flatMap((x,index)=>{
   if(x.rank!==index+1||!Array.isArray(x.readings)||!x.readings.length)
    throw Error("Invalid citation record sequence");
   return x.readings.map(r=>{
    if(!Object.hasOwn(palette.initial.tokens,r.initial)||
       !Object.hasOwn(palette.final.tokens,r.final)||
       !Object.hasOwn(palette.tone.tokens,String(r.tone))||
       r.orthographic_glide!==(r.initial==="y"||r.initial==="w")||
       r.display.normalize("NFD").replace(/[\u0304\u0301\u030c\u0300]/g,"").normalize("NFC")!==
         (r.initial==="∅"?"":r.initial)+r.final)
     throw Error("Written source/Pinyin token correspondence failed");
    if(r.tone===0)neutral++;
    if(r.orthographic_glide)glides++;
    return {...r,rank:x.rank,character:x.character};
   });
  });
  if(entries.length!==1171||neutral!==audit.counts.neutralToneLabels||
    glides!==audit.counts.orthographicGlides)
   throw Error("Incomplete citation reading inventory");
  render();
  $("pinyin-status").textContent="1,171 source-aligned citation spellings, 1,000 characters. No contextual or phonemic certification.";
 }catch(e){entries=[];$("pinyin-results").replaceChildren();
  $("pinyin-status").textContent="Unable to validate citation source: "+e.message;}
}
$("pinyin-query").addEventListener("input",render);
$("pinyin-tone").addEventListener("change",render);
load();
})();