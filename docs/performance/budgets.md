# Performance Budgets

Provisional budgets — **to be confirmed against the real target hardware in WP4**. Measured
under device-like throttling, not on a fast dev machine. CI warns (and later fails) on breach.

## Bundle (build-time — enforced with Flux)

| Metric                | Budget                          |
| --------------------- | ------------------------------- |
| Initial JS (gzipped)  | < 300 KB _(to confirm)_         |
| Initial CSS (gzipped) | < 50 KB _(to confirm)_          |
| Per-route lazy chunk  | < 150 KB gzipped _(to confirm)_ |

## Runtime (Core Web Vitals — measured under throttling)

| Metric                          | Budget                         |
| ------------------------------- | ------------------------------ |
| LCP (Largest Contentful Paint)  | < 2.5 s                        |
| INP (Interaction to Next Paint) | < 200 ms                       |
| CLS (Cumulative Layout Shift)   | < 0.1                          |
| TBT (Total Blocking Time)       | < 300 ms                       |
| Peak JS heap                    | fits device RAM _(to confirm)_ |

## Baselines

_Recorded once the app runs on (or emulating) the target device. Each entry: date, route,
conditions (throttling), and measured values._

| Date | Route | Conditions | LCP | INP | CLS | TBT | Notes       |
| ---- | ----- | ---------- | --- | --- | --- | --- | ----------- |
| —    | —     | —          | —   | —   | —   | —   | pending WP4 |
