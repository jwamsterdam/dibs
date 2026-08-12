/* istanbul ignore file -- jsdom has no IndexedDB implementation; exercised by real browsers only. */

import type { ZodType } from 'zod';
import { CACHE_STORE, readStoreEntry, withPortfolioDatabase, writeStoreEntry } from './indexedDb';

type CacheEntry = {
  readonly createdAt: number;
  readonly ttlMs: number;
  readonly value: unknown;
};

export async function getCachedOrFetch<T>(
  key: string,
  ttlMs: number,
  schema: ZodType<T>,
  fetcher: () => Promise<T>,
): Promise<T> {
  const now = Date.now();

  const cached = await withPortfolioDatabase(async (database) => {
    try {
      const entry = await readStoreEntry<CacheEntry>(database, CACHE_STORE, key);
      if (entry !== undefined && now - entry.createdAt < entry.ttlMs) {
        return schema.parse(entry.value);
      }
    } catch {
      // A cache miss is safer than surfacing stale IndexedDB implementation errors.
    }
    return undefined;
  }, undefined);

  if (cached !== undefined) {
    return cached;
  }

  const value = await fetcher();

  await withPortfolioDatabase(async (database) => {
    await writeStoreEntry<CacheEntry>(database, CACHE_STORE, key, { createdAt: now, ttlMs, value });
  }, undefined);

  return value;
}
