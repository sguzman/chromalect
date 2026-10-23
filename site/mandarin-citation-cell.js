// Source-pinned character-cell citation encoding demonstration.
// Annotations stay outside the native glyph. No contextual or human readability approvals.
(() => {
"use strict";
const $=id=>document.getElementById(id);
const ids=["cell-query","cell-reading","cell-color","cell-initial","cell-final","cell-tone",
 "cell-final-symbols","cell-initial-symbols","cell-simple-feature","cell-status","cell-code","cell-risk","cell-native","cell-top","cell-side","cell-bottom","cell-source"];
if(ids.some(id=>!$(id)))return;
const NS="http://www.w3.org/2000/svg";
let entries=[],onsets=new Map(),palette=null,tones=new Map(),finalGlyphs=new Map(),finalPrimitives=[],riskByTriple=new Map(),simpleFinals=new Map(),selectedIndex=0;
const placePaths={
 bilabial:"M10 26 C10 8 90 8 90 26 C90 44 10 44 10 26 Z",
 labiodental:"M13 11 H87 V41 H13 Z",
 alveolar:"M50 5 L92 44 H8 Z",
 velar:"M50 4 L92 26 L50 48 L8 26 Z",
 alveolopalatal:"M50 5 L90 20 L74 46 L26 46 L10 20 Z",
 postalveolar:"M25 7 H75 L94 26 L75 45 H25 L6 26 Z"
};
const mannerPaths={
 stop:"M44 18 H56 V33 H44 Z",
 nasal:"M38 33 V20 Q44 10 50 27 Q56 43 62 20 V33",
 fricative:"M34 19 L42 32 L50 19 L58 32 L66 19",
 lateral:"M40 17 V34 H63",
 affricate:"M38 18 H47 V33 H38 Z M53 19 L60 32 L67 19",
 approximant:"M34 31 Q50 8 66 31"
};
const breathPaths={unaspirated:"M102 19 V33",aspirated:"M100 16 L108 24 L100 32 M110 16 L118 24 L110 32"};
function setMessage(message){$("cell-status").textContent=message;}
function makeText(value,klass){
 const x=document.createElement("span");x.textContent=value;
 if(klass)x.className=klass;
 return x;
}
function toneDisplay(tone,color){
 const holder=document.createElement("div");holder.className="cell-tone-display";
 const t=tones.get(String(tone));
 if(tone===0){
  holder.appendChild(makeText("T0 · no fixed neutral contour","cell-caption"));
  return holder;
 }
 const svg=document.createElementNS(NS,"svg");
 svg.setAttribute("viewBox","0 0 160 85");svg.setAttribute("role","img");
 svg.setAttribute("aria-label","Idealized citation tone "+tone+" contour "+t.levels.join("–"));
 svg.classList.add("cell-tone-svg");
 const poly=document.createElementNS(NS,"polyline");
 poly.setAttribute("points",t.levels.map((n,i)=>
  (16+i*128/(t.levels.length-1)).toFixed(1)+","+(75-(n-1)*14).toFixed(1)).join(" "));
 poly.setAttribute("fill","none");poly.setAttribute("stroke",color?palette.tone.tokens[String(tone)]:"currentColor");
 poly.setAttribute("stroke-width","5");poly.setAttribute("stroke-linecap","round");
 poly.setAttribute("stroke-linejoin","round");
 svg.appendChild(poly);holder.appendChild(svg);
 holder.appendChild(makeText("T"+tone+" · "+t.symbol,"cell-caption"));
 return holder;
}


function initialGeometricSymbol(feature){
 if(feature.category!=="conventional_pinyin_initial")return null;
 if(!Object.hasOwn(placePaths,feature.place)||
    !Object.hasOwn(mannerPaths,feature.manner)||
    (feature.aspiration!=="none"&&!Object.hasOwn(breathPaths,feature.aspiration)))
  throw Error("Initial feature is missing geometric code");
 const element=(name,attributes={})=>{
  const node=document.createElementNS(NS,name);
  for(const [key,value] of Object.entries(attributes))node.setAttribute(key,value);
  return node;
 };
 const svg=element("svg",{viewBox:"0 0 126 54",role:"img",
  "aria-label":feature.token+" provisional source-category shape for "+
   feature.place+", "+feature.manner+", "+feature.aspiration});
 svg.classList.add("cell-initial-svg");
 svg.appendChild(element("path",{d:placePaths[feature.place],fill:"none",
   stroke:"currentColor","stroke-width":3.2,"stroke-linejoin":"round"}));
 svg.appendChild(element("path",{d:mannerPaths[feature.manner],
  fill:["stop","affricate"].includes(feature.manner)?"currentColor":"none",
  stroke:"currentColor","stroke-width":3.5,
  "stroke-linecap":"round","stroke-linejoin":"round"}));
 if(feature.aspiration!=="none")
  svg.appendChild(element("path",{d:breathPaths[feature.aspiration],fill:"none",
   stroke:"currentColor","stroke-width":2.8,"stroke-linecap":"round"}));
 return svg;
}


function workingVowelMarker(record,color){
 const x={front:18,central:64,back:110}[record.workingBackness];
 const y={close:18,mid:44,open:70}[record.workingHeight];
 if(!x||!y)throw Error("Unsupported hypothetical simple-vowel feature tuple");
 const svg=document.createElementNS(NS,"svg");
 svg.classList.add("cell-vowel-svg");
 svg.setAttribute("viewBox","0 0 130 86");svg.setAttribute("role","img");
 svg.setAttribute("aria-label",record.token+" unapproved working vowel "+
  record.workingHeight+", "+record.workingBackness+", "+record.workingRounding);
 const outer=document.createElementNS(NS,"circle");
 outer.setAttribute("cx",String(x));outer.setAttribute("cy",String(y));
 outer.setAttribute("r","11");outer.setAttribute("fill","none");
 outer.setAttribute("stroke",color?palette.final.tokens[record.token]:"currentColor");
 outer.setAttribute("stroke-width","4");
 svg.appendChild(outer);
 if(record.workingRounding==="rounded"){
  const inner=document.createElementNS(NS,"circle");
  inner.setAttribute("cx",String(x));inner.setAttribute("cy",String(y));
  inner.setAttribute("r","4");
  inner.setAttribute("fill",color?palette.final.tokens[record.token]:"currentColor");
  svg.appendChild(inner);
 }
 return svg;
}

function finalGeometricSymbols(final){
 const record=finalGlyphs.get(final);
 if(!record)throw Error("Missing source written-final geometric control");
 const svg=document.createElementNS(NS,"svg"),width=record.iconRegistryIndices.length*48;
 svg.setAttribute("viewBox","0 0 "+width+" 52");
 svg.setAttribute("role","img");
 svg.setAttribute("aria-label","Arbitrary geometric written-final code, not a phonetic feature");
 svg.classList.add("cell-final-svg");
 for(let i=0;i<record.iconRegistryIndices.length;i++){
  const group=document.createElementNS(NS,"g"),path=document.createElementNS(NS,"path");
  const primitive=finalPrimitives[record.iconRegistryIndices[i]];
  group.setAttribute("transform","translate("+(i*48)+",0)");
  path.setAttribute("d",primitive.path);
  path.setAttribute("fill","none");path.setAttribute("stroke","currentColor");
  path.setAttribute("stroke-width","3.2");path.setAttribute("stroke-linejoin","round");
  group.appendChild(path);svg.appendChild(group);
 }
 return svg;
}

function decorate(node,color){
 if(color){node.style.borderColor=color;node.style.borderWidth="3px";}
 else{node.style.borderColor="";node.style.borderWidth="";}
}
function render(){
 const entry=entries[selectedIndex],choice=Number($("cell-reading").value);
 const r=entry?.readings[choice];
 if(!r)throw Error("Selected citation reading is outside source");
 const colored=$("cell-color").checked;
 $("cell-native").textContent=entry.character;
 $("cell-code").textContent="Rank "+entry.rank+" · "+entry.character+" · "+r.display+
  " · source citation spelling only";
 const risk=riskByTriple.get(JSON.stringify([r.initial,r.final,r.tone]));
 $("cell-risk").textContent=risk?
  "Written-final research flag: "+risk.description+" · no independently approved IPA interpretation":
  "No listed spelling-exception flag; absence is not independent phonological certification.";
 $("cell-top").replaceChildren();
 $("cell-side").replaceChildren();
 $("cell-bottom").replaceChildren();
 if($("cell-tone").checked){
  const label=document.createElement("div");label.className="cell-addon";
  decorate(label,colored?palette.tone.tokens[String(r.tone)]:null);
  label.appendChild(toneDisplay(r.tone,colored));
  $("cell-top").appendChild(label);
 }
 if($("cell-initial").checked){
  const feature=onsets.get(r.initial);
  const label=document.createElement("div");label.className="cell-addon";
  decorate(label,colored?palette.initial.tokens[r.initial]:null);
  label.appendChild(makeText("Initial: "+r.initial,"cell-token"));
  if($("cell-initial-symbols").checked){
   const geometric=initialGeometricSymbol(feature);
   if(geometric)label.appendChild(geometric);
   else label.appendChild(makeText("No consonant shape: written onset convention","cell-caption"));
  }
  label.appendChild(makeText(feature.category==="conventional_pinyin_initial"?
   feature.place+" · "+feature.manner+" · "+feature.aspiration:
   "orthographic onset only, no consonant tuple","cell-caption"));
  $("cell-side").appendChild(label);
 }
 if($("cell-final").checked){
  const label=document.createElement("div");label.className="cell-addon";
  decorate(label,colored?palette.final.tokens[r.final]:null);
  label.appendChild(makeText("Final: "+r.final,"cell-token"));
  if($("cell-simple-feature").checked){
   const vowel=simpleFinals.get(r.final);
   if(vowel){
    label.appendChild(workingVowelMarker(vowel,colored));
    label.appendChild(makeText("Unapproved "+vowel.workingHeight+" · "+vowel.workingBackness+
     " · "+vowel.workingRounding+" (source spelling only)","cell-caption"));
    if(riskByTriple.has(JSON.stringify([r.initial,r.final,r.tone])))
     label.appendChild(makeText("Context warning: not a phonetic value for this syllable","cell-caption"));
   }else label.appendChild(makeText("No working simple-final feature for compound spelling","cell-caption"));
  }
  if($("cell-final-symbols").checked)label.appendChild(finalGeometricSymbols(r.final));
  label.appendChild(makeText("written spelling remainder; not IPA","cell-caption"));
  $("cell-bottom").appendChild(label);
 }
 $("cell-source").textContent="Native Unicode character unchanged · "+
   "Pinyin tokens only · no independently verified contextual reading or learner decoding evidence.";
}
function choose(index){
 if(!Number.isInteger(index)||index<0||index>=entries.length)throw Error("Invalid character rank");
 selectedIndex=index;
 const c=entries[index];
 $("cell-reading").replaceChildren();
 for(let i=0;i<c.readings.length;i++){
  const option=document.createElement("option");option.value=String(i);
  option.textContent=c.readings[i].display+" · source reading "+(i+1);
  $("cell-reading").appendChild(option);
 }
 $("cell-reading").value="0";
 render();
}
async function load(){
 try{
  const urls=["pronunciation-citations-0001-1000.json","layers-v0.1.json",
   "phonetics/mandarin-initial-feature-candidates-v0.1.json",
   "phonetics/mandarin-citation-tone-contours-v0.1.json",
   "phonetics/citation-syllable-orthographic-codec-audit-v0.1.json",
   "phonetics/written-final-symbol-control-v0.1.json",
   "phonetics/mandarin-final-spelling-context-gates-v0.1.json",
   "phonetics/mandarin-simple-final-feature-candidates-v0.1.json"];
  const responses=await Promise.all(urls.map(url=>fetch(url)));
  if(responses.some(r=>!r.ok))throw Error("Source citation or reference data missing");
  const [citations,layers,initials,contours,audit,writtenSymbols,riskIndex,simpleReference]=await Promise.all(responses.map(r=>r.json()));
  if(citations.schema!=="chromalect.pronunciation-citations.v0"||
     citations.tranche!=="0001-1000"||citations.characters.length!==1000||
     layers.schema!=="chromalect.presentation-layers.v0"||
     initials.schema!=="chromalect.phonetics.mandarin-initial-feature-candidates.v0.1"||
     initials.statistics.independentlyVerifiedPhonemicContrasts!==0||
     contours.schema!=="chromalect.phonetics.mandarin-citation-tone-contours.v0.1"||
     contours.status!=="idealized_pedagogical_citation_pitch_contours_not_acoustic_or_contextual_measurements"||
     contours.evidence.contextualContourApprovals!==0||
     contours.evidence.learningEffectivenessFindings!==0||
     audit.schema!=="chromalect.phonetics.citation-syllable-orthographic-codec-audit.v0.1"||
     audit.status!=="source_attested_reversible_orthographic_grammar_not_phonemic_decoding"||
     audit.counts.exactRoundTrips!==1171||
     audit.counts.attestedInitialFinalToneTriples!==673||
     audit.counts.independentWordContextReadingApprovals!==0||
     audit.counts.humanDecodingTrials!==0||
     audit.counts.educationalEffectMeasurements!==0)
   throw Error("Evidence status or source codec differs from pinned reference");
  if(writtenSymbols.schema!=="chromalect.phonetics.written-final-symbol-control.v0.1"||
     writtenSymbols.status!=="arbitrary_geometric_written_letter_control_not_articulatory_or_ipa"||
     writtenSymbols.source.upstreamBlobSHA!==citations.source.blob_sha||
     writtenSymbols.source.sourceGlyphStrokesChanged!==false||
     writtenSymbols.source.spellingPaletteChanged!==false||
     writtenSymbols.summary.sourceCitationReadings!==1171||
     writtenSymbols.summary.writtenFinalsEncoded!==33||
     writtenSymbols.summary.primitiveLetters!==9||
     writtenSymbols.summary.machineSourceSpellingRoundtrips!==1171||
     writtenSymbols.summary.independentlyApprovedIPARealizations!==0||
     writtenSymbols.summary.humanSymbolDecodingTrials!==0||
     writtenSymbols.summary.learningResults!==0)
   throw Error("Geometric written-final code not source-backed or approved");
  if(riskIndex.schema!=="chromalect.phonetics.mandarin-final-spelling-context-gates.v0.1"||
     riskIndex.status!=="contextual_spelling_review_flags_not_verified_ipa_or_phonemic_finals"||
     riskIndex.source.upstreamBlobSHA!==citations.source.blob_sha||
     riskIndex.summary.sourceCitationReadings!==1171||
     riskIndex.summary.flaggedSourceReadings!==213||
     riskIndex.summary.flaggedDistinctWrittenTriples!==108||
     riskIndex.summary.independentlyAdjudicatedFinalPhonemes!==0||
     riskIndex.summary.approvedContextualPronunciations!==0||
     riskIndex.summary.approvedAcousticTranscriptions!==0||
     riskIndex.summary.learningStudyResults!==0||
     !Array.isArray(riskIndex.records)||riskIndex.records.length!==9)
   throw Error("Final-spelling source gate not validated");
  riskByTriple=new Map();
  for(const row of riskIndex.records){
   if(row.independentIPAAnalysisApproved!==false||
      row.certifiedAcousticRealizations!==0||
      !Array.isArray(row.observedTokenTriples)||
      row.observedTokenTriples.length!==row.uniqueCitationTriples)
    throw Error("Final spelling exception improperly approved or truncated");
   for(const triple of row.observedTokenTriples){
    const key=JSON.stringify([triple.initial,triple.final,triple.tone]);
    if(riskByTriple.has(key))throw Error("Overlapping final spelling exception rules");
    riskByTriple.set(key,row);
   }
  }
  if(riskByTriple.size!==108)throw Error("Incomplete spelling exception source");
  if(simpleReference.schema!=="chromalect.phonetics.mandarin-simple-final-feature-candidates.v0.1"||
     simpleReference.status!=="six_pedagogical_written_final_feature_hypotheses_not_ipa_or_context_approval"||
     simpleReference.source.upstreamBlobSHA!==citations.source.blob_sha||
     simpleReference.summary.distinctSimpleFinalLabels!==6||
     simpleReference.summary.simpleFinalOccurrences!==432||
     simpleReference.summary.flaggedSimpleFinalOccurrences!==112||
     simpleReference.summary.independentIPAApprovalCount!==0||
     simpleReference.summary.humanVowelFeatureDecodingTrials!==0||
     simpleReference.summary.learningOutcomeEvidence!==0||
     !Array.isArray(simpleReference.records)||simpleReference.records.length!==6)
   throw Error("Working vowel-feature hypotheses are not source-aligned or unapproved");
  simpleFinals=new Map();
  for(const r of simpleReference.records){
   if(simpleFinals.has(r.token)||r.acceptedAsIPAOrContextualPhone!==false||
      r.articulatoryFeatureStatus!=="provisional_pedagogical_candidate_not_independently_adjudicated"||
      !["front","central","back"].includes(r.workingBackness)||
      !["close","mid","open"].includes(r.workingHeight)||
      !["rounded","unrounded"].includes(r.workingRounding))
    throw Error("Invalid working simple-vowel category");
   simpleFinals.set(r.token,r);
  }
  if(simpleFinals.size!==6)throw Error("Missing simple-vowel hypothesis");
  finalPrimitives=writtenSymbols.primitives;
  finalGlyphs=new Map();
  for(const rec of writtenSymbols.records){
   if(finalGlyphs.has(rec.token)||rec.symbolLetters.join("")!==rec.token||
      rec.iconRegistryIndices.length!==rec.symbolLetters.length||
      rec.independentPhonologicalInterpretationApproved!==false||
      rec.humanDecodingAccuracyKnown!==false||
      rec.iconRegistryIndices.some((v,i)=>!Number.isInteger(v)||v<0||v>=9||
        finalPrimitives[v].letter!==rec.symbolLetters[i]))
    throw Error("Source written-final primitive decoding mismatch");
   finalGlyphs.set(rec.token,rec);
  }
  if(finalGlyphs.size!==33||finalPrimitives.length!==9)
   throw Error("Incomplete final spelling graphics");
  palette=layers.palette_domains;
  if(Object.keys(palette.initial.tokens).length!==24||
     Object.keys(palette.final.tokens).length!==33||
     Object.keys(palette.tone.tokens).length!==5)
   throw Error("Expected independent palette domains missing");
  onsets=new Map(initials.tokens.map(r=>[r.token,r]));
  tones=new Map(contours.tones.map(r=>[r.token,r]));
  const consonants=[...onsets.values()].filter(r=>r.category==="conventional_pinyin_initial");
  if(consonants.length!==21||
     consonants.some(r=>!Object.hasOwn(placePaths,r.place)||
       !Object.hasOwn(mannerPaths,r.manner)||
       (r.aspiration!=="none"&&!Object.hasOwn(breathPaths,r.aspiration)))||
     [...onsets.values()].filter(r=>r.category==="orthographic_onset_convention_not_independent_consonant").length!==3)
   throw Error("Source initial shapes or orthographic-only onsets have diverged");
  if(onsets.size!==24||tones.size!==5||
     tones.get("0").levels!==null||
     [1,2,3,4].some(x=>!Array.isArray(tones.get(String(x))?.levels)))
   throw Error("Incomplete initial or tone research reference");
  let count=0;entries=citations.characters;
  for(let idx=0;idx<entries.length;idx++){
   const c=entries[idx];if(c.rank!==idx+1||!Array.isArray(c.readings))throw Error("Citation rank mismatch");
   for(const r of c.readings){
    count++;
    if(!onsets.has(r.initial)||!Object.hasOwn(palette.final.tokens,r.final)||
      !tones.has(String(r.tone))||!finalGlyphs.has(r.final)||
      r.orthographic_glide!==(r.initial==="y"||r.initial==="w"))
     throw Error("Unrecognized source citation tokens");
   }
  }
  if(count!==1171)throw Error("Incomplete citation sample");
  const flagged=entries.reduce((n,c)=>n+c.readings.filter(r=>
   riskByTriple.has(JSON.stringify([r.initial,r.final,r.tone]))).length,0);
  if(flagged!==213)throw Error("Source spelling warning occurrence count disagrees with source");
  const frequency=new Map(),flaggedSimple=new Map();
  for(const c of entries)for(const r of c.readings){
   if(!simpleFinals.has(r.final))continue;
   frequency.set(r.final,1+(frequency.get(r.final)??0));
   if(riskByTriple.has(JSON.stringify([r.initial,r.final,r.tone])))
    flaggedSimple.set(r.final,1+(flaggedSimple.get(r.final)??0));
  }
  for(const r of simpleFinals.values())if(frequency.get(r.token)!==r.observedSourceCitationReadings||
     (flaggedSimple.get(r.token)??0)!==r.sourceSpellingContextCautions)
   throw Error("Working vowel source frequency or warning status diverged");
  if([...frequency.values()].reduce((a,b)=>a+b,0)!==432||
     [...flaggedSimple.values()].reduce((a,b)=>a+b,0)!==112)
   throw Error("Incomplete source vowel cohort");
  choose(0);
  setMessage("1,000 characters · 1,171 source readings · independently toggled annotations · no study observations.");
 }catch(e){entries=[];$("cell-top").replaceChildren();$("cell-side").replaceChildren();
  $("cell-bottom").replaceChildren();$("cell-native").textContent="";$("cell-risk").textContent="";
  setMessage("Unable to validate citation-cell research data: "+e.message);}
}
$("cell-query").addEventListener("change",()=>{
 const q=$("cell-query").value.trim();
 const found=/^\d+$/.test(q)?Number(q)-1:entries.findIndex(c=>c.character===q);
 if(found<0||found>=entries.length){setMessage("No source character found for that rank or glyph.");return;}
 choose(found);
 setMessage("Source citation cell selected. Experimental annotations only.");
});
$("cell-reading").addEventListener("change",render);
for(const id of ["cell-color","cell-initial","cell-initial-symbols","cell-final","cell-final-symbols","cell-simple-feature","cell-tone"])
 $(id).addEventListener("change",render);
load();
})();