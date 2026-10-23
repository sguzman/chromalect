import assert from "node:assert/strict";
import fs from "node:fs";
const dir="data/semantic/cedict-crossref/";
const d=JSON.parse(fs.readFileSync(dir+"dictionary-word-surface-leads-v0.1.json","utf8"));
const high=JSON.parse(fs.readFileSync(dir+"high-attention-evidence-priority-v0.1.json","utf8"));
assert.equal(d.schema,"chromalect.semantic.dictionary-word-surface-leads.v0.1");
assert.equal(d.status,"publisher_dictionary_word_leads_not_independent_usage_attestations");
assert.equal(d.sourcePages.length,4);
assert.equal(d.leads.length,8);
const ids=new Set(),words=new Set(),sources=new Map(d.sourcePages.map(x=>[x.rank,x]));
for(const word of d.leads){
 assert.ok(!ids.has(word.id)&&!words.has(word.surfaceWord));
 ids.add(word.id);words.add(word.surfaceWord);
 assert.equal(high.records.find(x=>x.rank===word.rank)?.character,word.character);
 assert.ok(word.surfaceWord.includes(word.character)&&[...word.surfaceWord].length>=2);
 assert.equal(word.publisherSourceURL,sources.get(word.rank).url);
 assert.ok(word.dictionaryHeadingReading&&word.contextHint);
 assert.equal(word.sentenceReadingAssignment,null);
 assert.equal(word.independentlyAdjudicated,false);
}
assert.deepEqual([...sources.keys()].sort((a,b)=>a-b),[127,379,407,821]);
console.log("Eight independent-dictionary word surface leads: none independently attested in corpus.");
