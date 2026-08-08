import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/shared/test/renderWithProviders';
import { formatAxisCurrency, getTimelineTicks, PortfolioChart } from './PortfolioChart';

describe('PortfolioChart', () => {
  it('renders an empty chart region without failing', () => {
    renderWithProviders(<PortfolioChart ariaLabel="BTC chart" points={[]} />);

    expect(screen.getByRole('region', { name: 'BTC chart' })).toBeInTheDocument();
  });

  it('formats compact and small currency axis labels', () => {
    expect(formatAxisCurrency(400_000)).toBe('€400K');
    expect(formatAxisCurrency(900)).toBe('€900');
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
});
