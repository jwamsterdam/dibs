import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/shared/test/renderWithProviders';
import { formatAxisCurrency, PortfolioChart } from './PortfolioChart';

describe('PortfolioChart', () => {
  it('renders an empty chart region without failing', () => {
    renderWithProviders(<PortfolioChart ariaLabel="BTC chart" points={[]} />);

    expect(screen.getByRole('region', { name: 'BTC chart' })).toBeInTheDocument();
  });

  it('formats compact and small currency axis labels', () => {
    expect(formatAxisCurrency(400_000)).toBe('€400K');
    expect(formatAxisCurrency(900)).toBe('€900');
  });
});
