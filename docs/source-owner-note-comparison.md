# Local provisional source-owner note comparison (v0.1)

This **offline comparison**, not independent adjudication, reconciles the *structure of two locally exported* [source-owner observation sets](../site/component-owner-adjudication.html). Each input must independently pass the same source-pinned, zero-certification export validator. The published comparison interface allows local JSON paste and prepares a sanitized summary; the CLI can optionally write that summary to a user-chosen path. Nothing is uploaded, persisted by the browser, or committed automatically.

The comparison covers all **49 warning pairs** from 48 original Chinese glyphs in their fixed source order and records matching provisional judgments, disagreements, notes present in only one export, and pairs with neither note. Shared shape ambiguity is preserved as a separate count. For jointly observed pairs, the report also counts identical versus different HTTPS evidence locations without revealing their URLs. Identical references may indicate dependence on the same source; different references **do not establish reviewer or source independence**. It never merges competing judgments, selects an owner, interprets an evidence URL as reviewed proof, or breaks ties using the source answer key.

## Local conflict triage

The browser interface can filter the 49 source pairs to disagreements, matched provisional judgments, either one-sided note set, unobserved pairs, shared evidence references, or either-note shape ambiguity. Presentation order may emphasize conflicts or repeated evidence sources. These controls **never alter or truncate the source-ordered JSON comparison report**. Editing either source export clears stale results immediately and requires validation again. No triage filter changes a source-owner judgment or adjudication status.

## Important independence boundary

Both input exports were prepared in a **machine-key-visible intake**. They contain no independently verified reviewer identity, qualification, independence attestation, protocol registration, or source acceptance. Their agreement does not establish two independent reviewers. Identical observation content is flagged; nonidentical content cannot establish independence either. All reviewer report and independently reconciled counts remain zero.

A comparison result includes only pinned trial IDs, original character/rank, source checksum, provisional judgment categories, structural comparison status, and a boolean indicating whether two input notes use the same evidence URL. It **never republishes URLs or free-form rationales** from input notes, since these may include sensitive or copyright-restricted information despite validator constraints. Exporting the comparison does not alter the production v0.6 palette, glyph geometry, Direct/Marker identities, semantic mappings, or [independent protocol gate](source-owner-independent-adjudication-protocol.md).

## Usage

For browser-local comparison, open [the note comparison page](../site/component-owner-compare.html) and paste two previously exported note files. Inspect the counts and copy the sanitized output, if needed. Invalid data leaves the previous successful report unavailable until inputs are corrected.

After the pipeline has generated its pinned glyph sources, run:

    node tools/glyph-pipeline/source_owner_note_compare.mjs --compare /path/to/first-notes.json /path/to/second-notes.json

Optional sanitized JSON output (no rationales or evidence URLs):

    node tools/glyph-pipeline/source_owner_note_compare.mjs --compare /path/to/first-notes.json /path/to/second-notes.json --output /path/to/summary.json

The regression test uses **synthetic** provisional observations, not human data:

    node tools/glyph-pipeline/source_owner_note_compare_smoke.mjs
