---
description: Route the current diff to the required virtual reviewers (per the routing matrix) and report consolidated findings.
argument-hint: '[base-ref]  (default: origin/main)'
---

Run a **routed code review** of the current change set, following the team's review routing
matrix. You are the router: classify the change, dispatch only the required reviewers, and
consolidate their findings. Do not modify code, commit, or merge.

## 1. Determine the diff

- Base ref = `$1` if provided, else `origin/main` (fall back to `main`).
- Run `git status --short` and `git diff --stat <base>...HEAD` to list changed files.
  - If the branch has no commits ahead of base, review uncommitted changes instead (`git diff HEAD`).
  - If there are no changes at all, stop and say so.
- Read the changed files / diff so you can classify accurately.

## 2. Classify the change type(s)

The **source of truth is `docs/delivery-workflow.md`** (the review routing matrix) — read it.
Classify the diff into one or more of these types, using these signals:

- **New page** — new files under `src/features/*/pages/` or a new route
- **New API integration** — `src/features/*/api/`, `src/api/`, query/mutation hooks, MSW handlers
- **Auth / session change** — paths/content mentioning auth, session, token, login
- **CI/CD change** — `.github/workflows/`, `vite.config`, `scripts/`, build/CI config
- **Design-system change** — `src/shared/components/`, `styles/themes/`, `tailwind.config`, `*.stories.tsx`
- **Architecture / dependency change** — `package.json` deps, `eslint.config`, `tsconfig`, `src/app/`, new top-level folders
- **Complex form** — React Hook Form + Zod `validation/`, multi-step forms (note PII/auth/payment)
- **Performance-sensitive** — large lists/virtualisation, heavy new deps, real-time/WS views
- **Docs-only** — only `*.md` / `docs/` changes → **no virtual reviewers required**

State the detected type(s) and your reasoning.

## 3. Select reviewers

Take the **union** of required reviewers for the detected types, mapping roles to subagents:
`Solid→solid`, `Vibe→vibe`, `Probe→probe`, `Pixel→pixel`, `Aegis→aegis`, `Flux→flux`,
`Watt→watt`. Add **aegis** for a complex form touching PII / auth / payment. If the change is
docs-only, skip virtual review and say so. List who you will invoke and why.

## 4. Dispatch reviews (in parallel)

Launch the selected reviewer subagents **concurrently** — one Task/subagent call each, in a
single message. Give each subagent: the base ref + changed-file list (and how to see the diff,
e.g. `git diff <base>...HEAD -- <files>`), and instruct it to review **only its area** and return
findings. The reviewer subagents are read-only.

## 5. Consolidated report

Aggregate everything into one report:

- **Change type(s)** detected and **reviewers run**
- **Per reviewer:** findings as `severity · file:line · issue · suggested fix`, or "No concerns"
- **Overall verdict:** `BLOCKERS` (must fix before merge) / `CONCERNS` (should address) / `CLEAR`

End with a reminder: this review is **advisory** — per `docs/delivery-workflow.md`, a human Senior
Front-end reviews the PR and a human Architect/BA accepts before merge. Do not modify code or merge.
