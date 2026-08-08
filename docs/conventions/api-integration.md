# API Integration

Contract-first. The customer owns the OpenAPI/AsyncAPI specs; we generate typed clients from
them. Extends [`AGENTS.md`](../../AGENTS.md) and expands the plan's [§4](../Technical-Architecture-Plan.md).

## REST (OpenAPI → generated hooks)

- The spec (`openapi.yaml`) is the source of truth. Run `npm run generate:api` →
  `src/api/rest/` (`types.gen.ts`, `sdk.gen.ts`). **Never hand-edit `src/api/`** — it is
  regenerated and your edits will be lost (and lint blocks it).
- No manual `fetch()` anywhere. Always use the generated TanStack Query hooks.
- A feature's `api/` folder holds **thin wrappers** that configure the generated hooks
  (query keys, select, enabled) — not a second data layer.

```ts
// features/zones/api/useZones.ts
export function useZones() {
  return useGetZonesQuery(undefined, { staleTime: 30_000 });
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

## WebSocket (AsyncAPI → events → Jotai)

- Types generated from `asyncapi.yaml` via `npm run generate:ws` → `src/api/ws/`.
- The socket is created by `shared/lib/ws/client.ts` (factory + exponential-backoff reconnect),
  consumed via `shared/hooks/useWebSocket`, and its events feed **Jotai atoms** — not the query
  cache.
- Connection status (connected / disconnected / reconnecting) is always visible via
  `<ConnectionStatus>`.

## Mocking (MSW)

- MSW v2 handlers mirror the contracts and are shared between dev and tests, so "works in dev"
  and "works in tests" mean the same thing.
- Develop against mocks when the backend is unavailable; keep handlers in sync with the spec.

## Errors & retries

- Configure retry/stale times centrally in the QueryProvider; override per query only with reason.
- Surface server errors through the query's error state and the UI error state above — do not
  `try/catch` and swallow.
