import { Button } from '@/shared/components/Button/Button';

type Person = {
  readonly id: string;
  readonly name: string;
};

type PersonDotsProps = {
  readonly people: readonly Person[];
  readonly activeIndex: number;
  readonly getDotLabel: (name: string) => string;
  readonly onSelectIndex: (index: number) => void;
};

/**
 * One dot per account, current one highlighted. Not just polish: each dot is independently
 * clickable/keyboard-operable, so it's both the accessible alternative to swiping and the only
 * realistic way to drive account-switching from a jsdom test (RTL can't simulate real drags).
 */
export function PersonDots({
  people,
  activeIndex,
  getDotLabel,
  onSelectIndex,
}: PersonDotsProps): React.JSX.Element | null {
  if (people.length <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-center gap-1.5 pb-3">
      {people.map((person, index) => {
        const isActive = index === activeIndex;
        return (
          <Button
            aria-label={getDotLabel(person.name)}
            className={`h-2 min-h-0 w-2 min-w-0 rounded-full p-0 transition-colors ${
              isActive ? 'bg-brand-primary' : 'bg-[var(--color-border-strong)] opacity-30'
            }`}
            key={person.id}
            onPress={() => onSelectIndex(index)}
            variant="ghost"
            {...(isActive ? { 'aria-current': 'true' as const } : {})}
          />
        );
      })}
    </div>
  );
}
