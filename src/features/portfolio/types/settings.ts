export type PortfolioFiatCurrency = 'eur' | 'usd' | 'gbp' | 'chf';

export type PortfolioHoldingConfig = {
  readonly id: string;
  readonly coinGeckoId: string;
  readonly name: string;
  readonly symbol: string;
  readonly amount: number;
  readonly purchasedAt: string;
};

export type PortfolioSettingsConfig = {
  readonly personName: string;
  readonly fiatCurrency: PortfolioFiatCurrency;
  readonly holdings: readonly PortfolioHoldingConfig[];
};

export type CoinSearchResult = {
  readonly id: string;
  readonly name: string;
  readonly symbol: string;
  readonly marketCapRank: number | null;
  readonly thumb: string;
};
