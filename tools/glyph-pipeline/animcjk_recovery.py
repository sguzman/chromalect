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
# The ONE source-only form with an attested relation to an existing v0.4 identity.
# Never fold two separately registered identity tokens into one another.
SOURCE_ONLY_VARIANTS = {
    "𠆢": {"selected_form": "人", "stroke_count": 2,
        "evidence": "https://ctext.org/dictionary.pl?char=%E4%BA%BA&if=en"}
}

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

# These exact pinned source records contain nested interleaved component
# labels. Each explicitly counted source path remains unique, but the inner
# tags cannot be read as ordinary binary IDS children. Retaining the named
# enclosing unit is safe only at this already-published component cut.
COUNTED_CHINESE_CONTRACTIONS = {
    "㐌": ("㐌⿱𠂉2也⿻乜:𠃌1丨1乜:乚.1",
           [("𠂉",2),("也",3)]),
    "并": ("并⿱丷2开⿻干.:2丿1干.:1",
           [("丷",2),("开",4)]),
}

def contracted_source(source, character):
    record = COUNTED_CHINESE_CONTRACTIONS.get(character)
    if not record or source != record[0]:
        return None
    parts=[{"form":form,"children":[],"count":count,"split":False}
           for form,count in record[1]]
    return {"form":None,"children":parts,"count":sum(p["count"] for p in parts),
            "split":False,"contracted_source":True}

def parse_acjk(source, character):
    if not isinstance(source, str) or len(source) < 3 or source[0] != character:
        raise Reject("missing_or_wrong_acjk_root")
    contracted=contracted_source(source,character)
    if contracted is not None:
        return contracted
    # AnimCJK often prefixes a standalone radical's decomposition with a
    # period (e.g. 厂.⿱一1丿1). The dot marks radical membership; it is
    # NOT a stroke and must be consumed before parsing the component tree.
    body = source[len(character):]
    if body.startswith(".") and len(body) > 1 and body[1] in OPS:
        body = body[1:]
    parser = Parser(body)
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
    variants = []

    def visit(part, trail=()):
        form = part["form"]
        if form in wanted:
            if part["count"] < 1:
                raise Reject("empty_owner")
            used[(form, part["split"])] += 1
            segments.extend([form] * part["count"])
        elif form in SOURCE_ONLY_VARIANTS and SOURCE_ONLY_VARIANTS[form]["selected_form"] in wanted:
            variant = SOURCE_ONLY_VARIANTS[form]
            if part["count"] != variant["stroke_count"] or part["split"]:
                raise Reject("source_variant_stroke_count_disagreement")
            selected_form = variant["selected_form"]
            used[(selected_form, False)] += 1
            start = len(segments)
            segments.extend([selected_form] * part["count"])
            variants.append({"source_form": form, "selected_form": selected_form,
                             "start": start, "count": part["count"],
                             "evidence": variant["evidence"]})
        elif part["children"]:
            for child in part["children"]:
                visit(child, trail)
        elif donor_rows and form and form in donor_rows and part["count"] >= 2:
            if form in trail or len(trail) >= 3:
                raise Reject("recursive_component_cycle")
            try:
                donor_node = parse_acjk(donor_rows[form].get("acjk", ""), form)
            except Reject as problem:
                raise Reject(f"donor_parse_{form}_{problem}") from problem
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
    return (segments, witnesses, variants) if donor_rows is not None else segments

def catalog_alternatives(row, palette):
    """Yield explicitly documented IDS alternative cuts with v0.4 identities.

    This does not invent new components or redefine the primary catalog entry.
    Each selected cut is carried to the Rust provenance validator verbatim.
    """
    from collections import defaultdict
    identities = defaultdict(list)
    for component in palette.values():
        identities[component["shape"]].append(component["id"])
    alternatives = []
    original = row.get("ids_primary", "")
    expressions = original.split(";")
    primary = expressions[0].split("(")[0].strip()
    for token in expressions[1:]:
        expression = token.split("(")[0].strip()
        if not expression or expression == primary:
            continue
        chars = list(expression)
        cursor = [0]
        forms = []
        def leaf(depth):
            if depth > 8 or cursor[0] >= len(chars):
                raise Reject("invalid_catalog_alternative")
            ch = chars[cursor[0]]
            cursor[0] += 1
            if ch in OPS:
                for _ in range(OPS[ch]):
                    leaf(depth+1)
            else:
                forms.append(ch)
        try:
            leaf(0)
        except Reject:
            continue
        if cursor[0] != len(chars) or not 2 <= len(forms) <= 8:
            continue
        if any(len(identities[form]) != 1 for form in forms):
            continue
        items = [{"form":form,"id":identities[form][0]} for form in forms]
        selected = dict(row, ids_primary=expression,
                        component_instances=items,
                        component_ids=[item["id"] for item in items],
                        source_selected_catalog_alternative=expression)
        alternatives.append(selected)
    return alternatives

# Reinterpret only source records whose original published IDS was *unparsed*.
# The source-derived replacements use independently pinned simplified-Chinese
# stroke-count decompositions and already registered v0.4 color identities.
# All other characters retain their official selected catalog analysis.
UNPARSED_SOURCE_CUTS = {
    "包": {"source_acjk": "包⿹勹.2巳3", "cut": "⿹勹巳", "forms": ["勹", "巳"],
           "source_children": ["勹", "巳"], "status": "nonstandard_ids_not_parsed"},
    "岛": {"source_acjk": "岛⿱鸟4山.3", "cut": "⿱鸟山", "forms": ["鸟", "山"],
           "source_children": ["鸟", "山"], "status": "nonstandard_ids_not_parsed"},
    "刨": {"source_acjk": "刨⿰包5刂.2", "cut": "⿰⿹勹巳刂", "forms": ["勹", "巳", "刂"],
           "source_children": ["包", "刂"], "status": "partial_components"},
    "抱": {"source_acjk": "抱⿰扌.3包5", "cut": "⿰扌⿹勹巳", "forms": ["扌", "勹", "巳"],
           "source_children": ["扌", "包"], "status": "partial_components"},
    # The four-stroke 㓁 = 冖 + 儿 cut is separately recorded in
    # https://en.wiktionary.org/wiki/%E3%93%81 . Admission additionally
    # requires actual pinned AnimCJK source donor decomposition and SVG match.
    "罕": {"source_acjk":"罕⿱㓁.4干3", "cut":"⿱⿱冖儿干",
           "forms":["冖","儿","干"],"source_children":["㓁","干"],
           "status":"partial_components"},
    "礼": {"source_acjk":"礼⿰礻.4乚1", "cut":"⿰礻乚", "forms":["礻","乚"],
           "source_children":["礻","乚"], "status":"resolved_structural_membership"},
    "社": {"source_acjk":"社⿰礻.4土3", "cut":"⿰礻土", "forms":["礻","土"],
           "source_children":["礻","土"], "status":"resolved_structural_membership"},
    "祀": {"source_acjk":"祀⿰礻.4巳3", "cut":"⿰礻巳", "forms":["礻","巳"],
           "source_children":["礻","巳"], "status":"resolved_structural_membership"},
    "寻": {"source_acjk":"寻⿱彐3寸.3", "cut":"⿱彐寸", "forms":["彐","寸"],
           "source_children":["彐","寸"], "status":"resolved_structural_membership"},
    "当": {"source_acjk":"当⿱⺌3彐.3", "cut":"⿱⺌彐", "forms":["⺌","彐"],
           "source_children":["⺌","彐"], "status":"resolved_structural_membership"},
    "扫": {"source_acjk":"扫⿰扌.3彐3", "cut":"⿰扌彐", "forms":["扌","彐"],
           "source_children":["扌","彐"], "status":"resolved_structural_membership"},
    "帅": {"source_acjk":"帅⿰刂2巾.3", "cut":"⿰刂巾", "forms":["刂","巾"],
           "source_children":["刂","巾"], "status":"resolved_structural_membership"},
    "师": {"source_acjk":"师⿰刂2帀⿱一1巾.3", "cut":"⿰刂⿱一巾", "forms":["刂","一","巾"],
           "source_children":["刂","帀"], "status":"resolved_structural_membership"},
    "归": {"source_acjk":"归⿰刂2彐.3", "cut":"⿰刂彐", "forms":["刂","彐"],
           "source_children":["刂","彐"], "status":"resolved_structural_membership"},
    "爷": {"source_acjk":"爷⿱父.4卩2", "cut":"⿱父卩", "forms":["父","卩"],
           "source_children":["父","卩"], "status":"resolved_structural_membership"},
    "节": {"source_acjk":"节⿱艹.3卩2", "cut":"⿱艹卩", "forms":["艹","卩"],
           "source_children":["艹","卩"], "status":"resolved_structural_membership"},
    "北": {"source_acjk":"北⿰丬3匕.2", "cut":"⿰丬匕", "forms":["丬","匕"],
           "source_children":["丬","匕"], "status":"resolved_structural_membership"},
    "在": {"source_acjk":"在⿱才3土.3", "cut":"⿱才土", "forms":["才","土"],
           "source_children":["才","土"], "status":"resolved_structural_membership"},
    "即": {"source_acjk":"即⿰艮5卩.2", "cut":"⿰艮卩", "forms":["艮","卩"],
           "source_children":["艮","卩"], "status":"resolved_structural_membership"},
    "关": {"source_acjk":"关⿱丷.2天4", "cut":"⿱丷天", "forms":["丷","天"],
           "source_children":["丷","天"], "status":"resolved_structural_membership"},
    "坚": {"source_acjk":"坚⿱⿲丨1丨1又2土.3", "cut":"⿱⿲丨丨又土",
           "forms":["丨","丨","又","土"], "source_children":[None,"土"],
           "status":"resolved_structural_membership"},
    "尧": {"source_acjk":"尧⿱⿻一1乂2兀.3", "cut":"⿱⿻一乂兀",
           "forms":["一","乂","兀"],"source_children":[None,"兀"],
           "status":"resolved_structural_membership"},
    "并": {"source_acjk":"并⿱丷2开⿻干.:2丿1干.:1",
           "cut":"⿱丷开", "forms":["丷","开"],
           "source_children":["丷","开"],"status":"resolved_structural_membership"},
}

def reviewed_unparsed_source_cut(ch, source_acjk, node, catalog, palette):
    record = UNPARSED_SOURCE_CUTS.get(ch)
    if not record or record["source_acjk"] != source_acjk:
        return None
    if catalog.get("structural_status") != record["status"]:
        raise Reject("original_catalog_status_not_source_backed")
    if record["status"] == "nonstandard_ids_not_parsed":
        if catalog["component_instances"]:
            raise Reject("original_nonstandard_catalog_had_selected_components")
    elif record["status"] == "partial_components":
        # A compound unknown part (包) must be precisely the catalog's only
        # missing component; all other identities retain their selected colors.
        expected_missing = "㓁" if ch == "罕" else "包"
        if {item["form"] for item in catalog.get("missing_components", [])}!={expected_missing}:
            raise Reject("unverified_missing_subglyph")
        if not catalog["component_instances"]:
            raise Reject("no_pinned_catalog_components_for_subglyph")
    else:
        # An original complete cut can be replaced only by the explicitly
        # pinned simplified-Chinese component identities above. Never silently
        # fold two distinct palette IDs into one.
        if not catalog["component_instances"] or not catalog["component_ids"]:
            raise Reject("original_resolved_catalog_missing_pinned_identities")
    forms = record["forms"]
    if not node["children"] or [v["form"] for v in node["children"]] != record["source_children"]:
        raise Reject("source_decomposition_does_not_match_approved_cut")
    from collections import defaultdict
    colors=defaultdict(list)
    for item in palette.values():
        colors[item["shape"]].append(item)
    if any(len(colors[form])!=1 for form in forms):
        raise Reject("unregistered_source_cut_component")
    instances=[{"form":form,"id":colors[form][0]["id"]} for form in forms]
    selected=dict(catalog,ids_primary=record["cut"],
                  component_instances=instances,
                  component_ids=list(dict.fromkeys(x["id"] for x in instances)),
                  source_selected_catalog_cut=record["cut"])
    return selected

# Catalog-documented alternative component cuts that might be equivalent
# to *unregistered* source-only Chinese forms. This is an attempt queue,
# never permission to equate shapes: candidate() must independently compare
# pinned ZhHans standalone source/selected SVGs AND the actual glyph spans.
# Neither source-only form has a separately assigned v0.4 component ID.
DOCUMENTED_SOURCE_FORM_CUTS = {
    "杀": {"acjk":"杀⿱㐅2朩.4","catalog_cut":"⿱乂木",
          "pairs":[("㐅","乂",2),("朩","木",4)]},
    "杂": {"acjk":"杂⿱九2朩.4","catalog_cut":"⿱九木",
          "pairs":[("九","九",2),("朩","木",4)]},
    "条": {"acjk":"条⿱夂3朩.4","catalog_cut":"⿱夂木",
          "pairs":[("夂","夂",3),("朩","木",4)]},
}

def documented_source_form_plans(character, acjk, node, catalog, selected_rows, palette):
    spec = DOCUMENTED_SOURCE_FORM_CUTS.get(character)
    if not spec or acjk != spec["acjk"]:
        return []
    selected = [r for r in selected_rows
                if r.get("source_selected_catalog_alternative") == spec["catalog_cut"]]
    if len(selected) != 1 or spec["catalog_cut"] not in catalog["ids_primary"]:
        raise Reject("not_a_documented_catalog_cut")
    selected = selected[0]
    if len(node["children"]) != len(spec["pairs"]):
        raise Reject("source_form_tree_disagreement")
    registered = {item["shape"] for item in palette.values()}
    owners, substitutions = [], []
    for index, (source_form, target_form, count) in enumerate(spec["pairs"]):
        child = node["children"][index]
        if child["form"] != source_form or child["count"] != count or child["split"]:
            raise Reject("source_form_stroke_count_disagreement")
        if source_form != target_form and source_form in registered:
            raise Reject("registered_source_identity_may_not_be_substituted")
        if not any(item["form"] == target_form for item in selected["component_instances"]):
            raise Reject("source_selected_component_missing")
        start = len(owners)
        owners.extend([target_form] * count)
        if source_form != target_form:
            substitutions.append({"source_form":source_form,"selected_form":target_form,
                                  "start":start,"count":count})
    if len(substitutions) < 1 or len(owners) != node["count"]:
        raise Reject("unverified_source_shape_substitution")
    if Counter(owners) != Counter({
            item["form"]: owners.count(item["form"])
            for item in selected["component_instances"]}):
        raise Reject("source_selected_component_inventory_disagreement")
    return [(owners, [], [], substitutions, selected)]

def one_form_substitution(node, instances):
    """Propose one provenance-tagged source/selected-form reconciliation.

    This merely identifies one possible correspondence. The admission step
    MUST additionally match the two independent ZhHans component SVGs,
    with identical stroke count and index-wise geometry.
    """
    wanted = Counter(x["form"] for x in instances)
    if len(instances) < 2:
        raise Reject("noncompositional_catalog")
    used = Counter()
    strokes = []
    foreign = []

    def walk(part):
        form = part["form"]
        if form in wanted:
            used[form] += 1
            strokes.extend([form] * part["count"])
        elif part["children"]:
            for child in part["children"]:
                walk(child)
        else:
            start = len(strokes)
            strokes.extend([None] * part["count"])
            foreign.append((form, start, part["count"], part["split"]))

    walk(node)
    if (len(foreign) != 1 or
            any(used[form] > count for form, count in wanted.items())):
        raise Reject("not_unique_single_form_substitution")
    missing = wanted - used
    if sum(missing.values()) != 1:
        raise Reject("not_unique_catalog_form")
    selected_form = next(iter(missing))
    source_form, start, count, split = foreign[0]
    if not source_form or split or count < 1 or start < 0:
        raise Reject("not_atomic_source_form")
    strokes[start:start + count] = [selected_form] * count
    if None in strokes or len(strokes) != node["count"]:
        raise Reject("incomplete_form_substitution")
    alias = {"source_form":source_form, "selected_form":selected_form,
             "start":start, "count":count}
    return strokes, [], [], [alias]

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

def candidate(ch, node, owners, svg, graphics, palette, catalog, witnesses=(), variants=(), form_substitutions=(), selected_override=None):
    source_paths = extract_strokes(svg, ch)
    refs = graphics.get(ch)
    if not refs or len(refs) != len(source_paths) or len(owners) != len(refs):
        raise Reject("chinese_stroke_count_disagreement")
    # Keep the original source-index owner vector for independently
    # comparing nested donor SVGs; the full glyph can later have its own
    # uniquely corroborated source-to-rendered outline permutation.
    source_owners = list(owners)
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
        donor_method = "same_stroke_index_geometry"
        if donor_error is None or donor_error > 0.095:
            # The counted donor's stroke order may differ from the parent.
            # Only a *unique* shape assignment, with no simultaneous
            # whole-glyph reordering, may change component ownership.
            if method != "same_stroke_index_geometry":
                raise Reject("donor_subglyph_geometry_disagreement")
            alternative = reordered_correspondence(
                source, source_paths[start:start+count],
                source_owners[start:start+count], invert_reference_y=False)
            if alternative is None or alternative[0] > 0.095:
                raise Reject("donor_subglyph_geometry_disagreement")
            donor_error, donor_owners = alternative
            owners[start:start+count] = donor_owners
            donor_method = "unique_donor_stroke_geometry_bijection"
        donor_checks.append({"component":form,"start":start,"count":count,
                             "mean_geometry_error":donor_error,
                             "geometry_match_method": donor_method,
                             "source_svg":f"svgsZhHans/{ord(form)}.svg"})
    # Catalog/source form substitutions are allowed ONLY after comparing the
    # two independent Mainland Chinese COMPONENT glyphs, not simply because
    # there was one catalog component remaining.
    substitution_checks = []
    for pair in form_substitutions:
        source_form = pair["source_form"]
        target_form = pair["selected_form"]
        start, count = pair["start"], pair["count"]
        if len(source_form) != 1 or len(target_form) != 1 or start + count > len(source_paths):
            raise Reject("invalid_single_form_substitution")
        source = donor_strokes(source_form)
        target = donor_strokes(target_form)
        if len(source) != count or len(target) != count:
            raise Reject("form_substitution_stroke_count_conflict")
        score = correspondence(source, target, invert_reference_y=False)
        if score is None or score > 0.045:
            raise Reject("form_substitution_shape_not_equivalent")
        # Compare the proposed source form against the actual OWNED span of
        # this character too, not only against a standalone component image.
        parent_score = correspondence(source, source_paths[start:start+count],
                                       invert_reference_y=False)
        if parent_score is None or parent_score > 0.095:
            raise Reject("form_substitution_parent_shape_conflict")
        substitution_checks.append({**pair, "component_geometry_error": score,
            "parent_geometry_error": parent_score,
            "source_svg":f"svgsZhHans/{ord(source_form)}.svg",
            "selected_svg":f"svgsZhHans/{ord(target_form)}.svg"})
    selected = selected_override if selected_override is not None else catalog[ch]
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
                                 if witnesses else "animcjk_geometrically_verified_form_substitution"
                                 if form_substitutions else "animcjk_source_variant_alignment"
                                 if variants else "explicit_animcjk_component_stroke_counts"),
            "geometry_match_method": method,
            "subglyph_witnesses": donor_checks,
            "source_variant_witnesses": list(variants),
            "form_substitution_witnesses": substitution_checks,
            "source_selected_catalog_alternative": selected.get("source_selected_catalog_alternative"),
            "source_selected_catalog_cut": selected.get("source_selected_catalog_cut"),
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
    prefixed = parse_acjk("厂.⿱一1丿1", "厂")
    assert prefixed["count"] == 2
    assert count_ownership(prefixed, [{"form":"一"},{"form":"丿"}]) == ["一","丿"]
    prefixed = parse_acjk("卩.⿰𠃌1丨1", "卩")
    assert count_ownership(prefixed, [{"form":"𠃌"},{"form":"丨"}]) == ["𠃌","丨"]
    for key,items in [("㐌",["𠂉","也"]),("并",["丷","开"])]:
        counted=contracted_source(COUNTED_CHINESE_CONTRACTIONS[key][0],key)
        assert counted and sum(x["count"] for x in counted["children"])==counted["count"]
        assert count_ownership(counted,[{"form":f} for f in items]) == [
            form for form,count in COUNTED_CHINESE_CONTRACTIONS[key][1] for _ in range(count)]
    donor_test = {"乞": {"acjk": "乞⿱𠂉2乙1"}}
    nested = parse_acjk("吃⿰口3乞3", "吃")
    owners, witnesses, variants = count_ownership(nested,
        [{"form":"口"},{"form":"𠂉"},{"form":"乙"}], donor_test)
    assert owners == ["口"]*3 + ["𠂉"]*2 + ["乙"]
    assert witnesses == [{"form":"乞","start":3,"count":3}] and variants == []
    case = parse_acjk("价⿰亻2介⿱𠆢2⿰丿1丨1", "价")
    got = count_ownership(case, [{"form":"亻"},{"form":"人"},{"form":"丿"},{"form":"丨"}], {"none":{}})
    assert got[0] == ["亻"]*2 + ["人"]*2 + ["丿","丨"]
    assert len(got[2]) == 1 and got[2][0]["source_form"] == "𠆢"
    assert list(x["ids_primary"] for x in catalog_alternatives(
        {"ids_primary":"⿰女𫜹(.);⿰女彐(J)"},{
            "A":{"shape":"女","id":"id-woman"},
            "B":{"shape":"𫜹","id":"id-other"},
            "C":{"shape":"彐","id":"id-pig"}})) == ["⿰女彐"]
    # Substitution plans may be proposed only for explicitly cataloged
    # alternatives with source-only (unregistered) component names.
    test_palette = {
        "a":{"shape":"九","id":"a"},"b":{"shape":"木","id":"b"},
        "c":{"shape":"夂","id":"c"},"d":{"shape":"乂","id":"d"}}
    for char, acjk in [("杀","杀⿱㐅2朩.4"),("杂","杂⿱九2朩.4"),
                       ("条","条⿱夂3朩.4")]:
        spec=DOCUMENTED_SOURCE_FORM_CUTS[char]
        selected={"ids_primary":spec["catalog_cut"],
                  "source_selected_catalog_alternative":spec["catalog_cut"],
                  "component_instances":[{"form":f} for f in (
                      ["乂","木"] if char=="杀" else
                      ["九","木"] if char=="杂" else ["夂","木"])]}
        plans=documented_source_form_plans(char,acjk,parse_acjk(acjk,char),
            {"ids_primary":"original;"+spec["catalog_cut"]},[selected],test_palette)
        assert len(plans)==1 and plans[0][3][-1]["selected_form"]=="木"
    substitution = one_form_substitution(parse_acjk("妇⿰女3彐3", "妇"),
        [{"form":"女"},{"form":"𫜹"}])
    assert substitution[0] == ["女"]*3 + ["𫜹"]*3
    assert substitution[3] == [{"source_form":"彐","selected_form":"𫜹",
                                "start":3,"count":3}]
    try:
        one_form_substitution(parse_acjk("关⿱丷2天4", "关"),
            [{"form":"䒑"},{"form":"大"}])
        raise AssertionError("multiple substitutions passed")
    except Reject:
        pass
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
            plans = []
            primary_error = None
            selected_rows = [catalog[ch]] + catalog_alternatives(catalog[ch], palette)
            source_cut = reviewed_unparsed_source_cut(ch,rows[ch]["acjk"],node,catalog[ch],palette)
            if source_cut is not None:
                selected_rows.append(source_cut)
            for selected in selected_rows:
                try:
                    owners, witnesses, variants = count_ownership(
                        node, selected["component_instances"], rows)
                    if len(owners) != len(graphics.get(ch, [])):
                        raise Reject("source_stroke_count_disagreement")
                    plans.append((owners,witnesses,variants,[],selected))
                except Reject as e:
                    if primary_error is None:
                        primary_error = str(e)
            # A bounded set of already-documented alternatives allows
            # independently shape-verified source-only component forms.
            # These plans remain tentative until each geometry witness passes.
            try:
                plans.extend(documented_source_form_plans(
                    ch, rows[ch]["acjk"], node, catalog[ch], selected_rows, palette))
            except Reject as e:
                if primary_error is None:
                    primary_error = str(e)
            # Geometry-based one-to-one replacement is the final, narrow
            # fallback. Fully source-matched documented alternatives take
            # precedence and never redefine the v0.4 color identities.
            try:
                owners, witnesses, variants, substitutions = one_form_substitution(
                    node, catalog[ch]["component_instances"])
                if len(owners) != len(graphics.get(ch, [])):
                    raise Reject("source_stroke_count_disagreement")
                plans.append((owners,witnesses,variants,substitutions,catalog[ch]))
            except Reject as e:
                if primary_error is None:
                    primary_error = str(e)
            if not plans:
                raise Reject(primary_error or "no_complete_source_ownership_plan")
            eligible[ch] = (node, plans)
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
    for ch, (node, plans) in sorted(eligible.items()):
        xml, reason = outcomes[ch]
        if reason:
            rejected[reason] += 1
            rejected_ch[ch] = reason
            continue
        row = None
        failures = []
        for owners, witnesses, variants, substitutions, selected in plans:
            try:
                row = candidate(ch,node,owners,xml,graphics,palette,catalog,
                                witnesses,variants,substitutions,selected)
                break
            except (ET.ParseError, Reject, ValueError) as e:
                failures.append(str(e) or "invalid_chinese_svg")
        if row is None:
            reason = failures[0] if failures else "no_verified_source_plan"
            rejected[reason] += 1
            rejected_ch[ch] = reason
        else:
            recovered.append(row)
    # A documented alternate cut may be well-supported geometrically yet
    # deliberately use *different* component identities than the selected
    # first-1000 catalog cut. It belongs in a separate review dataset until
    # both the renderer and the Direct/Marker cards select the same cut.
    # Never count such SVGs as mapped while catalog presentation disagrees.
    review = [item for item in recovered if item.get("source_selected_catalog_alternative")
              or item.get("source_selected_catalog_cut")]
    accepted = [item for item in recovered if not item.get("source_selected_catalog_alternative")
                and not item.get("source_selected_catalog_cut")]
    base["catalog_alternative_review_candidates"] = review
    base["catalog_alternative_review_count"] = len(review)
    base["candidates"].extend(accepted)
    base["accepted_count"] = len(base["candidates"])
    base["animcjk_revision"] = REV
    base["animcjk_admitted_count"] = len(accepted)
    base["animcjk_rejected_reasons"] = dict(sorted(rejected.items()))
    base["animcjk_rejected_characters"] = rejected_ch
    Path(args.candidates).write_text(json.dumps(base, ensure_ascii=False, indent=2) + "\n",
                                    encoding="utf-8")
    print("AnimCJK eligible source counts:", len(eligible), "of", len(missing)-len(existing))
    print("AnimCJK newly admitted candidates:", len(accepted))
    print("AnimCJK catalog-alternative review only (not in Direct/Marker):",
          "".join(item["character"] for item in review))
    print("AnimCJK verified catalog alternatives:",
          "".join(row["character"] for row in recovered if row["source_selected_catalog_alternative"]))
    print("AnimCJK verified form substitutions:",
          "".join(row["character"] for row in recovered if row["form_substitution_witnesses"]))
    print("AnimCJK source-only variant recoveries:",
          "".join(row["character"] for row in recovered if row["source_variant_witnesses"]))
    print("AnimCJK verified nested donor recoveries:",
          "".join(row["character"] for row in recovered if row["subglyph_witnesses"]))
    print("AnimCJK new characters:", "".join(row["character"] for row in accepted))
    donors = ["𠤎","卩","丬","刂","礻","彐","才","月","厂","士","朩","亠","土","艮","犬","㐌","𠆢","㓁","犮","𠀉","𠫓","𰀁","亼","匸","㐅","𠄌"]
    for form in donors:
        if form in rows:
            print("AnimCJK donor source:", form, repr(rows[form].get("acjk", "")))
    print("AnimCJK rejection summary:", dict(rejected))
    print("AnimCJK rejection stage audit:",
          {"donor_parse":sum(n for key,n in rejected.items() if key.startswith("donor_parse_")),
           "geometry":sum(n for key,n in rejected.items() if "geometry" in key),
           "component_identity":rejected.get("component_name_disagreement",0)})
    for reason, total in sorted(rejected.items(), key=lambda pair: (-pair[1],pair[0])):
        cases = [(ch, rows.get(ch, {}).get("acjk", ""))
                 for ch, why in sorted(rejected_ch.items()) if why == reason]
        print(f"AnimCJK research queue [{reason}] ({total}):",
              " ".join(f"{ch}:{source[:90]}" for ch, source in cases[:55]))

if __name__ == "__main__":
    main()
