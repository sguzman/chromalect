#!/usr/bin/env python3
"""Strict first-1000 Mandarin source reconciliation against AnimCJK ZhHans.

Only decompositions that exhaust the original palette-selected component
instances and source stroke positions are admitted. Chinese AnimCJK outline
paths are evidence for geometry correspondence, not substitute rendered art.
No multi-owner strokes, missing components, approximate aliases, or unverified
region-variant substitutions are permitted.
"""
import argparse
from collections import Counter
from concurrent.futures import ThreadPoolExecutor, as_completed
import json
from pathlib import Path
import re
from urllib.error import HTTPError, URLError
from urllib.request import urlopen
import xml.etree.ElementTree as ET

from hanzivg_recovery import correspondence, reordered_correspondence, local

REV = "3e1253b341cc7be14c3540bb3c045e6163557777"
BASE = f"https://raw.githubusercontent.com/parsimonhi/animCJK/{REV}/svgsZhHans/"
OPS = {"⿰": 2, "⿱": 2, "⿴": 2, "⿵": 2, "⿶": 2, "⿷": 2,
       "⿸": 2, "⿹": 2, "⿺": 2, "⿻": 2, "⿲": 3, "⿳": 3}

class Reject(ValueError):
    pass

class Parser:
    def __init__(self, source):
        self.source = source
        self.i = 0

    def term(self, depth=0):
        if depth > 12 or self.i >= len(self.source):
            raise Reject("truncated_or_deep_source")
        name = None
        marker = ""
        ch = self.source[self.i]
        if ch not in OPS:
            if ch in ".:~" or ch.isdigit() or ord(ch) < 128:
                raise Reject("invalid_component_token")
            name = ch
            self.i += 1
            if self.i < len(self.source) and self.source[self.i] == "~":
                raise Reject("ambiguous_similar_components")
            if self.i < len(self.source) and self.source[self.i] == ".":
                self.i += 1
            if self.i < len(self.source) and self.source[self.i] == ":":
                marker = "split"
                self.i += 1
                if self.i < len(self.source) and self.source[self.i] in "abcdefghijklmnopqrstuvwxyz":
                    self.i += 1
        if self.i < len(self.source) and self.source[self.i] in OPS:
            op = self.source[self.i]
            self.i += 1
            children = [self.term(depth + 1) for _ in range(OPS[op])]
            return {"form": name, "children": children, "count": sum(n["count"] for n in children),
                    "split": marker == "split"}
        start = self.i
        while self.i < len(self.source) and self.source[self.i].isdigit():
            self.i += 1
        if start == self.i or name is None:
            raise Reject("missing_component_stroke_count")
        count = int(self.source[start:self.i])
        if not 1 <= count <= 32:
            raise Reject("invalid_stroke_count")
        return {"form": name, "children": [], "count": count, "split": marker == "split"}

def parse_acjk(source, character):
    if not isinstance(source, str) or len(source) < 3 or source[0] != character:
        raise Reject("missing_or_wrong_acjk_root")
    parser = Parser(source[1:])
    node = parser.term()
    if parser.i != len(parser.source):
        raise Reject("unparsed_acjk_tail")
    return node

def count_ownership(node, instances):
    wanted = Counter(row["form"] for row in instances)
    if len(instances) < 2 or any(not isinstance(form, str) or not form for form in wanted):
        raise Reject("catalog_not_compositional")
    used = Counter()
    segments = []
    def visit(part):
        form = part["form"]
        if form in wanted:
            if part["count"] < 1:
                raise Reject("empty_owner")
            used[(form, part["split"])] += 1
            segments.extend([form] * part["count"])
        elif part["children"]:
            for child in part["children"]:
                visit(child)
        else:
            raise Reject("component_name_disagreement")
    visit(node)
    # A single split component may have multiple separated runs, but all
    # runs must be explicitly split and must correspond to only one instance.
    found = Counter()
    for form in wanted:
        ordinary = used[(form, False)]
        split = used[(form, True)]
        if ordinary and split:
            raise Reject("mixed_component_fragments")
        found[form] = ordinary + (1 if split else 0)
    if found != wanted:
        raise Reject("component_instance_disagreement")
    if len(segments) != node["count"]:
        raise Reject("source_strokes_not_fully_owned")
    return segments

def fetch_svg(character):
    url = BASE + f"{ord(character)}.svg"
    for attempt in range(2):
        try:
            with urlopen(url, timeout=12) as response:
                raw = response.read(200000)
            if len(raw) >= 200000:
                return character, None, "oversized_chinese_svg"
            return character, raw.decode("utf-8"), None
        except HTTPError as e:
            if e.code == 404:
                return character, None, "missing_chinese_svg"
            if e.code not in (429, 500, 502, 503, 504):
                return character, None, "source_http_error"
        except (URLError, OSError, UnicodeDecodeError):
            pass
    return character, None, "source_unavailable"

def extract_strokes(svg, character):
    root = ET.fromstring(svg)
    expected = f"z{ord(character)}d"
    strokes = {}
    for item in root.iter():
        if local(item.tag) != "path":
            continue
        key = item.get("id", "")
        if key.startswith(expected) and key[len(expected):].isdigit():
            rank = int(key[len(expected):])
            if rank in strokes or not item.get("d"):
                raise Reject("duplicate_or_empty_svg_path")
            strokes[rank] = item.get("d")
    if not strokes or sorted(strokes) != list(range(1, len(strokes) + 1)):
        raise Reject("missing_or_disordered_svg_paths")
    return [strokes[i] for i in range(1, len(strokes) + 1)]

def candidate(ch, node, owners, svg, graphics, palette, catalog):
    source_paths = extract_strokes(svg, ch)
    refs = graphics.get(ch)
    if not refs or len(refs) != len(source_paths) or len(owners) != len(refs):
        raise Reject("chinese_stroke_count_disagreement")
    error = correspondence(source_paths, refs)
    method = "same_stroke_index_geometry"
    if error is None:
        alternate = reordered_correspondence(source_paths, refs, owners)
        if alternate is None:
            raise Reject("chinese_stroke_geometry_disagreement")
        error, owners = alternate
        method = "unique_stroke_geometry_bijection"
    if error > 0.075:
        raise Reject("weak_chinese_shape_correspondence")
    selected = catalog[ch]
    instances = selected["component_instances"]
    by_form = {}
    parts = []
    for item in instances:
        form, cid = item["form"], item["id"]
        token = palette.get(cid)
        if not token or token["shape"] != form or cid not in selected["component_ids"]:
            raise Reject("selected_palette_mismatch")
        if form in by_form and by_form[form] != cid:
            raise Reject("ambiguous_palette_identity")
        by_form[form] = cid
        parts.append({"form": form, "component_id": cid, "color": token["color"]})
    if set(owners) != set(by_form):
        raise Reject("unowned_catalog_component")
    strokes = [{"path": path, "component_id": by_form[form],
                "color": palette[by_form[form]]["color"]}
               for form, path in zip(owners, refs)]
    decomposition = selected["ids_primary"].split(";")[0].split("(")[0].strip()
    return {"character": ch, "decomposition": decomposition, "parts": parts,
            "strokes": strokes, "mean_geometry_error": error,
            "stroke_count": len(strokes),
            "ownership_svg": f"svgsZhHans/{ord(ch)}.svg",
            "ownership_provider": "animcjk_zhhans",
            "ownership_revision": REV,
            "ownership_method": "explicit_animcjk_component_stroke_counts",
            "geometry_match_method": method,
            "source_decomposition": node.get("form") or ch}

def self_test():
    cases = [
        ("左", "左⿱𠂇2工.3", ["𠂇", "工"], ["𠂇"] * 2 + ["工"] * 3),
        ("友", "友⿱𠂇2又.2", ["𠂇", "又"], ["𠂇"] * 2 + ["又"] * 2),
        ("右", "右⿱𠂇2口.3", ["𠂇", "口"], ["𠂇"] * 2 + ["口"] * 3),
    ]
    for ch, source, forms, expected in cases:
        node = parse_acjk(source, ch)
        assert count_ownership(node, [{"form": f} for f in forms]) == expected
    # The ACJK split notation may contain non-tree sharing. It must never
    # be silently decoded as a conventional IDS tree.
    try:
        parse_acjk("那⿰⿻刀:1二2刀:1阝.2", "那")
        raise AssertionError("Ambiguous shared-stroke structure was accepted")
    except Reject:
        pass
    try:
        count_ownership(parse_acjk("以⿲𠄌1丶1人.2", "以"),
                        [{"form": "丶"}, {"form": "人"}])
        raise AssertionError("Unregistered component should be rejected")
    except Reject:
        pass
    print("AnimCJK ZhHans parser and single-owner tests passed")

def main():
    p = argparse.ArgumentParser()
    p.add_argument("--dictionary")
    p.add_argument("--coverage")
    p.add_argument("--catalog")
    p.add_argument("--palette")
    p.add_argument("--graphics")
    p.add_argument("--candidates")
    p.add_argument("--self-test", action="store_true")
    args = p.parse_args()
    if args.self_test:
        self_test()
        return
    rows = {}
    with open(args.dictionary, encoding="utf-8-sig") as file:
        for line in file:
            row = json.loads(line)
            ch = row.get("character")
            if ch:
                if ch in rows:
                    raise ValueError(f"duplicate AnimCJK dictionary entry {ch}")
                rows[ch] = row
    catalog = {row["character"]: row for row in
               json.loads(Path(args.catalog).read_text())["characters"]}
    palette = {row["id"]: row for row in
               json.loads(Path(args.palette).read_text())["components"]}
    missing = [row["character"] for row in
               json.loads(Path(args.coverage).read_text())["unmapped"]]
    base = json.loads(Path(args.candidates).read_text())
    if base.get("schema") != "chromalect.hanzivg-source-transfer.v1":
        raise ValueError("unexpected source candidate schema")
    existing = {r["character"] for r in base["candidates"]}
    graphics = {}
    with open(args.graphics, encoding="utf-8") as file:
        for line in file:
            entry = json.loads(line)
            if entry.get("character") in missing:
                graphics[entry["character"]] = entry.get("strokes")
    eligible = {}
    rejected = Counter()
    rejected_ch = {}
    for ch in missing:
        if ch in existing:
            continue
        try:
            node = parse_acjk(rows[ch]["acjk"], ch)
            owners = count_ownership(node, catalog[ch]["component_instances"])
            if len(owners) != len(graphics.get(ch, [])):
                raise Reject("source_stroke_count_disagreement")
            eligible[ch] = (node, owners)
        except (KeyError, TypeError, Reject) as e:
            reason = str(e) or "missing_source_data"
            rejected[reason] += 1
            rejected_ch[ch] = reason
    outcomes = {}
    with ThreadPoolExecutor(max_workers=10) as pool:
        jobs = {pool.submit(fetch_svg, ch): ch for ch in eligible}
        for future in as_completed(jobs):
            ch, xml, reason = future.result()
            outcomes[ch] = (xml, reason)
    recovered = []
    for ch, (node, owners) in sorted(eligible.items()):
        xml, reason = outcomes[ch]
        if reason:
            rejected[reason] += 1
            rejected_ch[ch] = reason
            continue
        try:
            row = candidate(ch, node, owners, xml, graphics, palette, catalog)
            recovered.append(row)
        except (ET.ParseError, Reject, ValueError) as e:
            reason = str(e) or "invalid_chinese_svg"
            rejected[reason] += 1
            rejected_ch[ch] = reason
    base["candidates"].extend(recovered)
    base["accepted_count"] = len(base["candidates"])
    base["animcjk_revision"] = REV
    base["animcjk_admitted_count"] = len(recovered)
    base["animcjk_rejected_reasons"] = dict(sorted(rejected.items()))
    base["animcjk_rejected_characters"] = rejected_ch
    Path(args.candidates).write_text(json.dumps(base, ensure_ascii=False, indent=2) + "\n",
                                    encoding="utf-8")
    print("AnimCJK eligible source counts:", len(eligible), "of", len(missing)-len(existing))
    print("AnimCJK newly admitted candidates:", len(recovered))
    print("AnimCJK new characters:", "".join(row["character"] for row in recovered))
    print("AnimCJK rejection summary:", dict(rejected))

if __name__ == "__main__":
    main()
