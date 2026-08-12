import { migrateLegacyPortfolioConfig } from './migratePortfolioConfig';

describe('migrateLegacyPortfolioConfig', () => {
  it('upgrades a legacy single-person config into the multi-account shape', () => {
    const legacy = {
      fiatCurrency: 'eur',
      holdings: [
        {
          amount: 1,
          coinGeckoId: 'bitcoin',
          id: 'bitcoin-1',
          name: 'Bitcoin',
          purchasedAt: '2026-01-01',
          symbol: 'BTC',
        },
      ],
      personName: 'Jan',
    };

    expect(migrateLegacyPortfolioConfig(legacy)).toEqual({
      fiatCurrency: 'eur',
      people: [{ holdings: legacy.holdings, id: 'migrated-person', name: 'Jan' }],
    });
  });

  it('falls back to a default name when the legacy config has none', () => {
    const legacy = { fiatCurrency: 'usd', holdings: [] };

    expect(migrateLegacyPortfolioConfig(legacy)).toEqual({
      fiatCurrency: 'usd',
      people: [{ holdings: [], id: 'migrated-person', name: 'JW' }],
    });
  });

  it('migrates even a legacy config with empty holdings, so it still surfaces in Accounts', () => {
    const legacy = { fiatCurrency: 'eur', holdings: [], personName: 'Jan' };

    const migrated = migrateLegacyPortfolioConfig(legacy) as { people: unknown[] };

    expect(migrated.people).toHaveLength(1);
  });

  it('passes an already-current config through unchanged', () => {
    const current = { fiatCurrency: 'eur', people: [{ holdings: [], id: 'a', name: 'Jan' }] };

    expect(migrateLegacyPortfolioConfig(current)).toBe(current);
  });

  it('passes null and non-object values through unchanged', () => {
    expect(migrateLegacyPortfolioConfig(null)).toBeNull();
    expect(migrateLegacyPortfolioConfig(undefined)).toBeUndefined();
    expect(migrateLegacyPortfolioConfig('not an object')).toBe('not an object');
  });
});
