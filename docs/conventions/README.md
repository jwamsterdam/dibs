# Conventions Library

The detailed, teachable **"how"** of this codebase — the standards every contributor (human
and AI) follows. These documents exist so that "follow existing conventions" is a concrete,
citable instruction rather than a hope.

## How this fits together (avoid duplication)

| Layer                                                                      | Purpose                                                      |
| -------------------------------------------------------------------------- | ------------------------------------------------------------ |
| [`AGENTS.md`](../../AGENTS.md)                                             | The short list of **absolute, non-negotiable** rules + index |
| [`docs/Technical-Architecture-Plan.md`](../Technical-Architecture-Plan.md) | The **what & why** of the overall design (stack, structure)  |
| **This library** (`docs/conventions/`)                                     | The detailed **how** — applied standards with examples       |
| [`docs/agents/`](../agents/)                                               | Per-role charters that point here                            |

**Single source of truth:** each fact lives in exactly one place. If a convention here ever
conflicts with `AGENTS.md`, `AGENTS.md` wins — and the conflict is a bug to fix.

## Contents

- [Coding standards](coding-standards.md) — Clean Code applied to TypeScript + React
- [Architecture principles](architecture-principles.md) — Clean Architecture applied to feature slices
- [Testing conventions](testing-conventions.md) — strategy, patterns, coverage
- [API integration](api-integration.md) — contract-first codegen, generated hooks, Zod boundaries
- [UI, styling & i18n](ui-styling-and-i18n.md) — Untitled UI, theme tokens, translations, a11y
- [Git & pull requests](git-and-pull-requests.md) — commits, PR size, review flow

## Enforcement (gates, not prose)

Wherever a convention can fail automatically, it does — locally on `git commit` (lint-staged)
and in CI. These are not suggestions:

| Convention                    | Enforced by                                                                                        |
| ----------------------------- | -------------------------------------------------------------------------------------------------- |
| No `any` / `!` / `@ts-ignore` | `@typescript-eslint` (`no-explicit-any`, `no-non-null-assertion`, `ban-ts-comment`) + `strict` tsc |
| No cross-feature imports      | `eslint-plugin-boundaries` (`boundaries/dependencies`)                                             |
| No dependency cycles          | `import/no-cycle` (with the TS path resolver)                                                      |
| No `dangerouslySetInnerHTML`  | `react/no-danger`                                                                                  |
| No hardcoded palette colours  | custom `no-restricted-syntax` rule                                                                 |
| Accessibility                 | `jsx-a11y` recommended (lint) + `jest-axe`/`cypress-axe` (tests)                                   |
| Test quality                  | `eslint-plugin-testing-library` + `eslint-plugin-jest-dom`                                         |
| Coverage floor                | Jest `coverageThreshold`                                                                           |
| Bundle budget                 | `npm run check:bundle` (fails over budget)                                                         |
| Conventional Commits          | `commitlint` on `commit-msg`                                                                       |
| Formatting                    | Prettier via `lint-staged`                                                                         |

Anything still relying only on prose (SonarCloud gate, Lighthouse budgets) is tracked as a
follow-up to wire into CI.

## Guiding philosophy

- **Clean Code** — readable beats clever; small, single-purpose units; meaningful names; fail fast.
- **Clean Architecture** — dependencies point inward; the framework lives at the edges; business
  logic does not depend on React, the router, or the network.
- **Enforce, don't just document** — wherever a rule can be a lint rule, a type, or a CI gate, it is.
  Prose is the fallback, not the primary control.
