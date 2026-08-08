import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SettingsPanel } from './SettingsPanel';
import type { PortfolioSettingsController } from '../hooks/usePortfolioSettingsController';

let mockController: PortfolioSettingsController;

jest.mock('../hooks/usePortfolioSettingsController', () => ({
  usePortfolioSettingsController: (): PortfolioSettingsController => mockController,
}));

describe('SettingsPanel', () => {
  beforeEach(() => {
    mockController = {
      addHolding: jest.fn(),
      canAddHolding: true,
      form: {
        amount: '0.42',
        purchasedAt: '2026-01-10',
        query: 'Bitcoin (BTC)',
        selectedCoin: {
          id: 'bitcoin',
          marketCapRank: 1,
          name: 'Bitcoin',
          symbol: 'BTC',
          thumb: 'https://example.test/btc.png',
        },
      },
      isSaving: false,
      isSearching: false,
      removeHolding: jest.fn(),
      searchResults: [
        {
          id: 'ethereum',
          marketCapRank: 2,
          name: 'Ethereum',
          symbol: 'ETH',
          thumb: 'https://example.test/eth.png',
        },
      ],
      selectCoin: jest.fn(),
      setAmount: jest.fn(),
      setCurrency: jest.fn(),
      setPurchasedAt: jest.fn(),
      setQuery: jest.fn(),
      settings: {
        fiatCurrency: 'eur',
        holdings: [
          {
            amount: 0.42,
            coinGeckoId: 'bitcoin',
            id: 'holding-1',
            name: 'Bitcoin',
            purchasedAt: '2026-01-10',
            symbol: 'BTC',
          },
        ],
        personName: 'JW',
      },
    };
  });

  it('renders configured holdings and currency controls', () => {
    render(<SettingsPanel onClose={jest.fn()} />);

    expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Valuta EUR' })).toBeInTheDocument();
    expect(screen.getByText('BTC')).toBeInTheDocument();
    expect(screen.getByText('0.42 · 2026-01-10')).toBeInTheDocument();
  });

  it('wires search selection, add, remove, currency, and close actions', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    render(<SettingsPanel onClose={onClose} />);

    await user.click(screen.getByRole('button', { name: 'Valuta EUR' }));
    await user.click(screen.getByRole('option', { name: 'USD' }));
    await user.click(screen.getByRole('button', { name: /Ethereum/ }));
    await user.click(screen.getByRole('button', { name: 'Voeg coin toe' }));
    await user.click(screen.getByRole('button', { name: 'Verwijder BTC' }));
    await user.click(screen.getByRole('button', { name: 'Sluit instellingen' }));

    expect(mockController.setCurrency).toHaveBeenCalledWith('usd');
    expect(mockController.selectCoin).toHaveBeenCalledWith(mockController.searchResults[0]);
    expect(mockController.addHolding).toHaveBeenCalledTimes(1);
    expect(mockController.removeHolding).toHaveBeenCalledWith('holding-1');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders saving state and hides autocomplete when there are no results', () => {
    mockController = {
      ...mockController,
      isSaving: true,
      searchResults: [],
    };

    render(<SettingsPanel onClose={jest.fn()} />);

    expect(screen.getByText('Saving')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Ethereum/ })).not.toBeInTheDocument();
  });
});
