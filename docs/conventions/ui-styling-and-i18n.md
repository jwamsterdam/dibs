# UI, Styling & Internationalisation

Extends [`AGENTS.md`](../../AGENTS.md).

## Components

- Prefer `react-aria-components` primitives (per ADR-0004) over hand-rolled interactive
  elements — they come with accessibility behaviour built in.
- Shared, reusable UI lives in `shared/components/`; never re-implement something that's
  already there.

## Styling — tokens only

- Colours come **only** from theme tokens (CSS custom properties exposed as Tailwind utilities:
  `bg-brand-primary`, `text-fg-primary`, …). **Hardcoded colour utilities like `text-blue-500`
  are forbidden** — a `no-restricted-syntax` ESLint rule fails the build on the numbered Tailwind
  palette.
- Tokens are defined per theme in `src/styles/themes/` (`light`, `dark`, `high-contrast`).
- Spacing, typography, and radii follow Tailwind's scale; match Figma within tolerance rather
  than inventing one-off values.

## Theming

- The active theme is a Jotai atom persisted to `localStorage`; the provider sets
  `data-theme` on the root element.
- New components must work in all three themes automatically because they use tokens — verify
  by switching themes in the running app rather than assuming.

## Responsive

- Design mobile-up with Tailwind breakpoints; match the agreed breakpoints in Figma.
- The app targets a fixed embedded display **and** flexible operator views — confirm which a
  screen is for before assuming a single layout.

## Accessibility (WCAG)

- Use semantic HTML first; reach for ARIA only to fill gaps, never to paper over the wrong element.
- Every interactive element is keyboard operable with a visible focus state.
- Meet contrast requirements using the theme tokens (the high-contrast theme is not an excuse to
  ignore contrast in the default themes).
- Accessibility is tested, not assumed — see [testing conventions](testing-conventions.md).

## Internationalisation

- **No hardcoded user-facing strings.** Every label/message is a translation key via
  `react-i18next`'s `useTranslation`.
- One namespace **per feature** (`common` for shared); lazy-loaded, so startup stays light on the
  embedded target.
- Keys are structured and meaningful: `t('portfolio.aria.selectAsset')`, not `t('error1')`.
- Translation keys are **type-safe** (i18next augmentation): a missing or misspelled key is a
  compile error. The customer supplies the translated text; we own the key structure.
