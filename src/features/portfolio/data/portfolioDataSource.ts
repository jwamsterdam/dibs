import { mockPortfolioSnapshot } from './mockPortfolioSnapshot';
import { buildOnlinePortfolioSnapshot } from './onlinePortfolioData';
import { indexedDbPortfolioConfigRepository } from './portfolioConfigRepository';
import type { PortfolioSnapshot } from '../types/portfolio';

export type PortfolioDataSource = {
  readonly getSnapshot: () => Promise<PortfolioSnapshot>;
};

export const readOnlyMockPortfolioDataSource: PortfolioDataSource = {
  async getSnapshot() {
    return mockPortfolioSnapshot;
  },
};

export const configuredPortfolioDataSource: PortfolioDataSource = {
  async getSnapshot() {
    const settings = await indexedDbPortfolioConfigRepository.loadSettings();
    return settings === null || settings.holdings.length === 0
      ? readOnlyMockPortfolioDataSource.getSnapshot()
      : buildOnlinePortfolioSnapshot(settings);
  },
};
