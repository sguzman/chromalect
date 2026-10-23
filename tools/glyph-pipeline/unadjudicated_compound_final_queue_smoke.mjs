import assert from "node:assert/strict";
import fs from "node:fs";
import {deriveUnadjudicatedFinalWorkqueue} from "./unadjudicated_compound_final_queue.mjs";
const get=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const src=[
 get("site/pronunciation-citations-0001-1000.json"),
 get("data/phonetics/mandarin-simple-final-feature-candidates-v0.1.json"),
 get("data/phonetics/mandarin-final-spelling-context-gates-v0.1.json"),
 get("data/phonetics/written-final-symbol-control-v0.1.json")];
const d=get("data/phonetics/unadjudicated-compound-final-review-queue-v0.1.json");
assert.deepEqual(deriveUnadjudicatedFinalWorkqueue(...src),d);
assert.equal(d.summary.compoundWrittenFinalCategories,27);
assert.equal(d.summary.compoundFinalSourceUses,739);
assert.equal(d.summary.contextCautionedCompoundUses,101);
assert.equal(d.summary.nonCautionedCompoundUses,638);
assert.equal(d.summary.independentFinalPhonologicalApprovals,0);
assert.equal(d.summary.approvedContextualPronunciations,0);
assert.equal(d.summary.humanDecodingTrials,0);
assert.equal(d.records.length,27);
assert.equal(d.records.reduce((n,x)=>n+x.sourceCitationUses,0),739);
assert.equal(d.records.reduce((n,x)=>n+x.explicitContextCautionUses,0),101);
assert.ok(d.records.every(x=>x.proposedIPAForm===null&&
 x.phonologicalSegmentation==="not_adjudicated"&&
 x.machineOnlyWrittenCodeAvailable===true&&
 x.independenceOfContrast==="unreviewed"));
const corrupt=structuredClone(src);corrupt[3].summary.machineSourceSpellingRoundtrips=1170;
assert.throws(()=>deriveUnadjudicatedFinalWorkqueue(...corrupt));
const duplicate=structuredClone(src);
duplicate[2].records[0].observedTokenTriples.push(duplicate[2].records[0].observedTokenTriples[0]);
assert.throws(()=>deriveUnadjudicatedFinalWorkqueue(...duplicate));
console.log("27 source-specific compound-final review rows verified without unearned phonological approval.");
