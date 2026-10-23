// Source-pinned character-cell citation encoding demonstration.
// Annotations stay outside the native glyph. No contextual or human readability approvals.
(() => {
"use strict";
const $=id=>document.getElementById(id);
const ids=["cell-query","cell-reading","cell-color","cell-initial","cell-final","cell-tone",
 "cell-status","cell-code","cell-native","cell-top","cell-side","cell-bottom","cell-source"];
if(ids.some(id=>!$(id)))return;
const NS="http://www.w3.org/2000/svg";
let entries=[],onsets=new Map(),palette=null,tones=new Map(),selectedIndex=0;
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
  label.appendChild(makeText(feature.category==="conventional_pinyin_initial"?
   feature.place+" · "+feature.manner+" · "+feature.aspiration:
   "orthographic onset only, no consonant tuple","cell-caption"));
  $("cell-side").appendChild(label);
 }
 if($("cell-final").checked){
  const label=document.createElement("div");label.className="cell-addon";
  decorate(label,colored?palette.final.tokens[r.final]:null);
  label.appendChild(makeText("Final: "+r.final,"cell-token"));
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
   "phonetics/citation-syllable-orthographic-codec-audit-v0.1.json"];
  const responses=await Promise.all(urls.map(url=>fetch(url)));
  if(responses.some(r=>!r.ok))throw Error("Source citation or reference data missing");
  const [citations,layers,initials,contours,audit]=await Promise.all(responses.map(r=>r.json()));
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
  palette=layers.palette_domains;
  if(Object.keys(palette.initial.tokens).length!==24||
     Object.keys(palette.final.tokens).length!==33||
     Object.keys(palette.tone.tokens).length!==5)
   throw Error("Expected independent palette domains missing");
  onsets=new Map(initials.tokens.map(r=>[r.token,r]));
  tones=new Map(contours.tones.map(r=>[r.token,r]));
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
      !tones.has(String(r.tone))||r.orthographic_glide!==(r.initial==="y"||r.initial==="w"))
     throw Error("Unrecognized source citation tokens");
   }
  }
  if(count!==1171)throw Error("Incomplete citation sample");
  choose(0);
  setMessage("1,000 characters · 1,171 source readings · independently toggled annotations · no study observations.");
 }catch(e){entries=[];$("cell-top").replaceChildren();$("cell-side").replaceChildren();
  $("cell-bottom").replaceChildren();$("cell-native").textContent="";
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
for(const id of ["cell-color","cell-initial","cell-final","cell-tone"])
 $(id).addEventListener("change",render);
load();
})();