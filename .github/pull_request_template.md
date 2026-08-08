<!--
  Fill this in. The change type drives which virtual reviewers must run —
  see docs/delivery-workflow.md (review routing matrix).
-->

## What & why

<!-- What changed and why. Link the ticket and any ADR. -->

- Ticket:
- ADR (if architectural):

## Change type

<!-- Tick all that apply. Union the reviewers if several apply. -->

- [ ] New page → **Vibe, Probe, Pixel**
- [ ] New API integration → **Vibe, Probe, Aegis**
- [ ] Auth / session change → **Solid, Aegis, Probe**
- [ ] CI/CD change → **Flux, Aegis**
- [ ] Design-system change → **Pixel, Solid, Probe**
- [ ] Architecture / dependency change → **Solid, Aegis, Flux**
- [ ] Complex form → **Vibe, Probe, Pixel** (+ **Aegis** if PII / auth / payment)
- [ ] Performance-sensitive → **Watt, Probe**
- [ ] Docs-only → _no virtual reviewers required_

## Virtual reviewers run

<!-- List the role cards you actually ran for this change (per the matrix above). -->

- [ ] Ran the required reviewers and addressed their findings

## Author checklist

<!-- Full checklist: docs/conventions/git-and-pull-requests.md -->

- [ ] Scoped to one concern; Conventional Commits
- [ ] `type-check`, `lint`, `test` pass locally (CI will re-verify)
- [ ] Tests cover happy + edge + error + permission paths
- [ ] Loading / empty / error / permission states implemented
- [ ] No `any` / `!` / hardcoded colours or strings; a11y checked
- [ ] Storybook story added/updated for shared components
- [ ] ADR added if an architectural decision/deviation is involved

## Human gates

- [ ] Senior Front-end reviewed
- [ ] Architect / BA accepted
