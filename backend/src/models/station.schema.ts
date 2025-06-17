import { z } from 'zod';

export const createStationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name cannot exceed 100 characters'),
  address: z.string().max(255, 'Address cannot exceed 255 characters').optional(),
  city: z.string().max(100, 'City cannot exceed 100 characters').optional(),
  state: z.string().max(100, 'State cannot exceed 100 characters').optional(),
  zip: z.string().max(20, 'ZIP code cannot exceed 20 characters').optional(),
  contactPhone: z.string().max(30, 'Phone number cannot exceed 30 characters').optional(),
  location: z.object({
    latitude: z.number().optional(),
    longitude: z.number().optional()
  }).optional(),
  operatingHours: z.object({
    open: z.string().optional(),
    close: z.string().optional(),
    is24Hours: z.boolean().optional()
  }).optional()
});

export type CreateStationInput = z.infer<typeof createStationSchema>;
