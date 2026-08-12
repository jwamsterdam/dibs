import { useState } from 'react';
import { useAtom } from 'jotai';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { indexedDbPortfolioConfigRepository } from '../data/portfolioConfigRepository';
import { selectedPersonIdAtom } from '../store/portfolio.atoms';
import { portfolioSettingsConfigSchema } from '../validation/settings.schema';
import type { PortfolioPersonConfig, PortfolioSettingsConfig } from '../types/settings';

const defaultConfig: PortfolioSettingsConfig = {
  fiatCurrency: 'eur',
  people: [],
};

export type PortfolioAccountSummary = {
  readonly id: string;
  readonly name: string;
};

export type AccountsController = {
  readonly people: readonly PortfolioAccountSummary[];
  readonly activePersonId: string | null;
  readonly name: string;
  readonly editingPersonId: string | null;
  readonly canSubmit: boolean;
  readonly canDelete: boolean;
  readonly isSaving: boolean;
  readonly saveError: boolean;
  readonly setName: (name: string) => void;
  readonly submitPerson: () => void;
  readonly startEditPerson: (personId: string) => void;
  readonly cancelEditPerson: () => void;
  readonly deletePerson: (personId: string) => void;
  readonly selectPerson: (personId: string) => void;
};

export function useAccountsController(): AccountsController {
  const queryClient = useQueryClient();
  const [draftConfig, setDraftConfig] = useState<PortfolioSettingsConfig | null>(null);
  const [name, setName] = useState('');
  const [editingPersonId, setEditingPersonId] = useState<string | null>(null);
  const [selectedPersonId, setSelectedPersonId] = useAtom(selectedPersonIdAtom);

  const settingsQuery = useQuery({
    queryFn: () => indexedDbPortfolioConfigRepository.loadSettings(),
    queryKey: ['portfolio-settings'],
    staleTime: 5_000,
  });
  const config = draftConfig ?? settingsQuery.data ?? defaultConfig;
  const activePersonId = selectedPersonId ?? config.people[0]?.id ?? null;

  const saveMutation = useMutation({
    mutationFn: (nextConfig: PortfolioSettingsConfig) =>
      indexedDbPortfolioConfigRepository.saveSettings(nextConfig),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['portfolio-settings'] });
    },
  });

  function persistConfig(nextConfig: PortfolioSettingsConfig): void {
    const parsedConfig = portfolioSettingsConfigSchema.parse(nextConfig);
    setDraftConfig(parsedConfig);
    saveMutation.mutate(parsedConfig);
  }

  const trimmedName = name.trim();

  return {
    people: config.people.map((person) => ({ id: person.id, name: person.name })),
    activePersonId,
    name,
    editingPersonId,
    canSubmit: trimmedName.length > 0,
    canDelete: config.people.length > 1,
    isSaving: saveMutation.isPending,
    saveError: saveMutation.isError,
    setName,
    submitPerson: (): void => {
      if (trimmedName.length === 0) {
        return;
      }

      if (editingPersonId === null) {
        const newPerson: PortfolioPersonConfig = {
          id: globalThis.crypto.randomUUID(),
          name: trimmedName,
          holdings: [],
        };
        persistConfig({ ...config, people: [...config.people, newPerson] });
      } else {
        const nextPeople = config.people.map((person) =>
          person.id === editingPersonId ? { ...person, name: trimmedName } : person,
        );
        persistConfig({ ...config, people: nextPeople });
      }

      setName('');
      setEditingPersonId(null);
    },
    startEditPerson: (personId): void => {
      const person = config.people.find((item) => item.id === personId);
      if (person === undefined) {
        return;
      }
      setEditingPersonId(personId);
      setName(person.name);
    },
    cancelEditPerson: (): void => {
      setEditingPersonId(null);
      setName('');
    },
    deletePerson: (personId): void => {
      if (config.people.length <= 1) {
        return;
      }
      if (personId === editingPersonId) {
        setEditingPersonId(null);
        setName('');
      }
      if (personId === selectedPersonId) {
        setSelectedPersonId(null);
      }
      persistConfig({
        ...config,
        people: config.people.filter((person) => person.id !== personId),
      });
    },
    selectPerson: (personId): void => {
      setSelectedPersonId(personId);
    },
  };
}
