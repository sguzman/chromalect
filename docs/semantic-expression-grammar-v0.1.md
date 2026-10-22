# Semantic expression grammar v0.1

**Status:** experimental, illustrative, language-independent notation for pictographic concepts. It is not a Mandarin dictionary or a verified account of word meanings. No semantic glyph mappings are admitted to the production first-1,000-character atlas by this specification.

## Goal and interpretation

Small expressions of reusable emoji tokens should make related concepts, actions, and participants visually distinguishable without allocating exclusive pictograms to each character. The notation has a **formal syntax** and a deliberately modest **semantics**. One emoji is a complete valid expression; longer expressions have no semantic length limit. Words and Chinese character usages are linked to expressions **only through separately reviewed sense records**.

A sequence of adjacent emoji with no operator has **no asserted compositional reading** in this grammar. The meaning of a conventional emoji and the meaning of a multi-icon mnemonic can be culturally and contextually variable. A source-backed sense assignment and a user comprehension test are required before a speculative expression can be treated as an effective meaning cue.

## Emoji-first display and machine-readable structure

The **primary visual language is emoji**, not the technical punctuation shown below. Examples include ⛰️, 📖🧠, 👤🍽️🍎, and 🌱➡️🌳. A renderer projects typed expression trees into ordered pictograms; single-emoji and longer sequences coexist. No symbol is reserved for a particular Chinese character.

Machine-readable JSON records the underlying relation and, for events, participants such as agent, patient, or goal. The pictogram-only output is a **mnemonic projection**, not a reversible serialization. For instance, 👤🍽️🍎 alone does not prove its participants, and 🚫🍽️ could suggest prohibition rather than simple negation. The typed record preserves distinctions pictures may not make explicit.

Experimental rendering conventions are property before head; agent/source before an event predicate; patient/goal/instrument afterward; ➡️ between states; 🚫 before a negated expression. These are visual hypotheses, not universal linguistic laws. A separately evidenced sense determines any intended lexical interpretation.

## Optional technical operators

| Syntax | Construct | Precise interpretation |
| --- | --- | --- |
| ⛰️ | Atom | A reusable pictogram whose intended sense is specified in its lexicon |
| 📖 ∼ 🧠 | Association | Mnemonic conceptual association, **not** automatic "learn" |
| 🍎 + 🍐 | Conjunction | Both referents, not a compound or new noun |
| 🔴 · 🍎 | Qualification | Left property modifies right head: red apple |
| 🌱 ⇒ 🌳 | Change | State transition, not proof of causation |
| ▶🍽️ | Event | Eating action cue, rather than the object tableware alone |
| ¬(▶🍽️) | Negation | Negates the entire event expression |
| ( ... ) | Scope | Explicit grouping; nested expressions remain unambiguous |

Emoji atoms may recur any number of times in the same or different expressions. A sequence of *n* operands uses the same declared operator between them, e.g. \`📖 ∼ 👀 ∼ 🧠 ∼ ✍️ ∼ 💡\`. There is no three-icon ceiling or uniqueness constraint.

**Events are essential for verbs.** The \`▶\` prefix marks an action or process. It can wrap a single emoji, a state transition, or a mnemonic association, but it does not itself convert the constituent pictures into a sourced verb definition. For example, \`▶(📖 ∼ 🧠)\` is a candidate **study/learn** mnemonic, not a logical consequence of "book associated with brain."

## Participant roles for verbs

An event may have zero or more **explicitly named** roles. Empty role lists are omitted. Display role syntax is \`▶PREDICATE⟨A:EXPR,P:EXPR⟩\` (without spaces required).

| Role | Meaning |
| --- | --- |
| \`A\` | Agent: initiator or doer |
| \`P\` | Patient: thing affected |
| \`G\` | Goal: destination or endpoint |
| \`S\` | Source: origin |
| \`I\` | Instrument: tool or means |

Examples:

- \`▶🍽️\` — an eating action, without specifying who or what.
- \`▶🍽️⟨A:👤,P:🍎⟩\` — a person eats an apple.
- \`▶🚶⟨A:👤,G:🏠⟩\` — a person walks home; the house is a **goal**, not a patient.
- \`▶(🌱 ⇒ 🌳)\` — a plant growing, as a change-of-state event.
- \`¬(▶🍽️)\` — not eating. Negation scopes over the entire action.
- \`▶(👀 ∼ 📖)\` — tentative reading mnemonic; visual association alone is not a definition of "read."

Participants are not assumed from icon position or depicted humans inside emoji. Role constraints such as whether a predicate can take an instrument must eventually be specified in the lexicon. Events do not encode tense, aspect, mood, grammatical person, or Mandarin syntax. These should not be silently inferred.

## Optional technical syntax (not the default emoji display)

The authoritative representation is a recursive **typed JSON expression tree**, so there is no ambiguity about operator precedence or token boundaries. The following notation is an optional inspector view, not the default emoji display or an independent free-form text parser.

\`\`\`ebnf
expression  = atom | association | conjunction | qualification
            | change | event | negation ;
atom        = emoji ;
association = expression, " ∼ ", expression, { " ∼ ", expression } ;
conjunction = expression, " + ", expression, { " + ", expression } ;
qualification = expression, " · ", expression ;
change      = expression, " ⇒ ", expression ;
event       = "▶", expression, [ "⟨", role, { ",", role }, "⟩" ] ;
role        = ( "A" | "P" | "G" | "S" | "I" ), ":", expression ;
negation    = "¬(", expression, ")" ;
\`\`\`

In canonical display, a compound operand is parenthesized when nested inside another expression; standalone compound expressions need no outer parentheses. Roles are ordered A, P, G, S, I and are each permitted at most once. This notation has no automatic multiplication or adjacency operator. A JSON \`null\` expression in the experimental specimen collection means **no proposed pictogram**, rather than a new linguistic symbol.

## Evidence and production boundary

The [versioned schema](../ontology/semantic-expression-v0.1.schema.json) defines the typed tree. The [illustrative specimen data](../site/semantic-grammar-v0.1.json) records examples and their review status. The [semantic lab](../site/semantic-lab.html) defaults to emoji-only expressions, keeps technical notation behind an optional reference, and provides written meanings on demand.

- **Grammar validity** establishes that an expression follows the syntax, not that it means the proposed word.
- **Lexical validity** requires evidence for each character use or word sense, and must separately record polysemy, usage, and relevant provenance.
- **Visual comprehensibility** requires independent evaluation. A visually plausible composition is not proof that people can recognize it.
- **Alternative readings** must stay separate; no compulsory one-expression-per-character rule.
- **No pictogram** is a valid outcome, rather than a reason to add misleading tokens.
- All component colors, Chinese glyph geometry, pronunciation and tone layers remain unchanged.

This is a versioned design candidate. Operator semantics can be revised in a later version using explicit migration rather than silently changing published expressions.
