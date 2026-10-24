/* Noncollecting pretrial stimuli for source-linked semantic and initial features.
   Visual sequencing is hypothetical, not evidence for articulatory production. */
(() => {
"use strict";
const $=id=>document.getElementById(id);
const required=["motion-domain","motion-event","motion-initial","motion-play",
 "motion-status","motion-static","motion-dynamic","motion-source-note"];
if(required.some(id=>!$(id)))return;
const grammar=globalThis.ChromalectSemanticGrammar;
if(!grammar){$("motion-status").textContent="Semantic source grammar unavailable";return;}
let events=[],initials=[],motionRequested=false;
const make=(name,klass,text)=>{
 const el=document.createElement(name);
 if(klass)el.className=klass;
 if(text!==undefined)el.textContent=String(text);
 return el;
};
const options=(el,rows)=>{
 el.replaceChildren();
 for(const [value,label] of rows){
  const option=make("option",null,label);option.value=String(value);
  el.appendChild(option);
 }
};
const reduced=()=>!!globalThis.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
function semanticTokens(){
 const event=events.find(x=>String(x.rank)===$("motion-event").value);
 if(!event)throw Error("Selected semantic event is not sourced");
 const atoms=grammar.emojiParts(event.expression);
 return {
  source:"Draft Unihan kDefinition for "+event.character+
   " · "+event.meaning+". Source semantic event operator is an unverified grammar cue.",
  tokens:[{text:event.character,kind:"character"},...atoms.map(x=>({text:x.text,
   kind:x.kind==="emoji"?"symbol":"operator"}))]
 };
}
function articulationTokens(){
 const feature=initials.find(x=>x.token===$("motion-initial").value);
 if(!feature)throw Error("Selected initial feature is not sourced");
 return {
  source:"Pinyin initial "+feature.token+" · proposed working place/manner/aspiration categories. "+
   "Any sequencing is schematic, not recorded mouth movement or verified phonemic analysis.",
  tokens:[
   {text:feature.token,kind:"character"},
   {text:"Place: "+feature.place,kind:"word"},
   {text:"Manner: "+feature.manner,kind:"word"},
   {text:"Aspiration: "+feature.aspiration,kind:"word"}
  ]
 };
}
function renderPanel(target,tokens,animate){
 target.replaceChildren();
 for(let i=0;i<tokens.length;i++){
  const t=tokens[i];
  const node=make("span","motion-token "+(
   t.kind==="character"?"motion-source":
   t.kind==="symbol"?"motion-symbol":"motion-word"),t.text);
  if(animate){
   node.classList.add("motion-token-animated");
   node.style.animationDelay=Math.min(i*0.13,0.9).toFixed(2)+"s";
   node.setAttribute("data-sequence",String(i));
  }
  target.appendChild(node);
 }
}
function render(){
 if(!events.length||!initials.length)return;
 const domain=$("motion-domain").value;
 if(domain!=="semantic"&&domain!=="articulation")throw Error("Unknown candidate domain");
 $("motion-event").disabled=domain!=="semantic";
 $("motion-initial").disabled=domain!=="articulation";
 const data=domain==="semantic"?semanticTokens():articulationTokens();
 const running=motionRequested&&!reduced();
 renderPanel($("motion-static"),data.tokens,false);
 renderPanel($("motion-dynamic"),data.tokens,running);
 $("motion-source-note").textContent=data.source+
  " Neither rendering has human-study validation or licensed participant observations.";
 $("motion-status").textContent=reduced()?
  "System reduced motion is active: both conditions are static. No animation played.":
  running?
   "One finite visual sequence started after explicit activation. No results recorded.":
   "Static preview only. Motion requires the Replay motion once button.";
 motionRequested=false;
}
async function load(){
 try{
  const responses=await Promise.all([
   fetch("semantic/mandarin-1000-v0.1.json"),
   fetch("phonetics/mandarin-initial-feature-candidates-v0.1.json")]);
  if(responses.some(x=>!x.ok))throw Error("Required source-pinned research candidates unavailable");
  const [semantic,feature]=await Promise.all(responses.map(r=>r.json()));
  if(semantic.schema!=="chromalect.mandarin.character-semantic-tranche.v0.1"||
     semantic.status!=="initial_screening_complete_candidates_not_production_verified"||
     semantic.summary.screenedCharacters!==1000||
     semantic.summary.productionVerifiedCharacters!==0||
     semantic.characters.length!==1000||
     feature.schema!=="chromalect.phonetics.mandarin-initial-feature-candidates.v0.1"||
     feature.status!=="working_articulatory_candidate_codebook_not_independently_certified_phoneme_inventory"||
     feature.statistics.conventionalInitialTokens!==21||
     feature.statistics.orthographicConventions!==3||
     feature.statistics.independentlyVerifiedPhonemicContrasts!==0||
     feature.statistics.validatedArticulatoryProduction!==0||
     feature.statistics.educationalStudies!==0)
   throw Error("Source candidates or evidence gates disagree");
  const found=[];
  for(let i=0;i<semantic.characters.length;i++){
   const row=semantic.characters[i];
   if(row.rank!==i+1||[...row.character].length!==1||
      !Array.isArray(row.screening.candidates))throw Error("Semantic rank mismatch");
   for(const c of row.screening.candidates){
    if(c.expression?.kind!=="event")continue;
    if(c.state!=="experimental_pictogram_candidate"||
       c.review!=="human_linguistic_and_comprehension_review_pending"||
       !c.selectedMeaning)throw Error("Semantic event certification changed");
    grammar.validate(c.expression);
    found.push({rank:row.rank,character:row.character,
     meaning:c.selectedMeaning,expression:c.expression});
   }
  }
  const records=feature.tokens.filter(x=>x.category==="conventional_pinyin_initial");
  if(found.length!==280||records.length!==21||
     new Set(records.map(x=>x.token)).size!==21||
     records.some(x=>!x.place||!x.manner||
      !["none","aspirated","unaspirated"].includes(x.aspiration)||
      x.ipaStatus==="independently_verified"))
   throw Error("Semantic or initial candidate inventory changed");
  events=found;initials=records;
  options($("motion-event"),events.map(x=>[String(x.rank),x.character+" · "+x.meaning]));
  options($("motion-initial"),initials.map(x=>[x.token,x.token+
   " · "+x.place+" / "+x.manner+" / "+x.aspiration]));
  $("motion-domain").value="semantic";
  $("motion-event").value=String(events[0].rank);
  $("motion-initial").value=initials[0].token;
  render();
 }catch(e){
  events=[];initials=[];
  $("motion-static").replaceChildren();$("motion-dynamic").replaceChildren();
  $("motion-status").textContent="Unable to validate pretrial source evidence: "+e.message;
 }
}
$("motion-domain").addEventListener("change",render);
$("motion-event").addEventListener("change",render);
$("motion-initial").addEventListener("change",render);
$("motion-play").addEventListener("click",()=>{motionRequested=true;render();});
load();
})();
