# Phonetic encoding: the open research problem

**Objective:** design a visually compact, genuinely *decodable* notation for pronunciation, ideally drawable inside a character cell without distorting the original glyph.

A tone contour is straightforward. Encoding **segmental sound** is harder. A mere outline around a historical phonetic component tells the learner that a sound clue exists; it says nothing exact about the sound.

## Baseline

Use standard linguistic transcriptions as ground truth, with language-specific phonological analysis. For Mandarin, keep Hanyu Pinyin for learner display and IPA (with declared conventions) for analytical comparisons. Pinyin spellings are not a one-to-one universal inventory of speech sounds.

## Candidate approaches (unsettled)

**A. Literal spelling:** small Pinyin or IPA within/outside the glyph cell. Reliable and immediately decodable, but information is redundant with literacy in that notation; may be visually crowded.

**B. Syllable inventory:** one symbol per attested Mandarin syllable (tone external). Decodable after memorizing a large table; poor multilingual transfer.

**C. Initial + final:** conventional Mandarin syllable coding. Compact, but decomposition can feel arbitrary and finals themselves have internal structure; likely Mandarin-specific.

**D. Featural construction (preferred to TEST, not to assume):** build one continuous-looking sound glyph from articulatory features. Geometric base encodes consonant place/manner, modifications encode aspiration/voicing, an internal vowel field encodes height/backness/rounding, transitions encode diphthongs, terminal marks encode codas, and a contour encodes tone.

**E. Articulatory/motion layer:** show a timed sound trajectory rather than static marks alone. Could complement option D; its reading usefulness remains untested.

## Why initial/final is not the final architectural commitment

Mandarin pedagogical analysis often uses around 21 initial consonant categories and roughly three dozen finals, depending on treatment of medials and special cases, with several hundred base syllables before tone. These are useful *inventory sizes*, not proof that speech needs 21 + 39 independent shapes.

A general phonetic system should express features that recur across languages. The design must eventually represent vowels without consonantal onsets, different syllable shapes, consonant clusters, vowel length, nasalization, tone, stress, and context-conditioned sounds.

## Minimal round-trip proof

For each specimen:

1. Start from a verified reading (Pinyin + agreed phonological representation).
2. Construct the visual sound symbol using a published, versioned set of rules.
3. Ask a reader or decoder with only those rules to reconstruct the original phonological sequence.
4. Compare what was recovered to the source; count ambiguities, errors, symbol size, and reading speed.
5. Test closely related sounds and language-external counterexamples.

No claim of "visual phonetic encoding" is accepted until the rules decode sound distinctions, not just point to a role.

## Working Mandarin contrasts

- 妈 mā / 马 mǎ: segmental sound held constant, tone changes.
- 八 bā / 趴 pā: unaspirated versus aspirated bilabial stops.
- 米 mǐ / 木 mù: same initial, different vowel qualities.
- 买 mǎi / 慢 màn / 忙 máng: different transitions and codas.
- 清 qīng / 情 qíng / 请 qǐng / 晴 qíng: common sound-family clues with tone/meaning variation.

**Careful:** these are pedagogical contrast items, not all canonical historical component analyses. A claimed historical phonetic role must be independently verified.

## Evaluation gates

- Can a learner recover place, manner, aspiration/voicing, vowel distinctions, codas, and tone?
- Is the symbol legible at character-size?
- Is every distinction represented without collisions?
- Can the same notation extend beyond Mandarin?
- Does it remain useful beside the original writing rather than obscuring it?
- Is decoding better than reading a compact familiar transcription?

The answer may ultimately be a small surrounding annotation instead of fully embedding the code in strokes. That is a possible measured result, not a foregone conclusion.
