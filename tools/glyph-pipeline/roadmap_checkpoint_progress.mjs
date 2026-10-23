// Derive bounded checklist progress directly from the public research roadmap.
import fs from "node:fs";
import assert from "node:assert/strict";
import {pathToFileURL} from "node:url";
const phases=[
 ["research-foundation","Phase 0","Research foundation"],
 ["palette-experiment","Phase 1","Component palette experiment"],
 ["phonetic-notation","Phase 2","Phonetic notation experiment"],
 ["mandarin-semantics","Active Mandarin semantic verification","Mandarin semantic verification"],
 ["contextual-fusion","Phase 3","Fusion and contextual experiments"]
];
export function deriveRoadmapProgress(markdown){
 const parts=phases.map(([key,prefix,label])=>({key,prefix,label,checkpoints:[]}));
 let current=null;
 for(const line of markdown.split("\n")){
  if(line.startsWith("## "))current=parts.find(x=>line.slice(3).startsWith(x.prefix))??null;
  const m=line.match(/^- \[([x ])\] (.+)$/);
  if(m&&current)current.checkpoints.push({description:m[2],state:m[1]==="x"?"complete":"pending"});
 }
 for(const p of parts)assert.ok(p.checkpoints.length>0,"Missing roadmap checkpoint section: "+p.prefix);
 return {schema:"chromalect.project.roadmap-checkpoints.v0.1",
  status:"document_checklist_completion_not_scientific_validation_or_overall_project_percentage",
  source:{document:"docs/roadmap.md",method:"direct_checked_markdown_items",
   deferredSections:["Phase 4 — software decision","Future language profiles"],
   independentValidationNotImplied:true},
  phases:parts.map(p=>({key:p.key,label:p.label,sourceHeadingPrefix:p.prefix,
   complete:p.checkpoints.filter(r=>r.state==="complete").length,
   pending:p.checkpoints.filter(r=>r.state==="pending").length,
   total:p.checkpoints.length,
   checklistPercent:Math.round(100*p.checkpoints.filter(r=>r.state==="complete").length/p.checkpoints.length),
   checkpoints:p.checkpoints}))};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const expected=JSON.stringify(deriveRoadmapProgress(fs.readFileSync("docs/roadmap.md","utf8")),null,2)+"\n";
 const path="data/progress/roadmap-checkpoints-v0.1.json";
 if(process.argv.includes("--check")){
  assert.equal(fs.readFileSync(path,"utf8"),expected,"Roadmap checklist index is out of sync");
  console.log("Roadmap derived checkpoint counts match published source.");
 }else if(process.argv.includes("--write"))fs.writeFileSync(path,expected);
 else throw Error("Use --check or --write");
}