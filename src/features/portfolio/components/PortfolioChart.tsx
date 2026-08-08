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

const yAxisTicks = [200_000, 300_000, 400_000] as const;

export function formatAxisCurrency(value: number): string {
  if (Math.abs(value) >= 1_000) {
    return `€${Math.round(value / 1_000)}K`;
  }
  return `€${Math.round(value)}`;
}

export function getTimelineTicks(points: readonly ChartPoint[]): readonly string[] {
  if (points.length === 0) {
    return [];
  }

  const firstPoint = points[0];
  const middlePoint = points[Math.floor(points.length / 2)];
  const lastPoint = points[points.length - 1];
  const ticks = [firstPoint, middlePoint, lastPoint]
    .map((point) => point?.label)
    .filter((label): label is string => label !== undefined);

  return Array.from(new Set(ticks));
}

export function PortfolioChart({ ariaLabel, points }: PortfolioChartProps): React.JSX.Element {
  const timelineTicks = getTimelineTicks(points);

  return (
    <section aria-label={ariaLabel} className="h-[13.6rem]">
      <AreaChart
        data={points}
        margin={{ bottom: 6, left: 12, right: 10, top: 14 }}
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
          strokeOpacity={0.72}
          strokeWidth={0.7}
          vertical={false}
        />
        <YAxis
          axisLine={false}
          dataKey="value"
          domain={[200_000, 400_000]}
          orientation="right"
          tick={{ fill: 'var(--color-chart-axis)', fontSize: 10 }}
          ticks={yAxisTicks}
          tickFormatter={formatAxisCurrency}
          tickLine={false}
          tickMargin={7}
          width={40}
        />
        <XAxis
          axisLine={false}
          dataKey="label"
          minTickGap={18}
          padding={{ left: 2, right: 2 }}
          tick={{ fill: 'var(--color-chart-axis)', fontSize: 10 }}
          ticks={timelineTicks}
          tickLine={false}
          tickMargin={7}
        />
        <Area
          animationDuration={220}
          baseValue={200_000}
          dataKey="value"
          fill="url(#portfolio-chart-fill)"
          isAnimationActive
          stroke="var(--color-brand-primary)"
          strokeLinejoin="round"
          strokeWidth={2.15}
          type="monotone"
        />
      </AreaChart>
    </section>
  );
}
