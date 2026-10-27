export interface CacheEntry<T = any> {
  data: T;
  headers: Record<string, string>;
  statusCode: number;
  expiresAt: number;
}

export class ResponseCache {
  private store: Map<string, CacheEntry> = new Map();

  constructor(private defaultTtlMs: number = 60_000) {}

  get<T>(key: string): CacheEntry<T> | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry as CacheEntry<T>;
  }

  set<T>(
    key: string,
    data: T,
    statusCode: number,
    headers: Record<string, string>,
    ttlMs?: number
  ): void {
    const ttl = ttlMs !== undefined ? ttlMs : this.defaultTtlMs;
    if (ttl <= 0) return;
    this.store.set(key, {
      data,
      statusCode,
      headers,
      expiresAt: Date.now() + ttl,
    });
  }

  clear(): void {
    this.store.clear();
  }
}
