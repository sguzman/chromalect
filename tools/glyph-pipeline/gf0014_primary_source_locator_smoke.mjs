// Primary-source GF 0014 numeric ordinal/group cross-check, NOT geometry certification.
// The 30 expected group values were visually read from IRG N2739 PDF tables.
import assert from "node:assert/strict";
import fs from "node:fs";
import {pathToFileURL} from "node:url";
const expectedGroups=new Map(Object.entries({"4":4,"10":9,"20":18,"31":28,"35":30,"36":31,"71":60,"74":62,"87":74,"101":86,"119":103,"151":132,"156":136,"160":138,"219":189,"234":203,"251":220,"257":225,"262":228,"280":244,"304":262,"308":266,"344":297,"346":299,"352":302,"388":338,"393":342,"423":367,"432":373,"493":423}).map(([k,v])=>[Number(k),v]));
const pages=[[1,36,10],[37,73,11],[74,110,12],[111,147,13],[148,184,14],[185,221,15],[222,258,16],[259,295,17],[296,332,18],[333,369,19],[370,406,20],[407,443,21],[444,480,22],[481,514,23]];
const filename="data/research/gf0014-official-descriptive-row-locations-v0.1.json";
export function verify(data,report){
 assert.equal(data.schema,"chromalect.GF0014-reference.v0");
 assert.equal(data.standard,"GF 0014-2009");
 assert.equal(data.counts.rows,514);
 assert.equal(data.counts.groups,441);
 assert.equal(data.counts.non_glyph_description_rows,30);
 assert.equal(data.status,"third-party transcription; not authoritative verified source");
 assert.equal(report.schema,"chromalect.gf0014.authoritative-descriptive-row-location.v0.1");
 assert.equal(report.status,"source_table_numeric_row_group_crosscheck_complete_drawn_forms_and_geometry_pending");
 assert.equal(report.thirdPartyCatalog.upstreamTranscriptBlobSHA,data.provenance.transcription_blob_sha);
 assert.equal(report.authority.originalStandardReproductionURI,
  "https://www.unicode.org/irg/docs/n2739-GF0014-2009.pdf");
 assert.equal(report.authority.originalStandardRedistributed,false);
 assert.deepEqual(report.pageSpans,pages.map(([a,b,p])=>({
  firstOrdinal:a,lastOrdinal:b,pdfPageOneBased:p,printedStandardPage:p-3})));
 for(let k=0;k<pages.length;k++){
  const [a,b,p]=pages[k];
  assert.equal(p,k+10);
  if(k)assert.equal(a,pages[k-1][1]+1);
  assert.ok(b>=a);
 }
 assert.equal(pages[0][0],1);
 assert.equal(pages.at(-1)[1],514);
 const original=data.entries.filter(x=>x.form_type==="descriptive_nonfont_expression");
 assert.equal(original.length,30);
 assert.equal(report.records.length,30);
 assert.equal(expectedGroups.size,30);
 const byOrdinal=new Map(data.entries.map(x=>[x.source_ordinal,x]));
 assert.equal(byOrdinal.size,514);
 for(let n=1;n<=514;n++)assert.ok(byOrdinal.has(n),"Missing official table ordinal "+n);
 const ids=new Set();
 for(const r of report.records){
  const originalRecord=byOrdinal.get(r.sourceOrdinal);
  assert.ok(originalRecord);
  assert.equal(originalRecord.form_type,"descriptive_nonfont_expression");
  assert.equal(r.sourceGroup,expectedGroups.get(r.sourceOrdinal));
  assert.equal(r.sourceGroup,originalRecord.source_group);
  assert.equal(r.catalogComponentId,originalRecord.component_id);
  assert.equal(r.transcribedDescription,originalRecord.form);
  const sourcePage=pages.find(([lo,hi])=>lo<=r.sourceOrdinal&&r.sourceOrdinal<=hi);
  assert.ok(sourcePage);
  assert.equal(r.pdfPageOneBased,sourcePage[2]);
  assert.equal(r.printedStandardPage,sourcePage[2]-3);
  assert.equal(r.ordinalAndGroupMatchedAgainstPDFTable,true);
  assert.equal(r.illustrativeDrawnFormAdjudicated,false);
  assert.equal(r.independentlyApprovedGlyphGeometry,false);
  assert.ok(!ids.has(r.sourceOrdinal));
  ids.add(r.sourceOrdinal);
 }
 assert.deepEqual([...ids].sort((a,b)=>a-b),
  original.map(r=>r.source_ordinal).sort((a,b)=>a-b));
 assert.deepEqual(report.summary,{
  catalogRows:514,publishedComponentGroups:441,
  printedTableStartOrdinal:1,printedTableEndOrdinal:514,
  descriptiveRowsLocatedInAuthoritativeTable:30,
  matchingOrdinalAndGroupColumns:30,
  transcribedDescriptiveTextEquivalenceCertified:0,
  independentlyApprovedDrawnForms:0,
  redistributableGlyphGeometryRecovered:0,
  complete514RowTranscriptionApproved:false});
 return true;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const source=JSON.parse(fs.readFileSync("palettes/gf0014-2009-records-v0.4.json","utf8"));
 const report=JSON.parse(fs.readFileSync(filename,"utf8"));
 verify(source,report);
 console.log("GF0014 N2739: all 30 nonfont rows matched to primary-standard page/ordinal/group; no illustrative form or geometry approvals.");
}
