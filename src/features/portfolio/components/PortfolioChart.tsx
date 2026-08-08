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

const fallbackValueDomain = [0, 1] as const;

function roundToStep(value: number, step: number, method: 'ceil' | 'floor'): number {
  const scaledValue = value / step;
  return Math[method](scaledValue) * step;
}

function getNiceStep(range: number): number {
  const roughStep = range / 2;
  const exponent = Math.floor(Math.log10(roughStep));
  const base = 10 ** exponent;
  const normalizedStep = roughStep / base;

  if (normalizedStep <= 1) {
    return base;
  }

  if (normalizedStep <= 2) {
    return base * 2;
  }

  if (normalizedStep <= 5) {
    return base * 5;
  }

  return base * 10;
}

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

export function getValueDomain(points: readonly ChartPoint[]): readonly [number, number] {
  if (points.length === 0) {
    return fallbackValueDomain;
  }

  const values = points.map((point) => point.value);
  const minimumValue = Math.min(...values);
  const maximumValue = Math.max(...values);
  const rawRange = maximumValue - minimumValue;
  const padding = Math.max(rawRange * 0.14, maximumValue * 0.015, 1);
  const step = getNiceStep(rawRange + padding * 2);
  const minimumDomain = roundToStep(minimumValue - padding, step, 'floor');
  const maximumDomain = roundToStep(maximumValue + padding, step, 'ceil');

  return [minimumDomain, maximumDomain];
}

export function getValueTicks(domain: readonly [number, number]): readonly [number, number, number] {
  const [minimumDomain, maximumDomain] = domain;
  const middleTick = Math.round((minimumDomain + maximumDomain) / 2);

  return [minimumDomain, middleTick, maximumDomain];
}

export function PortfolioChart({ ariaLabel, points }: PortfolioChartProps): React.JSX.Element {
  const timelineTicks = getTimelineTicks(points);
  const valueDomain = getValueDomain(points);
  const valueTicks = getValueTicks(valueDomain);

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
          domain={valueDomain}
          orientation="right"
          tick={{ fill: 'var(--color-chart-axis)', fontSize: 10 }}
          ticks={valueTicks}
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
          baseValue={valueDomain[0]}
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
