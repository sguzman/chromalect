# DEC-0001: independent, research-first project

**Date:** 2026-10-19  
**Status:** accepted

## Context

The idea grew from a question about distinguishing Chinese character components through color, then broadened to semantic families, phonetic shapes, tones, and possible animation. A full universal language-learning framework would be premature.

## Decision

Chromalect is an **independent repository specifically for researching and comparing visual language-encoding schemes**, with Standard Mandarin simplified Chinese as its first test case. Preserve hypotheses and earlier designs through versioned experiments. **No application code is required at bootstrap. If and when implementation is justified, write it in Rust.**

## Consequences

No integration into other repositories, general knowledge ingestion system, immediate GUI, or library project. Prioritize documentation, corrected specimens, reversible encodings, and comparisons. Expansion to other languages is deliberately downstream.
