# Dibs Front-End — Agent Context

This file is the root context for every contributor. Read it before writing code.

## Absolute Rules

- **NEVER use `any`.**
- **NEVER use non-null assertions (`!`).**
- **NEVER import from another feature.** Cross-feature reuse goes through `shared/`.
- **NEVER use `dangerouslySetInnerHTML`.**
- **NEVER hardcode colours.** Use theme tokens routed through CSS variables.
- **NEVER store auth tokens or portfolio secrets in `localStorage`.**
- **NEVER add or change a dependency without approval and bundle-impact notes.**
- **ALWAYS write tests before a feature is considered done.**
- **ALWAYS validate with Zod** at trust boundaries.

## Product Shape

Dibs is an iPhone-first React PWA for viewing a local crypto portfolio per person. The MVP
is read-only, local-first, privacy-friendly, and opens directly to the portfolio screen:
no account, no backend, no wallet connection, no trading, and no portfolio data in URLs.

Future Dibs work may add local settings for people, coins, amounts, validator pubkeys or
indices, secure mode, encrypted backup import/export, and online data adapters for
CoinGecko prices and Ethereum staking data.

## Architecture

Feature-based Clean Architecture:

```text
src/
├── app/
├── features/
│   └── portfolio/
├── shared/
└── styles/
```

Components are presentational. Hooks orchestrate state, validation, data selection, and
side effects. Feature code may import `shared`, `styles`, and its own slice only.

## State

| Data source                   | Home                                            |
| ----------------------------- | ----------------------------------------------- |
| Read-only portfolio MVP data  | `features/portfolio/data`                       |
| Future server data            | TanStack Query behind feature adapters          |
| Local UI state                | Jotai atoms                                     |
| Future settings forms         | React Hook Form + Zod                           |
| Future local portfolio config | IndexedDB, optionally encrypted with Web Crypto |

## Detailed Conventions

Use the conventions library in `docs/conventions/` for coding, architecture, testing,
API integration, UI/i18n, and git conventions.

## Quality Bar

- Coverage: >=80% statements/lines, >=75% branches, >=85% functions.
- Critical ESLint rules stay enabled.
- `npm run build`, `npm run lint`, `npm test`, and bundle checks should pass before handoff.
- Dibs is mobile/PWA budget sensitive; new runtime dependencies require explicit approval
  and measured bundle impact.
