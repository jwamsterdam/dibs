import { http, HttpResponse } from 'msw';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { server } from '@/shared/lib/msw/server';
import { renderWithProviders } from '@/shared/test/renderWithProviders';
import { ZonesPage } from './ZonesPage';

describe('ZonesPage (integration via MSW)', () => {
  it('loads and renders the seeded zones', async () => {
    renderWithProviders(<ZonesPage />);
    expect(await screen.findByRole('button', { name: /Main Hall/ })).toBeInTheDocument();
  });

  it('shows an error state when the request fails', async () => {
    server.use(http.get('*/api/zones', () => HttpResponse.json({}, { status: 500 })));
    renderWithProviders(<ZonesPage />);
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not load zones.');
  });

  it('creates a zone and shows it in the list', async () => {
    renderWithProviders(<ZonesPage />);
    await screen.findByRole('button', { name: /Main Hall/ });

    await userEvent.type(screen.getByLabelText('Name'), 'Reception');
    await userEvent.click(screen.getByRole('button', { name: 'Add zone' }));

    expect(await screen.findByRole('button', { name: /Reception/ })).toBeInTheDocument();
  });
});
