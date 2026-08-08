export type PortfolioPeriod = '1D' | '1W' | '1M' | 'YTD' | '1Y' | 'ALL';

export type ChangeDisplayMode = 'absolute' | 'percentage';

export type PortfolioAssetKind = 'crypto' | 'stablecoin' | 'staking' | 'total';

export type PortfolioFiatCurrencyCode = 'EUR' | 'USD' | 'GBP' | 'CHF';

export type PortfolioAsset = {
  readonly id: string;
  readonly label: string;
  readonly symbol: string;
  readonly amount: number;
  readonly kind: PortfolioAssetKind;
  readonly staking?:
    | {
    readonly type: 'ethereum-0x02';
    readonly availableRewardsEth: number;
      }
    | undefined;
};

export type PortfolioPerson = {
  readonly id: string;
  readonly name: string;
  readonly selectedAssetId: string;
  readonly assets: readonly PortfolioAsset[];
};

export type PricePoint = {
  readonly timestamp: string;
  readonly value: number;
};

export type AssetMarketSeries = {
  readonly assetId: string;
  readonly prices: Record<PortfolioPeriod, readonly PricePoint[]>;
};

export type PortfolioSnapshot = {
  readonly people: readonly PortfolioPerson[];
  readonly marketSeries: readonly AssetMarketSeries[];
  readonly fiatCurrency: PortfolioFiatCurrencyCode;
  readonly futurePriceProvider: 'coingecko';
  readonly futureStakingProvider: 'beacon-api';
  readonly mode: 'online' | 'read-only-mock';
};
