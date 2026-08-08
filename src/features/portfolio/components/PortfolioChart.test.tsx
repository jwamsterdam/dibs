import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/shared/test/renderWithProviders';
import { PortfolioChart } from './PortfolioChart';

describe('PortfolioChart', () => {
  it('renders an empty chart region without failing', () => {
    renderWithProviders(<PortfolioChart points={[]} title="BTC" />);

    expect(screen.getByRole('region', { name: 'BTC grafiek' })).toBeInTheDocument();
  });
});
