#!/usr/bin/env python3
"""Conservative Mandarin-only transfer of HanziVG group ownership to pinned outlines.

HanziVG supplies independently grouped Chinese stroke *centerlines*; this tool
never redistributes its paths by character appearance. It accepts only complete,
catalog-matching groups with index-wise geometric agreement with Make Me a Hanzi
filled outlines. All accepted transfers remain unreviewed research candidates.
"""
import argparse
from collections import Counter, defaultdict
from concurrent.futures import ThreadPoolExecutor, as_completed
from itertools import permutations
import json
import math
from pathlib import Path
import re
import time
from urllib.error import HTTPError, URLError
from urllib.request import urlopen
import xml.etree.ElementTree as ET

REV = "55ecef6a881d5120cd261587d668e1b6af843ec2"
BASE = f"https://raw.githubusercontent.com/Connum/hanzivg/{REV}/hanzi/"
KANJIVG_REV = "70a0b7ae0c18ceb5cb358274b029cce0234a43bc"
KANJIVG_BASE = f"https://raw.githubusercontent.com/KanjiVG/kanjivg/{KANJIVG_REV}/kanji/"
TOKEN = re.compile(r"[MmLlHhVvCcSsQqTtAaZz]|[-+]?(?:\d*\.\d+|\d+\.?)(?:[eE][-+]?\d+)?")
PARAMS = {"M": 2, "L": 2, "H": 1, "V": 1, "C": 6, "S": 4,
          "Q": 4, "T": 2, "A": 7, "Z": 0}

def local(tag):
    return tag.rsplit("}", 1)[-1]

def element_name(node):
    return next((v for k, v in node.attrib.items()
                 if k.rsplit("}", 1)[-1] in ("element", "kvg:element")), None)

def parse_svg(data):
    # HanziVG's historical files declare kvg through an internal DTD.
    # Remove the DTD instead of resolving external entities, and explicitly
    # declare the conventional namespace when missing.
    data = re.sub(r"<!DOCTYPE\s+svg\b.*?\]>", "", data, flags=re.S)
    data = re.sub(r"<!DOCTYPE\s+svg\b[^>]*>", "", data, flags=re.S)
    if "xmlns:kvg=" not in data:
        data = data.replace("<svg ", '<svg xmlns:kvg="http://kanjivg.tagaini.net" ', 1)
    return ET.fromstring(data)

def coordinates(path, invert_y=False):
    tokens = TOKEN.findall(path)
    if not tokens or tokens[0] not in "Mm":
        raise ValueError("SVG path does not start with a moveto")
    p = [0.0, 0.0]
    start = [0.0, 0.0]
    pts = []
    pos = 0
    op = None
    limit = 0
    while pos < len(tokens):
        limit += 1
        if limit > 10000:
            raise ValueError("path command limit")
        if len(tokens[pos]) == 1 and tokens[pos].isalpha():
            op = tokens[pos]
            pos += 1
            if op.upper() == "Z":
                p = start.copy()
                pts.append(tuple(p))
                op = None
                continue
        if not op or op.upper() not in PARAMS or op.upper() == "A":
            raise ValueError("unsupported SVG command")
        count = PARAMS[op.upper()]
        if pos + count > len(tokens):
            raise ValueError("truncated SVG path")
        args = [float(x) for x in tokens[pos:pos + count]]
        pos += count
        absolute = op.isupper()
        kind = op.upper()
        old = p.copy()
        if kind in ("M", "L", "T"):
            p = [args[0] + (0 if absolute else old[0]),
                 args[1] + (0 if absolute else old[1])]
            pts.append(tuple(p))
            if kind == "M":
                start = p.copy()
                op = "L" if absolute else "l"
        elif kind == "H":
            p[0] = args[0] + (0 if absolute else old[0])
            pts.append(tuple(p))
        elif kind == "V":
            p[1] = args[0] + (0 if absolute else old[1])
            pts.append(tuple(p))
        else:
            for j in range(0, count, 2):
                pt = [args[j] + (0 if absolute else old[0]),
                      args[j + 1] + (0 if absolute else old[1])]
                pts.append(tuple(pt))
                if j == count - 2:
                    p = pt
    if len(pts) < 2 or not all(math.isfinite(v) for pt in pts for v in pt):
        raise ValueError("invalid path geometry")
    return [(x, -y if invert_y else y) for x, y in pts]

def bounds(points):
    return (min(x for x, _ in points), min(y for _, y in points),
            max(x for x, _ in points), max(y for _, y in points))

def normalize(b, outer):
    ow = outer[2] - outer[0]
    oh = outer[3] - outer[1]
    if min(ow, oh) < 1:
        raise ValueError("degenerate glyph")
    return ((b[0] - outer[0]) / ow, (b[1] - outer[1]) / oh,
            (b[2] - outer[0]) / ow, (b[3] - outer[1]) / oh)

def correspondence(source_paths, reference_paths):
    if len(source_paths) != len(reference_paths) or len(source_paths) < 2:
        return None
    try:
        src = [coordinates(p) for p in source_paths]
        ref = [coordinates(p, invert_y=True) for p in reference_paths]
        all_src = bounds([p for row in src for p in row])
        all_ref = bounds([p for row in ref for p in row])
        errors = []
        for left, right in zip(src, ref):
            a = normalize(bounds(left), all_src)
            b = normalize(bounds(right), all_ref)
            center = math.hypot((a[0] + a[2] - b[0] - b[2]) / 2,
                                (a[1] + a[3] - b[1] - b[3]) / 2)
            size = max(abs((a[2] - a[0]) - (b[2] - b[0])),
                       abs((a[3] - a[1]) - (b[3] - b[1])))
            if center > 0.19 or size > 0.24:
                return None
            errors.append(center + size * 0.2)
        mean = sum(errors) / len(errors)
        return round(mean, 5) if mean <= 0.105 else None
    except (ValueError, OverflowError, ZeroDivisionError):
        return None


def reordered_correspondence(source_paths, reference_paths, source_owners):
    """Find a unique geometry-supported ownership vector, not merely any swap.

    Bounded to small characters. Different assignments of paths *within the
    same component* are equivalent; assignments changing a path owner require
    a clear score gap over the nearest incompatible alternative.
    """
    n = len(source_paths)
    if n < 2 or n > 8 or len(reference_paths) != n or len(source_owners) != n:
        return None
    try:
        src = [coordinates(p) for p in source_paths]
        ref = [coordinates(p, invert_y=True) for p in reference_paths]
        all_src = bounds([p for row in src for p in row])
        all_ref = bounds([p for row in ref for p in row])
        sa = [normalize(bounds(row), all_src) for row in src]
        ra = [normalize(bounds(row), all_ref) for row in ref]
    except (ValueError, OverflowError, ZeroDivisionError):
        return None
    score = []
    for a in sa:
        line = []
        for b in ra:
            center = math.hypot((a[0] + a[2] - b[0] - b[2]) / 2,
                                (a[1] + a[3] - b[1] - b[3]) / 2)
            size = max(abs((a[2] - a[0]) - (b[2] - b[0])),
                       abs((a[3] - a[1]) - (b[3] - b[1])))
            line.append(center + 0.2 * size if center <= 0.19 and size <= 0.24
                        else float("inf"))
        score.append(line)
    by_owners = {}
    for pairing in permutations(range(n)):
        costs = [score[i][dest] for i, dest in enumerate(pairing)]
        if not all(math.isfinite(c) for c in costs):
            continue
        mean = sum(costs) / n
        if mean > 0.105:
            continue
        owners = [None] * n
        for i, dest in enumerate(pairing):
            owners[dest] = source_owners[i]
        key = tuple(owners)
        if key not in by_owners or mean < by_owners[key]:
            by_owners[key] = mean
    if not by_owners:
        return None
    ranked = sorted(by_owners.items(), key=lambda item: item[1])
    if len(ranked) > 1 and ranked[1][1] - ranked[0][1] < 0.04:
        return None
    owners, mean = ranked[0]
    if owners == tuple(source_owners):
        return None  # This fallback must not bypass the original indexed gate.
    return round(mean, 5), list(owners)

def group_owners(svg, character, instances):
    wanted = Counter(str(row["form"]) for row in instances)
    forms = defaultdict(set)
    owners = []
    source_paths = []
    unassigned = []
    roots = [g for g in svg.iter() if local(g.tag) == "g"
             and element_name(g) == character]
    if len(roots) != 1 or len(instances) < 2:
        return None

    def walk(node, groups, foreign=False):
        label = element_name(node) if local(node.tag) == "g" else None
        if node is not roots[0] and label:
            if label in wanted:
                groups = groups + [(id(node), label)]
            elif not groups:
                foreign = True
        if local(node.tag) == "path":
            if not node.get("d"):
                raise ValueError("empty stroke")
            source_paths.append(node.attrib["d"])
            if groups:
                group_id, form = groups[-1]
                forms[form].add(group_id)
                owners.append(form)
            elif not foreign:
                owners.append(None)
                unassigned.append(len(owners) - 1)
            else:
                raise ValueError("uncatalogued source component group")
        for child in node:
            walk(child, groups, foreign)

    try:
        walk(roots[0], [])
    except ValueError:
        return None
    if len(owners) < 2 or len(source_paths) != len(owners):
        return None
    explicit = Counter({form: len(groups) for form, groups in forms.items()})
    if not unassigned:
        if explicit != wanted:
            return None
        return owners, source_paths, "explicit_source_groups"
    # An otherwise complete segmentation may omit a single group enclosing
    # root-level paths. Treat their complement as one *provisional* component
    # only if the external Mandarin catalog names exactly one missing INSTANCE.
    # Nested foreign groups, additional missing instances and ambiguous
    # repeated components remain unresolved; this is not a shape guess.
    remaining = wanted - explicit
    if (sum(remaining.values()) != 1 or any(explicit[k] > wanted[k] for k in explicit)
            or not unassigned):
        return None
    residual = next(iter(remaining))
    for index in unassigned:
        owners[index] = residual
    return owners, source_paths, "single_root_residual_catalog_component"

def download(character):
    """Use Chinese-curated grouping first. KanjiVG is comparison only.

    Japanese source paths are NEVER used as rendered glyphs. The fallback is
    eligible only when both indexed group ownership and source outline geometry
    correspond to pinned Mainland Mandarin glyph vectors.
    """
    for provider, base, filename in (
        ("hanzivg", BASE, f"hanzi/{ord(character):05x}.svg"),
        ("kanjivg_comparison", KANJIVG_BASE, f"kanji/{ord(character):05x}.svg"),
    ):
        url = base + f"{ord(character):05x}.svg"
        missing = False
        for attempt in range(2):
            try:
                with urlopen(url, timeout=14) as response:
                    data = response.read(250000)
                if len(data) >= 250000:
                    return (character, None, None, None, "oversized_xml")
                return (character, data.decode("utf-8"), provider, filename, None)
            except HTTPError as error:
                if error.code == 404:
                    missing = True
                    break
                if error.code not in (429, 500, 502, 503, 504):
                    return (character, None, None, None, "source_http_error")
            except (OSError, URLError, UnicodeDecodeError):
                pass
            time.sleep(attempt + 1)
        if not missing:
            return (character, None, None, None, "source_unavailable")
    return (character, None, None, None, "no_grouped_svg")

def make_candidate(character, catalog, colors, graphics, xml, provider, filename):
    instances = catalog.get("component_instances", [])
    if not isinstance(instances, list) or len(instances) < 2:
        return None, "noncompositional_catalog"
    ids = set(catalog.get("component_ids", []))
    if not ids:
        return None, "catalog_missing_ids"
    by_form = {}
    parts = []
    for row in instances:
        component_id = row.get("id")
        form = row.get("form")
        spec = colors.get(component_id)
        if not spec or spec["shape"] != form or component_id not in ids:
            return None, "catalog_palette_mismatch"
        if form in by_form and by_form[form] != component_id:
            return None, "ambiguous_form_identity"
        by_form[form] = component_id
        parts.append({"form": form, "component_id": component_id,
                      "color": spec["color"]})
    try:
        grouped = group_owners(parse_svg(xml), character, instances)
    except (ET.ParseError, ValueError):
        return None, "unparseable_structural_svg"
    if grouped is None:
        return None, "source_group_catalog_mismatch"
    owners, source_paths, ownership_method = grouped
    ref_paths = graphics.get(character)
    if not ref_paths or len(ref_paths) != len(owners):
        return None, "source_stroke_count_mismatch"
    error = correspondence(source_paths, ref_paths)
    match_method = "same_stroke_index_geometry"
    if error is None:
        reordered = reordered_correspondence(source_paths, ref_paths, owners)
        if reordered is None:
            return None, "geometry_not_corresponding"
        error, owners = reordered
        match_method = "unique_stroke_geometry_bijection"
    # Comparison-only or residual ownership needs stronger shape agreement.
    # Neither can bypass source component inventory or uniqueness checks.
    if (provider == "kanjivg_comparison" or
            ownership_method == "single_root_residual_catalog_component") and error > 0.045:
        return None, "cross_variant_geometry_insufficient"
    decomposition = catalog.get("ids_primary", "").split(";")[0].split("(")[0].strip()
    strokes = [{"path": p, "component_id": by_form[f],
                "color": colors[by_form[f]]["color"]}
               for f, p in zip(owners, ref_paths)]
    return ({"character": character, "decomposition": decomposition,
             "parts": parts, "strokes": strokes, "mean_geometry_error": error,
             "stroke_count": len(strokes),
             "ownership_svg": filename,
             "ownership_provider": provider,
             "ownership_revision": REV if provider == "hanzivg" else KANJIVG_REV,
             "geometry_match_method": match_method,
             "ownership_method": ownership_method}, None)

def self_test():
    path = "M 10,10c5,0,5,10,10,10"
    assert bounds(coordinates(path)) == (10.0, 10.0, 20.0, 20.0)
    assert coordinates("M 10 10 L 20 20 Z", True)[-1] == (10., -10.)
    assert correspondence(["M 0 0 L 10 10", "M 20 20 L 30 30"],
                          ["M 0 30 L 10 20 Z", "M 20 10 L 30 0 Z"]) == 0.0
    sample = """<svg><g><g kvg:element="字"><g kvg:element="宀"><path d="M 0 0 L 10 10"/></g><g kvg:element="子"><path d="M 20 20 L 30 30"/></g></g></g></svg>"""
    sample = sample.replace("<svg>", '<svg xmlns:kvg="http://kanjivg.tagaini.net">')
    got = group_owners(parse_svg(sample), "字", [{"form":"宀"},{"form":"子"}])
    assert got and got[0] == ["宀", "子"] and got[2] == "explicit_source_groups"
    residual = """<svg xmlns:kvg="http://kanjivg.tagaini.net"><g kvg:element="左"><path d="M 0 0 L 4 4"/><g kvg:element="工"><path d="M 10 10 L 20 20"/></g></g></svg>"""
    aligned = group_owners(parse_svg(residual), "左", [{"form":"𠂇"},{"form":"工"}])
    assert aligned and aligned[0] == ["𠂇","工"]
    assert aligned[2] == "single_root_residual_catalog_component"
    assert group_owners(parse_svg(residual), "左",
                        [{"form":"𠂇"},{"form":"工"},{"form":"丶"}]) is None
    reorder = reordered_correspondence(
        ["M 0 0 L 10 10", "M 30 20 L 40 30"],
        ["M 30 -20 L 40 -30", "M 0 0 L 10 -10"],
        ["left", "right"])
    assert reorder and reorder[1] == ["right", "left"]
    print("HanziVG structural and geometric self-tests passed")

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--coverage")
    ap.add_argument("--catalog")
    ap.add_argument("--palette")
    ap.add_argument("--graphics")
    ap.add_argument("--out")
    ap.add_argument("--self-test", action="store_true")
    args = ap.parse_args()
    if args.self_test:
        self_test()
        return
    missing = [row["character"] for row in json.loads(Path(args.coverage).read_text())["unmapped"]]
    wanted = set(missing)
    catalog = {row["character"]: row for row in json.loads(Path(args.catalog).read_text())["characters"]
               if row["character"] in wanted}
    colors = {row["id"]: row for row in json.loads(Path(args.palette).read_text())["components"]}
    graphics = {}
    with open(args.graphics, encoding="utf-8") as source:
        for line in source:
            row = json.loads(line)
            if row.get("character") in wanted:
                graphics[row["character"]] = row.get("strokes")
    outcomes = []
    with ThreadPoolExecutor(max_workers=10) as pool:
        futures = [pool.submit(download, ch) for ch in missing]
        for future in as_completed(futures):
            outcomes.append(future.result())
    accepted = []
    rejected = Counter()
    rejected_characters = defaultdict(list)
    for ch, xml, provider, filename, reason in sorted(outcomes):
        if reason:
            rejected[reason] += 1
            rejected_characters[reason].append(ch)
            continue
        candidate, reason = make_candidate(ch, catalog[ch], colors, graphics, xml, provider, filename)
        if candidate is None:
            rejected[reason] += 1
            rejected_characters[reason].append(ch)
        else:
            accepted.append(candidate)
    data = {"schema": "chromalect.hanzivg-source-transfer.v1",
            "ownership_provider": "HanziVG Chinese-reviewed hanzi directory",
            "ownership_revision": REV,
            "comparative_ownership_revision": KANJIVG_REV,
            "geometry_provider": "Make Me a Hanzi pinned graphics.txt",
            "status": "automated_candidates_pending_independent_review",
            "requested_missing": len(missing),
            "accepted_count": len(accepted),
            "rejected_reasons": dict(sorted(rejected.items())),
            "rejected_characters": dict(sorted(rejected_characters.items())),
            "candidates": accepted}
    Path(args.out).write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Chinese group and geometry alignment: {len(accepted)}/{len(missing)} new candidates; rejection reasons {dict(rejected)}")
    print("Breakdown by independent comparison source:", dict(Counter(row["ownership_provider"] for row in accepted)))
    print("New characters:", "".join(row["character"] for row in accepted))
    for reason, chars in sorted(rejected_characters.items()):
        if reason != "no_grouped_svg":
            print(f"Rejection {reason} ({len(chars)}):", "".join(chars))

if __name__ == "__main__":
    main()
