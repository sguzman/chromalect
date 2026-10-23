/* Local-only blind color comparison rehearsal: not human-subject study.
 * All observations are deliberately provisional and unuploaded.
 */
(() => {
"use strict";
const core=globalThis.ChromalectBlindColorRehearsal;
const $=id=>document.getElementById(id);
const required=["br-status","br-intro","br-size","br-surface","br-appearance",
 "br-start","br-trial","br-progress","br-left","br-right","br-question",
 "br-respond","br-next","br-export","br-output","br-key","br-finish"];
if(required.some(id=>!$(id)))return;
if(!core){$("br-status").textContent="Source validation module unavailable";return;}
const make=(tag,cls,content)=>{
 const el=document.createElement(tag);
 if(cls)el.className=cls;if(content!==undefined)el.textContent=content;
 return el;
};
const settings=()=>({
 pixelSize:Number($("br-size").value),
 surface:$("br-surface").value,
 appearance:$("br-appearance").value
});
let source=[],plan=[],seed=0,position=0,answers=new Map(),display=null,
 active=false,finished=false;
const options=[
 ["left_clearer","Left appears clearer"],
 ["right_clearer","Right appears clearer"],
 ["similar","Similar or indistinguishable"],
 ["cannot_judge","Cannot judge / abstain"]
];
function status(message){$("br-status").textContent=message;}
function render(){
 if(!active)return;
 const trial=plan[position];
 if(!trial)throw Error("No source-verified blind trial at this position");
 $("br-progress").textContent="Rehearsal trial "+(position+1)+
  " / "+plan.length+" · responses recorded "+answers.size+
  " · no certifications";
 $("br-trial").hidden=false;$("br-finish").hidden=true;
 for(const [id,which] of [["br-left","left"],["br-right","right"]]){
  const card=$(id);card.replaceChildren();
  const img=make("img","br-stimulus");
  // The accessible labels intentionally do not reveal condition identity.
  img.alt="Chinese glyph visual comparison stimulus, "+which;
  img.width=display.pixelSize;img.height=display.pixelSize;
  const orig=trial.leftCondition==="original";
  img.src=which==="left"?
   (orig?trial.originalSVG:trial.heldoutSVG):
   (orig?trial.heldoutSVG:trial.originalSVG);
  if(display.appearance==="grayscale")
   img.style.setProperty("filter","grayscale(1)");
  card.style.setProperty("--br-background",display.surface==="white"?"#fff":
   display.surface==="black"?"#000":"transparent");
  card.appendChild(img);
 }
 const response=answers.get(trial.id);
 $("br-question").textContent="Which presentation makes the colored stroke regions easier to distinguish? "+
  "This is a preference rehearsal, not a scored identity-recognition test.";
 $("br-respond").replaceChildren();
 for(const [value,label] of options){
  const button=make("button","br-answer",label);
  button.type="button";
  button.setAttribute("aria-pressed",String(response===value));
  button.addEventListener("click",()=>record(value));
  $("br-respond").appendChild(button);
 }
 $("br-next").disabled=!answers.has(trial.id);
 $("br-next").textContent=position===plan.length-1?"Finish rehearsal":"Next source glyph";
 $("br-key").textContent="";
}
function record(value){
 if(!options.some(([answer])=>answer===value))
  throw Error("Unrecognized preliminary comparison choice");
 const trial=plan[position];
 answers.set(trial.id,value);
 $("br-next").disabled=false;
 for(const [i,[option]] of options.entries())
  $("br-respond").children[i].setAttribute("aria-pressed",String(option===value));
 status("Local response recorded. The condition identity remains hidden.");
}
function finish(){
 const report=core.createSession(plan,answers,display,seed,new Date().toISOString());
 const result=core.validateSession(report,source);
 if(result.productionVisualCertifications!==0)
  throw Error("Rehearsal must not certify visual discrimination");
 $("br-trial").hidden=true;$("br-finish").hidden=false;
 $("br-key").textContent="Condition mapping remains separate from raw responses. "+
  "Left-original presentation: "+plan.filter(p=>p.leftCondition==="original").length+
  " of "+plan.length+". Every reported glyph is still unreviewed independently.";
 $("br-progress").textContent="Completed "+answers.size+
  " / "+plan.length+" local preference observations · 0 certified";
 status("Rehearsal completed. Preview-only JSON is available for manual copy; nothing was saved or sent.");
}
async function init(){
 try{
  const paths=["glyphs/research/heldout-warning-v0.1/index-v0.1.json",
   "semantic-group-hue-fivefold-heldout-v0.1.json",
   "palettes/mandarin-component-identity-v0.6.json"];
  const responses=await Promise.all(paths.map(path=>fetch(path)));
  if(responses.some(r=>!r.ok))throw Error("Published source registry or fold evidence not accessible");
  const [manifest,folds,palette]=await Promise.all(responses.map(r=>r.json()));
  source=core.validateSource(manifest,folds,palette);
  if(source.length!==49)throw Error("Wrong source review cohort length");
  $("br-intro").textContent="49 source-linked comparison tasks from 48 original Chinese glyphs. "+
   "Each displays the same source geometry twice, with unchanged v0.6 versus "+
   "fold-trained candidate fills, balanced and with condition labels hidden. "+
   "These are preliminary preference observations; independent study eligibility remains unapproved.";
  $("br-start").disabled=false;
  status("49 machine-flagged pairs verified against the original source; local rehearsal available.");
 }catch(e){source=[];$("br-start").disabled=true;
  status("Unable to verify the rehearsal source data: "+e.message);}
}
$("br-start").addEventListener("click",()=>{
 try{
  if(source.length!==49||active)throw Error("Rehearsal not available");
  display=settings();
  // Cryptographic source seeds the presentation schedule; no IDs or personal
  // data enter the seed. The schedule itself is reproducible in the export.
  const bits=new Uint32Array(1);
  globalThis.crypto.getRandomValues(bits);
  seed=bits[0]||1;
  plan=core.permutation(source,seed);
  answers=new Map();position=0;active=true;finished=false;
  for(const id of ["br-size","br-surface","br-appearance","br-start"])
   $(id).disabled=true;
  $("br-intro").textContent="Labels and source colors remain concealed until all responses are recorded. "+
   "No participant-study approval, experiment recording, or network submission is implied.";
  render();status("Local presentation rehearsal started; left/right labels concealed.");
 }catch(e){status("Unable to begin rehearsal: "+e.message);}
});
$("br-next").addEventListener("click",()=>{
 try{
  if(!active||!answers.has(plan[position].id))
   throw Error("A provisional judgment or abstention is required to continue");
  if(position===plan.length-1){active=false;finished=true;finish();}
  else{position++;render();}
 }catch(e){status("Cannot move to next presentation: "+e.message);}
});
$("br-export").addEventListener("click",()=>{
 try{
  if(!finished)throw Error("Complete the local rehearsal before exporting");
  const report=core.createSession(plan,answers,display,seed,new Date().toISOString());
  core.validateSession(report,source);
  $("br-output").value=JSON.stringify(report,null,2)+"\n";
  status("Local-only preliminary JSON prepared. Copy manually; no file or network action was performed.");
 }catch(e){$("br-output").value="";status("Export unavailable: "+e.message);}
});
init();
})();