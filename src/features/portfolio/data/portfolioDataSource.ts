import { mockPortfolioSnapshot } from './mockPortfolioSnapshot';
import type { PortfolioSnapshot } from '../types/portfolio';

export type PortfolioDataSource = {
  readonly getSnapshot: () => Promise<PortfolioSnapshot>;
};

export const readOnlyMockPortfolioDataSource: PortfolioDataSource = {
  async getSnapshot() {
    return mockPortfolioSnapshot;
  },
};
