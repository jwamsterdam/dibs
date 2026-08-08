# Dibs Technical Architecture Plan

Dibs is an iPhone-first React PWA for viewing a local crypto portfolio per person. The MVP
is read-only and privacy-friendly: portfolio data stays local, no backend is required, and
the URL never contains holdings.

## Scope

Current MVP:

- Portfolio overview at `/`
- Person initials/name
- Period tabs
- Selectable total and asset rows
- Recharts-based historical chart
- Absolute/percentage change toggle
- ETH staking rewards
- Local mock data through a typed data-source boundary
- IndexedDB repository scaffold for future local settings

Planned future slices:

- `settings`: people, assets, amounts, validator pubkeys/indices
- `secure-storage`: encrypted local config, PIN unlock, import/export
- `market-data`: CoinGecko price and history adapters
- `staking-data`: Ethereum validator/rewards adapters

## Stack

- React 19
- TypeScript strict mode
- Vite 6
- Tailwind CSS via theme tokens
- TanStack Router
- TanStack Query for future external data feeds
- Jotai for local UI state
- Zod for validation
- Jest/Testing Library
- Cypress and Storybook as optional quality surfaces

## Source Layout

```text
src/
├── app/
├── features/
│   └── portfolio/
├── shared/
├── api/
└── styles/
```

Feature slices own their domain components, hooks, data adapters, validation, tests, and
types. Cross-feature sharing belongs in `shared`.

## Data And Privacy

The MVP uses `read-only-mock` data. Future online providers are selected but inactive:

- CoinGecko for spot and historical crypto prices
- Ethereum Beacon/validator APIs for staking rewards

Portfolio configuration should live in IndexedDB. Secure mode should store one encrypted
JSON document using PBKDF2 for key derivation and AES-GCM for encryption. PINs and keys
must not be stored.

## Performance

Dibs targets mobile/PWA performance budgets. Current bundle budgets are enforced by
`scripts/check-bundle-budget.mjs`:

- Total JS gzip < 300 KB
- CSS gzip < 50 KB
- Largest JS chunk gzip < 200 KB

Recharts is isolated in a `charts` manual chunk and documented in ADR-0002.

## Validation

- Zod parses portfolio snapshots and future external responses.
- UI tests cover row selection, period switching, change display mode, and chart rendering.
- Generated `src/api/` remains reserved for future generated clients and is not hand-edited.

## Architecture Decisions

- ADR-0001 is superseded by ADR-0003 for the Dibs baseline.
- ADR-0002 records the approved Recharts dependency and bundle impact.
