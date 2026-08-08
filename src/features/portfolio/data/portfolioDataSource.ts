import { mockPortfolioSnapshot } from './mockPortfolioSnapshot';
import { buildOnlinePortfolioSnapshot } from './onlinePortfolioData';
import { indexedDbPortfolioConfigRepository } from './portfolioConfigRepository';
import type { PortfolioPeriod, PortfolioSnapshot } from '../types/portfolio';

export type PortfolioDataSource = {
  readonly getSnapshot: (period: PortfolioPeriod) => Promise<PortfolioSnapshot>;
};

export const readOnlyMockPortfolioDataSource: PortfolioDataSource = {
  async getSnapshot() {
    return mockPortfolioSnapshot;
  },
};

export const configuredPortfolioDataSource: PortfolioDataSource = {
  async getSnapshot(period) {
    const settings = await indexedDbPortfolioConfigRepository.loadSettings();
    return settings === null
      ? readOnlyMockPortfolioDataSource.getSnapshot(period)
      : buildOnlinePortfolioSnapshot(settings, period);
  },
};
