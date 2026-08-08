/* istanbul ignore file -- React Query form orchestration; SettingsPanel and data adapters cover the user-facing behavior. */

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { indexedDbPortfolioConfigRepository } from '../data/portfolioConfigRepository';
import { searchCoinGeckoCoins } from '../data/coingeckoClient';
import type {
  CoinSearchResult,
  PortfolioFiatCurrency,
  PortfolioHoldingConfig,
  PortfolioSettingsConfig,
} from '../types/settings';
import { portfolioSettingsConfigSchema } from '../validation/settings.schema';

const defaultSettings: PortfolioSettingsConfig = {
  personName: 'JW',
  fiatCurrency: 'eur',
  holdings: [],
};

type SettingsFormState = {
  readonly query: string;
  readonly selectedCoin: CoinSearchResult | null;
  readonly amount: string;
  readonly purchasedAt: string;
};

export type PortfolioSettingsController = {
  readonly settings: PortfolioSettingsConfig;
  readonly form: SettingsFormState;
  readonly searchResults: readonly CoinSearchResult[];
  readonly isSearching: boolean;
  readonly isSaving: boolean;
  readonly canAddHolding: boolean;
  readonly setCurrency: (currency: PortfolioFiatCurrency) => void;
  readonly setQuery: (query: string) => void;
  readonly selectCoin: (coin: CoinSearchResult) => void;
  readonly setAmount: (amount: string) => void;
  readonly setPurchasedAt: (purchasedAt: string) => void;
  readonly addHolding: () => void;
  readonly removeHolding: (holdingId: string) => void;
};

function createHoldingId(coinId: string): string {
  const randomId = globalThis.crypto.randomUUID();
  return `${coinId}-${randomId}`;
}

function toPositiveNumber(value: string): number | null {
  const normalizedValue = value.replace(',', '.').trim();
  const amount = Number(normalizedValue);
  return Number.isFinite(amount) && amount > 0 ? amount : null;
}

function todayInputValue(): string {
  return new Date().toISOString().slice(0, 10);
}

export function usePortfolioSettingsController(): PortfolioSettingsController {
  const queryClient = useQueryClient();
  const [draftSettings, setDraftSettings] = useState<PortfolioSettingsConfig | null>(null);
  const [form, setForm] = useState<SettingsFormState>({
    amount: '',
    purchasedAt: todayInputValue(),
    query: '',
    selectedCoin: null,
  });

  const settingsQuery = useQuery({
    queryFn: () => indexedDbPortfolioConfigRepository.loadSettings(),
    queryKey: ['portfolio-settings'],
    staleTime: 5_000,
  });
  const settings = draftSettings ?? settingsQuery.data ?? defaultSettings;
  const normalizedQuery = form.query.trim();
  const searchQuery = useQuery({
    enabled: normalizedQuery.length >= 2,
    queryFn: () => searchCoinGeckoCoins(normalizedQuery),
    queryKey: ['coingecko-search', normalizedQuery.toLowerCase()],
    staleTime: 24 * 60 * 60 * 1_000,
  });
  const saveMutation = useMutation({
    mutationFn: (nextSettings: PortfolioSettingsConfig) =>
      indexedDbPortfolioConfigRepository.saveSettings(nextSettings),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['portfolio-settings'] });
      await queryClient.invalidateQueries({ queryKey: ['portfolio-online-snapshot'] });
    },
  });

  const canAddHolding = useMemo(
    () => form.selectedCoin !== null && toPositiveNumber(form.amount) !== null && form.purchasedAt.length > 0,
    [form.amount, form.purchasedAt, form.selectedCoin],
  );

  function persist(nextSettings: PortfolioSettingsConfig): void {
    const parsedSettings = portfolioSettingsConfigSchema.parse(nextSettings);
    setDraftSettings(parsedSettings);
    saveMutation.mutate(parsedSettings);
  }

  function updateForm(update: Partial<SettingsFormState>): void {
    setForm((current) => ({ ...current, ...update }));
  }

  return {
    settings,
    form,
    searchResults: searchQuery.data ?? [],
    isSearching: searchQuery.isFetching,
    isSaving: saveMutation.isPending,
    canAddHolding,
    setCurrency: (currency): void => {
      persist({ ...settings, fiatCurrency: currency });
    },
    setQuery: (query): void => {
      updateForm({ query, selectedCoin: null });
    },
    selectCoin: (coin): void => {
      updateForm({ query: `${coin.name} (${coin.symbol})`, selectedCoin: coin });
    },
    setAmount: (amount): void => {
      updateForm({ amount });
    },
    setPurchasedAt: (purchasedAt): void => {
      updateForm({ purchasedAt });
    },
    addHolding: (): void => {
      const amount = toPositiveNumber(form.amount);
      if (form.selectedCoin === null || amount === null) {
        return;
      }

      const holding: PortfolioHoldingConfig = {
        id: createHoldingId(form.selectedCoin.id),
        coinGeckoId: form.selectedCoin.id,
        name: form.selectedCoin.name,
        symbol: form.selectedCoin.symbol,
        amount,
        purchasedAt: form.purchasedAt,
      };
      persist({ ...settings, holdings: [...settings.holdings, holding] });
      setForm({ amount: '', purchasedAt: todayInputValue(), query: '', selectedCoin: null });
    },
    removeHolding: (holdingId): void => {
      persist({
        ...settings,
        holdings: settings.holdings.filter((holding) => holding.id !== holdingId),
      });
    },
  };
}
