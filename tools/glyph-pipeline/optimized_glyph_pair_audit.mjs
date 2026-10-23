// Full first-tranche source-owner pair census: active v0.6, first
// historical-hint grouping, and in-sample co-occurrence-reduced grouping.
// Distances are research diagnostics, not glyph discrimination outcomes.
import assert from "node:assert/strict";
import fs from "node:fs";
import {pathToFileURL} from "node:url";
import {derivePilotGroupCounterfactual} from "./pilot_group_counterfactual.mjs";
const round=x=>Number(x.toFixed(6));
const limit=0.07;
function lab(hex){
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
const metric=(a,b)=>{const x=lab(a),y=lab(b);return Math.hypot(...x.map((v,i)=>v-y[i]));};
export function deriveOptimizedPairAudit(catalog,mappings,palette,firstRisk,second){
 const first=derivePilotGroupCounterfactual(palette);
 assert.equal(catalog.schema,"chromalect.character-tranche.v1");
 assert.equal(catalog.characters.length,1000);
 assert.equal(mappings.schema,"chromalect.component-stroke-mappings.v1");
 assert.equal(mappings.palette_ref,"mandarin-component-identity@0.6.0");
 assert.equal(firstRisk.schema,"chromalect.glyph.hint-hue-source-pair-risk.v0.1");
 assert.equal(firstRisk.summary.catalogCharacters,1000);
 assert.equal(firstRisk.summary.sourceUniqueComponentPairs,1020);
 assert.equal(firstRisk.summary.originalClosePairs,26);
 assert.equal(firstRisk.summary.proposedClosePairs,76);
 assert.equal(firstRisk.summary.newlyClosePairs,70);
 assert.equal(firstRisk.summary.affectedGlyphs,542);
 assert.equal(second.schema,"chromalect.palette.source-cooccurrence-hue-optimizer.v0.2");
 assert.equal(second.status,
  "in_sample_40_component_optimization_research_only_no_semantic_or_visual_approval");
 assert.equal(second.provenance.activeSourcePaletteMutated,false);
 assert.equal(second.provenance.heldOutGlyphsEvaluated,0);
 assert.equal(second.provenance.humanPerceptualTests,0);
 assert.equal(second.provenance.semanticMembershipsApproved,0);
 assert.equal(second.summary.alteredHypotheticalIDs,40);
 assert.equal(second.summary.firstTrialAllGlyphWarningPairs,76);
 assert.ok(second.summary.optimizedWarningsInAffectedEdges<=
  second.summary.firstTrialWarningsInAffectedEdges);
 const original=new Map(palette.components.map(c=>[c.id,c]));
 const firstHex=new Map(first.groups.flatMap(g=>g.members.map(m=>[m.componentId,m.candidateHex])));
 const optimized=new Map(second.groups.flatMap(g=>g.members.map(m=>[m.componentId,m])));
 assert.equal(original.size,520);assert.equal(firstHex.size,40);assert.equal(optimized.size,40);
 for(const [id,c] of optimized){
  const o=original.get(id);
  if(!o||o.color!==c.sourceHex||o.shape!==c.form||
     c.firstTrialHex!==firstHex.get(id)||
     c.visuallyDiscriminable!=="unverified"||
     c.semanticFamilyVerified!==false||
     !/^#[0-9A-F]{6}$/.test(c.optimizedTrialHex))
   throw Error("Optimized source identity does not match immutable palette");
 }
 const byGlyph=new Map(mappings.glyphs.map(g=>[g.character,g]));
 assert.equal(byGlyph.size,mappings.glyphs.length);
 const totals={pairs:0,originalClose:0,firstClose:0,optimizedClose:0,
  newVersusOriginal:0,resolvedVersusOriginal:0,retainedVersusOriginal:0,
  removedFromFirst:0,addedVersusFirst:0,retainedFromFirst:0,
  affectedGlyphs:0,charactersWithOptimizedClose:0,
  charactersWithNewOptimizedClose:0};
 const rows=[];
 for(let i=0;i<1000;i++){
  const source=catalog.characters[i],glyph=byGlyph.get(source.character);
  if(!glyph||source.rank!==i+1||
     glyph.independently_visually_certified!==false)
   throw Error("Missing or unreviewed source-aligned mapping");
  const components=new Map();
  for(const p of glyph.components){
   const o=original.get(p.component_id),prior=components.get(p.component_id);
   if(!o||o.color.toUpperCase()!==p.hex.toUpperCase()||
      o.shape!==p.form||
      (prior&&(prior.hex!==p.hex||prior.form!==p.form)))
    throw Error("Source owner or original color differs from active palette");
   components.set(p.component_id,p);
  }
  if(!components.size||!glyph.source_path_owner_ids?.length||
     !glyph.source_path_owner_ids.every(id=>components.has(id)))
   throw Error("Incomplete source stroke owner sequence");
  const items=[...components.values()].sort((a,b)=>a.component_id.localeCompare(b.component_id));
  const affected=items.some(c=>optimized.has(c.component_id));
  const pairs=[];
  let aCount=0,bCount=0,cCount=0,n=0,resolved=0,retained=0;
  for(let j=0;j<items.length;j++)for(let k=j+1;k<items.length;k++){
   const x=items[j],y=items[k],oX=original.get(x.component_id).color,
    oY=original.get(y.component_id).color,
    fX=firstHex.get(x.component_id)??oX,
    fY=firstHex.get(y.component_id)??oY,
    qX=optimized.get(x.component_id)?.optimizedTrialHex??oX,
    qY=optimized.get(y.component_id)?.optimizedTrialHex??oY;
   const values=[metric(oX,oY),metric(fX,fY),metric(qX,qY)];
   const flags=values.map(v=>v<limit);
   totals.pairs++;
   if(flags[0]){totals.originalClose++;aCount++;}
   if(flags[1]){totals.firstClose++;bCount++;}
   if(flags[2]){totals.optimizedClose++;cCount++;}
   if(flags[2]&&!flags[0]){totals.newVersusOriginal++;n++;}
   if(flags[0]&&!flags[2]){totals.resolvedVersusOriginal++;resolved++;}
   if(flags[0]&&flags[2]){totals.retainedVersusOriginal++;retained++;}
   if(flags[1]&&!flags[2])totals.removedFromFirst++;
   if(!flags[1]&&flags[2])totals.addedVersusFirst++;
   if(flags[1]&&flags[2])totals.retainedFromFirst++;
   if(affected&&(flags.some(Boolean)||values[2]<.105)){
    pairs.push({componentA:{id:x.component_id,form:x.form},
     componentB:{id:y.component_id,form:y.form},
     original:{hexA:oX,hexB:oY,deltaOk:round(values[0])},
     firstTrial:{hexA:fX,hexB:fY,deltaOk:round(values[1])},
     optimized:{hexA:qX,hexB:qY,deltaOk:round(values[2])},
     newOriginalWarning:flags[2]&&!flags[0],
     resolvedFirstWarning:flags[1]&&!flags[2],
     status:"machine_color_distance_not_human_discrimination"});
   }
  }
  if(affected){
   totals.affectedGlyphs++;
   if(cCount)totals.charactersWithOptimizedClose++;
   if(n)totals.charactersWithNewOptimizedClose++;
   pairs.sort((x,y)=>x.optimized.deltaOk-y.optimized.deltaOk);
   rows.push({rank:source.rank,character:source.character,
    originalClosePairs:aCount,firstTrialClosePairs:bCount,
    optimizedClosePairs:cCount,newOptimizedClosePairs:n,
    resolvedOriginalClosePairs:resolved,retainedOriginalClosePairs:retained,
    ownerPathsUnmodified:true,sourcePaletteUnchanged:true,
    independentVisualReview:"pending",semanticInterpretation:"unapproved",
    reviewPairs:pairs});
  }
 }
 if(totals.pairs!==1020||totals.originalClose!==26||
    totals.firstClose!==76||totals.affectedGlyphs!==542||
    totals.optimizedClose>totals.firstClose||
    totals.optimizedClose!==totals.newVersusOriginal+totals.retainedVersusOriginal||
    totals.originalClose!==totals.resolvedVersusOriginal+totals.retainedVersusOriginal||
    totals.firstClose!==totals.removedFromFirst+totals.retainedFromFirst||
    totals.optimizedClose!==totals.addedVersusFirst+totals.retainedFromFirst)
  throw Error("Optimized pair totals diverge from source-owned baseline");
 return {schema:"chromalect.glyph.optimized-historical-hue-pair-audit.v0.2",
  status:"complete_in_sample_source_pair_census_not_human_visual_or_semantic_approval",
  provenance:{palette:"mandarin-component-identity@0.6.0",
   mappings:"site/glyphs/mappings.json",
   firstRisk:"site/glyphs/research/hint-counterfactual-v0.1/pair-risk-v0.1.json",
   optimizedVariant:"site/mnemonic-group-risk-optimized-v0.2.json",
   cutoffDeltaOk:limit,
   glyphPathsRecolored:false,activePaletteModified:false,
   independentReadingExperiment:false,heldOutTesting:false},
  summary:{catalogCharacters:1000,componentIdentities:520,optimizedComponentIds:40,
   humanDiscriminationTrials:0,approvedSemanticFamilies:0,...totals},
  glyphs:rows};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
 const result=deriveOptimizedPairAudit(
  read("data/catalog/characters-0001-1000.json"),
  read("site/glyphs/mappings.json"),
  read("palettes/mandarin-component-identity-v0.6.json"),
  read("site/glyphs/research/hint-counterfactual-v0.1/pair-risk-v0.1.json"),
  read("site/mnemonic-group-risk-optimized-v0.2.json"));
 const target="site/glyphs/research/hint-counterfactual-v0.1/optimized-pair-audit-v0.2.json",
  encoded=JSON.stringify(result,null,2)+"\n";
 if(process.argv.includes("--write"))fs.writeFileSync(target,encoded);
 else if(process.argv.includes("--check"))assert.equal(fs.readFileSync(target,"utf8"),encoded);
 else throw Error("Expected --write or --check");
 console.log("All first-tranche same-glyph pair distances across three color assignments:",JSON.stringify(result.summary));
}
