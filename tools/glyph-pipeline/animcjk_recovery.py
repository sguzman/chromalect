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
from functools import lru_cache
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

def parse_flat_acjk(source, character):
    """Decode explicit per-stroke runs when ACJK's split notation is not an IDS tree.

    Accept counted atomic forms only. A named enclosing subglyph with no count
    is not itself stroke ownership. Shared-stroke (A:B:n), approximate aliases
    and uncounted paths cannot pass this parser.
    """
    if not isinstance(source, str) or not source.startswith(character):
        raise Reject("missing_or_wrong_acjk_root")
    i = len(character)
    segments = []
    while i < len(source):
        char = source[i]
        if char in OPS:
            i += 1
            continue
        if char in ".:~" or char.isdigit() or ord(char) < 128:
            raise Reject("ambiguous_flat_component_token")
        i += 1
        if i < len(source) and source[i] == "~":
            raise Reject("approximate_component_alias")
        radical = False
        if i < len(source) and source[i] == ".":
            radical = True
            i += 1
        split = False
        if i < len(source) and source[i] == ":":
            split = True
            i += 1
            if i < len(source) and "a" <= source[i] <= "z":
                i += 1
            if i < len(source) and source[i] == ":":
                raise Reject("shared_component_stroke")
        # Internal named components may contain IDS substructure, in which
        # case only the fully counted descendants are emitted.
        if i < len(source) and source[i] in OPS:
            continue
        start = i
        while i < len(source) and source[i].isdigit():
            i += 1
        if start == i:
            raise Reject("flat_component_missing_count")
        count = int(source[start:i])
        if not 1 <= count <= 32:
            raise Reject("invalid_flat_stroke_count")
        segments.append({"form": char, "children": [], "count": count,
                         "split": split, "radical": radical})
    if len(segments) < 2:
        raise Reject("insufficient_flat_source_components")
    return {"form": None, "children": segments,
            "count": sum(item["count"] for item in segments),
            "split": False, "flat_source": True}

def parse_acjk(source, character):
    if not isinstance(source, str) or len(source) < 3 or source[0] != character:
        raise Reject("missing_or_wrong_acjk_root")
    parser = Parser(source[1:])
    try:
        node = parser.term()
        if parser.i == len(parser.source):
            return node
    except Reject:
        pass
    return parse_flat_acjk(source, character)

def count_ownership(node, instances, donor_rows=None):
    wanted = Counter(row["form"] for row in instances)
    if len(instances) < 2 or any(not isinstance(form, str) or not form for form in wanted):
        raise Reject("catalog_not_compositional")
    used = Counter()
    segments = []
    witnesses = []

    def visit(part, trail=()):
        form = part["form"]
        if form in wanted:
            if part["count"] < 1:
                raise Reject("empty_owner")
            used[(form, part["split"])] += 1
            segments.extend([form] * part["count"])
        elif part["children"]:
            for child in part["children"]:
                visit(child, trail)
        elif donor_rows and form and form in donor_rows and part["count"] >= 2:
            if form in trail or len(trail) >= 3:
                raise Reject("recursive_component_cycle")
            donor_node = parse_acjk(donor_rows[form].get("acjk", ""), form)
            if donor_node["count"] != part["count"]:
                raise Reject("donor_stroke_count_disagreement")
            start = len(segments)
            visit(donor_node, trail + (form,))
            if len(segments) - start != part["count"]:
                raise Reject("donor_subcomponent_ownership_incomplete")
            witnesses.append({"form": form, "start": start, "count": part["count"]})
        else:
            raise Reject("component_name_disagreement")

    visit(node)
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
    return (segments, witnesses) if donor_rows is not None else segments

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

@lru_cache(maxsize=256)
def donor_strokes(form):
    _, raw, reason = fetch_svg(form)
    if reason:
        raise Reject("donor_chinese_svg_unavailable")
    return extract_strokes(raw, form)

def candidate(ch, node, owners, svg, graphics, palette, catalog, witnesses=()):
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
    # Donor decompositions apply to a *subglyph*, not an entire glyph.
    # Compare every donor's original Chinese paths to its exact contiguous
    # stroke span in the parent before admitting any inferred nested owner.
    donor_checks = []
    for witness in witnesses:
        form = witness["form"]
        start = witness["start"]
        count = witness["count"]
        if count < 2 or start < 0 or start + count > len(source_paths):
            raise Reject("invalid_donor_span")
        source = donor_strokes(form)
        if len(source) != count:
            raise Reject("donor_svg_count_disagreement")
        donor_error = correspondence(source, source_paths[start:start + count], invert_reference_y=False)
        if donor_error is None or donor_error > 0.095:
            raise Reject("donor_subglyph_geometry_disagreement")
        donor_checks.append({"component":form,"start":start,"count":count,
                             "mean_geometry_error":donor_error,
                             "source_svg":f"svgsZhHans/{ord(form)}.svg"})
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
            "ownership_method": ("animcjk_verified_nested_component_derivation"
                                 if witnesses else "explicit_animcjk_component_stroke_counts"),
            "geometry_match_method": method,
            "subglyph_witnesses": donor_checks,
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
    donor_test = {"乞": {"acjk": "乞⿱𠂉2乙1"}}
    nested = parse_acjk("吃⿰口3乞3", "吃")
    owners, witnesses = count_ownership(nested,
        [{"form":"口"},{"form":"𠂉"},{"form":"乙"}], donor_test)
    assert owners == ["口"]*3 + ["𠂉"]*2 + ["乙"]
    assert witnesses == [{"form":"乞","start":3,"count":3}]
    # Split components with uniquely named paths can be counted directly.
    flat = parse_acjk("那⿰⿻刀:1二2刀:1阝.2", "那")
    assert flat["flat_source"]
    assert count_ownership(flat, [{"form":"刀"},{"form":"二"},{"form":"阝"}]) == [
        "刀","二","二","刀","阝","阝"
    ]
    # A shared physical stroke has multiple owners; do not color it as one.
    try:
        parse_acjk("臼.⿱𠀉:3彐:2𠀉:彐:1", "臼")
        raise AssertionError("Shared source stroke was accepted")
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
            owners, witnesses = count_ownership(node, catalog[ch]["component_instances"], rows)
            if len(owners) != len(graphics.get(ch, [])):
                raise Reject("source_stroke_count_disagreement")
            eligible[ch] = (node, owners, witnesses)
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
    for ch, (node, owners, witnesses) in sorted(eligible.items()):
        xml, reason = outcomes[ch]
        if reason:
            rejected[reason] += 1
            rejected_ch[ch] = reason
            continue
        try:
            row = candidate(ch, node, owners, xml, graphics, palette, catalog, witnesses)
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
    print("AnimCJK verified nested donor recoveries:",
          "".join(row["character"] for row in recovered if row["subglyph_witnesses"]))
    print("AnimCJK new characters:", "".join(row["character"] for row in recovered))
    print("AnimCJK rejection summary:", dict(rejected))
    for reason, total in sorted(rejected.items(), key=lambda pair: (-pair[1],pair[0])):
        cases = [(ch, rows.get(ch, {}).get("acjk", ""))
                 for ch, why in sorted(rejected_ch.items()) if why == reason]
        print(f"AnimCJK research queue [{reason}] ({total}):",
              " ".join(f"{ch}:{source[:90]}" for ch, source in cases[:55]))

if __name__ == "__main__":
    main()
