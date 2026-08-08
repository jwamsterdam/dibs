import type { z } from 'zod';
import type {
  assetMarketSeriesSchema,
  portfolioAssetSchema,
  portfolioPeriodSchema,
  portfolioPersonSchema,
  portfolioSnapshotSchema,
  pricePointSchema,
} from '../validation/portfolio.schema';

export const PORTFOLIO_PERIODS = ['1D', '1W', '1M', 'YTD', '1Y', 'ALL'] as const;

export type ChangeDisplayMode = 'absolute' | 'percentage';

export type PortfolioPeriod = z.infer<typeof portfolioPeriodSchema>;

export type PortfolioAssetKind = z.infer<typeof portfolioAssetSchema>['kind'];

export type PortfolioAsset = z.infer<typeof portfolioAssetSchema>;

export type PortfolioPerson = z.infer<typeof portfolioPersonSchema>;

export type PricePoint = z.infer<typeof pricePointSchema>;

export type AssetMarketSeries = z.infer<typeof assetMarketSeriesSchema>;

export type PortfolioSnapshot = z.infer<typeof portfolioSnapshotSchema>;

export type PortfolioFiatCurrencyCode = PortfolioSnapshot['fiatCurrency'];
