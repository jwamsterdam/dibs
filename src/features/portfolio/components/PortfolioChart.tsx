import { Area, AreaChart, CartesianGrid, ReferenceLine, XAxis, YAxis } from 'recharts';
import type { PortfolioFiatCurrencyCode } from '../types/portfolio';

type PortfolioChartProps = {
  readonly ariaLabel: string;
  readonly points: readonly ChartPoint[];
  readonly currencyCode: PortfolioFiatCurrencyCode;
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

function getCurrencySymbol(currencyCode: PortfolioFiatCurrencyCode): string {
  const parts = new Intl.NumberFormat('nl-NL', {
    currency: currencyCode,
    currencyDisplay: 'narrowSymbol',
    style: 'currency',
  }).formatToParts(0);

  return parts.find((part) => part.type === 'currency')?.value ?? currencyCode;
}

export function formatAxisCurrency(
  value: number,
  currencyCode: PortfolioFiatCurrencyCode,
  tickStep: number,
): string {
  const symbol = getCurrencySymbol(currencyCode);
  if (tickStep >= 1_000) {
    return `${symbol}${Math.round(value / 1_000)}K`;
  }
  return `${symbol}${new Intl.NumberFormat('nl-NL').format(Math.round(value))}`;
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

export function getValueTicks(
  domain: readonly [number, number],
): readonly [number, number, number] {
  const [minimumDomain, maximumDomain] = domain;
  const middleTick = Math.round((minimumDomain + maximumDomain) / 2);

  return [minimumDomain, middleTick, maximumDomain];
}

export type ChartColorStop = {
  readonly offset: number;
  readonly color: string;
};

const gainColor = 'var(--color-gain)';
const lossColor = 'var(--color-loss)';

function colorForValue(value: number, startValue: number): string {
  return value >= startValue ? gainColor : lossColor;
}

/**
 * Splits the line/area into green/red segments based on each point's value relative to the
 * series' *starting* value — not tick-to-tick direction — matching how CoinMarketCap-style
 * charts color a period's move. Points are assumed evenly spaced along x (the chart uses a
 * category axis), so a point's x-offset is just its index over the last index. Where the sign
 * flips between two points, a linearly-interpolated crossing offset gets a hard color edge
 * instead of the color switching exactly at the point index, so the flip lines up with where the
 * line actually crosses the start value.
 */
export function getColorStops(points: readonly ChartPoint[]): readonly ChartColorStop[] {
  if (points.length === 0) {
    return [];
  }

  const startValue = points[0]?.value ?? 0;
  const lastIndex = points.length - 1;

  if (lastIndex === 0) {
    const soleColor = colorForValue(points[0]?.value ?? startValue, startValue);
    return [
      { color: soleColor, offset: 0 },
      { color: soleColor, offset: 1 },
    ];
  }

  const stops: ChartColorStop[] = [];
  let previousColor = colorForValue(points[0]?.value ?? startValue, startValue);
  stops.push({ color: previousColor, offset: 0 });

  for (let index = 1; index <= lastIndex; index += 1) {
    const point = points[index];
    if (point === undefined) {
      continue;
    }

    const currentOffset = index / lastIndex;
    const currentColor = colorForValue(point.value, startValue);

    if (currentColor !== previousColor) {
      const previousPoint = points[index - 1];
      const previousValue = previousPoint?.value ?? startValue;
      const previousOffset = (index - 1) / lastIndex;
      const valueDelta = point.value - previousValue;
      const crossingFraction =
        valueDelta === 0 ? 0 : Math.min(Math.max((startValue - previousValue) / valueDelta, 0), 1);
      const crossingOffset = previousOffset + crossingFraction * (currentOffset - previousOffset);

      stops.push({ color: previousColor, offset: crossingOffset });
      stops.push({ color: currentColor, offset: crossingOffset });
    }

    stops.push({ color: currentColor, offset: currentOffset });
    previousColor = currentColor;
  }

  return stops;
}

export function PortfolioChart({
  ariaLabel,
  points,
  currencyCode,
}: PortfolioChartProps): React.JSX.Element {
  const timelineTicks = getTimelineTicks(points);
  const valueDomain = getValueDomain(points);
  const valueTicks = getValueTicks(valueDomain);
  const tickStep = valueTicks[1] - valueTicks[0];
  const colorStops = getColorStops(points);
  const startValue = points[0]?.value ?? valueDomain[0];

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
          <linearGradient id="portfolio-chart-stroke" x1="0" x2="1" y1="0" y2="0">
            {colorStops.map((stop, index) => (
              // Consecutive stops can share both offset and color (a crossing landing exactly
              // on a point), so the array index is the only reliably unique key here.
              <stop key={index} offset={stop.offset} stopColor={stop.color} />
            ))}
          </linearGradient>
          <linearGradient id="portfolio-chart-fill" x1="0" x2="1" y1="0" y2="0">
            {colorStops.map((stop, index) => (
              <stop key={index} offset={stop.offset} stopColor={stop.color} stopOpacity={0.16} />
            ))}
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
          tickFormatter={(value: number) => formatAxisCurrency(value, currencyCode, tickStep)}
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
        <ReferenceLine
          stroke="var(--color-chart-axis)"
          strokeDasharray="3 3"
          strokeOpacity={0.6}
          y={startValue}
        />
        <Area
          animationDuration={220}
          baseValue={startValue}
          dataKey="value"
          fill="url(#portfolio-chart-fill)"
          isAnimationActive
          stroke="url(#portfolio-chart-stroke)"
          strokeLinejoin="round"
          strokeWidth={2.15}
          type="monotone"
        />
      </AreaChart>
    </section>
  );
}
