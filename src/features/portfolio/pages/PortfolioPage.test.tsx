import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/shared/test/renderWithProviders';
import { PortfolioPage } from './PortfolioPage';

describe('PortfolioPage', () => {
  it('renders the read-only portfolio without asset chevrons', () => {
    renderWithProviders(<PortfolioPage />);

    expect(screen.getByRole('heading', { name: 'Jan' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Selecteer Totaal' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Selecteer BTC' })).toBeInTheDocument();
    expect(screen.queryByText('›')).not.toBeInTheDocument();
    expect(screen.getByText('ETH staking rewards')).toBeInTheDocument();
  });

  it('switches the chart selection from total to BTC', async () => {
    const user = userEvent.setup();
    renderWithProviders(<PortfolioPage />);

    expect(screen.getByRole('region', { name: 'Totaal grafiek' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Selecteer BTC' }));

    expect(screen.getByRole('region', { name: 'BTC grafiek' })).toBeInTheDocument();
  });

  it('toggles row changes from absolute to percentage', async () => {
    const user = userEvent.setup();
    renderWithProviders(<PortfolioPage />);

    expect(screen.getByRole('button', { name: /Wissel verandering voor Totaal/ })).toHaveTextContent(
      '+€',
    );

    await user.click(screen.getByRole('button', { name: /Wissel verandering voor Totaal/ }));

    expect(screen.getByRole('button', { name: /Wissel verandering voor Totaal/ })).toHaveTextContent(
      '+1,2%',
    );
  });

  it('updates values when a different period is selected', async () => {
    const user = userEvent.setup();
    renderWithProviders(<PortfolioPage />);
    const totalChange = screen.getByRole('button', { name: /Wissel verandering voor Totaal/ });

    expect(totalChange).toHaveTextContent(/\+€\s?4\.218/);

    await user.click(screen.getByRole('button', { name: '1W' }));

    expect(totalChange).toHaveTextContent(/\+€\s?11\.746/);
  });
});
