import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
const data=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const manifest=data("site/glyphs/research/heldout-warning-v0.1/index-v0.1.json");
const folds=data("site/semantic-group-hue-fivefold-heldout-v0.1.json");
const palette=data("palettes/mandarin-component-identity-v0.6.json");
const code=fs.readFileSync("site/heldout-blind-color-core.js","utf8");
const scope={};scope.globalThis=scope;vm.runInNewContext(code,scope);
const core=scope.ChromalectBlindColorRehearsal;
assert.equal(core.schema,"chromalect.glyph.heldout-blind-presentation-rehearsal.v0.1");
const source=core.validateSource(manifest,folds,palette);
assert.equal(source.length,49);
assert.equal(new Set(source.map(x=>x.id)).size,49);
assert.equal(new Set(source.map(x=>x.rank)).size,48);
assert.equal(source.filter(x=>x.reviewState==="introduced").length,23);
assert.equal(source.filter(x=>x.reviewState==="resolved").length,21);
assert.equal(source.filter(x=>x.reviewState==="retained").length,5);
const seed=20261023;
const trials=core.permutation(source,seed);
assert.equal(trials.length,49);
assert.equal(trials.filter(x=>x.leftCondition==="original").length,25);
assert.equal(trials.filter(x=>x.leftCondition==="experimental").length,24);
assert.deepEqual(JSON.parse(JSON.stringify(trials)),
 JSON.parse(JSON.stringify(core.permutation(source,seed))));
assert.notEqual(trials.map(t=>t.id).join("|"),
 core.permutation(source,seed+1).map(t=>t.id).join("|"));
assert.deepEqual(Array.from(trials,x=>x.position),Array.from({length:49},(_,i)=>i+1));
const settings={pixelSize:48,surface:"white",appearance:"color"};
const when="2026-10-23T21:42:00.000Z";
let responses=new Map(trials.map((t,i)=>[t.id,i%4===0?"left_clearer":
 i%4===1?"right_clearer":i%4===2?"similar":"cannot_judge"]));
const report=core.createSession(trials,responses,settings,seed,when);
assert.equal(report.session.recorded,49);
assert.equal(report.session.localOnly,true);
assert.equal(report.session.automaticallyUploaded,false);
assert.equal(report.session.persistedInBrowser,false);
assert.equal(report.session.ethicsProtocolApproved,false);
assert.equal(report.session.participantEligibilityVerified,false);
assert.equal(report.session.randomizedPresentation,true);
assert.equal(report.session.balancedOriginalLeft,25);
assert.equal(report.session.balancedExperimentalLeft,24);
assert.equal(report.source.independentlyCertifiedGlyphs,0);
assert.equal(report.observations.length,49);
assert.equal(core.validateSession(report,source).productionVisualCertifications,0);
const partial=core.createSession(trials,new Map([[trials[0].id,"cannot_judge"]]),
 settings,seed,when);
assert.equal(core.validateSession(partial,source).localResponses,1);
for(const bad of [
 r=>{r.status="confirmed_human_perception";},
 r=>{r.source.independentlyCertifiedGlyphs=1;},
 r=>{r.session.ethicsProtocolApproved=true;},
 r=>{r.session.automaticallyUploaded=true;},
 r=>{r.session.balancedOriginalLeft=24;},
 r=>{r.session.recorded=48;},
 r=>{r.session.randomSeed=seed+1;},
 r=>{r.observations[0].leftCondition=
  r.observations[0].leftCondition==="original"?"experimental":"original";},
 r=>{r.observations[0].rank=5000;},
 r=>{r.observations[0].response="verified_visual_discrimination";},
 r=>{r.observations[0].visualCertificationGranted=true;},
 r=>{r.observations[0].sourceConditionRevealedBeforeResponse=true;},
 r=>{r.observations[0].semanticFamilyApproved=true;},
 r=>{r.observations[1].trialId=r.observations[0].trialId;},
 r=>{r.session.display.pixelSize=13;},
 r=>{r.observations[1].presentationIndex=r.observations[0].presentationIndex;}
]){
 const invalid=structuredClone(report);bad(invalid);
 assert.throws(()=>core.validateSession(invalid,source));
}
for(const alter of [
 (m,f,p)=>{m.provenance.sourceGlyphsOverwritten=true;},
 (m,f,p)=>{m.glyphs[0].visualReview="certified";},
 (m,f,p)=>{m.glyphs[0].pairs[0].foldOptimizedDeltaOk=.18;},
 (m,f,p)=>{m.glyphs[0].heldoutSVG="/external.svg";},
 (m,f,p)=>{f.folds[0].excludedFromOptimizer[0]=9999;},
 (m,f,p)=>{f.folds[0].sourcePinnedCandidateColors[0].semanticApproval=true;},
 (m,f,p)=>{const id=m.glyphs[0].pairs[0].componentA.id;
  p.components.find(x=>x.id===id).color="#000000";},
 (m,f,p)=>{m.summary.newlyFlaggedGlyphs=24;}
]){
 const m=structuredClone(manifest),f=structuredClone(folds),p=structuredClone(palette);
 alter(m,f,p);assert.throws(()=>core.validateSource(m,f,p));
}
assert.throws(()=>core.permutation(source,0));
assert.throws(()=>core.permutation(source,4294967296));
assert.throws(()=>core.createSession(trials,
 new Map([[trials[0].id,"visual_approved"]]),settings,seed,when));
console.log("49 source-backed rehearsal observations, 25/24 concealed order, 16 invalid exports and 8 provenance failures.");
