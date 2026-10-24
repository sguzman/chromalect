// Resolve local packet destinations relative to the actual repository, never caller cwd.
// The private coordinator key and reviewer packet are generated outside this source tree.
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

export const REPOSITORY_ROOT=fs.realpathSync(
 path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../.."));
export const SITE_ROOT=path.join(REPOSITORY_ROOT,"site");
export function readPinnedSiteFile(relative){
 assert.ok(typeof relative==="string"&&
  /^glyphs\/[A-Za-z0-9_.+\/-]+\.(?:svg|json)$/.test(relative)&&
  !relative.split("/").includes(".."),"Invalid pinned research file path");
 const resolved=fs.realpathSync(path.join(SITE_ROOT,relative));
 assert.ok(resolved.startsWith(SITE_ROOT+path.sep),
  "Pinned glyph asset must remain inside the generated site");
 // Keep the verified pathname and the bytes tied to one descriptor. A
 // replaced symlink or FIFO must not redirect or block a pinned asset read.
 const fd=fs.openSync(resolved,
  fs.constants.O_RDONLY|fs.constants.O_NOFOLLOW|fs.constants.O_NONBLOCK);
 try{
  const stat=fs.fstatSync(fd);
  const limit=1024*1024;
  assert.ok(stat.isFile()&&stat.size>0&&stat.size<=limit,
   "Pinned glyph asset must be a regular bounded file");
  const buffer=Buffer.allocUnsafe(limit+1);
  let total=0;
  while(total<buffer.length){
   const count=fs.readSync(fd,buffer,total,buffer.length-total,null);
   if(count===0)break;
   total+=count;
  }
  assert.ok(total>0&&total<=limit,
   "Pinned glyph asset exceeded the bounded file limit");
  return new TextDecoder("utf-8",{fatal:true}).decode(
   buffer.subarray(0,total));
 }finally{fs.closeSync(fd);}
}
export function requireOutsideRepository(destination){
 assert.ok(typeof destination==="string"&&path.isAbsolute(destination),
  "An explicit absolute local output path is required");
 const parent=fs.realpathSync(path.dirname(destination));
 assert.ok(parent!==REPOSITORY_ROOT&&!parent.startsWith(REPOSITORY_ROOT+path.sep),
  "Reviewer packet and private coordinator file must remain outside the public repository");
 return path.join(parent,path.basename(destination));
}
