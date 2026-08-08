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
