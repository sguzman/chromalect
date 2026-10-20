# DEC-0002: preserve independently meaningful channels

**Date:** 2026-10-19  
**Status:** accepted at conceptual level; exact visual notation provisional

## Context

Early concept illustrations colored arbitrary strokes inconsistently and used outlines for "phonetic" without encoding sounds. This destroyed component identity and conflated linguistic roles with pronunciation.

## Decision

- One normalized component identity has one stable fill color in each active scheme.
- Related components inhabit documented semantic color neighborhoods without sharing one mandatory family color.
- Component-role cues are independent from the identity palette.
- A true pronunciation layer must encode actual sounds (including tone/prosody), not just the presence of a phonetic component.
- All visual layers are toggleable and plain text remains accessible.
- Exact phonetic geometry, component normalization, animation effects, and palette are experimental rather than accepted specifications.

## Consequences

A displayed character may have several colors because it contains several components, **never** because strokes inside one component are assigned ad hoc colors. Illustrative image mockups do not establish linguistic accuracy. Version and test every mapping.
