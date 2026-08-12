/* istanbul ignore file -- jsdom has no IndexedDB implementation; exercised by real browsers only. */

import type { PortfolioSettingsConfig } from '../types/settings';
import { portfolioSettingsConfigSchema } from '../validation/settings.schema';
import { CONFIG_STORE, readStoreEntry, withPortfolioDatabase, writeStoreEntry } from './indexedDb';
import { migrateLegacyPortfolioConfig } from './migratePortfolioConfig';

const SETTINGS_KEY = 'active-settings';

export type PortfolioConfigRepository = {
  readonly loadSettings: () => Promise<PortfolioSettingsConfig | null>;
  readonly saveSettings: (settings: PortfolioSettingsConfig) => Promise<void>;
};

export const indexedDbPortfolioConfigRepository: PortfolioConfigRepository = {
  async loadSettings(): Promise<PortfolioSettingsConfig | null> {
    return withPortfolioDatabase(async (database) => {
      const result = await readStoreEntry<unknown>(database, CONFIG_STORE, SETTINGS_KEY);
      return result === undefined
        ? null
        : portfolioSettingsConfigSchema.parse(migrateLegacyPortfolioConfig(result));
    }, null);
  },

  async saveSettings(settings: PortfolioSettingsConfig): Promise<void> {
    const parsedSettings = portfolioSettingsConfigSchema.parse(settings);
    await withPortfolioDatabase(async (database) => {
      await writeStoreEntry(database, CONFIG_STORE, SETTINGS_KEY, parsedSettings);
    }, undefined);
  },
};
