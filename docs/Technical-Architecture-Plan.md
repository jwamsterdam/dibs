# Front-End Technical Architecture Plan

Front-end development of a hardware configuration tool.

**Full launch target:** November 2027 &nbsp;|&nbsp; **Intermediate milestone:** Mid 2027

> This is the source-of-truth architecture document. It is a living document —
> updates go through a Pull Request, approved by the Solution Architect.

---

## 1. Technology Stack — Overview

### 1.1 Core

| Concern    | Choice                        | Rationale                                                       |
| ---------- | ----------------------------- | --------------------------------------------------------------- |
| Framework  | React 19                      | Requirement; Server Components optional at a later stage        |
| Language   | TypeScript 5 (`strict: true`) | Requirement; compiler catches whole classes of bugs early       |
| Build tool | Vite 6                        | Requirement; fast HMR, optimal static output for embedded Linux |
| UI Library | Untitled UI (Tailwind CSS)    | Requirement                                                     |
| Router     | TanStack Router v1            | Type-safe routes, URL state management; fits the ecosystem      |

### 1.2 Data & State

| Concern             | Choice                        | Rationale                                                      |
| ------------------- | ----------------------------- | -------------------------------------------------------------- |
| Server state (REST) | TanStack Query v5             | Caching, loading/error states, polling, stale-while-revalidate |
| WebSocket state     | Custom `useWebSocket` → Jotai | AsyncAPI events feed Jotai atoms; decoupled from query cache   |
| Client / UI state   | Jotai                         | Atomic, minimal boilerplate, easy to test                      |
| Form handling       | React Hook Form               | Performant (uncontrolled), pairs with the Zod resolver         |
| Validation schemas  | Zod                           | Runtime type safety; schemas shared between forms and API      |

### 1.3 API Integration

| Concern                | Choice                           | Rationale                                                        |
| ---------------------- | -------------------------------- | ---------------------------------------------------------------- |
| REST codegen           | `@hey-api/openapi-ts`            | Auto-generates TypeScript types + TanStack Query hooks from spec |
| WebSocket typing       | `asyncapi-generator` + templates | TypeScript event payload types derived from the AsyncAPI spec    |
| API mocking (dev/test) | MSW v2 (Mock Service Worker)     | Identical handlers in development and unit/e2e tests             |

### 1.4 Internationalisation & Theming

| Concern | Choice                               | Rationale                                              |
| ------- | ------------------------------------ | ------------------------------------------------------ |
| i18n    | `react-i18next` + i18next-typescript | Type-safe translation keys, lazy loading per namespace |
| Theming | CSS custom properties via Tailwind   | Switch colour schemes via `data-theme` on root element |

### 1.5 Quality & Tooling

| Concern             | Choice                                                                         |
| ------------------- | ------------------------------------------------------------------------------ |
| Linting             | ESLint 9 (flat config) + `@typescript-eslint`, `eslint-plugin-react`, `import` |
| Formatting          | Prettier + `eslint-config-prettier`                                            |
| Git hooks           | Husky + lint-staged + commitlint (Conventional Commits)                        |
| Static analysis     | SonarCloud                                                                     |
| Dependency security | `npm audit` (CI) + Snyk / GitHub Dependabot                                    |
| Bundle analysis     | `rollup-plugin-visualizer` (every production build)                            |
| Accessibility       | jest-axe (unit) + cypress-axe (e2e)                                            |
| Component docs      | Storybook 8                                                                    |
| Architecture docs   | ADRs in `docs/adr/` (Architecture Decision Records)                            |

### 1.6 Testing

| Level             | Tool                                       |
| ----------------- | ------------------------------------------ |
| Unit / Component  | Jest + React Testing Library               |
| E2E / Workflows   | Cypress                                    |
| API mocking       | MSW v2                                     |
| Visual regression | _(optional phase 2)_ Chromatic + Storybook |

---

## 2. Repository Structure

Feature-based Clean Architecture. Features are vertical slices that follow the domain.

```
src/
├── app/                          # Bootstrap: providers, router, global error boundary
│   ├── App.tsx
│   ├── router.tsx
│   ├── providers/
│   │   ├── QueryProvider.tsx
│   │   ├── ThemeProvider.tsx
│   │   └── I18nProvider.tsx
│   └── ErrorBoundary.tsx
│
├── features/                     # Vertical feature slices (one per module)
│   ├── auth/
│   ├── dashboard/
│   ├── configuration-wizard/
│   ├── user-management/
│   ├── system-composition/
│   ├── device-options/           # Largest and most complex feature
│   ├── system-options/
│   ├── zones/
│   ├── call-definition/
│   ├── background-music/
│   ├── actions/
│   ├── audio-processing/
│   ├── diagnostics/
│   ├── settings/
│   └── operator-portal/
│       ├── scheduler/
│       ├── bgm-control/
│       └── message-editor/
│
├── shared/                       # Shared across all features
│   ├── components/               # Generic UI components (Untitled UI wrappers)
│   ├── hooks/                    # Shared custom hooks
│   ├── lib/                      # Utilities, helpers, constants
│   ├── types/                    # Global TypeScript types
│   └── i18n/                     # i18next setup + translation files
│       └── locales/  (en/ | nl/)
│
├── api/                          # GENERATED – do not edit manually
│   ├── rest/  (types.gen.ts, sdk.gen.ts)
│   └── ws/    (events.gen.ts)
│
└── styles/
    ├── themes/  (light.css, dark.css, high-contrast.css)
    └── global.css
```

**Internal structure per feature slice**

```
features/device-options/
├── api/            # Feature-specific TanStack Query hooks
├── components/     # Presentational / dumb components
├── hooks/          # Feature-specific orchestration hooks
├── pages/          # Route-level components (thin; delegate to hooks)
├── store/          # Jotai atoms for local feature state
├── types/          # Feature-specific TypeScript types
├── validation/     # Zod schemas for forms and API responses
└── index.ts        # Public barrel export (what is visible externally)
```

**Hard rule:** features must never import directly from other features. Shared logic
goes into `shared/`. Enforced automatically via `eslint-plugin-import`/`no-cycle`.

---

## 3. Architecture Principles

### 3.1 Clean Architecture Layers

```
┌─────────────────────────────────────────┐
│  Pages  (route components, ultra-thin)  │
├─────────────────────────────────────────┤
│  Hooks / Use Cases  (orchestration)     │
├─────────────────────────────────────────┤
│  API Layer  (TanStack Query + codegen)  │
├─────────────────────────────────────────┤
│  Domain Types  (Zod schemas + TS types) │
└─────────────────────────────────────────┘
```

- Pages contain no business logic — they delegate entirely to hooks
- Components are purely presentational (props in → events/callbacks out)
- Hooks orchestrate queries, mutations, validation, and state
- API layer is fully generated; manual edits are blocked by lint rules

### 3.2 TypeScript Strict Config

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "noUncheckedIndexedAccess": true
  }
}
```

### 3.3 State Strategy — Decision Tree

| Question                           | Home                             |
| ---------------------------------- | -------------------------------- |
| Data comes from the server (REST)? | TanStack Query                   |
| Data comes via WebSocket?          | `useWebSocket` hook → Jotai atom |
| Form input?                        | React Hook Form (never global)   |
| UI state (sidebar, selected tab)?  | Jotai atom (local to feature)    |
| Navigation / filter parameters?    | TanStack Router search params    |

---

## 4. API Integration

### 4.1 REST (OpenAPI → Codegen)

```
openapi.yaml
    ↓  npm run generate:api
@hey-api/openapi-ts
    ↓
src/api/rest/
    ├── types.gen.ts     (all request/response types)
    └── sdk.gen.ts       (TanStack Query hooks per endpoint)
```

- Codegen runs automatically in CI on every spec change (committed by the customer)
- No manual `fetch()` calls; always use generated hooks
- Feature `api/` files are thin wrappers that configure the generated hooks

### 4.2 WebSocket (AsyncAPI → Typing)

```
asyncapi.yaml
    ↓  asyncapi-generator
src/api/ws/events.gen.ts   (event payload types)
    ↓
shared/lib/ws/client.ts    (WebSocket factory, reconnect logic)
    ↓
shared/hooks/useWebSocket.ts
    ↓
features/*/store/*.atoms.ts  (Jotai atoms fed by WS events)
```

Connection status (connected / disconnected / reconnecting) is always visible in the UI
via a `<ConnectionStatus>` component. Reconnect uses exponential backoff.

---

## 5. Theming — Untitled UI + Tailwind

Untitled UI is built on Tailwind CSS and supports theming via CSS custom properties.
Switch colour schemes by setting the `data-theme` attribute on the root element.

```css
/* styles/themes/light.css */
:root[data-theme='light'] {
  --color-brand-primary: #3b82f6;
  --color-bg-primary: #ffffff;
  --color-text-primary: #111827;
}

:root[data-theme='dark'] {
  --color-brand-primary: #60a5fa;
  --color-bg-primary: #111827;
  --color-text-primary: #f9fafb;
}
```

```ts
// tailwind.config.ts
theme: {
  extend: {
    colors: {
      brand: { primary: 'var(--color-brand-primary)' },
      bg: { primary: 'var(--color-bg-primary)' },
    },
  },
}
```

The active theme is stored in a Jotai atom + `localStorage`. Toggle via
`document.documentElement.setAttribute('data-theme', newTheme)`.

All new components must only use Tailwind utilities that route through CSS vars.
Hardcoded colour values (e.g. `text-blue-500`) are forbidden via a custom ESLint rule.

---

## 6. Internationalisation — react-i18next

```
src/shared/i18n/
├── index.ts                  # i18next initialisation (lazy loading enabled)
├── locales/
│   ├── en/
│   │   ├── common.json       # Shared labels, error messages, buttons
│   │   ├── device-options.json
│   │   └── ...               # One namespace per feature
│   └── nl/
└── types/
    └── i18next.d.ts          # TypeScript augmentation: type-safe translation keys
```

- Translation files are lazy-loaded per namespace (not everything at startup — embedded Linux)
- The customer provides the translations; the supplier provides the JSON structure and key conventions
- TypeScript augmentation ensures missing or misspelled keys produce compile errors

---

## 7. Quality Management

### 7.1 Coverage Targets (Jest)

| Metric       | Target | Exceptions             |
| ------------ | ------ | ---------------------- |
| % Statements | ≥ 80%  | `src/api/` (generated) |
| % Branches   | ≥ 75%  | `src/api/` (generated) |
| % Functions  | ≥ 85%  | `src/api/` (generated) |
| % Lines      | ≥ 80%  | `src/api/` (generated) |

Coverage report is published as an artifact on every CI run.

### 7.2 SonarCloud Quality Gate

| Metric                       | Target                |
| ---------------------------- | --------------------- |
| Reliability Rating           | A (0 open bugs)       |
| Security Rating              | A (0 vulnerabilities) |
| Maintainability Rating       | A                     |
| Security Hotspots Reviewed   | 100%                  |
| Coverage on new code         | ≥ 80%                 |
| Duplicated lines on new code | < 3%                  |
| Cognitive Complexity / func. | ≤ 15                  |

The Quality Gate automatically blocks PR merges when targets are not met.

### 7.3 ESLint — Critical Rules

```json
{
  "@typescript-eslint/no-explicit-any": "error",
  "@typescript-eslint/explicit-function-return-type": "warn",
  "@typescript-eslint/no-non-null-assertion": "error",
  "react-hooks/exhaustive-deps": "error",
  "import/no-cycle": "error",
  "no-console": "warn",
  "no-restricted-imports": ["error", { "patterns": ["../*/features/*"] }]
}
```

`import/no-cycle` is the automated technical guardian of Clean Architecture boundaries.

### 7.4 Pre-commit Pipeline

```
git commit
  └─ lint-staged:
       *.{ts,tsx}  →  eslint --fix  →  prettier --write  →  tsc --noEmit
       *.json      →  prettier --write
  └─ commitlint:   (feat|fix|chore|docs|test|refactor|perf)(<scope>): <description>
```

### 7.5 CI Pipeline (every PR)

```
install
  → type-check (tsc --noEmit)
  → lint (eslint)
  → unit tests + coverage report
  → SonarCloud scan + Quality Gate check
  → npm audit (critical = build failure)
  → vite build
  → bundle analysis report
```

E2E tests (Cypress) run nightly and on release branches.

---

## 8. Security

| Aspect                   | Measure                                                                         |
| ------------------------ | ------------------------------------------------------------------------------- |
| Input validation         | Zod on all form inputs and API responses (`.parse()`, not `.cast()`)            |
| XSS                      | No `dangerouslySetInnerHTML`; ESLint rule enforces this                         |
| Authentication / session | Tokens not in `localStorage`; use memory + httpOnly cookie                      |
| Hardcoded secrets        | `detect-secrets` pre-commit hook + SonarCloud rule                              |
| Dependencies             | `npm audit` in CI; critical vulnerabilities = build failure; Dependabot         |
| Content Security Policy  | CSP headers configured on the embedded Linux platform (customer responsibility) |
| OWASP Top 10             | Checklist in the Security agent as reference context on every PR                |

---

## 9. Virtual Agents (AI Coding Agents)

Each AI tool (Claude Code, Codex) reads a role-specific instruction file. The goal is
consistent, architecture-compliant output despite the variability inherent in AI-assisted
("vibe") coding.

### 9.1 Agent Overview

| File                                 | Role                      | Core Responsibility                                              |
| ------------------------------------ | ------------------------- | ---------------------------------------------------------------- |
| `AGENTS.md`                          | Project root context      | Overview, absolute rules, references to all agents               |
| `docs/agents/Developer.md`           | Senior Frontend Developer | Coding standards, component patterns, naming conventions         |
| `docs/agents/SolutionArchitect.md`   | Solution Architect        | Guard architecture boundaries, write ADRs, dependency rules      |
| `docs/agents/Tester.md`              | QA Engineer               | Test strategy, coverage, test patterns (Arrange-Act-Assert)      |
| `docs/agents/BusinessAnalyst.md`     | Business Analyst          | Elaborate requirements, acceptance criteria, document work       |
| `docs/agents/Security.md`            | Security Reviewer         | OWASP checks, security code patterns, dependency audit           |
| `docs/agents/UXGuardian.md`          | UX / Design Guardian      | Figma adherence, correct Untitled UI usage, a11y compliance      |
| `docs/agents/DevOps.md`              | DevOps Engineer           | CI/CD pipeline, Vite build config, embedded Linux deploy         |
| `docs/agents/PerformanceEngineer.md` | Performance Engineer      | Runtime profiling, performance budgets, Lighthouse, nginx tuning |

### 9.2 Root Context — Required Content

```markdown
# Project Context

## Absolute rules (never break these)

- NEVER use `any` (TypeScript strict)
- NEVER import from another feature (use `shared/`)
- ALWAYS write tests before a feature is considered done
- NEVER generate code in `src/api/` (that is codegen output)
- NEVER add dependencies without PR approval

## Architecture → See docs/agents/SolutionArchitect.md

## Coding conventions → See docs/agents/Developer.md

## Test strategy → See docs/agents/Tester.md
```

### 9.3 Quality Control of AI-Assisted Output

| Risk                                            | Mitigation                                                             |
| ----------------------------------------------- | ---------------------------------------------------------------------- |
| Architecture violations (cross-feature imports) | `import/no-cycle` ESLint rule blocks automatically                     |
| Missing or superficial tests                    | Tester agent writes acceptance tests before Developer implements (TDD) |
| TypeScript evasion (`any`, `!`)                 | `strict: true` + ESLint rules as hard blockers                         |
| Inconsistent naming / patterns                  | Developer.md defines conventions; lint-staged checks each commit       |
| Quality drift across sprints                    | SonarCloud Quality Gate blocks merge; dashboard monitors trends        |
| Architecture drift                              | SolutionArchitect agent reviews every PR; ADR for every deviation      |
| Visual inconsistency with Figma                 | UXGuardian agent verifies Storybook stories against Figma              |
| Security issues                                 | Security agent reviews PRs with OWASP checklist as context             |

**Per-sprint working method — discipline:**

- BA agent elaborates requirements in Gherkin format (Given/When/Then)
- Tester agent writes Jest/Cypress tests based on requirements (tests fail)
- Developer agent implements the feature until tests pass
- Architect agent reviews PR for architecture boundary compliance
- UXGuardian agent verifies visual output against Figma
- Security agent checks security-sensitive areas
- CI pipeline validates everything automatically

---

## 10. Storybook — Component Documentation

- Every `shared/components/` component gets a `.stories.tsx` file
- Feature components with reuse potential are documented as well
- Storybook serves as the living design system — the bridge between Figma and implementation
- UXGuardian agent visually verifies stories against Figma
- _(Optional phase 2)_ Chromatic for automated visual regression in CI

---

## 11. Performance — Embedded Linux Target

The static frontend runs on an embedded Linux platform with limited resources.

| Measure                     | Detail                                                                                                               |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Route-based code splitting  | TanStack Router handles this automatically (lazy imports per route)                                                  |
| Feature-based chunks        | Vite `manualChunks` groups feature code into dedicated bundles                                                       |
| Bundle budget               | Target: initial JS bundle < 300 KB gzipped (to be confirmed with customer)                                           |
| Bundle monitoring           | `rollup-plugin-visualizer` report on every build; CI warns on breach                                                 |
| Tailwind purge              | Only used CSS classes in production bundle (default Tailwind behaviour)                                              |
| i18n lazy loading           | Translation files loaded per namespace, not everything at startup                                                    |
| No heavy dependencies       | Every new dependency requires explicit approval + bundle impact analysis                                             |
| Runtime profiling & budgets | Owned by **Watt** — Lighthouse CI + Core Web Vitals under device-like throttling; budgets in `docs/performance/`     |
| nginx serving               | Precompressed (brotli/gzip) assets, immutable caching, HTTP/2 — advisory spec in `docs/performance/nginx-serving.md` |

> **Note on tooling:** hosted Google PageSpeed Insights requires a public URL and cannot reach
> the embedded/internal target. Lighthouse / Lighthouse CI (`@lhci/cli`) runs the same engine
> locally and in CI against the production build, and is the chosen approach.

---

## 12. Work Packages

Based on the application modules. Order respects dependencies and the intermediate
milestone (mid 2027 = first functional release).

### WP0 — Foundation & Tooling (Sprint 1–2)

**Deliverable:** working CI pipeline, empty application with all tooling active

- Vite project setup + TypeScript strict configuration
- ESLint / Prettier / Husky / lint-staged / commitlint
- TanStack Router base structure + route definitions
- Untitled UI integration + theme setup (light/dark tokens)
- MSW mock server setup + MSW handler scaffolding
- SonarCloud project creation + Quality Gate configuration
- CI/CD pipeline setup (type-check, lint, test, Sonar, build)
- Storybook setup | `AGENTS.md` + all agent files authored | ADR template created

### WP1 — Auth & Dashboard (Sprint 2–3)

- Login page + session management
- Dashboard (Medium complexity)

### WP2 — Configuration Wizard (Sprint 3–5)

- Initial Setup Wizard (10 sub-pages, Low)
- Configuration Wizard (20 clickable pages, Medium-High)
- Wizard state in Jotai (progress, per-step validation)

### WP3 — User Management (Sprint 4–5)

- User Accounts (2 pages, Low)
- Control Access Accounts (2 pages, Low)

### WP4 — System Composition (Sprint 5–7)

- Editor Basic + Advanced (6 pages, Medium-High)
- Device auto-detect via WebSocket integration
- Real-time device status in UI

### WP5 — Device Options (Sprint 7–13) ← Largest Work Package

- Flexible Editor: generic tab-panel system (8 tabs × 6 device types = 50 pages, High)
- Basic Device Options (6 pages, Low)
- Key pattern: page logic reused across device types via a polymorphic component system

### WP6 — System Options & Zones (Sprint 9–11)

- System Options (3 pages, Low)
- Zone Editor + Zone Assignment + Zone Assignment Matrix (8 pages, Medium-High)

### WP7 — Call Definition & BGM Routing (Sprint 11–13)

- Call Definition + File Library (4 pages, Medium-High)
- Background Music Routing (2 pages, Medium)

### WP8 — Actions & Audio Processing (Sprint 12–14)

- Actions (7 pages, Medium-High; partially integrated into Device Options)
- Audio Processing + Equalized Profiles/Presets (16 pages, Medium-High)

### WP9 — Diagnostics (Sprint 14–16)

- System Status (1 page, Medium)
- Logging Viewer (3 pages, Medium-High)
- Audio Testing (4 pages, Medium-High)
- Device Specific Diagnostics (7 pages, Medium)

### WP10 — Settings (Sprint 15–16)

- System Settings, About, Export, Backup, Licenses, Firmware (6 pages, Low)

### WP11 — Operator Portal (Sprint 16–20)

- Control Center (4 pages, Medium)
- Scheduler (8 pages, High)
- Message Editor (2 pages, reusing Call Definition components)
- Template Manager (4 pages, High)
- BGM Control (3 pages, Medium-High)

### WP12 — Quality & Handover (Sprint 19–21)

- Complete E2E test suite (key user workflows)
- Finalise coverage report + close gaps
- Software Bill of Materials (SBOM)
- Technical documentation (architecture, ADRs, API integrations)
- Knowledge transfer sessions with the customer team
- List of known limitations and open items

---

## 13. Additions to the Initial Proposal

Items that were missing and have been included in this plan:

| Item                | Choice                           | Why it is needed                                      |
| ------------------- | -------------------------------- | ----------------------------------------------------- |
| Router              | TanStack Router v1               | Type-safe routing, URL state management               |
| Form library        | React Hook Form                  | Performant; pairs with Zod via `@hookform/resolvers`  |
| API codegen         | `@hey-api/openapi-ts`            | Eliminates manual types; always in sync with the spec |
| API mocking         | MSW v2                           | Development without backend; identical mocks in tests |
| Component docs      | Storybook 8                      | Living design system; visual verification vs Figma    |
| Git workflow        | Husky + lint-staged + commitlint | Quality gate before every commit                      |
| Dependency security | `npm audit` + Dependabot         | OWASP A06: vulnerable and outdated components         |
| Bundle analysis     | `rollup-plugin-visualizer`       | Embedded Linux target requires active monitoring      |
| Accessibility       | jest-axe + cypress-axe           | WCAG compliance; expected in enterprise contexts      |
| ADRs                | `docs/adr/` folder               | Every major architecture decision documented          |
| Additional agents   | Security, UXGuardian, DevOps     | Full quality coverage for the AI-assisted workflow    |
| Error Boundary      | React Error Boundary             | User-friendly fallback UI on crashes                  |
| Performance budget  | Bundle target + CI check         | Embedded Linux target requires active monitoring      |

---

## 14. Assumptions & Risks

| Item                      | Assumption / Risk                                              | Action                                               |
| ------------------------- | -------------------------------------------------------------- | ---------------------------------------------------- |
| OpenAPI spec availability | Customer delivers a stable spec before start of WP4+           | Align early; MSW mocks as bridge in the meantime     |
| Untitled UI licence       | Customer confirms licence type for use in the embedded product | Confirm before WP0                                   |
| Embedded Linux resources  | Unknown RAM/CPU constraints affect performance targets         | Performance tests on target hardware in WP4          |
| Figma completeness        | Missing UI states are to be expected across ~180 pages         | UXGuardian agent + Figma extension process           |
| Backend API timing        | Backend lags behind frontend → potential blocker               | MSW mocks + contract-first approach via OpenAPI spec |

---

_This is a living document. Updates via Pull Request, approved by the Solution Architect._
