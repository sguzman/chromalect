// Source-ranked unadjudicated written-final research workqueue.
// No phonetic/IPA transcriptions, complete syllable values or study results.
(() => {
"use strict";
const $=id=>document.getElementById(id);
const required=["compound-filter","compound-query","compound-count","compound-status",
 "compound-summary","compound-list"];
if(required.some(id=>!$(id)))return;
let records=[],sourceCitation=[],orthographicRules=[],sourceRuleURL="";
function show(){
 const filter=$("compound-filter").value,q=$("compound-query").value.trim().toLowerCase();
 if(!["all","caution","unflagged"].includes(filter))throw Error("Unknown review filter");
 const found=records.filter(r=>(filter==="all"||
  filter==="caution"&&r.explicitContextCautionUses>0||
  filter==="unflagged"&&r.explicitContextCautionUses===0)&&
  (!q||r.token.toLowerCase().includes(q)||
   r.observedWarningFamilies.some(t=>t.includes(q))||
   r.firstSourceExamples.some(e=>e.character.includes(q)||e.pinyin.toLowerCase().includes(q))));
 $("compound-list").replaceChildren();
 for(const r of found){
  const card=document.createElement("article"),h=document.createElement("h2"),
   evidence=document.createElement("p"),source=document.createElement("p"),
   status=document.createElement("p");
  card.className="compound-card";
  h.textContent="#"+r.reviewRank+" · written final "+r.token;
  evidence.className="compound-meta";
  evidence.textContent=r.sourceCitationUses+" first-tranche source readings · "+
   r.explicitContextCautionUses+" explicitly flagged spelling contexts";
  source.className="compound-samples";
  source.appendChild(document.createTextNode("Earliest source citations: "));
  for(let i=0;i<r.firstSourceExamples.length;i++){
   const example=r.firstSourceExamples[i],c=sourceCitation[example.rank-1];
   const index=c?.readings.findIndex(x=>x.display===example.pinyin&&
    x.initial===example.initial&&x.final===example.final&&x.tone===example.tone);
   if(!Number.isInteger(index)||index<0)
    throw Error("No pinned source citation for research link");
   const link=document.createElement("a");
   link.href="mandarin-encoding-comparison.html#c"+String(example.rank).padStart(4,"0")+
    "-r"+String(index+1);
   link.textContent=example.character+" "+example.pinyin+" (#"+example.rank+")";
   if(i)source.appendChild(document.createTextNode(" · "));
   source.appendChild(link);
  }
  status.className="compound-meta";
  status.textContent="No validated phonological segmentation, no IPA proposal, no human decoding evidence"+
   (r.observedWarningFamilies.length?
   " · Current caution families: "+r.observedWarningFamilies.join(", "):"");
  card.appendChild(h);card.appendChild(evidence);card.appendChild(source);
  card.appendChild(status);
  const matched=orthographicRules.filter(x=>x.writtenFinal===r.token&&
   r.observedWarningFamilies.includes(x.cautionFamily));
  if(matched.length){
   const rule=document.createElement("p");
   rule.className="compound-meta";
   rule.appendChild(document.createTextNode("External spelling-rule reference: "));
   matched.forEach((x,i)=>{
    if(i)rule.appendChild(document.createTextNode(" · "));
    const link=document.createElement("a");
    link.href=sourceRuleURL;
    link.textContent=x.writtenFinal+" → "+x.expandedOrthographicComparison+
     " ("+x.observedSourceReadingUses+" source readings)";
    rule.appendChild(link);
   });
   rule.appendChild(document.createTextNode(" · Written spelling only; no phonetic approval."));
   card.appendChild(rule);
  }
  $("compound-list").appendChild(card);
 }
 $("compound-count").textContent=found.length+" / 27 pending written-final research items";
}
async function load(){
 try{
  const urls=["phonetics/unadjudicated-compound-final-review-queue-v0.1.json",
   "pronunciation-citations-0001-1000.json",
   "phonetics/mandarin-final-spelling-context-gates-v0.1.json",
   "phonetics/external-orthographic-spelling-rule-crosswalk-v0.1.json"];
  const resp=await Promise.all(urls.map(url=>fetch(url)));
  if(resp.some(x=>!x.ok))throw Error("Pinned workqueue or source citations unavailable");
  const [data,source,warnings,external]=await Promise.all(resp.map(x=>x.json()));
  if(data.schema!=="chromalect.phonetics.unadjudicated-compound-final-review-queue.v0.1"||
     data.status!=="research_triage_only_no_proposed_ipa_segmentations_or_accepted_phonemes"||
     source.schema!=="chromalect.pronunciation-citations.v0"||
     source.characters.length!==1000||
     data.sources.sourceBlobSHA!==source.source.blob_sha||
     data.sources.sourcePaletteChanged!==false||
     data.sources.noVerifiedContextualPronunciations!==true||
     data.summary.sourceCharacters!==1000||
     data.summary.totalSourceCitationReadings!==1171||
     data.summary.compoundWrittenFinalCategories!==27||
     data.summary.compoundFinalSourceUses!==739||
     data.summary.contextCautionedCompoundUses!==101||
     data.summary.nonCautionedCompoundUses!==638||
     data.summary.independentFinalPhonologicalApprovals!==0||
     data.summary.approvedContextualPronunciations!==0||
     data.summary.humanDecodingTrials!==0||
     warnings.schema!=="chromalect.phonetics.mandarin-final-spelling-context-gates.v0.1"||
     warnings.summary.flaggedSourceReadings!==213||
     !Array.isArray(data.records)||data.records.length!==27||
     external.schema!=="chromalect.phonetics.external-orthographic-spelling-rule-crosswalk.v0.1"||
     external.status!=="research_only_written_spelling_correspondence_not_phonological_adjudication"||
     external.source.citationBlobSHA!==source.source.blob_sha||
     external.source.noLicensedSentenceTextCopied!==true||
     external.source.componentPaletteChanged!==false||
     external.summary.cautionFamiliesInSource!==9||
     external.summary.externallyCrosscheckedSpellingFamilies!==3||
     external.summary.sourceReadingUsesInThoseFamilies!==63||
     external.summary.remainingCautionFamilies!==6||
     external.summary.remainingSourceReadingUses!==150||
     external.summary.independentPhonologicalApprovals!==0||
     external.summary.humanDecodingTrials!==0||
     external.references.length!==1||
     external.references[0].id!=="polyu-pinyin-spelling"||
     external.references[0].url!=="https://www.polyu.edu.hk/bepth/introduction-to-phonetics/spelling-rules-in-pinyin/?sc_lang=en"||
     !Array.isArray(external.records)||external.records.length!==3)
   throw Error("Workqueue evidence boundary is not valid");
  const warns=new Map();
  for(const r of warnings.records)for(const t of r.observedTokenTriples){
   const key=JSON.stringify([t.initial,t.final,t.tone]);
   if(warns.has(key))throw Error("Overlapping source warning predicates");
   warns.set(key,r.id);
  }
  if(warns.size!==108)throw Error("Missing source spelling caution pairs");
  const referenceCases=[
   ["contracted_iu","iu","iou",24],
   ["contracted_ui","ui","uei",19],
   ["contracted_un_nonpalatal","un","uen",20]
  ];
  let referenced=0;
  for(let i=0;i<referenceCases.length;i++){
   const [family,written,expanded,uses]=referenceCases[i],rule=external.records[i];
   const warning=warnings.records.find(x=>x.id===family);
   if(!warning||warning.observedReadingCount!==uses||
      !warning.observedTokenTriples.every(x=>x.final===written)||
      rule.cautionFamily!==family||rule.writtenFinal!==written||
      rule.expandedOrthographicComparison!==expanded||
      rule.observedSourceReadingUses!==uses||
      rule.sourceRule!=="polyu-pinyin-spelling"||
      rule.comparisonStatus!=="documented_spelling_rule_only"||
      rule.phonologicalRepresentation!==null||
      rule.ipaApproval!==false||rule.contextualReadingApproval!==false)
    throw Error("Unverified external spelling-rule correspondence");
   referenced+=uses;
  }
  if(referenced!==63||
     warnings.records.find(x=>x.id==="palatal_written_un")?.observedReadingCount!==18)
   throw Error("Incomplete separation of written un contexts");
  const counts=new Map();
  for(const c of source.characters)for(const r of c.readings){
   const item=counts.get(r.final)||{total:0,warn:0};
   item.total++;
   if(warns.has(JSON.stringify([r.initial,r.final,r.tone])))item.warn++;
   counts.set(r.final,item);
  }
  const unique=new Set();
  for(let i=0;i<data.records.length;i++){
   const r=data.records[i],base=counts.get(r.token);
   if(unique.has(r.token)||r.reviewRank!==i+1||!base||
      r.sourceCitationUses!==base.total||
      r.explicitContextCautionUses!==base.warn||
      r.proposedIPAForm!==null||
      r.phonologicalSegmentation!=="not_adjudicated"||
      r.independenceOfContrast!=="unreviewed"||
      r.humanDecodingResults!==0||
      r.machineOnlyWrittenCodeAvailable!==true)
    throw Error("Unreviewed source final has false phonetic approval or unsupported counts");
   unique.add(r.token);
   for(const sample of r.firstSourceExamples){
    const original=source.characters[sample.rank-1];
    if(!original||original.character!==sample.character||
       !original.readings.some(x=>x.display===sample.pinyin&&
        x.initial===sample.initial&&x.final===sample.final&&x.tone===sample.tone))
     throw Error("Sample source reading changed");
   }
  }
  const totals=data.records.reduce((acc,r)=>({
   count:acc.count+r.sourceCitationUses,warn:acc.warn+r.explicitContextCautionUses
  }),{count:0,warn:0});
  if(unique.size!==27||totals.count!==739||totals.warn!==101||
     counts.size!==33)throw Error("Incomplete final source cohort");
  records=data.records;sourceCitation=source.characters;
  orthographicRules=external.records;sourceRuleURL=external.references[0].url;
  $("compound-summary").textContent="27 written final categories deferred · 739 source uses · "+
   "101 explicitly cautioned uses · 0 phonological approvals.";
  $("compound-status").textContent="All 27 source identities verified; 3 externally sourced spelling patterns linked, with zero sound approvals.";
  show();
 }catch(e){
  records=[];$("compound-list").replaceChildren();
  $("compound-count").textContent="No source-verified deferred final items";
  $("compound-status").textContent="Unable to validate compound final workqueue: "+e.message;
 }
}
$("compound-filter").addEventListener("change",show);
$("compound-query").addEventListener("input",show);
load();
})();