import { z } from 'zod';
import { PORTFOLIO_FIAT_CURRENCIES } from '../types/settings';

export const portfolioFiatCurrencySchema = z.enum(PORTFOLIO_FIAT_CURRENCIES);

export const portfolioHoldingConfigSchema = z.object({
  id: z.string().min(1),
  coinGeckoId: z.string().min(1),
  name: z.string().min(1),
  symbol: z.string().min(1),
  amount: z.number().positive(),
  purchasedAt: z.string().date(),
  // Fetched once from CoinGecko at add-time and stored, so "since purchase" views (the ALL tab,
  // and any period whose window is clamped by the purchase date) don't need a fresh historical
  // lookup — and older holdings persisted before this field existed simply omit it.
  purchasePrice: z.number().positive().optional(),
});

export const portfolioPersonConfigSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  holdings: z.array(portfolioHoldingConfigSchema),
});

export const portfolioSettingsConfigSchema = z.object({
  fiatCurrency: portfolioFiatCurrencySchema,
  // No .min(1): "currency set, zero accounts created yet" is a legitimate saved state —
  // see migratePortfolioConfig.ts for how a pre-multi-account config upgrades into this shape.
  people: z.array(portfolioPersonConfigSchema),
});

export const coinSearchResultSchema = z.object({
  id: z.string(),
  name: z.string(),
  symbol: z.string(),
});
