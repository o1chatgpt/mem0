"use server"

import { kv } from "@vercel/kv"

type CacheOptions = {
  ttl?: number // Time to live in seconds
  namespace?: string
}

const DEFAULT_TTL = 60 * 5 // 5 minutes default cache time
const DEFAULT_NAMESPACE = "file-manager"

/**
 * A simple caching utility that supports both in-memory and Redis caching
 */
class CacheService {
  private memoryCache: Map<string, { value: any; expiry: number }> = new Map()
  private useRedis: boolean

  constructor() {
    // Check if Redis is configured
    this.useRedis =
      process.env.REDIS_URL !== undefined ||
      (process.env.KV_URL !== undefined && process.env.KV_REST_API_TOKEN !== undefined)
  }

  /**
   * Generate a cache key with optional namespace
   */
  private getCacheKey(key: string, namespace?: string): string {
    const ns = namespace || DEFAULT_NAMESPACE
    return `${ns}:${key}`
  }

  /**
   * Get a value from cache
   */
  async get<T>(key: string, options?: CacheOptions): Promise<T | null> {
    const cacheKey = this.getCacheKey(key, options?.namespace)

    if (this.useRedis) {
      try {
        const value = await kv.get<T>(cacheKey)
        return value
      } catch (error) {
        console.error("Redis cache error:", error)
        // Fall back to memory cache if Redis fails
      }
    }

    // Use memory cache
    const cached = this.memoryCache.get(cacheKey)
    if (cached && cached.expiry > Date.now()) {
      return cached.value as T
    }

    // Remove expired item
    if (cached) {
      this.memoryCache.delete(cacheKey)
    }

    return null
  }

  /**
   * Set a value in cache
   */
  async set(key: string, value: any, options?: CacheOptions): Promise<void> {
    const ttl = options?.ttl || DEFAULT_TTL
    const cacheKey = this.getCacheKey(key, options?.namespace)

    if (this.useRedis) {
      try {
        await kv.set(cacheKey, value, { ex: ttl })
        return
      } catch (error) {
        console.error("Redis cache error:", error)
        // Fall back to memory cache if Redis fails
      }
    }

    // Use memory cache
    this.memoryCache.set(cacheKey, {
      value,
      expiry: Date.now() + ttl * 1000,
    })
  }

  /**
   * Delete a value from cache
   */
  async delete(key: string, options?: CacheOptions): Promise<void> {
    const cacheKey = this.getCacheKey(key, options?.namespace)

    if (this.useRedis) {
      try {
        await kv.del(cacheKey)
      } catch (error) {
        console.error("Redis cache error:", error)
      }
    }

    this.memoryCache.delete(cacheKey)
  }

  /**
   * Clear all cache entries with a specific namespace
   */
  async clearNamespace(namespace: string): Promise<void> {
    if (this.useRedis) {
      try {
        // Get all keys with the namespace
        const keys = await kv.keys(`${namespace}:*`)
        if (keys.length > 0) {
          await kv.del(...keys)
        }
      } catch (error) {
        console.error("Redis cache error:", error)
      }
    }

    // Clear memory cache for the namespace
    for (const key of this.memoryCache.keys()) {
      if (key.startsWith(`${namespace}:`)) {
        this.memoryCache.delete(key)
      }
    }
  }
}

// Export a singleton instance
export const cacheService = new CacheService()
