import type { ZodType } from 'zod';

/**
 * Minimal typed HTTP client — the interim data seam. Feature `api/` layers call these
 * and validate every response with Zod at the boundary.
 *
 * NOTE: this stands in for the generated TanStack Query hooks. Once the customer's
 * OpenAPI spec is available, `npm run generate:api` produces `src/api/rest/`, and feature
 * `api/` files wrap those generated hooks instead of calling this client directly.
 */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function toUrl(path: string): string {
  const origin =
    typeof globalThis.location !== 'undefined' ? globalThis.location.origin : 'http://localhost';
  return new URL(path, origin).toString();
}

export async function apiGet<T>(path: string, schema: ZodType<T>): Promise<T> {
  const res = await fetch(toUrl(path), { headers: { Accept: 'application/json' } });
  if (!res.ok) {
    throw new ApiError(res.status, `GET ${path} failed (${res.status})`);
  }
  return schema.parse(await res.json());
}

export async function apiPost<TBody, TResult>(
  path: string,
  body: TBody,
  schema: ZodType<TResult>,
): Promise<TResult> {
  const res = await fetch(toUrl(path), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new ApiError(res.status, `POST ${path} failed (${res.status})`);
  }
  return schema.parse(await res.json());
}
