import { AssetRow } from './AssetRow';
import type { PortfolioRow } from '../hooks/usePortfolioController';
import type { ChangeDisplayMode } from '../types/portfolio';

type AssetListProps = {
  readonly rows: readonly PortfolioRow[];
  readonly formatCurrency: (value: number) => string;
  readonly formatChange: (value: number) => string;
  readonly formatPercent: (value: number) => string;
  readonly changeDisplayMode: ChangeDisplayMode;
  readonly onSelectAsset: (assetId: string) => void;
  readonly onToggleChangeDisplayMode: () => void;
};

export function AssetList({
  rows,
  formatCurrency,
  formatChange,
  formatPercent,
  changeDisplayMode,
  onSelectAsset,
  onToggleChangeDisplayMode,
}: AssetListProps): React.JSX.Element {
  return (
    <ul className="border-b border-t border-[var(--color-border-strong)]">
      {rows.map((row) => (
        <AssetRow
          absoluteChange={formatChange(row.changeValue)}
          changeDisplayMode={changeDisplayMode}
          changeValue={row.changeValue}
          isSelected={row.isSelected}
          key={row.id}
          label={row.label}
          onSelect={() => onSelectAsset(row.id)}
          onToggleChangeDisplayMode={onToggleChangeDisplayMode}
          percentageChange={formatPercent(row.changePercent)}
          value={formatCurrency(row.value)}
        />
      ))}
    </ul>
  );
}
