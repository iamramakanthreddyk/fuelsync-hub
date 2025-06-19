import { z } from 'zod';

/**
 * Validation schema for creating a nozzle. Only the fields
 * present in the `nozzles` table are validated here.
 */
export const createNozzleSchema = z.object({
  pumpId: z.string().uuid(),
  fuelType: z.enum(['petrol', 'diesel', 'premium', 'super', 'cng', 'lpg']),
  initialReading: z.number(),
  status: z.string().optional()
});

export type CreateNozzleInput = z.infer<typeof createNozzleSchema>;
