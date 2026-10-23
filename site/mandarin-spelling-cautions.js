// Nine source-specific Mandarin spelling/phonetic caution families.
// Rule links and phonetic reference leads must not be interpreted as IPA approval.
(() => {
"use strict";
const $=id=>document.getElementById(id);
const ids=["caution-filter","caution-query","caution-count","caution-status",
 "caution-summary","caution-list"];
if(ids.some(id=>!$(id)))return;
let rows=[],sources=[],links=new Map();
function show(){
 const filter=$("caution-filter").value,q=$("caution-query").value.trim().toLowerCase();
 if(!["all","spelling","phonetic"].includes(filter))throw Error("Unknown caution filter");
 const shown=rows.filter(r=>{
  const entry=links.get(r.id);
  return (filter==="all"||entry.kind===filter)&&
   (!q||r.id.toLowerCase().includes(q)||
    entry.token.includes(q)||r.firstSourceExamples.some(e=>
     e.character.includes(q)||e.display.toLowerCase().includes(q)));
 });
 $("caution-list").replaceChildren();
 for(const r of shown){
  const card=document.createElement("article"),head=document.createElement("h2"),
   count=document.createElement("p"),state=document.createElement("p"),
   examples=document.createElement("p"),reference=document.createElement("p");
  const entry=links.get(r.id);
  card.className="caution-card";
  head.textContent=r.id.replaceAll("_"," ")+" · written final "+entry.token;
  count.className="caution-meta";
  count.textContent=r.observedReadingCount+" pinned source readings · "+
   r.uniqueCitationTriples+" distinct written initial/final/tone triples";
  state.className="caution-meta";
  state.textContent=entry.kind==="spelling"?
   "Published orthographic comparison only · no approved IPA or phonology":
   "Phonetic reference lead only · no independently verified acoustic result or IPA";
  examples.className="caution-examples";
  examples.appendChild(document.createTextNode("Pinned reading examples: "));
  for(let i=0;i<r.firstSourceExamples.length&&i<3;i++){
   const e=r.firstSourceExamples[i],c=sources[e.rank-1];
   const index=c?.readings.findIndex(x=>x.display===e.display&&
    x.initial===e.initial&&x.final===e.final&&x.tone===e.tone);
   if(!Number.isInteger(index)||index<0||c.character!==e.character)
    throw Error("Pinned example no longer matches citation source");
   const a=document.createElement("a");
   a.href="mandarin-encoding-comparison.html#c"+String(e.rank).padStart(4,"0")+
    "-r"+String(index+1);
   a.textContent=e.character+" "+e.display+" (#"+e.rank+")";
   if(i)examples.appendChild(document.createTextNode(" · "));
   examples.appendChild(a);
  }
  reference.className="caution-meta";
  reference.appendChild(document.createTextNode(entry.kind==="spelling"?
   "Documented written comparison: "+entry.token+" → "+entry.comparison+
    " · "+"Source: ":"Source lead: "));
  const a=document.createElement("a");a.href=entry.url;a.textContent=entry.title;
  reference.appendChild(a);
  card.appendChild(head);card.appendChild(count);card.appendChild(state);
  card.appendChild(examples);card.appendChild(reference);
  $("caution-list").appendChild(card);
 }
 $("caution-count").textContent=shown.length+" / 9 source-specific caution families";
}
async function load(){
 try{
  const urls=[
   "phonetics/mandarin-final-spelling-context-gates-v0.1.json",
   "phonetics/external-orthographic-spelling-rule-crosswalk-v0.1.json",
   "phonetics/external-umlaut-spelling-rule-crosswalk-v0.1.json",
   "phonetics/unresolved-phonetic-reference-leads-v0.1.json",
   "pronunciation-citations-0001-1000.json"
  ];
  const responses=await Promise.all(urls.map(url=>fetch(url)));
  if(responses.some(r=>!r.ok))throw Error("Source-ledger retrieval failed");
  const [gates,contracted,umlaut,leads,citations]=await Promise.all(responses.map(r=>r.json()));
  if(gates.schema!=="chromalect.phonetics.mandarin-final-spelling-context-gates.v0.1"||
     gates.summary.flaggedSourceReadings!==213||gates.records.length!==9||
     citations.schema!=="chromalect.pronunciation-citations.v0"||
     citations.characters.length!==1000||
     gates.source.upstreamBlobSHA!==citations.source.blob_sha||
     contracted.schema!=="chromalect.phonetics.external-orthographic-spelling-rule-crosswalk.v0.1"||
     umlaut.schema!=="chromalect.phonetics.external-umlaut-spelling-rule-crosswalk.v0.1"||
     leads.schema!=="chromalect.phonetics.unresolved-phonetic-reference-leads.v0.1"||
     contracted.source.citationBlobSHA!==citations.source.blob_sha||
     umlaut.source.citationBlobSHA!==citations.source.blob_sha||
     leads.source.citationBlobSHA!==citations.source.blob_sha||
     contracted.status!=="research_only_written_spelling_correspondence_not_phonological_adjudication"||
     umlaut.status!=="research_only_written_spelling_correspondence_not_phonological_adjudication"||
     leads.status!=="two_remaining_caution_families_have_reference_leads_not_approved_analysis"||
     contracted.summary.sourceReadingUsesInThoseFamilies!==63||
     umlaut.summary.sourceReadingUsesInThoseFamilies!==71||
     leads.summary.remainingSourceReadingUses!==79||
     leads.summary.phonologicalRepresentationsApproved!==0||
     leads.summary.sourceReadingOccurrencesCheckedForAudio!==0||
     contracted.records.length!==3||umlaut.records.length!==4||leads.records.length!==2||
     contracted.references.length!==1||umlaut.references.length!==1||
     leads.references.length!==2)
   throw Error("Research evidence status or source identity differs");
  const expected=[
   ["contracted_iu","iu","iou",24],
   ["contracted_ui","ui","uei",19],
   ["contracted_un_nonpalatal","un","uen",20],
   ["palatal_written_u","u","ü",33],
   ["palatal_written_un","un","ün",18],
   ["palatal_written_ue","ue","üe",10],
   ["palatal_written_uan","uan","üan",10]
  ];
  const spelling=[...contracted.records,...umlaut.records];
  const referenceURL="https://www.polyu.edu.hk/bepth/introduction-to-phonetics/spelling-rules-in-pinyin/?sc_lang=en";
  if(contracted.references[0].url!==referenceURL||umlaut.references[0].url!==referenceURL)
   throw Error("Spelling-reference URL changed");
  const index=new Map(gates.records.map(r=>[r.id,r]));
  if(index.size!==9)throw Error("Caution family identity collision");
  const result=new Map();
  for(let i=0;i<expected.length;i++){
   const [id,token,comparison,count]=expected[i],record=spelling[i],gate=index.get(id);
   if(!gate||!record||record.cautionFamily!==id||record.writtenFinal!==token||
      record.expandedOrthographicComparison!==comparison||
      record.observedSourceReadingUses!==count||
      gate.observedReadingCount!==count||
      record.comparisonStatus!=="documented_spelling_rule_only"||
      record.phonologicalRepresentation!==null||
      record.ipaApproval!==false||record.contextualReadingApproval!==false)
    throw Error("Spelling crosswalk is not source-bound");
   result.set(id,{kind:"spelling",token,comparison,url:referenceURL,title:"PolyU spelling rules"});
  }
  const expectedLeads=[
   ["post_sibilant_i","i",63,"lmu-mandarin-vowels",
    "https://www.phonetik.uni-muenchen.de/studium/skripten/languagedemos/Demos/mandarin.html"],
   ["labial_written_o","o",16,"polyu-simple-finals",
    "https://www.polyu.edu.hk/bepth/introduction-to-phonetics/simple-finals/?sc_lang=en"]
  ];
  for(let i=0;i<expectedLeads.length;i++){
   const [id,token,count,ref,url]=expectedLeads[i],record=leads.records[i],
    source=leads.references[i],gate=index.get(id);
   if(!gate||record.cautionFamily!==id||record.writtenFinal!==token||
      record.observedSourceReadingUses!==count||gate.observedReadingCount!==count||
      record.sourceLead!==ref||source.id!==ref||source.url!==url||
      record.phoneticEvidenceStatus!=="external_description_lead_only"||
      record.proposedIPAForm!==null||record.phonemeInventoryApproval!==false||
      record.sourceSpecificAcousticVerification!==false||
      record.contextualPronunciationApproval!==false||record.humanDecodingTrials!==0)
    throw Error("Phonetic reference is not an unapproved source lead");
   result.set(id,{kind:"phonetic",token,url,title:source.publisher});
  }
  if(result.size!==9||
     [...index.values()].reduce((n,r)=>n+r.observedReadingCount,0)!==213||
     [...index.values()].some(r=>r.independentIPAAnalysisApproved!==false||
      r.certifiedAcousticRealizations!==0||
      r.firstSourceExamples.length===0))
   throw Error("Unverified caution inventory or phonetic approval");
  links=result;sources=citations.characters;rows=gates.records;
  $("caution-summary").textContent="9 source-specific families · 213 first-tranche reading occurrences · "+
   "7 published spelling-rule correspondences (134 uses) · 2 phonetic research leads (79 uses) · 0 IPA approvals.";
  $("caution-status").textContent="Original source readings and independent reference statuses verified.";
  show();
 }catch(error){
  links=new Map();rows=[];
  $("caution-list").replaceChildren();
  $("caution-count").textContent="No validated caution inventory";
  $("caution-status").textContent="Unable to verify research caution sources: "+error.message;
 }
}
$("caution-filter").addEventListener("change",show);
$("caution-query").addEventListener("input",show);
load();
})();
