import { readOnlyMockPortfolioDataSource } from './portfolioDataSource';

describe('readOnlyMockPortfolioDataSource', () => {
  it('exposes the agreed read-only future provider direction', async () => {
    const snapshot = await readOnlyMockPortfolioDataSource.getSnapshot();

    expect(snapshot.mode).toBe('read-only-mock');
    expect(snapshot.futurePriceProvider).toBe('coingecko');
    expect(snapshot.futureStakingProvider).toBe('beacon-api');
    expect(snapshot.people[0]?.name).toBe('JW');
  });
});
