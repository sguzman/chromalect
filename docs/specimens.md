# Reference specimen corpus

This file defines text stimuli for repeatable experiments. **Transcriptions are teaching references; character decomposition and role assignments must be independently validated before use as ground truth.**

## S01: constant segmental sound, different tone

| Source | Pinyin | Gloss |
| --- | --- | --- |
| 妈 | mā | mother |
| 马 | mǎ | horse |

Question: can tone be independently encoded with a fixed sound glyph?

## S02: stable historical sound-family component

| Source | Pinyin | Gloss |
| --- | --- | --- |
| 清 | qīng | clear |
| 情 | qíng | feeling |
| 请 | qǐng | please / request |
| 晴 | qíng | clear weather |

Question: can 青 keep the same component identity color while the other components vary, without falsely pretending these characters have the same tone or meaning?

## S03: compositional sound contrasts

| Source | Pinyin | Gloss |
| --- | --- | --- |
| 八 | bā | eight |
| 趴 | pā | lie prone |
| 米 | mǐ | rice |
| 木 | mù | wood |
| 买 | mǎi | buy |
| 慢 | màn | slow |
| 忙 | máng | busy |

Question: can a featural visual sound code convey aspiration, vowel quality, diphthong/coda, and tone?

## S04: lexical/contextual interpretation

| Text | Citation-style Pinyin | Gloss |
| --- | --- | --- |
| 你好 | nǐ hǎo | hello |
| 东西 | dōngxi | thing; object |

Question: can contextual pronunciation (third-tone sandhi) and lexical meaning be shown without corrupting underlying character properties?

## S05: deliberately unusual target sentence

**蓝色的男孩在玩火。**

Citation-style sequence: lán sè de nán hái zài wán huǒ.

Literal gloss: "The blue-colored boy is playing with fire." The phrase is semantically odd in normal conversation; it is a stress test of many distinct components and annotation channels, **not** an idiomatic model for beginners.

## Validation requirements

For every specimen used in published comparisons, record: Unicode source text; selected Chinese profile; segmentation; verified reading per token; lexical/contextual tone notation; source-backed decomposition; component IDs and roles; scheme versions; font used; visible layers; expected plain-mode output.

If any analysis is uncertain or conflicting, mark it as such. AI-generated images, colorful concept art, and unsourced stroke splits are never ground truth.
