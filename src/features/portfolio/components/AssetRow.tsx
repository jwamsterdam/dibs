import type { ChangeDisplayMode } from '../types/portfolio';

type AssetRowProps = {
  readonly label: string;
  readonly value: string;
  readonly absoluteChange: string;
  readonly percentageChange: string;
  readonly changeValue: number;
  readonly isSelected: boolean;
  readonly changeDisplayMode: ChangeDisplayMode;
  readonly onSelect: () => void;
  readonly onToggleChangeDisplayMode: () => void;
};

export function AssetRow({
  label,
  value,
  absoluteChange,
  percentageChange,
  changeValue,
  isSelected,
  changeDisplayMode,
  onSelect,
  onToggleChangeDisplayMode,
}: AssetRowProps): React.JSX.Element {
  const changeClassName = changeValue < 0 ? 'text-loss' : 'text-gain';
  const displayedChange = changeDisplayMode === 'absolute' ? absoluteChange : percentageChange;
  const indicatorClassName = isSelected ? 'opacity-100' : 'opacity-0';

  return (
    <li className="relative border-b border-[var(--color-border-subtle)] last:border-b-0">
      <button
        aria-current={isSelected ? 'true' : undefined}
        aria-label={`Selecteer ${label}`}
        className="grid min-h-12 w-full grid-cols-[0.55rem_minmax(5rem,1fr)_auto_auto] items-center gap-2 py-1.5 pr-0 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
        onClick={onSelect}
        type="button"
      >
        <span
          aria-hidden="true"
          className={`h-9 w-0.5 rounded-sm bg-brand-primary transition-opacity duration-200 ${indicatorClassName}`}
        />
        <span className="truncate text-[0.98rem] font-medium leading-tight text-fg-primary">{label}</span>
        <span className="min-w-[5.8rem] text-right text-[0.95rem] tabular-nums leading-tight text-fg-primary">
          {value}
        </span>
      </button>
      <button
        aria-label={`Wissel verandering voor ${label}`}
        className={`absolute bottom-1.5 right-0 min-h-6 min-w-[4.8rem] text-right text-[0.78rem] tabular-nums leading-tight ${changeClassName} focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary`}
        onClick={onToggleChangeDisplayMode}
        type="button"
      >
        {displayedChange}
      </button>
    </li>
  );
}
