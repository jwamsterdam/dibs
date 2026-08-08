import type { ChangeDisplayMode } from '../types/portfolio';

type AssetRowProps = {
  readonly label: string;
  readonly selectLabel: string;
  readonly toggleChangeLabel: string;
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
  const dividerClassName = isTotal ? 'border-[var(--color-border-strong)]' : 'border-[var(--color-border-subtle)]';

  return (
    <li
      className={`relative grid min-h-[3.15rem] grid-cols-[0.75rem_minmax(6.8rem,1fr)_minmax(5.4rem,auto)_minmax(4.65rem,auto)] items-center gap-2 border-b last:border-b-0 ${dividerClassName}`}
    >
      <button
        aria-current={isSelected ? 'true' : undefined}
        aria-label={selectLabel}
        className="absolute inset-y-0 left-0 right-[5.25rem] z-10 rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
        onClick={onSelect}
        type="button"
      />
      <span
        aria-hidden="true"
        className={`pointer-events-none ml-0.5 h-8 w-[0.18rem] rounded-sm bg-brand-primary transition-opacity duration-200 ${indicatorClassName}`}
      />
      <span
        className={`pointer-events-none min-w-0 justify-self-start truncate text-left text-[0.98rem] leading-none text-fg-primary ${rowWeightClassName}`}
      >
        {label}
      </span>
      <span
        className={`pointer-events-none justify-self-end text-right text-[0.98rem] tabular-nums leading-none text-fg-primary ${rowWeightClassName}`}
      >
        {value}
      </span>
      <button
        aria-label={toggleChangeLabel}
        className={`relative z-20 min-h-11 justify-self-end text-right text-[0.98rem] tabular-nums leading-none ${changeClassName} focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary`}
        onClick={onToggleChangeDisplayMode}
        type="button"
      >
        {displayedChange}
      </button>
    </li>
  );
}
