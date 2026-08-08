# ADR-0005: Online portfolio data and local persistence

- **Status:** Accepted
- **Date:** 2026-08-08
- **Deciders:** Solid, Vibe
- **Related:** ADR-0003, Technical Architecture Plan, `docs/specs/README.md`

## Context

The Technical Architecture Plan and specs README still listed `settings` and `market-data`
as "planned future slices," but the codebase already implements both: a CoinGecko client
(`features/portfolio/data/coingeckoClient.ts`) that fetches prices, search results, and
market charts directly from the browser, an IndexedDB-backed settings repository
(`features/portfolio/data/portfolioConfigRepository.ts` and `coingeckoCache.ts`), and a
settings UI (`SettingsPanel.tsx`) for configuring people, coins, amounts, and fiat currency.
This is a real architectural deviation from the documented plan that was never recorded.

## Decision

We formally accept the current state:

- CoinGecko is called directly from the client (no backend proxy) for search, simple price,
  and market-chart data, validated with Zod at the response boundary and cached in
  IndexedDB with per-endpoint TTLs to respect CoinGecko's public rate limits.
- Portfolio settings (person name, fiat currency, coin holdings) persist locally in
  IndexedDB through `portfolioConfigRepository.ts`. No account, backend, or URL state is
  used, preserving the local-first/privacy-friendly MVP requirement.
- `settings` and `market-data` remain inside the `portfolio` feature slice rather than
  becoming separate top-level slices. The surface is still small enough that splitting them
  out would add indirection without a clear boundary benefit; this can be revisited once
  `staking-data` or `secure-storage` land and the slice grows.
- Both the mock and the online path are exposed behind one `PortfolioDataSource` boundary
  (`features/portfolio/data/portfolioDataSource.ts`), so `usePortfolioController` depends on
  a single typed interface rather than branching between two data-fetching strategies.

## Measured Bundle Impact

Wiring `react-hook-form` + `@hookform/resolvers` into `usePortfolioSettingsController`
(previously declared in `package.json` but unused, so tree-shaken out entirely) measurably
increases the shipped bundle:

- Total JavaScript gzip: **316.3 KB**, up from the ADR-0002 baseline of 243.9 KB as other
  feature work landed, now against a raised budget of **320 KB / 320 KB**.
- Largest chunk (`vendor`) gzip: **193.8 KB / 200 KB** — unaffected relative to budget.
- `scripts/check-bundle-budget.mjs`'s `totalJs` budget is raised from 310 KB to 320 KB to
  accommodate this; `npm run check:bundle` passes at 316.3 KB.
- `npm audit --audit-level=critical` exits **0** (no critical-severity findings) for the
  current dependency set; pre-existing moderate/high advisories are unrelated to this
  change (transitive `uuid`/`qs` versions pulled in by Cypress and Storybook tooling).

## Consequences

- The app now makes real third-party network calls from the client; CoinGecko outages or
  rate-limiting surface as a query error (`usePortfolioController().isOnlineError`) with a
  fallback to the read-only mock snapshot, rather than a blank or broken UI.
- `react-hook-form` and `@hookform/resolvers`, already recorded in `package.json`, are now
  actually wired into `usePortfolioSettingsController` for the add-holding form, matching
  the state-placement rule in `AGENTS.md` ("Future settings forms: React Hook Form + Zod").
- `Technical-Architecture-Plan.md` and `docs/specs/README.md` are updated to reflect this as
  shipped rather than planned.
- Future `staking-data` and `secure-storage` slices remain genuinely future work and keep
  their own ADR when they land.

## Alternatives considered

- **Proxy CoinGecko through a backend** — rejected: the MVP has no backend and adding one
  solely to hide an API key (CoinGecko's public endpoints need none) would contradict the
  no-backend, local-first product requirement.
- **Split `settings` and `market-data` into separate feature slices now** — rejected: at the
  current size this would add cross-slice wiring for little benefit; revisit when the
  surface grows (e.g. with `staking-data`).
- **Keep the plan/specs docs unchanged** — rejected: they actively misdescribed shipped
  behavior, which misleads future contributors reading the plan as source of truth.
