# Architecture Decision Records (ADRs)

This folder records significant architectural decisions and their rationale, so the "why"
behind the codebase survives across sprints and team changes.

## When to write one

Write an ADR when a change:

- introduces, removes, or replaces a dependency or a core library;
- changes an architecture boundary, layer, or the feature-slice model;
- deviates from the [Technical Architecture Plan](../Technical-Architecture-Plan.md);
- sets a cross-cutting convention (state, error handling, performance budgets, security).

Small, local implementation choices do **not** need an ADR.

## Process

1. Copy [`template.md`](template.md) to `NNNN-short-title.md` (zero-padded, next number).
2. Fill in Context, Decision, Consequences, and Alternatives considered.
3. Open a PR. **Solid** (Solution Architect agent) reviews; a **human architect** approves.
4. ADRs are immutable once `Accepted`. To change a decision, add a new ADR that supersedes it
   (link both ways) rather than editing history.

## Status values

`Proposed` → `Accepted` → (`Superseded by ADR-NNNN` | `Deprecated`)

## Index

| ADR                                             | Title                                       | Status   |
| ----------------------------------------------- | ------------------------------------------- | -------- |
| [0001](0001-frontend-architecture-and-stack.md) | Front-end architecture and technology stack | Accepted |
