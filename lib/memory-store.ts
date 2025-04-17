import { mem0Client } from "./mem0-client"
import { dbService } from "./db-service"

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

export class MemoryStore {
  private userId: string
  private useLocalFallback = true // Default to local fallback
  private useLocalStructuredFallback = true // Default to local fallback for structured data
  private initialized = false
  private apiEnabled = false

  constructor(userId = "default-user") {
    this.userId = userId
    console.log("MemoryStore initialized with local fallbacks enabled by default")
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      return
    }

    try {
      // In preview environment, always use local fallback
      if (process.env.NODE_ENV !== "production") {
        this.useLocalFallback = true
        this.useLocalStructuredFallback = true
        this.apiEnabled = false
      } else {
        // Check if Mem0 API is available
        this.apiEnabled = mem0Client.isApiAvailable()
        this.useLocalFallback = !this.apiEnabled
        this.useLocalStructuredFallback = !mem0Client.isStructuredEndpointAvailable()
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

  async storeMemory<T>(key: string, data: T): Promise<void> {
    // Ensure initialization
    if (!this.initialized) {
      await this.initialize()
    }

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
  }

  async retrieveMemory<T>(key: string): Promise<T | null> {
    // Ensure initialization
    if (!this.initialized) {
      await this.initialize()
    }

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
  }

  async addMemory(memory: string, metadata: Record<string, any> = {}): Promise<void> {
    // Ensure initialization
    if (!this.initialized) {
      await this.initialize()
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

  async searchMemories(query: string, limit = 5): Promise<MemoryItem[]> {
    // Ensure initialization
    if (!this.initialized) {
      await this.initialize()
    }

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
}

// Create a singleton instance
export const memoryStore = new MemoryStore()
