import { useMemo } from 'react';
import { useAtom } from 'jotai';
import { mockPortfolioSnapshot } from '../data/mockPortfolioSnapshot';
import {
  changeDisplayModeAtom,
  selectedAssetByPersonAtom,
  selectedPeriodAtom,
} from '../store/portfolio.atoms';
import type { PortfolioAsset, PortfolioPeriod, PricePoint } from '../types/portfolio';

const periods: readonly PortfolioPeriod[] = ['1D', '1W', '1M', 'YTD', '1Y', 'ALL'];
const demoEthStakingRewardsEur = 18_420;

export type PortfolioRow = {
  readonly id: string;
  readonly label: string;
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
  readonly rows: readonly PortfolioRow[];
  readonly chartPoints: readonly PricePoint[];
  readonly rewardValue: number;
  readonly changeDisplayMode: 'absolute' | 'percentage';
  readonly selectPeriod: (period: PortfolioPeriod) => void;
  readonly selectAsset: (assetId: string) => void;
  readonly toggleChangeDisplayMode: () => void;
};

function getSeries(assetId: string, period: PortfolioPeriod): readonly PricePoint[] {
  const series = mockPortfolioSnapshot.marketSeries.find((item) => item.assetId === assetId);
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
  const person = mockPortfolioSnapshot.people[0];

  /* istanbul ignore next -- The Zod-validated mock snapshot always contains one person. */
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
    const points = getSeries(asset.id, selectedPeriod);
    const firstValue = getFirstValue(points);
    const value = getLastValue(points);
    const changeValue = value - firstValue;
    const changePercent = firstValue === 0 ? 0 : changeValue / firstValue;
    return {
      id: asset.id,
      label: asset.label,
      value,
      changeValue,
      changePercent,
      isSelected: asset.id === selectedAsset.id,
      isTotal: asset.id === 'total',
    };
  });

  return {
    personName: person.name,
    periods,
    selectedPeriod,
    selectedLabel: selectedAsset.label,
    rows,
    chartPoints: getSeries(selectedAsset.id, selectedPeriod),
    rewardValue: demoEthStakingRewardsEur,
    changeDisplayMode,
    selectPeriod: setSelectedPeriod,
    selectAsset: (assetId): void => {
      setSelectedAssets((current) => ({ ...current, [person.id]: assetId }));
    },
    toggleChangeDisplayMode: (): void => {
      setChangeDisplayMode((current) => (current === 'absolute' ? 'percentage' : 'absolute'));
    },
  };
}
