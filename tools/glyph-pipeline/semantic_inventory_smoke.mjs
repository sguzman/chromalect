// Validate the first-1000 character meaning ledger and its relation to the
// fixed glyph catalog. Sourced glosses and pictogram candidates are NOT
// production-verified Mandarin lexical senses.
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const ledger = JSON.parse(fs.readFileSync("data/semantic/mandarin-1000-v0.1.json","utf8"));
const catalog = JSON.parse(fs.readFileSync("data/catalog/characters-0001-1000.json","utf8"));
const runtime = fs.readFileSync("site/semantic-grammar.js","utf8");
const sandbox = {};
sandbox.globalThis = sandbox;
vm.runInNewContext(runtime,sandbox);
const grammar = sandbox.ChromalectSemanticGrammar;

assert.equal(ledger.schema,"chromalect.mandarin.character-semantic-tranche.v0.1");
assert.equal(ledger.source.property,"kDefinition");
assert.match(ledger.source.commit,/^[0-9a-f]{40}$/);
assert.equal(ledger.source.provisional,true);
assert.equal(ledger.source.license,"Unicode License v3");
assert.equal(ledger.layers.character.status,"first_pass_active");
assert.equal(ledger.layers.wholeWord.status,"planned_unpopulated");
assert.equal(ledger.characters.length,1000);
assert.equal(catalog.characters.length,1000);
assert.equal(ledger.summary.productionVerifiedCharacters,0);

let sourced=0,screened=0,pictograms=0,deferred=0,pending=0;
const distinct=new Set();
for(let i=0;i<1000;i++){
  const entry=ledger.characters[i];
  const catalogRow=catalog.characters[i];
  assert.equal(entry.rank,i+1,"Rank sequence must match catalog");
  assert.equal(entry.rank,catalogRow.rank);
  assert.equal(entry.character,catalogRow.character,"Character sequence must match glyph atlas");
  assert.ok(!distinct.has(entry.character),"Duplicate character identity");
  distinct.add(entry.character);
  assert.equal(entry.source.property,"kDefinition");
  assert.equal(entry.source.codepoint,"U+"+entry.character.codePointAt(0).toString(16).toUpperCase());
  assert.ok(entry.source.definition.length>0);
  assert.ok(Array.isArray(entry.source.groupCandidates));
  assert.deepEqual(entry.source.groupCandidates,entry.source.definition.split(";").map(x=>x.trim()).filter(Boolean));
  sourced++;
  const s=entry.screening;
  assert.ok(Array.isArray(s.candidates));
  if(s.status==="pending"){
    pending++;
    assert.equal(s.candidates.length,0);
    continue;
  }
  assert.equal(s.status,"screened");
  assert.equal(s.candidates.length,1,"Initial screening makes one explicit decision per character");
  screened++;
  const c=s.candidates[0];
  if(c.state==="pictogram_deferred"){
    assert.equal(c.expression,null);
    assert.equal(c.selectedMeaning,null);
    assert.ok(c.reason);
    deferred++;
    continue;
  }
  assert.equal(c.state,"experimental_pictogram_candidate");
  assert.equal(c.review,"human_linguistic_and_comprehension_review_pending");
  assert.ok(Number.isInteger(c.sourceGroupIndex));
  assert.ok(c.sourceGroupIndex>=0&&c.sourceGroupIndex<entry.source.groupCandidates.length);
  const gloss=entry.source.groupCandidates[c.sourceGroupIndex].toLowerCase();
  assert.ok(gloss.includes(c.selectedMeaning.toLowerCase()),"Emoji candidate must cite a matching gloss: "+entry.character);
  assert.equal(grammar.validate(c.expression),true);
  const icons=grammar.emojiParts(c.expression);
  assert.ok(icons.length>0&&icons.every(p=>p.kind==="emoji"));
  pictograms++;
}
const actual={
  trancheCount:ledger.characters.length,
  meaningSourceFound:sourced,
  screenedCharacters:screened,
  pictogramCandidateCharacters:pictograms,
  deferredCharacters:deferred,
  pendingScreening:pending,
  productionVerifiedCharacters:0
};
assert.deepEqual(actual,ledger.summary);
assert.equal(pending+screened,1000);
assert.equal(pictograms+deferred,screened);
assert.ok(screened>=200,"Rank-200 screening progress must not regress");
console.log("Mandarin semantic screening: "+
  sourced+"/1000 sourced definitions; "+screened+"/1000 screened ("+
  (100*screened/1000).toFixed(1)+"%); "+pictograms+" pictogram candidates; "+
  deferred+" deferred; "+pending+" pending. Production-verified: 0.");
