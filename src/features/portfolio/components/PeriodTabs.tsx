import type { PortfolioPeriod } from '../types/portfolio';

type PeriodTabsProps = {
  readonly periods: readonly PortfolioPeriod[];
  readonly selectedPeriod: PortfolioPeriod;
  readonly onSelectPeriod: (period: PortfolioPeriod) => void;
};

export function PeriodTabs({
  periods,
  selectedPeriod,
  onSelectPeriod,
}: PeriodTabsProps): React.JSX.Element {
  return (
    <nav aria-label="Periode" className="border-b border-[var(--color-border-subtle)] pb-2">
      <div className="grid grid-cols-6 text-center text-[0.76rem] font-medium">
        {periods.map((period) => {
          const isSelected = period === selectedPeriod;
          return (
            <button
              aria-pressed={isSelected}
              className="min-h-11 rounded-sm px-1 text-fg-muted transition-colors hover:text-fg-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary aria-pressed:text-brand-primary"
              key={period}
              onClick={() => onSelectPeriod(period)}
              type="button"
            >
              {period}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
