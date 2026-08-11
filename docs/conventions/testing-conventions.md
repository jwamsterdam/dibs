# Testing Conventions

Extends [`AGENTS.md`](../../AGENTS.md).

## Strategy

- Unit/component tests with Jest and React Testing Library, covering hooks, components, and
  data-layer logic.
- MSW mocks the external boundary (CoinGecko) so "works in dev" and "works in tests" mean
  the same thing.
- Write tests alongside (or before) the implementation — a feature isn't done until its
  happy, edge, error, and permission paths are covered.

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

Targets: >=80% statements/lines, >=75% branches, >=85% functions (`shared/` + feature
slices; i18n config, MSW, and test infra are excluded — see `jest.config.cjs`).
