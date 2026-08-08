import { randomUUID } from 'node:crypto';
import '@testing-library/jest-dom';
import { toHaveNoViolations } from 'jest-axe';
import { server } from '@/shared/lib/msw/server';

expect.extend(toHaveNoViolations);

class ResizeObserverMock {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

globalThis.ResizeObserver = ResizeObserverMock;

// jsdom's Crypto implementation does not include randomUUID; fall back to Node's.
if (typeof globalThis.crypto.randomUUID !== 'function') {
  globalThis.crypto.randomUUID = randomUUID;
}

// MSW: identical handlers back the app in tests. Fail on unhandled requests to
// catch typos; reset handlers and in-memory data between tests.
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
});
afterAll(() => server.close());
