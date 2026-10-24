/* Source-attested working featural citation decoder, not a sound or IPA validator. */
(() => {
"use strict";
const $=id=>document.getElementById(id);
const ids=["vowel-code-initial","vowel-code-height","vowel-code-backness",
 "vowel-code-rounding","vowel-code-tone","vowel-code-output","vowel-code-status"];
if(ids.some(id=>!$(id)))return;
const make=(tag,content)=>{
 const node=document.createElement(tag);
 if(content!==undefined)node.textContent=String(content);
 return node;
};
const option=(node,value,text)=>{
 const child=make("option",text);child.value=value;node.appendChild(child);
};
const key=(x)=>JSON.stringify(x);
let codebook=new Map(),lastStatus="";
function render(){
 if(!codebook.size)return;
 const i=$("vowel-code-initial").value;
 const v=[$("vowel-code-height").value,$("vowel-code-backness").value,
  $("vowel-code-rounding").value].join("|");
 const t=$("vowel-code-tone").value;
 $("vowel-code-output").replaceChildren();
 const entry=codebook.get(key([i,v,t]));
 if(entry){
  const display=make("strong",entry.display);
  display.className="vowel-code-reading";
  $("vowel-code-output").appendChild(display);
  $("vowel-code-output").appendChild(make("p",
   "Reconstructed source spelling: "+entry.initial+" + "+entry.final+
   " · citation T"+entry.tone+". Source characters: "+
   entry.characters.slice(0,12).join(" · ")));
  $("vowel-code-status").textContent="Source-attested, provisional machine decode. No phonetic validation.";
 }else{
  $("vowel-code-output").appendChild(make("p",
   "No permitted source citation uses that exact working feature/initial/tone code."));
  $("vowel-code-status").textContent="Absent, withheld or unsupported. No pronunciation inferred.";
 }
}
async function load(){
 try{
  const urls=["pronunciation-citations-0001-1000.json",
   "phonetics/mandarin-simple-final-feature-candidates-v0.1.json",
   "phonetics/mandarin-initial-feature-candidates-v0.1.json",
   "phonetics/mandarin-final-spelling-context-gates-v0.1.json",
   "layers-v0.1.json",
   "phonetics/working-feature-citation-codec-audit-v0.1.json"];
  const replies=await Promise.all(urls.map(url=>fetch(url)));
  if(replies.some(r=>!r.ok))throw Error("Pinned source input unavailable");
  const [citations,finals,initials,warnings,layers,audit]=await Promise.all(
   replies.map(r=>r.json()));
  if(citations.schema!=="chromalect.pronunciation-citations.v0"||
     citations.characters.length!==1000||
     finals.schema!=="chromalect.phonetics.mandarin-simple-final-feature-candidates.v0.1"||
     finals.source.upstreamBlobSHA!==citations.source.blob_sha||
     finals.status!=="six_pedagogical_written_final_feature_hypotheses_not_ipa_or_context_approval"||
     initials.schema!=="chromalect.phonetics.mandarin-initial-feature-candidates.v0.1"||
     warnings.schema!=="chromalect.phonetics.mandarin-final-spelling-context-gates.v0.1"||
     warnings.summary.flaggedSourceReadings!==213||
     warnings.summary.independentlyAdjudicatedFinalPhonemes!==0||
     layers.schema!=="chromalect.presentation-layers.v0"||
     audit.schema!=="chromalect.phonetics.working-feature-citation-codec-audit.v0.1"||
     audit.status!=="machine_reversible_six_provisional_simple_final_features_not_ipa_or_human_decoding"||
     audit.source.citationBlobSHA!==citations.source.blob_sha||
     audit.counts.eligibleWorkingFeatureRoundTrips!==320||
     audit.counts.withheldContextCautions!==112||
     audit.counts.withoutFinalFeatureProposal!==739||
     audit.counts.phonologicalRepresentationApprovals!==0||
     audit.counts.humanVisualDecodingTrials!==0||
     audit.counts.learningEffectEvidence!==0||
     audit.approvedForHumanStudy!==false)
    throw Error("Research source, count or approval boundary changed");
  const finalsByToken=new Map(),finalsByTuple=new Map();
  for(const r of finals.records){
   const f=[r.workingHeight,r.workingBackness,r.workingRounding].join("|");
   if(finalsByToken.has(r.token)||finalsByTuple.has(f)||
      r.acceptedAsIPAOrContextualPhone!==false)throw Error("Vowel tuple collision or approval");
   finalsByToken.set(r.token,f);finalsByTuple.set(f,r.token);
  }
  if(finalsByToken.size!==6||finalsByTuple.size!==6)
   throw Error("Missing working final candidates");
  const codeByInitial=new Map(),byCode=new Map();
  for(const r of initials.tokens){
   const code=r.category==="conventional_pinyin_initial"?
    "F:"+[r.place,r.manner,r.aspiration].join("|"):
    "O:"+r.token;
   if((r.category!=="conventional_pinyin_initial"&&
       (r.category!=="orthographic_onset_convention_not_independent_consonant"||
        !["y","w","∅"].includes(r.token)||r.workingIPACandidate!==null))||
      codeByInitial.has(r.token)||byCode.has(code))
    throw Error("Initial working category is ambiguous");
   codeByInitial.set(r.token,code);
   byCode.set(code,r.token);
  }
  if(codeByInitial.size!==24)throw Error("Incomplete working initial codes");
  const flags=new Set(),originalCautions=new Map();
  for(const row of warnings.records){
   if(row.independentIPAAnalysisApproved!==false||
      row.certifiedAcousticRealizations!==0)throw Error("Caution row unexpectedly approved");
   for(const t of row.observedTokenTriples){
    const k=key([t.initial,t.final,t.tone]);
    if(flags.has(k))throw Error("Overlapping source caution");
    flags.add(k);
   }
  }
  if(flags.size!==108)throw Error("Source caution list incomplete");
  const toneSymbols=layers.palette_domains.tone.symbols;
  if(JSON.stringify(toneSymbols)!==JSON.stringify({"0":"·","1":"—","2":"↗","3":"⌄","4":"↘"}))
   throw Error("Source citation tone symbols unexpectedly changed");
  let eligible=0,withheld=0,notProposed=0;
  const built=new Map();
  for(let index=0;index<citations.characters.length;index++){
   const row=citations.characters[index];
   if(row.rank!==index+1)throw Error("Source rank sequence changed");
   for(const r of row.readings){
    const f=finalsByToken.get(r.final);
    if(!f){notProposed++;continue;}
    if(flags.has(key([r.initial,r.final,r.tone]))){withheld++;continue;}
    const init=codeByInitial.get(r.initial),symbol=toneSymbols[String(r.tone)];
    if(!init||!symbol)throw Error("Unrecognized source visual channel");
    const signature=key([init,f,symbol]),other=built.get(signature);
    if(other){
     if(other.display!==r.display||other.initial!==r.initial||
        other.final!==r.final||other.tone!==r.tone)
      throw Error("Feature tuple maps to competing citation spellings");
     other.characters.push(row.character);
    }else built.set(signature,{display:r.display,initial:r.initial,
     final:r.final,tone:r.tone,characters:[row.character]});
    eligible++;
   }
  }
  if(eligible!==320||withheld!==112||notProposed!==739||
     built.size!==157||audit.counts.uniqueEligibleVisualCodes!==built.size)
   throw Error("Feature decoder differs from source-scope audit");
  codebook=built;
  for(const [token,c] of codeByInitial)
   option($("vowel-code-initial"),c,c+" · "+token);
  for(const [id,items] of [
    ["vowel-code-height",["close","mid","open"]],
    ["vowel-code-backness",["front","central","back"]],
    ["vowel-code-rounding",["rounded","unrounded"]]
   ])for(const s of items)option($(id),s,s);
  for(const [tone,symbol] of Object.entries(toneSymbols))
   option($("vowel-code-tone"),symbol,"Citation T"+tone+" · "+symbol);
  $("vowel-code-initial").value=codeByInitial.get("b");
  $("vowel-code-height").value="open";
  $("vowel-code-backness").value="central";
  $("vowel-code-rounding").value="unrounded";
  $("vowel-code-tone").value=toneSymbols["1"];
  render();
 }catch(e){
  codebook=new Map();
  $("vowel-code-output").replaceChildren();
  $("vowel-code-status").textContent="Unable to validate feature-code source: "+e.message;
 }
}
for(const id of ["vowel-code-initial","vowel-code-height","vowel-code-backness",
 "vowel-code-rounding","vowel-code-tone"])$(id).addEventListener("change",render);
load();
})();