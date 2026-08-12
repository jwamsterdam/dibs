import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { Provider as JotaiProvider } from 'jotai';
import type { ReactElement, ReactNode } from 'react';
import { createTestQueryClient } from '@/shared/test/renderWithProviders';
import { useAccountsController } from './useAccountsController';
import { indexedDbPortfolioConfigRepository } from '../data/portfolioConfigRepository';
import type { PortfolioSettingsConfig } from '../types/settings';

jest.mock('../data/portfolioConfigRepository');

const personA = { holdings: [], id: 'person-a', name: 'JW' };
const personB = { holdings: [], id: 'person-b', name: 'Jan' };

const twoAccountConfig: PortfolioSettingsConfig = {
  fiatCurrency: 'eur',
  people: [personA, personB],
};

function wrapper({ children }: { children: ReactNode }): ReactElement {
  return (
    <JotaiProvider>
      <QueryClientProvider client={createTestQueryClient()}>{children}</QueryClientProvider>
    </JotaiProvider>
  );
}

function renderController() {
  return renderHook(() => useAccountsController(), { wrapper });
}

describe('useAccountsController', () => {
  beforeEach(() => {
    jest
      .mocked(indexedDbPortfolioConfigRepository.loadSettings)
      .mockResolvedValue(twoAccountConfig);
    jest.mocked(indexedDbPortfolioConfigRepository.saveSettings).mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('loads the account roster and defaults to the first account as active', async () => {
    const { result } = renderController();

    await waitFor(() =>
      expect(result.current.people).toEqual([
        { id: 'person-a', name: 'JW' },
        { id: 'person-b', name: 'Jan' },
      ]),
    );
    expect(result.current.activePersonId).toBe('person-a');
    expect(result.current.canDelete).toBe(true);
  });

  it('adds a new account and clears the form', async () => {
    const { result } = renderController();
    await waitFor(() => expect(result.current.people).toHaveLength(2));

    act(() => result.current.setName('Piet'));
    expect(result.current.canSubmit).toBe(true);

    act(() => result.current.submitPerson());

    await waitFor(() =>
      expect(indexedDbPortfolioConfigRepository.saveSettings).toHaveBeenCalledWith(
        expect.objectContaining({
          people: expect.arrayContaining([expect.objectContaining({ name: 'Piet', holdings: [] })]),
        }),
      ),
    );
    expect(result.current.name).toBe('');
  });

  it('rejects a blank name', async () => {
    const { result } = renderController();
    await waitFor(() => expect(result.current.people).toHaveLength(2));

    act(() => result.current.setName('   '));

    expect(result.current.canSubmit).toBe(false);

    act(() => result.current.submitPerson());

    expect(indexedDbPortfolioConfigRepository.saveSettings).not.toHaveBeenCalled();
  });

  it('prefills the form and renames an existing account in place', async () => {
    const { result } = renderController();
    await waitFor(() => expect(result.current.people).toHaveLength(2));

    act(() => result.current.startEditPerson('person-b'));
    expect(result.current.name).toBe('Jan');
    expect(result.current.editingPersonId).toBe('person-b');

    act(() => result.current.setName('Janneke'));
    act(() => result.current.submitPerson());

    await waitFor(() =>
      expect(indexedDbPortfolioConfigRepository.saveSettings).toHaveBeenCalledWith(
        expect.objectContaining({
          people: [personA, { ...personB, name: 'Janneke' }],
        }),
      ),
    );
    expect(result.current.editingPersonId).toBeNull();
  });

  it('clears an in-progress edit when cancelled', async () => {
    const { result } = renderController();
    await waitFor(() => expect(result.current.people).toHaveLength(2));

    act(() => result.current.startEditPerson('person-b'));
    await waitFor(() => expect(result.current.editingPersonId).toBe('person-b'));

    act(() => result.current.cancelEditPerson());

    expect(result.current.editingPersonId).toBeNull();
    expect(result.current.name).toBe('');
  });

  it('deletes an account and switches the active selection away from it', async () => {
    const { result } = renderController();
    await waitFor(() => expect(result.current.people).toHaveLength(2));

    act(() => result.current.selectPerson('person-a'));
    await waitFor(() => expect(result.current.activePersonId).toBe('person-a'));

    act(() => result.current.deletePerson('person-a'));

    await waitFor(() =>
      expect(indexedDbPortfolioConfigRepository.saveSettings).toHaveBeenCalledWith(
        expect.objectContaining({ people: [personB] }),
      ),
    );
  });

  it('refuses to delete the last remaining account', async () => {
    jest.mocked(indexedDbPortfolioConfigRepository.loadSettings).mockResolvedValue({
      fiatCurrency: 'eur',
      people: [personA],
    });
    const { result } = renderController();
    await waitFor(() => expect(result.current.people).toHaveLength(1));

    expect(result.current.canDelete).toBe(false);

    act(() => result.current.deletePerson('person-a'));

    expect(indexedDbPortfolioConfigRepository.saveSettings).not.toHaveBeenCalled();
  });

  it('sets the selected account id on select', async () => {
    const { result } = renderController();
    await waitFor(() => expect(result.current.people).toHaveLength(2));

    act(() => result.current.selectPerson('person-b'));

    expect(result.current.activePersonId).toBe('person-b');
  });
});
