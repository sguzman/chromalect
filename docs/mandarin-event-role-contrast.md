# Event and non-event emoji contrast audit

**Status:** reproducible display-risk inventory, not a lexical or comprehension approval. The visual language remains ordinary emoji; action/process roles remain typed metadata.

The same emoji can legitimately describe many character senses. **Reuse is a feature, not a uniqueness failure.** One question nevertheless needs testing: when the same visible form is used for both an action and an entity/property, does a viewer understand that distinction?

The [machine-readable contrast audit](../data/semantic/cedict-crossref/event-role-contrast-audit-v0.1.json) connects the [existing visual-form reuse inventory](../data/semantic/cedict-crossref/visual-form-reuse-v0.1.json) to the [typed semantic expression audit](../data/semantic/cedict-crossref/emoji-visibility-audit-v0.1.json). It leaves all canonical mappings unchanged.

| Measured scope | Count |
| --- | ---: |
| Provisional sense expressions examined | 897 |
| Distinct visible emoji sequences | 388 |
| Sequences shared by both actions and non-actions | 73 |
| Candidate assignments using those sequences | 341 |
| Typed action assignments among those | 164 |
| Non-action assignments among those | 177 |
| High-attention mixed groups | 16 |
| Independently approved lexical senses or emoji comprehension | 0 |

For example, ✅ is reused as a candidate for non-action meanings such as *correct* and typed actions such as *decide*. 🤝 likewise occurs for object/relationship cues and for actions. **This does not demonstrate that any individual use is wrong**. The grammar retains the event distinction in JSON, but the raw pictogram does not explicitly convey it.

A group is assigned \`contrast_focus\` when it has at least five assignments and at least two typed actions and two non-actions. This is a transparent testing-priority heuristic, **not a quality ranking or a requirement to invent new emoji**.

## Next comprehension study

The [blind emoji comprehension worksheet](../site/emoji-comprehension.html) now offers a **shared action/non-action forms** scope. This chooses examples only from those 73 mixed-role visual forms. It still hides Chinese characters, candidate meanings, and event metadata until the reader has locked an initial interpretation. The default repetition policy tests a form at most once in one session to avoid within-session priming. An explicitly repeat-allowed session tests reuse under a different experimental condition and should not be pooled without accounting for priming.

After interpretation, a reviewer can compare whether the reader chose an action, entity, property, or another concept against the typed underlying role. The app never automatically promotes a sense, declares a reused form invalid, or changes production semantic coverage.

To reproduce the machine-readable audit, run \`node tools/glyph-pipeline/event_role_contrast_audit.mjs --check\` from the repo root. The CI workflow checks this file and the blind-study regression tests before publication.

Component coloring, stroke alignment, pronunciation, tone, and future whole-word semantic layers are unaffected.
