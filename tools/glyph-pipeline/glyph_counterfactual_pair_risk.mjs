// Per-character component color separation under the source v0.6 palette
// versus a separate, 40-historical-hint research counterfactual.
// Uses final source-owned component IDs, not provisional catalog IDS.
import assert from "node:assert/strict";
import fs from "node:fs";
import {pathToFileURL} from "node:url";
import {derivePilotGroupCounterfactual} from "./pilot_group_counterfactual.mjs";
const threshold=0.07;
function oklab(hex){
 assert.match(hex,/^#[0-9a-f]{6}$/i);
 const [r,g,b]=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255)
  .map(v=>v<=0.04045?v/12.92:((v+0.055)/1.055)**2.4);
 const l=Math.cbrt(.4122214708*r+.5363325363*g+.0514459929*b),
  m=Math.cbrt(.2119034982*r+.6806995451*g+.1073969566*b),
  s=Math.cbrt(.0883024619*r+.2817188376*g+.6299787005*b);
 return [.2104542553*l+.7936177850*m-.0040720468*s,
  1.9779984951*l-2.4285922050*m+.4505937099*s,
  .0259040371*l+.7827717662*m-.8086757660*s];
}
const distance=(a,b)=>{
 const x=oklab(a),y=oklab(b);return Math.hypot(...x.map((v,i)=>v-y[i]));
};
const r6=x=>Number(x.toFixed(6));
const key=(a,b)=>[a,b].sort().join("|");
export function deriveGlyphPairRisk(catalog,mappings,sourcePalette,experimentIndex,baselineReview){
 const alt=derivePilotGroupCounterfactual(sourcePalette);
 assert.equal(catalog.schema,"chromalect.character-tranche.v1");
 assert.equal(catalog.tranche,"0001-1000");
 assert.equal(catalog.characters.length,1000);
 assert.equal(mappings.schema,"chromalect.component-stroke-mappings.v1");
 assert.equal(mappings.palette_ref,"mandarin-component-identity@0.6.0");
 assert.equal(mappings.glyph_count,mappings.glyphs.length);
 assert.ok(mappings.glyph_count>=1000&&mappings.glyph_count<=1032);
 assert.equal(experimentIndex.schema,
  "chromalect.glyph.historical-hint-counterfactual-gallery.v0.1");
 assert.equal(experimentIndex.status,
  "build_generated_isolated_research_svg_recolor_only_no_semantic_or_visual_approval");
 assert.equal(experimentIndex.summary.catalogGlyphs,1000);
 assert.equal(experimentIndex.summary.hypotheticalComponentIds,40);
 assert.equal(experimentIndex.provenance.activeGlyphFilesOverwritten,false);
 assert.equal(experimentIndex.provenance.semanticFamilyApprovals,0);
 assert.equal(baselineReview.schema,
  "chromalect.glyph-independent-review-worklist.v0.1");
 assert.equal(baselineReview.status,
  "build_derived_source_review_priority_not_independent_visual_certification");
 assert.equal(baselineReview.summary.catalogCharacters,1000);
 assert.equal(baselineReview.summary.independentlyVisuallyCertified,0);
 assert.equal(baselineReview.summary.colorContrastWarningPairs,26);
 const byGlyph=new Map(mappings.glyphs.map(g=>[g.character,g]));
 assert.equal(byGlyph.size,mappings.glyph_count);
 const reviewByRank=new Map(baselineReview.records.map(r=>[r.rank,r]));
 assert.equal(reviewByRank.size,1000);
 const trialByRank=new Map(experimentIndex.glyphs.map(r=>[r.rank,r]));
 assert.equal(trialByRank.size,experimentIndex.summary.affectedGlyphs);
 const sourceMap=new Map(sourcePalette.components.map(c=>[c.id,c]));
 const altMap=new Map(alt.groups.flatMap(g=>g.members.map(m=>[m.componentId,m])));
 assert.equal(sourceMap.size,520);assert.equal(altMap.size,40);
 const rows=[];
 const totals={sourceUniqueComponentPairs:0,originalClosePairs:0,proposedClosePairs:0,
  newlyClosePairs:0,resolvedClosePairs:0,retainedClosePairs:0,
  worsenedPairDistances:0,improvedPairDistances:0,unchangedPairDistances:0,
  affectedGlyphs:0,affectedGlyphsWithNewClosePairs:0,
  originalFlaggedGlyphs:0,proposedFlaggedGlyphs:0};
 for(let i=0;i<1000;i++){
  const ch=catalog.characters[i],mapping=byGlyph.get(ch.character),
   sourceReview=reviewByRank.get(i+1),trial=trialByRank.get(i+1);
  if(ch.rank!==i+1||!mapping||!sourceReview||
     sourceReview.character!==ch.character||mapping.character!==ch.character||
     mapping.independently_visually_certified!==false)
   throw Error("Misaligned source Chinese character or visual review identity");
  const components=new Map();
  for(const part of mapping.components){
   const source=sourceMap.get(part.component_id),previous=components.get(part.component_id);
   if(!source||source.color.toUpperCase()!==part.hex.toUpperCase()||
      source.shape!==part.form||
      previous&&(previous.form!==part.form||previous.hex!==part.hex))
    throw Error("Source glyph component has inconsistent or altered color identity");
   components.set(part.component_id,part);
  }
  if(components.size===0||mapping.source_path_owner_ids.length===0||
     !mapping.source_path_owner_ids.every(id=>components.has(id)))
   throw Error("Incomplete source component ownership sequence");
  const members=[...components.values()].sort((a,b)=>
   a.component_id.localeCompare(b.component_id));
  const changed=members.filter(m=>altMap.has(m.component_id))
   .map(m=>m.component_id).sort();
  const affected=changed.length>0;
  if(affected){
   totals.affectedGlyphs++;
   if(!trial||trial.character!==ch.character||
      JSON.stringify(changed)!==JSON.stringify(trial.changedComponentIds)||
      trial.activePaletteUntouched!==true||
      trial.sourcePathsIdentical!==true||
      trial.componentOwnerSequenceIdentical!==true)
    throw Error("Affected glyph differs from the isolated source SVG evidence");
  }else if(trial)throw Error("Unexpected research SVG for unchanged glyph");
  const warningSet=new Set();
  for(const pair of sourceReview.colorContrastWarnings){
   if(!pair||!components.has(pair.componentA.id)||
      !components.has(pair.componentB.id)||pair.componentA.id===pair.componentB.id)
    throw Error("Unrecognized published original color caution");
   warningSet.add(key(pair.componentA.id,pair.componentB.id));
  }
  if(warningSet.size!==sourceReview.closeColorPairs)
   throw Error("Duplicate or missing original color caution");
  const pairs=[];
  let baselineClose=0,candidateClose=0,introduced=0,resolved=0,retained=0;
  for(let a=0;a<members.length;a++)for(let b=a+1;b<members.length;b++){
   const first=members[a],second=members[b],
    idA=first.component_id,idB=second.component_id;
   const originalA=sourceMap.get(idA).color,originalB=sourceMap.get(idB).color;
   const candidateA=altMap.get(idA)?.candidateHex??originalA;
   const candidateB=altMap.get(idB)?.candidateHex??originalB;
   const before=distance(originalA,originalB),after=distance(candidateA,candidateB);
   const originalFlag=before<threshold,trialFlag=after<threshold;
   const warned=warningSet.has(key(idA,idB));
   if(originalFlag!==warned)throw Error("Published source proximity warning drift");
   const delta=after-before;
   const state=trialFlag&&!originalFlag?"introduced":
    originalFlag&&!trialFlag?"resolved":
    originalFlag&&trialFlag?"retained":"not_close";
   if(originalFlag)baselineClose++;
   if(trialFlag)candidateClose++;
   if(state==="introduced")introduced++;
   if(state==="resolved")resolved++;
   if(state==="retained")retained++;
   if(delta< -1e-10)totals.worsenedPairDistances++;
   else if(delta>1e-10)totals.improvedPairDistances++;
   else totals.unchangedPairDistances++;
   totals.sourceUniqueComponentPairs++;
   if(affected&&(originalFlag||trialFlag||
      (delta< -1e-10&&after<threshold*1.5))){
    pairs.push({componentA:{id:idA,form:first.form,
       sourceHex:originalA,candidateHex:candidateA},
      componentB:{id:idB,form:second.form,
       sourceHex:originalB,candidateHex:candidateB},
      originalDeltaOk:r6(before),candidateDeltaOk:r6(after),
      changeDeltaOk:r6(delta),state,
      originalSourceWarning:warned,
      experimentalMeasurementOnly:true,perceptuallyVerified:false});
   }
  }
  if(baselineClose!==sourceReview.closeColorPairs)
   throw Error("Source warning count differs from independently generated review worklist");
  totals.originalClosePairs+=baselineClose;
  totals.proposedClosePairs+=candidateClose;
  totals.newlyClosePairs+=introduced;
  totals.resolvedClosePairs+=resolved;
  totals.retainedClosePairs+=retained;
  if(baselineClose)totals.originalFlaggedGlyphs++;
  if(candidateClose)totals.proposedFlaggedGlyphs++;
  if(affected){
   if(introduced)totals.affectedGlyphsWithNewClosePairs++;
   pairs.sort((a,b)=>a.candidateDeltaOk-b.candidateDeltaOk||
    a.componentA.id.localeCompare(b.componentA.id)||
    a.componentB.id.localeCompare(b.componentB.id));
   rows.push({rank:ch.rank,character:ch.character,
    svg:trial.hypotheticalSVG,
    sourceSVG:trial.originalSVG,
    changedComponentIds:changed,distinctComponentIds:members.length,
    sourceUniqueComponentPairs:members.length*(members.length-1)/2,
    originalClosePairs:baselineClose,candidateClosePairs:candidateClose,
    introducedClosePairs:introduced,resolvedClosePairs:resolved,
    retainedClosePairs:retained,
    reviewPairs:pairs,
    sourceGeometryUnchanged:true,productionPaletteUnchanged:true,
    visualJudgment:"pending",lexicalInterpretation:"unapproved"});
  }
 }
 if(totals.affectedGlyphs!==experimentIndex.summary.affectedGlyphs||
    totals.originalClosePairs!==26||
    totals.proposedClosePairs!==totals.newlyClosePairs+totals.retainedClosePairs||
    totals.originalClosePairs!==totals.resolvedClosePairs+totals.retainedClosePairs||
    totals.worsenedPairDistances+totals.improvedPairDistances+
      totals.unchangedPairDistances!==totals.sourceUniqueComponentPairs)
  throw Error("Experimental pair census does not reconcile with original sources");
 return {schema:"chromalect.glyph.hint-hue-source-pair-risk.v0.1",
  status:"machine_computed_per_glyph_identity_proximity_not_human_discrimination",
  provenance:{palette:"mandarin-component-identity@0.6.0",
   sourceManifest:"site/glyphs/mappings.json",
   sourceReview:"site/glyphs/review/independent-review-worklist-v0.1.json",
   experimentalGlyphs:"site/glyphs/research/hint-counterfactual-v0.1/index-v0.1.json",
   variant:"chromalect.palette.historical-hint-counterfactual.v0.1",
   metric:"Euclidean OKLab delta from original and unchanged-or-hypothetical component hex",
   cutoffDeltaOk:threshold,originalPaletteMutated:false,
   simulatedVisionImpairment:false,humanReviewPerformed:false,
   semanticFamilyApproval:false},
  summary:{catalogCharacters:1000,paletteIdentities:520,
   hypotheticalComponentIds:40,independentlyAcceptedSemanticFamilies:0,
   humanLegibilityTrials:0,
   ...totals},glyphs:rows};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const root="site/glyphs/";
 const result=deriveGlyphPairRisk(
  JSON.parse(fs.readFileSync("data/catalog/characters-0001-1000.json","utf8")),
  JSON.parse(fs.readFileSync(root+"mappings.json","utf8")),
  JSON.parse(fs.readFileSync("palettes/mandarin-component-identity-v0.6.json","utf8")),
  JSON.parse(fs.readFileSync(root+"research/hint-counterfactual-v0.1/index-v0.1.json","utf8")),
  JSON.parse(fs.readFileSync(root+"review/independent-review-worklist-v0.1.json","utf8"))
 );
 const file="site/glyphs/research/hint-counterfactual-v0.1/pair-risk-v0.1.json";
 const payload=JSON.stringify(result,null,2)+"\n";
 if(process.argv.includes("--write"))fs.writeFileSync(file,payload);
 else if(process.argv.includes("--check"))assert.equal(fs.readFileSync(file,"utf8"),payload);
 else throw Error("Expected --write or --check");
 console.log("Source-owned component color proximity in original vs experiment:",JSON.stringify(result.summary));
}
