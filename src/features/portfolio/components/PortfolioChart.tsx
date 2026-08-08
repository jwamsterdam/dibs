import type { PricePoint } from '../types/portfolio';
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from 'recharts';

type PortfolioChartProps = {
  readonly ariaLabel: string;
  readonly title: string;
  readonly points: readonly PricePoint[];
};

type ChartPoint = {
  readonly label: string;
  readonly value: number;
};

const fallbackLabels = ['15 apr', '30 apr', '15 mei', '30 mei', '15 jun', '30 jun', '15 jul'];

function toChartPoints(points: readonly PricePoint[]): readonly ChartPoint[] {
  return points.map((point, index) => ({
    label: fallbackLabels[index] ?? point.timestamp,
    value: point.value,
  }));
}

function formatAxisCurrency(value: number): string {
  if (Math.abs(value) >= 1_000) {
    return `€${Math.round(value / 1_000)}K`;
  }
  return `€${Math.round(value)}`;
}

export function PortfolioChart({ ariaLabel, points }: PortfolioChartProps): React.JSX.Element {
  const chartPoints = toChartPoints(points);

  return (
    <section aria-label={ariaLabel} className="h-[19rem] pt-8">
      <AreaChart
        data={chartPoints}
        margin={{ bottom: 8, left: 0, right: 0, top: 8 }}
        responsive
        role="img"
        style={{ height: '100%', width: '100%' }}
      >
        <defs>
          <linearGradient id="portfolio-chart-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--color-brand-primary)" stopOpacity={0.18} />
            <stop offset="100%" stopColor="var(--color-brand-primary)" stopOpacity={0.08} />
          </linearGradient>
        </defs>
        <CartesianGrid
          stroke="var(--color-chart-grid)"
          strokeDasharray="2 4"
          vertical={false}
        />
        <YAxis
          axisLine={false}
          dataKey="value"
          domain={['dataMin', 'dataMax']}
          tick={{ fill: 'var(--color-fg-primary)', fontSize: 11 }}
          tickFormatter={formatAxisCurrency}
          tickLine={false}
          width={48}
        />
        <XAxis
          axisLine={false}
          dataKey="label"
          interval="preserveStartEnd"
          minTickGap={12}
          tick={{ fill: 'var(--color-fg-primary)', fontSize: 11 }}
          tickLine={false}
        />
        <Area
          animationDuration={220}
          dataKey="value"
          fill="url(#portfolio-chart-fill)"
          isAnimationActive
          stroke="var(--color-brand-primary)"
          strokeWidth={2}
          type="monotone"
        />
      </AreaChart>
    </section>
  );
}
