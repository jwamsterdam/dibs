# Architecture Principles — Clean Architecture for Feature Slices

Applies **Clean Architecture** to our feature-based React app. This is the _how_; the
[Technical Architecture Plan](../Technical-Architecture-Plan.md) is the _what & why_. Any
deviation requires an ADR (see [git & pull requests](git-and-pull-requests.md)).

## The dependency rule

Dependencies point **inward**, toward stable domain logic. The framework, router, and network
live at the **edges**; business rules do not depend on them.

```
Pages / Components  →  Hooks (use cases)  →  Data layer  →  Domain types (Zod)
   (React, router)      (orchestration)      (fetch/query)  (pure, framework-free)
        outer  ────────────────────────────────────────────────►  inner
```

- Inner layers know **nothing** about outer ones. Domain types never import React.
- A component may call a hook; a hook may call the data layer; the data layer returns domain
  types. Never the reverse.

## Layers & responsibilities

| Layer                 | Responsibility                                             | Must not                               |
| --------------------- | ---------------------------------------------------------- | -------------------------------------- |
| **Pages**             | Route entry; compose hooks + components. Ultra-thin.       | Contain business logic or fetch data   |
| **Components**        | Render props; emit events. Presentational.                 | Fetch, validate, or hold app state     |
| **Hooks / use cases** | Orchestrate queries, mutations, validation, derived state. | Render JSX; know about routes' details |
| **Data layer**        | `fetch` clients + TanStack Query, parsed at the boundary.  | Be called directly from components     |
| **Domain types**      | Zod schemas + inferred TS types; the shared vocabulary.    | Import React/router/network            |

## Feature slices & boundaries

- Each feature is a **vertical slice** under `src/features/<feature>/` with its own
  `api / components / hooks / pages / store / types / validation` and an `index.ts` barrel.
- **Features never import from other features.** Shared logic moves to `shared/`. This is
  enforced by `eslint-plugin-boundaries` (`boundaries/dependencies`) and `import/no-cycle` —
  a cross-feature import fails lint, so this is not left to discipline.
- The `index.ts` barrel is the feature's only public surface. Keep it minimal and intentional.

## "Where does X go?"

| You have…                                   | It goes in…                                     |
| ------------------------------------------- | ----------------------------------------------- |
| Logic used by 2+ features                   | `shared/` (lib / hooks / components)            |
| Logic used by one feature                   | that feature's slice                            |
| A pure helper (no React)                    | `shared/lib/` or the feature's `lib`            |
| A Zod schema / domain type                  | `validation/` + `types/` in the slice           |
| A call to an external API                   | the feature's `data/` client, wrapped in a hook |
| Cross-cutting UI (Button, ConnectionStatus) | `shared/components/`                            |

## State placement (the decision tree)

| Data source                      | Home                                         |
| -------------------------------- | -------------------------------------------- |
| Server/external data             | TanStack Query                               |
| Form input                       | React Hook Form (never a global store)       |
| UI state (sidebar, selected tab) | Jotai atom, local to the feature             |
| Navigation / filter parameters   | TanStack Router search params (URL is state) |

Rule of thumb: **the URL owns navigation state; the server cache owns server state; Jotai owns
ephemeral UI state; forms own their own state until submit.** Do not mirror server data into a
global store.

## Keeping the framework at the edges

- Put decisions and rules in **hooks and pure functions**, not inside component bodies, so they
  can be tested without rendering.
- Depend on the **Zod-inferred types**, not on hand-copied shapes — the schema is the boundary.
- If a design forces an inward dependency (e.g. domain logic needing the router), that is a smell
  — it usually means the responsibility is in the wrong layer.
