import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'react-aria-components/Button';
import { usePortfolioController } from '../hooks/usePortfolioController';
import { AssetList } from '../components/AssetList';
import { PeriodTabs } from '../components/PeriodTabs';
import { SettingsPanel } from '../components/SettingsPanel';
import { type ChartPoint, PortfolioChart } from '../components/PortfolioChart';
import { RewardsRow } from '../components/RewardsRow';
import type { PortfolioFiatCurrencyCode, PortfolioPeriod, PricePoint } from '../types/portfolio';

type ChartLabelsByPeriod = Record<PortfolioPeriod, readonly string[]>;

function useFormatters(): {
  readonly formatCurrency: (value: number, currency: PortfolioFiatCurrencyCode) => string;
  readonly formatChange: (value: number, currency: PortfolioFiatCurrencyCode) => string;
  readonly formatPercent: (value: number) => string;
} {
  return useMemo(() => {
    const percentFormatter = new Intl.NumberFormat('nl-NL', {
      maximumFractionDigits: 1,
      signDisplay: 'exceptZero',
      style: 'percent',
    });

    return {
      formatCurrency: (value, currency) =>
        new Intl.NumberFormat('nl-NL', {
          currency,
          maximumFractionDigits: 0,
          style: 'currency',
        }).format(value),
      formatChange: (value, currency): string => {
        const formatted = new Intl.NumberFormat('nl-NL', {
          currency,
          maximumFractionDigits: 0,
          style: 'currency',
        }).format(Math.abs(value));
        if (value > 0) {
          return `+${formatted}`;
        }
        if (value < 0) {
          return `-${formatted}`;
        }
        return formatted;
      },
      formatPercent: (value) => percentFormatter.format(value),
    };
  }, []);
}

export function toChartPoints(
  points: readonly PricePoint[],
  fallbackLabels: readonly string[],
): readonly ChartPoint[] {
  return points.map((point, index) => ({
    label: fallbackLabels[index] ?? point.timestamp,
    value: point.value,
  }));
}

export function PortfolioPage(): React.JSX.Element {
  const controller = usePortfolioController();
  const { t } = useTranslation('portfolio');
  const { formatCurrency, formatChange, formatPercent } = useFormatters();
  const chartLabelsByPeriod = t('chart.labels', { returnObjects: true }) as ChartLabelsByPeriod;
  const chartPoints = toChartPoints(
    controller.chartPoints,
    chartLabelsByPeriod[controller.selectedPeriod],
  );

  return (
    <main className="h-[100svh] overflow-hidden bg-bg-primary px-[1.35rem] pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-[calc(1rem+env(safe-area-inset-top))] text-fg-primary">
      <div className="mx-auto flex h-full w-full max-w-[25.2rem] flex-col">
        <header className="grid grid-cols-[2.25rem_1fr_2.25rem] items-center pb-[1.35rem]">
          <span aria-hidden="true" />
          <h1 className="text-center text-[1.45rem] font-bold leading-tight tracking-normal">
            {controller.personName}
          </h1>
          <Button
            aria-label={t('aria.settings')}
            className="grid min-h-9 min-w-9 place-items-center rounded-full text-[1.35rem] font-light leading-none text-fg-primary transition-colors hover:bg-bg-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
            onPress={controller.openSettings}
            type="button"
          >
            {'\u2699\uFE0E'}
          </Button>
        </header>
        <PeriodTabs
          ariaLabel={t('aria.periodNavigation')}
          onSelectPeriod={controller.selectPeriod}
          periods={controller.periods}
          selectedPeriod={controller.selectedPeriod}
        />
        <AssetList
          changeDisplayMode={controller.changeDisplayMode}
          formatChange={(value) => formatChange(value, controller.fiatCurrency)}
          formatCurrency={(value) => formatCurrency(value, controller.fiatCurrency)}
          formatPercent={formatPercent}
          getSelectAssetLabel={(asset) => t('aria.selectAsset', { asset })}
          getToggleChangeLabel={(asset) => t('aria.toggleChange', { asset })}
          onSelectAsset={controller.selectAsset}
          onToggleChangeDisplayMode={controller.toggleChangeDisplayMode}
          rows={controller.rows}
        />
        <div className="flex min-h-[3.1rem] flex-1" />
        <PortfolioChart
          ariaLabel={t('aria.chart', { asset: controller.selectedLabel })}
          points={chartPoints}
        />
        <RewardsRow
          label={t('rewards.ethStakingRewards')}
          value={formatCurrency(controller.rewardValue, controller.fiatCurrency)}
        />
      </div>
      {controller.isSettingsOpen ? <SettingsPanel onClose={controller.closeSettings} /> : null}
    </main>
  );
}
