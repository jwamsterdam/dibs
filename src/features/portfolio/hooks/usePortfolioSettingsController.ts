import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { indexedDbPortfolioConfigRepository } from '../data/portfolioConfigRepository';
import {
  filterCoinGeckoCoins,
  getCoinGeckoHistoricalPrice,
  getCoinGeckoTopCoins,
} from '../data/coingeckoClient';
import { coinGeckoMaxHistoryDays } from '../data/onlinePortfolioData';
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

/** CoinGecko's free tier can't price a date older than this — see {@link onlinePortfolioData}. */
function isPurchasedAtOutOfApiRange(purchasedAt: string): boolean {
  const earliestAllowed = new Date();
  earliestAllowed.setDate(earliestAllowed.getDate() - coinGeckoMaxHistoryDays);
  return new Date(`${purchasedAt}T00:00:00.000Z`) < earliestAllowed;
}

const holdingFormSchema = z
  .object({
    selectedCoin: coinSearchResultSchema.nullable(),
    amount: z.string(),
    purchasedAt: z.string().date(),
    manualPurchasePrice: z.string(),
  })
  .refine((value) => value.selectedCoin !== null, {
    message: 'Coin is required',
    path: ['selectedCoin'],
  })
  .refine((value) => toPositiveAmount(value.amount) !== null, {
    message: 'Amount must be positive',
    path: ['amount'],
  })
  .refine(
    (value) =>
      !isPurchasedAtOutOfApiRange(value.purchasedAt) ||
      toPositiveAmount(value.manualPurchasePrice) !== null,
    {
      message: 'Purchase price is required for dates CoinGecko cannot price',
      path: ['manualPurchasePrice'],
    },
  );

export type HoldingFormValues = z.infer<typeof holdingFormSchema>;

function defaultHoldingFormValues(): HoldingFormValues {
  return {
    selectedCoin: null,
    amount: '',
    manualPurchasePrice: '',
    purchasedAt: todayInputValue(),
  };
}

export type PortfolioSettingsController = {
  readonly settings: PortfolioSettingsConfig;
  readonly currencies: readonly PortfolioFiatCurrency[];
  readonly query: string;
  readonly selectedCoin: CoinSearchResult | null;
  readonly amount: string;
  readonly purchasedAt: string;
  readonly isPurchaseDateOutOfApiRange: boolean;
  readonly manualPurchasePrice: string;
  readonly purchaseValue: number | null;
  readonly isPurchaseValueLoading: boolean;
  readonly searchResults: readonly CoinSearchResult[];
  readonly isSearching: boolean;
  readonly isSaving: boolean;
  readonly saveError: boolean;
  readonly canAddHolding: boolean;
  readonly setQuery: (query: string) => void;
  readonly setAmount: (amount: string) => void;
  readonly setPurchasedAt: (purchasedAt: string) => void;
  readonly setManualPurchasePrice: (manualPurchasePrice: string) => void;
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
  const manualPurchasePrice = useWatch({
    control: holdingForm.control,
    name: 'manualPurchasePrice',
  });
  const isPurchaseDateOutOfApiRange = isPurchasedAtOutOfApiRange(purchasedAt);

  const settingsQuery = useQuery({
    queryFn: () => indexedDbPortfolioConfigRepository.loadSettings(),
    queryKey: ['portfolio-settings'],
    staleTime: 5_000,
  });
  const settings = draftSettings ?? settingsQuery.data ?? defaultSettings;
  const normalizedQuery = query.trim();
  // Downloaded once (and cached in IndexedDB for a week) so autocomplete filters locally
  // instead of hitting CoinGecko's rate-limited `/search` endpoint on every keystroke.
  const topCoinsQuery = useQuery({
    queryFn: () => getCoinGeckoTopCoins(),
    queryKey: ['coingecko-top-coins'],
    staleTime: Infinity,
  });
  const searchResults = useMemo(
    () => filterCoinGeckoCoins(normalizedQuery, topCoinsQuery.data ?? []),
    [normalizedQuery, topCoinsQuery.data],
  );
  // Fetched once per (coin, date) and cached indefinitely — a historical price never changes —
  // so the form can preview the purchase value, and `addHolding` can persist it for later use by
  // the "since purchase" (ALL) calculation, without re-fetching it on every dashboard load.
  // Only runs when the date is within CoinGecko's range — outside it, the request would just
  // 401, so the form asks for the price directly instead (see `manualPurchasePrice`).
  const purchasePriceQuery = useQuery({
    enabled: selectedCoin !== null && purchasedAt.length > 0 && !isPurchaseDateOutOfApiRange,
    queryFn: () =>
      selectedCoin === null
        ? Promise.resolve(null)
        : getCoinGeckoHistoricalPrice(selectedCoin.id, settings.fiatCurrency, purchasedAt),
    queryKey: ['coingecko-history-price', selectedCoin?.id, settings.fiatCurrency, purchasedAt],
    staleTime: Infinity,
  });
  const purchasedAmount = toPositiveAmount(amount);
  const effectivePurchasePrice = isPurchaseDateOutOfApiRange
    ? toPositiveAmount(manualPurchasePrice)
    : (purchasePriceQuery.data ?? null);
  const purchaseValue =
    effectivePurchasePrice !== null && purchasedAmount !== null
      ? effectivePurchasePrice * purchasedAmount
      : null;
  const saveMutation = useMutation({
    mutationFn: (nextSettings: PortfolioSettingsConfig) =>
      indexedDbPortfolioConfigRepository.saveSettings(nextSettings),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['portfolio-settings'] });
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
    isPurchaseDateOutOfApiRange,
    manualPurchasePrice,
    purchaseValue,
    isPurchaseValueLoading: purchasePriceQuery.isLoading,
    searchResults,
    isSearching: normalizedQuery.length >= 2 && topCoinsQuery.isLoading,
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
    setManualPurchasePrice: (manualPurchasePrice): void => {
      holdingForm.setValue('manualPurchasePrice', manualPurchasePrice, { shouldValidate: true });
    },
    selectCoinByKey: (key): void => {
      const coin = searchResults.find((item) => item.id === key);
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

      const purchasePrice = isPurchasedAtOutOfApiRange(values.purchasedAt)
        ? (toPositiveAmount(values.manualPurchasePrice) ?? undefined)
        : (purchasePriceQuery.data ?? undefined);

      const holding: PortfolioHoldingConfig = {
        id: createHoldingId(values.selectedCoin.id),
        coinGeckoId: values.selectedCoin.id,
        name: values.selectedCoin.name,
        symbol: values.selectedCoin.symbol,
        amount,
        purchasedAt: values.purchasedAt,
        purchasePrice,
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
