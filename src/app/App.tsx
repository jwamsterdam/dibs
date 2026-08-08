import { RouterProvider } from '@tanstack/react-router';
import { ErrorBoundary } from './ErrorBoundary';
import { I18nProvider } from './providers/I18nProvider';
import { QueryProvider } from './providers/QueryProvider';
import { ThemeProvider } from './providers/ThemeProvider';
import { router } from './router';

export function App(): React.JSX.Element {
  return (
    <ErrorBoundary>
      <I18nProvider>
        <ThemeProvider>
          <QueryProvider>
            <RouterProvider router={router} />
          </QueryProvider>
        </ThemeProvider>
      </I18nProvider>
    </ErrorBoundary>
  );
}
