import type { ZodType, ZodTypeDef } from 'zod';

/**
 * Minimal typed HTTP client — every feature data layer calls these and validates the
 * response with Zod at the boundary. See `docs/conventions/api-integration.md`.
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

export async function apiGet<T>(path: string, schema: ZodType<T, ZodTypeDef, unknown>): Promise<T> {
  const res = await fetch(toUrl(path), { headers: { Accept: 'application/json' } });
  if (!res.ok) {
    throw new ApiError(res.status, `GET ${path} failed (${res.status})`);
  }
  return schema.parse(await res.json());
}

export async function apiPost<TBody, TResult>(
  path: string,
  body: TBody,
  schema: ZodType<TResult, ZodTypeDef, unknown>,
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
