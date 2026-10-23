# Integrated Mandarin citation annotation experiment (v0.1)

This deliberately bounded layout proof presents **one unmodified Chinese character in a fixed native-font cell**, with its independently selectable *source citation* initial token, written final remainder, and idealized citation-tone contour outside the original character. The three channels can be switched off separately. Displaying existing palette colors is optional and does not change component colors, glyph outlines, or the pronunciation source.

The visual experiment is separate from Chromalect's production atlas. It can display all 1,000 characters and 1,171 listed readings, including multiple citations for the same character. The native character, annotated reading, and source provenance remain distinct. No Tatoeba word-context pronunciation or lexical approval is inferred. T0 intentionally has no fixed pitch contour, and the connected-speech realization of other tones remains unadjudicated.

The [static site prototype](../site/mandarin-citation-cell.html) uses the pinned provisional initial-feature source, the full orthographic citation grammar audit, the citation contour reference, and unchanged presentation palette domains. Source and nonapproval checks must pass before presentation. A browser regression checks individual channel toggles, palette isolation, rank selection, neutral-tone handling and refusal of fabricated study counters.

**Evidence still needed:** independently reviewed phonological reference notation (especially finals), usability/legibility testing on real character sizes, accessibility, and a preregistered human decoding study. Implementing the interactive layout is not equivalent to satisfying those scientific acceptance gates.

An optional v0.1 addition displays the [reversible nine-primitive written-final control](../data/phonetics/written-final-symbol-control-v0.1.json) in the external final annotation panel. The original Pinyin label remains visible and the native Hanzi remains untouched. This arbitrary letter-shape baseline is not an IPA code, a final-phoneme decomposition, or an observed learning outcome.

The integrated cell optionally shows the **same proposed place/manner/aspiration initial geometry** as the separate initial-category comparison view. A Pages regression verifies the source SVG path dictionaries match exactly; y/w/zero spellings deliberately display no consonant figure. The shapes remain provisional category encodings, not independently validated symbols or pronunciations.

The integrated experiment also includes an **optional six-simple-final vowel-feature hypothesis** display, separate from its literal geometric written-letter code. It visualizes only the six sourced pedagogical simple finals using unapproved height/backness/rounding placement, and refuses to infer a compound-final feature. Source spellings in warning contexts remain explicitly qualified. This is not IPA or a human reading-comprehension result.
