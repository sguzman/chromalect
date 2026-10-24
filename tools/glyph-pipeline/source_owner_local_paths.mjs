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
 return fs.readFileSync(path.join(SITE_ROOT,relative),"utf8");
}
export function requireOutsideRepository(destination){
 assert.ok(typeof destination==="string"&&path.isAbsolute(destination),
  "An explicit absolute local output path is required");
 const parent=fs.realpathSync(path.dirname(destination));
 assert.ok(parent!==REPOSITORY_ROOT&&!parent.startsWith(REPOSITORY_ROOT+path.sep),
  "Reviewer packet and private coordinator file must remain outside the public repository");
 return path.join(parent,path.basename(destination));
}
