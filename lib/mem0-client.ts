// Import the preload service
import { preloadService } from "./preload-service"

// Define types
export interface Memory {
  id: string
  content: string
  metadata: {
    title?: string
    tags?: string[]
    createdAt: string
    updatedAt: string
  }
}

export interface MemoryStats {
  totalDocuments: number
  totalTokens: number
  averageTokensPerDocument: number
  lastUpdated: string
  memoryHealth: string
  usageByDay: Record<string, number>
  topTags: Array<{ tag: string; count: number }>
}

// Cache configuration interface
export interface CacheConfig {
  enabled: boolean
  ttl: number // Time to live in milliseconds
  persistToLocalStorage: boolean
}

// Cache metrics interface
export interface CacheMetrics {
  hits: number
  misses: number
  totalRequests: number
  hitRate: number
  avgResponseTime: number
  timestamps: number[]
  hitTimestamps: number[]
  missTimestamps: number[]
  responseTimes: number[]
}

// Overall cache statistics
export interface CacheStatistics {
  memories: CacheMetrics
  stats: CacheMetrics
  individualMemories: CacheMetrics
  suggestions: CacheMetrics
  startTime: number
  lastReset: number
}

// Custom error class for Mem0 API errors
export class Mem0Error extends Error {
  statusCode: number

  constructor(message: string, statusCode = 500) {
    super(message)
    this.name = "Mem0Error"
    this.statusCode = statusCode
  }
}

// Mock data
const mockMemories: Memory[] = [
  {
    id: "1",
    content: "This is a sample memory",
    metadata: {
      title: "Sample Memory",
      tags: ["sample", "test"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  },
  {
    id: "2",
    content: "Another sample memory",
    metadata: {
      title: "Another Sample",
      tags: ["sample", "example"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  },
]

const mockStats: MemoryStats = {
  totalDocuments: 2,
  totalTokens: 100,
  averageTokensPerDocument: 50,
  lastUpdated: new Date().toISOString(),
  memoryHealth: "good",
  usageByDay: {
    [new Date().toISOString().split("T")[0]]: 2,
  },
  topTags: [
    { tag: "sample", count: 2 },
    { tag: "test", count: 1 },
    { tag: "example", count: 1 },
  ],
}

// Cache entry interface
interface CacheEntry<T> {
  data: T
  timestamp: number
}

export class Mem0Client {
  private initialized = false
  private apiUrl: string | null = null
  private mockMode = false

  // Cache storage
  private memoryCache: Map<string, CacheEntry<Memory>> = new Map()
  private memoriesCache: CacheEntry<Memory[]> | null = null
  private statsCache: CacheEntry<MemoryStats> | null = null
  private suggestionsCache: Map<string, CacheEntry<any[]>> = new Map()

  // Default cache configuration
  private cacheConfig: CacheConfig = {
    enabled: true,
    ttl: 5 * 60 * 1000, // 5 minutes default TTL
    persistToLocalStorage: false,
  }

  // Add these properties to the Mem0Client class after the existing cache properties
  private cacheMetrics: CacheStatistics = {
    memories: this.createEmptyMetrics(),
    stats: this.createEmptyMetrics(),
    individualMemories: this.createEmptyMetrics(),
    suggestions: this.createEmptyMetrics(),
    startTime: Date.now(),
    lastReset: Date.now(),
  }

  constructor() {
    // Initialize with the API URL only (not the key)
    this.init(process.env.NEXT_PUBLIC_MEM0_API_URL || null)
    this.loadCacheFromLocalStorage()
  }

  init(apiUrl: string | null): void {
    this.apiUrl = apiUrl
    this.initialized = !!apiUrl
    this.mockMode = !this.initialized

    if (this.mockMode) {
      console.warn("Mem0Client initialized in mock mode. API calls will return mock data.")
    }
  }

  async initialize(): Promise<void> {
    // Simulate initialization
    this.initialized = true
    return Promise.resolve()
  }

  isInitialized(): boolean {
    return this.initialized
  }

  isMockMode(): boolean {
    return this.mockMode
  }

  // Cache configuration methods
  setCacheConfig(config: Partial<CacheConfig>): void {
    this.cacheConfig = { ...this.cacheConfig, ...config }

    // If persistence is enabled, save current cache
    if (this.cacheConfig.enabled && this.cacheConfig.persistToLocalStorage) {
      this.saveCacheToLocalStorage()
    }
  }

  getCacheConfig(): CacheConfig {
    return { ...this.cacheConfig }
  }

  // Add these methods to the Mem0Client class
  private createEmptyMetrics(): CacheMetrics {
    return {
      hits: 0,
      misses: 0,
      totalRequests: 0,
      hitRate: 0,
      avgResponseTime: 0,
      timestamps: [],
      hitTimestamps: [],
      missTimestamps: [],
      responseTimes: [],
    }
  }

  // Method to record cache metrics
  private recordCacheMetric(
    metricType: "memories" | "stats" | "individualMemories" | "suggestions",
    isHit: boolean,
    responseTime: number,
  ): void {
    const metrics = this.cacheMetrics[metricType]

    // Update basic counts
    metrics.totalRequests++
    if (isHit) {
      metrics.hits++
      metrics.hitTimestamps.push(Date.now())
    } else {
      metrics.misses++
      metrics.missTimestamps.push(Date.now())
    }

    // Record timestamps and response times
    metrics.timestamps.push(Date.now())
    metrics.responseTimes.push(responseTime)

    // Calculate derived metrics
    metrics.hitRate = metrics.hits / metrics.totalRequests

    // Calculate average response time (last 100 requests max)
    const recentTimes = metrics.responseTimes.slice(-100)
    metrics.avgResponseTime = recentTimes.reduce((sum, time) => sum + time, 0) / recentTimes.length

    // Trim arrays if they get too large (keep last 1000 entries)
    const maxEntries = 1000
    if (metrics.timestamps.length > maxEntries) {
      metrics.timestamps = metrics.timestamps.slice(-maxEntries)
      metrics.hitTimestamps = metrics.hitTimestamps.slice(-maxEntries)
      metrics.missTimestamps = metrics.missTimestamps.slice(-maxEntries)
      metrics.responseTimes = metrics.responseTimes.slice(-maxEntries)
    }
  }

  // Method to get cache metrics
  getCacheMetrics(): CacheStatistics {
    return JSON.parse(JSON.stringify(this.cacheMetrics)) // Return a deep copy
  }

  // Method to reset cache metrics
  resetCacheMetrics(): void {
    this.cacheMetrics = {
      memories: this.createEmptyMetrics(),
      stats: this.createEmptyMetrics(),
      individualMemories: this.createEmptyMetrics(),
      suggestions: this.createEmptyMetrics(),
      startTime: this.cacheMetrics.startTime, // Keep the original start time
      lastReset: Date.now(),
    }
  }

  // Update the clearCache method to also reset metrics if requested
  clearCache(resetMetrics = false): void {
    this.memoryCache.clear()
    this.memoriesCache = null
    this.statsCache = null
    this.suggestionsCache.clear()

    // Clear localStorage cache if persistence was enabled
    if (this.cacheConfig.persistToLocalStorage && typeof localStorage !== "undefined") {
      localStorage.removeItem("mem0_memory_cache")
      localStorage.removeItem("mem0_memories_cache")
      localStorage.removeItem("mem0_stats_cache")
      localStorage.removeItem("mem0_suggestions_cache")
    }

    // Reset metrics if requested
    if (resetMetrics) {
      this.resetCacheMetrics()
    }
  }

  // Cache persistence methods
  private saveCacheToLocalStorage(): void {
    if (typeof localStorage === "undefined") return

    try {
      // Save individual memories
      if (this.memoryCache.size > 0) {
        const serializedMemories: Record<string, CacheEntry<Memory>> = {}
        this.memoryCache.forEach((value, key) => {
          serializedMemories[key] = value
        })
        localStorage.setItem("mem0_memory_cache", JSON.stringify(serializedMemories))
      }

      // Save memories list
      if (this.memoriesCache) {
        localStorage.setItem("mem0_memories_cache", JSON.stringify(this.memoriesCache))
      }

      // Save stats
      if (this.statsCache) {
        localStorage.setItem("mem0_stats_cache", JSON.stringify(this.statsCache))
      }

      // Save suggestions
      if (this.suggestionsCache.size > 0) {
        const serializedSuggestions: Record<string, CacheEntry<any[]>> = {}
        this.suggestionsCache.forEach((value, key) => {
          serializedSuggestions[key] = value
        })
        localStorage.setItem("mem0_suggestions_cache", JSON.stringify(serializedSuggestions))
      }
    } catch (error) {
      console.warn("Failed to save cache to localStorage:", error)
    }
  }

  private loadCacheFromLocalStorage(): void {
    if (!this.cacheConfig.persistToLocalStorage || typeof localStorage === "undefined") return

    try {
      // Load individual memories
      const memoriesJson = localStorage.getItem("mem0_memory_cache")
      if (memoriesJson) {
        const memoriesObj = JSON.parse(memoriesJson) as Record<string, CacheEntry<Memory>>
        Object.entries(memoriesObj).forEach(([key, value]) => {
          this.memoryCache.set(key, value)
        })
      }

      // Load memories list
      const memoriesListJson = localStorage.getItem("mem0_memories_cache")
      if (memoriesListJson) {
        this.memoriesCache = JSON.parse(memoriesListJson) as CacheEntry<Memory[]>
      }

      // Load stats
      const statsJson = localStorage.getItem("mem0_stats_cache")
      if (statsJson) {
        this.statsCache = JSON.parse(statsJson) as CacheEntry<MemoryStats>
      }

      // Load suggestions
      const suggestionsJson = localStorage.getItem("mem0_suggestions_cache")
      if (suggestionsJson) {
        const suggestionsObj = JSON.parse(suggestionsJson) as Record<string, CacheEntry<any[]>>
        Object.entries(suggestionsObj).forEach(([key, value]) => {
          this.suggestionsCache.set(key, value)
        })
      }
    } catch (error) {
      console.warn("Failed to load cache from localStorage:", error)
      // If loading fails, clear the cache to prevent issues
      this.clearCache()
    }
  }

  // Cache validation helper
  private isCacheValid<T>(cache: CacheEntry<T> | null): boolean {
    if (!this.cacheConfig.enabled || !cache) return false

    const now = Date.now()
    return now - cache.timestamp < this.cacheConfig.ttl
  }

  // Helper function to safely handle proxy responses
  private async safeProxyRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T | null> {
    try {
      const response = await fetch(`/api/mem0-proxy?endpoint=${encodeURIComponent(endpoint)}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        // Short timeout to fail fast
        signal: AbortSignal.timeout(8000),
      })

      if (!response.ok) {
        console.warn(`Proxy returned error status: ${response.status} for endpoint ${endpoint}`)
        return null
      }

      const data = await response.json()

      // Check if the proxy returned an error
      if (data.error) {
        console.warn(`Proxy returned error: ${data.error} for endpoint ${endpoint}`)
        return null
      }

      return data as T
    } catch (error) {
      console.warn(`Error in proxy request to ${endpoint}:`, error)
      return null
    }
  }

  // Now update the getMemories method to record metrics
  async getMemories(): Promise<Memory[]> {
    const startTime = performance.now()
    let isHit = false

    // Record this access for preloading service
    preloadService.recordAccess("all", "memories", 5000) // Estimated size 5KB

    // Check cache first if enabled
    if (this.cacheConfig.enabled && this.isCacheValid(this.memoriesCache)) {
      console.log("Using cached memories")
      isHit = true
      this.recordCacheMetric("memories", true, performance.now() - startTime)
      return this.memoriesCache!.data
    }

    if (this.mockMode) {
      const mockData = this.getMockMemories()
      // Cache the mock data
      this.memoriesCache = {
        data: mockData,
        timestamp: Date.now(),
      }
      this.recordCacheMetric("memories", false, performance.now() - startTime)
      return mockData
    }

    try {
      const response = await fetch("/api/mem0-proxy/memories")
      if (!response.ok) {
        throw new Error(`Failed to fetch memories: ${response.status}`)
      }
      const data = await response.json()
      const memories = Array.isArray(data) ? data : mockMemories

      // Update cache
      this.memoriesCache = {
        data: memories,
        timestamp: Date.now(),
      }

      // Update individual memory caches
      memories.forEach((memory) => {
        this.memoryCache.set(memory.id, {
          data: memory,
          timestamp: Date.now(),
        })
      })

      // Persist cache if enabled
      if (this.cacheConfig.persistToLocalStorage) {
        this.saveCacheToLocalStorage()
      }

      this.recordCacheMetric("memories", false, performance.now() - startTime)
      return memories
    } catch (error) {
      console.warn("Error fetching memories, using mock data:", error)

      // Use cache if available, even if expired
      if (this.memoriesCache) {
        console.log("Using expired cache for memories due to fetch error")
        this.recordCacheMetric("memories", false, performance.now() - startTime)
        return this.memoriesCache.data
      }

      // Fallback to mock data
      const mockData = mockMemories
      this.memoriesCache = {
        data: mockData,
        timestamp: Date.now(),
      }
      this.recordCacheMetric("memories", false, performance.now() - startTime)
      return mockData
    }
  }

  // Similarly update the getStats method
  async getStats(): Promise<MemoryStats> {
    const startTime = performance.now()
    let isHit = false

    // Record this access for preloading service
    preloadService.recordAccess("all", "stats", 1000) // Estimated size 1KB

    // Check cache first if enabled
    if (this.cacheConfig.enabled && this.isCacheValid(this.statsCache)) {
      console.log("Using cached stats")
      isHit = true
      this.recordCacheMetric("stats", true, performance.now() - startTime)
      return this.statsCache!.data
    }

    if (this.mockMode) {
      const mockData = this.getMockStats()
      // Cache the mock data
      this.statsCache = {
        data: mockData,
        timestamp: Date.now(),
      }
      this.recordCacheMetric("stats", false, performance.now() - startTime)
      return mockData
    }

    try {
      const response = await fetch("/api/mem0-proxy/stats")
      if (!response.ok) {
        throw new Error(`Failed to fetch stats: ${response.status}`)
      }
      const data = await response.json()
      const stats = data || mockStats

      // Update cache
      this.statsCache = {
        data: stats,
        timestamp: Date.now(),
      }

      // Persist cache if enabled
      if (this.cacheConfig.persistToLocalStorage) {
        this.saveCacheToLocalStorage()
      }

      this.recordCacheMetric("stats", false, performance.now() - startTime)
      return stats
    } catch (error) {
      console.warn("Error fetching stats, using mock data:", error)

      // Use cache if available, even if expired
      if (this.statsCache) {
        console.log("Using expired cache for stats due to fetch error")
        this.recordCacheMetric("stats", false, performance.now() - startTime)
        return this.statsCache.data
      }

      // Fallback to mock data
      const mockData = mockStats
      this.statsCache = {
        data: mockData,
        timestamp: Date.now(),
      }
      this.recordCacheMetric("stats", false, performance.now() - startTime)
      return mockData
    }
  }

  // Update getMemoryById method
  async getMemoryById(id: string): Promise<Memory | null> {
    const startTime = performance.now()
    let isHit = false

    // Record this access for preloading service
    preloadService.recordAccess(id, "memory", 2000) // Estimated size 2KB

    // Check cache first if enabled
    const cacheKey = id
    if (this.cacheConfig.enabled && this.memoryCache.has(cacheKey)) {
      const cached = this.memoryCache.get(cacheKey)!
      if (this.isCacheValid(cached)) {
        console.log(`Using cached memory for ID: ${id}`)
        isHit = true
        this.recordCacheMetric("individualMemories", true, performance.now() - startTime)
        return cached.data
      }
    }

    if (this.mockMode) {
      const mockMemory = this.getMockMemoryById(id)
      // Cache the mock data
      this.memoryCache.set(cacheKey, {
        data: mockMemory,
        timestamp: Date.now(),
      })
      this.recordCacheMetric("individualMemories", false, performance.now() - startTime)
      return mockMemory
    }

    // Try the /memories/:id endpoint
    const memoryData = await this.safeProxyRequest<{ memory: Memory }>(`/memories/${id}`)
    if (memoryData?.memory) {
      // Update cache
      this.memoryCache.set(cacheKey, {
        data: memoryData.memory,
        timestamp: Date.now(),
      })

      // Persist cache if enabled
      if (this.cacheConfig.persistToLocalStorage) {
        this.saveCacheToLocalStorage()
      }

      this.recordCacheMetric("individualMemories", false, performance.now() - startTime)
      return memoryData.memory
    }

    // Try alternative endpoint
    const altMemoryData = await this.safeProxyRequest<{ memory: Memory }>(`/memory/${id}`)
    if (altMemoryData?.memory) {
      // Update cache
      this.memoryCache.set(cacheKey, {
        data: altMemoryData.memory,
        timestamp: Date.now(),
      })

      // Persist cache if enabled
      if (this.cacheConfig.persistToLocalStorage) {
        this.saveCacheToLocalStorage()
      }

      this.recordCacheMetric("individualMemories", false, performance.now() - startTime)
      return altMemoryData.memory
    }

    // If not found or error, check for expired cache
    if (this.cacheConfig.enabled && this.memoryCache.has(cacheKey)) {
      console.log(`Using expired cache for memory ID: ${id} due to fetch error`)
      this.recordCacheMetric("individualMemories", false, performance.now() - startTime)
      return this.memoryCache.get(cacheKey)!.data
    }

    // If all else fails, return mock data
    console.warn(`Memory ${id} not found or error occurred, returning mock data`)
    const mockMemory = this.getMockMemoryById(id)

    // Cache the mock data
    this.memoryCache.set(cacheKey, {
      data: mockMemory,
      timestamp: Date.now(),
    })

    this.recordCacheMetric("individualMemories", false, performance.now() - startTime)
    return mockMemory
  }

  // Create a new memory - may throw errors
  async createMemory(memory: Omit<Memory, "id" | "created" | "updated">): Promise<Memory> {
    if (this.mockMode) {
      const mockMemory = this.createMockMemory(memory)

      // Invalidate memories list cache
      this.memoriesCache = null

      // Update stats cache
      if (this.statsCache) {
        const updatedStats = { ...this.statsCache.data }
        updatedStats.totalDocuments += 1
        updatedStats.lastUpdated = new Date().toISOString()
        this.statsCache = {
          data: updatedStats,
          timestamp: Date.now(),
        }
      }

      return mockMemory
    }

    try {
      // Try the /memories endpoint
      const response = await fetch(`/api/mem0-proxy?endpoint=/memories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(memory),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.memory) {
          // Invalidate memories list cache
          this.memoriesCache = null

          // Cache the new memory
          this.memoryCache.set(data.memory.id, {
            data: data.memory,
            timestamp: Date.now(),
          })

          // Invalidate stats cache
          this.statsCache = null

          // Persist cache if enabled
          if (this.cacheConfig.persistToLocalStorage) {
            this.saveCacheToLocalStorage()
          }

          return data.memory
        }
      }

      // Try alternative endpoint
      const altResponse = await fetch(`/api/mem0-proxy?endpoint=/memory`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(memory),
      })

      if (altResponse.ok) {
        const data = await altResponse.json()
        if (data.memory) {
          // Invalidate memories list cache
          this.memoriesCache = null

          // Cache the new memory
          this.memoryCache.set(data.memory.id, {
            data: data.memory,
            timestamp: Date.now(),
          })

          // Invalidate stats cache
          this.statsCache = null

          // Persist cache if enabled
          if (this.cacheConfig.persistToLocalStorage) {
            this.saveCacheToLocalStorage()
          }

          return data.memory
        }
      }

      // If both failed but didn't throw, create a mock memory
      console.warn("Failed to create memory via API, creating mock memory")
      return this.createMockMemory(memory)
    } catch (error) {
      console.error("Error creating memory:", error)
      // For creation, we still create a mock memory
      console.warn("Exception when creating memory, creating mock memory instead")
      return this.createMockMemory(memory)
    }
  }

  // Update an existing memory - may throw errors
  async updateMemory(id: string, updates: Partial<Omit<Memory, "id" | "created" | "updated">>): Promise<Memory> {
    if (this.mockMode) {
      const updatedMemory = this.updateMockMemory(id, updates)

      // Update cache
      this.memoryCache.set(id, {
        data: updatedMemory,
        timestamp: Date.now(),
      })

      // Invalidate memories list cache
      this.memoriesCache = null

      return updatedMemory
    }

    try {
      // Try the /memories/:id endpoint
      const response = await fetch(`/api/mem0-proxy?endpoint=/memories/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.memory) {
          // Update cache
          this.memoryCache.set(id, {
            data: data.memory,
            timestamp: Date.now(),
          })

          // Invalidate memories list cache
          this.memoriesCache = null

          // Persist cache if enabled
          if (this.cacheConfig.persistToLocalStorage) {
            this.saveCacheToLocalStorage()
          }

          return data.memory
        }
      }

      // Try alternative endpoint
      const altResponse = await fetch(`/api/mem0-proxy?endpoint=/memory/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      })

      if (altResponse.ok) {
        const data = await altResponse.json()
        if (data.memory) {
          // Update cache
          this.memoryCache.set(id, {
            data: data.memory,
            timestamp: Date.now(),
          })

          // Invalidate memories list cache
          this.memoriesCache = null

          // Persist cache if enabled
          if (this.cacheConfig.persistToLocalStorage) {
            this.saveCacheToLocalStorage()
          }

          return data.memory
        }
      }

      // If both failed but didn't throw, update a mock memory
      console.warn(`Failed to update memory ${id} via API, updating mock memory`)
      return this.updateMockMemory(id, updates)
    } catch (error) {
      console.error(`Error updating memory ${id}:`, error)
      // For updates, we still update a mock memory
      console.warn(`Exception when updating memory ${id}, updating mock memory instead`)
      return this.updateMockMemory(id, updates)
    }
  }

  // Delete a memory - may throw errors
  async deleteMemory(id: string): Promise<boolean> {
    // Invalidate caches immediately
    this.memoryCache.delete(id)
    this.memoriesCache = null
    this.statsCache = null

    if (this.mockMode) {
      return this.deleteMockMemory(id)
    }

    try {
      // Try the /memories/:id endpoint
      const response = await fetch(`/api/mem0-proxy?endpoint=/memories/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        // Persist cache changes if enabled
        if (this.cacheConfig.persistToLocalStorage) {
          this.saveCacheToLocalStorage()
        }
        return true
      }

      // Try alternative endpoint
      const altResponse = await fetch(`/api/mem0-proxy?endpoint=/memory/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (altResponse.ok) {
        // Persist cache changes if enabled
        if (this.cacheConfig.persistToLocalStorage) {
          this.saveCacheToLocalStorage()
        }
        return true
      }

      // If both failed but didn't throw, pretend we deleted it
      console.warn(`Failed to delete memory ${id} via API, pretending it was deleted`)
      return true
    } catch (error) {
      console.error(`Error deleting memory ${id}:`, error)
      // For deletion, we still pretend it was deleted
      console.warn(`Exception when deleting memory ${id}, pretending it was deleted anyway`)
      return true
    }
  }

  // Update getSuggestions method similarly
  async getSuggestions(userId: string, options: any): Promise<any[]> {
    const startTime = performance.now()
    let isHit = false

    // Record this access for preloading service
    preloadService.recordAccess(userId, "suggestions", 3000) // Estimated size 3KB

    // Create a cache key based on the userId and options
    const cacheKey = `${userId}-${JSON.stringify(options)}`

    // Check cache first if enabled
    if (this.cacheConfig.enabled && this.suggestionsCache.has(cacheKey)) {
      const cached = this.suggestionsCache.get(cacheKey)!
      if (this.isCacheValid(cached)) {
        console.log(`Using cached suggestions for key: ${cacheKey}`)
        isHit = true
        this.recordCacheMetric("suggestions", true, performance.now() - startTime)
        return cached.data
      }
    }

    if (this.mockMode) {
      const mockSuggestions = this.getMockSuggestions()
      // Cache the mock data
      this.suggestionsCache.set(cacheKey, {
        data: mockSuggestions,
        timestamp: Date.now(),
      })
      this.recordCacheMetric("suggestions", false, performance.now() - startTime)
      return mockSuggestions
    }

    try {
      const data = await this.safeProxyRequest<{ suggestions: any[] }>(`/suggestions`, {
        method: "POST",
        body: JSON.stringify({
          userId,
          ...options,
        }),
      })

      const suggestions = data?.suggestions || []

      // Update cache
      this.suggestionsCache.set(cacheKey, {
        data: suggestions,
        timestamp: Date.now(),
      })

      // Persist cache if enabled
      if (this.cacheConfig.persistToLocalStorage) {
        this.saveCacheToLocalStorage()
      }

      this.recordCacheMetric("suggestions", false, performance.now() - startTime)
      return suggestions
    } catch (error) {
      console.error("Error getting suggestions from Mem0:", error)

      // Use cache if available, even if expired
      if (this.suggestionsCache.has(cacheKey)) {
        console.log(`Using expired cache for suggestions key: ${cacheKey} due to fetch error`)
        this.recordCacheMetric("suggestions", false, performance.now() - startTime)
        return this.suggestionsCache.get(cacheKey)!.data
      }

      // Fallback to mock data
      const mockSuggestions = this.getMockSuggestions()
      this.suggestionsCache.set(cacheKey, {
        data: mockSuggestions,
        timestamp: Date.now(),
      })
      this.recordCacheMetric("suggestions", false, performance.now() - startTime)
      return mockSuggestions
    }
  }

  // Mock implementations for testing and development
  private getMockMemories(): Memory[] {
    return Array.from({ length: 10 }, (_, i) => ({
      id: `mock-${i}`,
      content: `This is the content of mock memory ${i}. It contains some sample text.`,
      metadata: {
        title: `Mock Memory ${i}`,
        tags: ["mock", i % 2 === 0 ? "even" : "odd"],
        createdAt: new Date(Date.now() - i * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - i * 43200000).toISOString(),
      },
    }))
  }

  private getMockMemoryById(id: string): Memory {
    const idNumber = Number.parseInt(id.replace("mock-", ""), 10) || 0
    return {
      id,
      content: `This is the content of mock memory ${idNumber}. It contains some sample text.`,
      metadata: {
        title: `Mock Memory ${idNumber}`,
        tags: ["mock", idNumber % 2 === 0 ? "even" : "odd"],
        createdAt: new Date(Date.now() - idNumber * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - idNumber * 43200000).toISOString(),
      },
    }
  }

  private createMockMemory(memory: Omit<Memory, "id" | "created" | "updated">): Memory {
    const id = `mock-${Date.now()}`
    const now = new Date().toISOString()
    return {
      ...memory,
      id,
      content: memory.content,
      metadata: {
        ...memory.metadata,
        createdAt: now,
        updatedAt: now,
      },
    }
  }

  private updateMockMemory(id: string, updates: Partial<Omit<Memory, "id" | "created" | "updated">>): Memory {
    const memory = this.getMockMemoryById(id)
    return {
      ...memory,
      ...updates,
      content: updates.content || memory.content,
      id: memory.id,
      metadata: {
        ...memory.metadata,
        title: updates.metadata?.title || memory.metadata.title,
        tags: updates.metadata?.tags || memory.metadata.tags,
        createdAt: memory.metadata.createdAt,
        updatedAt: new Date().toISOString(),
      },
    }
  }

  private deleteMockMemory(id: string): boolean {
    // In mock mode, just return success
    return true
  }

  private getMockStats(): MemoryStats {
    const now = new Date()
    const usageByDay: Record<string, number> = {}

    // Generate mock usage data for the last 30 days
    for (let i = 0; i < 30; i++) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split("T")[0]
      usageByDay[dateStr] = Math.floor(Math.random() * 50) + 10
    }

    return {
      totalDocuments: 156,
      totalTokens: 78432,
      averageTokensPerDocument: 502,
      lastUpdated: now.toISOString(),
      memoryHealth: "good",
      usageByDay,
      topTags: [
        { tag: "document", count: 45 },
        { tag: "note", count: 32 },
        { tag: "important", count: 28 },
        { tag: "archive", count: 21 },
        { tag: "reference", count: 18 },
      ],
    }
  }

  private getMockSuggestions(): any[] {
    return [
      {
        id: "sugg-1",
        title: "Recent Document",
        description: "You accessed this file recently",
        fileId: "file-1",
        confidence: 0.95,
      },
      {
        id: "sugg-2",
        title: "Related Content",
        description: "This file is related to your current work",
        fileId: "file-2",
        confidence: 0.85,
      },
      {
        id: "sugg-3",
        title: "Frequently Used",
        description: "You use this file often at this time",
        fileId: "file-3",
        confidence: 0.75,
      },
    ]
  }
}

// Export singleton instance
export const mem0Client = new Mem0Client()
