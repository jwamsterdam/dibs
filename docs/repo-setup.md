# Repository Setup Checklist

Everything in this repo is reproducible from a clone. This checklist covers the things that
**cannot** be committed — GitHub settings, secrets, and client-provided artifacts — needed to
make the blueprint fully operational. Work top to bottom.

## 1. Branch protection (makes the gates mandatory)

On GitHub → **Settings → Branches → Add branch ruleset** for `main`:

- [ ] Require a pull request before merging (no direct pushes to `main`)
- [ ] Require approval from **Code Owners** (activates [`.github/CODEOWNERS`](../.github/CODEOWNERS))
- [ ] Require status checks to pass, and select:
  - [ ] `Type-check · lint · test · build`
  - [ ] `Dependency audit`
- [ ] Require branches to be up to date before merging
- [ ] (Optional) Require linear history

Until this is on, CI and Code Owner review are **advisory**, not enforced.

## 2. CODEOWNERS — real handles

- [ ] In [`.github/CODEOWNERS`](../.github/CODEOWNERS), replace the placeholders
      (`@senior-frontend`, `@solution-architect`, `@devops`, `@business-analyst`) with real
      GitHub usernames or teams.

## 3. Secrets (Settings → Secrets and variables → Actions)

Add when the corresponding integration is enabled:

- [ ] `SONAR_TOKEN` — for the SonarCloud Quality Gate
- [ ] Any deployment credentials (defined when the embedded-Linux deploy target is known)

## 4. Integrations to enable (currently blue on the status page)

- [ ] **SonarCloud** — create the project, configure the Quality Gate, add the CI job + `SONAR_TOKEN`
- [ ] **Dependabot** — enable alerts + security updates (Settings → Code security); optionally add
      a `.github/dependabot.yml` for a weekly npm update PR
- [ ] **Cypress E2E** — add `cypress.config.ts` + specs, then a nightly/release workflow
- [ ] **Lighthouse CI** — approve `@lhci/cli`, add `lighthouserc.json` + a perf-budget job (Watt)

## 5. Client-provided artifacts (drop in when available)

These unblock the deferred implementation items. Keep the fuller intake list in
[`client-readiness-checklist.md`](client-readiness-checklist.md) up to date as kickoff
questions are answered:

- [ ] `openapi.yaml` + an `openapi-ts.config.ts` → `npm run generate:api` (REST client)
- [ ] `asyncapi.yaml` → `npm run generate:ws` (WebSocket event types)
- [ ] **Untitled UI** license/registry access → wire the design system into `shared/components/`
- [ ] Figma design files → implement screens against them
- [ ] Translated text for each i18n namespace (structure/keys already defined)

## 6. Before delivery

- [ ] Remove the dev-only diagnostic page: `rm public/status.html`
- [ ] Produce the SBOM and finalise the coverage report (WP12)

---

_See [`delivery-workflow.md`](delivery-workflow.md) for how changes flow once the above is in place._
