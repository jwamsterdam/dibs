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
import { getCoinGeckoMarketChart, type CoinGeckoChartPoint } from './coingeckoClient';

const sampleCount = 7;
// CoinGecko's public API rejects `market_chart/range` requests older than 365 days
// (error 10012, "Public API users are limited to querying historical data within the past
// 365 days"), so a purchase date beyond that gets clamped rather than sent straight to the
// API — otherwise the whole request 401s and the holding falls back to a flat/zero series.
const coinGeckoMaxHistoryDays = 364;

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

function buildPricePoints(
  holding: PortfolioHoldingConfig,
  marketChart: readonly CoinGeckoChartPoint[],
  period: PortfolioPeriod,
  now: Date,
): readonly PricePoint[] {
  const start = getEffectivePeriodStart(period, holding.purchasedAt, now);
  return createSampleTimes(start, now).map((timestamp) => ({
    timestamp: new Date(timestamp).toISOString(),
    value: findNearestPrice(marketChart, timestamp) * holding.amount,
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

async function buildHoldingSeries(
  holding: PortfolioHoldingConfig,
  currency: PortfolioFiatCurrency,
  activePeriod: PortfolioPeriod,
  now: Date,
): Promise<AssetMarketSeries> {
  const start = getEffectivePeriodStart(activePeriod, holding.purchasedAt, now);
  // A single holding's chart request failing (rate limit, network hiccup, delisted coin) must not
  // take down the rest of the portfolio snapshot, so it degrades to a flat/zero series instead.
  const chart = await getCoinGeckoMarketChart(
    holding.coinGeckoId,
    currency,
    toUnixSeconds(start),
    toUnixSeconds(now),
  ).catch(() => []);
  const activePricePoints = buildPricePoints(holding, chart, activePeriod, now);
  const priceEntries = PORTFOLIO_PERIODS.map(
    (period) => [period, period === activePeriod ? activePricePoints : []] as const,
  );

  return {
    assetId: holding.id,
    prices: Object.fromEntries(priceEntries) as AssetMarketSeries['prices'],
  };
}

export async function buildOnlinePortfolioSnapshot(
  settings: PortfolioSettingsConfig,
  activePeriod: PortfolioPeriod,
  now = new Date(),
): Promise<PortfolioSnapshot> {
  const holdingSeries = await Promise.all(
    settings.holdings.map((holding) =>
      buildHoldingSeries(holding, settings.fiatCurrency, activePeriod, now),
    ),
  );
  const totalPrices = Object.fromEntries(
    PORTFOLIO_PERIODS.map((period) => [
      period,
      period === activePeriod ? buildTotalPoints(holdingSeries, period) : [],
    ]),
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
