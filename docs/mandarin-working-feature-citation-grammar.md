# Provisional Mandarin initial + simple-vowel feature citation grammar

This source-restricted *candidate feature-code* builds on the already published 21 conventional initial place/manner/aspiration tuples, three nonconsonantal written-onset conventions, six working single-vowel height/backness/rounding tuples and the original independent citation tone symbols.

The Rust decoder reconstructs the source's initial, written final and citation tone from the candidate feature tuple. A complete tuple is accepted only if its combination occurs in the original first-1,000-character citation inventory. The active component palette, stroke ownership and orthographic spelling resources are unchanged.

Of **1,171** published citation occurrences, **432** have a candidate from the six simple-final records. **112** of those have existing high-attention spelling or contextual cautions; they are withheld rather than assigned a default sound. The remaining **320** occurrences comprise **157 distinct feature/initial/tone codes**, and these codes machine-round-trip to their original written citation triples without collisions. **739** occurrences do not have a simple-final proposal and are not encoded by this grammar.

The [native Rust checker](../tools/glyph-pipeline/src/feature_citation.rs) recomputes every count and reversible mapping from the original pinned records and checks the [machine-readable audit](../data/phonetics/working-feature-citation-codec-audit-v0.1.json). The feature proposals are already displayed as schematic teaching controls in the [simple-final feature viewer](../site/mandarin-simple-final-features.html), alongside the existing initial-feature comparison and citation-tone controls.

**Scientific status:** zero independently approved phonemes, IPA realization mappings, human decoding trials, and learning-effect measurements. A source tuple is neither a measured phone nor a spatial glyph decoding test. All nine source warning categories remain active, and other unapproved final categories are withheld. This is an *engineering subproof* toward the unfinished Phase 2 decoding requirement, not completion of that acceptance gate.
