/* istanbul ignore file -- jsdom has no IndexedDB implementation; exercised by real browsers only. */

const DATABASE_NAME = 'dibs-portfolio';
const DATABASE_VERSION = 2;

export const CACHE_STORE = 'coingecko-cache';
export const CONFIG_STORE = 'portfolio-config';

function ensureStores(database: IDBDatabase): void {
  if (!database.objectStoreNames.contains(CACHE_STORE)) {
    database.createObjectStore(CACHE_STORE);
  }
  if (!database.objectStoreNames.contains(CONFIG_STORE)) {
    database.createObjectStore(CONFIG_STORE);
  }
}

export function openPortfolioDatabase(): Promise<IDBDatabase | null> {
  if (!('indexedDB' in globalThis)) {
    return Promise.resolve(null);
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

    request.onupgradeneeded = (): void => ensureStores(request.result);
    request.onerror = (): void =>
      reject(request.error ?? new Error('Unable to open portfolio database'));
    request.onsuccess = (): void => resolve(request.result);
  });
}

export function readStoreEntry<T>(
  database: IDBDatabase,
  store: string,
  key: string,
): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(store, 'readonly');
    const request = transaction.objectStore(store).get(key);

    request.onerror = (): void => reject(request.error ?? new Error(`Unable to read ${store}`));
    request.onsuccess = (): void => resolve(request.result as T | undefined);
  });
}

export function writeStoreEntry<T>(
  database: IDBDatabase,
  store: string,
  key: string,
  value: T,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(store, 'readwrite');
    transaction.objectStore(store).put(value, key);

    transaction.onerror = (): void =>
      reject(transaction.error ?? new Error(`Unable to write ${store}`));
    transaction.oncomplete = (): void => resolve();
  });
}

export async function withPortfolioDatabase<T>(
  operation: (database: IDBDatabase) => Promise<T>,
  fallback: T,
): Promise<T> {
  const database = await openPortfolioDatabase();
  if (database === null) {
    return fallback;
  }

  try {
    return await operation(database);
  } finally {
    database.close();
  }
}
