import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import os from "node:os";
import path from "node:path";
import {spawnSync} from "node:child_process";
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
assert.equal(out.summary.sharedEvidenceReferencePairs,3);
const canonicalURL=structuredClone(b);
canonicalURL.observations[0].evidenceURL="https://EXAMPLE.ORG:443/component-reference";
const canonical=compareOwnerReports(src,a,canonicalURL,scripts);
assert.equal(canonical.summary.sharedEvidenceReferencePairs,3);
assert.equal(canonical.rows[0].sameEvidenceReference,true);
assert.equal(out.summary.differingEvidenceReferencePairs,0);
assert.equal(out.rows[0].sameEvidenceReference,true);
assert.equal(out.rows[3].sameEvidenceReference,null);
const otherURL=structuredClone(b);
otherURL.observations[0].evidenceURL="https://example.org/alternate-source";
const changed=compareOwnerReports(src,a,otherURL,scripts);
assert.equal(changed.summary.sharedEvidenceReferencePairs,2);
assert.equal(changed.summary.differingEvidenceReferencePairs,1);
assert.equal(changed.rows[0].sameEvidenceReference,false);
assert.ok(!JSON.stringify(changed).includes("alternate-source"));
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
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),"chromalect-source-owner-comparison-"));
try{
 const firstFile=path.join(tmp,"first.json");
 const secondFile=path.join(tmp,"second.json");
 const outputFile=path.join(tmp,"report.json");
 const firstBytes=JSON.stringify(a,null,2)+"\n";
 const secondBytes=JSON.stringify(b,null,2)+"\n";
 fs.writeFileSync(firstFile,firstBytes);
 fs.writeFileSync(secondFile,secondBytes);
 const cliPath="tools/glyph-pipeline/source_owner_note_compare.mjs";
 const run=(first,second,output)=>spawnSync(process.execPath,
  [cliPath,"--compare",first,second,"--output",output],{encoding:"utf8"});
 const good=run(firstFile,secondFile,outputFile);
 assert.equal(good.status,0,good.stderr);
 const produced=JSON.parse(fs.readFileSync(outputFile,"utf8"));
 assert.equal(produced.summary.conflictingProvisionalJudgments,1);
 assert.equal(produced.summary.sourceOwnerCertifications,0);
 assert.ok(!fs.readFileSync(outputFile,"utf8").includes("component-reference"));
 const originalOutput=fs.readFileSync(outputFile,"utf8");
 const existing=run(firstFile,secondFile,outputFile);
 assert.notEqual(existing.status,0,"Existing report must not be overwritten");
 assert.equal(fs.readFileSync(outputFile,"utf8"),originalOutput);
 const alias=path.join(tmp,"output-link.json");
 fs.symlinkSync(firstFile,alias);
 const linked=run(firstFile,secondFile,alias);
 assert.notEqual(linked.status,0,"Existing symlink must not be followed");
 assert.equal(fs.readFileSync(firstFile,"utf8"),firstBytes);
 const overwriteInput=run(firstFile,secondFile,firstFile);
 assert.notEqual(overwriteInput.status,0,"Source-note input must not be replaced");
 assert.equal(fs.readFileSync(firstFile,"utf8"),firstBytes);
 assert.equal(fs.readFileSync(secondFile,"utf8"),secondBytes);
 const invalidFile=path.join(tmp,"invalid.json");
 const invalid=structuredClone(a);
 invalid.session.sourceOwnerCertifications=1;
 fs.writeFileSync(invalidFile,JSON.stringify(invalid));
 const rejectedOutput=path.join(tmp,"invalid-output.json");
 const poisoned=run(invalidFile,secondFile,rejectedOutput);
 assert.notEqual(poisoned.status,0,"Invalid source-note claims must fail");
 assert.equal(fs.existsSync(rejectedOutput),false);
}finally{
 fs.rmSync(tmp,{recursive:true,force:true});
}
const html=fs.readFileSync("site/component-owner-compare.html","utf8");
assert.ok(html.includes("component-owner-compare-core.js"));
assert.ok(html.includes('id="oc-compare"'));
console.log("Two 49-target provisional exports compared: agreement, conflict, missingness; ten poison cases refused; zero certified claims.");
