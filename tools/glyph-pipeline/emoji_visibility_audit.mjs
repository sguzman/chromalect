// Deterministic emoji presentation risk audit.
// Does NOT approve Mandarin senses, semantic cues, or human comprehension.
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
const src="data/semantic/";
const crossref=src+"cedict-crossref/";
const ledger=JSON.parse(fs.readFileSync(src+"mandarin-1000-v0.1.json","utf8"));
const strict=JSON.parse(fs.readFileSync(crossref+"strict-gloss-index-v0.1.json","utf8"));
const runtime=fs.readFileSync("site/semantic-grammar.js","utf8");
const box={};box.globalThis=box;vm.runInNewContext(runtime,box);
const grammar=box.ChromalectSemanticGrammar;

assert.equal(ledger.characters.length,1000);
assert.equal(strict.records.length,897);
const key=(rank,meaning)=>JSON.stringify([rank,meaning]);
const comparison=new Map(strict.records.map(x=>[key(x.rank,x.selectedMeaning),x]));
assert.equal(comparison.size,strict.records.length);

const records=[];
const flaggedKeys=new Set();
for(const entry of ledger.characters){
 const cues=entry.screening.candidates.filter(c=>c.expression);
 const viewByDisplay=new Map();
 for(const cue of cues){
  assert.equal(grammar.validate(cue.expression),true);
  const display=grammar.emojiDisplay(cue.expression);
  const matching=comparison.get(key(entry.rank,cue.selectedMeaning));
  assert.ok(matching,"Every proposed cue must have a strict dictionary comparison");
  const symbols=grammar.emojiParts(cue.expression);
  assert.ok(symbols.every(x=>x.kind==="emoji"));
  const id="r"+String(entry.rank).padStart(4,"0")+"-s"+String(records.filter(x=>x.rank===entry.rank).length+1).padStart(2,"0");
  const operators=new Set();
  function visit(n){
   operators.add(n.kind);
   for(const k of ["items"])if(Array.isArray(n[k]))n[k].forEach(visit);
   for(const k of ["predicate","value","property","head","from","to"])if(n[k])visit(n[k]);
   if(n.roles)for(const r of Object.values(n.roles))visit(r);
  }
  visit(cue.expression);
  const riskFlags=[];
  if(operators.has("event"))riskFlags.push("event_role_not_explicit_in_emoji");
  if(operators.has("associate"))riskFlags.push("association_not_explicit_in_emoji");
  if(!matching.wholeTermMatch)riskFlags.push("no_whole_term_dictionary_match");
  const item={
   id,rank:entry.rank,character:entry.character,selectedMeaning:cue.selectedMeaning,
   emojiDisplay:display,emojiCount:symbols.length,operators:[...operators],
   wholeTermDictionaryMatch:matching.wholeTermMatch,
   riskFlags,
   independentLexicalReview:"pending",
   independentEmojiComprehensionReview:"pending",
   productionVerified:false
  };
  records.push(item);
  if(!viewByDisplay.has(display))viewByDisplay.set(display,[]);
  viewByDisplay.get(display).push(item);
 }
 for(const values of viewByDisplay.values())if(values.length>1){
  for(const r of values)r.riskFlags.push("same_character_senses_identical_display");
 }
}
assert.equal(records.length,897);
const count=f=>records.filter(f).length;
const summary={
 characterScope:ledger.characters.length,
 proposedExpressions:records.length,
 auditedExpressions:records.length,
 singleEmojiExpressions:count(x=>x.emojiCount===1),
 multipleEmojiExpressions:count(x=>x.emojiCount>1),
 maximumEmojiCount:Math.max(...records.map(x=>x.emojiCount)),
 eventExpressions:count(x=>x.operators.includes("event")),
 singleEmojiEventExpressions:count(x=>x.operators.includes("event")&&x.emojiCount===1),
 expressionsWithAssociation:count(x=>x.operators.includes("associate")),
 missingWholeTermDictionaryMatch:count(x=>!x.wholeTermDictionaryMatch),
 sameCharacterSenseCollisionExpressions:count(x=>x.riskFlags.includes("same_character_senses_identical_display")),
 sameCharacterSenseCollisionCharacters:new Set(records.filter(x=>x.riskFlags.includes("same_character_senses_identical_display")).map(x=>x.rank)).size,
 humanLexicalApproved:0,
 humanEmojiComprehensionApproved:0,
 productionVerified:0
};
assert.deepEqual(
 [summary.singleEmojiExpressions,summary.multipleEmojiExpressions,summary.eventExpressions,
  summary.singleEmojiEventExpressions,summary.expressionsWithAssociation,summary.missingWholeTermDictionaryMatch,
  summary.sameCharacterSenseCollisionExpressions,summary.sameCharacterSenseCollisionCharacters],
 [875,22,280,266,21,248,2,1]);
assert.equal(summary.singleEmojiExpressions+summary.multipleEmojiExpressions,897);
assert.equal(summary.maximumEmojiCount,3);
const audit={
 schema:"chromalect.semantic.emoji-visibility-audit.v0.1",
 status:"automated_visual_projection_review_only_not_linguistic_or_comprehension_approval",
 source:{grammar:"site/semantic-grammar.js",candidates:"data/semantic/mandarin-1000-v0.1.json",strictDictionaryIndex:"data/semantic/cedict-crossref/strict-gloss-index-v0.1.json"},
 scope:"first_1000_Mandarin_characters",
 caveats:[
  "Single pictograms are often appropriate; single-icon count is not a failure.",
  "Verb/event status is typed in JSON, but the emoji-only projection lacks a mandatory visible action distinction.",
  "Reusing the same emoji across DIFFERENT characters is expected, not a collision.",
  "A flagged relation or same-character polysemy is a review candidate, not proof that its emoji is wrong.",
  "Neither literal English matching nor automated graphical structure can substitute for human meaning comprehension."
 ],
 summary,
 records
};
if(process.argv.includes("--check")){
 const checked=JSON.parse(fs.readFileSync(crossref+"emoji-visibility-audit-v0.1.json","utf8"));
 assert.deepEqual(checked,audit,"Committed audit must exactly match the reproducible generator");
 console.log("Emoji visual risk audit verified: "+records.length+" expressions; "+summary.singleEmojiEventExpressions+" single-icon events; "+summary.sameCharacterSenseCollisionCharacters+" within-character collision.");
}else{
 fs.writeFileSync(crossref+"emoji-visibility-audit-v0.1.json",JSON.stringify(audit,null,2)+"\n");
 console.log("Wrote "+records.length+" emoji visibility audit records");
}
