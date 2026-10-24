# Independent 34-unit Mandarin phonology model (Zhao–Li, 2009)

The peer-reviewed article by Xiaowei Zhao and Ping Li, [*An online database of phonological representations for Mandarin Chinese*](https://link.springer.com/content/pdf/10.3758/BRM.41.2.575.pdf), *Behavior Research Methods* **41**(2):575–583 (2009), DOI **10.3758/BRM.41.2.575**, describes a computational phonological representation for Standard Mandarin.

**Primary model content.** The paper defines an explicit six-slot template **CVVVCT** (an onset, up to three vowel slots, a coda, and a tone slot). Its Table 2 (printed p. 577, PDF p. 3) contains **34 feature-coded units: 12 vowel categories and 22 consonants**, including a nasal coda /ŋ/ that is not an independent Pinyin initial. It codes place, height and rounding for vowels, and place, manner and voicing/aspiration for consonants. Two of the model's apical vowel units are explicitly described as symbols outside ordinary IPA usage.

Chromalect's [transcribed model inventory](../data/phonetics/zhao-li-2009-34-unit-reference-model-v0.1.json) retains the paper's case-sensitive and punctuation-bearing unit names, corresponding IPA-style display, and the paper's proposed articulatory dimensions. The [source-table validator](../tools/glyph-pipeline/zhao_li_34_unit_reference.mjs) enforces all 34 unit identities, types and listed features and refuses promotion of unsupported phonological or human-study statuses. No original table figure, source PDF text, image or audio has been redistributed.

## Distinction from Chromalect's initial 21+3 working reference

The existing Chromalect codebook has **21 written Pinyin consonantal initials**, plus three **nonconsonantal written-onset conventions** (y, w and no initial). The Zhao–Li model instead includes a sound-system coda /ŋ/ and context-sensitive apical vowels within its research representation, so the two sets **must not be equated merely because both contain consonant strings**.

A [separate 21-initial comparison](../data/phonetics/zhao-li-2009-independent-pinyin-ipa-control-v0.1.json) establishes 18 literal working-symbol matches and three open notation differences (**zh**, **ch**, **r**). In particular, Zhao–Li use a **voiced retroflex fricative /ʐ/** for Pinyin `r`, whereas Chromalect's working codebook uses a retroflex approximant `ɻ`; neither is substituted silently for the other. The paper's apical vowel representation also reinforces the need to keep `i` context-dependent rather than treating spelling as a unique phoneme.

## Acceptance status

**A versioned external research model is available, but Chromalect has not frozen its own phonological contrast inventory or official phonetic reference notation.** Selecting among analyses requires explicit decisions about allophonic versus phonemic contrasts, dialect/age/register, source citations, contextual realization and human reliability. Source transcriptions and computational feature vectors do **not** provide acoustically verified phonemes for all 1,171 pinned first-tranche citation records.

The project retains **0** independently accepted phonemic contrasts, **0** certified first-tranche acoustic realizations, **0** automatic context-sensitive IPA mappings and **0** human decoding trials. No glyph geometry, source palette or arbitrary geometric final-symbol scheme changes.
