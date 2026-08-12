type ComparisonBarTone = 'neutral' | 'gain' | 'loss';

const toneClassName: Record<ComparisonBarTone, string> = {
  gain: 'bg-gain',
  loss: 'bg-loss',
  neutral: 'bg-brand-muted',
};

type ComparisonBarProps = {
  readonly label: string;
  readonly value: string;
  readonly numericValue: number;
  readonly maxValue: number;
  readonly tone: ComparisonBarTone;
};

function ComparisonBar({
  label,
  value,
  numericValue,
  maxValue,
  tone,
}: ComparisonBarProps): React.JSX.Element {
  const widthPercent = maxValue === 0 ? 0 : (numericValue / maxValue) * 100;

  return (
    <div className="grid gap-2">
      <div className="flex items-baseline justify-between text-[0.86rem] leading-none">
        <span className="font-medium text-fg-muted">{label}</span>
        <span className="font-bold tabular-nums leading-none text-fg-primary">{value}</span>
      </div>
      <div
        aria-label={label}
        aria-valuemax={maxValue}
        aria-valuemin={0}
        aria-valuenow={numericValue}
        className="h-3 w-full overflow-hidden rounded-full bg-bg-secondary"
        data-tone={tone}
        role="meter"
      >
        <div
          className={`h-full rounded-full transition-[width] duration-300 ${toneClassName[tone]}`}
          style={{ width: `${widthPercent}%` }}
        />
      </div>
    </div>
  );
}

type PortfolioAllTimeComparisonProps = {
  readonly ariaLabel: string;
  readonly purchaseLabel: string;
  readonly currentLabel: string;
  readonly purchaseValue: number;
  readonly currentValue: number;
  readonly formatValue: (value: number) => string;
};

/**
 * ALL swaps the line chart for a purchase-vs-now comparison: with no fixed window, a line's
 * shape reads as noise rather than a trend, but "what did I pay, what is it worth" is the one
 * thing ALL is actually for.
 */
export function PortfolioAllTimeComparison({
  ariaLabel,
  purchaseLabel,
  currentLabel,
  purchaseValue,
  currentValue,
  formatValue,
}: PortfolioAllTimeComparisonProps): React.JSX.Element {
  const maxValue = Math.max(purchaseValue, currentValue, 1);
  const currentTone: ComparisonBarTone = currentValue >= purchaseValue ? 'gain' : 'loss';

  return (
    <section aria-label={ariaLabel} className="flex h-[13.6rem] flex-col justify-center gap-7">
      <ComparisonBar
        label={purchaseLabel}
        maxValue={maxValue}
        numericValue={purchaseValue}
        tone="neutral"
        value={formatValue(purchaseValue)}
      />
      <ComparisonBar
        label={currentLabel}
        maxValue={maxValue}
        numericValue={currentValue}
        tone={currentTone}
        value={formatValue(currentValue)}
      />
    </section>
  );
}
