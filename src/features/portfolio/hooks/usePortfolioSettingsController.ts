import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { indexedDbPortfolioConfigRepository } from '../data/portfolioConfigRepository';
import { searchCoinGeckoCoins } from '../data/coingeckoClient';
import {
  coinSearchResultSchema,
  portfolioSettingsConfigSchema,
} from '../validation/settings.schema';
import { PORTFOLIO_FIAT_CURRENCIES } from '../types/settings';
import type {
  CoinSearchResult,
  PortfolioFiatCurrency,
  PortfolioHoldingConfig,
  PortfolioSettingsConfig,
} from '../types/settings';

type SelectionKey = string | number;

const defaultSettings: PortfolioSettingsConfig = {
  personName: 'JW',
  fiatCurrency: 'eur',
  holdings: [],
};

function toPositiveAmount(value: string): number | null {
  const normalizedValue = value.replace(',', '.').trim();
  const amount = Number(normalizedValue);
  return Number.isFinite(amount) && amount > 0 ? amount : null;
}

function todayInputValue(): string {
  return new Date().toISOString().slice(0, 10);
}

function createHoldingId(coinId: string): string {
  return `${coinId}-${globalThis.crypto.randomUUID()}`;
}

const holdingFormSchema = z
  .object({
    selectedCoin: coinSearchResultSchema.nullable(),
    amount: z.string(),
    purchasedAt: z.string().date(),
  })
  .refine((value) => value.selectedCoin !== null, {
    message: 'Coin is required',
    path: ['selectedCoin'],
  })
  .refine((value) => toPositiveAmount(value.amount) !== null, {
    message: 'Amount must be positive',
    path: ['amount'],
  });

export type HoldingFormValues = z.infer<typeof holdingFormSchema>;

function defaultHoldingFormValues(): HoldingFormValues {
  return { selectedCoin: null, amount: '', purchasedAt: todayInputValue() };
}

export type PortfolioSettingsController = {
  readonly settings: PortfolioSettingsConfig;
  readonly currencies: readonly PortfolioFiatCurrency[];
  readonly query: string;
  readonly selectedCoin: CoinSearchResult | null;
  readonly amount: string;
  readonly purchasedAt: string;
  readonly searchResults: readonly CoinSearchResult[];
  readonly isSearching: boolean;
  readonly isSaving: boolean;
  readonly saveError: boolean;
  readonly canAddHolding: boolean;
  readonly setQuery: (query: string) => void;
  readonly setAmount: (amount: string) => void;
  readonly setPurchasedAt: (purchasedAt: string) => void;
  readonly selectCoinByKey: (key: SelectionKey | null) => void;
  readonly selectCurrencyByKey: (key: SelectionKey | null) => void;
  readonly addHolding: () => Promise<void>;
  readonly removeHolding: (holdingId: string) => void;
};

export function usePortfolioSettingsController(): PortfolioSettingsController {
  const queryClient = useQueryClient();
  const [draftSettings, setDraftSettings] = useState<PortfolioSettingsConfig | null>(null);
  const [query, setQuery] = useState('');

  const holdingForm = useForm<HoldingFormValues>({
    defaultValues: defaultHoldingFormValues(),
    mode: 'onChange',
    resolver: zodResolver(holdingFormSchema),
  });
  const selectedCoin = useWatch({ control: holdingForm.control, name: 'selectedCoin' });
  const amount = useWatch({ control: holdingForm.control, name: 'amount' });
  const purchasedAt = useWatch({ control: holdingForm.control, name: 'purchasedAt' });

  const settingsQuery = useQuery({
    queryFn: () => indexedDbPortfolioConfigRepository.loadSettings(),
    queryKey: ['portfolio-settings'],
    staleTime: 5_000,
  });
  const settings = draftSettings ?? settingsQuery.data ?? defaultSettings;
  const normalizedQuery = query.trim();
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
      await queryClient.invalidateQueries({ queryKey: ['portfolio-snapshot'] });
    },
  });

  function persist(nextSettings: PortfolioSettingsConfig): void {
    const parsedSettings = portfolioSettingsConfigSchema.parse(nextSettings);
    setDraftSettings(parsedSettings);
    saveMutation.mutate(parsedSettings);
  }

  function selectCoin(coin: CoinSearchResult): void {
    setQuery(`${coin.name} (${coin.symbol})`);
    holdingForm.setValue('selectedCoin', coin, { shouldValidate: true });
  }

  return {
    settings,
    currencies: PORTFOLIO_FIAT_CURRENCIES,
    query,
    selectedCoin: selectedCoin ?? null,
    amount,
    purchasedAt,
    searchResults: searchQuery.data ?? [],
    isSearching: searchQuery.isFetching,
    isSaving: saveMutation.isPending,
    saveError: saveMutation.isError,
    canAddHolding: holdingForm.formState.isValid,
    setQuery: (nextQuery): void => {
      setQuery(nextQuery);
      holdingForm.setValue('selectedCoin', null, { shouldValidate: true });
    },
    setAmount: (amount): void => {
      holdingForm.setValue('amount', amount, { shouldValidate: true });
    },
    setPurchasedAt: (purchasedAt): void => {
      holdingForm.setValue('purchasedAt', purchasedAt, { shouldValidate: true });
    },
    selectCoinByKey: (key): void => {
      const coin = (searchQuery.data ?? []).find((item) => item.id === key);
      if (coin !== undefined) {
        selectCoin(coin);
      }
    },
    selectCurrencyByKey: (key): void => {
      const currency = PORTFOLIO_FIAT_CURRENCIES.find((item) => item === key);
      if (currency !== undefined) {
        persist({ ...settings, fiatCurrency: currency });
      }
    },
    addHolding: holdingForm.handleSubmit((values) => {
      const amount = toPositiveAmount(values.amount);
      if (values.selectedCoin === null || amount === null) {
        return;
      }

      const holding: PortfolioHoldingConfig = {
        id: createHoldingId(values.selectedCoin.id),
        coinGeckoId: values.selectedCoin.id,
        name: values.selectedCoin.name,
        symbol: values.selectedCoin.symbol,
        amount,
        purchasedAt: values.purchasedAt,
      };
      persist({ ...settings, holdings: [...settings.holdings, holding] });
      holdingForm.reset(defaultHoldingFormValues());
      setQuery('');
    }),
    removeHolding: (holdingId): void => {
      persist({
        ...settings,
        holdings: settings.holdings.filter((holding) => holding.id !== holdingId),
      });
    },
  };
}
