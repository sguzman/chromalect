// Verify a provisional initial feature inventory against pinned Pinyin source and palette.
import assert from "node:assert/strict";
import fs from "node:fs";
const load=name=>JSON.parse(fs.readFileSync(name,"utf8"));
const d=load("data/phonetics/mandarin-initial-feature-candidates-v0.1.json");
const citation=load("site/pronunciation-citations-0001-1000.json");
const layers=load("site/layers-v0.1.json");
assert.equal(d.schema,"chromalect.phonetics.mandarin-initial-feature-candidates.v0.1");
assert.equal(d.status,"working_articulatory_candidate_codebook_not_independently_certified_phoneme_inventory");
assert.equal(citation.characters.length,1000);
assert.equal(d.scope.enumeratedSourceReadingCount,1171);
assert.equal(d.statistics.conventionalInitialTokens,21);
assert.equal(d.statistics.orthographicConventions,3);
assert.equal(d.statistics.independentlyVerifiedPhonemicContrasts,0);
assert.equal(d.statistics.validatedArticulatoryProduction,0);
assert.equal(d.statistics.educationalStudies,0);
assert.ok(Array.isArray(d.citations)&&d.citations.length>=3);
assert.ok(d.citations.every(s=>new URL(s.url).protocol==="https:"));
const tokenColors=layers.palette_domains.initial.tokens;
assert.equal(Object.keys(tokenColors).length,24);
const observed=new Map();
for(const c of citation.characters)for(const r of c.readings)
 observed.set(r.initial,1+(observed.get(r.initial)??0));
const tokens=new Map(d.tokens.map(x=>[x.token,x]));
assert.equal(tokens.size,24);
assert.deepEqual([...tokens.keys()].sort(),Object.keys(tokenColors).sort());
const allowedPlace=new Set(["bilabial","labiodental","alveolar","velar","alveolopalatal","postalveolar"]);
const allowedManner=new Set(["stop","nasal","fricative","lateral","affricate","approximant"]);
const allowedAspiration=new Set(["unaspirated","aspirated","none"]);
const features=new Set();let summed=0,consonants=0;
for(const rec of d.tokens){
 assert.equal(rec.citationReadingOccurrences,observed.get(rec.token)??0);
 assert.ok(rec.citationReadingOccurrences>=0);
 summed+=rec.citationReadingOccurrences;
 assert.ok(rec.evidenceReview&&rec.evidenceReview.includes("not_independently")||
    rec.evidenceReview==="literature_based_candidate_not_independently_adjudicated");
 if(rec.category==="conventional_pinyin_initial"){
  consonants++;
  assert.ok(allowedPlace.has(rec.place));
  assert.ok(allowedManner.has(rec.manner));
  assert.ok(allowedAspiration.has(rec.aspiration));
  assert.ok(typeof rec.workingIPACandidate==="string"&&rec.workingIPACandidate.length>0);
  const key=[rec.place,rec.manner,rec.aspiration].join("|");
  assert.ok(!features.has(key),"Feature code collision: "+key);
  features.add(key);
 }else{
  assert.equal(rec.category,"orthographic_onset_convention_not_independent_consonant");
  assert.ok(["y","w","∅"].includes(rec.token));
  assert.equal(rec.workingIPACandidate,null);
  assert.equal(rec.place,null);
  assert.equal(rec.manner,null);
  assert.equal(rec.aspiration,null);
 }
}
assert.equal(consonants,21);
assert.equal(summed,1171);
assert.equal(d.statistics.sourceTokenTotal,summed);
assert.equal(tokens.get("r").ipaStatus,"one_convention_variants_documented");
assert.ok(tokens.get("r").alternatives.includes("ʐ"));
assert.ok(tokens.get("h").alternatives.includes("h"));
assert.equal(tokens.get("y").workingIPACandidate,null);
assert.equal(tokens.get("w").workingIPACandidate,null);
assert.equal(tokens.get("∅").workingIPACandidate,null);
const pairNames=[["b","p"],["d","t"],["g","k"],["j","q"],["zh","ch"],["z","c"]];
for(const [unaspirated,aspirated] of pairNames){
 const a=tokens.get(unaspirated),b=tokens.get(aspirated);
 assert.equal(a.place,b.place);assert.equal(a.manner,b.manner);
 assert.equal(a.aspiration,"unaspirated");assert.equal(b.aspiration,"aspirated");
}
console.log("24 source initial tokens checked: 21 working consonantal feature classes and 3 orthographic conventions; 0 certified phonemic contrasts.");
