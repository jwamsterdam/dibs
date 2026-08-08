import {
  configuredPortfolioDataSource,
  readOnlyMockPortfolioDataSource,
} from './portfolioDataSource';
import { buildOnlinePortfolioSnapshot } from './onlinePortfolioData';
import { indexedDbPortfolioConfigRepository } from './portfolioConfigRepository';
import type { PortfolioSettingsConfig } from '../types/settings';
import type { PortfolioSnapshot } from '../types/portfolio';

jest.mock('./onlinePortfolioData');
jest.mock('./portfolioConfigRepository');

const settings: PortfolioSettingsConfig = {
  personName: 'JW',
  fiatCurrency: 'eur',
  holdings: [],
};

const onlineSnapshot: PortfolioSnapshot = {
  people: [{ id: 'settings-person', name: 'JW', selectedAssetId: 'total', assets: [] }],
  marketSeries: [],
  fiatCurrency: 'EUR',
  futurePriceProvider: 'coingecko',
  futureStakingProvider: 'beacon-api',
  mode: 'online',
};

describe('readOnlyMockPortfolioDataSource', () => {
  it('exposes the agreed read-only future provider direction', async () => {
    const snapshot = await readOnlyMockPortfolioDataSource.getSnapshot('1D');

    expect(snapshot.mode).toBe('read-only-mock');
    expect(snapshot.futurePriceProvider).toBe('coingecko');
    expect(snapshot.futureStakingProvider).toBe('beacon-api');
    expect(snapshot.people[0]?.name).toBe('JW');
  });
});

describe('configuredPortfolioDataSource', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('falls back to the read-only mock snapshot when no settings are configured', async () => {
    jest.mocked(indexedDbPortfolioConfigRepository.loadSettings).mockResolvedValue(null);

    const snapshot = await configuredPortfolioDataSource.getSnapshot('1D');

    expect(snapshot.mode).toBe('read-only-mock');
    expect(buildOnlinePortfolioSnapshot).not.toHaveBeenCalled();
  });

  it('builds an online snapshot from persisted settings for the requested period', async () => {
    jest.mocked(indexedDbPortfolioConfigRepository.loadSettings).mockResolvedValue(settings);
    jest.mocked(buildOnlinePortfolioSnapshot).mockResolvedValue(onlineSnapshot);

    const snapshot = await configuredPortfolioDataSource.getSnapshot('1W');

    expect(buildOnlinePortfolioSnapshot).toHaveBeenCalledWith(settings, '1W');
    expect(snapshot).toBe(onlineSnapshot);
  });
});
