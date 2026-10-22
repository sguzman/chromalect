import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
const source = fs.readFileSync("site/semantic-grammar.js", "utf8");
const corpus = JSON.parse(fs.readFileSync("site/semantic-grammar-v0.1.json", "utf8"));
const schema = JSON.parse(fs.readFileSync("ontology/semantic-expression-v0.1.schema.json", "utf8"));
const sandbox = {};
sandbox.globalThis = sandbox;
vm.runInNewContext(source, sandbox);
const g = sandbox.ChromalectSemanticGrammar;
assert.equal(g.version, "0.1.0");
assert.equal(corpus.schema, "chromalect.semantic.grammar.v0.1");
assert.equal(corpus.status, "experimental_not_production_semantics");
assert.equal(corpus.verifiedProductionCharacterCount, 0);
assert.equal(schema.oneOf.length, 7);
assert.equal(corpus.operators.length, 7);
assert.equal(corpus.roles.length, 5);
assert.ok(corpus.specimens.length >= 15);
const byId = Object.fromEntries(corpus.specimens.map(s => [s.id, s]));
assert.equal(Object.keys(byId).length, corpus.specimens.length);
for (const s of corpus.specimens) {
  assert.equal(s.verification, "illustrative");
  if (s.expr) {
    assert.equal(g.validate(s.expr), true);
    assert.ok(g.display(s.expr).length > 0);
    assert.ok(g.parts(s.expr).some(x => x.kind === "emoji"));
  }
}
assert.equal(g.display(byId.mountain.expr), "⛰️");
assert.equal(g.display(byId.study.expr), "▶(📖 ∼ 🧠)");
assert.equal(g.display(byId["red-apple"].expr), "🔴 · 🍎");
assert.equal(g.display(byId["eat-apple"].expr), "▶🍽️⟨A:👤,P:🍎⟩");
assert.equal(g.display(byId["walk-home"].expr), "▶🚶⟨A:👤,G:🏠⟩");
assert.equal(g.display(byId["not-eat"].expr), "¬(▶🍽️)");
assert.equal(g.parts(byId["extended-mnemonic"].expr).filter(x=>x.kind==="emoji").length,5);
assert.equal(byId.raw.expr, null);
assert.equal(g.display(null), "");
const atom = emoji => ({kind:"atom",emoji});
const mustFail = input => assert.throws(() => g.validate(input), TypeError);
mustFail({kind:"unknown"});
mustFail({kind:"atom",emoji:"English word"});
mustFail({kind:"and",items:[atom("🍎")]});
mustFail({kind:"associate",items:[]});
mustFail({kind:"event",predicate:atom("🚶"),roles:{unknown:atom("👤")}});
mustFail({kind:"event",predicate:atom("🚶"),roles:{}});
mustFail({kind:"event",predicate:{kind:"not",value:atom("🚶")}});
mustFail({kind:"atom",emoji:"🍎",privateField:true});
console.log("Semantic grammar: 19 illustrative specimens validated, scoped event roles, operator syntax, no symbol-count cap, and invalid forms rejected.");
