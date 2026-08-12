import { lazy, Suspense, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/components/Button/Button';
import { usePortfolioController } from '../hooks/usePortfolioController';
import { AssetList } from '../components/AssetList';
import { PeriodTabs } from '../components/PeriodTabs';
import { type ChartPoint, PortfolioChart } from '../components/PortfolioChart';
import { RewardsRow } from '../components/RewardsRow';
import type { PortfolioFiatCurrencyCode, PortfolioPeriod, PricePoint } from '../types/portfolio';

// The settings form pulls in react-hook-form, react-aria-components' Calendar/DatePicker, and
// @internationalized/date — most sessions never open it, so it's split into its own chunk
// instead of shipping that weight in the initial bundle.
const SettingsPanel = lazy(async () => {
  const module = await import('../components/SettingsPanel');
  return { default: module.SettingsPanel };
});

const dayMs = 24 * 60 * 60 * 1_000;

// Chart x-axis granularity per period — each point carries its own real timestamp (see
// onlinePortfolioData.ts), so the label just needs to pick how much of that date to show.
// Each period's window is exactly long enough that its first and last sample can otherwise
// land on the same clock time / weekday / month (1D spans exactly 24h, 1W exactly 7 days, 1Y
// exactly 12 months), so those three include one extra field purely to keep the two ends of
// the axis from rendering identical labels.
const chartLabelFormatOptionsByPeriod: Record<
  Exclude<PortfolioPeriod, 'ALL'>,
  Intl.DateTimeFormatOptions
> = {
  '1D': { hour: '2-digit', minute: '2-digit', weekday: 'short' },
  '1M': { day: 'numeric', month: 'short' },
  '1W': { day: 'numeric', weekday: 'short' },
  '1Y': { month: 'short', year: '2-digit' },
  YTD: { month: 'short' },
};

/**
 * ALL has no fixed-length window (it always starts at the purchase date, see
 * onlinePortfolioData.ts), so unlike the other periods its real span can be anywhere from a few
 * days to several years — the granularity has to be picked from the actual data instead of
 * being hardcoded per period.
 */
function getAllPeriodFormatOptions(points: readonly PricePoint[]): Intl.DateTimeFormatOptions {
  const firstPoint = points[0];
  const lastPoint = points.at(-1);
  if (firstPoint === undefined || lastPoint === undefined) {
    return { year: 'numeric' };
  }

  const spanMs = new Date(lastPoint.timestamp).getTime() - new Date(firstPoint.timestamp).getTime();
  if (spanMs < 60 * dayMs) {
    return { day: 'numeric', month: 'short' };
  }
  if (spanMs < 2 * 365 * dayMs) {
    return { month: 'short', year: '2-digit' };
  }
  return { year: 'numeric' };
}

function useFormatters(): {
  readonly formatAmount: (value: number) => string;
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
    const amountFormatter = new Intl.NumberFormat('nl-NL', { maximumFractionDigits: 8 });

    return {
      formatAmount: (value) => amountFormatter.format(value),
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
  period: PortfolioPeriod,
): readonly ChartPoint[] {
  const formatOptions =
    period === 'ALL' ? getAllPeriodFormatOptions(points) : chartLabelFormatOptionsByPeriod[period];
  const formatter = new Intl.DateTimeFormat('nl-NL', formatOptions);
  return points.map((point) => ({
    label: formatter.format(new Date(point.timestamp)),
    value: point.value,
  }));
}

export function PortfolioPage(): React.JSX.Element {
  const controller = usePortfolioController();
  const { t } = useTranslation('portfolio');
  const { formatAmount, formatCurrency, formatChange, formatPercent } = useFormatters();
  const chartPoints = toChartPoints(controller.chartPoints, controller.selectedPeriod);

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
            className="min-h-9 min-w-9 rounded-full p-0 text-[1.35rem] font-light leading-none"
            onPress={controller.openSettings}
            variant="ghost"
          >
            {'⚙︎'}
          </Button>
        </header>
        {controller.isOnlineError ? (
          <p className="pb-3 text-[0.78rem] text-loss" role="status">
            {t('status.onlineError')}
          </p>
        ) : null}
        <PeriodTabs
          ariaLabel={t('aria.periodNavigation')}
          onSelectPeriod={controller.selectPeriodByKey}
          periods={controller.periods}
          selectedPeriod={controller.selectedPeriod}
        />
        <AssetList
          changeDisplayMode={controller.changeDisplayMode}
          formatAmount={formatAmount}
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
          currencyCode={controller.fiatCurrency}
          points={chartPoints}
        />
        <RewardsRow
          label={t('rewards.ethStakingRewards')}
          value={formatCurrency(controller.rewardValue, controller.fiatCurrency)}
        />
      </div>
      {controller.isSettingsOpen ? (
        <Suspense fallback={null}>
          <SettingsPanel onClose={controller.closeSettings} />
        </Suspense>
      ) : null}
    </main>
  );
}
