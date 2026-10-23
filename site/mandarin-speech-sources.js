// Dataset-source reconnaissance only. Do not present a speech corpus
// as acquired audio, phonological verification or human decoding data.
(() => {
"use strict";
const $=id=>document.getElementById(id);
if(["speech-source-status","speech-source-count","speech-source-list",
 "speech-source-summary"].some(id=>!$(id)))return;
async function load(){
 try{
  const response=await fetch("phonetics/external-speech-source-registry-v0.1.json");
  if(!response.ok)throw Error("External speech source registry unavailable");
  const data=await response.json();
  if(data.schema!=="chromalect.phonetics.external-speech-source-registry.v0.1"||
     data.status!=="source_reconnaissance_only_no_audio_acquisition_or_phonetic_approval"||
     data.provenance.copiedSourceRecordings!==false||
     data.provenance.copiedTranscriptText!==false||
     data.provenance.sourcePaletteChanged!==false||
     Object.values(data.acquisitionPolicy).length!==5||
     !Object.values(data.acquisitionPolicy).every(x=>x===true)||
     data.summary.sourceCandidates!==4||
     data.summary.recordingsDownloaded!==0||
     data.summary.sourceUtterancesMatchedToCitationReadings!==0||
     data.summary.independentlyAnalyzedSpeechTokens!==0||
     data.summary.phonemicInventoryApprovals!==0||
     data.summary.humanDecodingTrials!==0||
     !Array.isArray(data.sources)||data.sources.length!==4)
   throw Error("Acquisition or scientific approval boundaries not satisfied");
  const expected=[
   ["aishell-3-slr93","https://www.openslr.org/93/","Apache-2.0","19 GB"],
   ["aishell-1-slr33","https://openslr.org/33/","Apache-2.0","15 GB"],
   ["common-voice-27-zh-cn","https://commonvoice.mozilla.org/rw/datasets","CC0-1.0","21.40 GB"],
   ["mandi-2022","https://aclanthology.org/2022.lrec-1.213/","CC-BY-NC-3.0",
    "about 9.6 hours of recordings"]
  ];
  const list=$("speech-source-list");list.replaceChildren();
  for(let i=0;i<expected.length;i++){
   const r=data.sources[i],[id,url,license,size]=expected[i];
   if(r.priority!==i+1||r.id!==id||r.publisherPage!==url||
      r.declaredLicense!==license||r.declaredArchiveSize!==size||
      r.acquisitionStatus!=="not_acquired"||
      r.licensingReviewStatus!=="requires_dataset_specific_confirmation_before_reuse"||
      r.readingAlignmentStatus!=="not_established"||
      r.independentAcousticAnalysisStatus!=="not_conducted"||
      !Array.isArray(r.constraints)||r.constraints.length<2)
    throw Error("Source record cannot be promoted to verified speech");
   if(id==="common-voice-27-zh-cn"&&
      (!r.constraints.some(x=>x.includes("speaker identification"))||
       !r.constraints.some(x=>x.includes("rehost or redistribute"))))
    throw Error("Common Voice use restrictions missing");
   if(id==="mandi-2022"&&!r.constraints.some(x=>x.includes("Noncommercial")))
    throw Error("Restricted research terms missing");
   const article=document.createElement("article"),h=document.createElement("h2"),
    meta=document.createElement("p"),use=document.createElement("p"),
    caution=document.createElement("p"),link=document.createElement("a");
   article.className="speech-source-card";
   h.textContent=r.priority+". "+r.name;
   meta.className="speech-source-meta";
   meta.textContent="Publisher: "+r.publisher+" · Declared license: "+r.declaredLicense+
    " · Advertised size: "+r.declaredArchiveSize;
   use.textContent=r.researchRole;
   caution.className="speech-source-meta";
   caution.textContent="Not acquired · per-release license check pending · "+
    r.constraints.join(" · ");
   link.href=r.publisherPage;
   link.textContent="Open original publication or source catalog";
   article.appendChild(h);article.appendChild(meta);article.appendChild(use);
   article.appendChild(caution);article.appendChild(link);
   list.appendChild(article);
  }
  $("speech-source-count").textContent="4 documented corpus leads · 0 recordings acquired";
  $("speech-source-summary").textContent="Source-level research only. No locally verified utterances, "+
   "no source-specific acoustic analyses, no IPA approvals and no human decoding trials.";
  $("speech-source-status").textContent="All source entries verified against pinned acquisition restrictions.";
 }catch(e){
  $("speech-source-list").replaceChildren();
  $("speech-source-count").textContent="No source-verified speech corpus leads";
  $("speech-source-status").textContent="Unable to validate speech-source registry: "+e.message;
 }
}
load();
})();
