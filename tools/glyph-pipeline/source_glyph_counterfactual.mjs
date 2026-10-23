// Research-only alternative SVGs are generated OUTSIDE the production SVG
// directory. Every source path, transform, owner and non-pilot color is
// byte-identical; only source-pinned 40-hint candidate fills can differ.
import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import {pathToFileURL} from "node:url";
import {derivePilotGroupCounterfactual} from "./pilot_group_counterfactual.mjs";
const sha=x=>createHash("sha256").update(x,"utf8").digest("hex");
const pathPattern=/<path d="([^"]+)" fill="(#[0-9A-Fa-f]{6})" data-component="(cmp-\d{4})"\/>/g;
const svgName=ch=>"U+"+ch.codePointAt(0).toString(16).toUpperCase().padStart(4,"0")+".svg";
const relativeDir="glyphs/research/hint-counterfactual-v0.1";
export function deriveSourceGlyphCounterfactual(
 catalog,manifest,palette,readSource,{expectedGlyphCount=1000}={}
){
 assert.equal(catalog.schema,"chromalect.character-tranche.v1");
 assert.equal(catalog.characters.length,expectedGlyphCount);
 assert.equal(manifest.schema,"chromalect.component-stroke-mappings.v1");
 assert.equal(manifest.palette_ref,"mandarin-component-identity@0.6.0");
 assert.equal(manifest.glyph_count,expectedGlyphCount);
 assert.equal(manifest.glyphs.length,expectedGlyphCount);
 const proposal=derivePilotGroupCounterfactual(palette);
 const hypothetical=new Map(proposal.groups.flatMap(g=>
  g.members.map(m=>[m.componentId,m])));
 assert.equal(hypothetical.size,40);
 const sourceColors=new Map(palette.components.map(x=>[x.id,x]));
 const glyphs=new Map(manifest.glyphs.map(g=>[g.character,g]));
 assert.equal(glyphs.size,expectedGlyphCount);
 let affectedGlyphs=0,affectedStrokes=0,unchangedStrokes=0;
 const rows=[],outputFiles=new Map(),seen=new Set();
 for(let i=0;i<catalog.characters.length;i++){
  const source=catalog.characters[i],glyph=glyphs.get(source.character);
  if(!glyph||seen.has(source.character)||source.rank!==i+1)
   throw Error("Missing, duplicate or reordered catalog-to-glyph identity");
  seen.add(source.character);
  assert.equal(glyph.svg,svgName(source.character));
  assert.equal(glyph.unicode_codepoint,glyph.svg.slice(0,-4));
  assert.equal(glyph.independently_visually_certified,false);
  assert.ok(Array.isArray(glyph.components)&&glyph.components.length>0);
  assert.ok(Array.isArray(glyph.source_path_owner_ids)&&
   glyph.source_path_owner_ids.length>0);
  const parts=new Map();
  for(const component of glyph.components){
   const original=sourceColors.get(component.component_id);
   if(!original||component.hex.toUpperCase()!==original.color.toUpperCase()||
      component.form!==original.shape||parts.has(component.component_id))
    throw Error("Glyph component differs from original identity palette");
   parts.set(component.component_id,component);
  }
  const original=readSource(glyph.svg);
  assert.equal(typeof original,"string");
  const sourceMatches=[...original.matchAll(pathPattern)];
  if(sourceMatches.length!==glyph.source_path_owner_ids.length)
   throw Error("SVG path count mismatches source ownership manifest");
  let switched=0,untouched=0;
  const output=original.replace(pathPattern,(whole,d,hex,owner,index)=>{
   // Replacement callback's offset is not the source stroke index.
   const prior=sourceMatches[switched+untouched];
   assert.equal(prior[0],whole);
   assert.equal(owner,glyph.source_path_owner_ids[switched+untouched]);
   const component=parts.get(owner),canonical=sourceColors.get(owner);
   if(!component||!canonical||hex.toUpperCase()!==canonical.color.toUpperCase())
    throw Error("SVG owner, source fill or immutable component color mismatch");
   const alternative=hypothetical.get(owner);
   if(!alternative){untouched++;return whole;}
   if(alternative.sourceHex.toUpperCase()!==hex.toUpperCase()||
      alternative.form!==canonical.shape)
    throw Error("Unattributed or identity-divergent experimental recoloring");
   switched++;
   return whole.replace('fill="'+hex+'"','fill="'+alternative.candidateHex+'"');
  });
  if(switched+untouched!==sourceMatches.length||
     [...output.matchAll(pathPattern)].length!==sourceMatches.length)
   throw Error("Unexpected SVG structure after isolated recoloring");
  if(switched===0){
   assert.equal(output,original);
   unchangedStrokes+=untouched;
   continue;
  }
  // Canonicalize ONLY the source-path fill attribute. All geometry and XML
  // around it must compare exactly, not merely render similarly.
  const normalized=src=>src.replace(pathPattern,
   (whole,d,hex,owner)=>whole.replace('fill="'+hex+'"','fill="#000000"'));
  if(normalized(output)!==normalized(original)||output===original)
   throw Error("Experimental SVG changed geometry, owners or unrelated markup");
  affectedGlyphs++;affectedStrokes+=switched;unchangedStrokes+=untouched;
  const changedIds=[...new Set(sourceMatches
   .map(x=>x[3]).filter(id=>hypothetical.has(id)))].sort();
  const record={rank:source.rank,character:source.character,
   originalSVG:"glyphs/"+glyph.svg,
   hypotheticalSVG:relativeDir+"/"+glyph.svg,
   sourceGeometrySHA256:sha(original),
   candidateGeometrySHA256:sha(output),
   modifiedSourcePathFills:switched,unchangedSourcePathFills:untouched,
   changedComponentIds:changedIds,
   sourcePathsIdentical:true,componentOwnerSequenceIdentical:true,
   activePaletteUntouched:true,independentGlyphValidation:"pending"};
  rows.push(record);outputFiles.set(glyph.svg,output);
 }
 if(affectedGlyphs<1||rows.length!==outputFiles.size||
    rows.reduce((n,x)=>n+x.modifiedSourcePathFills,0)!==affectedStrokes)
  throw Error("No independently inspectable counterfactual glyph cohort");
 return {manifest:{
  schema:"chromalect.glyph.historical-hint-counterfactual-gallery.v0.1",
  status:"build_generated_isolated_research_svg_recolor_only_no_semantic_or_visual_approval",
  provenance:{palette:"mandarin-component-identity@0.6.0",
   proposalSchema:proposal.schema,
   originalMappings:"site/glyphs/mappings.json",
   catalog:"data/catalog/characters-0001-1000.json",
   activeGlyphFilesOverwritten:false,strokePathsChanged:false,
   ownerMappingsChanged:false,other480ComponentsRecolored:false,
   independentlyApprovedVisuals:0,semanticFamilyApprovals:0},
  summary:{catalogGlyphs:expectedGlyphCount,affectedGlyphs,
   untouchedGlyphs:expectedGlyphCount-affectedGlyphs,
   alteredSourcePathFills:affectedStrokes,
   unchangedSourcePathFills:unchangedStrokes,
   hypotheticalComponentIds:40,
   humanComprehensionTrials:0,independentVisualAudits:0},
  glyphs:rows
 },outputFiles};
}
function main(){
 const root="site",destination=path.join(root,relativeDir);
 const catalog=JSON.parse(fs.readFileSync("data/catalog/characters-0001-1000.json","utf8"));
 const mapping=JSON.parse(fs.readFileSync(path.join(root,"glyphs/mappings.json"),"utf8"));
 const palette=JSON.parse(fs.readFileSync("palettes/mandarin-component-identity-v0.6.json","utf8"));
 const {manifest,outputFiles}=deriveSourceGlyphCounterfactual(
  catalog,mapping,palette,name=>fs.readFileSync(path.join(root,"glyphs",name),"utf8"));
 const encoded=JSON.stringify(manifest,null,2)+"\n";
 if(process.argv.includes("--write")){
  fs.mkdirSync(destination,{recursive:true});
  for(const [name,contents] of outputFiles)
   fs.writeFileSync(path.join(destination,name),contents,"utf8");
  fs.writeFileSync(path.join(destination,"index-v0.1.json"),encoded,"utf8");
 }else if(process.argv.includes("--check")){
  assert.equal(fs.readFileSync(path.join(destination,"index-v0.1.json"),"utf8"),encoded);
  const expected=["index-v0.1.json",...outputFiles.keys()].sort();
  assert.deepEqual(fs.readdirSync(destination).sort(),expected);
  for(const [name,contents] of outputFiles)
   assert.equal(fs.readFileSync(path.join(destination,name),"utf8"),contents);
 }else throw Error("Use --write or --check");
 console.log("Isolated research SVGs; original active glyphs preserved:",JSON.stringify(manifest.summary));
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)main();
