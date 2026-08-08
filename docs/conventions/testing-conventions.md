# Testing Conventions

Owned by **Probe**; followed by everyone. Extends [`AGENTS.md`](../../AGENTS.md).

## Strategy

A pragmatic test pyramid:

- **Many** unit/component tests (Jest + React Testing Library) — fast, close to the code.
- **Some** end-to-end tests (Cypress) — the key user workflows only, not every path.
- **Contract** boundaries mocked with MSW so tests never hit a real backend.

Tests are written **first** (TDD): Scope's Gherkin → Probe's failing tests → Vibe implements
until green. A feature is not "done" until its tests pass and cover the agreed criteria.

## Arrange–Act–Assert

Every test has three visible phases. Keep them in that order and keep tests short.

```tsx
it('shows an error when saving a zone fails', async () => {
  // Arrange
  server.use(http.post('/api/zones', () => HttpResponse.json({}, { status: 500 })));
  render(<ZoneEditor />);
  // Act
  await userEvent.click(screen.getByRole('button', { name: /save/i }));
  // Assert
  expect(await screen.findByRole('alert')).toHaveTextContent(/could not save/i);
});
```

## React Testing Library

- **Test behaviour, not implementation.** Assert what the user sees/does, never internal state,
  props, or component names.
- **Query priority:** `getByRole` (with `name`) first, then label/text, then `getByTestId` only as
  a last resort. Accessible queries double as accessibility checks.
- Use `@testing-library/user-event` for interaction, not `fireEvent`, and `findBy*` for async.
- No snapshot tests of whole components (they rot and nobody reads the diff); snapshot only small,
  stable serialisable output when it genuinely helps.

## What to test / what not

- **Do** test: component behaviour and states (loading/empty/error/permission), hook logic, Zod
  schemas, utilities, and key workflows end to end.
- **Don't** test: the generated `src/api/` layer, third-party libraries, or trivial pass-through
  code. Don't assert on styling internals.

## Accessibility

- Add `jest-axe` assertions to component tests and `cypress-axe` to e2e flows.
- A failing a11y assertion is a failing test, not a warning.

## Determinism

- No real network (MSW), no real timers (use fake timers), no reliance on test order.
- If a test is flaky, fix or delete it — a flaky test is worse than no test.

## Coverage

- Targets: **≥ 80%** statements/lines, **≥ 75%** branches, **≥ 85%** functions. Generated
  `src/api/` is excluded.
- Coverage is a floor, not a goal. 100% of trivial code proves nothing; cover the branches that
  matter (errors, edge cases, permissions).

## Naming & location

- Co-locate unit/component tests as `*.test.tsx` beside the code; e2e specs in `cypress/e2e/*.cy.ts`.
- `describe` names the unit; `it` states a behaviour: `it('disables submit while saving')`.
- Shared MSW handlers in `src/shared/lib/msw/`; per-test overrides live with the test.
