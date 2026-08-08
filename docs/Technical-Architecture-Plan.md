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
- ETH staking rewards (demo value; real staking data is still future work)
- A typed `PortfolioDataSource` boundary with two implementations: a read-only mock
  snapshot, and a configured online snapshot built from CoinGecko data
- Settings for person name, fiat currency, and coin holdings, persisted locally in
  IndexedDB (`settings` and `market-data` live inside the `portfolio` slice — see ADR-0005)

Planned future slices:

- `secure-storage`: encrypted local config, PIN unlock, import/export
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

The MVP defaults to `read-only-mock` data and switches to `online` mode once a person
configures holdings in Settings:

- CoinGecko is called directly from the client for spot and historical crypto prices
  (search, simple price, market chart), validated with Zod and cached in IndexedDB
  (see ADR-0005).
- Ethereum Beacon/validator APIs for staking rewards remain future work.

Portfolio configuration (person name, fiat currency, holdings) lives in IndexedDB through
`portfolioConfigRepository.ts`. Secure mode should store one encrypted JSON document using
PBKDF2 for key derivation and AES-GCM for encryption. PINs and keys must not be stored.

## Performance

Dibs targets mobile/PWA performance budgets. Current bundle budgets are enforced by
`scripts/check-bundle-budget.mjs`:

- Total JS gzip < 320 KB (raised from 310 KB in ADR-0005 for the react-hook-form settings
  form)
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
- ADR-0004 records the move to React Aria Components for UI primitives.
- ADR-0005 records the online CoinGecko data path and local IndexedDB persistence.
