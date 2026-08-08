/* istanbul ignore file -- jsdom has no IndexedDB implementation; exercised by real browsers only. */

import type { ZodType } from 'zod';
import { CACHE_STORE, openPortfolioDatabase, readStoreEntry, writeStoreEntry } from './indexedDb';

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
  const database = await openPortfolioDatabase();
  const now = Date.now();

  try {
    if (database !== null) {
      try {
        const entry = await readStoreEntry<CacheEntry>(database, CACHE_STORE, key);
        if (entry !== undefined && now - entry.createdAt < entry.ttlMs) {
          return schema.parse(entry.value);
        }
      } catch {
        // A cache miss is safer than surfacing stale IndexedDB implementation errors.
      }
    }

    const value = await fetcher();

    if (database !== null) {
      await writeStoreEntry<CacheEntry>(database, CACHE_STORE, key, {
        createdAt: now,
        ttlMs,
        value,
      });
    }

    return value;
  } finally {
    database?.close();
  }
}
