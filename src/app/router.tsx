import { lazy, Suspense } from 'react';
import { createRootRoute, createRoute, createRouter, Outlet } from '@tanstack/react-router';
import { DashboardPage } from '@/features/dashboard';

// Route-based code splitting: the zones feature loads as its own chunk on demand.
const ZonesPage = lazy(() => import('@/features/zones').then((m) => ({ default: m.ZonesPage })));

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: DashboardPage,
});

const zonesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/zones',
  component: () => (
    <Suspense fallback={null}>
      <ZonesPage />
    </Suspense>
  ),
});

const routeTree = rootRoute.addChildren([indexRoute, zonesRoute]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
