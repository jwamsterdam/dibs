import { useAtom } from 'jotai';
import type { UseQueryResult } from '@tanstack/react-query';
import { useCreateZoneMutation, useZonesQuery } from '../api/zones.api';
import { selectedZoneIdAtom } from '../store/zones.atoms';
import type { CreateZoneInput, Zone } from '../types/zone';

export interface ZonesController {
  query: UseQueryResult<Zone[]>;
  selectedId: string | null;
  selectZone: (id: string | null) => void;
  createZone: (input: CreateZoneInput) => void;
  isCreating: boolean;
}

/** Orchestrates the zones query, create mutation, and local selection for the page. */
export function useZonesController(): ZonesController {
  const query = useZonesQuery();
  const createMutation = useCreateZoneMutation();
  const [selectedId, selectZone] = useAtom(selectedZoneIdAtom);

  return {
    query,
    selectedId,
    selectZone,
    createZone: (input) => createMutation.mutate(input),
    isCreating: createMutation.isPending,
  };
}
