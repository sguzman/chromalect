import assert from "node:assert/strict";
import fs from "node:fs";
import {deriveRoadmapProgress} from "./roadmap_checkpoint_progress.mjs";
const md=fs.readFileSync("docs/roadmap.md","utf8");
const data=JSON.parse(fs.readFileSync("data/progress/roadmap-checkpoints-v0.1.json","utf8"));
assert.deepEqual(deriveRoadmapProgress(md),data);
assert.equal(data.schema,"chromalect.project.roadmap-checkpoints.v0.1");
assert.equal(data.status,"document_checklist_completion_not_scientific_validation_or_overall_project_percentage");
assert.equal(data.source.independentValidationNotImplied,true);
assert.equal(data.phases.length,5);
assert.deepEqual(data.phases.map(x=>[x.key,x.complete,x.total]),[
 ["research-foundation",7,9],["palette-experiment",11,15],["phonetic-notation",12,16],
 ["mandarin-semantics",18,22],["contextual-fusion",0,4]]);
for(const phase of data.phases){
 assert.equal(phase.complete+phase.pending,phase.total);
 assert.equal(phase.checkpoints.length,phase.total);
 assert.equal(phase.checkpoints.filter(x=>x.state==="complete").length,phase.complete);
 assert.equal(phase.checkpoints.filter(x=>x.state==="pending").length,phase.pending);
 assert.equal(phase.checklistPercent,Math.round(100*phase.complete/phase.total));
}
const changed=md.replace("- [ ] Independently adjudicate attested readings",
 "- [x] Independently adjudicate attested readings");
assert.notDeepEqual(deriveRoadmapProgress(changed),data);
console.log("Roadmap dashboard: five distinct evidence-gated phases, not a weighted completion claim.");
