# Potential references and licensing review

**Status:** candidate inventory, not dependencies. No external data has been copied into this repository.

## Standards and lexical/phonetic references

- [Unicode Unihan](https://www.unicode.org/reports/tr38/) — character-level properties and database conventions; inspect exact field provenance and license/terms before redistribution.
- [Unicode Ideographic Description Characters](https://www.unicode.org/charts/PDF/U2FF0.pdf) — structural operators for ideographic descriptions; does not itself declare historically semantic or phonetic roles.
- [GF 0014-2009, modern common-character components](https://www.google.com/search?q=GF+0014-2009+Chinese+character+components) — a candidate mainland component reference; verify authoritative text, scope, rights, and classifications before adopting an inventory.
- [International Phonetic Association](https://www.internationalphoneticassociation.org/) — phonetic feature categories and IPA conventions; distinguish descriptive reference from rights to reproduce chart artwork.
- [CC-CEDICT](https://cc-cedict.org/wiki/) — lexical Mandarin readings/definitions; confirm current license and update procedure before use.

## Character decomposition / geometry datasets

- [Make Me a Hanzi](https://github.com/skishore/makemeahanzi) — character dictionary and stroke geometry for many common characters. Its dictionary and graphics files **have different upstream licensing**; examine its COPYING file before reuse. Do not assume MIT.
- [CJKVI-IDS](https://github.com/cjkvi/cjkvi-ids) — ideographic description sequences with dataset-specific constraints; much data is GPLv2 or derived from CHISE, so do not import wholesale under this repository's MIT license.
- [CHISE](https://www.chise.org/) — character structure and variant research, with rights needing independent review.

## Source intake protocol

For every third-party dataset actually adopted, record:

1. Source URL, revision/release/commit, retrieval date, author and license text.
2. Exact subset of fields and whether they come from another upstream source.
3. Permission to copy, modify, redistribute, and publish derived SVG/stroke data.
4. Attribution, provenance, required notices, and compatibility with intended distribution.
5. Accuracy limitations, script variants, and non-unique analyses.
6. Update and revalidation strategy.

**MIT applies to original Chromalect material only; it does not relicense external corpora, graphics, or fonts.** Links are informational, not permission grants.

The initial research work can proceed using short independently authored and checked specimens; full corpus import is not a prerequisite.
