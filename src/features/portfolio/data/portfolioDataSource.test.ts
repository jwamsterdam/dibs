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

const noAccountsSettings: PortfolioSettingsConfig = {
  fiatCurrency: 'eur',
  people: [],
};

const personA = { holdings: [], id: 'person-a', name: 'JW' };
const personB = {
  holdings: [
    {
      id: 'btc-1',
      coinGeckoId: 'bitcoin',
      name: 'Bitcoin',
      symbol: 'BTC',
      amount: 0.5,
      purchasedAt: '2026-01-10',
    },
  ],
  id: 'person-b',
  name: 'Jan',
};

const settingsWithPeople: PortfolioSettingsConfig = {
  fiatCurrency: 'eur',
  people: [personA, personB],
};

const onlineSnapshot: PortfolioSnapshot = {
  people: [{ id: 'person-b', name: 'Jan', selectedAssetId: 'total', assets: [] }],
  marketSeries: [],
  fiatCurrency: 'EUR',
  futurePriceProvider: 'coingecko',
  futureStakingProvider: 'beacon-api',
  mode: 'online',
};

describe('readOnlyMockPortfolioDataSource', () => {
  it('exposes the agreed read-only future provider direction', async () => {
    const snapshot = await readOnlyMockPortfolioDataSource.getSnapshot();

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

    const snapshot = await configuredPortfolioDataSource.getSnapshot('person-a');

    expect(snapshot.mode).toBe('read-only-mock');
    expect(buildOnlinePortfolioSnapshot).not.toHaveBeenCalled();
  });

  it('falls back to the read-only mock snapshot once every account has been removed', async () => {
    jest
      .mocked(indexedDbPortfolioConfigRepository.loadSettings)
      .mockResolvedValue(noAccountsSettings);

    const snapshot = await configuredPortfolioDataSource.getSnapshot(null);

    expect(snapshot.mode).toBe('read-only-mock');
    expect(buildOnlinePortfolioSnapshot).not.toHaveBeenCalled();
  });

  it('builds an online snapshot for the requested active person', async () => {
    jest
      .mocked(indexedDbPortfolioConfigRepository.loadSettings)
      .mockResolvedValue(settingsWithPeople);
    jest.mocked(buildOnlinePortfolioSnapshot).mockResolvedValue(onlineSnapshot);

    const snapshot = await configuredPortfolioDataSource.getSnapshot('person-b');

    expect(buildOnlinePortfolioSnapshot).toHaveBeenCalledWith(personB, 'eur');
    expect(snapshot).toBe(onlineSnapshot);
  });

  it('falls back to the first person when the active id is missing or stale', async () => {
    jest
      .mocked(indexedDbPortfolioConfigRepository.loadSettings)
      .mockResolvedValue(settingsWithPeople);
    jest.mocked(buildOnlinePortfolioSnapshot).mockResolvedValue(onlineSnapshot);

    await configuredPortfolioDataSource.getSnapshot('deleted-person');

    expect(buildOnlinePortfolioSnapshot).toHaveBeenCalledWith(personA, 'eur');
  });

  it('falls back to the first person when no active id is given', async () => {
    jest
      .mocked(indexedDbPortfolioConfigRepository.loadSettings)
      .mockResolvedValue(settingsWithPeople);
    jest.mocked(buildOnlinePortfolioSnapshot).mockResolvedValue(onlineSnapshot);

    await configuredPortfolioDataSource.getSnapshot();

    expect(buildOnlinePortfolioSnapshot).toHaveBeenCalledWith(personA, 'eur');
  });
});
