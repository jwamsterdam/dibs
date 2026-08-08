import { fireEvent, render, screen } from '@testing-library/react';
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
    expect(screen.getByRole('button', { name: 'EUR Valuta' })).toBeInTheDocument();
    expect(screen.getByText('BTC')).toBeInTheDocument();
    expect(screen.getByText('0.42 / 2026-01-10')).toBeInTheDocument();
  });

  it('wires add, remove, currency, and close actions', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    render(<SettingsPanel onClose={onClose} />);

    await user.click(screen.getByRole('button', { name: 'EUR Valuta' }));
    await user.click(screen.getByRole('option', { name: 'USD' }));
    await user.click(screen.getByRole('button', { name: 'Voeg coin toe' }));
    await user.click(screen.getByRole('button', { name: 'Verwijder BTC' }));
    await user.click(screen.getByRole('button', { name: 'Sluit instellingen' }));

    expect(mockController.setCurrency).toHaveBeenCalledWith('usd');
    expect(mockController.addHolding).toHaveBeenCalledTimes(1);
    expect(mockController.removeHolding).toHaveBeenCalledWith('holding-1');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('wires coin autocomplete selection', async () => {
    const user = userEvent.setup();
    render(<SettingsPanel onClose={jest.fn()} />);

    await user.click(screen.getByRole('button', { name: /Show suggestions/ }));
    await user.click(screen.getByRole('option', { name: /Ethereum \(ETH\)/ }));

    expect(mockController.selectCoin).toHaveBeenCalledWith(mockController.searchResults[0]);
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

  it('updates text fields and exposes the loading search state', async () => {
    const user = userEvent.setup();
    mockController = {
      ...mockController,
      form: {
        ...mockController.form,
        selectedCoin: null,
      },
      isSearching: true,
    };

    render(<SettingsPanel onClose={jest.fn()} />);

    await user.clear(screen.getByRole('combobox', { name: 'Coin' }));
    await user.type(screen.getByRole('combobox', { name: 'Coin' }), 'sol');
    fireEvent.change(screen.getByRole('textbox', { name: 'Aantal' }), {
      target: { value: '12' },
    });

    expect(screen.getByText('Zoeken...')).toBeInTheDocument();
    expect(mockController.setQuery).toHaveBeenCalled();
    expect(mockController.setAmount).toHaveBeenCalledWith('12');
  });
});
