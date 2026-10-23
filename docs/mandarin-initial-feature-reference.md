# Working Mandarin Pinyin-initial articulatory contrast reference (v0.1)

This **provisional feature codebook** inventories the 24 initial spelling tokens in the pinned 1,171 citation-reading records. It distinguishes 21 conventional Mandarin consonantal initial spellings from the orthographic conventions **y**, **w** and **∅**. Every cited reading retains the original spelling, tone and palette color. This comparison changes no production pronunciation assignments.

For the 21 consonantal categories, the codebook supplies one broadly conventional IPA candidate and separately marked **place**, **manner** and **aspiration** properties. Six contrast pairs (b/p, d/t, g/k, j/q, zh/ch and z/c) differ by aspiration rather than the English voiced/unvoiced letter distinction. The feature tuples are designed to be distinguishable within a future *provisional* featural visual notation; tuple uniqueness is not proof of a psychologically meaningful or independently certified phoneme analysis. The ambiguity for the r initial (approximant/fricative variants) and h initial (velar/other fricative realizations) is explicit.

## References

- [Indiana University, Pronunciation Guide for Pinyin Transcription](https://scholarworks.iu.edu/bitstreams/248cccaa-1147-443e-845a-7c8a9b4e8ac8/download) — conventional 21-initial pedagogical scheme
- [University of Minnesota, Mandarin Initials in IPA](https://conservancy.umn.edu/bitstreams/b7375f7e-667b-4879-a32b-ffe21217dc34/download) — broad sound correspondence and orthographic glide caveat
- [University of Georgia, Mandarin Loanword Phonology](https://openscholar.uga.edu/record/18743/files/loggins_nathan_201005_ma.pdf) — aspiration and series distinctions
- [University of Texas, Pitch Perfect Pinyin: r](https://www.laits.utexas.edu/ppp/learning.php?unit=8) — r sound guidance and voicing

This is a reference for experimental contrast encoders only. It does not purport to freeze the full segmental phonemic inventory, to map all Mandarin finals, or to verify a single word-context pronunciation. Independent expert review and tests of decoding are separate gates.

Machine-readable data: `data/phonetics/mandarin-initial-feature-candidates-v0.1.json`. Source-alignment test: `node tools/glyph-pipeline/mandarin_initial_feature_candidates_smoke.mjs`.
