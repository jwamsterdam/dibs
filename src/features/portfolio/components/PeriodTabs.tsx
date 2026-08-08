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
    <nav aria-label={ariaLabel} className="border-b border-[var(--color-border-strong)] pb-[0.65rem]">
      <div className="grid grid-cols-6 text-center text-[0.82rem] font-normal">
        {periods.map((period) => {
          const isSelected = period === selectedPeriod;
          return (
            <button
              aria-pressed={isSelected}
              className="mx-auto min-h-8 min-w-11 rounded-[0.45rem] px-2 text-fg-primary transition-colors hover:text-brand-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary aria-pressed:bg-brand-muted aria-pressed:font-medium aria-pressed:text-brand-primary"
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
