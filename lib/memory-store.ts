// Memory store service
import { mem0Client } from "./mem0-client"
import { dbService } from "./db-service"

// Import the performance monitor at the top of the file
import { performanceMonitor } from "./performance-monitor"

// Define types for memory data
export interface MemoryItem {
  id: string
  memory: string
  metadata?: Record<string, any>
  timestamp: number
}

export interface StructuredMemory<T = any> {
  data: T
  timestamp: number
}

// In-memory fallback storage when Mem0 API is unavailable
const fallbackMemoryStorage: Record<string, MemoryItem[]> = {}
const fallbackStructuredStorage: Record<string, Record<string, StructuredMemory>> = {}

// Memory store configuration
interface MemoryStoreConfig {
  storageMode: "local" | "api" | "hybrid"
  apiEndpoint: string
  apiKey: string
  apiVersion: string
  apiTimeout: number
  maxMemorySize: number
  memoryRetention: number
  compressionEnabled: boolean
  encryptionEnabled: boolean
  autoSyncEnabled: boolean
  syncInterval: number
  offlineModeEnabled: boolean
  maxOfflineSize: number
  rateLimitingEnabled: boolean
  maxRequestsPerMinute: number
  retriesEnabled: boolean
  maxRetries: number
  retryDelay: number
}

// Export the MemoryStore class to fix the import error
export class MemoryStore {
  private config: MemoryStoreConfig
  private memories: any[] = []
  private lastSyncTime = 0
  private syncStatus: "synced" | "pending" | "not-synced" = "not-synced"
  private totalApiRequests = 0
  private failedApiRequests = 0
  private lastApiRequestTime = 0
  private usedSpace = 0
  private syncHistory: { timestamp: number; status: string; details: string }[] = []

  private userId: string
  private useLocalFallback = true // Default to local fallback
  private useLocalStructuredFallback = true // Default to local fallback for structured data
  private initialized = false
  private apiEnabled = false

  constructor(userId = "default-user") {
    this.userId = userId
    console.log("MemoryStore initialized with local fallbacks enabled by default")

    // Default configuration
    this.config = {
      storageMode: "local",
      apiEndpoint: "",
      apiKey: "",
      apiVersion: "v1",
      apiTimeout: 30,
      maxMemorySize: 100,
      memoryRetention: 30,
      compressionEnabled: false,
      encryptionEnabled: false,
      autoSyncEnabled: false,
      syncInterval: 60,
      offlineModeEnabled: false,
      maxOfflineSize: 50,
      rateLimitingEnabled: false,
      maxRequestsPerMinute: 60,
      retriesEnabled: true,
      maxRetries: 3,
      retryDelay: 1000,
    }

    // Load configuration from local storage
    this.loadConfig()

    // Initialize mem0 client
    if (this.config.apiEndpoint && this.config.apiKey) {
      mem0Client.setApiKey(this.config.apiKey)
      mem0Client.setApiEndpoint(this.config.apiEndpoint)
    }

    // Load memories
    this.loadMemories()

    // Calculate used space
    this.calculateUsedSpace()

    // Start auto sync if enabled
    if (this.config.autoSyncEnabled) {
      this.startAutoSync()
    }
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      return
    }

    try {
      // In preview environment, always use local fallback
      if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
        this.useLocalFallback = true
        this.useLocalStructuredFallback = true
        this.apiEnabled = false
      } else {
        // Check if Mem0 API is available
        this.apiEnabled = typeof mem0Client.isApiAvailable === "function" ? mem0Client.isApiAvailable() : false

        this.useLocalFallback = !this.apiEnabled

        this.useLocalStructuredFallback = !(typeof mem0Client.isStructuredEndpointAvailable === "function"
          ? mem0Client.isStructuredEndpointAvailable()
          : false)
      }

      // Also initialize database connection
      await dbService.initialize()

      console.log(`Memory system initialized with ${this.apiEnabled ? "Mem0 API" : "local storage"}`)
      console.log(`Using ${this.useLocalStructuredFallback ? "local" : "API"} storage for structured data`)

      this.initialized = true
    } catch (error) {
      console.error("Error initializing memory store:", error)
      this.useLocalFallback = true
      this.useLocalStructuredFallback = true
      this.initialized = true
    }
  }

  // Load configuration from local storage
  private loadConfig() {
    try {
      if (typeof window !== "undefined") {
        const storedConfig = localStorage.getItem("mem0:config")
        if (storedConfig) {
          this.config = { ...this.config, ...JSON.parse(storedConfig) }
        }
      }
    } catch (error) {
      console.error("Error loading memory store configuration:", error)
    }
  }

  // Save configuration to local storage
  public async saveConfig() {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("mem0:config", JSON.stringify(this.config))
      }

      // Update mem0 client configuration
      if (this.config.apiEndpoint && this.config.apiKey) {
        mem0Client.setApiKey(this.config.apiKey)
        mem0Client.setApiEndpoint(this.config.apiEndpoint)
      }

      // Restart auto sync if enabled
      if (this.config.autoSyncEnabled) {
        this.startAutoSync()
      }

      return true
    } catch (error) {
      console.error("Error saving memory store configuration:", error)
      return false
    }
  }

  // Load memories from storage
  private loadMemories() {
    try {
      if (typeof window !== "undefined") {
        if (this.config.storageMode === "local" || this.config.storageMode === "hybrid") {
          // Load from local storage
          const storedMemories = localStorage.getItem("mem0:memories")
          if (storedMemories) {
            this.memories = JSON.parse(storedMemories)
          }
        }
      }

      if (this.config.storageMode === "api" || this.config.storageMode === "hybrid") {
        // Load from API (async)
        this.pullFromApi().catch((error) => {
          console.error("Error loading memories from API:", error)
        })
      }
    } catch (error) {
      console.error("Error loading memories:", error)
    }
  }

  // Save memories to storage
  private saveMemories() {
    try {
      if (typeof window !== "undefined") {
        if (this.config.storageMode === "local" || this.config.storageMode === "hybrid") {
          // Save to local storage
          localStorage.setItem("mem0:memories", JSON.stringify(this.memories))
        }
      }

      if (this.config.storageMode === "api" || this.config.storageMode === "hybrid") {
        // Save to API (async)
        this.pushToApi().catch((error) => {
          console.error("Error saving memories to API:", error)
          this.syncStatus = "not-synced"
        })
      }

      // Calculate used space
      this.calculateUsedSpace()
    } catch (error) {
      console.error("Error saving memories:", error)
    }
  }

  // Calculate used space
  private calculateUsedSpace() {
    try {
      const memoriesString = JSON.stringify(this.memories)
      this.usedSpace = memoriesString.length / 1024 / 1024 // Convert to MB
    } catch (error) {
      console.error("Error calculating used space:", error)
      this.usedSpace = 0
    }
  }

  // Start auto sync
  private startAutoSync() {
    // Clear existing interval
    this.stopAutoSync()

    if (typeof window !== "undefined") {
      // Start new interval
      const intervalId = setInterval(
        () => {
          this.syncWithApi().catch((error) => {
            console.error("Error auto-syncing with API:", error)
          })
        },
        this.config.syncInterval * 60 * 1000,
      ) // Convert minutes to milliseconds

      // Store interval ID in window object
      ;(window as any).mem0AutoSyncInterval = intervalId
    }
  }

  // Stop auto sync
  private stopAutoSync() {
    if (typeof window !== "undefined" && (window as any).mem0AutoSyncInterval) {
      clearInterval((window as any).mem0AutoSyncInterval)
      ;(window as any).mem0AutoSyncInterval = null
    }
  }

  // Update the storeMemory method to track performance
  async storeMemory<T>(key: string, data: T): Promise<void> {
    // Ensure initialization
    if (!this.initialized) {
      await this.initialize()
    }

    // Track the performance of this operation
    return performanceMonitor.trackOperation(
      "storeMemory",
      async () => {
        // Try to use Mem0 API for structured data if available
        if (!this.useLocalStructuredFallback) {
          try {
            await mem0Client.storeMemory(this.userId, key, data)
            return
          } catch (error) {
            console.error("Error storing structured memory in Mem0 API, falling back to local storage:", error)
            this.useLocalStructuredFallback = true
          }
        }

        // Use local fallback storage
        if (!fallbackStructuredStorage[this.userId]) {
          fallbackStructuredStorage[this.userId] = {}
        }

        fallbackStructuredStorage[this.userId][key] = {
          data,
          timestamp: Date.now(),
        }
      },
      { key, storageType: this.useLocalStructuredFallback ? "local" : "api" },
    )
  }

  // Update the retrieveMemory method to track performance
  async retrieveMemory<T>(key: string): Promise<T | null> {
    // Ensure initialization
    if (!this.initialized) {
      await this.initialize()
    }

    // Track the performance of this operation
    return performanceMonitor.trackOperation(
      "retrieveMemory",
      async () => {
        // Try to use Mem0 API for structured data if available
        if (!this.useLocalStructuredFallback) {
          try {
            return await mem0Client.retrieveMemory<T>(this.userId, key)
          } catch (error) {
            console.error("Error retrieving structured memory from Mem0 API, falling back to local storage:", error)
            this.useLocalStructuredFallback = true
          }
        }

        // Use local fallback storage
        const memory = fallbackStructuredStorage[this.userId]?.[key]
        return memory ? (memory.data as T) : null
      },
      { key, storageType: this.useLocalStructuredFallback ? "local" : "api" },
    )
  }

  // Update the addMemory method to track performance
  async addMemory(memory: string, metadata: Record<string, any> = {}): Promise<void> {
    // Ensure initialization
    if (!this.initialized) {
      await this.initialize()
    }

    // Track the performance of this operation
    return performanceMonitor.trackOperation(
      "addMemory",
      async () => {
        // If this memory is related to a file, add the file_id to the metadata
        if (metadata.fileId) {
          memory = `file_id:${metadata.fileId} ${memory}`
        }

        // Store in database regardless of Mem0 API availability
        try {
          // Make sure metadata is an object
          const safeMetadata = metadata || {}
          await dbService.storeMemory(this.userId, memory, safeMetadata)
        } catch (error) {
          console.error("Error storing memory in database, falling back to local storage:", error)
          // Continue with local storage even if database fails
          this.storeMemoryLocally(memory, metadata)
        }

        // Try to store in Mem0 API if available
        if (!this.useLocalFallback) {
          try {
            await mem0Client.add([{ role: "system", content: memory }], this.userId)
          } catch (error) {
            console.error("Error adding memory to Mem0 API, falling back to local storage:", error)
            this.useLocalFallback = true
            // Continue with local storage
            this.storeMemoryLocally(memory, metadata)
          }
        } else {
          // Already using local fallback
          this.storeMemoryLocally(memory, metadata)
        }
      },
      { memoryLength: memory.length, ...metadata },
    )
  }

  // Helper method to store memory locally
  private storeMemoryLocally(memory: string, metadata: Record<string, any> = {}): void {
    if (!fallbackMemoryStorage[this.userId]) {
      fallbackMemoryStorage[this.userId] = []
    }

    fallbackMemoryStorage[this.userId].push({
      id: `local-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      memory,
      metadata: metadata || {}, // Ensure metadata is an object
      timestamp: Date.now(),
    })
  }

  // Update the searchMemories method to track performance
  async searchMemories(query: string, limit = 5): Promise<MemoryItem[]> {
    // Ensure initialization
    if (!this.initialized) {
      await this.initialize()
    }

    // Track the performance of this operation
    return performanceMonitor.trackOperation(
      "searchMemories",
      async () => {
        if (!this.useLocalFallback) {
          try {
            const response = await mem0Client.search(query, this.userId, limit)
            return response.results
          } catch (error) {
            console.error("Error searching memories from Mem0 API, falling back to local storage:", error)
            this.useLocalFallback = true
          }
        }

        // Try to search in database
        try {
          const dbResults = await dbService.searchMemories(this.userId, query, limit)
          if (dbResults.length > 0) {
            return dbResults.map((item) => ({
              id: item.id,
              memory: item.content,
              metadata: item.metadata || {}, // Ensure metadata is an object
              timestamp: new Date(item.created_at).getTime(),
            }))
          }
        } catch (error) {
          console.error("Error searching memories in database:", error)
        }

        // Use local fallback storage with simple search
        const memories = fallbackMemoryStorage[this.userId] || []

        // Simple search implementation
        return memories
          .filter((item) => item.memory.toLowerCase().includes(query.toLowerCase()))
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, limit)
      },
      { query, limit },
    )
  }

  // Add the clearMemory method
  async clearMemory(): Promise<void> {
    // Ensure initialization
    if (!this.initialized) {
      await this.initialize()
    }

    // Clear from database
    try {
      await dbService.clearMemories(this.userId)
    } catch (error) {
      console.error("Error clearing memories from database:", error)
    }

    if (!this.useLocalFallback) {
      try {
        await mem0Client.clearMemory(this.userId)
      } catch (error) {
        console.error("Error clearing memory from Mem0 API:", error)
      }
    }

    // Clear local fallback storage
    fallbackMemoryStorage[this.userId] = []
    fallbackStructuredStorage[this.userId] = {}
  }

  // Add memory
  public addMemory(memory: any) {
    // Add timestamp
    memory.timestamp = Date.now()

    // Add to memories
    this.memories.push(memory)

    // Save memories
    this.saveMemories()

    return memory
  }

  // Get memory by ID
  public getMemory(id: string) {
    return this.memories.find((memory) => memory.id === id)
  }

  // Get all memories
  public getAllMemories() {
    return this.memories
  }

  // Update memory
  public updateMemory(id: string, memory: any) {
    const index = this.memories.findIndex((m) => m.id === id)
    if (index !== -1) {
      // Update timestamp
      memory.timestamp = Date.now()

      // Update memory
      this.memories[index] = memory

      // Save memories
      this.saveMemories()

      return memory
    }
    return null
  }

  // Delete memory
  public deleteMemory(id: string) {
    const index = this.memories.findIndex((m) => m.id === id)
    if (index !== -1) {
      // Remove memory
      this.memories.splice(index, 1)

      // Save memories
      this.saveMemories()

      return true
    }
    return false
  }

  // Clear all memories
  public clearAllMemories() {
    this.memories = []
    this.saveMemories()
    return true
  }

  // Search memories
  public searchMemories(query: string) {
    // Simple search implementation
    return this.memories.filter((memory) => {
      return JSON.stringify(memory).toLowerCase().includes(query.toLowerCase())
    })
  }

  // Export memories
  public async exportMemories() {
    const data = JSON.stringify(this.memories, null, 2)
    const blob = new Blob([data], { type: "application/json" })
    return URL.createObjectURL(blob)
  }

  // Import memories
  public importMemories(data: any[]) {
    this.memories = data
    this.saveMemories()
    return true
  }

  // Sync with API
  public async syncWithApi() {
    if (!this.config.apiEndpoint || !this.config.apiKey) {
      throw new Error("API endpoint and API key are required for syncing")
    }

    try {
      this.syncStatus = "pending"

      // Record API request
      this.totalApiRequests++
      this.lastApiRequestTime = Date.now()

      // Get memories from API
      const apiMemories = await mem0Client.getMemories()

      // Merge memories
      const mergedMemories = this.mergeMemories(this.memories, apiMemories)

      // Update memories
      this.memories = mergedMemories

      // Save memories to API
      await mem0Client.saveMemories(this.memories)

      // Save memories to local storage
      if (
        typeof window !== "undefined" &&
        (this.config.storageMode === "local" || this.config.storageMode === "hybrid")
      ) {
        localStorage.setItem("mem0:memories", JSON.stringify(this.memories))
      }

      // Update sync status
      this.syncStatus = "synced"
      this.lastSyncTime = Date.now()

      // Add to sync history
      this.syncHistory.unshift({
        timestamp: Date.now(),
        status: "success",
        details: `Synced ${this.memories.length} memories`,
      })

      // Limit sync history to 10 entries
      if (this.syncHistory.length > 10) {
        this.syncHistory = this.syncHistory.slice(0, 10)
      }

      // Calculate used space
      this.calculateUsedSpace()

      return true
    } catch (error) {
      console.error("Error syncing with API:", error)

      // Record failed API request
      this.failedApiRequests++

      // Update sync status
      this.syncStatus = "not-synced"

      // Add to sync history
      this.syncHistory.unshift({
        timestamp: Date.now(),
        status: "error",
        details: `Sync failed: ${error instanceof Error ? error.message : String(error)}`,
      })

      throw error
    }
  }

  // Pull from API
  public async pullFromApi() {
    if (!this.config.apiEndpoint || !this.config.apiKey) {
      throw new Error("API endpoint and API key are required for pulling from API")
    }

    try {
      // Record API request
      this.totalApiRequests++
      this.lastApiRequestTime = Date.now()

      // Get memories from API
      const apiMemories = await mem0Client.getMemories()

      // Update memories
      this.memories = apiMemories

      // Save memories to local storage
      if (
        typeof window !== "undefined" &&
        (this.config.storageMode === "local" || this.config.storageMode === "hybrid")
      ) {
        localStorage.setItem("mem0:memories", JSON.stringify(this.memories))
      }

      // Update sync status
      this.syncStatus = "synced"
      this.lastSyncTime = Date.now()

      // Calculate used space
      this.calculateUsedSpace()

      return true
    } catch (error) {
      console.error("Error pulling from API:", error)

      // Record failed API request
      this.failedApiRequests++

      throw error
    }
  }

  // Push to API
  public async pushToApi() {
    if (!this.config.apiEndpoint || !this.config.apiKey) {
      throw new Error("API endpoint and API key are required for pushing to API")
    }

    try {
      // Record API request
      this.totalApiRequests++
      this.lastApiRequestTime = Date.now()

      // Save memories to API
      await mem0Client.saveMemories(this.memories)

      // Update sync status
      this.syncStatus = "synced"
      this.lastSyncTime = Date.now()

      return true
    } catch (error) {
      console.error("Error pushing to API:", error)

      // Record failed API request
      this.failedApiRequests++

      // Update sync status
      this.syncStatus = "not-synced"

      throw error
    }
  }

  // Resolve sync conflicts
  public async resolveSyncConflicts() {
    if (!this.config.apiEndpoint || !this.config.apiKey) {
      throw new Error("API endpoint and API key are required for resolving sync conflicts")
    }

    try {
      // Record API request
      this.totalApiRequests++
      this.lastApiRequestTime = Date.now()

      // Get memories from API
      const apiMemories = await mem0Client.getMemories()

      // Merge memories
      const mergedMemories = this.mergeMemories(this.memories, apiMemories)

      // Update memories
      this.memories = mergedMemories

      // Save memories to API
      await mem0Client.saveMemories(this.memories)

      // Save memories to local storage
      if (
        typeof window !== "undefined" &&
        (this.config.storageMode === "local" || this.config.storageMode === "hybrid")
      ) {
        localStorage.setItem("mem0:memories", JSON.stringify(this.memories))
      }

      // Update sync status
      this.syncStatus = "synced"
      this.lastSyncTime = Date.now()

      // Calculate used space
      this.calculateUsedSpace()

      return true
    } catch (error) {
      console.error("Error resolving sync conflicts:", error)

      // Record failed API request
      this.failedApiRequests++

      throw error
    }
  }

  // Merge memories
  private mergeMemories(localMemories: any[], apiMemories: any[]) {
    // Create a map of memories by ID
    const memoriesMap = new Map<string, any>()

    // Add local memories to map
    localMemories.forEach((memory) => {
      memoriesMap.set(memory.id, memory)
    })

    // Add API memories to map, preferring the newer version
    apiMemories.forEach((memory) => {
      const existingMemory = memoriesMap.get(memory.id)
      if (!existingMemory || memory.timestamp > existingMemory.timestamp) {
        memoriesMap.set(memory.id, memory)
      }
    })

    // Convert map back to array
    return Array.from(memoriesMap.values())
  }

  // Test API connection
  public async testApiConnection(endpoint?: string, apiKey?: string) {
    const testEndpoint = endpoint || this.config.apiEndpoint
    const testApiKey = apiKey || this.config.apiKey

    if (!testEndpoint || !testApiKey) {
      return false
    }

    try {
      // Record API request
      this.totalApiRequests++
      this.lastApiRequestTime = Date.now()

      // Test connection
      const result = await mem0Client.testConnection(testEndpoint, testApiKey)
      return result
    } catch (error) {
      console.error("Error testing API connection:", error)

      // Record failed API request
      this.failedApiRequests++

      return false
    }
  }

  // Get sync history
  public async getSyncHistory() {
    return this.syncHistory
  }

  // Add a method to get the current storage mode
  getStorageMode(): "api" | "database" | "local" {
    if (!this.useLocalFallback) return "api"
    return "local"
  }

  // Add methods for file tags
  async rememberTag(fileId: string, tag: string): Promise<void> {
    // Get existing tags
    const tags = await this.getFileTags(fileId)

    // Add the new tag if it doesn't exist
    if (!tags.includes(tag)) {
      tags.push(tag)
    }

    // Store the updated tags
    await this.storeMemory(`file-tags-${fileId}`, tags)

    // Also update in database if possible
    try {
      const file = await dbService.getFileById(fileId)
      if (file) {
        await dbService.updateFile(fileId, {
          tags: [...new Set([...(file.tags || []), tag])],
        })
      }
    } catch (error) {
      console.error("Error updating file tags in database:", error)
    }
  }

  async getFileTags(fileId: string): Promise<string[]> {
    // Try to get from database first
    try {
      const file = await dbService.getFileById(fileId)
      if (file && file.tags && file.tags.length > 0) {
        return file.tags
      }
    } catch (error) {
      console.error("Error getting file tags from database:", error)
    }

    // Fall back to memory store
    const tags = await this.retrieveMemory<string[]>(`file-tags-${fileId}`)
    return tags || []
  }

  async toggleFavorite(fileId: string): Promise<boolean> {
    // Get existing favorites
    const favorites = (await this.retrieveMemory<string[]>("favorites")) || []

    // Toggle the favorite status
    const isFavorite = favorites.includes(fileId)

    // Also update in database if possible
    try {
      await dbService.updateFile(fileId, { favorite: !isFavorite })
    } catch (error) {
      console.error("Error updating favorite status in database:", error)
    }

    if (isFavorite) {
      // Remove from favorites
      const updatedFavorites = favorites.filter((id) => id !== fileId)
      await this.storeMemory("favorites", updatedFavorites)
      return false
    } else {
      // Add to favorites
      const updatedFavorites = [...favorites, fileId]
      await this.storeMemory("favorites", updatedFavorites)
      return true
    }
  }

  // Add a new method to track file interactions
  async trackFileInteraction(fileId: string, action: string, details = ""): Promise<void> {
    const file = await dbService.getFileById(fileId)
    if (!file) return

    const memory = `Performed ${action} on file:${file.name} path:${file.path} file_id:${fileId}${details ? ` - ${details}` : ""}`
    await this.addMemory(memory, { fileId })
  }

  // Add a method to get file recommendations based on user behavior
  async getFileRecommendations(limit = 5): Promise<string[]> {
    // Ensure initialization
    if (!this.initialized) {
      await this.initialize()
    }

    try {
      // Get recent file interactions
      const interactions = await this.searchMemories("file_id:", 50)

      // Count file interactions
      const fileInteractions: Record<string, number> = {}
      interactions.forEach((interaction) => {
        const match = interaction.memory.match(/file_id:([a-zA-Z0-9-_]+)/)
        if (match && match[1]) {
          const fileId = match[1]
          fileInteractions[fileId] = (fileInteractions[fileId] || 0) + 1
        }
      })

      // Sort by interaction count
      const sortedFileIds = Object.entries(fileInteractions)
        .sort(([, countA], [, countB]) => countB - countA)
        .map(([fileId]) => fileId)
        .slice(0, limit)

      return sortedFileIds
    } catch (error) {
      console.error("Error getting file recommendations:", error)
      return []
    }
  }

  // Get storage mode
  public getStorageMode() {
    return this.config.storageMode
  }

  // Set storage mode
  public setStorageMode(mode: "local" | "api" | "hybrid") {
    this.config.storageMode = mode
  }

  // Get API endpoint
  public getApiEndpoint() {
    return this.config.apiEndpoint
  }

  // Set API endpoint
  public setApiEndpoint(endpoint: string) {
    this.config.apiEndpoint = endpoint
  }

  // Get API key
  public getApiKey() {
    return this.config.apiKey
  }

  // Set API key
  public setApiKey(key: string) {
    this.config.apiKey = key
  }

  // Get API version
  public getApiVersion() {
    return this.config.apiVersion
  }

  // Set API version
  public setApiVersion(version: string) {
    this.config.apiVersion = version
  }

  // Get API timeout
  public getApiTimeout() {
    return this.config.apiTimeout
  }

  // Set API timeout
  public setApiTimeout(timeout: number) {
    this.config.apiTimeout = timeout
  }

  // Get max memory size
  public getMaxMemorySize() {
    return this.config.maxMemorySize
  }

  // Set max memory size
  public setMaxMemorySize(size: number) {
    this.config.maxMemorySize = size
  }

  // Get memory retention
  public getMemoryRetention() {
    return this.config.memoryRetention
  }

  // Set memory retention
  public setMemoryRetention(days: number) {
    this.config.memoryRetention = days
  }

  // Is compression enabled
  public isCompressionEnabled() {
    return this.config.compressionEnabled
  }

  // Set compression enabled
  public setCompressionEnabled(enabled: boolean) {
    this.config.compressionEnabled = enabled
  }

  // Is encryption enabled
  public isEncryptionEnabled() {
    return this.config.encryptionEnabled
  }

  // Set encryption enabled
  public setEncryptionEnabled(enabled: boolean) {
    this.config.encryptionEnabled = enabled
  }

  // Is auto sync enabled
  public isAutoSyncEnabled() {
    return this.config.autoSyncEnabled
  }

  // Set auto sync enabled
  public setAutoSyncEnabled(enabled: boolean) {
    this.config.autoSyncEnabled = enabled
    if (enabled) {
      this.startAutoSync()
    } else {
      this.stopAutoSync()
    }
  }

  // Get sync interval
  public getSyncInterval() {
    return this.config.syncInterval
  }

  // Set sync interval
  public setSyncInterval(minutes: number) {
    this.config.syncInterval = minutes
    if (this.config.autoSyncEnabled) {
      this.startAutoSync()
    }
  }

  // Is offline mode enabled
  public isOfflineModeEnabled() {
    return this.config.offlineModeEnabled
  }

  // Set offline mode enabled
  public setOfflineModeEnabled(enabled: boolean) {
    this.config.offlineModeEnabled = enabled
  }

  // Get max offline size
  public getMaxOfflineSize() {
    return this.config.maxOfflineSize
  }

  // Set max offline size
  public setMaxOfflineSize(size: number) {
    this.config.maxOfflineSize = size
  }

  // Is rate limiting enabled
  public isRateLimitingEnabled() {
    return this.config.rateLimitingEnabled
  }

  // Set rate limiting enabled
  public setRateLimitingEnabled(enabled: boolean) {
    this.config.rateLimitingEnabled = enabled
  }

  // Get max requests per minute
  public getMaxRequestsPerMinute() {
    return this.config.maxRequestsPerMinute
  }

  // Set max requests per minute
  public setMaxRequestsPerMinute(requests: number) {
    this.config.maxRequestsPerMinute = requests
  }

  // Is retries enabled
  public isRetriesEnabled() {
    return this.config.retriesEnabled
  }

  // Set retries enabled
  public setRetriesEnabled(enabled: boolean) {
    this.config.retriesEnabled = enabled
  }

  // Get max retries
  public getMaxRetries() {
    return this.config.maxRetries
  }

  // Set max retries
  public setMaxRetries(retries: number) {
    this.config.maxRetries = retries
  }

  // Get retry delay
  public getRetryDelay() {
    return this.config.retryDelay
  }

  // Set retry delay
  public setRetryDelay(delay: number) {
    this.config.retryDelay = delay
  }

  // Get last sync time
  public getLastSyncTime() {
    return this.lastSyncTime
  }

  // Get sync status
  public getSyncStatus() {
    return this.syncStatus
  }

  // Get total API requests
  public getTotalApiRequests() {
    return this.totalApiRequests
  }

  // Get failed API requests
  public getFailedApiRequests() {
    return this.failedApiRequests
  }

  // Get last API request time
  public getLastApiRequestTime() {
    return this.lastApiRequestTime
  }

  // Get used space
  public getUsedSpace() {
    return this.usedSpace
  }

  // Get memory count
  public getMemoryCount() {
    return this.memories.length
  }

  // Sync with API
  public async syncWithApi() {
    if (!this.config.apiEndpoint || !this.config.apiKey) {
      throw new Error("API endpoint and API key are required for syncing")
    }

    try {
      this.syncStatus = "pending"

      // Record API request
      this.totalApiRequests++
      this.lastApiRequestTime = Date.now()

      // Get memories from API
      const apiMemories = await mem0Client.getMemories()

      // Merge memories
      const mergedMemories = this.mergeMemories(this.memories, apiMemories)

      // Update memories
      this.memories = mergedMemories

      // Save memories to API
      await mem0Client.saveMemories(this.memories)

      // Save memories to local storage
      if (
        typeof window !== "undefined" &&
        (this.config.storageMode === "local" || this.config.storageMode === "hybrid")
      ) {
        localStorage.setItem("mem0:memories", JSON.stringify(this.memories))
      }

      // Update sync status
      this.syncStatus = "synced"
      this.lastSyncTime = Date.now()

      // Add to sync history
      this.syncHistory.unshift({
        timestamp: Date.now(),
        status: "success",
        details: `Synced ${this.memories.length} memories`,
      })

      // Limit sync history to 10 entries
      if (this.syncHistory.length > 10) {
        this.syncHistory = this.syncHistory.slice(0, 10)
      }

      // Calculate used space
      this.calculateUsedSpace()

      return true
    } catch (error) {
      console.error("Error syncing with API:", error)

      // Record failed API request
      this.failedApiRequests++

      // Update sync status
      this.syncStatus = "not-synced"

      // Add to sync history
      this.syncHistory.unshift({
        timestamp: Date.now(),
        status: "error",
        details: `Sync failed: ${error instanceof Error ? error.message : String(error)}`,
      })

      throw error
    }
  }

  // Pull from API
  public async pullFromApi() {
    if (!this.config.apiEndpoint || !this.config.apiKey) {
      throw new Error("API endpoint and API key are required for pulling from API")
    }

    try {
      // Record API request
      this.totalApiRequests++
      this.lastApiRequestTime = Date.now()

      // Get memories from API
      const apiMemories = await mem0Client.getMemories()

      // Update memories
      this.memories = apiMemories

      // Save memories to local storage
      if (
        typeof window !== "undefined" &&
        (this.config.storageMode === "local" || this.config.storageMode === "hybrid")
      ) {
        localStorage.setItem("mem0:memories", JSON.stringify(this.memories))
      }

      // Update sync status
      this.syncStatus = "synced"
      this.lastSyncTime = Date.now()

      // Calculate used space
      this.calculateUsedSpace()

      return true
    } catch (error) {
      console.error("Error pulling from API:", error)

      // Record failed API request
      this.failedApiRequests++

      throw error
    }
  }

  // Push to API
  public async pushToApi() {
    if (!this.config.apiEndpoint || !this.config.apiKey) {
      throw new Error("API endpoint and API key are required for pushing to API")
    }

    try {
      // Record API request
      this.totalApiRequests++
      this.lastApiRequestTime = Date.now()

      // Save memories to API
      await mem0Client.saveMemories(this.memories)

      // Update sync status
      this.syncStatus = "synced"
      this.lastSyncTime = Date.now()

      return true
    } catch (error) {
      console.error("Error pushing to API:", error)

      // Record failed API request
      this.failedApiRequests++

      // Update sync status
      this.syncStatus = "not-synced"

      throw error
    }
  }

  // Resolve sync conflicts
  public async resolveSyncConflicts() {
    if (!this.config.apiEndpoint || !this.config.apiKey) {
      throw new Error("API endpoint and API key are required for resolving sync conflicts")
    }

    try {
      // Record API request
      this.totalApiRequests++
      this.lastApiRequestTime = Date.now()

      // Get memories from API
      const apiMemories = await mem0Client.getMemories()

      // Merge memories
      const mergedMemories = this.mergeMemories(this.memories, apiMemories)

      // Update memories
      this.memories = mergedMemories

      // Save memories to API
      await mem0Client.saveMemories(this.memories)

      // Save memories to local storage
      if (
        typeof window !== "undefined" &&
        (this.config.storageMode === "local" || this.config.storageMode === "hybrid")
      ) {
        localStorage.setItem("mem0:memories", JSON.stringify(this.memories))
      }

      // Update sync status
      this.syncStatus = "synced"
      this.lastSyncTime = Date.now()

      // Calculate used space
      this.calculateUsedSpace()

      return true
    } catch (error) {
      console.error("Error resolving sync conflicts:", error)

      // Record failed API request
      this.failedApiRequests++

      throw error
    }
  }

  // Merge memories
  private mergeMemories(localMemories: any[], apiMemories: any[]) {
    // Create a map of memories by ID
    const memoriesMap = new Map<string, any>()

    // Add local memories to map
    localMemories.forEach((memory) => {
      memoriesMap.set(memory.id, memory)
    })

    // Add API memories to map, preferring the newer version
    apiMemories.forEach((memory) => {
      const existingMemory = memoriesMap.get(memory.id)
      if (!existingMemory || memory.timestamp > existingMemory.timestamp) {
        memoriesMap.set(memory.id, memory)
      }
    })

    // Convert map back to array
    return Array.from(memoriesMap.values())
  }

  // Test API connection
  public async testApiConnection(endpoint?: string, apiKey?: string) {
    const testEndpoint = endpoint || this.config.apiEndpoint
    const testApiKey = apiKey || this.config.apiKey

    if (!testEndpoint || !testApiKey) {
      return false
    }

    try {
      // Record API request
      this.totalApiRequests++
      this.lastApiRequestTime = Date.now()

      // Test connection
      const result = await mem0Client.testConnection(testEndpoint, testApiKey)
      return result
    } catch (error) {
      console.error("Error testing API connection:", error)

      // Record failed API request
      this.failedApiRequests++

      return false
    }
  }

  // Get sync history
  public async getSyncHistory() {
    return this.syncHistory
  }
}

// Create a singleton instance
export const memoryStore = new MemoryStore()
