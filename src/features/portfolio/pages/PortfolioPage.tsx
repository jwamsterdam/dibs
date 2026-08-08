import { useMemo } from 'react';
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
  const { formatCurrency, formatChange, formatPercent } = useFormatters();

  return (
    <main className="min-h-[100svh] bg-bg-primary px-5 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-[calc(1.25rem+env(safe-area-inset-top))] text-fg-primary">
      <div className="mx-auto flex min-h-[calc(100svh-2.25rem)] w-full max-w-[27rem] flex-col">
        <h1 className="pb-4 text-[1.45rem] font-semibold leading-tight tracking-normal">
          {controller.personName}
        </h1>
        <PeriodTabs
          onSelectPeriod={controller.selectPeriod}
          periods={controller.periods}
          selectedPeriod={controller.selectedPeriod}
        />
        <AssetList
          changeDisplayMode={controller.changeDisplayMode}
          formatChange={formatChange}
          formatCurrency={formatCurrency}
          formatPercent={formatPercent}
          onSelectAsset={controller.selectAsset}
          onToggleChangeDisplayMode={controller.toggleChangeDisplayMode}
          rows={controller.rows}
        />
        <div className="flex min-h-8 flex-1" />
        <PortfolioChart points={controller.chartPoints} title={controller.selectedLabel} />
        <RewardsRow label="ETH staking rewards" value={formatCurrency(controller.rewardValue)} />
      </div>
    </main>
  );
}
