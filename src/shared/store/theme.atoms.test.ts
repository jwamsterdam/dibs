import { getInitialTheme, THEME_STORAGE_KEY } from './theme.atoms';

describe('getInitialTheme', () => {
  afterEach(() => {
    window.localStorage.clear();
  });

  it('defaults to light when nothing is stored', () => {
    expect(getInitialTheme()).toBe('light');
  });

  it('returns a valid stored theme', () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    expect(getInitialTheme()).toBe('dark');
  });

  it('falls back to light for an invalid stored value', () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, 'neon');
    expect(getInitialTheme()).toBe('light');
  });
});
