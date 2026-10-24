/* Source-attributed alternative IPA conventions beside the existing working
   visual features. These are reported proposals, not decoded source acoustics. */
(() => {
"use strict";
const id=prefix=>document.getElementById(prefix);
const initialTarget=id("ipa-source-initial-table");
const finalTarget=id("ipa-source-simple-final-table");
if(!initialTarget&&!finalTarget)return;
const status=id("ipa-source-compare-status");
if(!status)return;
const make=(tag,text)=>{
 const node=document.createElement(tag);
 if(text!==undefined)node.textContent=String(text);
 return node;
};
function row(parent,values,kind="td"){
 const tr=make("tr");
 for(const value of values)tr.appendChild(make(kind,value));
 parent.appendChild(tr);return tr;
}
function renderTable(target,header,records,selector){
 const table=make("table");table.className="ipa-source-table";
 const thead=make("thead");row(thead,header,"th");
 const body=make("tbody");
 for(const x of records)row(body,selector(x));
 table.appendChild(thead);table.appendChild(body);
 const wrap=make("div");wrap.className="ipa-source-scroll";
 wrap.appendChild(table);target.replaceChildren(wrap);
}
async function load(){
 try{
  const responses=await Promise.all([
   fetch("phonetics/mandarin-pinyin-ipa-source-disagreement-v0.1.json"),
   fetch("phonetics/mandarin-initial-feature-candidates-v0.1.json"),
   fetch("phonetics/mandarin-simple-final-feature-candidates-v0.1.json")
  ]);
  if(responses.some(r=>!r.ok))throw Error("Required source comparison missing");
  const [report,initials,finals]=await Promise.all(responses.map(r=>r.json()));
  if(report.schema!=="chromalect.phonetics.mandarin-pinyin-ipa-source-disagreement.v0.1"||
     report.status!=="diction_guide_reports_multiple_ipa_conventions_not_a_single_certified_phonemic_inventory"||
     report.source.year!==2020||
     report.source.author!=="Hana J. Cai"||
     report.counts.originalConsonantalInitials!==21||
     report.counts.sourceReportedInitialComparisons!==21||
     report.counts.initialSourceDisagreementRows!==16||
     report.counts.sourceWorkingInitialExactLinMatches!==19||
     report.counts.simpleFinalComparisonRows!==6||
     report.counts.simpleFinalAllColumnsMatch!==4||
     report.counts.unaddressedComplexWrittenFinals!==27||
     report.counts.independentPhonemicContrastApprovals!==0||
     report.counts.acousticallyValidatedPhoneMappings!==0||
     report.counts.humanDecodingTrials!==0||
     initials.schema!=="chromalect.phonetics.mandarin-initial-feature-candidates.v0.1"||
     initials.statistics.independentlyVerifiedPhonemicContrasts!==0||
     finals.schema!=="chromalect.phonetics.mandarin-simple-final-feature-candidates.v0.1"||
     finals.summary.independentIPAApprovalCount!==0)
   throw Error("Source comparison or scientific status disagrees");
  const originals=new Map(initials.tokens.filter(r=>
   r.category==="conventional_pinyin_initial").map(r=>[r.token,r]));
  const originalFinals=new Map(finals.records.map(r=>[r.token,r]));
  const seen=new Set(),seenFinals=new Set();
  for(const r of report.initials){
   const x=originals.get(r.pinyinInitial);
   if(!x||seen.has(r.pinyinInitial)||x.workingIPACandidate!==r.originalWorkingCandidate||
      r.literalAgreementWithLin!==(r.linReportedIPA===x.workingIPACandidate)||
      r.disagreementsBetweenReports!==(new Set([
       r.linReportedIPA,r.meiReportedIPA,r.caiSuggestedIPA]).size>1)||
      r.sourceApproval!=="published_comparison_only_not_phonemic_adjudication")
    throw Error("IPA initial rows or working visual proposal mismatch");
   seen.add(r.pinyinInitial);
  }
  for(const r of report.simples){
   if(!originalFinals.has(r.writtenFinal)||seenFinals.has(r.writtenFinal)||
      r.sourceComparisonNotDefaultAcousticTarget!==true||
      r.literalAgreementAllColumns!==
       (r.linReportedIPA===r.meiReportedIPA&&r.meiReportedIPA===r.caiSuggestedIPA))
    throw Error("Simple-final IPA source rows mismatched");
   seenFinals.add(r.writtenFinal);
  }
  if(seen.size!==21||seenFinals.size!==6)throw Error("Incomplete IPA source comparison");
  if(initialTarget)renderTable(initialTarget,
   ["Pinyin","Lin (reported)","Mei (reported)","Cai (proposed)","Project working IPA","Working visual features"],
   report.initials,r=>{
    const x=originals.get(r.pinyinInitial);
    return [r.pinyinInitial,r.linReportedIPA,r.meiReportedIPA,r.caiSuggestedIPA,
     r.originalWorkingCandidate,[x.place,x.manner,x.aspiration].join(" · ")];
   });
  if(finalTarget)renderTable(finalTarget,
   ["Written final","Lin (reported)","Mei (reported)","Cai (proposed)","Unapproved visual vowel features","Context caution"],
   report.simples,r=>{
    const f=originalFinals.get(r.writtenFinal);
    return [r.writtenFinal,r.linReportedIPA,r.meiReportedIPA,r.caiSuggestedIPA,
     [f.workingHeight,f.workingBackness,f.workingRounding].join(" · "),
     f.sourceSpellingContextCautions+" / "+f.observedSourceCitationReadings+" flagged citations"];
   });
  status.textContent="21 published initial comparisons (16 rows differ across traditions)"+
    " and 6 simple-final comparisons (2 rows differ). These are alternative notation"+
    " choices, not 27 independently accepted phoneme descriptions.";
 }catch(error){
  initialTarget?.replaceChildren();finalTarget?.replaceChildren();
  status.textContent="Unable to validate IPA source comparisons: "+error.message;
 }
}
load();
})();