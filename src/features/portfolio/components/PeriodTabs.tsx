import type { PortfolioPeriod } from '../types/portfolio';

type PeriodTabsProps = {
  readonly ariaLabel: string;
  readonly periods: readonly PortfolioPeriod[];
  readonly selectedPeriod: PortfolioPeriod;
  readonly onSelectPeriod: (period: PortfolioPeriod) => void;
};

export function PeriodTabs({
  ariaLabel,
  periods,
  selectedPeriod,
  onSelectPeriod,
}: PeriodTabsProps): React.JSX.Element {
  return (
    <nav aria-label={ariaLabel} className="border-b border-[var(--color-border-subtle)] pb-3">
      <div className="grid grid-cols-6 text-center text-[0.76rem] font-medium">
        {periods.map((period) => {
          const isSelected = period === selectedPeriod;
          return (
            <button
              aria-pressed={isSelected}
              className="mx-auto min-h-11 min-w-12 rounded-lg px-2 text-fg-primary transition-colors hover:text-brand-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary aria-pressed:bg-brand-muted aria-pressed:text-brand-primary"
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
