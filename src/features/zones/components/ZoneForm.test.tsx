import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { renderWithProviders } from '@/shared/test/renderWithProviders';
import { ZoneForm } from './ZoneForm';

describe('ZoneForm', () => {
  it('submits valid input', async () => {
    const onSubmit = jest.fn();
    renderWithProviders(<ZoneForm onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText('Name'), 'Lobby');
    await userEvent.click(screen.getByRole('button', { name: 'Add zone' }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ name: 'Lobby' })),
    );
  });

  it('shows a validation error and does not submit when the name is empty', async () => {
    const onSubmit = jest.fn();
    renderWithProviders(<ZoneForm onSubmit={onSubmit} />);

    await userEvent.click(screen.getByRole('button', { name: 'Add zone' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Name is required');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithProviders(<ZoneForm onSubmit={() => {}} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
