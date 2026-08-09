import { z } from 'zod';
import { apiGet } from '@/shared/lib/http/client';
import type { CoinSearchResult, PortfolioFiatCurrency } from '../types/settings';
import { coinSearchResultSchema } from '../validation/settings.schema';
import { getCachedOrFetch } from './coingeckoCache';

const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';
const topCoinsCacheTtlMs = 7 * 24 * 60 * 60 * 1_000;
/** Also used to round chart request windows so repeat snapshot builds within the same window hit
 *  the IndexedDB cache instead of the network — see {@link onlinePortfolioData}. */
export const chartCacheTtlMs = 30 * 60 * 1_000;
const topCoinsCount = 250;
const maxAutocompleteResults = 8;

const fallbackSearchCoins: readonly CoinSearchResult[] = [
  { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC' },
  { id: 'ethereum', name: 'Ethereum', symbol: 'ETH' },
  { id: 'solana', name: 'Solana', symbol: 'SOL' },
  { id: 'ripple', name: 'XRP', symbol: 'XRP' },
  { id: 'cardano', name: 'Cardano', symbol: 'ADA' },
  { id: 'polkadot', name: 'Polkadot', symbol: 'DOT' },
  { id: 'chainlink', name: 'Chainlink', symbol: 'LINK' },
  { id: 'usd-coin', name: 'USDC', symbol: 'USDC' },
] as const;

const topCoinsSchema = z.array(coinSearchResultSchema);

const marketChartResponseSchema = z.object({
  prices: z.array(z.tuple([z.number(), z.number()])),
});

// A historical snapshot never changes, so it's cached far longer than live chart data.
const historicalPriceCacheTtlMs = 400 * 24 * 60 * 60 * 1_000;

const historicalPriceResponseSchema = z.object({
  market_data: z
    .object({
      current_price: z.record(z.string(), z.number()),
    })
    .optional(),
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

/**
 * The top {@link topCoinsCount} coins by market cap (id, symbol, name only), downloaded once and
 * cached for a week. Autocomplete only ever searches this set — long-tail coins outside the top
 * 250 aren't worth surfacing and would need per-keystroke `/search` calls, which is what was
 * tripping CoinGecko's rate limit. The response already comes back ordered by market cap, so
 * that order doubles as the relevance ranking.
 */
export async function getCoinGeckoTopCoins(): Promise<readonly CoinSearchResult[]> {
  try {
    const coins = await getCachedOrFetch('coins-top-250', topCoinsCacheTtlMs, topCoinsSchema, () =>
      apiGet(
        buildUrl('/coins/markets', {
          order: 'market_cap_desc',
          per_page: String(topCoinsCount),
          page: '1',
          vs_currency: 'usd',
        }),
        topCoinsSchema,
      ),
    );
    return coins.map((coin) => ({ ...coin, symbol: coin.symbol.toUpperCase() }));
  } catch {
    return fallbackSearchCoins;
  }
}

/**
 * Client-side autocomplete filter over the top-250 list — no network call. The list is already
 * market-cap ordered, so a plain substring filter is enough to keep the biggest match first.
 */
export function filterCoinGeckoCoins(
  query: string,
  coins: readonly CoinSearchResult[],
): readonly CoinSearchResult[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (normalizedQuery.length < 2) {
    return [];
  }

  return coins
    .filter(
      (coin) =>
        coin.symbol.toLowerCase().includes(normalizedQuery) ||
        coin.name.toLowerCase().includes(normalizedQuery),
    )
    .slice(0, maxAutocompleteResults);
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

function toCoinGeckoHistoryDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-');
  return `${day}-${month}-${year}`;
}

/**
 * The price of a coin on one specific past date — used once, when a holding is added, to record
 * what the user actually paid. Also subject to the Demo API's 365-day history limit (there's no
 * endpoint that escapes it), which is why the settings form only lets you pick a purchase date
 * within that range in the first place.
 */
export async function getCoinGeckoHistoricalPrice(
  coinId: string,
  currency: PortfolioFiatCurrency,
  date: string,
): Promise<number | null> {
  try {
    const response = await getCachedOrFetch(
      `history:${coinId}:${date}`,
      historicalPriceCacheTtlMs,
      historicalPriceResponseSchema,
      () =>
        apiGet(
          buildUrl(`/coins/${coinId}/history`, {
            date: toCoinGeckoHistoryDate(date),
            localization: 'false',
          }),
          historicalPriceResponseSchema,
        ),
    );
    return response.market_data?.current_price[currency] ?? null;
  } catch {
    return null;
  }
}
