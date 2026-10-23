// Experimental second-stage glyph variants. Source SVG, first experiment SVG
// and this optimized experiment differ ONLY in permitted owned-path fill values.
// No production glyph, palette or semantic validation state is modified.
import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import {pathToFileURL} from "node:url";
const re=/<path d="([^"]+)" fill="(#[0-9A-Fa-f]{6})" data-component="(cmp-\d{4})"\/>/g;
const hash=s=>createHash("sha256").update(s,"utf8").digest("hex");
const outputDir="glyphs/research/hint-optimized-v0.2";
const normalize=s=>s.replace(re,(whole,d,hex,owner)=>
 whole.replace('fill="'+hex+'"','fill="#000000"'));
export function deriveOptimizedGlyphGallery(palette,firstIndex,optimized,
 readOriginal,readFirst,{expectedGlyphCount=1000}={}){
 assert.equal(palette.schema,"chromalect.component-palette.v0");
 assert.equal(palette.id,"mandarin-component-identity");
 assert.equal(palette.version,"0.6.0");
 assert.equal(palette.components.length,520);
 assert.equal(firstIndex.schema,"chromalect.glyph.historical-hint-counterfactual-gallery.v0.1");
 assert.equal(firstIndex.status,
  "build_generated_isolated_research_svg_recolor_only_no_semantic_or_visual_approval");
 assert.equal(firstIndex.summary.catalogGlyphs,expectedGlyphCount);
 assert.equal(firstIndex.summary.hypotheticalComponentIds,40);
 assert.equal(firstIndex.summary.affectedGlyphs,firstIndex.glyphs.length);
 assert.equal(firstIndex.provenance.activeGlyphFilesOverwritten,false);
 assert.equal(firstIndex.provenance.strokePathsChanged,false);
 assert.equal(firstIndex.provenance.ownerMappingsChanged,false);
 assert.equal(firstIndex.provenance.independentlyApprovedVisuals,0);
 assert.equal(firstIndex.provenance.semanticFamilyApprovals,0);
 assert.equal(optimized.schema,"chromalect.palette.source-cooccurrence-hue-optimizer.v0.2");
 assert.equal(optimized.status,
  "in_sample_40_component_optimization_research_only_no_semantic_or_visual_approval");
 assert.equal(optimized.provenance.researchOnly,true);
 assert.equal(optimized.provenance.activeSourcePaletteMutated,false);
 assert.equal(optimized.provenance.heldOutGlyphsEvaluated,0);
 assert.equal(optimized.provenance.semanticMembershipsApproved,0);
 assert.equal(optimized.summary.alteredHypotheticalIDs,40);
 const paletteById=new Map(palette.components.map(c=>[c.id,c]));
 const candidates=new Map(optimized.groups.flatMap(g=>g.members.map(c=>[c.componentId,c])));
 assert.equal(paletteById.size,520);
 assert.equal(candidates.size,40);
 for(const [id,c] of candidates){
  const source=paletteById.get(id);
  if(!source||source.color!==c.sourceHex||source.shape!==c.form||
     c.groupMembershipApproval!=="unverified_historical_mnemonic_hint"||
     c.visuallyDiscriminable!=="unverified"||
     c.semanticFamilyVerified!==false||
     !/^#[0-9A-F]{6}$/.test(c.firstTrialHex)||
     !/^#[0-9A-F]{6}$/.test(c.optimizedTrialHex))
   throw Error("Invalid candidate source provenance or claimed color approval");
 }
 const rows=[],files=new Map(),seen=new Set();
 let changedImages=0,changedFills=0,retainedFirstFills=0,otherFills=0,lastRank=0;
 for(const row of firstIndex.glyphs){
  if(!Number.isInteger(row.rank)||row.rank<=lastRank||
     row.rank>expectedGlyphCount||seen.has(row.character)||
     !/^glyphs\/U\+[0-9A-F]{4,6}\.svg$/.test(row.originalSVG)||
     row.hypotheticalSVG!==
      "glyphs/research/hint-counterfactual-v0.1/"+row.originalSVG.slice(7)||
     row.sourcePathsIdentical!==true||
     row.componentOwnerSequenceIdentical!==true||
     row.activePaletteUntouched!==true||
     row.independentGlyphValidation!=="pending")
   throw Error("Original experiment glyph index changed or claimed approval");
  lastRank=row.rank;seen.add(row.character);
  const filename=row.originalSVG.slice("glyphs/".length);
  const original=readOriginal(filename),first=readFirst(filename);
  if(typeof original!=="string"||typeof first!=="string"||
     hash(original)!==row.sourceGeometrySHA256||
     hash(first)!==row.candidateGeometrySHA256||
     normalize(original)!==normalize(first))
   throw Error("Original and first candidate SVGs are not source-identical");
  const oPaths=[...original.matchAll(re)],fPaths=[...first.matchAll(re)];
  if(!oPaths.length||oPaths.length!==fPaths.length||
     row.modifiedSourcePathFills+row.unchangedSourcePathFills!==oPaths.length)
   throw Error("Mismatch in source/first stage path ownership");
  let observedFirstFills=0,observedModified=0,unchanged=0,position=0;
  const next=first.replace(re,(whole,d,hex,owner)=>{
   const orig=oPaths[position++],originalOwner=orig[3],
    src=paletteById.get(owner),candidate=candidates.get(owner);
   if(owner!==originalOwner||d!==orig[1]||!src||
      orig[2].toUpperCase()!==src.color.toUpperCase()||
      hex.toUpperCase()!==(candidate?.firstTrialHex??src.color).toUpperCase())
    throw Error("First candidate path does not match source palette/owner");
   const proposed=candidate?.optimizedTrialHex??hex;
   if(candidate)observedFirstFills++;
   if(proposed!==hex)observedModified++;
   else if(candidate)retainedFirstFills++;
   else unchanged++;
   return proposed===hex?whole:whole.replace('fill="'+hex+'"','fill="'+proposed+'"');
  });
  if(position!==oPaths.length||
     observedFirstFills!==row.modifiedSourcePathFills||
     normalize(next)!==normalize(original)||
     [...next.matchAll(re)].length!==oPaths.length)
   throw Error("Optimized glyph variant touched non-fill source geometry");
  if(observedModified)changedImages++;
  changedFills+=observedModified;otherFills+=unchanged;
  const changedOwners=[...new Set(fPaths
   .filter(x=>candidates.has(x[3])&&
    candidates.get(x[3]).optimizedTrialHex!==candidates.get(x[3]).firstTrialHex)
   .map(x=>x[3]))].sort();
  const out={rank:row.rank,character:row.character,
   sourceSVG:row.originalSVG,firstTrialSVG:row.hypotheticalSVG,
   optimizedSVG:outputDir+"/"+filename,
   sourceSHA256:row.sourceGeometrySHA256,
   firstTrialSHA256:row.candidateGeometrySHA256,
   optimizedSHA256:hash(next),
   sourcePaths:oPaths.length,
   changedFillPathsFromFirst:observedModified,
   changedComponentIdsFromFirst:changedOwners,
   sourceGeometryExactlyPreserved:true,sourceOwnersExactlyPreserved:true,
   activeProductionFilesUnchanged:true,visualReview:"pending",semanticReview:"unapproved"};
  rows.push(out);files.set(filename,next);
 }
 assert.equal(rows.length,firstIndex.summary.affectedGlyphs);
 assert.equal(changedFills+retainedFirstFills,
  firstIndex.summary.alteredSourcePathFills);
 assert.equal(otherFills,firstIndex.summary.unchangedSourcePathFillsInAffectedGlyphs);
 assert.ok(changedImages>=1&&changedFills>=1);
 return {manifest:{
  schema:"chromalect.glyph.historical-hint-optimized-gallery.v0.2",
  status:"isolated_optimized_research_svg_no_visual_semantic_or_educational_approval",
  provenance:{sourcePalette:"mandarin-component-identity@0.6.0",
   originalGlyphs:"site/glyphs/",
   originalCandidate:"site/glyphs/research/hint-counterfactual-v0.1/",
   optimizedCandidate:"site/mnemonic-group-risk-optimized-v0.2.json",
   sourceSVGOverwritten:false,firstTrialSVGOverwritten:false,
   sourceGeometryModified:false,sourceOwnershipModified:false,
   palettePromoted:false,independentVisualCertifications:0,
   independentSemanticApprovals:0,learningTrials:0},
  summary:{sourceCatalogGlyphs:expectedGlyphCount,
   firstTrialAffectedGlyphs:firstIndex.summary.affectedGlyphs,
   optimizedGalleryGlyphs:files.size,
   optimizedImagesDifferentFromFirst:changedImages,
   unchangedImagesFromFirst:files.size-changedImages,
   fillsChangedFromFirst:changedFills,
   firstStageHypotheticalFillsRetained:retainedFirstFills,
   sourceUnhintedFillsPreserved:otherFills,
   candidateComponentIdentities:40,
   independentVisualTests:0,semanticFamiliesApproved:0},
  glyphs:rows
 },files};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const get=p=>JSON.parse(fs.readFileSync(p,"utf8"));
 const gallery=deriveOptimizedGlyphGallery(
  get("palettes/mandarin-component-identity-v0.6.json"),
  get("site/glyphs/research/hint-counterfactual-v0.1/index-v0.1.json"),
  get("site/mnemonic-group-risk-optimized-v0.2.json"),
  f=>fs.readFileSync("site/glyphs/"+f,"utf8"),
  f=>fs.readFileSync("site/glyphs/research/hint-counterfactual-v0.1/"+f,"utf8"));
 const dir=path.join("site",outputDir);
 const content=JSON.stringify(gallery.manifest,null,2)+"\n";
 if(process.argv.includes("--write")){
  fs.mkdirSync(dir,{recursive:true});
  for(const [name,bytes] of gallery.files)
   fs.writeFileSync(path.join(dir,name),bytes,"utf8");
  fs.writeFileSync(path.join(dir,"index-v0.2.json"),content);
 }else if(process.argv.includes("--check")){
  assert.equal(fs.readFileSync(path.join(dir,"index-v0.2.json"),"utf8"),content);
  assert.deepEqual(fs.readdirSync(dir).sort(),[
   "index-v0.2.json",...gallery.files.keys()].sort());
  for(const [name,bytes] of gallery.files)
   assert.equal(fs.readFileSync(path.join(dir,name),"utf8"),bytes);
 }else throw Error("Use --write or --check");
 console.log("Source-exact second experimental SVG gallery:",JSON.stringify(gallery.manifest.summary));
}
