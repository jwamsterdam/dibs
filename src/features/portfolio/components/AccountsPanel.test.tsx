import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/shared/test/renderWithProviders';
import { loadNamespace } from '@/shared/i18n';
import { AccountsPanel } from './AccountsPanel';
import type { AccountsController } from '../hooks/useAccountsController';

let mockController: AccountsController;

jest.mock('../hooks/useAccountsController', () => ({
  useAccountsController: (): AccountsController => mockController,
}));

describe('AccountsPanel', () => {
  beforeAll(async () => {
    await loadNamespace('portfolio');
  });

  beforeEach(() => {
    mockController = {
      activePersonId: 'person-1',
      canDelete: true,
      canSubmit: true,
      cancelEditPerson: jest.fn(),
      deletePerson: jest.fn(),
      editingPersonId: null,
      isSaving: false,
      name: 'Jan',
      people: [
        { id: 'person-1', name: 'JW' },
        { id: 'person-2', name: 'Jan' },
      ],
      saveError: false,
      selectPerson: jest.fn(),
      setName: jest.fn(),
      startEditPerson: jest.fn(),
      submitPerson: jest.fn(),
    };
  });

  it('renders every account and marks the active one', () => {
    renderWithProviders(<AccountsPanel onClose={jest.fn()} />);

    expect(screen.getByRole('heading', { name: 'Accounts' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Switch to JW' })).toHaveAttribute(
      'aria-current',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Switch to Jan' })).not.toHaveAttribute(
      'aria-current',
    );
  });

  it('switches account and closes the panel on tap', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    renderWithProviders(<AccountsPanel onClose={onClose} />);

    await user.click(screen.getByRole('button', { name: 'Switch to Jan' }));

    expect(mockController.selectPerson).toHaveBeenCalledWith('person-2');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('wires the add-account form', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AccountsPanel onClose={jest.fn()} />);

    fireEvent.change(screen.getByRole('textbox', { name: 'Name' }), {
      target: { value: 'Piet' },
    });
    await user.click(screen.getByRole('button', { name: 'Add account' }));

    expect(mockController.setName).toHaveBeenCalledWith('Piet');
    expect(mockController.submitPerson).toHaveBeenCalledTimes(1);
  });

  it('wires the edit action and shows update/cancel controls while editing', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AccountsPanel onClose={jest.fn()} />);

    await user.click(screen.getByRole('button', { name: 'Edit JW' }));
    expect(mockController.startEditPerson).toHaveBeenCalledWith('person-1');

    mockController = { ...mockController, editingPersonId: 'person-1' };
    renderWithProviders(<AccountsPanel onClose={jest.fn()} />);

    await user.click(screen.getByRole('button', { name: 'Update account' }));
    expect(mockController.submitPerson).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(mockController.cancelEditPerson).toHaveBeenCalledTimes(1);
  });

  it('wires removing an account', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AccountsPanel onClose={jest.fn()} />);

    await user.click(screen.getByRole('button', { name: 'Remove Jan' }));

    expect(mockController.deletePerson).toHaveBeenCalledWith('person-2');
  });

  it('hides the remove control once only one account remains', () => {
    mockController = {
      ...mockController,
      canDelete: false,
      people: [{ id: 'person-1', name: 'JW' }],
    };

    renderWithProviders(<AccountsPanel onClose={jest.fn()} />);

    expect(screen.queryByRole('button', { name: /Remove/ })).not.toBeInTheDocument();
  });

  it('disables the submit button until a name is entered', () => {
    mockController = { ...mockController, canSubmit: false };

    renderWithProviders(<AccountsPanel onClose={jest.fn()} />);

    expect(screen.getByRole('button', { name: 'Add account' })).toBeDisabled();
  });

  it('renders saving and save-error states', () => {
    mockController = { ...mockController, isSaving: true, saveError: true };

    renderWithProviders(<AccountsPanel onClose={jest.fn()} />);

    expect(screen.getByText('Saving')).toBeInTheDocument();
    expect(screen.getByText('Failed to save')).toBeInTheDocument();
  });

  it('closes on the header close button', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    renderWithProviders(<AccountsPanel onClose={onClose} />);

    await user.click(screen.getByRole('button', { name: 'Close accounts' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
