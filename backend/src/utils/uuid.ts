import { randomUUID } from 'crypto';

/**
 * Generates a UUID (v4) using Node.js crypto module.
 * Optionally accepts a prefix for domain-specific ID formats.
 *
 * @param prefix Optional prefix for namespacing or debugging (e.g., "user", "station")
 * @returns A UUID string, optionally prefixed (e.g., "station_f47ac10b-58cc-4372-a567-0e02b2c3d479")
 */
export function generateUUID(prefix?: string): string {
  const uuid = randomUUID();
  return prefix ? `${prefix}_${uuid}` : uuid;
}
