# Client Readiness Checklist

This repo is currently a pre-sale blueprint. It should demonstrate architecture, tooling and
delivery discipline without guessing about client-owned systems. Use this checklist at kickoff
to turn placeholders into real implementation work.

## Contract / Access

- [ ] Confirm client repository location, branching rules and review responsibilities.
- [ ] Confirm who owns GitHub administration, branch protection and required checks.
- [ ] Confirm whether SonarCloud, Dependabot, Snyk or another security platform is mandated.
- [ ] Confirm whether CI may call external services such as npm audit and SonarCloud.

## API Contracts

- [ ] Provide REST `openapi.yaml` and confirm versioning/change-notification process.
- [ ] Provide WebSocket `asyncapi.yaml` and event lifecycle expectations.
- [ ] Confirm whether generated API clients are committed or generated during CI.
- [ ] Confirm authentication/session model, including cookie names, refresh flow and logout semantics.
- [ ] Confirm error envelope formats, validation error formats and retry expectations.
- [ ] Confirm mock-data ownership: supplier-maintained MSW fixtures or client-provided contract examples.

## Design / UX

- [ ] Provide Figma access for all agreed screens, components and responsive variants.
- [ ] Confirm Untitled UI licence/registry access and whether it can be bundled in the delivered product.
- [ ] Confirm required themes, accessibility target and high-contrast behaviour.
- [ ] Confirm loading, empty, error and permission states for each workflow.
- [ ] Confirm translation ownership and supported locale list.

## Embedded Target

- [ ] Provide target browser/runtime details for the embedded Linux platform.
- [ ] Provide CPU/RAM/storage constraints and representative test hardware or emulator settings.
- [ ] Confirm nginx/static-serving ownership and required cache/CSP/security headers.
- [ ] Confirm offline, reconnect and slow-network expectations.
- [ ] Confirm production logging/telemetry endpoint for UI errors.

## Delivery Gates

- [ ] Replace placeholder CODEOWNERS with real GitHub users or teams.
- [ ] Enable branch protection and required status checks.
- [ ] Add SonarCloud Quality Gate once the project and `SONAR_TOKEN` exist.
- [ ] Add Cypress E2E workflow once workflows and test data are agreed.
- [ ] Add Lighthouse CI only after dependency approval and target-like throttling settings are known.
- [ ] Record approved bundle/performance budgets after measurement on representative hardware.

## Deferred Until Inputs Arrive

- REST codegen activation is deferred until OpenAPI is available.
- WebSocket infrastructure is deferred until AsyncAPI events and reconnect rules are available.
- Deep Untitled UI integration is deferred until licence and Figma access are confirmed.
- Hardware performance baselines are deferred until target constraints or devices are available.
