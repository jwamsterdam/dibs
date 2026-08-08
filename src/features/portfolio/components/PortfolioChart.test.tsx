import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/shared/test/renderWithProviders';
import {
  formatAxisCurrency,
  getTimelineTicks,
  getValueDomain,
  getValueTicks,
  PortfolioChart,
} from './PortfolioChart';

describe('PortfolioChart', () => {
  it('renders an empty chart region without failing', () => {
    renderWithProviders(<PortfolioChart ariaLabel="BTC chart" currencyCode="EUR" points={[]} />);

    expect(screen.getByRole('region', { name: 'BTC chart' })).toBeInTheDocument();
  });

  it('formats compact and small currency axis labels', () => {
    expect(formatAxisCurrency(400_000, 'EUR', 10_000)).toBe('€400K');
    expect(formatAxisCurrency(900, 'EUR', 500)).toBe('€900');
  });

  it('formats axis labels using the configured fiat currency', () => {
    expect(formatAxisCurrency(400_000, 'USD', 10_000)).toBe('$400K');
    expect(formatAxisCurrency(400_000, 'GBP', 10_000)).toBe('£400K');
  });

  it('avoids collapsing distinct ticks into the same compact label', () => {
    expect(formatAxisCurrency(3_200, 'EUR', 100)).toBe('€3.200');
    expect(formatAxisCurrency(3_350, 'EUR', 100)).toBe('€3.350');
    expect(formatAxisCurrency(3_500, 'EUR', 100)).toBe('€3.500');
  });
  it('reduces timeline ticks to first, middle, and last labels', () => {
    expect(
      getTimelineTicks([
        { label: 'Jan', value: 200_000 },
        { label: 'Feb', value: 240_000 },
        { label: 'Mar', value: 280_000 },
        { label: 'Apr', value: 320_000 },
        { label: 'May', value: 360_000 },
      ]),
    ).toEqual(['Jan', 'Mar', 'May']);
  });

  it('deduplicates timeline ticks for sparse datasets', () => {
    expect(getTimelineTicks([{ label: 'Vandaag', value: 200_000 }])).toEqual(['Vandaag']);
  });

  it('derives the value axis domain from the supplied chart points', () => {
    const btcDomain = getValueDomain([
      { label: 'Start', value: 24_940 },
      { label: 'Middle', value: 25_700 },
      { label: 'End', value: 26_896 },
    ]);
    const totalDomain = getValueDomain([
      { label: 'Start', value: 341_200 },
      { label: 'Middle', value: 347_000 },
      { label: 'End', value: 352_946 },
    ]);

    expect(btcDomain[0]).toBeLessThanOrEqual(24_940);
    expect(btcDomain[1]).toBeGreaterThanOrEqual(26_896);
    expect(totalDomain[0]).toBeLessThanOrEqual(341_200);
    expect(totalDomain[1]).toBeGreaterThanOrEqual(352_946);
    expect(btcDomain).not.toEqual(totalDomain);
  });

  it('uses a safe fallback value domain for empty chart points', () => {
    expect(getValueDomain([])).toEqual([0, 1]);
  });

  it('adds breathing room around flat chart data', () => {
    expect(getValueDomain([{ label: 'Start', value: 100 }])).toEqual([98, 102]);
  });

  it('rounds compact chart ranges to calm steps', () => {
    expect(
      getValueDomain([
        { label: 'Start', value: 1_000 },
        { label: 'End', value: 1_500 },
      ]),
    ).toEqual([500, 2_000]);
  });

  it('rounds wider chart ranges without binding to the total portfolio scale', () => {
    expect(
      getValueDomain([
        { label: 'Start', value: 10_000 },
        { label: 'End', value: 11_100 },
      ]),
    ).toEqual([9_000, 12_000]);
  });

  it('keeps the value axis to three calm reference ticks', () => {
    expect(getValueTicks([24_000, 28_000])).toEqual([24_000, 26_000, 28_000]);
  });
});
