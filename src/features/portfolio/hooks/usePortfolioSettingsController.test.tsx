import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import type { ReactElement, ReactNode } from 'react';
import { createTestQueryClient } from '@/shared/test/renderWithProviders';
import { usePortfolioSettingsController } from './usePortfolioSettingsController';
import { indexedDbPortfolioConfigRepository } from '../data/portfolioConfigRepository';
import { getCoinGeckoHistoricalPrice, getCoinGeckoTopCoins } from '../data/coingeckoClient';
import type { PortfolioSettingsConfig } from '../types/settings';

jest.mock('../data/portfolioConfigRepository');
jest.mock('../data/coingeckoClient', () => ({
  ...jest.requireActual('../data/coingeckoClient'),
  getCoinGeckoHistoricalPrice: jest.fn(),
  getCoinGeckoTopCoins: jest.fn(),
}));

const initialSettings: PortfolioSettingsConfig = {
  personName: 'JW',
  fiatCurrency: 'eur',
  holdings: [],
};

const bitcoinResult = {
  id: 'bitcoin',
  name: 'Bitcoin',
  symbol: 'BTC',
};

function wrapper({ children }: { children: ReactNode }): ReactElement {
  return <QueryClientProvider client={createTestQueryClient()}>{children}</QueryClientProvider>;
}

function renderController() {
  return renderHook(() => usePortfolioSettingsController(), { wrapper });
}

describe('usePortfolioSettingsController', () => {
  beforeEach(() => {
    jest.mocked(indexedDbPortfolioConfigRepository.loadSettings).mockResolvedValue(initialSettings);
    jest.mocked(indexedDbPortfolioConfigRepository.saveSettings).mockResolvedValue(undefined);
    jest.mocked(getCoinGeckoTopCoins).mockResolvedValue([bitcoinResult]);
    jest.mocked(getCoinGeckoHistoricalPrice).mockResolvedValue(50_000);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('loads persisted settings and starts with an invalid, empty holding form', async () => {
    const { result } = renderController();

    await waitFor(() => expect(result.current.settings).toEqual(initialSettings));
    expect(result.current.canAddHolding).toBe(false);
    expect(result.current.selectedCoin).toBeNull();
  });

  it('filters the downloaded top-coins list locally once the query reaches two characters', async () => {
    const { result } = renderController();
    await waitFor(() => expect(result.current.settings).toEqual(initialSettings));

    act(() => result.current.setQuery('bi'));

    await waitFor(() => expect(result.current.searchResults).toEqual([bitcoinResult]));
    expect(getCoinGeckoTopCoins).toHaveBeenCalledTimes(1);
  });

  it('does nothing when selecting a key that is not among the search results', async () => {
    const { result } = renderController();
    await waitFor(() => expect(result.current.settings).toEqual(initialSettings));

    act(() => result.current.selectCoinByKey('unknown-coin'));

    expect(result.current.selectedCoin).toBeNull();
  });

  it('marks the holding form valid once a coin and a positive amount are set', async () => {
    const { result } = renderController();
    await waitFor(() => expect(result.current.settings).toEqual(initialSettings));

    act(() => result.current.setQuery('bi'));
    await waitFor(() => expect(result.current.searchResults).toEqual([bitcoinResult]));

    act(() => result.current.selectCoinByKey('bitcoin'));
    expect(result.current.selectedCoin).toEqual(bitcoinResult);
    expect(result.current.canAddHolding).toBe(false);

    act(() => result.current.setAmount('0,5'));
    await waitFor(() => expect(result.current.canAddHolding).toBe(true));
  });

  it('previews the purchase value once a coin, date, and amount are set', async () => {
    const { result } = renderController();
    await waitFor(() => expect(result.current.settings).toEqual(initialSettings));

    act(() => result.current.setQuery('bi'));
    await waitFor(() => expect(result.current.searchResults).toEqual([bitcoinResult]));
    act(() => result.current.selectCoinByKey('bitcoin'));
    act(() => result.current.setAmount('0.5'));

    await waitFor(() => expect(result.current.purchaseValue).toBe(25_000));
    expect(getCoinGeckoHistoricalPrice).toHaveBeenCalledWith(
      'bitcoin',
      'eur',
      result.current.purchasedAt,
    );
  });

  it('persists the fetched purchase price with the new holding', async () => {
    const { result } = renderController();
    await waitFor(() => expect(result.current.settings).toEqual(initialSettings));

    act(() => result.current.setQuery('bi'));
    await waitFor(() => expect(result.current.searchResults).toEqual([bitcoinResult]));
    act(() => result.current.selectCoinByKey('bitcoin'));
    act(() => result.current.setAmount('0.5'));
    await waitFor(() => expect(result.current.purchaseValue).toBe(25_000));

    await act(() => result.current.addHolding());

    expect(indexedDbPortfolioConfigRepository.saveSettings).toHaveBeenCalledWith(
      expect.objectContaining({
        holdings: [expect.objectContaining({ purchasePrice: 50_000 })],
      }),
    );
  });

  it('rejects a zero or non-numeric amount', async () => {
    const { result } = renderController();
    await waitFor(() => expect(result.current.settings).toEqual(initialSettings));

    act(() => result.current.setQuery('bi'));
    await waitFor(() => expect(result.current.searchResults).toEqual([bitcoinResult]));
    act(() => result.current.selectCoinByKey('bitcoin'));

    act(() => result.current.setAmount('not-a-number'));
    await waitFor(() => expect(result.current.canAddHolding).toBe(false));

    act(() => result.current.setAmount('0'));
    await waitFor(() => expect(result.current.canAddHolding).toBe(false));
  });

  it('persists a new holding and resets the form on submit', async () => {
    const { result } = renderController();
    await waitFor(() => expect(result.current.settings).toEqual(initialSettings));

    act(() => result.current.setQuery('bi'));
    await waitFor(() => expect(result.current.searchResults).toEqual([bitcoinResult]));
    act(() => result.current.selectCoinByKey('bitcoin'));
    act(() => result.current.setAmount('0.5'));
    await waitFor(() => expect(result.current.canAddHolding).toBe(true));

    await act(() => result.current.addHolding());

    expect(indexedDbPortfolioConfigRepository.saveSettings).toHaveBeenCalledWith(
      expect.objectContaining({
        holdings: [expect.objectContaining({ amount: 0.5, coinGeckoId: 'bitcoin', symbol: 'BTC' })],
      }),
    );
    await waitFor(() => expect(result.current.query).toBe(''));
    expect(result.current.selectedCoin).toBeNull();
  });

  it('removes a holding by id', async () => {
    jest.mocked(indexedDbPortfolioConfigRepository.loadSettings).mockResolvedValue({
      ...initialSettings,
      holdings: [
        {
          amount: 1,
          coinGeckoId: 'bitcoin',
          id: 'holding-1',
          name: 'Bitcoin',
          purchasedAt: '2026-01-01',
          symbol: 'BTC',
        },
      ],
    });
    const { result } = renderController();
    await waitFor(() => expect(result.current.settings.holdings).toHaveLength(1));

    act(() => result.current.removeHolding('holding-1'));

    await waitFor(() =>
      expect(indexedDbPortfolioConfigRepository.saveSettings).toHaveBeenCalledWith(
        expect.objectContaining({ holdings: [] }),
      ),
    );
  });

  it('persists the selected fiat currency', async () => {
    const { result } = renderController();
    await waitFor(() => expect(result.current.settings).toEqual(initialSettings));

    act(() => result.current.selectCurrencyByKey('usd'));

    await waitFor(() =>
      expect(indexedDbPortfolioConfigRepository.saveSettings).toHaveBeenCalledWith(
        expect.objectContaining({ fiatCurrency: 'usd' }),
      ),
    );
  });

  it('surfaces a save error instead of swallowing it', async () => {
    jest
      .mocked(indexedDbPortfolioConfigRepository.saveSettings)
      .mockRejectedValue(new Error('offline'));
    const { result } = renderController();
    await waitFor(() => expect(result.current.settings).toEqual(initialSettings));

    act(() => result.current.selectCurrencyByKey('usd'));

    await waitFor(() => expect(result.current.saveError).toBe(true));
  });
});
