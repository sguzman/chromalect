# First-1,000 Mandarin stroke-ownership evidence gate

## Current source-backed coverage

**Verified October 21, 2026 milestone:** **1,000/1,000 first-tranche Mandarin glyphs** have machine-auditable component-colored outlines (**724 multicomponent; 276 atomic; 0 unmapped**). GitHub Actions successfully ran **48 Rust tests**, source-alignment verification, the catalog/Marker/Direct identity audit on all 1,000 cards, and the exact coverage gate. The active additive palette is **mandarin-component-identity@0.6.0 (520 IDs)**; the first 518 identities remain byte-for-byte equivalent in form/color to v0.5, including the immutable first 513 v0.4 IDs. [Verified deployment](https://github.com/sguzman/chromalect/actions/runs/39684189864).

The original pinned Make Me a Hanzi source importer alone colors **870/1,000** catalog characters; independently sourced and geometry-corresponded Chinese HanziVG and AnimCJK ZhHans evidence, including documented source-selected catalog cuts and newly versioned component identities, resolves the other **130**. Each automated mapping carries source revisions, component ownership IDs and a review qualification. Source-derived candidate status is **not independent visual or linguistic certification**. The original Chinese glyph outlines remain the published drawing source; Chinese evidence SVGs are not silently substituted.

The generated [coverage JSON](https://sguzman.github.io/chromalect/glyphs/coverage.json), [source diagnostics](https://sguzman.github.io/chromalect/glyphs/diagnostics.json), [hierarchical mapping records](https://sguzman.github.io/chromalect/glyphs/hierarchical-derivations.json) and [review gallery](https://sguzman.github.io/chromalect/glyphs/hierarchical.html) are the machine and visual record of the currently accepted mappings.

## Historical unresolved records and their resolution

Before the secondary sources were integrated, **130** records were outside the baseline importer. The following is the *historical diagnostic grouping*, retained to explain the research path. **None remain unmapped in the current first-tranche build.**

| Reason | Records | Required resolution |
| --- | ---: | --- |
| Unresolved source components | 55 | Obtain component-aware stroke ownership finer than the source's named subglyph, or a separately auditable matched geometric source |
| Source and catalog decomposition disagreement | 32 | Verify which decomposition and graphic-component identities are appropriate for the actual Chinese glyph without silently changing v0.4 identity semantics |
| Unidentified components in source | 32 | Determine the unresolved source parts from independent cited geometry rather than inferring a color from surrounding strokes |
| Documented catalog alternatives | 8 | Compare the source-selected alternative with the catalog's primary cut and present a clearly versioned selection policy if admitted |
| Overlapping structures | 3 | Validate complete stroke ownership where geometric elements overlap; do not assume visual intersections constitute separate owned paths |

The earlier 6 HanziVG group candidates are **介、同、场、希、每、走**. HanziVG Chinese-verified source-groups and catalog-selected component identities agree, and their indexed centerline paths are normalized and cross-checked against the unchanged Make Me a Hanzi outlines. The second-pass review recorded 101 missing Chinese-verified HanziVG SVGs, 22 catalog/group disagreements, and one geometric disagreement (右); none was silently promoted. A bounded unique-bijection fallback also rejects 右 without sufficient evidence. The generated [HanziVG provenance manifest](https://sguzman.github.io/chromalect/glyphs/hanzivg-transfers.json) records admitted matches and methodology. Automated acceptance is **not** independent visual certification.

**AnimCJK simplified Chinese**: pinned `dictionaryZhHans.txt` contains per-component stroke-count decomposition; `svgsZhHans/` supplies regional Chinese outline comparison under its separate Arphic Public License. Only catalog-consistent source ownership is transferred onto the original Make Me a Hanzi geometry, requiring same-index or unique geometric correspondence. Source-named subglyphs can be split only with a second independently matched Chinese donor glyph. The final additions are automated source-supported candidates, **not independent visual certification**. Provenance distinguishes exact source-count cuts, nested donor correspondences, contextual geometric deformations confined to named characters, verified source variants, and one intra-component source-stroke permutation. The strict production CI gate now requires exactly **1,000/1,000** mapped and checks consistency with the active v0.6 palette. Uncertainty remains explicit in independent-review status rather than being misreported as missing SVG coverage.

A complete graphic outline alone does not establish which component owns each stroke. Nor does a component inventory that merely names the parts without associating them with individual vector paths.

## External evidence surveyed

**Make Me a Hanzi**: the pinned dictionary provides IDS and indexed per-stroke ownership; its graphics file provides the matching SVG outlines. Hierarchical recovery requires a separately recorded decomposition of a named subglyph, exact source-path counts, and normalized source-outline correspondence. These tests recover 73 additional catalog characters in the current build. See the existing source and license notices.

**Hanzi stroke data** ([bovacu/hazi_custom_stroke_data](https://github.com/bovacu/hazi_custom_stroke_data), revision `05c4c917218b0cc63f1c2b0d7d909dffac4d690c`): this dataset publishes 9,574 characters and BabelStone-derived IDS component labels under the Arphic Public License. Its XML component labels are listed as self-closing group elements preceding a character's paths, not necessarily nested groups owning specific paths. It is useful for comparing proposed component sets, but a list of components is **not** sufficient evidence for assigning a color to each stroke. The dataset has **not** been imported into the active renderer.

**HanziVG / KanjiVG** ([HanziVG](https://github.com/Connum/hanzivg), [KanjiVG format](https://kanjivg.tagaini.net/svg-format.html)): these sources supply SVGs with structural groups around stroke paths. Chinese variant compatibility, the reliability of each grouping, and **CC BY-SA 3.0** attribution/share-alike obligations must be evaluated before any grouped vector artwork is adopted. Japanese glyph variants must not silently replace Mainland simplified Chinese forms. The independently grouped, Chinese-reviewed HanziVG `hanzi/` evidence **has now been integrated only for six validated candidates**; KanjiVG fallback files and HanziVG centerline artwork are not embedded in active renderer output. See [third-party notices](../THIRD_PARTY_NOTICES.md) for separate licensing.

## Final source reconciliation examples

- **印 / 拔:** the pinned source names whole forms `𠀉` and `犮`, whose contextual stroke counts or internal historical cuts do not agree with the original expanded catalog. Active v0.6 assigns each whole form its *own new graphic-component ID* instead of inventing a smaller unverified path split; the original catalog cut remains recorded.
- **合 / 坐 / 巫 / 邻:** source-declared nested donor stroke spans match the full Chinese glyph outlines; their independently rendered standalone donors undergo strict, specifically measured contextual deformation checks. These remain candidates pending expert review, not generalized shape-equivalence rules.
- **肠:** the pinned simplified-Chinese source and the original renderer differ only in the order of two right-component strokes. Source indexes 5 and 6 are exchanged **within** the same `𠃓` ownership group, restoring a 0.01036 mean normalized outline-geometry error under the ordinary strict whole-glyph threshold, with no color-identity change.


## Completion requirements

- Every displayed **Direct** component fill must be linked to a recognized palette identity and a defensible set of source-owned outline paths; **Marker**, catalog, and ontology identities must match the chosen cut.
- Unknown and alternate analyses retain distinct review states until source and catalog conflicts are resolved.
- The drawing source, permitted license, component ownership method, and independent review status remain separately identifiable in the machine-readable output.
- The first-1,000 coverage gate is satisfied only when **1,000 characters have supported component-colored glyph geometry** and the coverage report agrees with the renderer. Automated correspondence is not equivalent to independent shape verification.
- No new language profile or central registry membership is implied by this work.

**Coverage milestone achieved:** all 1,000 have reproducible source-aligned colored geometry. **Research qualification remains:** these are automatically reviewed source correspondences, not a claim that independent expert visual/linguistic review or a learning-effectiveness study has been completed.
