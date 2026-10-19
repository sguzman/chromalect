# Mandarin research baseline

## Scope

- **Spoken language:** Mainland Standard Mandarin (Putonghua), not an attempt to encode every local feature of Beijing speech.
- **Written variety:** modern standard written Chinese.
- **Script:** simplified characters first; traditional variants preserved as a future mapping dimension.
- **Pronunciation display:** Hanyu Pinyin including tone marks.
- **Phonological reference:** explicitly documented IPA transcription conventions, not invented approximations.

Chinese language varieties (Mandarin, Cantonese/Yue, Wu, Min, Hakka, etc.) should not be silently treated as interchangeable dialect spellings. Cross-language extension is a later study.

## Building blocks to distinguish

**Dictionary radicals:** one indexing tradition, not the inventory of everything colored.

**Structural components:** recurring character pieces. One character may have nested components; a chosen decomposition level must be frozen for a test.

**Whole characters:** some components stand alone as characters; assign their own readings and lexical uses independently.

**Words and phrases:** often multi-character; meaning and pronunciation need contextual analysis rather than character-by-character guesses.

**Glyphs and shape variants:** displayed form depends on font and regional standards. Shape-based outlines and stroke mapping are not solved by text-level decomposition alone.

## Pronunciation

A common teaching analysis names 21 consonantal initials (b p m f d t n l g k h j q x zh ch sh r z c s), plus zero-onset syllables. The set of finals and resulting syllables varies with the analysis. No exact final-inventory size is frozen for Chromalect yet.

Four lexical tones plus a neutral-tone category form the immediate tonal teaching target. Surface pronunciation can differ because of sandhi and lexical context.

Examples:
- 清 qīng: 氵 + 青; water-associated semantic clue and a phonetic-series clue.
- 情 qíng: 忄 + 青; mind/heart association and the same historical phonetic-series component.
- 请 qǐng: 讠 + 青; speech association and the same series.
- 晴 qíng: 日 + 青; sun association and the same series.
- 妈 mā: 女 + 马; female-associated component and 马 phonetic series.
- 孩 hái: 子 + 亥; child association and phonetic series.

These examples are **candidate analyses to verify and source in the specimen registry**, not a declaration of complete accurate decomposition at the stroke level.

## Required research before implementation

1. Select a reference decomposition standard and record its scope: indexing radicals, modern component lists, and ideographic description sequences are different resources.
2. Choose a normalization policy for component variants (e.g. 水 / 氵), informed by actual learning goals.
3. Establish a source-of-truth list for citation readings and morphological/lexical segmentation.
4. Confirm stroke geometry data and rights to redistribute it.
5. Define and validate the phonetic target inventory and contextual reading rules.
6. Only then generate a first small color registry and a series of test specimens.

**No dataset or component count is yet adopted as normative.** A bounded study corpus is preferable to prematurely claiming exhaustive coverage.
