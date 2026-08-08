# Testing Conventions

Owned by **Probe**; followed by everyone. Extends [`AGENTS.md`](../../AGENTS.md).

## Strategy

A pragmatic test pyramid:

- Many unit/component tests with Jest and React Testing Library.
- Some end-to-end tests with Cypress for key user workflows.
- MSW only for future network boundaries; local portfolio MVP tests use local data.

Tests are written first: Scope's Gherkin -> Probe's failing tests -> Vibe implements until
green.

## Arrange-Act-Assert

```tsx
it('toggles a portfolio change from absolute to percentage', async () => {
  render(<PortfolioPage />);

  await userEvent.click(screen.getByRole('button', { name: /toggle change for totaal/i }));

  expect(screen.getByRole('button', { name: /toggle change for totaal/i })).toHaveTextContent('%');
});
```

## React Testing Library

- Test behaviour, not implementation.
- Prefer `getByRole` with an accessible name.
- Use `@testing-library/user-event` for interaction.
- Avoid broad snapshots.

## Coverage

Targets: >=80% statements/lines, >=75% branches, >=85% functions. Generated `src/api/`
is excluded.
