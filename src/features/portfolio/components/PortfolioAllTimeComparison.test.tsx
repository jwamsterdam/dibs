import { render, screen } from '@testing-library/react';
import { PortfolioAllTimeComparison } from './PortfolioAllTimeComparison';

const formatValue = (value: number): string => `€${value}`;

describe('PortfolioAllTimeComparison', () => {
  it('renders both bars with their labels, formatted values, and meter semantics', () => {
    render(
      <PortfolioAllTimeComparison
        ariaLabel="Totaal chart"
        currentLabel="Huidig"
        currentValue={352_946}
        formatValue={formatValue}
        purchaseLabel="Aankoop"
        purchaseValue={124_000}
      />,
    );

    expect(screen.getByRole('region', { name: 'Totaal chart' })).toBeInTheDocument();
    expect(screen.getByText('Aankoop')).toBeInTheDocument();
    expect(screen.getByText('€124000')).toBeInTheDocument();
    expect(screen.getByText('Huidig')).toBeInTheDocument();
    expect(screen.getByText('€352946')).toBeInTheDocument();
    expect(screen.getByRole('meter', { name: 'Aankoop' })).toHaveAttribute(
      'aria-valuenow',
      '124000',
    );
    expect(screen.getByRole('meter', { name: 'Huidig' })).toHaveAttribute(
      'aria-valuenow',
      '352946',
    );
  });

  it('marks the current bar a gain when it rose above the purchase value', () => {
    render(
      <PortfolioAllTimeComparison
        ariaLabel="Totaal chart"
        currentLabel="Huidig"
        currentValue={200}
        formatValue={formatValue}
        purchaseLabel="Aankoop"
        purchaseValue={100}
      />,
    );

    expect(screen.getByRole('meter', { name: 'Huidig' })).toHaveAttribute('data-tone', 'gain');
  });

  it('marks the current bar a loss when it dropped below the purchase value', () => {
    render(
      <PortfolioAllTimeComparison
        ariaLabel="Totaal chart"
        currentLabel="Huidig"
        currentValue={80}
        formatValue={formatValue}
        purchaseLabel="Aankoop"
        purchaseValue={100}
      />,
    );

    expect(screen.getByRole('meter', { name: 'Huidig' })).toHaveAttribute('data-tone', 'loss');
  });

  it('does not blow up when both values are zero', () => {
    render(
      <PortfolioAllTimeComparison
        ariaLabel="Totaal chart"
        currentLabel="Huidig"
        currentValue={0}
        formatValue={formatValue}
        purchaseLabel="Aankoop"
        purchaseValue={0}
      />,
    );

    expect(screen.getByRole('region', { name: 'Totaal chart' })).toBeInTheDocument();
  });
});
