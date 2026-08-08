import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/shared/test/renderWithProviders';
import { loadNamespace } from '@/shared/i18n';
import { PortfolioPage, toChartPoints } from './PortfolioPage';

describe('PortfolioPage', () => {
  beforeAll(async () => {
    await loadNamespace('portfolio');
  });

  it('renders the read-only portfolio without asset chevrons', () => {
    renderWithProviders(<PortfolioPage />);

    expect(screen.getByRole('heading', { name: 'JW' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Select Totaal' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Select BTC' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Select ETH staking' })).not.toBeInTheDocument();
    expect(screen.queryByText('›')).not.toBeInTheDocument();
    expect(screen.getByText('ETH staking rewards')).toBeInTheDocument();
  });

  it('switches the chart selection from total to BTC', async () => {
    const user = userEvent.setup();
    renderWithProviders(<PortfolioPage />);

    expect(screen.getByRole('region', { name: 'Totaal chart' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Select BTC' }));

    expect(screen.getByRole('region', { name: 'BTC chart' })).toBeInTheDocument();
  });

  it('toggles row changes from absolute to percentage', async () => {
    const user = userEvent.setup();
    renderWithProviders(<PortfolioPage />);

    expect(screen.getByRole('button', { name: /Toggle change for Totaal/ })).toHaveTextContent(
      '+€',
    );

    await user.click(screen.getByRole('button', { name: /Toggle change for Totaal/ }));

    expect(screen.getByRole('button', { name: /Toggle change for Totaal/ })).toHaveTextContent(
      '+1,2%',
    );
  });

  it('updates values when a different period is selected', async () => {
    const user = userEvent.setup();
    renderWithProviders(<PortfolioPage />);
    const totalChange = screen.getByRole('button', { name: /Toggle change for Totaal/ });

    expect(totalChange).toHaveTextContent(/\+€\s?4\.218/);

    await user.click(screen.getByRole('button', { name: '1W' }));

    expect(totalChange).toHaveTextContent(/\+€\s?11\.746/);
  });
  it('maps chart points to the active period labels', () => {
    expect(
      toChartPoints(
        [
          { timestamp: '1W-0', value: 100 },
          { timestamp: '1W-1', value: 120 },
          { timestamp: '1W-2', value: 140 },
        ],
        ['ma', 'di', 'wo'],
      ),
    ).toEqual([
      { label: 'ma', value: 100 },
      { label: 'di', value: 120 },
      { label: 'wo', value: 140 },
    ]);
  });
});
