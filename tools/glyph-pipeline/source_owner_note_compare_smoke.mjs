import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import {compareOwnerReports} from "./source_owner_note_compare.mjs";
const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const src={
 targets:read("site/glyphs/research/heldout-identification-target-v0.1/index-v0.1.json"),
 warnings:read("site/glyphs/research/heldout-warning-v0.1/index-v0.1.json"),
 folds:read("site/semantic-group-hue-fivefold-heldout-v0.1.json"),
 palette:read("palettes/mandarin-component-identity-v0.6.json"),
 complements:read("site/glyphs/research/owner-complement-locators-v0.1/index-v0.1.json")
};
const scripts=["site/heldout-blind-color-core.js","site/heldout-component-identification-core.js",
 "site/component-owner-adjudication-core.js","site/component-owner-compare-core.js"]
 .map(p=>fs.readFileSync(p,"utf8"));
const ctx={URL,Map,Set};ctx.globalThis=ctx;
for(const script of scripts)vm.runInNewContext(script,ctx);
const pairs=ctx.ChromalectBlindColorRehearsal.validateSource(src.warnings,src.folds,src.palette);
const targets=ctx.ChromalectComponentIdentificationRehearsal.validateSource(src.targets,pairs);
assert.equal(targets.length,49);
const notes=(entries)=>new Map(entries.map(([i,j])=>[targets[i].id,{
 judgment:j,evidenceURL:"https://example.org/component-reference",
 technicalRationale:"External component source geometry would require independent comparison before any accepted ownership decision."
}]));
const audit=ctx.ChromalectOwnerAdjudication;
const a=audit.exportNotes(targets,notes([[0,"provisional_support"],[1,"provisional_conflict"],
 [2,"shape_ambiguity"],[4,"provisional_support"]]),"2026-10-23T00:00:00.000Z");
const b=audit.exportNotes(targets,notes([[0,"provisional_support"],[1,"provisional_support"],
 [2,"shape_ambiguity"],[3,"provisional_conflict"]]),"2026-10-23T00:01:00.000Z");
const out=JSON.parse(JSON.stringify(compareOwnerReports(src,a,b,scripts)));
assert.equal(out.schema,"chromalect.glyph.provisional-owner-note-comparison.v0.1");
assert.equal(out.summary.firstRecords,4);
assert.equal(out.summary.secondRecords,4);
assert.equal(out.summary.jointlyObserved,3);
assert.equal(out.summary.matchingProvisionalJudgments,2);
assert.equal(out.summary.conflictingProvisionalJudgments,1);
assert.equal(out.summary.firstOnly,1);
assert.equal(out.summary.secondOnly,1);
assert.equal(out.summary.noObservation,44);
assert.equal(out.summary.jointShapeAmbiguityObservations,1);
assert.equal(out.summary.identicalObservationContent,false);
assert.equal(out.summary.sourceOwnerCertifications,0);
assert.equal(out.summary.independentlyReconciledPairs,0);
assert.equal(out.rows.length,49);
assert.deepEqual(out.rows.slice(0,5).map(x=>x.comparison),
 ["matching","disagreeing","matching","onlySecond","onlyFirst"]);
assert.ok(out.rows.every(x=>x.sourceOwnerCertified===false&&x.independentlyReconciled===false));
assert.ok(!JSON.stringify(out).includes("https://example.org/component-reference"));
assert.ok(!JSON.stringify(out).includes("External component source geometry"));
assert.equal(compareOwnerReports(src,a,a,scripts).summary.identicalObservationContent,true);
const refuse=(mutate,which=0)=>{
 const copy=[structuredClone(a),structuredClone(b)];
 mutate(copy[which]);
 assert.throws(()=>compareOwnerReports(src,...copy,scripts));
};
refuse(x=>{x.session.sourceOwnerCertifications=1;});
refuse(x=>{x.observations[0].sourceSHA256="0".repeat(64);});
refuse(x=>{x.observations[0].judgment="certified";},1);
refuse(x=>{x.observations[0].technicalRationale="short";},1);
refuse(x=>{x.observations[0].evidenceURL="https://example.org/q?name=1";});
refuse(x=>{x.observations[0].hiddenReviewerName="identifier";},1);
refuse(x=>{x.observations.push(x.observations[0]);x.session.recorded++;});
refuse(x=>{x.session.includesPersonalIdentifiers=true;});
refuse(x=>{x.observations.reverse();});
const tampered=structuredClone(src);tampered.targets.summary.independentlyVerifiedAnswerKeys=1;
assert.throws(()=>compareOwnerReports(tampered,a,b,scripts));
const html=fs.readFileSync("site/component-owner-compare.html","utf8");
assert.ok(html.includes("component-owner-compare-core.js"));
assert.ok(html.includes('id="oc-compare"'));
console.log("Two 49-target provisional exports compared: agreement, conflict, missingness; ten poison cases refused; zero certified claims.");
