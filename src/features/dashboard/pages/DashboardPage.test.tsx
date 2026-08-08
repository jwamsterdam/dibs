import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/shared/test/renderWithProviders';
import { DashboardPage } from './DashboardPage';

describe('DashboardPage', () => {
  it('renders the dashboard heading', () => {
    renderWithProviders(<DashboardPage />);
    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
  });
});
