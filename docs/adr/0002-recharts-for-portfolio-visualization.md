# ADR-0002: Recharts for portfolio visualization

- **Status:** Accepted
- **Date:** 2026-08-08
- **Deciders:** Solution Architect (human) + Solid
- **Related:** Dibs portfolio chart; mobile/PWA bundle budget

## Context

The Dibs portfolio view needs a compact, accessible time-series chart for local mock
portfolio data. The chart must support responsive sizing, themed strokes/fills through CSS
variables, and predictable rendering inside an iPhone-first layout without introducing API
or storage changes.

Adding a charting dependency is normally blocked unless the repository records the
approval rationale, alternatives, audit status, and measured bundle impact.

## Decision

Use `recharts` for the portfolio area chart, isolated behind the portfolio feature route
and a dedicated `charts` manual chunk. The dependency remains feature-local in usage:
`PortfolioChart` is presentational, receives already-labelled chart points, and does not
own portfolio business logic or translation decisions.

## Approval Rationale

- Recharts provides accessible SVG chart primitives and responsive layout support with a
  small implementation surface for this view.
- The portfolio chart is user-facing core functionality, not decorative UI.
- The dependency is route-split so it does not load before the portfolio route/component
  boundary requires it.
- The generated API boundary is unaffected; current portfolio data remains local mock data
  validated through the existing Zod schema.

## Alternatives Considered

- **Hand-written SVG chart**: rejected because it would duplicate axis, scaling,
  responsive layout, and animation behavior that a maintained library already provides.
- **D3-only implementation**: rejected because the app only needs a simple area chart and
  D3 would require more custom React integration code.
- **Chart.js**: rejected because canvas rendering makes theme integration and semantic
  SVG inspection less direct for this use case.
- **No dependency / static sparkline**: rejected because the product requirement calls for
  a readable historical chart with axes and responsive behavior.

## Audit Status

- `recharts@^3.10.1` is recorded in `package.json`.
- `npm audit --audit-level=critical` completed with **0 vulnerabilities** on 2026-08-08.
- No `src/api/` files are changed by this decision.

## Measured Bundle Impact

Measured on the current branch after the chart split:

- `charts` chunk gzip: **73.94 KB**
- Total JavaScript gzip: **243.9 KB / 300 KB**
- Largest chunk gzip: **125.8 KB / 200 KB**

Follow-up validation after lazy namespace splitting remains within budget:
`npm run check:bundle` reports total JavaScript gzip at **244.6 KB / 300 KB**.

## Consequences

- The portfolio route must stay lazy-loaded so Recharts does not become part of the root
  application graph unnecessarily.
- Future chart work should reuse the same feature boundary and `charts` chunk strategy
  unless a later ADR supersedes this decision.
