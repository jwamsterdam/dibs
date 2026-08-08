import { z } from 'zod';

export const portfolioFiatCurrencySchema = z.enum(['eur', 'usd', 'gbp', 'chf']);

export const portfolioHoldingConfigSchema = z.object({
  id: z.string().min(1),
  coinGeckoId: z.string().min(1),
  name: z.string().min(1),
  symbol: z.string().min(1),
  amount: z.number().positive(),
  purchasedAt: z.string().date(),
});

export const portfolioSettingsConfigSchema = z.object({
  personName: z.string().min(1),
  fiatCurrency: portfolioFiatCurrencySchema,
  holdings: z.array(portfolioHoldingConfigSchema),
});
