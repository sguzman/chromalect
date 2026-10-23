# Independent-corpus word-surface candidate acquisition

This one-time, read-only [GitHub Actions workflow](../.github/workflows/tatoeba-word-surface-intake.yml) takes the [eight publisher-documented Mandarin word leads](mandarin-dictionary-word-surface-leads.md), downloads one official Tatoeba Mandarin snapshot, scans for exact multi-character written sequences, and retains at most five deterministically selected sentence IDs per source word.

The [extractor](../tools/glyph-pipeline/tatoeba_word_surface_intake.mjs) uses SHA-256 hashes of `lead ID + sentence ID` for an order-independent bounded choice, and records contributor credit, sentence source link, and sentence text digest **without reproducing any sentence text**. It intentionally performs no word segmentation, does not check a contextual Pinyin reading, and does not claim either lexical or pictogram comprehension approval.

A literal match with e.g. 长大 or 刨坑 may be a better candidate for later linguistic review than a one-character match, but substring occurrence alone is not a verified word occurrence or source-attested modern Mandarin reading. Check source permissions and independently review word boundaries and usage before quoting or accepting an example.

The two existing per-character source-ID cohorts remain unchanged; results from this separate word-surface experiment will be versioned and compared without merging or rewriting them.
