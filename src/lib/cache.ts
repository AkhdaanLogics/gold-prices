// src/lib/cache.ts

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class ServerCache {
  private cache: Map<string, CacheEntry<any>> = new Map();

  set<T>(key: string, data: T, ttlMs: number = 24 * 60 * 60 * 1000): void {
    const now = Date.now();
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + ttlMs,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Get cache age in milliseconds
  getAge(key: string): number | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    return Date.now() - entry.timestamp;
  }

  // Get time until expiration in milliseconds
  getTimeUntilExpiry(key: string): number | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    const remaining = entry.expiresAt - Date.now();
    return remaining > 0 ? remaining : null;
  }
}

// Global singleton instance
const globalCache = new ServerCache();

export default globalCache;
