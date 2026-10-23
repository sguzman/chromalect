// Isolated source-exact SVGs for character-held-out color warnings.
// Colors are trained without the glyph under review; visual approval is zero.
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {createHash} from "node:crypto";
import {pathToFileURL} from "node:url";
const RE=/<path d="([^"]+)" fill="(#[0-9A-Fa-f]{6})" data-component="(cmp-\d{4})"\/>/g;
const DEST="glyphs/research/heldout-warning-v0.1";
const sha=s=>createHash("sha256").update(s,"utf8").digest("hex");
const noFill=s=>s.replace(RE,(x,d,hex)=>x.replace('fill="'+hex+'"','fill="#000000"'));
function lab(hex){
 const [r,g,b]=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255)
  .map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);
 const l=Math.cbrt(.4122214708*r+.5363325363*g+.0514459929*b),
  m=Math.cbrt(.2119034982*r+.6806995451*g+.1073969566*b),
  s=Math.cbrt(.0883024619*r+.2817188376*g+.6299787005*b);
 return [.2104542553*l+.793617785*m-.0040720468*s,
  1.9779984951*l-2.428592205*m+.4505937099*s,
  .0259040371*l+.7827717662*m-.808675766*s];
}
const distance=(a,b)=>{
 const x=lab(a),y=lab(b);return Math.hypot(...x.map((v,i)=>v-y[i]));
};
export function deriveHeldoutWarningGallery(catalog,mappings,palette,report,readSVG){
 assert.equal(catalog.schema,"chromalect.character-tranche.v1");
 assert.equal(catalog.characters.length,1000);
 assert.equal(mappings.schema,"chromalect.component-stroke-mappings.v1");
 assert.equal(mappings.palette_ref,"mandarin-component-identity@0.6.0");
 assert.equal(palette.schema,"chromalect.component-palette.v0");
 assert.equal(palette.version,"0.6.0");
 assert.equal(palette.components.length,520);
 assert.equal(report.schema,"chromalect.palette.historical-hue-five-fold-heldout.v0.1");
 assert.equal(report.status,
  "deterministic_800_train_200_heldout_numerical_source_glyph_diagnostic_only");
 assert.equal(report.summary.crossFoldHeldOutTotals.activeClosePairs,26);
 assert.equal(report.summary.crossFoldHeldOutTotals.firstTrialClosePairs,76);
 assert.equal(report.summary.crossFoldHeldOutTotals.optimizedClosePairs,28);
 assert.equal(report.summary.crossFoldHeldOutTotals.introducedOptimizedClosePairs,23);
 assert.equal(report.summary.crossFoldHeldOutTotals.resolvedOriginalClosePairs,21);
 assert.equal(report.summary.crossFoldHeldOutTotals.retainedOriginalClosePairs,5);
 assert.equal(report.provenance.originalPaletteRecolored,false);
 assert.equal(report.provenance.independentVisionTrialConducted,false);
 assert.equal(report.provenance.semanticFamilyAdjudicated,false);
 assert.equal(report.folds.length,5);
 const original=new Map(palette.components.map(c=>[c.id,c]));
 const glyphMap=new Map(mappings.glyphs.map(g=>[g.character,g]));
 assert.equal(original.size,520);
 assert.equal(glyphMap.size,mappings.glyph_count);
 const seenRanks=new Set(),entries=new Map(),states={introduced:0,resolved:0,retained:0};
 for(let i=0;i<5;i++){
  const fold=report.folds[i];
  if(fold.foldIndex!==i||fold.heldOutRanks!==200||
     fold.train.characters!==800||fold.test.characters!==200||
     fold.disjointBySourceRank!==true||
     fold.independentlyReviewed!==false||
     fold.humanDiscriminationTrial!==false||
     fold.excludedFromOptimizer.length!==200||
     fold.sourcePinnedCandidateColors?.length!==40||
     !Array.isArray(fold.test.reviewPairs))
   throw Error("Disjoint source fold or review provenance changed");
  const candidate=new Map();
  for(const c of fold.sourcePinnedCandidateColors){
   const owner=original.get(c.componentId);
   if(!owner||owner.color!==c.sourceHex||
      c.semanticApproval!==false||c.sourceIdentityPreserved!==true||
      !/^#[0-9A-F]{6}$/.test(c.optimizedHex)||candidate.has(c.componentId))
    throw Error("Experimental source identity or color approval mismatch");
   candidate.set(c.componentId,c.optimizedHex);
  }
  if(candidate.size!==40)throw Error("Incomplete fold palette");
  const allowed=new Set();
  for(const rank of fold.excludedFromOptimizer){
   if(!Number.isInteger(rank)||rank<1||rank>1000||
      (rank-1)%5!==i||seenRanks.has(rank))
    throw Error("Held-out rank duplicated or assigned to training");
   allowed.add(rank);seenRanks.add(rank);
  }
  assert.equal(allowed.size,200);
  const counted={introduced:0,resolved:0,retained:0};
  for(const p of fold.test.reviewPairs){
   const character=catalog.characters[p.rank-1];
   if(!character||character.character!==p.character||!allowed.has(p.rank)||
      p.visualReview!=="pending"||p.semanticsApproved!==false||
      p.sourceGeometryChanged!==false||
      !["introduced","resolved","retained"].includes(p.reviewState))
    throw Error("Held-out source pair unverified or promoted");
   const parts=[p.componentA,p.componentB];
   if(parts[0].id===parts[1].id)throw Error("Repeated component is not a distinct pair");
   for(const c of parts){
    const orig=original.get(c.id);
    if(!orig||orig.shape!==c.form||orig.color!==c.sourceHex||
       c.foldOptimizedHex!==(candidate.get(c.id)??orig.color))
     throw Error("Held-out component ownership or candidate hex mismatch");
   }
   const x=distance(parts[0].sourceHex,parts[1].sourceHex),
    y=distance(parts[0].foldOptimizedHex,parts[1].foldOptimizedHex),
    z=distance(parts[0].firstHex,parts[1].firstHex);
   if(Math.abs(x-p.originalDeltaOk)>0.000001||
      Math.abs(y-p.foldOptimizedDeltaOk)>0.000001||
      Math.abs(z-p.firstDeltaOk)>0.000001||
      p.reviewState!==(x>=.07&&y<.07?"introduced":
       x<.07&&y>=.07?"resolved":"retained"))
    throw Error("Source color pair metrics or classification changed");
   states[p.reviewState]++;counted[p.reviewState]++;
   let entry=entries.get(p.rank);
   if(!entry){entry={rank:p.rank,character:p.character,
    foldIndex:i,colors:candidate,pairs:[]};entries.set(p.rank,entry);}
   if(entry.foldIndex!==i)throw Error("Same character in multiple fold palettes");
   entry.pairs.push(p);
  }
  for(const [status,field] of [["introduced","introducedOptimizedClosePairs"],
   ["resolved","resolvedOriginalClosePairs"],["retained","retainedOriginalClosePairs"]])
   if(counted[status]!==fold.test[field])
    throw Error("Fold-level pair counts do not reconcile");
 }
 assert.equal(seenRanks.size,1000);
 assert.deepEqual(states,{introduced:23,resolved:21,retained:5});
 const files=new Map(),rows=[];
 for(const entry of [...entries.values()].sort((a,b)=>a.rank-b.rank)){
  const mapped=glyphMap.get(entry.character);
  if(!mapped||mapped.independently_visually_certified!==false)
   throw Error("Missing or promoted source glyph");
  const filename="U+"+entry.character.codePointAt(0).toString(16)
   .toUpperCase().padStart(4,"0")+".svg";
  assert.equal(mapped.svg,filename);
  const svg=readSVG(filename),paths=[...svg.matchAll(RE)];
  assert.equal(paths.length,mapped.source_path_owner_ids.length);
  let pos=0,changes=0;
  const variant=svg.replace(RE,(whole,d,hex,id)=>{
   const orig=original.get(id);
   if(!orig||orig.color.toUpperCase()!==hex.toUpperCase()||
      mapped.source_path_owner_ids[pos]!==id||
      paths[pos][0]!==whole)
    throw Error("Source path or fill does not match source-owned component");
   pos++;
   const proposed=entry.colors.get(id)??orig.color;
   if(proposed!==hex)changes++;
   return proposed===hex?whole:whole.replace('fill="'+hex+'"','fill="'+proposed+'"');
  });
  if(pos!==paths.length||noFill(svg)!==noFill(variant))
   throw Error("Fold rendering would change geometry or owner markup");
  for(const pair of entry.pairs){
   for(const comp of [pair.componentA,pair.componentB])
    if(!paths.some(path=>path[3]===comp.id))
     throw Error("Warning component is not present in source SVG");
  }
  const ordered=entry.pairs.slice().sort((a,b)=>
   a.foldOptimizedDeltaOk-b.foldOptimizedDeltaOk);
  rows.push({rank:entry.rank,character:entry.character,foldIndex:entry.foldIndex,
   severity:ordered.some(p=>p.reviewState==="introduced")?"introduced":
    ordered.some(p=>p.reviewState==="retained")?"retained":"resolved",
   originalSVG:"glyphs/"+filename,heldoutSVG:DEST+"/"+filename,
   originalSHA256:sha(svg),heldoutSHA256:sha(variant),
   sourceOwnedPaths:paths.length,sourceFillChanges:changes,
   sourceGeometryIdentical:true,sourceOwnersIdentical:true,
   activePaletteUnchanged:true,visualReview:"pending",
   semanticReview:"unapproved",pairs:ordered});
  files.set(filename,variant);
 }
 assert.equal(rows.reduce((n,r)=>n+r.pairs.length,0),49);
 assert.equal(rows.filter(r=>r.severity==="introduced").length,23);
 return {manifest:{schema:"chromalect.glyph.heldout-color-warning-review.v0.1",
  status:"source_pinned_heldout_warning_review_not_visual_or_semantic_certification",
  provenance:{sourcePalette:"mandarin-component-identity@0.6.0",
   foldData:"site/semantic-group-hue-fivefold-heldout-v0.1.json",
   excludedGlyphsUsedForTraining:false,sourceGlyphsOverwritten:false,
   componentOwnerGeometryChanged:false,semanticFamiliesApproved:0,
   humanVisualAssessments:0},
  summary:{catalogGlyphs:1000,folds:5,
   totalWithinGlyphPairs:1020,originalWarnings:26,
   firstGroupWarnings:76,foldOptimizedWarnings:28,
   introducedWarnings:23,resolvedWarnings:21,retainedWarnings:5,
   totalPairReviewObservations:49,
   flaggedGlyphs:rows.length,
   newlyFlaggedGlyphs:23,
   generatedIsolatedSVGs:files.size,
   visuallyCertifiedGlyphs:0,approvedSemanticFamilies:0},
  glyphs:rows},files};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
 const built=deriveHeldoutWarningGallery(
  read("data/catalog/characters-0001-1000.json"),
  read("site/glyphs/mappings.json"),
  read("palettes/mandarin-component-identity-v0.6.json"),
  read("site/semantic-group-hue-fivefold-heldout-v0.1.json"),
  name=>fs.readFileSync("site/glyphs/"+name,"utf8"));
 const dir=path.join("site",DEST),manifest=JSON.stringify(built.manifest,null,2)+"\n";
 if(process.argv.includes("--write")){
  fs.mkdirSync(dir,{recursive:true});
  for(const [file,source] of built.files)fs.writeFileSync(path.join(dir,file),source);
  fs.writeFileSync(path.join(dir,"index-v0.1.json"),manifest);
 }else if(process.argv.includes("--check")){
  assert.equal(fs.readFileSync(path.join(dir,"index-v0.1.json"),"utf8"),manifest);
  assert.deepEqual(fs.readdirSync(dir).sort(),["index-v0.1.json",...built.files.keys()].sort());
  for(const [file,source] of built.files)
   assert.equal(fs.readFileSync(path.join(dir,file),"utf8"),source);
 }else throw Error("Use --write or --check");
 console.log("Source-exact cross-fold warning gallery:",JSON.stringify(built.manifest.summary));
}
