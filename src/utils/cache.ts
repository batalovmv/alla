export function isStale(lastFetched: number | undefined, ttlMs: number): boolean {
  if (!lastFetched) return true
  return Date.now() - lastFetched > ttlMs
}


