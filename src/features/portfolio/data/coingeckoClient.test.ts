import {
  getCoinGeckoMarketChart,
  getCoinGeckoPrices,
  searchCoinGeckoCoins,
} from './coingeckoClient';

describe('coingeckoClient', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('maps CoinGecko search results to autocomplete options', async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          coins: [
            {
              id: 'bitcoin',
              name: 'Bitcoin',
              symbol: 'btc',
              market_cap_rank: 1,
              thumb: 'https://example.test/btc.png',
            },
          ],
        }),
      ),
    );

    await expect(searchCoinGeckoCoins('bit')).resolves.toEqual([
      {
        id: 'bitcoin',
        marketCapRank: 1,
        name: 'Bitcoin',
        symbol: 'BTC',
        thumb: 'https://example.test/btc.png',
      },
    ]);
  });

  it('returns no search results before two characters are entered', async () => {
    await expect(searchCoinGeckoCoins('b')).resolves.toEqual([]);
  });

  it('maps simple prices for the selected fiat currency', async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ bitcoin: { eur: 62_000 }, ethereum: { eur: 2_700 } })),
    );

    const prices = await getCoinGeckoPrices(['ethereum', 'bitcoin'], 'eur');

    expect(prices.get('bitcoin')).toBe(62_000);
    expect(prices.get('ethereum')).toBe(2_700);
  });

  it('returns an empty price map when no ids are requested', async () => {
    await expect(getCoinGeckoPrices([], 'eur')).resolves.toEqual(new Map());
  });

  it('falls back to zero when CoinGecko omits a requested price', async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ bitcoin: {} })));

    const prices = await getCoinGeckoPrices(['bitcoin'], 'eur');

    expect(prices.get('bitcoin')).toBe(0);
  });

  it('falls back to common CoinGecko ids when CoinGecko rejects search', async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 429 }));

    await expect(searchCoinGeckoCoins('eth')).resolves.toContainEqual({
      id: 'ethereum',
      marketCapRank: 2,
      name: 'Ethereum',
      symbol: 'ETH',
      thumb: '',
    });
  });

  it('maps market chart tuples to typed chart points', async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ prices: [[1_722_000_000_000, 62_000]] })),
    );

    await expect(getCoinGeckoMarketChart('bitcoin', 'eur', 1_722_000_000, 1_722_003_600)).resolves.toEqual([
      { price: 62_000, timestamp: 1_722_000_000_000 },
    ]);
  });
});
