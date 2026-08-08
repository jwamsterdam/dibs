import { z } from 'zod';

export const portfolioPeriodSchema = z.enum(['1D', '1W', '1M', 'YTD', '1Y', 'ALL']);

export const portfolioAssetSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  symbol: z.string().min(1),
  amount: z.number().nonnegative(),
  kind: z.enum(['crypto', 'stablecoin', 'staking', 'total']),
  staking: z
    .object({
      type: z.literal('ethereum-0x02'),
      availableRewardsEth: z.number().nonnegative(),
    })
    .optional(),
});

const pricePointSchema = z.object({ timestamp: z.string(), value: z.number() });

const periodPricesSchema = z.object({
  '1D': z.array(pricePointSchema),
  '1W': z.array(pricePointSchema),
  '1M': z.array(pricePointSchema),
  YTD: z.array(pricePointSchema),
  '1Y': z.array(pricePointSchema),
  ALL: z.array(pricePointSchema),
});

export const portfolioSnapshotSchema = z.object({
  people: z
    .array(
      z.object({
        id: z.string().min(1),
        name: z.string().min(1),
        selectedAssetId: z.string().min(1),
        assets: z.array(portfolioAssetSchema),
      }),
    )
    .min(1),
  marketSeries: z.array(
    z.object({
      assetId: z.string().min(1),
      prices: periodPricesSchema,
    }),
  ),
  fiatCurrency: z.literal('EUR'),
  futurePriceProvider: z.literal('coingecko'),
  futureStakingProvider: z.literal('beacon-api'),
  mode: z.literal('read-only-mock'),
});
