import { z } from 'zod';
import { PORTFOLIO_PERIODS } from '../types/portfolio';

export const portfolioPeriodSchema = z.enum(PORTFOLIO_PERIODS);

export const portfolioAssetSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  symbol: z.string().min(1),
  amount: z.number().nonnegative(),
  kind: z.enum(['crypto', 'stablecoin', 'total']),
});

export const pricePointSchema = z.object({ timestamp: z.string(), value: z.number() });

const periodPricesSchema = z.object({
  '1D': z.array(pricePointSchema),
  '1W': z.array(pricePointSchema),
  '1M': z.array(pricePointSchema),
  YTD: z.array(pricePointSchema),
  '1Y': z.array(pricePointSchema),
  ALL: z.array(pricePointSchema),
});

export const assetMarketSeriesSchema = z.object({
  assetId: z.string().min(1),
  prices: periodPricesSchema,
});

export const portfolioPersonSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  selectedAssetId: z.string().min(1),
  assets: z.array(portfolioAssetSchema),
});

export const portfolioSnapshotSchema = z.object({
  people: z.array(portfolioPersonSchema).min(1),
  marketSeries: z.array(assetMarketSeriesSchema),
  fiatCurrency: z.enum(['EUR', 'USD', 'GBP', 'CHF']),
  futurePriceProvider: z.literal('coingecko'),
  futureStakingProvider: z.literal('beacon-api'),
  mode: z.enum(['online', 'read-only-mock']),
});
