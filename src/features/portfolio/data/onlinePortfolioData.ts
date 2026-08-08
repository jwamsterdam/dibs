import { PORTFOLIO_PERIODS } from '../types/portfolio';
import type {
  AssetMarketSeries,
  PortfolioAsset,
  PortfolioPeriod,
  PortfolioSnapshot,
  PricePoint,
} from '../types/portfolio';
import type {
  PortfolioFiatCurrency,
  PortfolioHoldingConfig,
  PortfolioSettingsConfig,
} from '../types/settings';
import { portfolioSnapshotSchema } from '../validation/portfolio.schema';
import {
  chartCacheTtlMs,
  getCoinGeckoMarketChart,
  type CoinGeckoChartPoint,
} from './coingeckoClient';

const sampleCount = 7;
// CoinGecko's public API rejects `market_chart/range` requests older than 365 days
// (error 10012, "Public API users are limited to querying historical data within the past
// 365 days"), so a purchase date beyond that gets clamped rather than sent straight to the
// API — otherwise the whole request 401s and the holding falls back to a flat/zero series.
const coinGeckoMaxHistoryDays = 364;
// Covers the "1D" tab with margin; the daily bucket below covers everything longer.
const recentBucketDays = 2;

function clampToCoinGeckoHistoryLimit(date: Date, now: Date): Date {
  const earliestAllowed = new Date(now);
  earliestAllowed.setDate(earliestAllowed.getDate() - coinGeckoMaxHistoryDays);
  return date < earliestAllowed ? earliestAllowed : date;
}

export function getPeriodStartDate(period: PortfolioPeriod, now: Date): Date {
  const start = new Date(now);

  if (period === '1D') {
    start.setDate(start.getDate() - 1);
    return start;
  }

  if (period === '1W') {
    start.setDate(start.getDate() - 7);
    return start;
  }

  if (period === '1M') {
    start.setMonth(start.getMonth() - 1);
    return start;
  }

  if (period === 'YTD') {
    return new Date(now.getFullYear(), 0, 1);
  }

  if (period === '1Y') {
    start.setFullYear(start.getFullYear() - 1);
    return start;
  }

  return new Date(0);
}

export function getEffectivePeriodStart(
  period: PortfolioPeriod,
  purchasedAt: string,
  now: Date,
): Date {
  const periodStart = getPeriodStartDate(period, now);
  const purchaseDate = new Date(`${purchasedAt}T00:00:00.000Z`);
  const effectiveStart = purchaseDate > periodStart ? purchaseDate : periodStart;
  return clampToCoinGeckoHistoryLimit(effectiveStart, now);
}

const currencyCodesByFiatCurrency: Record<
  PortfolioFiatCurrency,
  PortfolioSnapshot['fiatCurrency']
> = {
  eur: 'EUR',
  usd: 'USD',
  gbp: 'GBP',
  chf: 'CHF',
};

function getCurrencyCode(currency: PortfolioFiatCurrency): PortfolioSnapshot['fiatCurrency'] {
  return currencyCodesByFiatCurrency[currency];
}

function toUnixSeconds(date: Date): number {
  return Math.floor(date.getTime() / 1_000);
}

/**
 * Rounds down to the same cache-TTL-sized window used by {@link getCoinGeckoMarketChart}'s
 * IndexedDB cache, so the exact request range — and therefore its cache key — stays identical
 * across snapshot rebuilds within that window. Without this, `now` (and so the request's `to`)
 * changes on every rebuild, and the 30-minute cache TTL never actually gets reused.
 */
function roundDownToCacheWindow(date: Date): Date {
  return new Date(Math.floor(date.getTime() / chartCacheTtlMs) * chartCacheTtlMs);
}

function createSampleTimes(from: Date, to: Date): readonly number[] {
  const fromMs = from.getTime();
  const toMs = to.getTime();
  const distance = Math.max(toMs - fromMs, sampleCount - 1);

  return Array.from({ length: sampleCount }, (_, index) =>
    Math.round(fromMs + (distance * index) / (sampleCount - 1)),
  );
}

function findNearestPrice(points: readonly CoinGeckoChartPoint[], timestamp: number): number {
  if (points.length === 0) {
    return 0;
  }

  const target = timestamp;
  const firstPoint = points[0];
  if (firstPoint === undefined) {
    return 0;
  }
  let nearestPoint = firstPoint;

  points.forEach((point) => {
    if (Math.abs(point.timestamp - target) < Math.abs(nearestPoint.timestamp - target)) {
      nearestPoint = point;
    }
  });

  return nearestPoint.price;
}

/**
 * The two chart ranges a coin needs to cover every period tab. "1D" reads from `recent`
 * (a couple of days, hourly-ish resolution); every longer tab reads from `history` (up to the
 * 364-day API limit, daily resolution). Fetched once per coin — not per holding, and not per
 * period tab — so switching tabs, or holding the same coin twice, costs nothing extra.
 */
type CoinCharts = {
  readonly recent: readonly CoinGeckoChartPoint[];
  readonly history: readonly CoinGeckoChartPoint[];
};

function bucketForPeriod(period: PortfolioPeriod): keyof CoinCharts {
  return period === '1D' ? 'recent' : 'history';
}

async function fetchCoinCharts(
  coinId: string,
  currency: PortfolioFiatCurrency,
  now: Date,
): Promise<CoinCharts> {
  const cacheNow = roundDownToCacheWindow(now);
  const recentFrom = new Date(cacheNow);
  recentFrom.setDate(recentFrom.getDate() - recentBucketDays);
  const historyFrom = new Date(cacheNow);
  historyFrom.setDate(historyFrom.getDate() - coinGeckoMaxHistoryDays);

  // A failing bucket degrades to an empty (flat/zero) series instead of taking the other
  // holdings — or the other bucket — down with it.
  const [recent, history] = await Promise.all([
    getCoinGeckoMarketChart(
      coinId,
      currency,
      toUnixSeconds(recentFrom),
      toUnixSeconds(cacheNow),
    ).catch(() => []),
    getCoinGeckoMarketChart(
      coinId,
      currency,
      toUnixSeconds(historyFrom),
      toUnixSeconds(cacheNow),
    ).catch(() => []),
  ]);

  return { recent, history };
}

function buildPricePointsForPeriod(
  holding: PortfolioHoldingConfig,
  charts: CoinCharts,
  period: PortfolioPeriod,
  now: Date,
): readonly PricePoint[] {
  const chart = charts[bucketForPeriod(period)];
  const start = getEffectivePeriodStart(period, holding.purchasedAt, now);
  return createSampleTimes(start, now).map((timestamp) => ({
    timestamp: new Date(timestamp).toISOString(),
    value: findNearestPrice(chart, timestamp) * holding.amount,
  }));
}

function buildTotalPoints(
  series: readonly AssetMarketSeries[],
  period: PortfolioPeriod,
): readonly PricePoint[] {
  const periodSeries = series.map((item) => item.prices[period]);
  const referenceSeries = periodSeries[0] ?? [];

  return referenceSeries.map((point, index) => ({
    timestamp: point.timestamp,
    value: periodSeries.reduce((sum, points) => sum + (points[index]?.value ?? 0), 0),
  }));
}

function buildHoldingSeries(
  holding: PortfolioHoldingConfig,
  chartsByCoin: ReadonlyMap<string, CoinCharts>,
  now: Date,
): AssetMarketSeries {
  const charts = chartsByCoin.get(holding.coinGeckoId) ?? { recent: [], history: [] };
  const priceEntries = PORTFOLIO_PERIODS.map(
    (period) => [period, buildPricePointsForPeriod(holding, charts, period, now)] as const,
  );

  return {
    assetId: holding.id,
    prices: Object.fromEntries(priceEntries) as AssetMarketSeries['prices'],
  };
}

export async function buildOnlinePortfolioSnapshot(
  settings: PortfolioSettingsConfig,
  now = new Date(),
): Promise<PortfolioSnapshot> {
  const uniqueCoinIds = [...new Set(settings.holdings.map((holding) => holding.coinGeckoId))];
  const chartsByCoin = new Map(
    await Promise.all(
      uniqueCoinIds.map(
        async (coinId) =>
          [coinId, await fetchCoinCharts(coinId, settings.fiatCurrency, now)] as const,
      ),
    ),
  );

  const holdingSeries = settings.holdings.map((holding) =>
    buildHoldingSeries(holding, chartsByCoin, now),
  );
  const totalPrices = Object.fromEntries(
    PORTFOLIO_PERIODS.map((period) => [period, buildTotalPoints(holdingSeries, period)]),
  ) as AssetMarketSeries['prices'];

  const assets: PortfolioAsset[] = settings.holdings.map((holding) => ({
    id: holding.id,
    label: holding.symbol,
    symbol: holding.symbol,
    amount: holding.amount,
    kind: 'crypto',
  }));

  const snapshot = {
    people: [
      {
        id: 'settings-person',
        name: settings.personName,
        selectedAssetId: 'total',
        assets,
      },
    ],
    marketSeries: [{ assetId: 'total', prices: totalPrices }, ...holdingSeries],
    fiatCurrency: getCurrencyCode(settings.fiatCurrency),
    futurePriceProvider: 'coingecko',
    futureStakingProvider: 'beacon-api',
    mode: 'online',
  } satisfies PortfolioSnapshot;

  return portfolioSnapshotSchema.parse(snapshot);
}
