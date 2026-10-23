import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import {validateOwnerNotes} from "./component_owner_adjudication_validate.mjs";
const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const source={
 targets:read("site/glyphs/research/heldout-identification-target-v0.1/index-v0.1.json"),
 warnings:read("site/glyphs/research/heldout-warning-v0.1/index-v0.1.json"),
 folds:read("site/semantic-group-hue-fivefold-heldout-v0.1.json"),
 palette:read("palettes/mandarin-component-identity-v0.6.json")};
const scripts=["site/heldout-blind-color-core.js",
 "site/heldout-component-identification-core.js",
 "site/component-owner-adjudication-core.js"].map(p=>fs.readFileSync(p,"utf8"));
const ctx={URL,Map,Set};ctx.globalThis=ctx;
for(const js of scripts)vm.runInNewContext(js,ctx);
const pairing=ctx.ChromalectBlindColorRehearsal;
const original=pairing.validateSource(source.warnings,source.folds,source.palette);
const instrument=ctx.ChromalectComponentIdentificationRehearsal;
const targets=instrument.validateSource(source.targets,original);
const audit=ctx.ChromalectOwnerAdjudication;
assert.equal(audit.validateTargets(source.targets,targets).length,49);
const complements=JSON.parse(fs.readFileSync(
 "site/glyphs/research/owner-complement-locators-v0.1/index-v0.1.json","utf8"));
const complementary=audit.validateComplementaryLocators(complements,targets);
assert.equal(complementary.size,49);
for(const m of [
 d=>{d.records[0].complementarySHA256="0".repeat(64);},
 d=>{d.records[0].otherOwner="cmp-9999";},
 d=>{d.records[0].independentOwnershipCertified=true;},
 d=>{d.summary.eligibleStudyItems=1;},
 d=>{d.records[1].trialId=d.records[0].trialId;},
 d=>{d.records[0].complementarySVG="../other.svg";}
]){
 const copy=structuredClone(complements);m(copy);
 assert.throws(()=>audit.validateComplementaryLocators(copy,targets));
}
const t=targets[0],note={judgment:"provisional_conflict",
 evidenceURL:"https://example.org/source-evidence",
 technicalRationale:"The outlined owner should be reviewed against the independent glyph diagram and recorded source coordinates."};
const m=new Map([[t.id,note]]);
const report=audit.exportNotes(targets,m,"2026-10-23T00:00:00.000Z");
assert.equal(report.observations.length,1);
assert.equal(report.observations[0].sourceOwnerCertified,false);
assert.equal(validateOwnerNotes(source,report,scripts).certified,0);
const rejected=mutate=>{
 const bad=JSON.parse(JSON.stringify(report));mutate(bad);
 assert.throws(()=>validateOwnerNotes(source,bad,scripts));
};
rejected(x=>{x.session.sourceOwnerCertifications=1;});
rejected(x=>{x.observations[0].sourceOwnerCertified=true;});
rejected(x=>{x.observations[0].machineAssignedOwner="cmp-9999";});
rejected(x=>{x.observations[0].sourceSHA256="0".repeat(64);});
rejected(x=>{x.observations[0].evidenceURL="http://example.org";});
rejected(x=>{x.observations[0].evidenceURL="https://example.org?q=personal";});
rejected(x=>{x.observations[0].technicalRationale="short";});
rejected(x=>{x.observations[0].extraParticipantId="name";});
rejected(x=>{x.observations.push(x.observations[0]);x.session.recorded=2;});
rejected(x=>{x.session.includesPersonalIdentifiers=true;});
rejected(x=>{x.observations[0].judgment="certified";});
assert.throws(()=>audit.exportNotes(targets,new Map([[t.id,
 {...note,technicalRationale:"too short"}]]),"2026-10-23T00:00:00Z"));
const page=fs.readFileSync("site/component-owner-adjudication.html","utf8");
const js=fs.readFileSync("site/component-owner-adjudication.js","utf8");
for(const id of ["oa-status","oa-target","oa-meta","oa-source","oa-locator",
 "oa-fold","oa-owner","oa-complement","oa-complement-meta","oa-judgment","oa-evidence","oa-rationale","oa-save",
 "oa-count","oa-export","oa-output"]){
 assert.ok(page.includes('id="'+id+'"'),id);
 assert.ok(js.includes('"'+id+'"'),id);
}
assert.ok(page.includes('src="component-owner-adjudication-core.js"'));
assert.ok(!js.includes("innerHTML"));
assert.ok(!js.includes("localStorage"));
console.log("49 original source-owner pairs, 11 negative replay checks, zero certified claims.");
