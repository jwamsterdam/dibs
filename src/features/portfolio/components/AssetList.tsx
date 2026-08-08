import { AssetRow } from './AssetRow';
import type { PortfolioRow } from '../hooks/usePortfolioController';
import type { ChangeDisplayMode } from '../types/portfolio';

type AssetListProps = {
  readonly rows: readonly PortfolioRow[];
  readonly formatCurrency: (value: number) => string;
  readonly formatChange: (value: number) => string;
  readonly formatPercent: (value: number) => string;
  readonly getSelectAssetLabel: (asset: string) => string;
  readonly getToggleChangeLabel: (asset: string) => string;
  readonly changeDisplayMode: ChangeDisplayMode;
  readonly onSelectAsset: (assetId: string) => void;
  readonly onToggleChangeDisplayMode: () => void;
};

export function AssetList({
  rows,
  formatCurrency,
  formatChange,
  formatPercent,
  getSelectAssetLabel,
  getToggleChangeLabel,
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
          isTotal={row.isTotal}
          key={row.id}
          label={row.label}
          onSelect={() => onSelectAsset(row.id)}
          onToggleChangeDisplayMode={onToggleChangeDisplayMode}
          percentageChange={formatPercent(row.changePercent)}
          selectLabel={getSelectAssetLabel(row.label)}
          toggleChangeLabel={getToggleChangeLabel(row.label)}
          value={formatCurrency(row.value)}
        />
      ))}
    </ul>
  );
}
