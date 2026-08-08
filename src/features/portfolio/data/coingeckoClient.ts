import { z } from 'zod';
import { apiGet } from '@/shared/lib/http/client';
import type { CoinSearchResult, PortfolioFiatCurrency } from '../types/settings';
import { coinSearchResultSchema } from '../validation/settings.schema';
import { getCachedOrFetch } from './coingeckoCache';

const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';
const searchCacheTtlMs = 24 * 60 * 60 * 1_000;
const priceCacheTtlMs = 60 * 1_000;
const chartCacheTtlMs = 30 * 60 * 1_000;

const fallbackSearchCoins: readonly CoinSearchResult[] = [
  { id: 'bitcoin', marketCapRank: 1, name: 'Bitcoin', symbol: 'BTC', thumb: '' },
  { id: 'ethereum', marketCapRank: 2, name: 'Ethereum', symbol: 'ETH', thumb: '' },
  { id: 'solana', marketCapRank: 6, name: 'Solana', symbol: 'SOL', thumb: '' },
  { id: 'ripple', marketCapRank: 4, name: 'XRP', symbol: 'XRP', thumb: '' },
  { id: 'cardano', marketCapRank: 10, name: 'Cardano', symbol: 'ADA', thumb: '' },
  { id: 'polkadot', marketCapRank: 25, name: 'Polkadot', symbol: 'DOT', thumb: '' },
  { id: 'chainlink', marketCapRank: 15, name: 'Chainlink', symbol: 'LINK', thumb: '' },
  { id: 'usd-coin', marketCapRank: 7, name: 'USDC', symbol: 'USDC', thumb: '' },
] as const;

const coinSearchResponseSchema = z.object({
  coins: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      symbol: z.string(),
      market_cap_rank: z.number().nullable(),
      thumb: z.string(),
    }),
  ),
});

const mappedCoinSearchResponseSchema = coinSearchResponseSchema.transform(
  (response): readonly CoinSearchResult[] =>
    response.coins.map((coin) => ({
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol.toUpperCase(),
      marketCapRank: coin.market_cap_rank,
      thumb: coin.thumb,
    })),
);

const simplePriceResponseSchema = z.record(
  z.object({
    eur: z.number().optional(),
    usd: z.number().optional(),
    gbp: z.number().optional(),
    chf: z.number().optional(),
  }),
);

const marketChartResponseSchema = z.object({
  prices: z.array(z.tuple([z.number(), z.number()])),
});

export type CoinGeckoChartPoint = {
  readonly timestamp: number;
  readonly price: number;
};

function buildUrl(path: string, params: Record<string, string>): string {
  const url = new URL(`${COINGECKO_BASE_URL}${path}`);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  return url.toString();
}

export async function searchCoinGeckoCoins(query: string): Promise<readonly CoinSearchResult[]> {
  const normalizedQuery = query.trim().toLowerCase();
  if (normalizedQuery.length < 2) {
    return [];
  }

  const fallbackResults = fallbackSearchCoins.filter(
    (coin) =>
      coin.name.toLowerCase().includes(normalizedQuery) ||
      coin.symbol.toLowerCase().includes(normalizedQuery) ||
      coin.id.includes(normalizedQuery),
  );

  try {
    const mappedCoins = await getCachedOrFetch(
      `search:${normalizedQuery}`,
      searchCacheTtlMs,
      z.array(coinSearchResultSchema),
      () => apiGet(buildUrl('/search', { query: normalizedQuery }), mappedCoinSearchResponseSchema),
    );
    const topCoins = mappedCoins.slice(0, 8);

    return topCoins.length > 0 ? topCoins : fallbackResults;
  } catch {
    return fallbackResults;
  }
}

export async function getCoinGeckoPrices(
  coinIds: readonly string[],
  currency: PortfolioFiatCurrency,
): Promise<ReadonlyMap<string, number>> {
  if (coinIds.length === 0) {
    return new Map();
  }

  const ids = Array.from(new Set(coinIds)).sort();
  const response = await getCachedOrFetch(
    `prices:${currency}:${ids.join(',')}`,
    priceCacheTtlMs,
    simplePriceResponseSchema,
    () =>
      apiGet(
        buildUrl('/simple/price', { ids: ids.join(','), vs_currencies: currency }),
        simplePriceResponseSchema,
      ),
  );

  return new Map(
    ids.map((id) => {
      const price = response[id]?.[currency] ?? 0;
      return [id, price] as const;
    }),
  );
}

export async function getCoinGeckoMarketChart(
  coinId: string,
  currency: PortfolioFiatCurrency,
  fromSeconds: number,
  toSeconds: number,
): Promise<readonly CoinGeckoChartPoint[]> {
  const roundedFrom = Math.floor(fromSeconds);
  const roundedTo = Math.floor(toSeconds);
  const response = await getCachedOrFetch(
    `chart:${currency}:${coinId}:${roundedFrom}:${roundedTo}`,
    chartCacheTtlMs,
    marketChartResponseSchema,
    () =>
      apiGet(
        buildUrl(`/coins/${coinId}/market_chart/range`, {
          from: String(roundedFrom),
          to: String(roundedTo),
          vs_currency: currency,
        }),
        marketChartResponseSchema,
      ),
  );

  return response.prices.map(([timestamp, price]) => ({ timestamp, price }));
}
