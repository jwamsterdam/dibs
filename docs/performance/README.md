# Performance

Performance budgets, baselines, and profiling reports for the embedded Linux + nginx target.
Owned by **Watt** (Performance Engineer).

## Why this matters

The app ships as a static bundle served by nginx on resource-constrained embedded hardware.
A feature-rich SPA can exceed the device's CPU/RAM limits if performance is not actively
measured and budgeted — so performance is treated as a first-class, gated concern, not an
afterthought.

## Contents

- [`budgets.md`](budgets.md) — the agreed performance budgets and current baselines.
- [`nginx-serving.md`](nginx-serving.md) — advisory serving requirements for the platform team.
- Dated profiling reports (`YYYY-MM-DD-<topic>.md`) as they are produced.

## Tooling

- **Lighthouse / Lighthouse CI (`@lhci/cli`)** — same engine as Google PageSpeed Insights, run
  locally and in CI against the production build served statically. Chosen over hosted PageSpeed
  Insights because the embedded target has no public URL.
- **Chrome DevTools performance** + **React Profiler** for runtime traces.
- **CPU/network throttling** to emulate the device — never measure only on a fast dev machine.

> Scaffolded for WP4+ (performance tests on target hardware). Budgets are provisional until
> confirmed against the real device.
