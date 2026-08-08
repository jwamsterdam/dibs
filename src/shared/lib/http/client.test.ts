import { http, HttpResponse } from 'msw';
import { z } from 'zod';
import { server } from '@/shared/lib/msw/server';
import { ApiError, apiGet, apiPost } from './client';

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

  it('posts a body and parses the result', async () => {
    server.use(
      http.post('*/api/ping', async ({ request }) => {
        const body = (await request.json()) as { ok: boolean };
        return HttpResponse.json(body, { status: 201 });
      }),
    );
    await expect(apiPost('/api/ping', { ok: true }, schema)).resolves.toEqual({ ok: true });
  });
});
