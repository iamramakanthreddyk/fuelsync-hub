// src/utils/uuid.ts
import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a UUID
 */
export function generateUUID(): string {
  return uuidv4();
}