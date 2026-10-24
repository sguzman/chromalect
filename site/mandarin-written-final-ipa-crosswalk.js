/* Compare all 33 written Pinyin-final symbol controls to candidate
   source-table IPA headings; never infer a complete syllable acoustic IPA. */
(() => {
"use strict";
const $=id=>document.getElementById(id);
if(!$("final-ipa-source-table")||!$("final-ipa-status")||!$("final-filter"))return;
let records=[];
const make=(name,label)=>{
 const e=document.createElement(name);
 if(label!==undefined)e.textContent=String(label);
 return e;
};
function render(){
 const query=$("final-filter").value.trim().toLowerCase();
 const table=make("table");table.className="final-ipa-table";
 const head=make("thead"),hr=make("tr");
 for(const label of ["Written final","Source geometric letters","Cai notation options (not verified pronunciations)",
  "Visual feature proposal","Source readings","Context status"]){
  hr.appendChild(make("th",label));
 }
 head.appendChild(hr);table.appendChild(head);
 const tbody=make("tbody");
 let n=0;
 for(const x of records){
  if(query&&!x.writtenFinal.includes(query))continue;
  const tr=make("tr");
  const alternatives=x.sourceTableIPAOptions.map(y=>
   y.sourceTableRow+" → ["+y.caiProposedNotation+"]").join(" ; ");
  const cells=[x.writtenFinal,x.geometricalWrittenLetters.join(" · "),alternatives,
   x.workingSimpleVowelCandidateAvailable?
    "Provisional simple-vowel feature shape":"Not proposed / source deferral",
   x.sourceCitationOccurrences,
   x.sourceTableRowChoiceRequiresPhoneticContext?
    "Multiple published row candidates; context needed":"One table-heading candidate only; IPA still unapproved"];
  for(const v of cells)tr.appendChild(make("td",v));
  tbody.appendChild(tr);n++;
 }
 table.appendChild(tbody);
 const wrapper=make("div");wrapper.className="final-ipa-scroll";
 wrapper.appendChild(table);
 $("final-ipa-source-table").replaceChildren(wrapper);
 $("final-ipa-status").textContent=n+" / 33 written finals visible, covering 1,171 pinned"+
  " citation readings overall. Six written labels have multiple possible source IPA"+
  " table headings; all full-syllable IPA realizations remain unverified.";
}
async function load(){
 try{
  const urls=["phonetics/mandarin-written-final-ipa-source-crosswalk-v0.1.json",
   "phonetics/written-final-symbol-control-v0.1.json",
   "phonetics/mandarin-simple-final-feature-candidates-v0.1.json",
   "pronunciation-citations-0001-1000.json"];
  const responses=await Promise.all(urls.map(url=>fetch(url)));
  if(responses.some(r=>!r.ok))throw Error("Original source controls unavailable");
  const [data,registry,working,source]=await Promise.all(responses.map(r=>r.json()));
  if(data.schema!=="chromalect.phonetics.mandarin-written-final-ipa-source-crosswalk.v0.1"||
     data.status!=="source_editorial_ipa_labels_not_attested_contextual_or_phonemic_realizations"||
     data.source.year!==2020||
     data.summary.sourceWrittenFinalTypes!==33||
     data.summary.sourceCitationOccurrences!==1171||
     data.summary.sourceEditorialIPAOptionEntries!==37||
     data.summary.simpleWrittenVowelFeatureHypotheses!==6||
     data.summary.complexWrittenFinalsWithoutVowelFeatureProposal!==27||
     data.summary.writtenFinalTypesWithMultipleCandidateTableRows!==6||
     data.summary.phonologicalRepresentationApprovals!==0||
     data.summary.contextualIPARealizationApprovals!==0||
     data.summary.humanIPAComprehensionTrials!==0||
     data.bases.paletteOrGlyphGeometryChanged!==false||
     registry.schema!=="chromalect.phonetics.written-final-symbol-control.v0.1"||
     registry.status!=="arbitrary_geometric_written_letter_control_not_articulatory_or_ipa"||
     registry.records.length!==33||
     working.schema!=="chromalect.phonetics.mandarin-simple-final-feature-candidates.v0.1"||
     working.summary.independentIPAApprovalCount!==0||
     source.schema!=="chromalect.pronunciation-citations.v0"||
     source.characters.length!==1000)
   throw Error("IPA source crosswalk or scientific approval counts changed");
  const originals=new Map(registry.records.map(r=>[r.token,r]));
  const proposed=new Set(working.records.map(r=>r.token));
  const frequencies=new Map();
  for(const char of source.characters)for(const reading of char.readings)
   frequencies.set(reading.final,(frequencies.get(reading.final)||0)+1);
  const seen=new Set();let total=0,ambiguous=0;
  for(const item of data.records){
   const actual=originals.get(item.writtenFinal);
   if(!actual||seen.has(item.writtenFinal)||
      JSON.stringify(item.geometricalWrittenLetters)!==
        JSON.stringify(actual.symbolLetters)||
      item.sourceCitationOccurrences!==frequencies.get(item.writtenFinal)||
      item.workingSimpleVowelCandidateAvailable!==proposed.has(item.writtenFinal)||
      item.hasApprovedFeaturalGrapheme!==false||
      item.candidateFullSyllableIPAAsserted!==false||
      item.contextualIPAAdjudication!=="not_done"||
      !Array.isArray(item.sourceTableIPAOptions)||
      item.sourceTableIPAOptions.length<1||
      item.sourceTableRowChoiceRequiresPhoneticContext!==
        (item.sourceTableIPAOptions.length>1))
    throw Error("Unknown or promoted source final IPA mapping");
   for(const option of item.sourceTableIPAOptions)
    if(typeof option.caiProposedNotation!=="string"||
       !option.caiProposedNotation.length||
       !Number.isInteger(option.sourcePrintedPage)||
       option.sourcePrintedPage<27||option.sourcePrintedPage>29)
     throw Error("Unattributed source IPA row");
   seen.add(item.writtenFinal);
   total+=item.sourceCitationOccurrences;
   if(item.sourceTableRowChoiceRequiresPhoneticContext)ambiguous++;
  }
  if(seen.size!==33||total!==1171||ambiguous!==6)
   throw Error("Incomplete source-final crosswalk");
  records=data.records;
  render();
 }catch(e){
  records=[];
  $("final-ipa-source-table").replaceChildren();
  $("final-ipa-status").textContent="Unable to validate IPA final crosswalk: "+e.message;
 }
}
$("final-filter").addEventListener("input",render);
load();
})();