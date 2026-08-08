type ClassValue = string | false | null | undefined;

/**
 * Minimal className joiner: filters out falsy values and joins with spaces.
 * (Swap for clsx + tailwind-merge if conflict resolution is needed later.)
 */
export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(' ');
}

export const focusRingClassName =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary';

/** Same ring as {@link focusRingClassName}, for wrapper elements whose focusable child is nested. */
export const focusWithinRingClassName =
  'focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brand-primary';

/**
 * For elements that already carry a visible 1px border (form fields). Recolors the border on
 * focus instead of layering an outline on top of it, so the edge doesn't visually thicken.
 * Uses `:focus` rather than `:focus-visible` so button-like triggers (e.g. the currency Select)
 * also get the highlight on pointer clicks, not just keyboard navigation.
 */
export const focusFieldBorderClassName = 'outline-none focus:border-brand-primary';

/** Same as {@link focusFieldBorderClassName}, for wrapper elements whose focusable child is nested. */
export const focusWithinFieldBorderClassName = 'focus-within:border-brand-primary';
