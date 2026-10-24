# Original GF 0014 descriptive-component name and position audit

## Primary source

The original [GF 0014-2009 public standard reproduction](https://www.unicode.org/irg/docs/n2739-GF0014-2009.pdf), hosted by Unicode's Ideographic Research Group, contains an illustrated list of **514 components** over **441 groups** on printed pp. 7–20. Unlike Unicode IDS notation, the table's first column contains *drawn component forms* and the name column identifies these by reference to source characters and their usual position in those characters.

Chromalect's third-party component transcription encodes **30** of its 514 forms as descriptive IDS-style strings rather than Unicode glyphs. A previous [index review](../data/research/gf0014-official-descriptive-row-locations-v0.1.json) established the printed ordinal, group and source page for each such entry. The present [primary-source name/role ledger](../data/research/gf0014-descriptive-name-role-evidence-v0.1.json) separately records the published **base character and structural position** for each of those **30** entries, after direct visual inspection of the scanned source table.

The source identifies, for example, descriptive components by their relationship to characters such as **奥** (top), **北** (side), **庚** (center), **黎** (right corner), **共** (bottom), **衰** (middle), and **鸟** (abbreviated form). These labels are normalized as source-name relationships in a compact data record, *not* presented as a substitute for source glyph geometry. No page image or official table is redistributed.

## Evidence and acceptance boundary

**Now corroborated for all 30 described rows:** each original-standard printed ordinal, group, name base character, component positional role and printed/PDF source-page location. Source and catalog identities are linked exactly. The [regression check](../tools/glyph-pipeline/gf0014_descriptive_name_role_smoke.mjs) locks these 30 source-name assertions and rejects mismatched component ordinals, groups, IDS expressions, source pages or unsupported shape approvals.

**Still unapproved:** equivalence of any third-party brace-delimited IDS string to the *exact illustrated original component form*, stroke count, geometry, licensed vector paths, and independent reviewer certification. The publication's name label alone is not a drawable definition. Nothing in this audit claims all 514 catalog glyphs have been independently checked.

Measured research state: **30/30 name and positional-role table cells reviewed**, **0/30 exact-shape approvals**, **0** recovered official licensed outline vectors, **0** independently certified geometries, and **0/514** complete-form-transcription approvals.

This advances the existing Phase 0 authoritative transcription/geometry checkpoint without closing it or changing any active Mandarin colors or SVGs.
