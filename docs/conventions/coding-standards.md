# Coding Standards — Clean Code for TypeScript + React

Applies **Clean Code** to our stack. Extends [`AGENTS.md`](../../AGENTS.md) (on conflict,
AGENTS.md wins). Formatting is owned by Prettier — never argue about it; run it.

## Guiding principle

Optimise for the next reader, not the author. Readable and obvious beats short and clever.
Code is read far more than it is written — especially by AI agents that must extend it.

## Naming

- Names reveal intent: `deviceCount`, not `n`; `isConnected`, not `flag`.
- Booleans read as predicates: `isLoading`, `hasError`, `canEdit`.
- Functions are verbs (`fetchZones`, `mapDeviceToRow`); components and types are nouns.
- No abbreviations beyond well-known ones (`id`, `url`, `api`). No Hungarian notation.
- No magic numbers or strings — name them: `const MAX_ZONES = 500;`.

## Functions

- **Small and single-purpose.** If you need "and" to describe it, split it.
- Prefer **≤ 3 parameters**; beyond that, pass an options object.
- **Guard clauses and early returns** over nested `if`/`else` pyramids.
- No side effects hidden behind an innocent name; a function does what it says.
- Pure where possible: same input → same output, no reaching into outer state.

```ts
// Prefer
function getDisplayName(user: User): string {
  if (!user.firstName) return user.email;
  return `${user.firstName} ${user.lastName}`.trim();
}
```

## TypeScript

- `strict` is on. **Never** `any`, `!` (non-null assertion), or `@ts-ignore` — model the type
  instead. Use `@ts-expect-error` with a comment only in tests, only when unavoidable.
- Prefer **discriminated unions** over booleans-that-imply-state:
  `type State = { status: 'loading' } | { status: 'error'; error: Error } | { status: 'ok'; data: T }`.
- `type` for unions/props/aliases; `interface` only when you need declaration merging.
- Mark data `readonly` when it should not mutate; treat props as immutable.
- Handle every case: with `noUncheckedIndexedAccess`, array access may be `undefined` — check it.
- Derive types from the source of truth (Zod schema → `z.infer`, generated API types) rather than
  re-declaring shapes.

## React components

- **Presentational by default:** props in → callbacks out. No data fetching, no business logic in
  a component whose job is to render.
- Orchestration (queries, mutations, validation, derived state) lives in **hooks**, not JSX.
- Keep JSX flat and legible; extract sub-components before a return statement grows past a screen.
- Composition over configuration: many small components beat one component with 15 boolean props.
- Every interactive element renders its **loading, empty, error, and permission** states.

## Hooks

- Obey the Rules of Hooks (top level only) — `react-hooks/rules-of-hooks` is an error.
- `exhaustive-deps` is an error; fix the dependency array, don't silence it.
- Custom hooks are named `useX`, orchestrate one concern, and return a stable, typed shape.
- Feature orchestration hooks live in `features/<feature>/hooks/`; shared ones in `shared/hooks/`.

## Imports & module boundaries

- Import across features **only** through their `index.ts` barrel — never deep paths. Actually,
  cross-feature imports are forbidden entirely; shared code goes in `shared/` (lint-enforced).
- Use the `@/` path alias for absolute imports; avoid `../../../` chains.
- A feature's `index.ts` is its public API — export the minimum.

## Comments

- Explain **why**, not **what**; the code already says what. Delete commented-out code.
- Public/shared utilities and components get a short JSDoc describing intent and non-obvious behaviour.
- A `TODO` includes an owner or a ticket, or it does not exist.

## Errors

- Fail fast and loudly in code paths that should never happen (throw), gracefully in the UI
  (error state / boundary) for things that can.
- Never swallow errors silently. `no-console` is a warning — route real logging through the
  designated logger, not stray `console.log`.
