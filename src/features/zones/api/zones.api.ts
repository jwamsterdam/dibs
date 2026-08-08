import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';
import { apiGet, apiPost } from '@/shared/lib/http/client';
import {
  createZoneInputSchema,
  zoneListSchema,
  zoneSchema,
  type CreateZoneInput,
  type Zone,
} from '../validation/zone.schema';

const ZONES_KEY = ['zones'] as const;

/** Thin wrapper over the data seam — mirrors how a generated hook would be configured. */
export function useZonesQuery(): UseQueryResult<Zone[]> {
  return useQuery({
    queryKey: ZONES_KEY,
    queryFn: () => apiGet('/api/zones', zoneListSchema),
  });
}

export function useCreateZoneMutation(): UseMutationResult<Zone, Error, CreateZoneInput> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateZoneInput) =>
      apiPost('/api/zones', createZoneInputSchema.parse(input), zoneSchema),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ZONES_KEY });
    },
  });
}
