// Source citation grammar browser. Provisional initial-feature labels; no IPA or lexical approvals.
(() => {
"use strict";
const $=id=>document.getElementById(id);
const ids=["syllable-query","syllable-tone","syllable-view","syllable-status",
 "syllable-count","syllable-results","syllable-summary"];
if(ids.some(id=>!$(id)))return;
let entries=[],palette=null,initialMap=new Map(),finalGateByTriple=new Map();
const expectedModes=new Set(["plain","tokens","colors"]);
function textElement(tag,content,className){
 const x=document.createElement(tag);
 x.textContent=content;
 if(className)x.className=className;
 return x;
}
function detail(label,value,color){
 const p=document.createElement("p");p.className="syllable-token";
 p.appendChild(textElement("b",label+": "));
 if(color){
  const chip=document.createElement("i");
  chip.className="syllable-chip";chip.style.backgroundColor=color;
  chip.setAttribute("aria-hidden","true");
  p.appendChild(chip);
 }
 p.appendChild(textElement("span",value));
 return p;
}
function display(){
 const q=$("syllable-query").value.trim().toLowerCase(),tone=$("syllable-tone").value,
  mode=$("syllable-view").value;
 if(!expectedModes.has(mode)||!(tone==="all"||["0","1","2","3","4"].includes(tone)))
  throw Error("Invalid comparison settings");
 const selected=entries.filter(x=>(tone==="all"||String(x.tone)===tone)&&
  (!q||x.character.includes(q)||x.display.toLowerCase().includes(q)||
  String(x.rank)===q||x.initial.toLowerCase().includes(q)||x.final.toLowerCase().includes(q)));
 $("syllable-results").replaceChildren();
 const limit=60;
 for(const x of selected.slice(0,limit)){
  const card=document.createElement("article"),h=document.createElement("h2");
  card.className="syllable-card";h.textContent="#"+x.rank+" · "+x.character+" · "+x.display;
  card.appendChild(h);
  const mapped=initialMap.get(x.initial);
  if(mode==="plain"){
   card.appendChild(textElement("p","Plain citation spelling: "+x.display+" · source reading only","syllable-note"));
  }else{
   const code=document.createElement("div");code.className="syllable-code";
   const color=mode==="colors";
   const onset=mapped.category==="conventional_pinyin_initial"?
    mapped.place+" / "+mapped.manner+" / "+mapped.aspiration+
     " (written "+x.initial+")":
    "orthographic-only "+x.initial+" (no consonant tuple)";
   code.appendChild(detail("Initial",onset,color?palette.initial.tokens[x.initial]:null));
   code.appendChild(detail("Final",x.final+" (written remainder; not an IPA rhyme)",
    color?palette.final.tokens[x.final]:null));
   code.appendChild(detail("Tone","T"+x.tone+" · "+palette.tone.symbols[String(x.tone)]+
    " (citation label)",color?palette.tone.tokens[String(x.tone)]:null));
   card.appendChild(code);
  }
  const risk=finalGateByTriple.get(JSON.stringify([x.initial,x.final,x.tone]));
  if(risk)card.appendChild(textElement("p","Final-spelling review: "+risk.description+
   " · No independent IPA approval.","syllable-risk"));
  card.appendChild(textElement("p","No independently verified contextual pronunciation or phonological analysis.","syllable-note"));
  $("syllable-results").appendChild(card);
 }
 $("syllable-count").textContent=selected.length+" matching of 1,171 pinned citation readings · showing "+
  Math.min(selected.length,limit);
}
async function load(){
 try{
  const urls=["pronunciation-citations-0001-1000.json",
   "layers-v0.1.json","phonetics/mandarin-initial-feature-candidates-v0.1.json",
   "phonetics/citation-syllable-orthographic-codec-audit-v0.1.json",
   "phonetics/mandarin-final-spelling-context-gates-v0.1.json"];
  const responses=await Promise.all(urls.map(url=>fetch(url)));
  if(responses.some(r=>!r.ok))throw Error("Published source tranche or codec audit is unavailable");
  const [citations,layers,initials,audit,finalGates]=await Promise.all(responses.map(x=>x.json()));
  if(citations.schema!=="chromalect.pronunciation-citations.v0"||
     citations.tranche!=="0001-1000"||citations.characters.length!==1000||
     layers.schema!=="chromalect.presentation-layers.v0"||
     initials.schema!=="chromalect.phonetics.mandarin-initial-feature-candidates.v0.1"||
     initials.status!=="working_articulatory_candidate_codebook_not_independently_certified_phoneme_inventory"||
     audit.schema!=="chromalect.phonetics.citation-syllable-orthographic-codec-audit.v0.1"||
     audit.status!=="source_attested_reversible_orthographic_grammar_not_phonemic_decoding"||
     audit.counts.sourceCharacters!==1000||audit.counts.sourceReadings!==1171||
     audit.counts.attestedInitialFinalToneTriples!==673||
     audit.counts.initialTokens!==24||audit.counts.finalTokens!==33||audit.counts.toneTokens!==5||
     audit.counts.exactRoundTrips!==1171||audit.counts.roundTripFailures!==0||
     audit.counts.unreviewedFinalPhonologicalCategories!==33||
     audit.counts.independentWordContextReadingApprovals!==0||
     audit.counts.humanDecodingTrials!==0||audit.counts.educationalEffectMeasurements!==0||
     audit.sources.externalIndependentPhonologicalReview!==false)
   throw Error("Source codec evidence is not available for presentation");
  if(finalGates.schema!=="chromalect.phonetics.mandarin-final-spelling-context-gates.v0.1"||
     finalGates.status!=="contextual_spelling_review_flags_not_verified_ipa_or_phonemic_finals"||
     finalGates.source.upstreamBlobSHA!==citations.source.blob_sha||
     finalGates.summary.sourceCitationReadings!==1171||
     finalGates.summary.flaggedSourceReadings!==213||
     finalGates.summary.flaggedDistinctWrittenTriples!==108||
     finalGates.summary.flagCategories!==9||
     finalGates.summary.independentlyAdjudicatedFinalPhonemes!==0||
     finalGates.summary.approvedContextualPronunciations!==0||
     finalGates.summary.approvedAcousticTranscriptions!==0||
     finalGates.summary.learningStudyResults!==0||
     !Array.isArray(finalGates.records)||finalGates.records.length!==9)
   throw Error("Source final-spelling review gates are incomplete");
  finalGateByTriple=new Map();
  for(const row of finalGates.records){
   if(row.independentIPAAnalysisApproved!==false||
     row.certifiedAcousticRealizations!==0||
     !Array.isArray(row.observedTokenTriples)||
     row.observedTokenTriples.length!==row.uniqueCitationTriples)
    throw Error("Unreviewed final-spelling category was incorrectly approved");
   for(const t of row.observedTokenTriples){
    const key=JSON.stringify([t.initial,t.final,t.tone]);
    if(finalGateByTriple.has(key))throw Error("Overlapping phonetic final risk categories");
    finalGateByTriple.set(key,row);
   }
  }
  if(finalGateByTriple.size!==108)throw Error("Incomplete source spelling-context worklist");
  palette=layers.palette_domains;
  if(Object.keys(palette.initial.tokens).length!==24||
     Object.keys(palette.final.tokens).length!==33||
     Object.keys(palette.tone.tokens).length!==5)
   throw Error("Palette token domains diverged from the source grammar");
  initialMap=new Map();
  for(const x of initials.tokens){
   if(initialMap.has(x.token)||!Object.hasOwn(palette.initial.tokens,x.token))
    throw Error("Invalid working initial category");
   initialMap.set(x.token,x);
  }
  if(initialMap.size!==24)throw Error("Not all written source onsets have a code");
  const pairs=new Set(),finals=new Set();entries=[];
  for(let i=0;i<citations.characters.length;i++){
   const x=citations.characters[i];
   if(x.rank!==i+1||!Array.isArray(x.readings))throw Error("Source rank or citation order changed");
   for(const r of x.readings){
    const status=initialMap.get(r.initial);
    if(!status||!Object.hasOwn(palette.final.tokens,r.final)||
       !Object.hasOwn(palette.tone.tokens,String(r.tone))||
       r.orthographic_glide!==(r.initial==="y"||r.initial==="w")||
       status.category!==( ["y","w","∅"].includes(r.initial)?
        "orthographic_onset_convention_not_independent_consonant":"conventional_pinyin_initial"))
     throw Error("Invalid source orthographic citation token");
    pairs.add(JSON.stringify([r.initial,r.final,r.tone]));finals.add(r.final);
    entries.push({...r,rank:x.rank,character:x.character});
   }
  }
  if(entries.filter(r=>finalGateByTriple.has(JSON.stringify([r.initial,r.final,r.tone]))).length!==213)
   throw Error("Final context review flags do not match original reading occurrences");
  if(entries.length!==1171||pairs.size!==673||finals.size!==33)
   throw Error("Published glyph source citation counts changed");
  $("syllable-summary").textContent=
   "1,171 cited readings · 673 distinct observed initial/final/tone combinations · "+
   "24 written initials, 33 written remainders, 5 tone labels · 0 human decoding trials.";
  $("syllable-status").textContent=
   "Source attestation and machine-only orthographic decoding verified. No phonemic inventory approved.";
  display();
 }catch(e){entries=[];$("syllable-results").replaceChildren();
  $("syllable-status").textContent="Unable to validate source grammar: "+e.message;
  $("syllable-count").textContent="No verified citation records";
 }
}
$("syllable-query").addEventListener("input",display);
$("syllable-tone").addEventListener("change",display);
$("syllable-view").addEventListener("change",display);
load();
})();