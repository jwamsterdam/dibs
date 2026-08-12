import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/shared/test/renderWithProviders';
import { loadNamespace } from '@/shared/i18n';
import { PortfolioPage } from './PortfolioPage';
import { indexedDbPortfolioConfigRepository } from '../data/portfolioConfigRepository';
import { configuredPortfolioDataSource } from '../data/portfolioDataSource';
import type { PortfolioSnapshot } from '../types/portfolio';
import type { PortfolioSettingsConfig } from '../types/settings';

jest.mock('../data/portfolioConfigRepository');
jest.mock('../data/portfolioDataSource');

const twoAccountConfig: PortfolioSettingsConfig = {
  fiatCurrency: 'eur',
  people: [
    { id: 'jw', name: 'JW', holdings: [] },
    { id: 'jan', name: 'Jan', holdings: [] },
  ],
};

const emptyPrices = { '1D': [], '1W': [], '1M': [], YTD: [], '1Y': [], ALL: [] };

function snapshotFor(personId: string, name: string, totalValue: number): PortfolioSnapshot {
  return {
    people: [{ id: personId, name, selectedAssetId: 'total', assets: [] }],
    marketSeries: [
      {
        assetId: 'total',
        prices: {
          ...emptyPrices,
          '1D': [{ timestamp: '2026-01-01T00:00:00.000Z', value: totalValue }],
        },
      },
    ],
    fiatCurrency: 'EUR',
    futurePriceProvider: 'coingecko',
    futureStakingProvider: 'beacon-api',
    mode: 'online',
  };
}

describe('PortfolioPage — multiple accounts', () => {
  beforeAll(async () => {
    await loadNamespace('portfolio');
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('shows one dot per account, highlights the active one, and switches on tap', async () => {
    const user = userEvent.setup();
    jest
      .mocked(indexedDbPortfolioConfigRepository.loadSettings)
      .mockResolvedValue(twoAccountConfig);
    jest
      .mocked(configuredPortfolioDataSource.getSnapshot)
      .mockImplementation(async (personId) =>
        personId === 'jan' ? snapshotFor('jan', 'Jan', 10_000) : snapshotFor('jw', 'JW', 5_000),
      );

    renderWithProviders(<PortfolioPage />);

    expect(await screen.findByRole('button', { name: 'Go to JW' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'JW' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Go to JW' })).toHaveAttribute(
      'aria-current',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Go to Jan' })).not.toHaveAttribute('aria-current');
    expect(screen.getByRole('button', { name: 'Select Totaal' })).toHaveTextContent('5.000');

    await user.click(screen.getByRole('button', { name: 'Go to Jan' }));

    expect(await screen.findByRole('heading', { name: 'Jan' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Go to Jan' })).toHaveAttribute(
      'aria-current',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Select Totaal' })).toHaveTextContent('10.000');
  });

  it('renders no dots for a single account', async () => {
    jest.mocked(indexedDbPortfolioConfigRepository.loadSettings).mockResolvedValue({
      fiatCurrency: 'eur',
      people: [{ id: 'jw', name: 'JW', holdings: [] }],
    });
    jest
      .mocked(configuredPortfolioDataSource.getSnapshot)
      .mockResolvedValue(snapshotFor('jw', 'JW', 5_000));

    renderWithProviders(<PortfolioPage />);

    expect(await screen.findByRole('heading', { name: 'JW' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Go to/ })).not.toBeInTheDocument();
  });

  it('opens the Accounts panel from the header icon', async () => {
    const user = userEvent.setup();
    jest
      .mocked(indexedDbPortfolioConfigRepository.loadSettings)
      .mockResolvedValue(twoAccountConfig);
    jest
      .mocked(configuredPortfolioDataSource.getSnapshot)
      .mockResolvedValue(snapshotFor('jw', 'JW', 5_000));

    renderWithProviders(<PortfolioPage />);
    expect(await screen.findByRole('heading', { name: 'JW' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Accounts' }));

    expect(await screen.findByRole('heading', { name: 'Accounts' })).toBeInTheDocument();
  });
});
