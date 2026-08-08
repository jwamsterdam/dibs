import { z } from 'zod';

/** A zone as returned by the API. */
export const zoneSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  description: z.string().optional(),
});

export const zoneListSchema = z.array(zoneSchema);

/** Input for creating a zone — shared between the form and the API request. */
export const createZoneInputSchema = z.object({
  name: z.string().min(1, 'Name is required').max(60, 'Name is too long'),
  description: z.string().max(200, 'Description is too long').optional(),
});

export type Zone = z.infer<typeof zoneSchema>;
export type CreateZoneInput = z.infer<typeof createZoneInputSchema>;
