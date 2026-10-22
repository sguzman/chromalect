# High-priority semantic remediation hypotheses

**Status:** source-linked research options, **not** canonical replacements, completed independent lexical reviews, or validated pictograms. The [machine-readable proposals](../data/semantic/cedict-crossref/high-priority-remediation-v0.1.json) cover the 15 highest-priority entries in the existing [248-case lexical review queue](../data/semantic/cedict-crossref/sense-review-queue-v0.1.json).

The 15 proposals were compared against pinned Unihan definitions and CC-CEDICT headwords. They identify **nine alternative expression hypotheses**, **five suggested deferrals**, and a typed-verb trial. These categories overlap: several records recommend inspecting an existing alternative or resolving reading/context rather than inventing new pictograms.

## Design rules

1. **Preserve the first-1,000 screening ledger.** An overlay proposal never mutates the original experimental candidate. No proposed emoji automatically receives production status.
2. **Separate lexical sense from pictogram clarity.** A candidate may express a valid historical usage but be unsuitable for the modern Mandarin default. Conversely, a good emoji may represent a different sense of the same character.
3. **Keep independent readings and parts of speech separate.** For 没, the ordinary negative reading \`mei2\` and the submerge/drown reading \`mo4\` must not be collapsed. The existing 🚫 for *not* is not evidence that 🌊 encodes *drown*.
4. **Do not invent unique signatures.** Keep ordinary reusable emoji where possible; allow combinations when a relation benefits from them, and abstain rather than make a misleading pictogram.
5. **Typed event data is not a visual action marker.** For 订, converting a proposed *agreement* association into a typed event *to agree/draw up* clarifies the machine-readable model, but the visible 📝🤝 remains identical. Test whether readers recognize the **verb**, not just the broad association.

## Initial high-priority proposals

| Character | Existing trial | Research disposition | Important limitation |
| --- | --- | --- | --- |
| 气 | ♨️ for steam | Trial 🌬️ for air/gas | Moving air cannot represent every gas or the broader \`qi\` sense |
| 仍 | 🔁 for again | Defer until temporal continuation is represented | Repetition and persistence are different meanings |
| 斤 | 🪓 for axe | Trial ⚖️ for the modern weight unit | A scale is not a distinctive jin/catty symbol |
| 凶 | 😞 for sad | Defer | Ominous or fierce is not straightforward sadness |
| 火 | ▶🔥 for burn | Inspect existing 🔥 for fire | Typed action remains visually identical to the noun |
| 订 | 📝🤝 for agreement | Trial typed event on the same reusable emoji | Cannot assume readers infer a verb |
| 玉 | 💎 for precious stone | Defer | Cut diamond imagery is not jade |
| 扑 | ⚔️ for attack | Defer | Combat is not the same as pounce/pat/flap |
| 丘 | ⛰️ for hill | Inspect narrowed hillock/mound scope | Tall-mountain emoji may be too broad |
| 廷 | ⚖️ for court | Trial 🏯 for palace courtyard | Architectural building is not necessarily courtyard |
| 极 | 🔝 for extreme | Review top/utmost reading and grammatical use | Does not automatically express all adverbial uses |
| 兵 | 🪖 for soldier | Inspect number and class-level meaning | Singular/plural wording mismatch alone is weak evidence |
| 状 | 🔷 for shape | Defer pending suffix/condition sense evidence | Arbitrary geometric icon is too specific |
| 没 | ▶🌊 for drown | Inspect existing 🚫 for *not* as a separate reading | Negative prefix and drowning are different senses |
| 幸 | 🍀 for luck | Inspect fortunate/lucky reading and grammar | Culture-specific conventional luck emblem |

## Next acceptance work

Independent Mandarin lexical adjudication should confirm reading, usage context, modern versus historical status, and word-formation relevance. The [source-first lexical worksheet](../site/lexical-review.html) supports exploratory observations that **do not** count as approvals. The [blind emoji-comprehension worksheet](../site/emoji-comprehension.html) is a separate test of visual interpretation. No proposal should replace the existing mapping until the corresponding lexical and comprehension evidence meets independently defined acceptance requirements.

**Progress invariant:** 1,000/1,000 source headwords processed; 897 expression hypotheses; 248 flagged cases with preliminary desk analysis; **zero independent lexical approvals, zero comprehension approvals, zero production semantic verifications.**

CC-CEDICT source evidence remains under **CC BY-SA 4.0** and Unihan material retains its Unicode licensing, as recorded in [third-party notices](../THIRD_PARTY_NOTICES.md).
