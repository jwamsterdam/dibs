import type { z } from 'zod';
import type {
  coinSearchResultSchema,
  portfolioFiatCurrencySchema,
  portfolioHoldingConfigSchema,
  portfolioPersonConfigSchema,
  portfolioSettingsConfigSchema,
} from '../validation/settings.schema';

export const PORTFOLIO_FIAT_CURRENCIES = ['eur', 'usd', 'gbp', 'chf'] as const;

export type PortfolioFiatCurrency = z.infer<typeof portfolioFiatCurrencySchema>;

export type PortfolioHoldingConfig = z.infer<typeof portfolioHoldingConfigSchema>;

export type PortfolioPersonConfig = z.infer<typeof portfolioPersonConfigSchema>;

export type PortfolioSettingsConfig = z.infer<typeof portfolioSettingsConfigSchema>;

export type CoinSearchResult = z.infer<typeof coinSearchResultSchema>;
