import type { PricePoint } from '../types/portfolio';

type PortfolioChartProps = {
  readonly title: string;
  readonly points: readonly PricePoint[];
};

function buildPath(points: readonly PricePoint[]): string {
  if (points.length === 0) {
    return '';
  }

  const values = points.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const lastIndex = points.length - 1 || 1;

  return points
    .map((point, index) => {
      const x = (index / lastIndex) * 100;
      const y = 90 - ((point.value - min) / range) * 70;
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(' ');
}

export function PortfolioChart({ title, points }: PortfolioChartProps): React.JSX.Element {
  const path = buildPath(points);

  return (
    <section aria-label={`${title} grafiek`} className="pt-5">
      <h2 className="text-[0.95rem] font-semibold leading-tight text-fg-primary">{title}</h2>
      <svg
        aria-hidden="true"
        className="mt-3 h-40 w-full overflow-visible"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
      >
        <path d="M 0 92 L 100 92" fill="none" stroke="var(--color-border-subtle)" strokeWidth="0.45" />
        <path d={path} fill="none" stroke="var(--color-brand-primary)" strokeLinecap="round" strokeWidth="1.45" />
      </svg>
    </section>
  );
}
