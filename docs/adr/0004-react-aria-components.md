# ADR-0004: React Aria Components for UI Primitives

- **Status:** Accepted
- **Date:** 2026-08-08
- **Deciders:** User, Solid, Vibe, Codex
- **Related:** ADR-0002, Dibs React Aria refactor

## Context

Dibs is an iPhone-first portfolio PWA. The UI needs native-feeling keyboard, focus,
popover, dialog, combo box, select, and tab behavior without adopting a styled component
system. The project already uses Recharts for the portfolio graph, and that charting
dependency remains the exception requested by the user.

React Aria Components is an unstyled component library from Adobe that provides
accessible behavior and state while leaving visual styling to the app. Its documentation
also recommends wrapping and composing primitives to match an application's design
system:

- https://react-aria.adobe.com/getting-started
- https://react-spectrum.adobe.com/react-aria/Select.html

## Decision

We will use `react-aria-components` for interactive UI primitives across the app, while
keeping Recharts for portfolio visualization. Imports should use package subpaths such
as `react-aria-components/Button`, `react-aria-components/Select`, and
`react-aria-components/ComboBox` to keep the bundle as tree-shakeable as possible.

Shared primitives belong in `src/shared/components` when they are reused across
features. Feature-specific compositions may live inside the owning feature as long as
they do not move state, validation, or data decisions out of the feature layer.

## Consequences

Focus management, keyboard behavior, modal semantics, tabs, select, combo box, and
press handling now come from React Aria Components instead of custom native element
composition. Tests should query the resulting ARIA roles, such as `tab`, `combobox`,
`dialog`, `option`, and `button`.

The runtime dependency `react-aria-components@^1.20.0` was added with user approval
through the requested refactor. Production build measurement showed the vendor chunk
at 607.24 kB raw / 187.68 kB gzip and total JavaScript at 305.1 kB gzip. Because the
previous 300 kB total JavaScript budget was provisional and the requested accessibility
primitive layer is now app infrastructure, the total JavaScript budget is raised to
310 kB gzip. This is a meaningful mobile-PWA cost, so further shared wrapper work
should avoid broad root imports and keep using subpath imports.

`npm audit --audit-level=critical` reported 0 critical vulnerabilities after adding the
dependency.

Recharts remains intentionally outside this decision. The existing Vite warning for a
large vendor chunk still applies and should be monitored with the bundle budget script.

## Alternatives considered

- **Continue custom controls** - less bundle weight, but more accessibility and
  interaction behavior to maintain in app code.
- **Radix UI or Headless UI** - viable headless alternatives, but the user explicitly
  requested React Aria Components and its unstyled primitives match the current styling
  approach.
- **Styled design system** - faster visual assembly, but it would fight the Figma-led
  custom iPhone reproduction and add styling constraints the app does not need.
