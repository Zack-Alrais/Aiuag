const memoryCache = new Map<string, { data: unknown; expiry: number }>()

export function getCached<T>(key: string, ttlSeconds: number): T | null {
  const entry = memoryCache.get(key)
  if (entry && entry.expiry > Date.now()) return entry.data as T
  if (entry) memoryCache.delete(key)
  return null
}

export function setCache(key: string, data: unknown, ttlSeconds: number): void {
  memoryCache.set(key, { data, expiry: Date.now() + ttlSeconds * 1000 })
}

export function clearCache(pattern?: string): void {
  if (!pattern) { memoryCache.clear(); return }
  for (const key of memoryCache.keys()) {
    if (key.includes(pattern)) memoryCache.delete(key)
  }
}

export const CACHE_TTL = {
  SHORT: 30,
  MEDIUM: 120,
  LONG: 300,
  DAY: 86400,
} as const
