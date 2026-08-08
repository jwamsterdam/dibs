type ClassValue = string | false | null | undefined;

/**
 * Minimal className joiner: filters out falsy values and joins with spaces.
 * (Swap for clsx + tailwind-merge if conflict resolution is needed later.)
 */
export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(' ');
}
