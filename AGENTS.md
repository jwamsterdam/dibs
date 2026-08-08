# Configuration Tool Front-End — Agent Context

This file is the **root context** for every contributor, human and AI. It defines the
absolute rules and points to the role-specific instruction files. Read it before writing
any code. AI coding tools (Claude Code, Codex, etc.) load this file automatically; a
`CLAUDE.md` symlink points here so tool-specific loaders resolve the same content.

> **Goal:** consistent, architecture-compliant output despite the variability inherent in
> AI-assisted ("vibe") coding. The rules below are enforced automatically wherever possible
> (ESLint, TypeScript, SonarCloud, CI) so that violations fail fast rather than drift.

---

## Absolute rules (never break these)

- **NEVER use `any`.** TypeScript runs in `strict` mode; `@typescript-eslint/no-explicit-any` is an error.
- **NEVER use non-null assertions (`!`).** Handle the null/undefined case explicitly.
- **NEVER import from another feature.** Cross-feature reuse goes through `shared/`.
  Enforced by `import/no-cycle` and `no-restricted-imports`.
- **NEVER hand-edit `src/api/`.** It is codegen output (`@hey-api/openapi-ts` / `asyncapi-generator`).
- **NEVER use `dangerouslySetInnerHTML`.** ESLint-enforced (XSS).
- **NEVER hardcode colours** (e.g. `text-blue-500`). Use theme tokens routed through CSS variables.
- **NEVER store auth tokens in `localStorage`.** Use in-memory + httpOnly cookies.
- **NEVER add or change a dependency without approval.** Every new dependency requires a
  PR-level decision plus bundle-impact analysis (embedded Linux target).
- **ALWAYS write tests before a feature is considered done.** Tests are written from the
  requirements first (TDD); the feature is implemented until they pass.
- **ALWAYS validate with Zod** at trust boundaries — `.parse()` (not `.cast()`) on form
  inputs and API responses.

---

## Architecture (the shape you must preserve)

Feature-based **Clean Architecture**. Layers, top to bottom:

1. **Pages** — route-level components, ultra-thin, no business logic.
2. **Hooks / use cases** — orchestrate queries, mutations, validation, state.
3. **API layer** — TanStack Query hooks generated from OpenAPI/AsyncAPI.
4. **Domain types** — Zod schemas + TypeScript types.

Components are purely presentational (props in → events/callbacks out).

```
src/
├── app/          # providers, router, global error boundary
├── features/     # one vertical slice per RFQ module
│   └── <feature>/
│       ├── api/          # feature-specific TanStack Query hooks (thin wrappers)
│       ├── components/   # presentational components
│       ├── hooks/        # orchestration hooks
│       ├── pages/        # route components (thin)
│       ├── store/        # Jotai atoms (feature-local)
│       ├── types/        # feature types
│       ├── validation/   # Zod schemas
│       └── index.ts      # public barrel — the only external surface
├── shared/       # components, hooks, lib, types, i18n
├── api/          # GENERATED — rest/ (types.gen.ts, sdk.gen.ts) + ws/ (events.gen.ts)
└── styles/       # themes/ (light, dark, high-contrast) + global.css
```

**State decision tree**

| Data source                      | Home                                      |
| -------------------------------- | ----------------------------------------- |
| Server (REST)                    | TanStack Query                            |
| WebSocket event                  | `useWebSocket` hook → Jotai atom          |
| Form input                       | React Hook Form (never in a global store) |
| UI state (sidebar, selected tab) | Jotai atom (feature-local)                |
| Navigation / filter params       | TanStack Router search params             |

Full detail and rationale: [`docs/Technical-Architecture-Plan.md`](docs/Technical-Architecture-Plan.md).
Any deviation from the architecture requires an ADR in [`docs/adr/`](docs/adr/), approved by the Solution Architect.

---

## Detailed conventions (the "how")

This file holds the absolute rules. The applied, example-driven standards live in the
[conventions library](docs/conventions/) — read the relevant one before writing code:

- [Coding standards](docs/conventions/coding-standards.md) — Clean Code for TS + React
- [Architecture principles](docs/conventions/architecture-principles.md) — Clean Architecture applied
- [Testing conventions](docs/conventions/testing-conventions.md)
- [API integration](docs/conventions/api-integration.md)
- [UI, styling & i18n](docs/conventions/ui-styling-and-i18n.md)
- [Git & pull requests](docs/conventions/git-and-pull-requests.md)

---

## The team & who owns what

The project runs with **3 human members** and **8 virtual teammates**. Each virtual
teammate has a name, a role, and a dedicated instruction file. When acting as a teammate,
load that file as your working context.

| Teammate  | Role                       | Instruction file                                                           | Owns                                                                       |
| --------- | -------------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| **Solid** | Solution Architect         | [`docs/agents/SolutionArchitect.md`](docs/agents/SolutionArchitect.md)     | Architecture boundaries, ADRs, dependency rules, PR architecture review    |
| **Vibe**  | Senior Front-end Developer | [`docs/agents/Developer.md`](docs/agents/Developer.md)                     | Coding standards, component patterns, naming, implementation               |
| **Scope** | Business Analyst           | [`docs/agents/BusinessAnalyst.md`](docs/agents/BusinessAnalyst.md)         | Requirements, Gherkin acceptance criteria, documenting what was built      |
| **Probe** | Tester / QA                | [`docs/agents/Tester.md`](docs/agents/Tester.md)                           | Test strategy, coverage, Arrange-Act-Assert patterns, traceability         |
| **Aegis** | Security specialist        | [`docs/agents/Security.md`](docs/agents/Security.md)                       | OWASP checks, secure patterns, dependency audit                            |
| **Pixel** | UX / Design Guardian       | [`docs/agents/UXGuardian.md`](docs/agents/UXGuardian.md)                   | Figma adherence, correct Untitled UI usage, a11y                           |
| **Flux**  | DevOps                     | [`docs/agents/DevOps.md`](docs/agents/DevOps.md)                           | CI/CD, Vite build config, embedded Linux deployment                        |
| **Watt**  | Performance Engineer       | [`docs/agents/PerformanceEngineer.md`](docs/agents/PerformanceEngineer.md) | Runtime performance, profiling, budgets, Lighthouse, embedded/nginx tuning |

**The three human members** (Solution Architect, Senior Front-end Developer, Business
Analyst) direct, review and are accountable for the virtual teammates' output. AI teammates
propose; humans dispose. Nothing merges without human review and a green CI pipeline.

---

## Working method (per sprint / per feature)

Follow this order — it is a TDD loop, not a suggestion:

1. **Scope** turns the requirement into Gherkin (Given/When/Then) acceptance criteria.
2. **Probe** writes failing Jest/Cypress tests from those criteria.
3. **Vibe** implements until the tests pass — nothing more, nothing less.
4. **Solid** reviews the PR for architecture-boundary compliance (ADR if deviating).
5. **Pixel** verifies the visual output against Figma via Storybook.
6. **Aegis** reviews any security-sensitive change against the OWASP checklist.
7. **Flux** ensures CI/build/deploy stay green and within budget.
8. **Watt** checks performance budgets on perf-sensitive changes (measured under device-like throttling).
9. A **human** reviews and approves the PR.

Not every teammate reviews every change — steps 5–8 are applied per the **review routing
matrix** in [`docs/delivery-workflow.md`](docs/delivery-workflow.md), which maps each change
type to its required reviewers.

---

## Quality bar (enforced, not aspirational)

- **Coverage:** ≥80% statements/lines, ≥75% branches, ≥85% functions (generated `src/api/` excluded).
- **SonarCloud Quality Gate:** A ratings for Reliability/Security/Maintainability; 100% hotspots
  reviewed; <3% duplication on new code; cognitive complexity ≤15/function. **Blocks merge.**
- **ESLint critical rules (all `error`):** `no-explicit-any`, `no-non-null-assertion`,
  `ban-ts-comment`, `react-hooks/exhaustive-deps`, `import/no-cycle`, `react/no-danger`,
  the full `jsx-a11y` recommended set, a `no-restricted-syntax` rule banning hardcoded palette
  colours, and **`boundaries/dependencies`** — which blocks cross-feature imports (a feature may
  import `shared`/`api`/`styles` and only its own slice). `no-console` is a warning.
- **Performance gate:** `npm run check:bundle` fails when the gzipped bundle exceeds budget
  (see [`docs/performance/budgets.md`](docs/performance/budgets.md)).
- **Pre-commit:** `lint-staged` → eslint --fix → prettier → `tsc --noEmit`; `commitlint`
  (Conventional Commits: `feat|fix|chore|docs|test|refactor|perf(scope): description`).
- **CI (every PR):** type-check → lint → unit + coverage → SonarCloud → `npm audit`
  (critical = fail) → Vite build → bundle-budget check. Cypress E2E nightly + on release branches.

---

## Performance (embedded Linux target)

The static front-end runs on resource-constrained embedded Linux. Therefore:

- Route-based code splitting (TanStack Router lazy imports) + feature chunks (Vite `manualChunks`).
- Bundle budget: initial JS < 300 KB gzipped _(to confirm with client)_; CI warns on breach.
- i18n translations lazy-loaded per namespace, not all at startup.
- Every new dependency needs explicit approval + bundle-impact analysis.

---

## Security baseline

| Aspect           | Measure                                                                                |
| ---------------- | -------------------------------------------------------------------------------------- |
| Input validation | Zod `.parse()` on all form inputs and API responses                                    |
| XSS              | No `dangerouslySetInnerHTML` (ESLint-enforced)                                         |
| Auth / session   | Tokens in memory + httpOnly cookie, never `localStorage`                               |
| Secrets          | `detect-secrets` pre-commit hook + SonarCloud rule                                     |
| Dependencies     | `npm audit` in CI (critical = build failure) + Dependabot                              |
| CSP              | Configured on the embedded Linux platform (client responsibility)                      |
| OWASP Top 10     | Checklist in [`docs/agents/Security.md`](docs/agents/Security.md), applied on every PR |

---

## API integration

- **REST:** client commits `openapi.yaml` → `npm run generate:api` → `src/api/rest/`
  (`types.gen.ts`, `sdk.gen.ts`). No manual `fetch()`; always use generated hooks. Feature
  `api/` files are thin wrappers.
- **WebSocket:** `asyncapi.yaml` → `asyncapi-generator` → `src/api/ws/events.gen.ts` →
  `shared/lib/ws/client.ts` (factory + exponential-backoff reconnect) → `useWebSocket` →
  Jotai atoms. A `<ConnectionStatus>` component always shows connected / disconnected /
  reconnecting.
- **Mocks:** MSW v2 handlers, identical in dev and tests — develop without a live backend.

---

## Internationalisation & theming

- **i18n:** react-i18next, one namespace per feature, lazy-loaded, type-safe keys via
  `i18next.d.ts` augmentation (missing/misspelled keys are compile errors). Client provides
  translations; we provide the JSON structure and key conventions.
- **Theming:** Untitled UI + Tailwind via CSS custom properties; switch by setting
  `data-theme` on the root element. Active theme in a Jotai atom + `localStorage`. Only
  Tailwind utilities routed through CSS vars — hardcoded colours forbidden.

---

_This is a living document. Changes go through a Pull Request approved by the Solution Architect._
