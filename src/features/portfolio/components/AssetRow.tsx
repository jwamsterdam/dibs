import { Button } from 'react-aria-components/Button';
import { focusRingClassName } from '@/shared/lib/cn';
import type { ChangeDisplayMode } from '../types/portfolio';

type AssetRowProps = {
  readonly label: string;
  readonly selectLabel: string;
  readonly toggleChangeLabel: string;
  readonly amount: string;
  readonly value: string;
  readonly absoluteChange: string;
  readonly percentageChange: string;
  readonly changeValue: number;
  readonly isSelected: boolean;
  readonly isTotal: boolean;
  readonly changeDisplayMode: ChangeDisplayMode;
  readonly onSelect: () => void;
  readonly onToggleChangeDisplayMode: () => void;
};

export function AssetRow({
  label,
  selectLabel,
  toggleChangeLabel,
  amount,
  value,
  absoluteChange,
  percentageChange,
  changeValue,
  isSelected,
  isTotal,
  changeDisplayMode,
  onSelect,
  onToggleChangeDisplayMode,
}: AssetRowProps): React.JSX.Element {
  const changeClassName = changeValue < 0 ? 'text-loss' : 'text-gain';
  const displayedChange = changeDisplayMode === 'absolute' ? absoluteChange : percentageChange;
  const indicatorClassName = isSelected ? 'opacity-100' : 'opacity-0';
  const rowWeightClassName = isTotal ? 'font-bold' : 'font-normal';
  const dividerClassName = isTotal
    ? 'border-[var(--color-border-strong)]'
    : 'border-[var(--color-border-subtle)]';

  return (
    <li
      className={`relative grid min-h-[3.15rem] grid-cols-[0.75rem_minmax(5rem,1fr)_minmax(2.9rem,auto)_minmax(5.4rem,auto)_minmax(4.65rem,auto)] items-center gap-2 border-b last:border-b-0 ${dividerClassName}`}
    >
      <Button
        aria-label={selectLabel}
        className={`col-span-4 grid min-h-[3.15rem] grid-cols-subgrid items-center rounded-sm text-left ${focusRingClassName}`}
        onPress={onSelect}
        type="button"
        {...(isSelected ? { 'aria-current': 'true' as const } : {})}
      >
        <span
          aria-hidden="true"
          className={`pointer-events-none ml-0.5 h-8 w-[0.18rem] rounded-sm bg-brand-primary transition-opacity duration-200 ${indicatorClassName}`}
        />
        <span
          className={`pointer-events-none min-w-0 justify-self-start truncate text-left text-[0.98rem] leading-none text-fg-primary ${rowWeightClassName}`}
        >
          {label}
        </span>
        <span className="pointer-events-none justify-self-end text-right text-[0.86rem] tabular-nums leading-none text-fg-muted">
          {amount}
        </span>
        <span
          className={`pointer-events-none justify-self-end text-right text-[0.98rem] tabular-nums leading-none text-fg-primary ${rowWeightClassName}`}
        >
          {value}
        </span>
      </Button>
      <Button
        aria-label={toggleChangeLabel}
        className={`relative z-20 min-h-11 justify-self-end text-right text-[0.98rem] tabular-nums leading-none ${changeClassName} ${focusRingClassName}`}
        onPress={onToggleChangeDisplayMode}
        type="button"
      >
        {displayedChange}
      </Button>
    </li>
  );
}
