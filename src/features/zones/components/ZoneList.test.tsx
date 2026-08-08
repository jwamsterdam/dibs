import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { renderWithProviders } from '@/shared/test/renderWithProviders';
import type { Zone } from '../types/zone';
import { ZoneList } from './ZoneList';

const zones: Zone[] = [
  { id: 'zone-1', name: 'Main Hall', description: 'Ground floor' },
  { id: 'zone-2', name: 'Car Park' },
];

describe('ZoneList', () => {
  it('renders the zones', () => {
    renderWithProviders(<ZoneList zones={zones} selectedId={null} onSelect={() => {}} />);
    expect(screen.getByRole('button', { name: /Main Hall/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Car Park/ })).toBeInTheDocument();
  });

  it('shows an empty state when there are no zones', () => {
    renderWithProviders(<ZoneList zones={[]} selectedId={null} onSelect={() => {}} />);
    expect(screen.getByText('No zones yet.')).toBeInTheDocument();
  });

  it('calls onSelect with the zone id', async () => {
    const onSelect = jest.fn();
    renderWithProviders(<ZoneList zones={zones} selectedId={null} onSelect={onSelect} />);
    await userEvent.click(screen.getByRole('button', { name: /Main Hall/ }));
    expect(onSelect).toHaveBeenCalledWith('zone-1');
  });

  it('marks the selected zone with aria-current', () => {
    renderWithProviders(<ZoneList zones={zones} selectedId="zone-2" onSelect={() => {}} />);
    expect(screen.getByRole('button', { name: /Car Park/ })).toHaveAttribute(
      'aria-current',
      'true',
    );
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithProviders(
      <ZoneList zones={zones} selectedId={null} onSelect={() => {}} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
