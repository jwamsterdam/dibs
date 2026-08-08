# ADR-0001: Front-end architecture and technology stack

- **Status:** Accepted
- **Date:** 2026-07-07
- **Deciders:** Solution Architect (human) + Solid
- **Related:** WP0 — Foundation & Tooling; [Technical Architecture Plan](../Technical-Architecture-Plan.md)

## Context

The project delivers the front-end layer of a hardware configuration tool, deployed as a
**static site on an embedded Linux platform** (served by nginx) with limited CPU/RAM. It
integrates with customer-provided **REST (OpenAPI)** and **WebSocket (AsyncAPI)** APIs, must
support **multiple languages and themes**, and spans ~180 clickable pages across a dozen
functional modules built over ~20 sprints. The stack is partly fixed by requirement
(React 19, TypeScript, Untitled UI, Vite) and the code will be produced by a mixed team of
humans and AI agents, so boundaries must be enforceable automatically.

## Decision

We will structure the app as a **feature-based Clean Architecture**: vertical feature slices
(`src/features/<feature>/`) layered as pages → hooks → API → domain types, with cross-feature
reuse only through `shared/`. We adopt:

- **TanStack Router** (type-safe routing + URL state) and **TanStack Query** (REST server state);
- **Jotai** for UI/WebSocket state and **React Hook Form + Zod** for forms and validation;
- **generated API clients** (`@hey-api/openapi-ts`, `asyncapi-generator`) in `src/api/` — never hand-edited;
- **MSW** for dev/test mocking, **Jest/RTL + Cypress** for tests, **Storybook** for the design system;
- **TypeScript `strict`**, **ESLint 9** boundary rules (`import/no-cycle`, `no-restricted-imports`),
  and a **SonarCloud** Quality Gate — so architecture and quality rules fail fast in CI.

## Consequences

- Boundaries are machine-enforced, which keeps AI-assisted output consistent and reviewable.
- Generated clients stay in sync with the specs, eliminating hand-written types and drift.
- The learning curve (TanStack + Jotai + codegen) is front-loaded; WP0 absorbs it.
- The embedded-Linux performance budget must be actively monitored (see Watt / WP-level budgets),
  because a feature-rich SPA can exceed constrained hardware limits if unmanaged.
- Any deviation from this structure requires a new ADR.

## Alternatives considered

- **Next.js / SSR framework** — rejected: the target is a static bundle on embedded Linux with
  no Node runtime; SSR adds cost without benefit here.
- **Redux Toolkit for all state** — rejected: heavier boilerplate; server state is better served
  by TanStack Query and local state by Jotai.
- **Hand-written API client + types** — rejected: drifts from the spec and wastes effort when the
  customer owns and updates the OpenAPI/AsyncAPI contracts.
- **Layer-based folders (components/, hooks/, pages/ at the root)** — rejected: does not scale to
  ~180 pages and encourages tangled cross-imports.
