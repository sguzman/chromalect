// Fixed-palette, fixed-group-size descriptive random partition benchmark.
// NOT a randomized experiment, statistical test of linguistic groups, or
// independent validation of component semantics.
import assert from "node:assert/strict";
import fs from "node:fs";
import {pathToFileURL} from "node:url";
import {deriveMnemonicGroupPilot} from "./mnemonic_group_color_pilot.mjs";
const round=x=>Number(x.toFixed(6));
function oklab(hex){
 assert.match(hex,/^#[0-9a-f]{6}$/i);
 const [r,g,b]=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255)
  .map(x=>x<=0.04045?x/12.92:((x+0.055)/1.055)**2.4);
 const l=Math.cbrt(.4122214708*r+.5363325363*g+.0514459929*b),
  m=Math.cbrt(.2119034982*r+.6806995451*g+.1073969566*b),
  s=Math.cbrt(.0883024619*r+.2817188376*g+.6299787005*b);
 return [0.2104542553*l+0.7936177850*m-0.0040720468*s,
  1.9779984951*l-2.4285922050*m+0.4505937099*s,
  0.0259040371*l+0.7827717662*m-0.8086757660*s];
}
function mean(values){return values.reduce((n,x)=>n+x,0)/values.length;}
export function deriveMnemonicPartitionBenchmark(palette){
 const pilot=deriveMnemonicGroupPilot(palette);
 assert.equal(pilot.summary.pilotHintedComponents,40);
 assert.equal(pilot.summary.withinHintPairs,88);
 assert.equal(pilot.summary.betweenHintPairs,692);
 const colors=palette.components.slice(0,40),
  vecs=colors.map(c=>oklab(c.color));
 const distances=vecs.map(a=>vecs.map(b=>
  Math.hypot(...a.map((x,k)=>x-b[k]))));
 const hints=pilot.groups.map(g=>g.mnemonicHint),
  sizes=pilot.groups.map(g=>g.summary.members);
 const labels=colors.map(c=>hints.indexOf(c.mnemonic_group_hint));
 assert.ok(labels.every(n=>n>=0));
 const withinCount=sizes.reduce((n,s)=>n+s*(s-1)/2,0);
 assert.equal(withinCount,88);
 function withinMean(assigned){
  let total=0,n=0;
  for(let i=0;i<40;i++)for(let j=i+1;j<40;j++){
   if(assigned[i]===assigned[j]){total+=distances[i][j];n++;}
  }
  assert.equal(n,88);
  return total/n;
 }
 const observed=withinMean(labels);
 assert.ok(Math.abs(observed-pilot.summary.meanWithinHintDeltaOk)<0.000001);
 const baseline=sizes.flatMap((n,i)=>Array(n).fill(i));
 const seed=0xC01A2631;
 let state=seed;
 function randomWord(){
  state^=state<<13;
  state^=state>>>17;
  state^=state<<5;
  return state>>>0;
 }
 const iterations=10000,distribution=[];
 for(let k=0;k<iterations;k++){
  const assignment=baseline.slice();
  for(let i=assignment.length-1;i>0;i--){
   const j=randomWord()%(i+1);
   [assignment[i],assignment[j]]=[assignment[j],assignment[i]];
  }
  distribution.push(withinMean(assignment));
 }
 distribution.sort((a,b)=>a-b);
 const rank=distribution.filter(v=>v<=observed).length;
 const quantiles={p025:round(distribution[249]),
  p05:round(distribution[499]),median:round(distribution[4999]),
  p95:round(distribution[9499]),p975:round(distribution[9749])};
 return {schema:"chromalect.palette.mnemonic-partition-benchmark.v0.1",
  status:"fixed_palette_random_partition_descriptive_control_not_semantic_or_statistical_approval",
  provenance:{palette:"mandarin-component-identity@0.6.0",
   pilot:"chromalect.palette.mnemonic-hint-color-pilot.v0.1",
   method:"Deterministic Fisher-Yates shuffle with xorshift32 unsigned state and fixed 8 group sizes",
   randomSeedUnsigned:seed,iterations,
   paletteRecolored:false,semanticMembershipAdjudicated:false,
   participantStudyConducted:false},
  scope:{pilotComponents:40,unhintedComponentsExcluded:480,
   sourceHintGroups:8,withinPairs:88,betweenPairs:692,
   groupSizes:sizes},
  result:{observedWithinHintMeanDeltaOk:round(observed),
   permutedMeanWithinHintDeltaOk:round(mean(distribution)),
   quantiles,permutationsAtOrBelowObserved:rank,
   permutationsAboveObserved:iterations-rank,
   observedComparedToPermutationMean:round(observed-mean(distribution)),
   statisticallyValidatedSemanticClustering:false,
   perceptualDiscriminationApproved:false,
   lexicalSemanticFamiliesApproved:0}};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const source=JSON.parse(fs.readFileSync("palettes/mandarin-component-identity-v0.6.json","utf8"));
 const result=deriveMnemonicPartitionBenchmark(source);
 const target="site/mnemonic-partition-benchmark-v0.1.json",bytes=JSON.stringify(result,null,2)+"\n";
 if(process.argv.includes("--write"))fs.writeFileSync(target,bytes);
 else if(process.argv.includes("--check"))assert.equal(fs.readFileSync(target,"utf8"),bytes);
 else throw Error("Use --write or --check");
 console.log("Descriptive, fixed-size random partition benchmark (not a hypothesis test):",JSON.stringify(result.result));
}
