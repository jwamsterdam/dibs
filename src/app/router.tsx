import { lazy, Suspense } from 'react';
import { createRootRoute, createRoute, createRouter, Outlet } from '@tanstack/react-router';
import { loadNamespace } from '@/shared/i18n';

// Route-based code splitting: feature pages and their feature namespaces load on demand.
const PortfolioPage = lazy(async () => {
  const [module] = await Promise.all([import('@/features/portfolio'), loadNamespace('portfolio')]);
  return { default: module.PortfolioPage };
});

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => (
    <Suspense fallback={null}>
      <PortfolioPage />
    </Suspense>
  ),
});

const routeTree = rootRoute.addChildren([indexRoute]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
