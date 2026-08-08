import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { usePortfolioController } from '../hooks/usePortfolioController';
import { AssetList } from '../components/AssetList';
import { PeriodTabs } from '../components/PeriodTabs';
import { PortfolioChart } from '../components/PortfolioChart';
import { RewardsRow } from '../components/RewardsRow';

function useFormatters(): {
  readonly formatCurrency: (value: number) => string;
  readonly formatChange: (value: number) => string;
  readonly formatPercent: (value: number) => string;
} {
  return useMemo(() => {
    const currencyFormatter = new Intl.NumberFormat('nl-NL', {
      currency: 'EUR',
      maximumFractionDigits: 0,
      style: 'currency',
    });
    const percentFormatter = new Intl.NumberFormat('nl-NL', {
      maximumFractionDigits: 1,
      signDisplay: 'exceptZero',
      style: 'percent',
    });

    return {
      formatCurrency: (value) => currencyFormatter.format(value),
      formatChange: (value): string => {
        const formatted = currencyFormatter.format(Math.abs(value));
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

export function PortfolioPage(): React.JSX.Element {
  const controller = usePortfolioController();
  const { t } = useTranslation('portfolio');
  const { formatCurrency, formatChange, formatPercent } = useFormatters();

  return (
    <main className="min-h-[100svh] bg-bg-primary px-5 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-[calc(1.25rem+env(safe-area-inset-top))] text-fg-primary">
      <div className="mx-auto flex min-h-[calc(100svh-2.25rem)] w-full max-w-[27rem] flex-col">
        <header className="grid grid-cols-[2.75rem_1fr_2.75rem] items-center pb-6">
          <span aria-hidden="true" />
          <h1 className="text-center text-[1.45rem] font-bold leading-tight tracking-normal">
            {controller.personName}
          </h1>
          <button
            aria-label={t('aria.settings')}
            className="grid min-h-11 min-w-11 place-items-center rounded-sm text-[1.55rem] leading-none text-fg-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
            type="button"
          >
            ⚙
          </button>
        </header>
        <PeriodTabs
          ariaLabel={t('aria.periodNavigation')}
          onSelectPeriod={controller.selectPeriod}
          periods={controller.periods}
          selectedPeriod={controller.selectedPeriod}
        />
        <AssetList
          changeDisplayMode={controller.changeDisplayMode}
          formatChange={formatChange}
          formatCurrency={formatCurrency}
          formatPercent={formatPercent}
          getSelectAssetLabel={(asset) => t('aria.selectAsset', { asset })}
          getToggleChangeLabel={(asset) => t('aria.toggleChange', { asset })}
          onSelectAsset={controller.selectAsset}
          onToggleChangeDisplayMode={controller.toggleChangeDisplayMode}
          rows={controller.rows}
        />
        <div className="flex min-h-8 flex-1" />
        <PortfolioChart
          ariaLabel={t('aria.chart', { asset: controller.selectedLabel })}
          points={controller.chartPoints}
          title={controller.selectedLabel}
        />
        <RewardsRow
          label={t('rewards.ethereum02Available')}
          value={formatCurrency(controller.rewardValue)}
        />
      </div>
    </main>
  );
}
