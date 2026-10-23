// Research-only collision-reduced counterfactual for the 40 original
// mnemonic-hint components. Deterministic, source-conditioned and in-sample.
// No active palette, source glyph or semantic record is modified.
import assert from "node:assert/strict";
import fs from "node:fs";
import {pathToFileURL} from "node:url";
import {derivePilotGroupCounterfactual} from "./pilot_group_counterfactual.mjs";
const CUT=0.07;
const round=x=>Number(x.toFixed(6));
function lab(hex){
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
const distance=(a,b)=>Math.hypot(...a.map((x,i)=>x-b[i]));
function sRGB(L,C,h){
 const rad=h*Math.PI/180,a=C*Math.cos(rad),b=C*Math.sin(rad),
  l=(L+.3963377774*a+.2158037573*b)**3,
  m=(L-.1055613458*a-.0638541728*b)**3,
  s=(L-.0894841775*a-1.2914855480*b)**3;
 const channels=[4.0767416621*l-3.3077115913*m+.2309699292*s,
  -1.2684380046*l+2.6097574011*m-.3413193965*s,
  -.0041960863*l-.7034186147*m+1.7076147010*s];
 if(channels.some(v=>!Number.isFinite(v)||v<0||v>1))return null;
 return "#"+channels.map(x=>Math.round(255*(x<=.0031308?12.92*x:1.055*x**(1/2.4)-.055))
  .toString(16).padStart(2,"0")).join("").toUpperCase();
}
export function deriveCollisionConstrainedPilot(catalog,mappings,palette,riskReport){
 const earlier=derivePilotGroupCounterfactual(palette);
 assert.equal(catalog.schema,"chromalect.character-tranche.v1");
 assert.equal(catalog.characters.length,1000);
 assert.equal(mappings.schema,"chromalect.component-stroke-mappings.v1");
 assert.equal(mappings.palette_ref,"mandarin-component-identity@0.6.0");
 assert.ok(mappings.glyph_count>=1000&&mappings.glyph_count<=1032);
 assert.equal(mappings.glyph_count,mappings.glyphs.length);
 assert.equal(riskReport.schema,"chromalect.glyph.hint-hue-source-pair-risk.v0.1");
 assert.equal(riskReport.summary.catalogCharacters,1000);
 assert.equal(riskReport.summary.originalClosePairs,26);
 assert.equal(riskReport.summary.proposedClosePairs,76);
 assert.equal(riskReport.summary.newlyClosePairs,70);
 assert.equal(riskReport.summary.affectedGlyphs,542);
 assert.equal(riskReport.provenance.originalPaletteMutated,false);
 const original=new Map(palette.components.map(c=>[c.id,c]));
 const starting=new Map(earlier.groups.flatMap(g=>g.members.map(m=>[m.componentId,m])));
 assert.equal(original.size,520);assert.equal(starting.size,40);
 const byGlyph=new Map(mappings.glyphs.map(g=>[g.character,g]));
 assert.equal(byGlyph.size,mappings.glyph_count);
 // Pair multiplicity equals the number of distinct first-tranche glyphs
 // containing that unique component-ID pair. No source stroke is double-counted.
 const edges=new Map();
 for(const ch of catalog.characters){
  const glyph=byGlyph.get(ch.character);
  if(!glyph||glyph.independently_visually_certified!==false)
   throw Error("Unmatched or visually promoted source glyph");
  const ids=[...new Set(glyph.components.map(c=>{
   const o=original.get(c.component_id);
   if(!o||o.color.toUpperCase()!==c.hex.toUpperCase()||o.shape!==c.form)
    throw Error("Source component color mismatch");
   return c.component_id;
  }))].sort();
  assert.ok(ids.length>0);
  for(let i=0;i<ids.length;i++)for(let j=i+1;j<ids.length;j++){
   const a=ids[i],b=ids[j],key=a+"|"+b;
   if(!starting.has(a)&&!starting.has(b))continue;
   edges.set(key,(edges.get(key)??0)+1);
  }
 }
 const adjacency=new Map([...starting.keys()].map(id=>[id,[]]));
 const edgeList=[];
 for(const [k,weight] of edges){
  const [a,b]=k.split("|");
  edgeList.push({a,b,weight});
  if(adjacency.has(a))adjacency.get(a).push({other:b,weight});
  if(adjacency.has(b))adjacency.get(b).push({other:a,weight});
 }
 const activeHex=new Map([...original].map(([k,v])=>[k,v.color.toUpperCase()]));
 const selected=new Map([...starting].map(([id,row])=>[id,row.candidateHex]));
 const labCache=new Map();
 function vector(hex){if(!labCache.has(hex))labCache.set(hex,lab(hex));return labCache.get(hex);}
 function actual(id){return selected.get(id)??activeHex.get(id);}
 function tally(){
  let warnings=0,shortfall=0,soft=0;
  for(const {a,b,weight} of edgeList){
   const d=distance(vector(actual(a)),vector(actual(b)));
   if(d<CUT){warnings+=weight;shortfall+=weight*(CUT-d);}
   if(d<.105)soft+=weight*(.105-d);
  }
  return {warnings,shortfall,soft};
 }
 const initial=tally();
 assert.equal(initial.warnings+riskReport.summary.originalClosePairs-
  riskReport.summary.resolvedClosePairs-
  riskReport.summary.retainedClosePairs,initial.warnings); // no semantic promotion
 // Comparability check: whole palette also includes unaffected source pairs.
 const baselineCandidate=initial.warnings;
 assert.ok(baselineCandidate<=riskReport.summary.proposedClosePairs);
 const order=[...starting.keys()].sort((a,b)=>
  adjacency.get(b).reduce((n,e)=>n+e.weight,0)-
   adjacency.get(a).reduce((n,e)=>n+e.weight,0)||a.localeCompare(b));
 const pool=new Map(),startingLab=new Map();
 for(const group of earlier.groups)for(const m of group.members){
  const id=m.componentId,baseHue=m.candidateOklch.hueDegrees,options=new Set([m.candidateHex]);
  for(const L of [.46,.50,.54,.58,.62,.66,.70,.74,.78])
   for(const C of [.07,.09,.11,.13])
    for(const h of [-15,-10,-5,0,5,10,15]){
     const hex=sRGB(L,C,baseHue+h);
     if(hex)options.add(hex);
    }
  pool.set(id,[...options]);startingLab.set(id,vector(m.candidateHex));
 }
 const score=(id,color)=>{
  let warnings=0,shortfall=0,soft=0;
  for(const {other,weight} of adjacency.get(id)){
   const d=distance(vector(color),vector(actual(other)));
   if(d<CUT){warnings+=weight;shortfall+=weight*(CUT-d);}
   if(d<.105)soft+=weight*(.105-d);
  }
  const deviation=distance(vector(color),startingLab.get(id));
  return [warnings,shortfall,soft,deviation];
 };
 const better=(a,b)=>{
  for(let i=0;i<a.length;i++){
   if(a[i]<b[i]-1e-9)return true;
   if(a[i]>b[i]+1e-9)return false;
  }
  return false;
 };
 let replacements=0;
 for(let round=0;round<3;round++){
  let changes=0;
  for(const id of order){
   const before=selected.get(id);
   let best=before,quality=score(id,best);
   for(const hex of pool.get(id)){
    if(hex!==before&&[...selected].some(([other,color])=>other!==id&&color===hex))
     continue;
    const trial=score(id,hex);
    if(better(trial,quality)){quality=trial;best=hex;}
   }
   if(best!==before){selected.set(id,best);changes++;replacements++;}
  }
  if(changes===0)break;
 }
 const final=tally();
 assert.ok(final.warnings<=initial.warnings,"Optimization must never add machine warnings");
 const seen=new Set(),groups=[];
 for(const group of earlier.groups){
  const members=group.members.map(m=>{
   const hex=selected.get(m.componentId);
   assert.ok(/^#[0-9A-F]{6}$/.test(hex)&&!seen.has(hex));seen.add(hex);
   return {componentId:m.componentId,form:m.form,sourceHex:m.sourceHex,
    firstTrialHex:m.candidateHex,optimizedTrialHex:hex,
    historicalHint:group.historicalHint,
    groupMembershipApproval:"unverified_historical_mnemonic_hint",
    visuallyDiscriminable:"unverified",semanticFamilyVerified:false};
  });
  groups.push({historicalHint:group.historicalHint,
   historicalHintVerified:false,anchorHueDegrees:group.proposedHueDegrees,
   memberCount:members.length,members});
 }
 assert.equal(seen.size,40);
 const firstTrial=earlier.groups.flatMap(g=>g.members);
 function meanDistances(variant){
  const colors=groups.flatMap(g=>g.members.map(m=>({...m,group:g.historicalHint})));
  const within=[],between=[];
  for(let i=0;i<colors.length;i++)for(let j=i+1;j<colors.length;j++){
   const a=colors[i],b=colors[j],d=distance(
    vector(variant==="first"?a.firstTrialHex:a.optimizedTrialHex),
    vector(variant==="first"?b.firstTrialHex:b.optimizedTrialHex));
   (a.group===b.group?within:between).push(d);
  }
  assert.equal(within.length,88);assert.equal(between.length,692);
  return {within:round(within.reduce((a,b)=>a+b,0)/within.length),
   between:round(between.reduce((a,b)=>a+b,0)/between.length),
   minWithin:round(Math.min(...within))};
 }
 return {schema:"chromalect.palette.source-cooccurrence-hue-optimizer.v0.2",
  status:"in_sample_40_component_optimization_research_only_no_semantic_or_visual_approval",
  provenance:{sourcePalette:"mandarin-component-identity@0.6.0",
   baseVariant:"chromalect.palette.historical-hint-counterfactual.v0.1",
   sourceMappings:"site/glyphs/mappings.json",
   sourceRiskAudit:"site/glyphs/research/hint-counterfactual-v0.1/pair-risk-v0.1.json",
   optimizer:"deterministic source-cooccurrence coordinate descent with candidate colors confined to ±15° original group hue anchor",
   researchOnly:true,activeSourcePaletteMutated:false,
   heldOutGlyphsEvaluated:0,humanPerceptualTests:0,semanticMembershipsApproved:0},
  summary:{catalogCharacters:1000,originalPaletteComponents:520,
   alteredHypotheticalIDs:40,unhintedExcluded:480,
   distinctSourceCooccurrenceEdges:edgeList.length,
   firstTrialWarningsInAffectedEdges:initial.warnings,
   optimizedWarningsInAffectedEdges:final.warnings,
   sourceOriginalWarningPairs:26,
   firstTrialAllGlyphWarningPairs:76,
   changedCandidateSwatches:groups.flatMap(g=>g.members).filter(m=>
    m.firstTrialHex!==m.optimizedTrialHex).length,
   coordinateDescentUpdates:replacements,
   groupDistanceFirstTrial:meanDistances("first"),
   groupDistanceOptimized:meanDistances("optimized"),
   humanLearningStudies:0,approvedLexicalOrSemanticFamilies:0},
  groups};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const file=p=>JSON.parse(fs.readFileSync(p,"utf8"));
 const value=deriveCollisionConstrainedPilot(
  file("data/catalog/characters-0001-1000.json"),
  file("site/glyphs/mappings.json"),
  file("palettes/mandarin-component-identity-v0.6.json"),
  file("site/glyphs/research/hint-counterfactual-v0.1/pair-risk-v0.1.json"));
 const target="site/mnemonic-group-risk-optimized-v0.2.json";
 const encoded=JSON.stringify(value,null,2)+"\n";
 if(process.argv.includes("--write"))fs.writeFileSync(target,encoded);
 else if(process.argv.includes("--check"))assert.equal(fs.readFileSync(target,"utf8"),encoded);
 else throw Error("Use --write or --check");
 console.log("In-sample experimental group-hue collision minimization:",JSON.stringify(value.summary));
}
