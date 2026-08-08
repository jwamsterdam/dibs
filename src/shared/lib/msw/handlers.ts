import { http, HttpResponse } from 'msw';

// CoinGecko requests are mocked per-test via `jest.spyOn(globalThis, 'fetch')` instead of
// MSW handlers, since they hit an external origin rather than this app's own API surface.
export const handlers = [http.get('*/api/health', () => HttpResponse.json({ status: 'ok' }))];
