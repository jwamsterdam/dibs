import {
  buildOnlinePortfolioSnapshot,
  getEffectivePeriodStart,
  getPeriodStartDate,
} from './onlinePortfolioData';
import { getCoinGeckoMarketChart } from './coingeckoClient';

jest.mock('./coingeckoClient', () => ({
  ...jest.requireActual('./coingeckoClient'),
  getCoinGeckoMarketChart: jest.fn(),
}));

describe('onlinePortfolioData', () => {
  const now = new Date('2026-08-08T12:00:00.000Z');

  beforeEach(() => {
    jest
      .mocked(getCoinGeckoMarketChart)
      .mockReset()
      .mockResolvedValue([
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

  it('clamps a purchase date older than 364 days instead of exceeding the CoinGecko public API range', () => {
    const start = getEffectivePeriodStart('ALL', '2024-01-15', now);

    expect(start.toISOString()).toBe('2025-08-09T12:00:00.000Z');
  });

  it('does not clamp a purchase date that is already within the allowed range', () => {
    expect(getEffectivePeriodStart('ALL', '2026-07-12', now).toISOString()).toBe(
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

  it('builds an online snapshot with every period pre-computed, not just one', async () => {
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
      now,
    );

    expect(snapshot.mode).toBe('online');
    expect(snapshot.fiatCurrency).toBe('EUR');
    expect(snapshot.people[0]?.assets[0]?.amount).toBe(0.5);
    expect(
      snapshot.marketSeries.find((series) => series.assetId === 'btc-1')?.prices['1W'],
    ).toHaveLength(60);
    expect(
      snapshot.marketSeries.find((series) => series.assetId === 'btc-1')?.prices['1D'],
    ).toHaveLength(60);
    expect(
      snapshot.marketSeries.find((series) => series.assetId === 'total')?.prices['1W'][0]?.value,
    ).toBe(30_000);
  });

  it('fetches each unique coin only once, even when it is held twice', async () => {
    await buildOnlinePortfolioSnapshot(
      {
        fiatCurrency: 'eur',
        holdings: [
          {
            amount: 0.3,
            coinGeckoId: 'bitcoin',
            id: 'btc-1',
            name: 'Bitcoin',
            purchasedAt: '2024-01-15',
            symbol: 'BTC',
          },
          {
            amount: 0.15,
            coinGeckoId: 'bitcoin',
            id: 'btc-2',
            name: 'Bitcoin',
            purchasedAt: '2025-06-08',
            symbol: 'BTC',
          },
        ],
        personName: 'JW',
      },
      now,
    );

    // One "recent" + one "history" request for bitcoin — not one pair per holding, and not one
    // request per period tab.
    expect(getCoinGeckoMarketChart).toHaveBeenCalledTimes(2);
  });

  it('rounds the request window to the cache TTL so repeat builds reuse the same cache key', async () => {
    await buildOnlinePortfolioSnapshot(
      {
        fiatCurrency: 'eur',
        holdings: [
          {
            amount: 0.5,
            coinGeckoId: 'bitcoin',
            id: 'btc-1',
            name: 'Bitcoin',
            purchasedAt: '2026-08-01',
            symbol: 'BTC',
          },
        ],
        personName: 'JW',
      },
      now,
    );

    const cacheTtlSeconds = 30 * 60;
    jest.mocked(getCoinGeckoMarketChart).mock.calls.forEach(([, , , toSeconds]) => {
      expect(toSeconds % cacheTtlSeconds).toBe(0);
    });
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
      now,
    );

    expect(
      snapshot.marketSeries.find((series) => series.assetId === 'btc-1')?.prices['1D'][0]?.value,
    ).toBe(0);
  });

  it('keeps the snapshot online when one coin fails to load its chart', async () => {
    const ethPoints = [
      { price: 3_000, timestamp: new Date('2026-08-01T12:00:00.000Z').getTime() },
      { price: 3_200, timestamp: now.getTime() },
    ];
    jest
      .mocked(getCoinGeckoMarketChart)
      .mockImplementationOnce(() => Promise.reject(new Error('rate limited'))) // bitcoin: recent
      .mockImplementationOnce(() => Promise.reject(new Error('rate limited'))) // bitcoin: history
      .mockResolvedValueOnce(ethPoints) // ethereum: recent
      .mockResolvedValueOnce(ethPoints); // ethereum: history

    const snapshot = await buildOnlinePortfolioSnapshot(
      {
        fiatCurrency: 'eur',
        holdings: [
          {
            amount: 0.5,
            coinGeckoId: 'bitcoin',
            id: 'btc-1',
            name: 'Bitcoin',
            purchasedAt: '2026-08-01',
            symbol: 'BTC',
          },
          {
            amount: 2,
            coinGeckoId: 'ethereum',
            id: 'eth-1',
            name: 'Ethereum',
            purchasedAt: '2026-08-01',
            symbol: 'ETH',
          },
        ],
        personName: 'JW',
      },
      now,
    );

    expect(snapshot.mode).toBe('online');
    expect(
      snapshot.marketSeries.find((series) => series.assetId === 'btc-1')?.prices['1D'][0]?.value,
    ).toBe(0);
    expect(
      snapshot.marketSeries.find((series) => series.assetId === 'eth-1')?.prices['1D'][0]?.value,
    ).toBe(6_400);
  });

  it('uses the stored purchase price for a straight-line ALL series, unlike the estimated 1Y series', async () => {
    const snapshot = await buildOnlinePortfolioSnapshot(
      {
        fiatCurrency: 'eur',
        holdings: [
          {
            amount: 1,
            coinGeckoId: 'bitcoin',
            id: 'btc-1',
            name: 'Bitcoin',
            purchasePrice: 20_000,
            purchasedAt: '2024-01-15',
            symbol: 'BTC',
          },
        ],
        personName: 'JW',
      },
      now,
    );

    const series = snapshot.marketSeries.find((item) => item.assetId === 'btc-1');
    const allPoints = series?.prices.ALL ?? [];
    const oneYearPoints = series?.prices['1Y'] ?? [];

    expect(allPoints[0]?.value).toBe(20_000);
    expect(allPoints.at(-1)?.value).toBeCloseTo(62_000);
    expect(allPoints[0]?.value).not.toBe(oneYearPoints[0]?.value);
  });

  it('keeps ALL identical to 1Y for a legacy holding with no stored purchase price', async () => {
    const snapshot = await buildOnlinePortfolioSnapshot(
      {
        fiatCurrency: 'eur',
        holdings: [
          {
            amount: 1,
            coinGeckoId: 'bitcoin',
            id: 'btc-1',
            name: 'Bitcoin',
            purchasedAt: '2024-01-15',
            symbol: 'BTC',
          },
        ],
        personName: 'JW',
      },
      now,
    );

    const series = snapshot.marketSeries.find((item) => item.assetId === 'btc-1');
    expect(series?.prices.ALL).toEqual(series?.prices['1Y']);
  });

  it('uses the stored purchase price as the first sample once the purchase date binds the window', async () => {
    const snapshot = await buildOnlinePortfolioSnapshot(
      {
        fiatCurrency: 'eur',
        holdings: [
          {
            amount: 2,
            coinGeckoId: 'bitcoin',
            id: 'btc-1',
            name: 'Bitcoin',
            purchasePrice: 55_000,
            // 14 days before `now` — further back than 1W, but more recent than 1M's own
            // ~30-day window, so the purchase date (not the period) bounds "1M" here.
            purchasedAt: '2026-07-25',
            symbol: 'BTC',
          },
        ],
        personName: 'JW',
      },
      now,
    );

    const monthPoints = snapshot.marketSeries.find((item) => item.assetId === 'btc-1')?.prices[
      '1M'
    ];

    expect(monthPoints?.[0]?.value).toBe(110_000);
  });

  it('covers the remaining period starts used by online ranges', () => {
    expect(getPeriodStartDate('1D', now).getDate()).toBe(7);
    expect(getPeriodStartDate('1M', now).getMonth()).toBe(6);
    expect(getPeriodStartDate('1Y', now).getFullYear()).toBe(2025);
    expect(getPeriodStartDate('ALL', now).getTime()).toBe(0);
  });
});
