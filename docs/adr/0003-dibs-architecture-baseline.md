# ADR-0003: Dibs architecture baseline

- **Status:** Accepted
- **Date:** 2026-08-08
- **Supersedes:** ADR-0001

## Context

Dibs is a local-first crypto portfolio PWA that opens directly to the portfolio view and
keeps holdings out of URLs and backends.

## Decision

Keep the React 19, TypeScript, Vite, Tailwind token, TanStack Router, TanStack Query,
Jotai, Zod, Jest, Cypress, and Storybook toolchain, but align all product code and docs
around Dibs feature slices.

The active MVP feature is `portfolio`. Future work should add separate feature slices for
settings, secure storage, market data, and staking data when those requirements are
approved.

## Consequences

- Old sample features are removed from the shipped app.
- `src/api/` remains generated-only for future external contracts.
- Runtime dependencies still need approval and bundle-impact records.
- Mobile/PWA performance budgets replace old product-specific performance wording.
