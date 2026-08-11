# Git & Pull Requests

How change flows into `main`. Extends [`AGENTS.md`](../../AGENTS.md).

## Commits — Conventional Commits

- Format: `type(scope): subject` — enforced by commitlint on `commit-msg`.
- Types: `feat`, `fix`, `chore`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `revert`.
- Scope is the feature or area: `feat(portfolio): add period selection`.
- Subject is imperative and lower-case, no trailing period: "add", not "added"/"adds".
- The pre-commit hook runs `lint-staged` (eslint --fix → prettier → `tsc --noEmit`); a commit
  that fails type-check or lint does not land.

## Branches

- Branch from `main`: `type/scope-short-description` (e.g. `feat/settings-assets`, `fix/portfolio-change-toggle`).
- Keep branches short-lived; rebase or merge `main` frequently to avoid drift.

## Pull requests

- **Small and single-purpose.** One concern per PR — easier to review, safer to revert. If the
  description needs "and", split it.
- The description states **what** changed, **why**, and how it was verified; link the ticket and
  any ADR.
- A PR does not merge without a **green CI pipeline** and **human approval**.

### PR checklist (author)

- [ ] Scoped to one concern; commits follow Conventional Commits
- [ ] `type-check`, `lint`, and tests pass locally
- [ ] Tests cover the acceptance criteria (happy + edge + error + permission)
- [ ] Loading / empty / error / permission states implemented
- [ ] No `any` / `!` / `@ts-ignore`; no hardcoded colours or strings
- [ ] Accessibility checked (roles, focus, contrast, `jest-axe`)
- [ ] ADR added if an architectural decision or deviation is involved

## When an ADR is required

Any change that adds/removes a dependency, alters an architecture boundary or layer, or deviates
from the [architecture plan](../Technical-Architecture-Plan.md) needs an ADR in
[`docs/adr/`](../adr/) before it merges. Small local implementation choices do not.
