import type {
  AssetMarketSeries,
  PortfolioPeriod,
  PortfolioSnapshot,
  PricePoint,
} from '../types/portfolio';
import { portfolioSnapshotSchema } from '../validation/portfolio.schema';

const dayMs = 24 * 60 * 60 * 1_000;

// Kept independent of onlinePortfolioData's period-start logic (rather than importing it) —
// this mock has no real holdings to clamp against, so it only needs an approximate lookback
// per period, and staying decoupled keeps this fallback data source free of any dependency on
// the live-fetching module.
const periodLookbackMs: Record<PortfolioPeriod, number> = {
  '1D': dayMs,
  '1W': 7 * dayMs,
  '1M': 30 * dayMs,
  YTD: 220 * dayMs,
  '1Y': 365 * dayMs,
  ALL: 5 * 365 * dayMs,
};

const baseValues = {
  total: 352_946,
  btc: 26_896,
  eth: 14_712,
  usdc: 12_500,
} as const;

const periodStartValues: Record<PortfolioPeriod, Record<keyof typeof baseValues, number>> = {
  '1D': { total: 348_728, btc: 25_771, eth: 15_094, usdc: 12_500 },
  '1W': { total: 341_200, btc: 24_940, eth: 14_980, usdc: 12_500 },
  '1M': { total: 333_100, btc: 23_300, eth: 13_840, usdc: 12_500 },
  YTD: { total: 298_900, btc: 18_860, eth: 12_920, usdc: 12_500 },
  '1Y': { total: 276_500, btc: 16_540, eth: 10_420, usdc: 12_500 },
  ALL: { total: 124_000, btc: 8_200, eth: 6_800, usdc: 12_500 },
};

function buildPoints(
  period: PortfolioPeriod,
  assetId: keyof typeof baseValues,
  now: Date,
): PricePoint[] {
  const startValue = periodStartValues[period][assetId];
  const endValue = baseValues[assetId];
  const nowMs = now.getTime();
  const startMs = nowMs - periodLookbackMs[period];

  return Array.from({ length: 7 }, (_, index) => {
    const progress = index / 6;
    const wave = Math.sin(progress * Math.PI * 2) * (endValue * 0.008);
    return {
      timestamp: new Date(startMs + (nowMs - startMs) * progress).toISOString(),
      value: Math.round(startValue + (endValue - startValue) * progress + wave),
    };
  });
}

function buildSeries(assetId: keyof typeof baseValues, now: Date): AssetMarketSeries {
  const prices = {
    '1D': buildPoints('1D', assetId, now),
    '1W': buildPoints('1W', assetId, now),
    '1M': buildPoints('1M', assetId, now),
    YTD: buildPoints('YTD', assetId, now),
    '1Y': buildPoints('1Y', assetId, now),
    ALL: buildPoints('ALL', assetId, now),
  };

  return { assetId, prices };
}

const snapshot = {
  people: [
    {
      id: 'jan',
      name: 'JW',
      selectedAssetId: 'total',
      assets: [
        { id: 'btc', label: 'BTC', symbol: 'BTC', amount: 0.42, kind: 'crypto' },
        { id: 'eth', label: 'ETH', symbol: 'ETH', amount: 12.4, kind: 'crypto' },
        { id: 'usdc', label: 'USDC', symbol: 'USDC', amount: 12_500, kind: 'stablecoin' },
      ],
    },
  ],
  marketSeries: (Object.keys(baseValues) as (keyof typeof baseValues)[]).map((assetId) =>
    buildSeries(assetId, new Date()),
  ),
  fiatCurrency: 'EUR',
  futurePriceProvider: 'coingecko',
  futureStakingProvider: 'beacon-api',
  mode: 'read-only-mock',
} satisfies PortfolioSnapshot;

export const mockPortfolioSnapshot = portfolioSnapshotSchema.parse(snapshot);
