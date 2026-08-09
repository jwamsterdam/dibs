import {
  filterCoinGeckoCoins,
  getCoinGeckoHistoricalPrice,
  getCoinGeckoMarketChart,
  getCoinGeckoTopCoins,
} from './coingeckoClient';

describe('coingeckoClient', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('downloads the top-250 coins by market cap and normalizes the fields it needs', async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify([
          {
            id: 'bitcoin',
            symbol: 'btc',
            name: 'Bitcoin',
            current_price: 62_000,
            market_cap: 1_200_000_000_000,
            market_cap_rank: 1,
          },
        ]),
      ),
    );

    await expect(getCoinGeckoTopCoins()).resolves.toEqual([
      { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC' },
    ]);
  });

  it('falls back to common coins when the top-coins request fails', async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 429 }));

    await expect(getCoinGeckoTopCoins()).resolves.toContainEqual({
      id: 'ethereum',
      name: 'Ethereum',
      symbol: 'ETH',
    });
  });

  it('maps market chart tuples to typed chart points', async () => {
    jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(JSON.stringify({ prices: [[1_722_000_000_000, 62_000]] })));

    await expect(
      getCoinGeckoMarketChart('bitcoin', 'eur', 1_722_000_000, 1_722_003_600),
    ).resolves.toEqual([{ price: 62_000, timestamp: 1_722_000_000_000 }]);
  });

  it('fetches the price on a specific historical date, converted to dd-mm-yyyy', async () => {
    const fetchSpy = jest.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          market_data: { current_price: { eur: 41_250, usd: 44_800 } },
        }),
      ),
    );

    await expect(getCoinGeckoHistoricalPrice('bitcoin', 'eur', '2025-08-01')).resolves.toBe(41_250);
    expect(fetchSpy.mock.calls[0]?.[0]).toContain('date=01-08-2025');
  });

  it('returns null when the historical price request fails', async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 401 }));

    await expect(getCoinGeckoHistoricalPrice('bitcoin', 'eur', '2020-01-01')).resolves.toBeNull();
  });

  it('returns null when the coin has no market data for that date', async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({})));

    await expect(getCoinGeckoHistoricalPrice('bitcoin', 'eur', '2025-08-01')).resolves.toBeNull();
  });

  describe('filterCoinGeckoCoins', () => {
    // Deliberately market-cap ordered (biggest first), matching what /coins/markets returns.
    const coins = [
      { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC' },
      { id: 'ethereum', name: 'Ethereum', symbol: 'ETH' },
      { id: 'bitcoin-cash', name: 'Bitcoin Cash', symbol: 'BCH' },
      { id: 'whitebit', name: 'WhiteBIT Coin', symbol: 'WBT' },
    ];

    it('returns no results before two characters are entered', () => {
      expect(filterCoinGeckoCoins('b', coins)).toEqual([]);
    });

    it('returns no results when nothing matches', () => {
      expect(filterCoinGeckoCoins('zzznonexistent', coins)).toEqual([]);
    });

    it('matches by name as well as symbol', () => {
      const results = filterCoinGeckoCoins('bit', coins);

      expect(results.map((coin) => coin.id)).toEqual(
        expect.arrayContaining(['bitcoin', 'bitcoin-cash', 'whitebit']),
      );
    });

    it('preserves the market-cap order of the input instead of re-sorting', () => {
      const results = filterCoinGeckoCoins('bit', coins);

      expect(results.map((coin) => coin.id)).toEqual(['bitcoin', 'bitcoin-cash', 'whitebit']);
    });
  });
});
