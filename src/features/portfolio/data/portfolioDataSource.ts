import { mockPortfolioSnapshot } from './mockPortfolioSnapshot';
import { buildOnlinePortfolioSnapshot } from './onlinePortfolioData';
import { indexedDbPortfolioConfigRepository } from './portfolioConfigRepository';
import type { PortfolioSnapshot } from '../types/portfolio';

export type PortfolioDataSource = {
  readonly getSnapshot: (activePersonId?: string | null) => Promise<PortfolioSnapshot>;
};

export const readOnlyMockPortfolioDataSource: PortfolioDataSource = {
  async getSnapshot() {
    return mockPortfolioSnapshot;
  },
};

export const configuredPortfolioDataSource: PortfolioDataSource = {
  async getSnapshot(activePersonId) {
    const settings = await indexedDbPortfolioConfigRepository.loadSettings();
    if (settings === null || settings.people.length === 0) {
      return readOnlyMockPortfolioDataSource.getSnapshot();
    }

    const person =
      settings.people.find((candidate) => candidate.id === activePersonId) ?? settings.people[0];

    /* istanbul ignore next -- settings.people.length === 0 already returned above */
    if (person === undefined) {
      return readOnlyMockPortfolioDataSource.getSnapshot();
    }

    return buildOnlinePortfolioSnapshot(person, settings.fiatCurrency);
  },
};
