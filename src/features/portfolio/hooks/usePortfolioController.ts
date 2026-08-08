import { useMemo } from 'react';
import { useAtom } from 'jotai';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { configuredPortfolioDataSource } from '../data/portfolioDataSource';
import { indexedDbPortfolioConfigRepository } from '../data/portfolioConfigRepository';
import { mockPortfolioSnapshot } from '../data/mockPortfolioSnapshot';
import {
  changeDisplayModeAtom,
  isSettingsOpenAtom,
  selectedAssetByPersonAtom,
  selectedPeriodAtom,
} from '../store/portfolio.atoms';
import { PORTFOLIO_PERIODS } from '../types/portfolio';
import type {
  ChangeDisplayMode,
  PortfolioAsset,
  PortfolioPeriod,
  PortfolioSnapshot,
  PricePoint,
} from '../types/portfolio';

type SelectionKey = string | number;

const demoEthStakingRewardsEur = 18_420;

export type PortfolioRow = {
  readonly id: string;
  readonly label: string;
  readonly amount: number | null;
  readonly value: number;
  readonly changeValue: number;
  readonly changePercent: number;
  readonly isSelected: boolean;
  readonly isTotal: boolean;
};

export type PortfolioController = {
  readonly personName: string;
  readonly periods: readonly PortfolioPeriod[];
  readonly selectedPeriod: PortfolioPeriod;
  readonly selectedLabel: string;
  readonly fiatCurrency: PortfolioSnapshot['fiatCurrency'];
  readonly rows: readonly PortfolioRow[];
  readonly chartPoints: readonly PricePoint[];
  readonly rewardValue: number;
  readonly isSettingsOpen: boolean;
  readonly isOnlinePortfolio: boolean;
  readonly isOnlineLoading: boolean;
  readonly isOnlineError: boolean;
  readonly changeDisplayMode: ChangeDisplayMode;
  readonly openSettings: () => void;
  readonly closeSettings: () => void;
  readonly selectPeriodByKey: (key: SelectionKey) => void;
  readonly selectAsset: (assetId: string) => void;
  readonly toggleChangeDisplayMode: () => void;
};

function getSeries(
  snapshot: PortfolioSnapshot,
  assetId: string,
  period: PortfolioPeriod,
): readonly PricePoint[] {
  const series = snapshot.marketSeries.find((item) => item.assetId === assetId);
  return series?.prices[period] ?? [];
}

function getLastValue(points: readonly PricePoint[]): number {
  const lastPoint = points.at(-1);
  return lastPoint?.value ?? 0;
}

function getFirstValue(points: readonly PricePoint[]): number {
  const firstPoint = points[0];
  return firstPoint?.value ?? 0;
}

function buildTotalAsset(assets: readonly PortfolioAsset[]): PortfolioAsset {
  const amount = assets.reduce((sum, asset) => sum + asset.amount, 0);
  return { id: 'total', label: 'Totaal', symbol: 'EUR', amount, kind: 'total' };
}

export function usePortfolioController(): PortfolioController {
  const [selectedPeriod, setSelectedPeriod] = useAtom(selectedPeriodAtom);
  const [selectedAssets, setSelectedAssets] = useAtom(selectedAssetByPersonAtom);
  const [changeDisplayMode, setChangeDisplayMode] = useAtom(changeDisplayModeAtom);
  const [isSettingsOpen, setIsSettingsOpen] = useAtom(isSettingsOpenAtom);
  const settingsQuery = useQuery({
    queryFn: () => indexedDbPortfolioConfigRepository.loadSettings(),
    queryKey: ['portfolio-settings'],
    staleTime: 5_000,
  });
  const snapshotQuery = useQuery({
    placeholderData: keepPreviousData,
    queryFn: () => configuredPortfolioDataSource.getSnapshot(selectedPeriod),
    queryKey: ['portfolio-snapshot', selectedPeriod, settingsQuery.dataUpdatedAt],
    staleTime: 30_000,
  });
  const snapshot = snapshotQuery.data ?? mockPortfolioSnapshot;
  const person = snapshot.people[0];

  /* istanbul ignore next -- The Zod-validated snapshot always contains one person. */
  if (!person) {
    throw new Error('Portfolio requires at least one person');
  }

  const selectedAssetId = selectedAssets[person.id] ?? person.selectedAssetId;
  const assets = useMemo(() => [buildTotalAsset(person.assets), ...person.assets], [person.assets]);
  const selectedAsset = assets.find((asset) => asset.id === selectedAssetId) ?? assets[0];

  /* istanbul ignore next -- The total row guarantees at least one selectable asset. */
  if (!selectedAsset) {
    throw new Error('Portfolio requires at least one asset');
  }

  const rows = assets.map((asset) => {
    const points = getSeries(snapshot, asset.id, selectedPeriod);
    const firstValue = getFirstValue(points);
    const value = getLastValue(points);
    const changeValue = value - firstValue;
    const changePercent = firstValue === 0 ? 0 : changeValue / firstValue;
    return {
      id: asset.id,
      label: asset.label,
      amount: asset.kind === 'total' ? null : asset.amount,
      value,
      changeValue,
      changePercent,
      isSelected: asset.id === selectedAsset.id,
      isTotal: asset.id === 'total',
    };
  });

  return {
    personName: person.name,
    fiatCurrency: snapshot.fiatCurrency,
    periods: PORTFOLIO_PERIODS,
    selectedPeriod,
    selectedLabel: selectedAsset.label,
    rows,
    chartPoints: getSeries(snapshot, selectedAsset.id, selectedPeriod),
    rewardValue: demoEthStakingRewardsEur,
    isSettingsOpen,
    isOnlinePortfolio: snapshot.mode === 'online',
    isOnlineLoading: snapshotQuery.isLoading,
    isOnlineError: snapshotQuery.isError,
    changeDisplayMode,
    openSettings: (): void => setIsSettingsOpen(true),
    closeSettings: (): void => setIsSettingsOpen(false),
    selectPeriodByKey: (key): void => {
      const nextPeriod = PORTFOLIO_PERIODS.find((period) => period === key);
      if (nextPeriod !== undefined) {
        setSelectedPeriod(nextPeriod);
      }
    },
    selectAsset: (assetId): void => {
      setSelectedAssets((current) => ({ ...current, [person.id]: assetId }));
    },
    toggleChangeDisplayMode: (): void => {
      setChangeDisplayMode((current) => (current === 'absolute' ? 'percentage' : 'absolute'));
    },
  };
}
