import {
  buildOnlinePortfolioSnapshot,
  getEffectivePeriodStart,
  getPeriodStartDate,
} from './onlinePortfolioData';
import { getCoinGeckoMarketChart, getCoinGeckoPrices } from './coingeckoClient';

jest.mock('./coingeckoClient', () => ({
  getCoinGeckoMarketChart: jest.fn(),
  getCoinGeckoPrices: jest.fn(),
}));

describe('onlinePortfolioData', () => {
  const now = new Date('2026-08-08T12:00:00.000Z');

  beforeEach(() => {
    jest.mocked(getCoinGeckoPrices).mockResolvedValue(new Map([['bitcoin', 62_000]]));
    jest.mocked(getCoinGeckoMarketChart).mockResolvedValue([
      { price: 60_000, timestamp: new Date('2026-08-01T12:00:00.000Z').getTime() },
      { price: 62_000, timestamp: now.getTime() },
    ]);
  });

  it('uses the period start when the purchase happened before the selected period', () => {
    expect(getEffectivePeriodStart('1W', '2026-01-10', now).toISOString()).toBe(
      '2026-08-01T12:00:00.000Z',
    );
  });

  it('uses the purchase date when it is later than the selected period start', () => {
    expect(getEffectivePeriodStart('1Y', '2026-07-12', now).toISOString()).toBe(
      '2026-07-12T00:00:00.000Z',
    );
  });

  it('starts YTD charts at the beginning of the current year', () => {
    const start = getPeriodStartDate('YTD', now);

    expect(start.getFullYear()).toBe(2026);
    expect(start.getMonth()).toBe(0);
    expect(start.getDate()).toBe(1);
    expect(start.getHours()).toBe(0);
  });

  it('builds an online snapshot from configured CoinGecko holdings', async () => {
    const snapshot = await buildOnlinePortfolioSnapshot(
      {
        fiatCurrency: 'eur',
        holdings: [
          {
            amount: 0.5,
            coinGeckoId: 'bitcoin',
            id: 'btc-1',
            name: 'Bitcoin',
            purchasedAt: '2026-01-10',
            symbol: 'BTC',
          },
        ],
        personName: 'JW',
      },
      '1W',
      now,
    );

    expect(snapshot.mode).toBe('online');
    expect(snapshot.fiatCurrency).toBe('EUR');
    expect(snapshot.people[0]?.assets[0]?.amount).toBe(31_000);
    expect(snapshot.marketSeries.find((series) => series.assetId === 'btc-1')?.prices['1W']).toHaveLength(7);
    expect(snapshot.marketSeries.find((series) => series.assetId === 'btc-1')?.prices['1D']).toEqual([]);
    expect(snapshot.marketSeries.find((series) => series.assetId === 'total')?.prices['1W'][0]?.value).toBe(
      30_000,
    );
  });

  it('uses zero-valued chart samples when CoinGecko returns no chart prices', async () => {
    jest.mocked(getCoinGeckoMarketChart).mockResolvedValue([]);

    const snapshot = await buildOnlinePortfolioSnapshot(
      {
        fiatCurrency: 'eur',
        holdings: [
          {
            amount: 2,
            coinGeckoId: 'bitcoin',
            id: 'btc-1',
            name: 'Bitcoin',
            purchasedAt: '2026-08-01',
            symbol: 'BTC',
          },
        ],
        personName: 'JW',
      },
      '1D',
      now,
    );

    expect(snapshot.marketSeries.find((series) => series.assetId === 'btc-1')?.prices['1D'][0]?.value).toBe(0);
  });

  it('covers the remaining period starts used by online ranges', () => {
    expect(getPeriodStartDate('1D', now).getDate()).toBe(7);
    expect(getPeriodStartDate('1M', now).getMonth()).toBe(6);
    expect(getPeriodStartDate('1Y', now).getFullYear()).toBe(2025);
    expect(getPeriodStartDate('ALL', now).getTime()).toBe(0);
  });
});
