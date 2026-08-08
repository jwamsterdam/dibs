import { useTranslation } from 'react-i18next';
import { cn } from '@/shared/lib/cn';
import type { Zone } from '../types/zone';

export type ZoneListProps = {
  zones: Zone[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

/** Presentational zone list. Props in → onSelect out; no data fetching. */
export function ZoneList({ zones, selectedId, onSelect }: ZoneListProps): React.JSX.Element {
  const { t } = useTranslation('zones');

  if (zones.length === 0) {
    return <p className="text-fg-primary">{t('list.empty')}</p>;
  }

  return (
    <ul className="flex flex-col gap-2" aria-label={t('list.label')}>
      {zones.map((zone) => {
        const isSelected = zone.id === selectedId;
        return (
          <li key={zone.id}>
            <button
              type="button"
              onClick={() => onSelect(zone.id)}
              aria-current={isSelected}
              className={cn(
                'w-full rounded-md px-3 py-2 text-left transition',
                isSelected
                  ? 'bg-brand-primary text-fg-on-brand'
                  : 'bg-bg-secondary text-fg-primary',
              )}
            >
              <span className="font-medium">{zone.name}</span>
              {zone.description ? (
                <span className="block text-sm opacity-80">{zone.description}</span>
              ) : null}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
