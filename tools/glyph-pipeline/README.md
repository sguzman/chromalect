# Component-colored glyph pipeline

This Rust tool validates the source-aligned stroke assignments in
[`colored-strokes-v0.1.json`](../../data/catalog/colored-strokes-v0.1.json),
checks exact component identity/color matches against the immutable v0.4 palette,
and generates a deterministic SVG for each mapped character.

From the repository root:

```sh
cargo run --manifest-path tools/glyph-pipeline/Cargo.toml -- check
cargo test --manifest-path tools/glyph-pipeline/Cargo.toml
cargo run --manifest-path tools/glyph-pipeline/Cargo.toml -- build
```

`build` creates the curated 12-glyph SVG gallery from the committed dataset.
The deployment process additionally runs `discover` against pinned Make Me A Hanzi
sources, generating 865 source-derived candidates in the current pinned build. It then augments eligible
character atlas cards with SVG links, adds paginated browsing and reverse
component-to-character pages under `site/glyphs/by-component/`, along with a
machine-readable `site/glyphs/coverage.json` and an unmapped-character browser.
The current production build colors 870 of the 1,000 cataloged characters:
594 multicomponent and 276 whole-component glyphs. Generated
outputs are assembled in CI and are not committed as manually edited HTML.

## Upstream geometry verification

The source geometry is pinned to upstream Hanzi Writer Data commit
`68d10a4b21150cae5e1ebbd223eed289cf32d90c`.

```sh
mkdir -p /tmp/chromalect-hanzi-writer
cargo run --quiet --manifest-path tools/glyph-pipeline/Cargo.toml -- sources |
  while IFS="$(printf '\t')" read -r name url; do
    curl -fsSL "$url" -o "/tmp/chromalect-hanzi-writer/$name"
  done
cargo run --manifest-path tools/glyph-pipeline/Cargo.toml -- verify-source /tmp/chromalect-hanzi-writer
```

GitHub Actions runs this check automatically; no user setup or downloads are
needed to publish the site.

## Acceptance criteria for additional glyphs

1. Record source geometry and its attribution, preserving the indexing required to associate each outline with a source component. These indices are **not** a handwriting-order feature.
2. Map every stroke to an explicit component ID defined in v0.4. All stroke colors
   must be the palette color for the owner.
3. Record the decomposition and parts, distinguishing repeated instances (for
   example, the two `木` forms in `林`).
4. Confirm the geometry against the pinned upstream source; reject missing,
   reordered, changed, or partial stroke arrays.
5. Independently review component ownership visually before treating a
   candidate as established. Matching stroke counts alone is not a
   certification of component boundaries.

`check` and `verify-source` are deterministic integrity checks. They
**do not independently certify the linguistic correctness** of a stroke-to-component
assignment. The curated v0.1 dataset explicitly remains source-aligned, not
independently certified. Never auto-fill unknown owners.

The input sources have their own licenses (see
[third-party notices](../../THIRD_PARTY_NOTICES.md)); the repository MIT license
does not replace those obligations.

## Automated expansion

The importer consumes the line-delimited JSON `dictionary.txt` and
`graphics.txt` datasets from pinned Make Me A Hanzi commit
`bddc96d41bef78427ed0e034e9f7e31d71fd1b92`.

First-tranche characters with compatible left-right, top-bottom, nested,
ternary, or enclosing IDS decompositions are accepted only when **every stroke**
has an exact terminal-leaf path in the pinned source, and each leaf has a
unique v0.4 identity present in the catalog. Atomic-recognizer entries may be
colored as one whole component when the component form exactly equals the
character. Unrecognized shapes, unowned overlapping stroke paths, unknown fragments,
missing ownership, ambiguous paths, and incomplete outlines are excluded.
The entire outline path array must be present and use accepted vector commands.

The [hierarchical alignment manifest](../../site/glyphs/hierarchical-derivations.json) lists 73 cases where an independently sourced subglyph decomposition and source vector outlines support a finer catalog component cut. Each transfer requires matching subglyph stroke counts, explicit local component paths, a unique component owner per stroke, and restricted normalized outline-position differences. These transfers are automated research candidates, not independent visual certification. No stroke ownership is inferred for unresolved strokes.

The [glyph mapping manifest](../../site/glyphs/mappings.json) records each active glyph's component identities, colors, SVG path owners, provenance and source revisions as portable machine-readable data. Path indexes represent geometry-to-component correspondence, not handwriting instruction.

The [source alternative comparison gallery](../../site/glyphs/alternatives/index.html) currently contains 8 complete stroke-source decompositions that are documented catalog alternatives but use a different component identity set. These are not promoted into Direct or Marker mode. The [unknown-source gallery](../../site/glyphs/unknown-components/index.html) shows 27 research candidates with confirmed owned strokes colored and every unresolved stroke in neutral gray. Neutral gray is a review fill, **not a 514th component color**. Both galleries are excluded from official renderer coverage.

Generated outputs include `site/glyphs/diagnostics.json` with per-character source/canonical disagreements, plus paginated `site/glyphs/review/` sheets comparing native and source-aligned appearances. Simple spatial placement checks and close-pair OKLab distances (below 0.07) are advisory only and do not certify accuracy. The generated [priority contact sheet](../../site/glyphs/review/flagged.html) highlights 16 glyphs under the current source and palette combination; this does not change any v0.4 color assignments.

The importer uses the source-provided stroke assignment for each path. It does
not algorithmically infer ownership from stroke coordinates. Source alignment
is still not an independent visual/linguistic audit.

The two upstream data files are fetched automatically by the Pages workflow;
visitors do not download those source files. A separate integrity workflow
exercises the same import process before deployment.
