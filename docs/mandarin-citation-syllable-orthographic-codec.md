# First-tranche structured citation-syllable grammar (v0.1)

This is a **complete orthographic citation-token grammar for the pinned first 1,000 characters**, not a phonetic or phonemic Mandarin decoder. It combines three distinct channels without claiming that their spelling structure corresponds one-to-one with speech:

- An initial token encoded as a reversible *provisional* place/manner/aspiration tuple, or as an explicit orthographic-only `y`, `w` or zero-onset marker.
- An exact one-of-33 **written final remainder** from the published citation source. It is not an IPA vowel target, a validated rhyme inventory or an independently reviewed articulation.
- The source tone category 0–4, with no sandhi or fixed neutral-tone pitch assertion.

The source-first grammar permits precisely the **673 distinct initial/final/tone triples actually observed among 1,171 pinned citation readings**. It rejects an unknown initial, unobserved combination, altered tone-mark placement, unexpected serialized field, or a final token outside the published 33-entry spelling palette. Each record reconstructs its original NFC accented Pinyin `display` and its exact initial/final/tone/glide structure. No expansion to the wider Mandarin syllable inventory is claimed.

The machine audit is `data/phonetics/citation-syllable-orthographic-codec-audit-v0.1.json`; the JavaScript codec lives in `tools/glyph-pipeline/citation_syllable_orthographic_codec.mjs`. Both `--check` and regression fixtures are invoked by the GitHub Pages build. It joins the previously published orthographic citation codec with the provisional initial feature codec. No generated sentence text, dictionary definitions, or participant data are stored.

**Remaining science:** independently establish phonological and IPA reference conventions for finals, distinguish allophones from lexical contrasts, validate expert feature assignments and test human decoding before declaring this an actual language sound notation.
