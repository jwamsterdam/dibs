# Dibs Readiness Checklist

## Product Inputs

- [ ] Confirm the MVP portfolio assets and example people.
- [ ] Confirm whether Dibs remains read-only for the next iteration.
- [ ] Confirm future settings scope: people, assets, amounts, validator pubkeys/indices.
- [ ] Confirm secure-mode requirements: PIN policy, export/import, recovery expectations.

## Data Inputs

- [ ] Confirm CoinGecko as the default future price provider.
- [ ] Confirm Ethereum staking data source and validator identifier format.
- [ ] Define fallback behavior for offline and failed data refreshes.

## Design Inputs

- [ ] Keep the Figma reference link current.
- [ ] Capture mobile viewport expectations around 390 x 844.
- [ ] Record design decisions for settings and secure mode before implementation.

## Delivery Inputs

- [ ] Keep branch protection, CI, lint, type-check, test, build, and bundle-budget gates active.
- [ ] Confirm mobile/PWA hosting target and cache strategy before release.
- [ ] Re-run dependency approval when adding or removing runtime dependencies.
