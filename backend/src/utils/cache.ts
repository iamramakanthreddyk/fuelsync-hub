// src/utils/cache.ts

// Simple in-memory cache implementation.
interface CacheEntry {
  data: unknown;
  expires: number;
}

const cache = new Map<string, CacheEntry>();

/**
 * Cache wrapper: attempts to return cached data or fetch & cache it.
 *
 * @param key Cache key
 * @param fetchFn Function to fetch data if not cached
 * @param ttl Time to live in seconds (default: 3600s = 1 hour)
 * @returns Cached or freshly fetched data
 */
export async function getCachedData<T>(key: string, fetchFn: () => Promise<T>, ttl = 3600): Promise<T> {
  const now = Date.now();
  const entry = cache.get(key);
  if (entry && entry.expires > now) {
    return entry.data as T;
  }

  const data = await fetchFn();
  cache.set(key, { data, expires: now + ttl * 1000 });
  return data;
}
