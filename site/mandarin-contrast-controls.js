// Source-orthography research controls. They are not validated spoken minimal pairs.
(() => {
"use strict";
const $=id=>document.getElementById(id);
const ids=["contrast-type","contrast-search","contrast-status","contrast-summary",
 "contrast-count","contrast-results"];
if(ids.some(id=>!$(id)))return;
const types=["tone_label","working_aspiration_pair","one_letter_written_final"];
const titles={
 tone_label:"Citation tone-label contrast",
 working_aspiration_pair:"Working aspiration-category contrast",
 one_letter_written_final:"One-letter written-final contrast"
};
let candidates=[];
function render(){
 const type=$("contrast-type").value,q=$("contrast-search").value.trim().toLowerCase();
 if(type!=="all"&&!types.includes(type))throw Error("Unsupported source contrast");
 const shown=candidates.filter(r=>(type==="all"||r.type===type)&&
  (!q||[r.left,r.right].some(v=>v.character.includes(q)||v.display.toLowerCase().includes(q)||
   v.initial.includes(q)||v.final.includes(q)||String(v.rank)===q)));
 $("contrast-results").replaceChildren();
 const limit=50;
 for(const record of shown.slice(0,limit)){
  const article=document.createElement("article"),title=document.createElement("h2"),
   pair=document.createElement("div"),notes=document.createElement("p");
  article.className="contrast-card";title.textContent=titles[record.type];
  pair.className="contrast-pair";
  for(const item of [record.left,record.right]){
   const half=document.createElement("div"),hanzi=document.createElement("span"),
    pinyin=document.createElement("strong"),detail=document.createElement("small");
   half.className="contrast-half";hanzi.className="contrast-hanzi";hanzi.textContent=item.character;
   hanzi.lang="zh-Hans";pinyin.textContent=item.display;
   detail.textContent="Rank "+item.rank+" · initial "+item.initial+" · written final "+
    item.final+" · T"+item.tone;
   half.appendChild(hanzi);half.appendChild(pinyin);half.appendChild(detail);pair.appendChild(half);
  }
  notes.className="contrast-note";
  notes.textContent=record.qualifier+". Unreviewed written-label comparison; no audio or contextual pronunciation approval.";
  article.appendChild(title);article.appendChild(pair);article.appendChild(notes);
  $("contrast-results").appendChild(article);
 }
 $("contrast-count").textContent=shown.length+" matching of 710 source spelling controls · displaying "+
  Math.min(shown.length,limit);
}
async function load(){
 try{
  const responses=await Promise.all([
   fetch("phonetics/citation-orthographic-contrast-controls-v0.1.json"),
   fetch("pronunciation-citations-0001-1000.json"),
   fetch("phonetics/citation-syllable-orthographic-codec-audit-v0.1.json")]);
  if(responses.some(r=>!r.ok))throw Error("Source controls or citation audit unavailable");
  const [data,src,grammar]=await Promise.all(responses.map(x=>x.json()));
  if(data.schema!=="chromalect.phonetics.citation-orthographic-contrast-controls.v0.1"||
     data.status!=="source_attested_written_token_experiment_candidates_not_confirmed_phonetic_minimal_pairs"||
     src.schema!=="chromalect.pronunciation-citations.v0"||
     src.tranche!=="0001-1000"||src.characters.length!==1000||
     grammar.schema!=="chromalect.phonetics.citation-syllable-orthographic-codec-audit.v0.1"||
     grammar.counts.exactRoundTrips!==1171||grammar.counts.attestedInitialFinalToneTriples!==673||
     data.summary.sourceCitationReadings!==1171||data.summary.distinctAttestedTriples!==673||
     data.summary.candidatePairs!==710||
     data.summary.byType.tone_label!==533||
     data.summary.byType.working_aspiration_pair!==89||
     data.summary.byType.one_letter_written_final!==88||
     data.summary.independentlyVerifiedPhoneticPairs!==0||
     data.summary.approvedContextualPronunciationComparisons!==0||
     data.summary.humanListeningOrDecodingTrials!==0||
     data.interpretation.candidatePairsAreValidatedSpokenMinimalPairs!==false||
     data.source.upstreamBlobSHA!==src.source.blob_sha||
     !Array.isArray(data.records)||data.records.length!==710)
    throw Error("Comparison source or nonapproval metadata invalid");
  const sourceTriples=new Map();
  for(const c of src.characters)for(const r of c.readings){
   const key=JSON.stringify([r.initial,r.final,r.tone]);
   if(!sourceTriples.has(key))sourceTriples.set(key,{rank:c.rank,character:c.character,display:r.display});
  }
  const seen=new Set(),counts=Object.fromEntries(types.map(t=>[t,0]));
  for(const r of data.records){
   if(seen.has(r.id)||!types.includes(r.type)||
      r.independentPhonemicContrastVerified!==false||
      r.contextualPronunciationVerified!==false||
      r.contrastLearningEffectMeasured!==false)
    throw Error("Unadjudicated source pair wrongly promoted");
   seen.add(r.id);counts[r.type]++;
   for(const sample of [r.left,r.right]){
    const source=sourceTriples.get(JSON.stringify([sample.initial,sample.final,sample.tone]));
    if(!source||source.rank!==sample.rank||source.character!==sample.character||
       source.display!==sample.display)
     throw Error("Contrast evidence does not match first attested source record");
   }
   const a=r.left,b=r.right;
   if(r.type==="tone_label"&&
       (a.initial!==b.initial||a.final!==b.final||a.tone===b.tone))
    throw Error("Invalid tone control");
   if(r.type==="working_aspiration_pair"&&
       (a.final!==b.final||a.tone!==b.tone||
        !Object.hasOwn(data.summary.aspirationPairCoverage,a.initial+"/"+b.initial)))
    throw Error("Invalid provisional aspiration control");
   if(r.type==="one_letter_written_final"){
    const ac=[...a.final],bc=[...b.final];
    if(a.initial!==b.initial||a.tone!==b.tone||ac.length!==bc.length||
      ac.filter((c,i)=>c!==bc[i]).length!==1)
     throw Error("Final difference is not one written code point");
   }
  }
  if(seen.size!==710||types.some(t=>counts[t]!==data.summary.byType[t]))
   throw Error("Incomplete comparison cohort");
  candidates=data.records;
  $("contrast-summary").textContent="533 tone-label, 89 working aspiration, "+
   "88 written-final controls · 673 source triples · 0 validated phonetic pairs.";
  $("contrast-status").textContent="Reconstructed controls match the pinned source citation entries; unreviewed.";
  render();
 }catch(e){candidates=[];$("contrast-results").replaceChildren();
  $("contrast-status").textContent="Unable to verify research controls: "+e.message;
  $("contrast-count").textContent="No validated source comparison records";}
}
$("contrast-type").addEventListener("change",render);
$("contrast-search").addEventListener("input",render);
load();
})();