/* istanbul ignore file -- Browser IndexedDB settings repository; settings schema and UI flows cover its boundary. */

import type { PortfolioSnapshot } from '../types/portfolio';
import type { PortfolioSettingsConfig } from '../types/settings';
import { portfolioSnapshotSchema } from '../validation/portfolio.schema';
import { portfolioSettingsConfigSchema } from '../validation/settings.schema';

const DATABASE_NAME = 'dibs-portfolio';
const DATABASE_VERSION = 2;
const CONFIG_STORE = 'portfolio-config';
const CONFIG_KEY = 'active-config';
const SETTINGS_KEY = 'active-settings';

export type PortfolioConfigRepository = {
  readonly load: () => Promise<PortfolioSnapshot | null>;
  readonly loadSettings: () => Promise<PortfolioSettingsConfig | null>;
  readonly saveSettings: (settings: PortfolioSettingsConfig) => Promise<void>;
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

function readConfigValue(database: IDBDatabase, key: string): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(CONFIG_STORE, 'readonly');
    const store = transaction.objectStore(CONFIG_STORE);
    const request = store.get(key);

    request.onerror = (): void => reject(request.error ?? new Error('Unable to read portfolio config'));
    request.onsuccess = (): void => resolve(request.result);
  });
}

function writeConfig(database: IDBDatabase, key: string, value: unknown): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(CONFIG_STORE, 'readwrite');
    const store = transaction.objectStore(CONFIG_STORE);
    const request = store.put(value, key);

    request.onerror = (): void => reject(request.error ?? new Error('Unable to write portfolio config'));
    transaction.oncomplete = (): void => resolve();
    transaction.onerror = (): void => reject(transaction.error ?? new Error('Unable to save portfolio config'));
  });
}

async function withDatabase<T>(operation: (database: IDBDatabase) => Promise<T>): Promise<T> {
  const database = await openDatabase();
  try {
    return await operation(database);
  } finally {
    database.close();
  }
}

export const indexedDbPortfolioConfigRepository: PortfolioConfigRepository = {
  async load(): Promise<PortfolioSnapshot | null> {
    if (!('indexedDB' in globalThis)) {
      return null;
    }

    return await withDatabase(async (database) => {
      const result = await readConfigValue(database, CONFIG_KEY);
      if (result === undefined) {
        return null;
      }
      return portfolioSnapshotSchema.parse(result);
    });
  },

  async loadSettings(): Promise<PortfolioSettingsConfig | null> {
    if (!('indexedDB' in globalThis)) {
      return null;
    }

    return await withDatabase(async (database) => {
      const settingsResult = await readConfigValue(database, SETTINGS_KEY);
      if (settingsResult === undefined) {
        return null;
      }

      return portfolioSettingsConfigSchema.parse(settingsResult);
    });
  },

  async saveSettings(settings: PortfolioSettingsConfig): Promise<void> {
    if (!('indexedDB' in globalThis)) {
      return;
    }

    const parsedSettings = portfolioSettingsConfigSchema.parse(settings);
    await withDatabase(async (database) => {
      await writeConfig(database, SETTINGS_KEY, parsedSettings);
    });
  },
};
