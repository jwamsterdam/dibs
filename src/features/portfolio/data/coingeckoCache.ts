/* istanbul ignore file -- Browser IndexedDB cache wrapper; CoinGecko adapter behavior is tested above it. */

import type { ZodType } from 'zod';

const DATABASE_NAME = 'dibs-portfolio';
const DATABASE_VERSION = 2;
const CACHE_STORE = 'coingecko-cache';

type CacheEntry = {
  readonly createdAt: number;
  readonly ttlMs: number;
  readonly value: unknown;
};

function openDatabase(): Promise<IDBDatabase | null> {
  if (!('indexedDB' in globalThis)) {
    return Promise.resolve(null);
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

    request.onupgradeneeded = (): void => {
      const database = request.result;
      if (!database.objectStoreNames.contains(CACHE_STORE)) {
        database.createObjectStore(CACHE_STORE);
      }
      if (!database.objectStoreNames.contains('portfolio-config')) {
        database.createObjectStore('portfolio-config');
      }
    };
    request.onerror = (): void => reject(request.error ?? new Error('Unable to open CoinGecko cache'));
    request.onsuccess = (): void => resolve(request.result);
  });
}

function readEntry(database: IDBDatabase, key: string): Promise<CacheEntry | null> {
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(CACHE_STORE, 'readonly');
    const store = transaction.objectStore(CACHE_STORE);
    const request = store.get(key);

    request.onerror = (): void => reject(request.error ?? new Error('Unable to read CoinGecko cache'));
    request.onsuccess = (): void => {
      const result = request.result as CacheEntry | undefined;
      resolve(result ?? null);
    };
  });
}

function writeEntry(database: IDBDatabase, key: string, entry: CacheEntry): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(CACHE_STORE, 'readwrite');
    const store = transaction.objectStore(CACHE_STORE);
    const request = store.put(entry, key);

    request.onerror = (): void => reject(request.error ?? new Error('Unable to write CoinGecko cache'));
    transaction.oncomplete = (): void => resolve();
    transaction.onerror = (): void => reject(transaction.error ?? new Error('Unable to save CoinGecko cache'));
  });
}

export async function getCachedOrFetch<T>(
  key: string,
  ttlMs: number,
  schema: ZodType<T>,
  fetcher: () => Promise<unknown>,
): Promise<T> {
  const database = await openDatabase();
  const now = Date.now();

  try {
    if (database !== null) {
      try {
        const entry = await readEntry(database, key);
        if (entry !== null && now - entry.createdAt < entry.ttlMs) {
          return schema.parse(entry.value);
        }
      } catch {
        // A cache miss is safer than surfacing stale IndexedDB implementation errors.
      }
    }

    const value = schema.parse(await fetcher());

    if (database !== null) {
      await writeEntry(database, key, { createdAt: now, ttlMs, value });
    }

    return value;
  } finally {
    database?.close();
  }
}
