// src/utils/cache.ts
import Redis from 'ioredis';

const redis = new Redis('process.env.REDIS_URL');

/**
 * Cache wrapper: attempts to return cached data or fetch & cache it.
 *
 * @param key Redis cache key
 * @param fetchFn Function to fetch data if not cached
 * @param ttl Time to live in seconds (default: 3600s = 1 hour)
 * @returns Cached or freshly fetched data
 */
export async function getCachedData<T>(key: string, fetchFn: () => Promise<T>, ttl = 3600): Promise<T> {
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);

  const data = await fetchFn();
  await redis.set(key, JSON.stringify(data), 'EX', ttl);
  return data;
}
