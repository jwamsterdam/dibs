# Dibs Front-End — Agent Context

This file is the root context for every contributor. Read it before writing code.

## Absolute Rules

- **NEVER use `any`.**
- **NEVER use non-null assertions (`!`).**
- **NEVER import from another feature.** Cross-feature reuse goes through `shared/`.
- **NEVER hand-edit `src/api/`.** It is reserved for generated API clients.
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
├── api/
└── styles/
```

Components are presentational. Hooks orchestrate state, validation, data selection, and
side effects. Feature code may import `shared`, `api`, `styles`, and its own slice only.

## State

| Data source | Home |
| --- | --- |
| Read-only portfolio MVP data | `features/portfolio/data` |
| Future server data | TanStack Query behind feature adapters |
| Local UI state | Jotai atoms |
| Future settings forms | React Hook Form + Zod |
| Future local portfolio config | IndexedDB, optionally encrypted with Web Crypto |

## Detailed Conventions

Use the conventions library in `docs/conventions/` for coding, architecture, testing,
API integration, UI/i18n, and git conventions.

## Team Roles

| Teammate | Role | Instruction file |
| --- | --- | --- |
| Solid | Solution Architect | `docs/agents/SolutionArchitect.md` |
| Vibe | Senior Front-end Developer | `docs/agents/Developer.md` |
| Scope | Business Analyst | `docs/agents/BusinessAnalyst.md` |
| Probe | Tester / QA | `docs/agents/Tester.md` |
| Aegis | Security specialist | `docs/agents/Security.md` |
| Pixel | UX / Design Guardian | `docs/agents/UXGuardian.md` |
| Flux | DevOps | `docs/agents/DevOps.md` |
| Watt | Performance Engineer | `docs/agents/PerformanceEngineer.md` |

## Working Method

1. Scope turns requirements into acceptance criteria.
2. Probe writes tests from those criteria.
3. Vibe implements until tests pass.
4. Solid reviews architecture and dependency decisions.
5. Pixel verifies UI against Figma and accessibility expectations.
6. Aegis reviews security-sensitive changes.
7. Flux keeps CI/build/deploy healthy.
8. Watt checks performance-sensitive changes.
9. A human reviews and approves.

## Quality Bar

- Coverage: >=80% statements/lines, >=75% branches, >=85% functions.
- Critical ESLint rules stay enabled.
- `npm run build`, `npm run lint`, `npm test`, and bundle checks should pass before handoff.
- Dibs is mobile/PWA budget sensitive; new runtime dependencies require explicit approval
  and measured bundle impact.
