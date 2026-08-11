# Dibs

Dibs is an iPhone-first React PWA for viewing a small crypto portfolio per person. The
MVP is deliberately calm, read-only, privacy-friendly, and local-first: no account, no
backend, no portfolio data in URLs, and no live datafeed calls yet.

The current implementation uses mock portfolio data through a typed data-source boundary.
CoinGecko is the agreed default future source for spot and historical prices. Ethereum
staking data will be added later through validator pubkeys/indices in settings, alongside
per-person coin and amount configuration.

## Stack

- React 19, TypeScript, Vite 6
- TanStack Router and TanStack Query
- Jotai for local UI state
- Tailwind CSS through CSS custom-property theme tokens
- Zod validation at trust boundaries
- Jest and Testing Library

## Current MVP Scope

- Direct app screen at `/`
- Person name, period tabs, portfolio rows, selected-row chart, and ETH staking rewards
- Rows act as graph navigation only; there are no asset detail pages or chevrons
- Period tabs update both chart data and row changes
- Row change values toggle between absolute and percentage display
- Portfolio data remains local/mock and read-only

## Data Source Direction

The active MVP data mode is `read-only-mock`. The data layer records the intended future
providers without calling them:

- `coingecko` for prices and historical market chart data
- `beacon-api` for Ethereum validator/rewards data

Future settings work should allow adding coins, amounts, and Ethereum validator
pubkeys/indices per person. Portfolio configuration should remain local, preferably in
IndexedDB, with secure mode using PBKDF2 and AES-GCM.

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm test
```

See [docs/PROJECT_BRIEF.md](docs/PROJECT_BRIEF.md) for the full product brief and
[docs/references/latest-ui-reference.svg](docs/references/latest-ui-reference.svg) for the
current visual reference.
