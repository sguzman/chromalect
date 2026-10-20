# Conceptual architecture and ontology boundaries

The model should remain independent of any renderer or font. **The public typed model is defined in [ONTOLOGY.md](../ONTOLOGY.md) and [ontology/ontology-v1.json](../ontology/ontology-v1.json).** Rust build tools implement and validate a source-backed subset without making Rust types the public ontology API.

## Distinct layers

**1. Source text** — original Unicode characters, word boundaries when supplied, language/locale tags, provenance. Never rewrite source bytes to paint a character.

**2. Script inventory** — characters, canonical component identities, displayed variant shapes, decomposition trees, boundaries, and glyph-level geometry. Distinguish script-standard claims from font-specific geometry.

**3. Linguistic annotations** — component role *in a given character*, semantic categories, lexical meanings, historical clues, attested readings, contextual disambiguation, phonetic transcriptions, and uncertainty.

**4. Phonology** — cross-language phones/features, syllables, local phonological constraints, and contextual realizations. Keep IPA or a documented equivalent as a reversible reference representation.

**5. Visual schemes** — palettes, boundaries, component-role outlines, phonetic code mappings, prosody marks, animation motifs, and responsive layouts. All layers independently toggleable.

**6. Experiment metadata** — source dataset revisions, normalization rules, scheme versions, test corpus, visual settings, hypotheses, evaluation metrics, artifacts, and decisions.

## Model invariants

- A canonical component ID has one identity color within a scheme version. All instances reuse that color.
- A semantic family does **not** replace component identity. Nearby colors may imply family; each member still has an exact assigned value.
- A component's role is contextual: the same component can have different roles in different characters.
- Phonetic-role markings never pretend to specify actual pronunciation; actual pronunciation requires a separate code.
- Actual pronunciation can have multiple alternatives, selected by lexical or sentence context.
- Tones and sandhi belong to different description levels; do not silently rewrite citation tones.
- Each linguistic claim can carry a source, confidence, and unresolved status.
- Original text, plain rendering, accessible annotations, and reduced-motion support must survive every scheme.
- A scheme comparison changes only the declared variables. Unchanged source strings and analyses must remain identical.

## Proposed conceptual records

A **component registry entry** could contain: stable component ID, preferred graph, recognized variants, semantic-family claim(s) with provenance, one assigned scheme color, and optional gloss.

A **character analysis** could contain: character, variant standard, decomposition tree, component references, each component's positional role and evidence, citation readings, uncertainty flags.

A **word occurrence** could contain: source text offsets, lexeme identity, reading in context, meaning in context, tone changes, and segmentation evidence.

A **render configuration** could contain: palette ID and version; pronunciation-code ID and version; language profile; layer visibility; font/layout choices; motion policy.

An **experiment record** could contain: ID, revision, hypotheses, comparison conditions, specimen IDs, controlled inputs, measured results, and status.

The formal ontology now uses versioned JSON records and JSON Schemas. This section describes additional implementation candidates; it does not override the canonical ontology vocabulary or instantiate unsupported linguistic facts.

## Future implementation discipline

The existing Rust renderer validates a source-aligned Mandarin subset. Continue Rust-first with a pure data/annotation model separate from presentation. Evaluate Unicode and font shaping, stroke-level rendering, script-specific decomposition, and source-offset alignment before selecting a frontend. Do not start a monorepo or web app by default.
