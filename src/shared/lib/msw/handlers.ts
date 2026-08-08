import { http, HttpResponse } from 'msw';

// Dev/test network mocks stay generic until Dibs adds online price or staking feeds.
export const handlers = [
  http.get('*/api/health', () => HttpResponse.json({ status: 'ok' })),
];
