/* istanbul ignore file -- Activated when settings become writable beyond the read-only MVP. */

import type { PortfolioSnapshot } from '../types/portfolio';
import { portfolioSnapshotSchema } from '../validation/portfolio.schema';

const DATABASE_NAME = 'dibs-portfolio';
const DATABASE_VERSION = 1;
const CONFIG_STORE = 'portfolio-config';
const CONFIG_KEY = 'active-config';

export type PortfolioConfigRepository = {
  readonly load: () => Promise<PortfolioSnapshot | null>;
};

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

    request.onupgradeneeded = (): void => {
      const database = request.result;
      if (!database.objectStoreNames.contains(CONFIG_STORE)) {
        database.createObjectStore(CONFIG_STORE);
      }
    };
    request.onerror = (): void => reject(request.error ?? new Error('Unable to open portfolio storage'));
    request.onsuccess = (): void => resolve(request.result);
  });
}

function readConfig(database: IDBDatabase): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(CONFIG_STORE, 'readonly');
    const store = transaction.objectStore(CONFIG_STORE);
    const request = store.get(CONFIG_KEY);

    request.onerror = (): void => reject(request.error ?? new Error('Unable to read portfolio config'));
    request.onsuccess = (): void => resolve(request.result);
  });
}

export const indexedDbPortfolioConfigRepository: PortfolioConfigRepository = {
  async load(): Promise<PortfolioSnapshot | null> {
    if (!('indexedDB' in globalThis)) {
      return null;
    }

    const database = await openDatabase();
    try {
      const result = await readConfig(database);
      if (result === undefined) {
        return null;
      }
      return portfolioSnapshotSchema.parse(result);
    } finally {
      database.close();
    }
  },
};
