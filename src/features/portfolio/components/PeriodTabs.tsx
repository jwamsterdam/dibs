import { Tab, TabList, Tabs, type Key } from 'react-aria-components/Tabs';
import { cn, focusRingClassName } from '@/shared/lib/cn';
import type { PortfolioPeriod } from '../types/portfolio';

type PeriodTabsProps = {
  readonly ariaLabel: string;
  readonly periods: readonly PortfolioPeriod[];
  readonly selectedPeriod: PortfolioPeriod;
  readonly onSelectPeriod: (key: Key) => void;
};

export function PeriodTabs({
  ariaLabel,
  periods,
  selectedPeriod,
  onSelectPeriod,
}: PeriodTabsProps): React.JSX.Element {
  return (
    <Tabs
      aria-label={ariaLabel}
      className="border-b border-[var(--color-border-strong)] pb-[0.65rem]"
      onSelectionChange={onSelectPeriod}
      selectedKey={selectedPeriod}
    >
      <TabList className="grid grid-cols-6 text-center text-[0.82rem] font-normal">
        {periods.map((period) => {
          return (
            <Tab
              className={({ isSelected }) =>
                cn(
                  'mx-auto grid min-h-8 min-w-11 cursor-default place-items-center rounded-[0.45rem] px-2 text-fg-primary transition-colors hover:text-brand-primary',
                  focusRingClassName,
                  isSelected ? 'bg-brand-muted font-medium text-brand-primary' : '',
                )
              }
              id={period}
              key={period}
            >
              {period}
            </Tab>
          );
        })}
      </TabList>
    </Tabs>
  );
}
