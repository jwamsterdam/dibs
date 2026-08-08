import type { PortfolioPeriod, PortfolioSnapshot } from '../types/portfolio';
import { portfolioSnapshotSchema } from '../validation/portfolio.schema';

const baseValues = {
  total: 352_946,
  btc: 26_896,
  eth: 14_712,
  usdc: 12_500,
  'eth-staking': 261_487,
} as const;

const periodStartValues: Record<PortfolioPeriod, Record<keyof typeof baseValues, number>> = {
  '1D': { total: 348_728, btc: 25_771, eth: 15_094, usdc: 12_500, 'eth-staking': 258_012 },
  '1W': { total: 341_200, btc: 24_940, eth: 14_980, usdc: 12_500, 'eth-staking': 248_780 },
  '1M': { total: 333_100, btc: 23_300, eth: 13_840, usdc: 12_500, 'eth-staking': 243_460 },
  YTD: { total: 298_900, btc: 18_860, eth: 12_920, usdc: 12_500, 'eth-staking': 216_740 },
  '1Y': { total: 276_500, btc: 16_540, eth: 10_420, usdc: 12_500, 'eth-staking': 198_120 },
  ALL: { total: 124_000, btc: 8_200, eth: 6_800, usdc: 12_500, 'eth-staking': 74_300 },
};

function buildPoints(
  period: PortfolioPeriod,
  assetId: keyof typeof baseValues,
): readonly { readonly timestamp: string; readonly value: number }[] {
  const startValue = periodStartValues[period][assetId];
  const endValue = baseValues[assetId];

  return Array.from({ length: 9 }, (_, index) => {
    const progress = index / 8;
    const wave = Math.sin(progress * Math.PI * 2) * (endValue * 0.008);
    return {
      timestamp: `${period}-${index}`,
      value: Math.round(startValue + (endValue - startValue) * progress + wave),
    };
  });
}

function buildSeries(assetId: keyof typeof baseValues): PortfolioSnapshot['marketSeries'][number] {
  const prices = {
    '1D': buildPoints('1D', assetId),
    '1W': buildPoints('1W', assetId),
    '1M': buildPoints('1M', assetId),
    YTD: buildPoints('YTD', assetId),
    '1Y': buildPoints('1Y', assetId),
    ALL: buildPoints('ALL', assetId),
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
        {
          id: 'eth-staking',
          label: 'ETH staking',
          symbol: 'ETH',
          amount: 86.21,
          kind: 'staking',
          staking: { type: 'ethereum-0x02', availableRewardsEth: 6.01 },
        },
      ],
    },
  ],
  marketSeries: Object.keys(baseValues).map((assetId) => buildSeries(assetId as keyof typeof baseValues)),
  fiatCurrency: 'EUR',
  futurePriceProvider: 'coingecko',
  futureStakingProvider: 'beacon-api',
  mode: 'read-only-mock',
} satisfies PortfolioSnapshot;

export const mockPortfolioSnapshot = portfolioSnapshotSchema.parse(snapshot);
