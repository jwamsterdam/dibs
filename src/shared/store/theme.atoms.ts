import { atom } from 'jotai';

export type Theme = 'light' | 'dark' | 'high-contrast';

export const THEME_STORAGE_KEY = 'app-theme';

const THEMES: readonly Theme[] = ['light', 'dark', 'high-contrast'];

function isTheme(value: string | null): value is Theme {
  return value !== null && (THEMES as readonly string[]).includes(value);
}

export function getInitialTheme(): Theme {
  if (typeof window === 'undefined') {
    return 'light';
  }
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  return isTheme(stored) ? stored : 'light';
}

export const themeAtom = atom<Theme>(getInitialTheme());
