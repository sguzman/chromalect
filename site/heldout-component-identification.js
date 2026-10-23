/* Source-mapping-keyed component identification: local instrument rehearsal,
 * not independent human recognition evidence. No session transmissions.
 */
(() => {
"use strict";
const pairing=globalThis.ChromalectBlindColorRehearsal;
const core=globalThis.ChromalectComponentIdentificationRehearsal;
const $=id=>document.getElementById(id);
const required=["ci-status","ci-intro","ci-size","ci-surface","ci-appearance",
 "ci-start","ci-running","ci-complete","ci-progress","ci-image","ci-locator",
 "ci-question","ci-choices","ci-next","ci-summary","ci-export","ci-output"];
if(required.some(id=>!$(id)))return;
if(!pairing||!core){
 $("ci-status").textContent="Research source validator unavailable";return;
}
const make=(tag,cls,value)=>{
 const x=document.createElement(tag);if(cls)x.className=cls;
 if(value!==undefined)x.textContent=value;return x;
};
let targets=[],schedule=[],seed=0,position=0,responses=new Map(),
 display=null,started=false,done=false;
const setting=()=>({pixelSize:Number($("ci-size").value),
 surface:$("ci-surface").value,appearance:$("ci-appearance").value});
const status=message=>{$("ci-status").textContent=message;};
function draw(){
 if(!started)return;
 const t=schedule[position];
 if(!t)throw Error("Missing source-linked component identification stimulus");
 $("ci-running").hidden=false;$("ci-complete").hidden=true;
 $("ci-progress").textContent="Source-mapping rehearsal "+(position+1)+
  " / 49 · "+responses.size+" observations · 0 visual certifications";
 $("ci-image").replaceChildren();
 const glyph=make("img","ci-glyph");
 glyph.src=t.presentation==="original"?t.sourceSVG:t.foldSVG;
 glyph.alt="Component-colored Chinese source glyph (condition masked)";
 glyph.width=display.pixelSize;glyph.height=display.pixelSize;
 if(display.appearance==="grayscale")
  glyph.style.setProperty("filter","grayscale(1)");
 $("ci-image").style.setProperty("--ci-surface",
  display.surface==="white"?"#fff":"#000");
 $("ci-image").appendChild(glyph);
 $("ci-locator").replaceChildren();
 const locator=make("img","ci-glyph");
 locator.src=t.locatorSVG;
 locator.alt="Neutral location cue: dark component region, pale remaining paths";
 locator.width=display.pixelSize;locator.height=display.pixelSize;
 $("ci-locator").style.setProperty("--ci-surface","#fff");
 $("ci-locator").appendChild(locator);
 $("ci-question").textContent=
  "Which source-catalog component owns the dark region in the neutral locator? "+
  "This answer is scored against an unverified machine ownership mapping.";
 $("ci-choices").replaceChildren();
 const byId=new Map(t.offeredComponents.map(c=>[c.id,c]));
 const options=[["left",t.leftChoice],["right",t.rightChoice]];
 for(const [label,id] of options){
  const x=byId.get(id);
  if(!x)throw Error("Missing source-derived component-form answer option");
  const button=make("button","ci-choice","Component "+x.form+" · "+x.id);
  button.setAttribute("aria-pressed",String(responses.get(t.id)===label));
  button.addEventListener("click",()=>answer(label));
  $("ci-choices").appendChild(button);
 }
 const abstain=make("button","ci-choice","Cannot judge / abstain");
 abstain.setAttribute("aria-pressed",
  String(responses.get(t.id)==="cannot_judge"));
 abstain.addEventListener("click",()=>answer("cannot_judge"));
 $("ci-choices").appendChild(abstain);
 $("ci-next").disabled=!responses.has(t.id);
 $("ci-next").textContent=position===48?"Finish local rehearsal":"Next";
}
function answer(response){
 if(!["left","right","cannot_judge"].includes(response))
  throw Error("Invalid unapproved local response");
 responses.set(schedule[position].id,response);
 const selected=["left","right","cannot_judge"];
 for(let i=0;i<3;i++)
  $("ci-choices").children[i].setAttribute("aria-pressed",
   String(selected[i]===response));
 $("ci-next").disabled=false;
 status("Local answer saved in volatile page state only; reference treatment and key remain unrevealed.");
}
function finish(){
 const report=core.exportSession(schedule,responses,display,seed,new Date().toISOString());
 const result=core.validateSession(report,targets);
 if(result.independentlyValidated!==0)
  throw Error("Rehearsal may not generate validated human recognition evidence");
 $("ci-running").hidden=true;$("ci-complete").hidden=false;
 $("ci-summary").textContent=
  "Unverified source-key concordance: "+report.summary.matchesUnverifiedMachineOwner+
  " / "+report.summary.answered+" attempts; "+report.summary.abstained+
  " abstentions. These are provisional machine-mapping agreements only, "+
  "not independent visual recognition results. Independently validated: 0.";
 $("ci-progress").textContent="49 / 49 research instrument responses · no source approval.";
 status("Local rehearsal finished. Optional manual JSON export; no automatic upload or persistence.");
}
async function load(){
 try{
  const paths=[
   "glyphs/research/heldout-identification-target-v0.1/index-v0.1.json",
   "glyphs/research/heldout-warning-v0.1/index-v0.1.json",
   "semantic-group-hue-fivefold-heldout-v0.1.json",
   "palettes/mandarin-component-identity-v0.6.json"
  ];
  const resources=await Promise.all(paths.map(p=>fetch(p)));
  if(resources.some(x=>!x.ok))
   throw Error("Source component-owner review records are unavailable");
  const [targetsData,warnings,folds,palette]=
   await Promise.all(resources.map(x=>x.json()));
  const warningPairs=pairing.validateSource(warnings,folds,palette);
  targets=core.validateSource(targetsData,warningPairs);
  $("ci-intro").textContent="49 machine-keyed source-component questions from "+
   "48 unreviewed source glyphs. Each question uses an unaltered color glyph "+
   "and a separate neutral dark-region locator. Experimental colors come only "+
   "from models fitted without the displayed source glyph.";
  $("ci-start").disabled=false;
  status("Source ranks, machine component keys, fold colors and independent-review boundaries checked.");
 }catch(error){
  targets=[];$("ci-start").disabled=true;
  status("Unable to verify component identification source: "+error.message);
 }
}
$("ci-start").addEventListener("click",()=>{
 try{
  if(targets.length!==49||started||done)
   throw Error("Verified source rehearsal unavailable");
  display=setting();
  const random=new Uint32Array(1);
  globalThis.crypto.getRandomValues(random);
  seed=random[0]||1;
  schedule=core.plan(targets,seed);
  responses=new Map();position=0;started=true;
  for(const id of ["ci-size","ci-surface","ci-appearance","ci-start"])
   $(id).disabled=true;
  draw();status("49 source-keyed identification prompts ready; labels and owner key concealed.");
 }catch(error){status("Cannot begin unverified identification rehearsal: "+error.message);}
});
$("ci-next").addEventListener("click",()=>{
 try{
  if(!started||!responses.has(schedule[position].id))
   throw Error("A provisional choice or abstention is required");
  if(position===48){started=false;done=true;finish();}
  else{position++;draw();}
 }catch(error){status("Cannot continue: "+error.message);}
});
$("ci-export").addEventListener("click",()=>{
 try{
  if(!done)throw Error("All 49 provisional prompts must be completed");
  const report=core.exportSession(schedule,responses,display,seed,new Date().toISOString());
  core.validateSession(report,targets);
  $("ci-output").value=JSON.stringify(report,null,2)+"\n";
  status("Local machine-keyed record prepared for manual copy. Nothing uploaded.");
 }catch(error){
  $("ci-output").value="";
  status("Cannot export provisional identification record: "+error.message);
 }
});
load();
})();