import '@testing-library/jest-dom';
import { toHaveNoViolations } from 'jest-axe';
import { resetZones } from '@/shared/lib/msw/handlers';
import { server } from '@/shared/lib/msw/server';

expect.extend(toHaveNoViolations);

// MSW: identical handlers back the app in tests. Fail on unhandled requests to
// catch typos; reset handlers and in-memory data between tests.
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  resetZones();
});
afterAll(() => server.close());
