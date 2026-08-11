# API Integration

Extends [`AGENTS.md`](../../AGENTS.md) and expands the plan's [§4](../Technical-Architecture-Plan.md).

## REST (direct fetch + Zod)

- No backend of our own. External APIs (e.g. CoinGecko, per ADR-0005) are called directly
  from the client via `shared/lib/http/client.ts` (a thin typed `fetch` wrapper), behind a
  feature-owned data source (e.g. `features/portfolio/data/coingeckoClient.ts`).
- Every response is parsed with a Zod schema before use — never trust the wire shape.
- Requests go through TanStack Query (caching, retry, `staleTime`) rather than ad hoc
  `useEffect` + `fetch`.

```ts
// features/portfolio/data/coingeckoClient.ts
export async function getCoinGeckoTopCoins(): Promise<readonly CoinSearchResult[]> {
  const data = await apiGet('/coins/markets', { params: { vs_currency: 'eur' } });
  return coinSearchResultSchema.array().parse(data);
}
```

## Validate at the boundary (Zod)

- Parse untrusted input — form values and, where shapes are uncertain, API responses — with
  Zod `.parse()` (never `.cast()`). Derive TS types with `z.infer`.
- Share one schema between the form (via `@hookform/resolvers`) and any response parsing so the
  rules cannot drift.

## Mandatory UI states

Every data-driven view handles all of:

- **Loading** — skeleton/spinner, never a blank flash.
- **Empty** — a deliberate empty state, not a zero-row table with no explanation.
- **Error** — a recoverable message (with retry where sensible), driven by the query error.
- **Permission** — what the user sees when they may not act.

## Mocking (MSW)

- MSW v2 handlers mirror the contracts and are shared between dev and tests, so "works in dev"
  and "works in tests" mean the same thing.
- Develop against mocks when the backend is unavailable; keep handlers in sync with the spec.

## Errors & retries

- Configure retry/stale times centrally in the QueryProvider; override per query only with reason.
- Surface server errors through the query's error state and the UI error state above — do not
  `try/catch` and swallow.
