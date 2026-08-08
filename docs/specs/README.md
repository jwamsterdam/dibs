# Feature Specifications

Durable acceptance criteria and requirement elaboration, owned by **Scope** (Business Analyst).

Most acceptance criteria live on the ticket. Use this folder when a specification is durable
and worth version-controlling alongside the code — e.g. complex modules like the Configuration
Wizard or the Device Options flexible editor.

## Conventions

- One file per feature/module: `docs/specs/<feature>.md`.
- Acceptance criteria in **Gherkin** (`Feature` / `Scenario` / `Given`–`When`–`Then`).
- One scenario per behaviour; cover happy, edge, error, loading, and permission paths.
- List unresolved items under an **Open questions** heading rather than guessing.
- Link each scenario to its test (traceability) where possible.

> This folder is scaffolded for WP1+. It is intentionally empty until features begin.
