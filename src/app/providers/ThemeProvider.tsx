import { useAtom } from 'jotai';
import { type ReactNode, useEffect } from 'react';
import { THEME_STORAGE_KEY, themeAtom } from '@/shared/store/theme.atoms';

export function ThemeProvider({ children }: { children: ReactNode }): React.JSX.Element {
  const [theme] = useAtom(themeAtom);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  return <>{children}</>;
}
