# Emoji visibility review for the first 1,000 Mandarin characters

**Status:** automated research audit, not linguistic approval and not a human comprehension test. [Open the semantic browser](../site/semantic-coverage.html).

## What was audited

The typed [emoji grammar](semantic-expression-grammar-v0.1.md) records action/process roles and associations. The default public-facing display intentionally uses ordinary emoji, omitting technical symbols. That means some semantic relations are stored in JSON but cannot be reconstructed from the emoji display alone.

The [machine-readable audit](../data/semantic/cedict-crossref/emoji-visibility-audit-v0.1.json) evaluates every existing candidate using the actual emoji renderer and the [strict dictionary comparison](../data/semantic/cedict-crossref/strict-gloss-index-v0.1.json).

| Measure | Count |
| --- | ---: |
| Character scope | 1,000 |
| Existing expressions inspected | 897 / 897 (100%) |
| Single-emoji expressions | 875 |
| Multi-emoji expressions | 22 |
| Event/process expressions | 280 |
| Single-emoji event/process expressions | 266 |
| Expressions containing association operators | 21 |
| Expressions lacking strict whole-term dictionary wording | 248 |
| Exact same-character sense collision | 2 expressions, 1 character |
| Independent lexical or comprehension approvals | 0 |

The within-character display collision is **火**: both *fire* and *burn* currently appear as 🔥, although the machine-readable grammar marks *burn* as an event. Such a collision does not automatically make either mapping incorrect. Reusing pictograms **across different characters** is intentional and never counted as a collision.

**Important:** 875 single-icon assignments do not imply 875 problems. Single pictograms are often sufficient. The largest rendered expression in this particular pilot uses 3 visible emoji; that is a property of the existing records, **not a grammar limit or a target**.

## Audit rules and review requirements

- Event expressions are flagged because their event structure is not explicitly visible in emoji-only rendering. Of 280 event expressions, 266 render as a single icon.
- Association expressions are flagged because emoji adjacency alone does not state the underlying association relation.
- Strict whole-term dictionary mismatches remain separate lexical research issues; they do not prove that a semantic cue is false.
- Multiple meanings of the *same* character get a collision flag only when the rendered emoji string is exactly identical.
- No result of this audit automatically changes an emoji assignment or increments independently reviewed semantic coverage.

## Reproduce

Run the zero-dependency script **node tools/glyph-pipeline/emoji_visibility_audit.mjs --check** at the repository root. It regenerates the analysis, checks record alignment, and compares the result with the committed JSON. Omitting --check regenerates the JSON. CI runs the check before publishing the separate research audit to the site.

## Next work

Evaluate the 266 one-icon action cues to learn when the verb/noun distinction needs a stronger *emoji* representation rather than debug punctuation. Test potential alternatives without forcing a universal symbol count. Evaluate the 21 associations and the 火 ambiguity. Only a separate lexical reviewer and meaningful comprehension evidence can move a candidate toward production verification.

This audit changes neither the original Chinese writing, component color identity, Pinyin, citation tone layers, nor independent future whole-word meanings.
