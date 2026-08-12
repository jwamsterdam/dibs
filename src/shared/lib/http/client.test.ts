import { http, HttpResponse } from 'msw';
import { z } from 'zod';
import { server } from '@/shared/lib/msw/server';
import { ApiError, apiGet } from './client';

const schema = z.object({ ok: z.boolean() });

describe('http client', () => {
  it('parses a successful GET response', async () => {
    server.use(http.get('*/api/ping', () => HttpResponse.json({ ok: true })));
    await expect(apiGet('/api/ping', schema)).resolves.toEqual({ ok: true });
  });

  it('throws ApiError on a non-2xx GET', async () => {
    server.use(http.get('*/api/ping', () => HttpResponse.json({}, { status: 500 })));
    await expect(apiGet('/api/ping', schema)).rejects.toBeInstanceOf(ApiError);
  });
});
