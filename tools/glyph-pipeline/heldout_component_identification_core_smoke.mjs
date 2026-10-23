import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const target=read("site/glyphs/research/heldout-identification-target-v0.1/index-v0.1.json");
const warnings=read("site/glyphs/research/heldout-warning-v0.1/index-v0.1.json");
const folds=read("site/semantic-group-hue-fivefold-heldout-v0.1.json");
const palette=read("palettes/mandarin-component-identity-v0.6.json");
const sandbox={};sandbox.globalThis=sandbox;
vm.runInNewContext(fs.readFileSync("site/heldout-blind-color-core.js","utf8"),sandbox);
vm.runInNewContext(fs.readFileSync("site/heldout-component-identification-core.js","utf8"),sandbox);
const source=sandbox.ChromalectBlindColorRehearsal.validateSource(warnings,folds,palette);
const core=sandbox.ChromalectComponentIdentificationRehearsal;
const items=core.validateSource(target,source);
assert.equal(items.length,49);
assert.equal(new Set(items.map(x=>x.id)).size,49);
assert.equal(new Set(items.map(x=>x.rank)).size,48);
assert.equal(items.filter(x=>x.reviewState==="introduced").length,23);
assert.equal(items.filter(x=>x.reviewState==="resolved").length,21);
assert.equal(items.filter(x=>x.reviewState==="retained").length,5);
const seed=20261023,plan=core.plan(items,seed);
assert.equal(plan.filter(t=>t.presentation==="original").length,25);
assert.equal(plan.filter(t=>t.presentation==="experimental").length,24);
assert.equal(plan.filter(t=>t.correctLeft).length,25);
assert.deepEqual(plan.map(t=>t.sourceIndex).slice().sort((a,b)=>a-b),
 Array.from({length:49},(_,i)=>i));
assert.deepEqual(JSON.parse(JSON.stringify(plan)),
 JSON.parse(JSON.stringify(core.plan(items,seed))));
assert.notEqual(plan.map(x=>x.id).join("|"),
 core.plan(items,seed+1).map(x=>x.id).join("|"));
const date="2026-10-23T21:45:00.000Z";
const display={pixelSize:48,surface:"white",appearance:"color"};
const all=new Map(plan.map((t,i)=>
 [t.id,i%3===0?"left":i%3===1?"right":"cannot_judge"]));
const exp=core.exportSession(plan,all,display,seed,date);
assert.equal(exp.schema,core.schema);
assert.equal(exp.session.recorded,49);
assert.equal(exp.summary.answered,33);
assert.equal(exp.summary.abstained,16);
assert.equal(exp.summary.validatedHumanRecognitionResults,0);
assert.equal(exp.summary.certifiedVisualMappings,0);
assert.equal(exp.summary.semanticApprovals,0);
assert.equal(exp.session.automaticallyUploaded,false);
assert.equal(exp.session.participantEligibilityApproved,false);
assert.equal(exp.session.balancedOriginalTreatments,25);
assert.equal(exp.session.balancedCorrectLeft,25);
assert.equal(exp.observations.length,49);
assert.equal(core.validateSession(exp,items).observations,49);
const alteredPlan=plan.map(t=>({...t}));
alteredPlan[0].sourceIndex=alteredPlan[1].sourceIndex;
assert.throws(()=>core.exportSession(alteredPlan,all,display,seed,date));
const partial=core.exportSession(plan,new Map([[plan[0].id,"cannot_judge"]]),
 display,seed,date);
assert.equal(core.validateSession(partial,items).observations,1);
assert.equal(partial.summary.matchesUnverifiedMachineOwner,0);
const badExport=[
 x=>{x.status="independent_visual_certification";},
 x=>{x.source.independentlyApprovedTargetOwners=1;},
 x=>{x.session.automaticallyUploaded=true;},
 x=>{x.session.eligibleParticipantId="test";},
 x=>{x.session.balancedCorrectLeft=24;},
 x=>{x.session.seed=seed+1;},
 x=>{x.session.display.pixelSize=17;},
 x=>{x.session.recorded=48;},
 x=>{x.observations[0].treatment=x.observations[0].treatment==="original"?"experimental":"original";},
 x=>{x.observations[0].optionLeft=x.observations[0].optionRight;},
 x=>{x.observations[0].agreesWithUnverifiedSourceOwner=null;},
 x=>{x.observations[0].visualDiscriminationVerified=true;},
 x=>{x.observations[0].participantId="test";},
 x=>{x.observations[0].answer="verified_correct";},
 x=>{x.observations[1].trialId=x.observations[0].trialId;},
 x=>{x.summary.matchesUnverifiedMachineOwner++;},
 x=>{x.summary.certifiedVisualMappings=1;}
];
for(const modify of badExport){
 const invalid=structuredClone(exp);modify(invalid);
 assert.throws(()=>core.validateSession(invalid,items));
}
const invalidSource=[
 d=>{d.source.ownerKeyIndependentlyVerified=true;},
 d=>{d.source.sourceGeometryModified=true;},
 d=>{d.targets[0].targetRegionPaths=0;},
 d=>{d.targets[0].machineAssignedOwner="cmp-9999";},
 d=>{d.targets[0].sourceOwnershipIndependentlyCertified=true;},
 d=>{d.targets[0].locatorSVG="../outside.svg";},
 d=>{d.summary.humanResponses=1;},
 d=>{d.targets[1].id=d.targets[0].id;},
 d=>{d.targets[0].offeredComponents[0].id="cmp-9999";},
 d=>{d.targets[0].locatorSHA256="not-a-hash";}
];
for(const modify of invalidSource){
 const malformed=structuredClone(target);modify(malformed);
 assert.throws(()=>core.validateSource(malformed,source));
}
assert.throws(()=>core.plan(items,0));
assert.throws(()=>core.plan(items,4294967296));
assert.throws(()=>core.exportSession(plan,new Map([[plan[0].id,"incorrect"]]),display,seed,date));
console.log("49 machine-keyed trial definitions; 25/24 treatments and positions; 17 invalid exports, 10 source alterations refused.");
