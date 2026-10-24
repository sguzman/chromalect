# Local-only key-separated reviewer packet preparation (v0.1)

Chromalect can prepare an **offline, provisional source-region packet** for planning external source-owner review. The packet has 49 Chinese glyph pairs, 98 regenerated source-pinned monochrome region masks, a self-contained **read-only offline HTML gallery** with 49 three-panel presentations, and randomized opaque packet IDs. Its reviewer-facing manifest contains character context, two candidate forms, SVG hashes and path counts, but no original `cmp-` owner IDs, source trial IDs, priority ranks, machine-assigned owner label or notes. The source-to-packet key is written **only to an explicitly separate local coordinator file**.

This is a *preparatory generator*, not an approved study, independent reviewer interface, review result, qualified source-owner certification, or blinded experimental session. The underlying source interpretation remains publicly accessible in the separate Chromalect source repo and static gallery. External participants are not recruited or authorized by generating this packet; reviewer independence, qualifications, source licensing, privacy requirements, ethics review and preregistration remain outside the automated program.

## Safe local output boundary

The tool runs only with two explicit absolute output destinations **outside the public repository**:

    node tools/glyph-pipeline/source_owner_local_packet.mjs --reviewer-dir /absolute/local/reviewer-packet --coordinator-map /absolute/local/coordinator-private.json

Both targets must be absent. The script refuses to overwrite existing files, refuses to place the source-owner map in the reviewer directory or public repo, and gives the coordinator file owner-only permissions on Linux. The packet and coordinator file must be stored, governed and shared separately. Do **not** commit, upload or publish the generated coordinator mapping or blindly upload the generated packet without separate protocol approval.

Each run uses fresh cryptographically random 128-bit packet identifiers and randomizes the presentation-list order without calling that randomization an experimental allocation. The separate coordinator map retains original trial IDs, source hashes and source-owner assignment to support prospective reconciliation. The static gallery uses only local image links, escaped text, and CSS (no JavaScript, form controls, external assets, or participant-response fields). Files do not contain reviewer decisions or personally identifying data. A reviewer could still independently discover public source material; this packet alone does not enforce actual reviewer-key isolation.

## Offline packet integrity audit

A separate read-only verifier checks an existing offline packet **without its private coordinator file**, generated source manifests, or repository-held SVGs:

    node tools/glyph-pipeline/source_owner_local_packet_verify.mjs --packet-dir /absolute/local/reviewer-packet

It enforces the exact unapproved packet schema, unique opaque IDs, 49 pairs, 98 neutral mask files, source-shape-only SVG grammar, SHA-256 digests, exact read-only gallery output and README notice, rejects unexpected files and symlinks, and refuses any inserted review approval or response counts. It does not modify the packet or access the coordinator mapping.

The verifier establishes **internal packet consistency only**: if someone deliberately regenerates a whole packet and matching manifests, the verifier cannot independently establish the original source provenance, legitimate randomness, reviewer independence, or qualified source ownership. These require separate signed source chain-of-custody and external-review governance before use.

## Reproducible verification

    node tools/glyph-pipeline/source_owner_local_packet_smoke.mjs
    node tools/glyph-pipeline/source_owner_local_packet_verify_smoke.mjs

CI exercises deterministic synthetic packet IDs, the 49/98 generated counts, source mask digests, key omission from all 98 reviewer SVGs and the manifest, static HTML generation, adversarial text-escaping cases, create-only output, private file placement, and a real CLI invocation inside a temporary directory. Test output is discarded. Passing this test verifies engineering isolation under its stated constraints, **not** human independence, linguistic correctness or study readiness.
