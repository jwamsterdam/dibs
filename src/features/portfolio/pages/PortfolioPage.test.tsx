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

    await user.click(screen.getByRole('tab', { name: '1W' }));

    expect(totalChange).toHaveTextContent(/\+€\s?11\.746/);
  });
  it('formats each chart point label from its real timestamp, at the active period granularity', () => {
    expect(
      toChartPoints(
        [
          { timestamp: '2026-01-15T00:00:00.000Z', value: 100 },
          { timestamp: '2026-06-15T00:00:00.000Z', value: 120 },
          { timestamp: '2026-08-10T00:00:00.000Z', value: 140 },
        ],
        'YTD',
      ),
    ).toEqual([
      { label: 'jan', value: 100 },
      { label: 'jun', value: 120 },
      { label: 'aug', value: 140 },
    ]);
  });

  it('disambiguates the two ends of a 1Y axis that would otherwise share a month name', () => {
    const labels = toChartPoints(
      [
        { timestamp: '2025-08-10T00:00:00.000Z', value: 100 },
        { timestamp: '2026-08-10T00:00:00.000Z', value: 140 },
      ],
      '1Y',
    ).map((point) => point.label);

    expect(new Set(labels).size).toBe(2);
  });

  it('picks a finer ALL granularity for a holding bought only weeks ago', () => {
    expect(
      toChartPoints(
        [
          { timestamp: '2026-07-20T00:00:00.000Z', value: 100 },
          { timestamp: '2026-08-10T00:00:00.000Z', value: 140 },
        ],
        'ALL',
      ),
    ).toEqual([
      { label: '20 jul', value: 100 },
      { label: '10 aug', value: 140 },
    ]);
  });

  it('falls back to year-only ALL labels for a multi-year holding', () => {
    expect(
      toChartPoints(
        [
          { timestamp: '2021-08-10T00:00:00.000Z', value: 100 },
          { timestamp: '2026-08-10T00:00:00.000Z', value: 140 },
        ],
        'ALL',
      ),
    ).toEqual([
      { label: '2021', value: 100 },
      { label: '2026', value: 140 },
    ]);
  });
});
