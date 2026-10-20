# Component-colored glyph pipeline

This Rust tool validates the source-aligned stroke assignments in
[\`colored-strokes-v0.1.json\`](../../data/catalog/colored-strokes-v0.1.json),
checks exact component identity/color matches against the immutable v0.4 palette,
and generates a deterministic SVG for each mapped character.

From the repository root:

\`\`\`sh
cargo run --manifest-path tools/glyph-pipeline/Cargo.toml -- check
cargo test --manifest-path tools/glyph-pipeline/Cargo.toml
cargo run --manifest-path tools/glyph-pipeline/Cargo.toml -- build
\`\`\`

The build creates \`site/glyphs/U+XXXX.svg\` and \`site/glyphs/index.html\` from
data, without manually editing each SVG or changing the existing character atlas.

## Upstream geometry verification

The source geometry is pinned to upstream Hanzi Writer Data commit
\`68d10a4b21150cae5e1ebbd223eed289cf32d90c\`.

\`\`\`sh
mkdir -p /tmp/chromalect-hanzi-writer
cargo run --quiet --manifest-path tools/glyph-pipeline/Cargo.toml -- sources |
  while IFS="$(printf '\t')" read -r name url; do
    curl -fsSL "$url" -o "/tmp/chromalect-hanzi-writer/$name"
  done
cargo run --manifest-path tools/glyph-pipeline/Cargo.toml -- verify-source /tmp/chromalect-hanzi-writer
\`\`\`

GitHub Actions runs this check automatically; no user setup or downloads are
needed to publish the site.

## Acceptance criteria for additional glyphs

1. Record source geometry and its attribution, with all strokes in original order.
2. Map every stroke to an explicit component ID defined in v0.4. All stroke colors
   must be the palette color for the owner.
3. Record the decomposition and parts, distinguishing repeated instances (for
   example, the two \`木\` forms in \`林\`).
4. Confirm the geometry against the pinned upstream source; reject missing,
   reordered, changed, or partial stroke arrays.
5. Independently review component ownership visually before treating a
   candidate as established. Matching stroke counts alone is not a
   certification of component boundaries.

\`check\` and \`verify-source\` are deterministic integrity checks. They
**do not independently certify the linguistic correctness** of a stroke-to-component
assignment. The curated v0.1 dataset explicitly remains source-aligned, not
independently certified. Never auto-fill unknown owners.

The input sources have their own licenses (see
[third-party notices](../../THIRD_PARTY_NOTICES.md)); the repository MIT license
does not replace those obligations.
