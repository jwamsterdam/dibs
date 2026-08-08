import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/shared/test/renderWithProviders';
import { loadNamespace } from '@/shared/i18n';
import { SettingsPanel } from './SettingsPanel';
import type { PortfolioSettingsController } from '../hooks/usePortfolioSettingsController';

let mockController: PortfolioSettingsController;

jest.mock('../hooks/usePortfolioSettingsController', () => ({
  usePortfolioSettingsController: (): PortfolioSettingsController => mockController,
}));

describe('SettingsPanel', () => {
  beforeAll(async () => {
    await loadNamespace('portfolio');
  });

  beforeEach(() => {
    mockController = {
      addHolding: jest.fn(),
      amount: '0.42',
      canAddHolding: true,
      currencies: ['eur', 'usd', 'gbp', 'chf'],
      isSaving: false,
      isSearching: false,
      purchasedAt: '2026-01-10',
      query: 'Bitcoin (BTC)',
      removeHolding: jest.fn(),
      saveError: false,
      searchResults: [
        {
          id: 'ethereum',
          name: 'Ethereum',
          symbol: 'ETH',
        },
      ],
      selectCoinByKey: jest.fn(),
      selectCurrencyByKey: jest.fn(),
      selectedCoin: {
        id: 'bitcoin',
        name: 'Bitcoin',
        symbol: 'BTC',
      },
      setAmount: jest.fn(),
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
    renderWithProviders(<SettingsPanel onClose={jest.fn()} />);

    expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'EUR Currency' })).toBeInTheDocument();
    expect(screen.getByText('BTC')).toBeInTheDocument();
    expect(screen.getByText('0.42 / 2026-01-10')).toBeInTheDocument();
  });

  it('wires add, remove, currency, and close actions', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    renderWithProviders(<SettingsPanel onClose={onClose} />);

    await user.click(screen.getByRole('button', { name: 'EUR Currency' }));
    await user.click(screen.getByRole('option', { name: 'USD' }));
    await user.click(screen.getByRole('button', { name: 'Add coin' }));
    await user.click(screen.getByRole('button', { name: 'Remove BTC' }));
    await user.click(screen.getByRole('button', { name: 'Close settings' }));

    expect(mockController.selectCurrencyByKey).toHaveBeenCalledWith('usd');
    expect(mockController.addHolding).toHaveBeenCalledTimes(1);
    expect(mockController.removeHolding).toHaveBeenCalledWith('holding-1');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('wires coin autocomplete selection', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SettingsPanel onClose={jest.fn()} />);

    await user.click(screen.getByRole('combobox', { name: 'Coin' }));
    await user.keyboard('{ArrowDown}');
    await user.click(screen.getByRole('option', { name: /Ethereum \(ETH\)/ }));

    expect(mockController.selectCoinByKey).toHaveBeenCalledWith('ethereum');
  });

  it('renders saving state and hides autocomplete when there are no results', () => {
    mockController = {
      ...mockController,
      isSaving: true,
      searchResults: [],
    };

    renderWithProviders(<SettingsPanel onClose={jest.fn()} />);

    expect(screen.getByText('Saving')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Ethereum/ })).not.toBeInTheDocument();
  });

  it('renders the save error state', () => {
    mockController = { ...mockController, saveError: true };

    renderWithProviders(<SettingsPanel onClose={jest.fn()} />);

    expect(screen.getByText('Failed to save')).toBeInTheDocument();
  });

  it('updates text fields and exposes the loading search state', async () => {
    mockController = {
      ...mockController,
      isSearching: true,
    };

    renderWithProviders(<SettingsPanel onClose={jest.fn()} />);

    fireEvent.change(screen.getByRole('textbox', { name: 'Amount' }), {
      target: { value: '12' },
    });

    expect(screen.getByText('Searching...')).toBeInTheDocument();
    expect(mockController.setAmount).toHaveBeenCalledWith('12');
  });

  it('updates the search query', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SettingsPanel onClose={jest.fn()} />);

    await user.clear(screen.getByRole('combobox', { name: 'Coin' }));
    await user.type(screen.getByRole('combobox', { name: 'Coin' }), 'sol');

    expect(mockController.setQuery).toHaveBeenCalled();
  });
});
