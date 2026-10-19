# Terminology

Precise distinctions matter because mixing the levels produces convincing-looking but wrong renderings.

- **Grapheme:** minimal distinctive unit of a particular writing system; not automatically the same thing as a phoneme.
- **Character:** a written unit such as Chinese 清 or Latin a; Unicode code points, rendered glyphs, and linguistic characters are not interchangeable concepts.
- **Glyph:** a visual realization of a written character in a font or rendering system.
- **Radical (部首):** indexing class or character component used by a particular dictionary classification; not an exhaustive inventory of character parts.
- **Component (部件):** a recurring structural unit of a character; may have semantic, phonetic, other, or uncertain role in a particular composition.
- **Variant / normalized component:** a displayed component shape and its deliberately chosen shared identity (e.g. 水 and 氵 might be related yet not automatically identical for every experiment).
- **Identity color:** the unique, stable palette assignment of a normalized component ID.
- **Semantic family:** a grouping of components by documented meaning or origin, encoded through a related palette region.
- **Component role:** what a specific component does *in a specific character*; distinct from the component's stable identity.
- **Phonetic component:** part of a historical character formation that contributed a pronunciation clue; it may not match modern speech.
- **Phoneme:** contrastive speech-sound category within a language.
- **Phone:** a concrete phonetic sound realization.
- **Articulatory feature:** place, manner, voicing, aspiration, height, backness, rounding, etc.
- **Initial/final:** conventional syllable decomposition in Mandarin phonology. Useful for teaching, but not necessarily the primitive unit of a universal notation.
- **Rime:** phonological nucleus and possible coda; not always equivalent to a Pinyin spelling.
- **Tone:** contrastive pitch category; actual contours vary with context.
- **Citation reading:** dictionary form of a character's pronunciation, before contextual processes.
- **Surface reading:** how a character or word is pronounced in a specific utterance.
- **Polyphonic character:** a character with multiple conventional readings, often conditioned by lexeme or context.
- **Word segmentation:** identifying word units from a stream of characters.
- **Encoding channel:** independently decodable visual property (fill, shape, contour, placement, border, motion, etc.).
- **Reversible overlay:** a visual augmentation that can be disabled without losing or mutating the underlying source text.
- **Featural code:** a writing notation whose glyph design systematically reflects the speech distinctions it represents.
- **Specimen:** precisely specified example text and its verified analysis, used to compare renderers or visual schemes.
- **Experiment revision:** an immutable or explicitly versioned snapshot of a hypothesis, mappings, test data, and evaluated outputs.

**Warning:** semantics is not inherent in all alphabetic letters, and not all Chinese components have a recoverable semantic or phonetic role. Unknown must remain a valid annotation.
