import { z } from 'zod';

/**
 * Validation schema for creating a pump. Fields align with the
 * `pumps` table columns defined in the database schema.
 */
export const createPumpSchema = z.object({
  stationId: z.string().uuid(),
  name: z.string().min(2).max(100),
  serialNumber: z.string().min(1).max(100),
  installationDate: z.string(),
  lastMaintenanceDate: z.string().optional(),
  nextMaintenanceDate: z.string().optional(),
  status: z.string().optional()
});

export type CreatePumpInput = z.infer<typeof createPumpSchema>;
