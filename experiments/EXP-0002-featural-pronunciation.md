# EXP-0002: constructed phonetic symbol grammar

**Status:** proposed  
**Current specification:** v0.1.0 (draft, 2026-10-19)  
**Language:** Mandarin first; cross-language robustness is a research question  
**Implementation:** none

## Question

Can a systematic, compact visual shape encode the *actual sound* of a syllable without merely spelling a letter sequence or marking a historical phonetic component?

## Hypothesis

A consistent symbol grammar grounded in articulatory properties can represent several phonological distinctions with fewer arbitrary memorized symbols than a one-symbol-per-syllable inventory, and can be learned and decoded reliably.

## Candidate construction

- Base geometry: place of articulation.
- Internal modifications: manner, aspiration, voicing and other consonant features.
- Spatial vowel field: tongue height, backness, rounding.
- Continuous transitions and endings: diphthongs and nasal codas.
- Tone: independent contour at a fixed anchor.
- Zero onset: an explicitly distinguishable construction.

**None of these visual mappings has been fixed.** Words such as "left rail h" and "right rail ai" were merely one abandoned-looking layout experiment, not an accepted universal design.

## Controls

A. Pinyin/IPA written explicitly; B. one opaque symbol per syllable; C. initial/final code; D. compositional articulatory-featural symbol; E. optional articulatory animation.

## Mandatory proof

The encoding must have a published mapping table and a decoding rule. It must round-trip phonological inputs through shapes back to unambiguous outputs. It should be tested at actual glyph-cell sizes and on minimal contrasts.

## Contrast corpus

妈 mā / 马 mǎ, 八 bā / 趴 pā, 米 mǐ / 木 mù, 买 mǎi / 慢 màn / 忙 máng. For cross-script generality, later choose contrast sets that Mandarin lacks (consonant clusters, vowel length, non-Mandarin distinctions).

## Measures

Distinctness/round-trip collisions, time to learn, decoding accuracy, size/occlusion, transfer to unfamiliar syllables, dependence on memorized arbitrary features.

## Unresolved

- Does "inside the character cell" require separate annotation rather than stroke modifications?
- Does one connected-looking shape remain reversible for complex syllables?
- How should contextual tone sandhi and word stress be represented?
- Does a general IPA-equivalent geometry truly outperform readable IPA/Pinyin?

No performance claims or validated visual alphabet yet.
