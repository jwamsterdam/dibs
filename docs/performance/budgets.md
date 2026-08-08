# Dibs Performance Budgets

Current budgets:

| Metric | Budget |
| --- | --- |
| Total JS gzip | < 310 KB |
| Largest JS chunk gzip | < 200 KB |
| CSS gzip | < 50 KB |

Use `npm run check:bundle` after production builds. Recharts is tracked in its own
`charts` chunk and documented in ADR-0002. React Aria Components increased the
total JavaScript budget by 10 KB in ADR-0004; keep imports scoped to package subpaths
and revisit route-level splitting if settings grows further.

Future budgets should add Core Web Vitals targets for the portfolio route and settings
route once those flows stabilize.
