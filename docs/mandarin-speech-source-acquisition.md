# Mandarin external speech-source acquisition plan

The [machine-readable source registry](../data/phonetics/external-speech-source-registry-v0.1.json) records four independently published speech-corpus leads. These are **publisher-level research leads only**, not acquired recordings, verified phonetic examples or independently certified pronunciation analyses. The [validator](../tools/glyph-pipeline/external_speech_source_registry.mjs) forbids status promotion without new, separately documented evidence.

## Published candidate sources

| Resource | Source | Publicly described scope | Practical limit |
| --- | --- | --- | --- |
| AISHELL-3 | [OpenSLR SLR93](https://www.openslr.org/93/) | Apache-2.0; approximately 19 GB; Mandarin multi-speaker recordings with character-level and Pinyin-level transcription | First candidate for separately matching citation spellings to independently sourced recordings; large archive, not yet sampled |
| AISHELL-1 | [OpenSLR SLR33](https://openslr.org/33/) | Apache-2.0; approximately 15 GB; Mandarin speech/transcripts and auxiliary speaker/lexicon metadata | Written transcripts and audio do not automatically provide a phonetic reference label |
| Common Voice Scripted Speech 27.0, zh-CN | [Common Voice dataset catalog](https://commonvoice.mozilla.org/rw/datasets) | CC0-1.0 catalog label; approximately 21.40 GB of community recordings | Mozilla Data Collective publishes additional restrictions against rehosting and speaker reidentification; confirm current per-release access terms before any use |
| ManDi | [LREC 2022 paper](https://aclanthology.org/2022.lrec-1.213/) | Approximately 9.6 hours of Standard and regional Mandarin speech; paper identifies CC BY-NC 3.0 | Noncommercial restrictions and distinction between Standard and regional varieties must be respected |

These archives have **not** been downloaded or indexed here. Source size describes the full advertised resource, not the cost of any approved research subset. A dataset license label is not permission to bypass the publisher's terms, speaker privacy restrictions or redistribution rules. No audio, transcripts, speaker data or excerpted source text are committed to the public project. The publishing workflow also rejects committed audio-file extensions and common corpus-archive formats; metadata and source links are the only corpus materials permitted in the current research registry.

## Evidence-gated progression

1. **Source terms and release pin:** Independently reconfirm the actual dataset release, download path, license and platform restrictions. Record a stable upstream manifest and version before local processing; do not infer permissions from a catalog label alone.
2. **Bounded metadata inspection:** Study the manifest and relevant transcription schema before selecting a small sample. Avoid default whole-archive downloads. Track the selected sample count and local-only file digests if acquisition becomes justified.
3. **Citation correspondence:** Determine whether a recording actually contains a particular target character and source reading in the required variety/context. Matching Chinese orthography alone is not a validated phone sequence, syllable division, tone realization or lexical meaning.
4. **Acoustic provenance:** If sound inspection is authorized, retain dataset ID, revision, clip identifier, time offsets, waveform parameters, and source-local checksum in a separately versioned *local* ledger. Do not publish raw recordings or sensitive speaker details.
5. **Phonetic adjudication:** Specify speaker variety, recording/register, transcription conventions and independent evidence before considering an IPA representation. A transcript, Pinyin heading, forced alignment or speech-model output is not itself an expert approval.
6. **Independent decoding study:** Only after source and representation gates pass, run a separate controlled visual-symbol decoding/comprehension experiment. Source verification alone does not support a learning-effectiveness claim.

The existing [nine-family caution inventory](../site/mandarin-spelling-cautions.html) contains 213 source citation-reading occurrences, not 213 independently matched spoken tokens. The [local phonetic review intake](../site/mandarin-phonetic-review.html) can record preliminary, scoped evidence once acquired, but it never awards IPA, phonemic or acoustic approval.

**Acquisition boundary:** full corpus fetching, license interpretation beyond the source pages, utterance-level alignments, acoustic measurements and human evaluations are all explicitly pending. The current registry has zero downloaded recordings and zero approved sound claims.
