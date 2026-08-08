import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from 'recharts';

type PortfolioChartProps = {
  readonly ariaLabel: string;
  readonly points: readonly ChartPoint[];
};

export type ChartPoint = {
  readonly label: string;
  readonly value: number;
};

const yAxisTicks = [200_000, 250_000, 300_000, 350_000, 400_000] as const;

export function formatAxisCurrency(value: number): string {
  if (Math.abs(value) >= 1_000) {
    return `€${Math.round(value / 1_000)}K`;
  }
  return `€${Math.round(value)}`;
}

export function PortfolioChart({ ariaLabel, points }: PortfolioChartProps): React.JSX.Element {
  return (
    <section aria-label={ariaLabel} className="h-[13.6rem]">
      <AreaChart
        data={points}
        margin={{ bottom: 0, left: 0, right: 3, top: 0 }}
        responsive
        role="img"
        style={{ height: '100%', width: '100%' }}
      >
        <defs>
          <linearGradient id="portfolio-chart-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--color-chart-fill)" stopOpacity={1} />
            <stop offset="100%" stopColor="var(--color-chart-fill)" stopOpacity={1} />
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
          domain={[200_000, 400_000]}
          ticks={yAxisTicks}
          tick={{ fill: 'var(--color-chart-axis)', fontSize: 11 }}
          tickFormatter={formatAxisCurrency}
          tickLine={false}
          width={43}
        />
        <XAxis
          axisLine={false}
          dataKey="label"
          interval={0}
          tick={{ fill: 'var(--color-chart-axis)', fontSize: 11 }}
          tickLine={false}
        />
        <Area
          animationDuration={220}
          baseValue={200_000}
          dataKey="value"
          fill="url(#portfolio-chart-fill)"
          isAnimationActive
          stroke="var(--color-brand-primary)"
          strokeWidth={1.6}
          type="linear"
        />
      </AreaChart>
    </section>
  );
}
