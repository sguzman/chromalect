import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const semantic=read("data/semantic/mandarin-1000-v0.1.json");
const initial=read("data/phonetics/mandarin-initial-feature-candidates-v0.1.json");
const grammar=fs.readFileSync("site/semantic-grammar.js","utf8");
const script=fs.readFileSync("site/mandarin-motion-recall-trial.js","utf8");
const html=fs.readFileSync("site/mandarin-motion-pretrial.html","utf8");
class Node{
 constructor(tag){this.tag=tag;this.children=[];this.textContent="";
  this.value="";this.checked=false;this.disabled=false;
  this.events={};this.attrs={};this.className="";this.style={};}
 appendChild(x){this.children.push(x);return x;}
 replaceChildren(...x){this.children=x;}
 addEventListener(k,fn){this.events[k]=fn;}
 setAttribute(k,v){this.attrs[k]=String(v);}
 select(){this.selected=true;}
}
function setup(source=[semantic,initial],reduce=false){
 const ids=["motion-trial-consent","motion-trial-start","motion-trial-show",
  "motion-trial-hide","motion-trial-stimulus","motion-trial-choices",
  "motion-trial-status","motion-trial-score","motion-trial-json",
  "motion-trial-copy"];
 const el=Object.fromEntries(ids.map(id=>[id,new Node("div")]));
 const urls=["semantic/mandarin-1000-v0.1.json",
  "phonetics/mandarin-initial-feature-candidates-v0.1.json"];
 const context={document:{getElementById:id=>el[id],createElement:tag=>new Node(tag)},
  fetch:async url=>{
   const i=urls.indexOf(url);assert.ok(i>=0,url);
   return {ok:true,json:async()=>source[i]};
  },
  matchMedia:arg=>{
   assert.equal(arg,"(prefers-reduced-motion: reduce)");
   return {matches:reduce};
  },
  Math:{floor:Math.floor,min:Math.min,random:()=>0.41},
  Map,Set,Object,JSON,Number,Array,String,Error};
 context.globalThis=context;
 vm.runInNewContext(grammar,context);
 vm.runInNewContext(script,context);
 return el;
}
async function settle(el){
 for(let i=0;i<120&&!el["motion-trial-status"].textContent;i++)await Promise.resolve();
}
async function playSession(el,expectedMotion){
 el["motion-trial-consent"].checked=true;el["motion-trial-consent"].events.change();
 el["motion-trial-start"].events.click();
 assert.match(el["motion-trial-status"].textContent,/Trial 1 \/ 16/);
 assert.equal(el["motion-trial-json"].value,"");
 const presented=[];
 for(let i=0;i<16;i++){
  assert.equal(el["motion-trial-show"].disabled,false);
  el["motion-trial-show"].events.click();
  assert.ok(el["motion-trial-stimulus"].children.length>0);
  assert.equal(el["motion-trial-hide"].disabled,false);
  const tokens=el["motion-trial-stimulus"].children;
  presented.push({animated:tokens.every(x=>x.className.includes("animated")),
   tokens:tokens.map(x=>x.textContent)});
  el["motion-trial-hide"].events.click();
  assert.equal(el["motion-trial-stimulus"].children.length,0);
  assert.equal(el["motion-trial-choices"].children.length,4);
  assert.equal(el["motion-trial-json"].value,"","No results until all 16 submitted");
  assert.ok(!el["motion-trial-score"].textContent);
  el["motion-trial-choices"].children[0].events.click();
  if(i<15)assert.match(el["motion-trial-status"].textContent,
   new RegExp("Trial "+(i+2)+" / 16"));
 }
 assert.match(el["motion-trial-status"].textContent,/16 trials complete/);
 assert.equal(el["motion-trial-choices"].children.length,0);
 const outcome=JSON.parse(el["motion-trial-json"].value);
 assert.equal(outcome.schema,"chromalect.experiment.local-static-motion-recall.v0.1");
 assert.equal(outcome.status,
  "unverified_local_self_assessment_not_a_peer_reviewed_or_controlled_human_trial");
 assert.equal(outcome.results.responses.length,16);
 assert.equal(outcome.results.total,16);
 assert.equal(outcome.results.byDomainAndAssignedCondition.length,4);
 assert.ok(outcome.results.byDomainAndAssignedCondition.every(x=>x.presentations===4));
 assert.ok(outcome.results.responses.every(x=>x.correct===(x.selectedKey===x.sourceKey)));
 assert.ok(outcome.results.responses.every(x=>x.sourceFeatureTokensPresented>0));
 assert.equal(new Set(outcome.results.responses.map(x=>x.sourceKey)).size,8);
 for(const target of new Set(outcome.results.responses.map(x=>x.sourceKey))){
  const occurrences=outcome.results.responses.filter(x=>x.sourceKey===target);
  assert.equal(occurrences.length,2);
  assert.deepEqual(occurrences.map(x=>x.assignedCondition).sort(),["one-shot","static"]);
 }
 for(const [i,r] of outcome.results.responses.entries()){
  assert.equal(r.trialNumber,i+1);
  assert.equal(presented[i].animated,r.effectivePresentation==="one-shot");
  if(!expectedMotion)assert.equal(r.effectivePresentation,"static");
 }
 assert.equal(outcome.constraints.independentParticipantsVerified,false);
 assert.equal(outcome.constraints.comparisonControlValidated,false);
 assert.equal(outcome.constraints.retentionOrTransferMeasured,false);
 assert.equal(outcome.constraints.networkSubmission,false);
 assert.equal(outcome.constraints.automaticStorage,false);
 assert.equal(outcome.source.semanticSensesApproved,0);
 assert.equal(outcome.source.phonologicalContrastsApproved,0);
 assert.equal(el["motion-trial-copy"].disabled,false);
 el["motion-trial-copy"].events.click();
 assert.equal(el["motion-trial-json"].selected,true);
 if(!expectedMotion)assert.match(el["motion-trial-score"].textContent,/forced every cue static/);
 el["motion-trial-start"].events.click();
 assert.equal(el["motion-trial-json"].value,"");
 assert.equal(el["motion-trial-copy"].disabled,true);
 return outcome;
}
const normal=setup();await settle(normal);
assert.match(normal["motion-trial-status"].textContent,/Sixteen balanced/);
assert.equal(normal["motion-trial-start"].disabled,true);
normal["motion-trial-start"].events.click();
assert.equal(normal["motion-trial-stimulus"].children.length,0);
const run=await playSession(normal,true);
assert.equal(run.results.byDomainAndAssignedCondition
 .filter(x=>x.assignedCondition==="one-shot")
 .reduce((n,x)=>n+x.effectiveMotionExposures,0),8);
const reduced=setup([semantic,initial],true);await settle(reduced);
const fallback=await playSession(reduced,false);
assert.equal(fallback.results.byDomainAndAssignedCondition
 .reduce((n,x)=>n+x.effectiveMotionExposures,0),0);
const dirty=structuredClone(semantic);dirty.summary.productionVerifiedCharacters=1;
const denied=setup([dirty,initial]);await settle(denied);
assert.match(denied["motion-trial-status"].textContent,/Unable to validate/);
assert.equal(denied["motion-trial-start"].disabled,true);
const changed=structuredClone(initial);
changed.statistics.independentlyVerifiedPhonemicContrasts=1;
const deniedPhone=setup([semantic,changed]);await settle(deniedPhone);
assert.match(deniedPhone["motion-trial-status"].textContent,/Unable to validate/);
assert.equal(deniedPhone["motion-trial-start"].disabled,true);
for(const id of ["consent","start","show","hide","stimulus","choices",
 "status","score","json","copy"])
 assert.ok(html.includes('id="motion-trial-'+id+'"'));
assert.match(html,/mandarin-motion-recall-trial\.js/);
assert.match(html,/@media\(prefers-reduced-motion:reduce\)/);
assert.ok(!script.includes("localStorage")&&!script.includes("sendBeacon")&&
 !script.includes("innerHTML")&&!script.includes("XMLHttpRequest")&&
 !script.includes("navigator.")&&!script.includes("Date.now"));
console.log("Static/motion cue recall: 8 source targets x 2 conditions, 16 simulated responses, system reduced motion forced static, private local JSON and zero scientific promotion.");
